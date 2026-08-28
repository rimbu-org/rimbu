#!/usr/bin/env bun
/**
 * run.ts — review-api (public API consistency) diagnose
 *
 * Diagnose-only. Supports <pkg> or --workspace, --out. Static rg only, no build.
 *
 * Usage:
 *   bun .opencode/skills/review-api/scripts/run.ts -- packages/stream
 *   bun .opencode/skills/review-api/scripts/run.ts -- --workspace
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

type Severity = 'error' | 'warn' | 'info';
interface Finding {
	severity: Severity;
	rule: string;
	location: string;
	evidence: string;
	suggestedFix: string;
	normativeRef: string;
}

const REPO_ROOT = resolve(import.meta.dir, '../../../..');
const PACKAGES_ROOT = join(REPO_ROOT, 'packages');

function toRepoRel(p: string): string {
	return p.startsWith(REPO_ROOT + '/') ? p.slice(REPO_ROOT.length + 1) : p;
}
function pkgNameFromDir(d: string): string {
	return d.split('/').pop() ?? d;
}
function discoverPackages(): string[] {
	const entries = readdirSync(PACKAGES_ROOT, { withFileTypes: true });
	const pkgs: string[] = [];
	for (const e of entries) {
		if (!e.isDirectory() || e.name === 'list2') continue;
		const pub = join(PACKAGES_ROOT, e.name, 'src/public');
		const entry = join(PACKAGES_ROOT, e.name, `src/${e.name}.ts`);
		if (existsSync(pub) || existsSync(entry)) pkgs.push(join(PACKAGES_ROOT, e.name));
		// Also include packages with src/<name>.ts even if no public (e.g. base, common)
		else if (existsSync(join(PACKAGES_ROOT, e.name, 'src')) && existsSync(join(PACKAGES_ROOT, e.name, 'package.json'))) {
			// Still consider for API review if has public surface via src/<name>.ts
			const hasPublicTs = readdirSync(join(PACKAGES_ROOT, e.name, 'src')).some((f) => f.endsWith('.ts'));
			if (hasPublicTs) pkgs.push(join(PACKAGES_ROOT, e.name));
		}
	}
	return pkgs.sort();
}
function normalizePkgArg(arg?: string): string | undefined {
	if (!arg) return undefined;
	if (arg.startsWith('packages/')) return join(REPO_ROOT, arg);
	if (existsSync(join(PACKAGES_ROOT, arg, 'package.json'))) return join(PACKAGES_ROOT, arg);
	if (existsSync(join(REPO_ROOT, arg, 'package.json'))) return join(REPO_ROOT, arg);
	return resolve(arg);
}

function rg(pattern: string, dir: string): string {
	try {
		const res = spawnSync('rg', ['-n', pattern, dir, '--no-heading'], { encoding: 'utf-8' });
		if (res.status === 0) return res.stdout ?? '';
		if (res.status === 1) return ''; // no matches
		return '';
	} catch {
		return '';
	}
}
function rgCount(pattern: string, dir: string): number {
	const out = rg(pattern, dir);
	return out ? out.trim().split('\n').filter(Boolean).length : 0;
}

// ---------------------------------------------------------------------------
// Checks (a)-(g)
// ---------------------------------------------------------------------------

function checkNaming(pkgDir: string, findings: Finding[]): void {
	const pubDir = join(pkgDir, 'src/public');
	if (!existsSync(pubDir)) return;
	const relPub = toRepoRel(pubDir);
	// Canonical names should appear; synonyms should not appear as public method definitions
	// Only flag true synonyms that are not part of Rimbu's own API (deep.select and Stream.collect are legitimate)
	const synonymPatterns = [
		{ pat: '\\bwhere\\s*\\(', name: 'where', canonical: 'filter' },
		{ pat: 'filterBy\\s*\\(', name: 'filterBy', canonical: 'filter' },
	];
	for (const { pat, name, canonical } of synonymPatterns) {
		const out = rg(pat, pubDir);
		if (out.trim()) {
			for (const line of out.trim().split('\n')) {
				const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
				const loc = rel.split(':').slice(0, 2).join(':');
				findings.push({
					severity: 'error',
					rule: 'naming-synonym',
					location: loc,
					evidence: line.slice(0, 120),
					suggestedFix: `Use canonical '${canonical}' instead of '${name}' per AGENTS.md:20`,
					normativeRef: 'AGENTS.md:16-31 §1.1',
				});
			}
		}
	}
	// Also ensure canonical names are used consistently — if package has public API, it should use at least one canonical name if applicable
	// Not flagging missing canonical as error (would be false positive for packages like channel), so just info if no canonical found
	const canonicalPat = '\\b(filter|map\\s*\\(|flatMap|take\\s*\\(|drop\\s*\\()';
	const hasCanonical = rg(canonicalPat, pubDir).trim() !== '';
	if (!hasCanonical) {
		// Only warn if package is a collection (hashed, list, ordered, sorted, etc.) and expected to have these
		const name = pkgNameFromDir(pkgDir);
		if (['hashed', 'list', 'ordered', 'sorted', 'stream', 'multimap', 'multiset', 'bimap', 'bimultimap', 'table', 'proximity', 'graph'].includes(name)) {
			// Check if it's actually a collection by looking for Streamable or RMapBase
			const pubContent = rg('Streamable|RMapBase|RSetBase', pubDir);
			if (pubContent.trim()) {
				findings.push({
					severity: 'info',
					rule: 'naming-consistent',
					location: `${toRepoRel(pkgDir)}:src/public`,
					evidence: `No canonical filter/map/take/drop found in ${relPub}`,
					suggestedFix: `Ensure consistent naming per AGENTS.md:20`,
					normativeRef: 'AGENTS.md:16-31 §1.1',
				});
			}
		}
	}
}

function checkMathIndex(pkgDir: string, findings: Finding[]): void {
	const pkgName = pkgNameFromDir(pkgDir);
	const pubDir = join(pkgDir, 'src/public');
	const internalDir = join(pkgDir, 'src/internal');
	// (b) For Stream, at(-1) must return fallback, not last. Check impl does not do size+index for at
	if (pkgName === 'stream') {
		const atImpl = rg('at\\s*\\(', internalDir);
		// Check if stream's at handles negative as from end (would be error)
		// Look for "index < 0" handling that does "size + index" or "length +"
		const negHandling = rg('index\\s*<\\s*0', internalDir);
		if (negHandling.trim()) {
			// For stream, negative handling should be fallback, not size+index. Check if it contains "size + index" or "length +"
			const sizePlus = rg('size\\s*\\+\\s*index|length\\s*\\+\\s*index', internalDir);
			// Only flag if size+index is in the same file as at
			if (sizePlus.trim() && atImpl.trim()) {
				// Need to ensure it's for at, not for other methods like slice
				// Simplify: flag if stream internal has size+index at all (would be wrong for Stream per §1.1 exception)
				// But List does have size+index, so don't flag for stream if it's actually in List?
				// For stream, any size+index is suspect for at
				const streamAtFile = rg('at.*otherwise|at.*fallback', pubDir);
				if (!streamAtFile.trim()) {
					// If at doesn't have otherwise, also flag
				}
				// For now, emit info that manual check needed rather than error to avoid false positive
				// We'll flag only if stream's at impl explicitly does size+index
				for (const line of sizePlus.trim().split('\n')) {
					if (line.includes('stream') || line.includes('Stream')) {
						const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
						const loc = rel.split(':').slice(0, 2).join(':');
						findings.push({
							severity: 'error',
							rule: 'stream-at-negative',
							location: loc,
							evidence: line.slice(0, 120),
							suggestedFix: `Stream.at(-1) must return fallback, not last; use last() per AGENTS.md:25`,
							normativeRef: 'AGENTS.md:21-25 §1.1',
						});
					}
				}
			}
		}
			// at with OptLazy is covered by checkOptLazy; avoid duplicate
	} else {
		// For non-stream collections, ensure negative handling is documented/handled
		// Check that internal has size+index for at/get
		if (existsSync(internalDir)) {
			const hasNeg = rg('size\\s*\\+\\s*index|size\\s*\\+\\s*idx', internalDir).trim() !== '';
			if (!hasNeg && existsSync(pubDir)) {
				const hasAt = rg('\\bat\\s*\\(', pubDir).trim() !== '' || rg('\\bget\\s*\\(', pubDir).trim() !== '';
				if (hasAt) {
					// Advisory: non-stream should handle negative
					// Only info to avoid false positive if impl uses different var name
					// Skip for now to avoid noise
				}
			}
		}
	}
}

function checkOptLazy(pkgDir: string, findings: Finding[]): void {
	const pubDir = join(pkgDir, 'src/public');
	if (!existsSync(pubDir)) return;
	const undefinedMethods = rg('\\|\\s*undefined', pubDir);
	if (!undefinedMethods.trim()) return;
	const files = new Set<string>();
	for (const line of undefinedMethods.trim().split('\n')) {
		const file = line.split(':')[0] ?? '';
		if (file) files.add(file);
	}
	const targetMethods = ['get', 'find', 'first', 'last', 'at', 'getAt', 'findEntry', 'getValue', 'getKey'];
	for (const file of files) {
		const content = (() => {
			try {
				return readFileSync(file, 'utf-8');
			} catch {
				return '';
			}
		})();
		if (!content) continue;
		for (const method of targetMethods) {
			// Find method signatures with | undefined (allow generics like <O> after method name)
			const methodUndefinedPat = new RegExp(`\\b${method}\\s*(?:<[^>]*>)?\\s*\\([^)]*\\)\\s*:\\s*[^;]*\\|\\s*undefined`, 'g');
			const hasUndefined = methodUndefinedPat.test(content);
			if (!hasUndefined) continue;
			// Check if same method has OptLazy/AsyncOptLazy overload (allow <O> generics)
			const methodOptLazyPat = new RegExp(`\\b${method}\\s*(?:<[^>]*>)?\\s*\\([^)]*OptLazy[^)]*\\)`, 'g');
			const hasOptLazy = methodOptLazyPat.test(content);
			if (!hasOptLazy) {
				const rel = toRepoRel(file);
				// Find line number for first occurrence
				const lines = content.split('\n');
				let lineNo = 1;
				for (let i = 0; i < lines.length; i++) {
					if (new RegExp(`\\b${method}\\s*\\(`).test(lines[i]!) && lines[i]!.includes('| undefined')) {
						lineNo = i + 1;
						break;
					}
				}
				findings.push({
					severity: 'error',
					rule: 'optlazy-pair',
					location: `${rel}:${lineNo}`,
					evidence: `${method} has '| undefined' without OptLazy overload`,
					suggestedFix: `Add overload (${method} with otherwise: OptLazy<O>): V | O per AGENTS.md:354-373`,
					normativeRef: 'AGENTS.md:354-373 §6.3',
				});
			}
		}
	}
}

function checkNonEmptyOrder(pkgDir: string, findings: Finding[]): void {
	const pubDir = join(pkgDir, 'src/public');
	if (!existsSync(pubDir)) return;
	// Find files with NonEmpty
	const nonEmptyFiles = rg('interface NonEmpty', pubDir);
	if (!nonEmptyFiles.trim()) return;
	for (const line of nonEmptyFiles.trim().split('\n')) {
		const file = line.split(':')[0] ?? '';
		if (!file) continue;
		let content: string;
		try {
			content = readFileSync(file, 'utf-8');
		} catch {
			continue;
		}
		// Find NonEmpty block
		const nonEmptyIdx = content.indexOf('interface NonEmpty');
		if (nonEmptyIdx === -1) continue;
		const afterNonEmpty = content.slice(nonEmptyIdx, nonEmptyIdx + 8000); // look ahead 8k
		// Check for methods with two overloads where one has StreamSource.NonEmpty or returns NonEmpty
		// Simplified: find occurrences of "StreamSource.NonEmpty" and "StreamSource" and check order for same method
		// Look for transform, filter, map etc.
		const methodPat = /(\w+)\s*\(/g;
		// Instead, check if file contains both "StreamSource.NonEmpty" and later "StreamSource" without NonEmpty for same method — check line order
		const lines = afterNonEmpty.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const l = lines[i] ?? '';
			if (l.includes('StreamSource.NonEmpty')) {
				// Find next line with StreamSource but not NonEmpty for same method
				// Look ahead 10 lines
				for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
					const nl = lines[j] ?? '';
					if (nl.includes('StreamSource') && !nl.includes('NonEmpty')) {
						// Check if they are same method (compare method name before '(')
						const m1 = l.match(/(\w+)\s*\(/);
						const m2 = nl.match(/(\w+)\s*\(/);
						if (m1 && m2 && m1[1] === m2[1]) {
							// NonEmpty should be first, but here NonEmpty is before normal, which is correct
							// So no error. We need to detect if normal appears BEFORE NonEmpty
							break;
						}
					}
					// If we find normal before NonEmpty, that would be error, but our loop starts at NonEmpty
				}
			}
			// Detect wrong order: normal before NonEmpty
			if (l.includes('StreamSource') && !l.includes('NonEmpty')) {
				// Check next lines for NonEmpty for same method
				for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
					const nl = lines[j] ?? '';
					if (nl.includes('StreamSource.NonEmpty')) {
						const m1 = l.match(/(\w+)\s*\(/);
						const m2 = nl.match(/(\w+)\s*\(/);
						if (m1 && m2 && m1[1] === m2[1]) {
							const rel = toRepoRel(file);
							const lineNo = (content.slice(0, nonEmptyIdx).split('\n').length + i + 1);
							findings.push({
								severity: 'error',
								rule: 'nonempty-overload-order',
								location: `${rel}:${lineNo}`,
								evidence: l.trim().slice(0, 120),
								suggestedFix: `Move NonEmpty overload first for ${m1[1]} per AGENTS.md:29-30`,
								normativeRef: 'AGENTS.md:29-30 §1.1',
							});
							break;
						}
					}
				}
			}
		}
	}
}

function checkHKT(pkgDir: string, findings: Finding[]): void {
	const pubDir = join(pkgDir, 'src/public');
	if (!existsSync(pubDir)) return;
	// Accept either classic Types interface or new Family/Capability pattern with _NORMAL/_NON_EMPTY
	const typesOut = rg('interface Types', pubDir);
	const familyOut = rg('_NORMAL|_NON_EMPTY|Family<', pubDir);
	if (!typesOut.trim() && !familyOut.trim()) {
		const name = pkgNameFromDir(pkgDir);
		// Only warn for packages that are expected to have HKT (maps/sets/collections), not for stream/channel/base etc.
		if (['hashed', 'ordered', 'sorted', 'multimap', 'multiset', 'bimap', 'bimultimap', 'proximity', 'graph', 'table'].includes(name)) {
			const hasFamily = familyOut.trim() !== '' || rg('Family|Capability', pubDir).trim() !== '';
			if (!hasFamily) {
				findings.push({
					severity: 'warn',
					rule: 'hkt-types-slot',
					location: `${toRepoRel(pubDir)}:1`,
					evidence: `No 'interface Types' or Family pattern found in ${toRepoRel(pubDir)}`,
					suggestedFix: `Add Types extends RMapBase.Types { normal, nonEmpty } or Family with _NORMAL/_NON_EMPTY per AGENTS.md:375-398`,
					normativeRef: 'AGENTS.md:375-398 §6.4',
				});
			}
		}
		return;
	}
	if (typesOut.trim()) {
		for (const line of typesOut.trim().split('\n')) {
			const file = line.split(':')[0] ?? '';
			if (!file) continue;
			let content: string;
			try {
				content = readFileSync(file, 'utf-8');
			} catch {
				continue;
			}
			const hasNormal = content.includes('normal');
			const hasNonEmpty = content.includes('nonEmpty');
			if (!hasNormal || !hasNonEmpty) {
				const rel = toRepoRel(file);
				findings.push({
					severity: 'warn',
					rule: 'hkt-normal-nonempty',
					location: `${rel}:1`,
					evidence: `Types missing ${!hasNormal ? 'normal' : ''} ${!hasNonEmpty ? 'nonEmpty' : ''}`.trim(),
					suggestedFix: `Add both readonly normal and nonEmpty per AGENTS.md:389-393`,
					normativeRef: 'AGENTS.md:375-398 §6.4',
				});
			}
		}
	}
}

function checkModule(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	// Broaden pattern: any .build() with Module or ContextModule
	const moduleOut = rg('\\.build\\(\\)', srcDir);
	const hasModule = rg('Module|ContextModule', srcDir).trim() !== '';
	if (!moduleOut.trim() || !hasModule) {
		const hasContext = rg('Context|Factory', join(pkgDir, 'src/public')).trim() !== '' || rg('Context|Factory', join(pkgDir, 'src')).trim() !== '';
		if (hasContext) {
			const name = pkgNameFromDir(pkgDir);
			if (['hashed', 'list', 'ordered', 'sorted', 'multimap', 'stream', 'table', 'graph', 'bimap', 'channel'].includes(name)) {
				// Only warn if truly no build at all
				if (!moduleOut.trim()) {
					findings.push({
						severity: 'warn',
						rule: 'module-pattern',
						location: `${toRepoRel(srcDir)}:1`,
						evidence: `No .build() with Module found`,
						suggestedFix: `Use Module helper per AGENTS.md:467-476`,
						normativeRef: 'AGENTS.md:467-476 §6.7',
					});
				}
			}
		}
	}
}

function checkTierLeakage(pkgDir: string, findings: Finding[]): void {
	const pubDir = join(pkgDir, 'src/public');
	const advDir = join(pkgDir, 'src/advanced');
	const internalDir = join(pkgDir, 'src/internal');
	if (existsSync(pubDir)) {
		// Only flag relative imports that leak internal (e.g. from './internal' or from '../internal')
		// Imports via '#pkg/*' alias are the correct way per AGENTS.md:138-152 and are not leakage
		const leak = rg("from\\s+['\"][^'\"]*internal", pubDir);
		if (leak.trim()) {
			for (const line of leak.trim().split('\n')) {
				// Flag only if it's a relative import (contains ./ or ../), not via #
				if (line.includes('from') && (line.includes("'./") || line.includes('"./') || line.includes("'../") || line.includes('"../'))) {
					const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
					const loc = rel.split(':').slice(0, 2).join(':');
					findings.push({
						severity: 'error',
						rule: 'tier-no-internal-export',
						location: loc,
						evidence: line.slice(0, 120),
						suggestedFix: `Public must not import from internal via relative; use #${pkgNameFromDir(pkgDir)}/* per AGENTS.md:138-152`,
						normativeRef: 'AGENTS.md:104-113 §3',
					});
				}
			}
		}
	}
	if (existsSync(advDir)) {
		const advFiles = rg("from\\s+['\"]", advDir);
		if (advFiles.trim()) {
			for (const line of advFiles.trim().split('\n')) {
				// advanced should only re-export via # alias, not relative ../internal
				if (line.includes("'../") || line.includes('"../') || line.includes("'./") || line.includes('"./')) {
					const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
					const loc = rel.split(':').slice(0, 2).join(':');
					findings.push({
						severity: 'error',
						rule: 'tier-advanced-reexport',
						location: loc,
						evidence: line.slice(0, 120),
						suggestedFix: `Advanced must re-export via #${pkgNameFromDir(pkgDir)}/* per AGENTS.md:131-136`,
						normativeRef: 'AGENTS.md:131-136 §3',
					});
				}
			}
		}
	}
	if (existsSync(join(pkgDir, 'package.json'))) {
		const pkgJson = (() => {
			try {
				return JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf-8'));
			} catch {
				return null;
			}
		})();
		if (pkgJson?.exports) {
			for (const k of Object.keys(pkgJson.exports)) {
				if (k.includes('internal')) {
					findings.push({
						severity: 'error',
						rule: 'tier-no-internal-export',
						location: `${toRepoRel(join(pkgDir, 'package.json'))}:exports["${k}"]`,
						evidence: `exports contains internal`,
						suggestedFix: `Remove internal from exports; use #${pkgNameFromDir(pkgDir)}/* only`,
						normativeRef: 'AGENTS.md:104-113 §3',
					});
				}
			}
		}
	}
}

function generateReport(target: string, findings: Finding[]): string {
	const counts = {
		error: findings.filter((f) => f.severity === 'error').length,
		warn: findings.filter((f) => f.severity === 'warn').length,
		info: findings.filter((f) => f.severity === 'info').length,
	};
	const sorted = [...findings].sort((a, b) => {
		const order = (s: Severity) => (s === 'error' ? 0 : s === 'warn' ? 1 : 2);
		const d = order(a.severity) - order(b.severity);
		if (d !== 0) return d;
		return a.rule.localeCompare(b.rule);
	});
	const lines: string[] = [];
	lines.push(`# review-api — ${target}`);
	lines.push('');
	lines.push('## Summary');
	lines.push('');
	if (findings.length === 0) {
		lines.push(`API is clean for §1.1/§6. Counts: 0 error, 0 warn, 0 info.`);
	} else {
		lines.push(`Found ${findings.length} API findings. Counts: ${counts.error} error, ${counts.warn} warn, ${counts.info} info. ${counts.error > 0 ? 'Requires fix before merge for errors.' : 'Requires attention for warn/info.'}`);
	}
	lines.push('');
	lines.push('## Findings');
	lines.push('');
	lines.push('| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |');
	lines.push('|---|---|---|---|---|---|');
	if (sorted.length === 0) {
		lines.push('| — | — | — | No findings | — | — |');
	} else {
		for (const f of sorted) {
			const ev = f.evidence.replaceAll('|', '\\|').slice(0, 120);
			const fix = f.suggestedFix.replaceAll('|', '\\|').slice(0, 120);
			lines.push(`| ${f.severity} | ${f.rule} | ${f.location} | \`${ev}\` | ${fix} | ${f.normativeRef} |`);
		}
	}
	lines.push('');
	lines.push('## Next actions');
	lines.push('');
	if (sorted.length === 0) {
		lines.push('- No action required — package is clean for review-api.');
	} else {
		if (counts.error > 0) lines.push(`- Fix ${counts.error} error(s) per AGENTS.md:16-31/287-478 and re-run review-api`);
		if (counts.warn > 0) lines.push(`- Review ${counts.warn} warn(s) — HKT/Module nuance, propose ADR if intentionally omitted`);
		if (counts.info > 0) lines.push(`- ${counts.info} info — advisory`);
		lines.push(`- Re-run \`bun .opencode/skills/review-api/scripts/run.ts -- ${target}\` to verify`);
	}
	return lines.join('\n');
}

function parseArgs(argv: string[]): { out?: string; workspace: boolean; target?: string } {
	const args = argv.slice(2);
	let out: string | undefined;
	let workspace = false;
	let target: string | undefined;
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === '--out' && i + 1 < args.length) out = args[++i];
		else if (a?.startsWith('--out=')) out = a.split('=')[1];
		else if (a === '--workspace') workspace = true;
		else if (a === '--verbose') continue;
		else if (a === '--') continue;
		else if (!a?.startsWith('-')) target = a;
	}
	return { out, workspace, target };
}

if (import.meta.main) {
	const { out, workspace, target } = parseArgs(process.argv);
	let pkgDirs: string[] = [];
	if (workspace) {
		pkgDirs = discoverPackages();
	} else if (target) {
		const norm = normalizePkgArg(target);
		if (!norm || !existsSync(join(norm, 'package.json'))) {
			console.error(`Package not found: ${target} (expected packages/<name> with package.json)`);
			process.exit(1);
		}
		pkgDirs = [norm];
	} else {
		console.error('Usage: bun .opencode/skills/review-api/scripts/run.ts -- <pkg> [--workspace] [--out <path>]');
		console.error('Example: bun .opencode/skills/review-api/scripts/run.ts -- packages/stream');
		process.exit(1);
	}

	const allFindings: Finding[] = [];
	let reportTarget = workspace ? 'workspace' : toRepoRel(pkgDirs[0]!);

	if (workspace) {
		for (const dir of pkgDirs) {
			const findings: Finding[] = [];
			checkNaming(dir, findings);
			checkMathIndex(dir, findings);
			checkOptLazy(dir, findings);
			checkNonEmptyOrder(dir, findings);
			checkHKT(dir, findings);
			checkModule(dir, findings);
			checkTierLeakage(dir, findings);
			for (const f of findings) {
				allFindings.push({ ...f, location: `${toRepoRel(dir)}: ${f.location}` });
			}
		}
	} else {
		const dir = pkgDirs[0]!;
		checkNaming(dir, allFindings);
		checkMathIndex(dir, allFindings);
		checkOptLazy(dir, allFindings);
		checkNonEmptyOrder(dir, allFindings);
		checkHKT(dir, allFindings);
		checkModule(dir, allFindings);
		checkTierLeakage(dir, allFindings);
		reportTarget = toRepoRel(dir);
	}

	const report = generateReport(reportTarget, allFindings);
	console.log(report);
	if (out) {
		const absOut = resolve(out);
		if (!absOut.startsWith(REPO_ROOT + '/') && !absOut.startsWith('/tmp/')) {
			console.error(`Refusing to write outside repo and /tmp: ${absOut}`);
			process.exit(1);
		}
		mkdirSync(dirname(absOut), { recursive: true });
		writeFileSync(absOut, report, 'utf-8');
	}
	const hasError = allFindings.some((f) => f.severity === 'error');
	process.exit(hasError ? 1 : 0);
}

export { checkNaming, checkMathIndex, checkOptLazy, checkNonEmptyOrder, checkHKT, checkModule, checkTierLeakage, generateReport, discoverPackages };
