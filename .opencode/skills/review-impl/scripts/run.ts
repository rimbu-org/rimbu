#!/usr/bin/env bun
/**
 * run.ts — review-impl (implementation quality) diagnose
 *
 * Diagnose-only, fast static rg only, no build:seq per Q10. Supports <pkg> or --workspace, --out.
 *
 * Usage:
 *   bun .opencode/skills/review-impl/scripts/run.ts -- packages/list
 *   bun .opencode/skills/review-impl/scripts/run.ts -- --workspace
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
		if (existsSync(join(PACKAGES_ROOT, e.name, 'src'))) pkgs.push(join(PACKAGES_ROOT, e.name));
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
		return '';
	} catch {
		return '';
	}
}
function listFilesRec(dir: string, ext = '.ts'): string[] {
	const out: string[] = [];
	if (!existsSync(dir)) return out;
	for (const e of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, e.name);
		if (e.isDirectory()) out.push(...listFilesRec(p, ext));
		else if (e.name.endsWith(ext)) out.push(p);
	}
	return out;
}

function checkNoUnusedImports(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	// Find all import statements and check if imported identifiers are used elsewhere
	const importsOut = rg('import\\s+\\{[^}]+\\}|import\\s+\\*\\s+as|import\\s+type\\s+\\{', srcDir);
	if (!importsOut.trim()) return;
	for (const line of importsOut.trim().split('\n')) {
		// line: file:line:import { X, Y } from '...'
		const m = line.match(/import\s+(?:type\s+)?\{([^}]+)\}/);
		if (!m || !m[1]) continue;
		const file = line.split(':')[0] ?? '';
		const imported = m[1]!.split(',').map((s) => s.trim().split(/\s+as\s+/)[0]?.trim().split(/\s+/)[0]?.trim()).filter(Boolean);
		for (const name of imported) {
			if (!name || name === 'type' || name.length < 2) continue;
			// Check if name appears elsewhere in src outside this import line
			const usageOut = rg(`\\b${name}\\b`, srcDir);
			if (!usageOut.trim()) continue;
			// Count occurrences excluding the import line itself
			let count = 0;
			for (const ul of usageOut.trim().split('\n')) {
				if (ul.startsWith(file + ':') && ul.includes(`import`)) continue;
				count++;
			}
			if (count === 0) {
				const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
				const loc = rel.split(':').slice(0, 2).join(':');
				findings.push({
					severity: 'error',
					rule: 'noUnusedImports',
					location: loc,
					evidence: line.slice(0, 120),
					suggestedFix: `Remove unused import ${name} per biome.json:18-21`,
					normativeRef: 'biome.json:15-44, AGENTS.md:565-572',
				});
			}
		}
	}
}

function checkNoExplicitAny(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	const out = rg(':\\s*any\\b|\\bas\\s+any\\b|<any>|any\\[\\]', srcDir);
	if (!out.trim()) return;
	for (const line of out.trim().split('\n')) {
		// Exclude test files (biome override allows console in test, but any is still warn in src)
		if (line.includes('/test/')) continue;
		const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
		const loc = rel.split(':').slice(0, 2).join(':');
		findings.push({
			severity: 'warn',
			rule: 'noExplicitAny',
			location: loc,
			evidence: line.slice(0, 120),
			suggestedFix: `Use unknown/generic per biome.json:15-44`,
			normativeRef: 'biome.json:15-44, AGENTS.md:565-572',
		});
		// Limit to avoid noise
		if (findings.filter((f) => f.rule === 'noExplicitAny').length >= 20) break;
	}
}

function checkNoNonNullAssertion(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	// Find ! not part of != or !==
	const out = rg('\\w+!', srcDir);
	if (!out.trim()) return;
	for (const line of out.trim().split('\n')) {
		if (line.includes('!=')) continue;
		if (line.includes('!==')) continue;
		// Heuristic: look for value! . or value!; or value!
		if (!/\w+!(\.|;|\b)/.test(line)) continue;
		// Exclude builder returning this! not relevant
		const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
		const loc = rel.split(':').slice(0, 2).join(':');
		findings.push({
			severity: 'warn',
			rule: 'noNonNullAssertion',
			location: loc,
			evidence: line.slice(0, 120),
			suggestedFix: `Use OptLazy/nonEmpty() guard per AGENTS.md:565-572`,
			normativeRef: 'biome.json:15-44, AGENTS.md:565-572',
		});
		if (findings.filter((f) => f.rule === 'noNonNullAssertion').length >= 20) break;
	}
}

function checkNoConsole(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	const out = rg('console\\.(log|warn|error|info|debug)', srcDir);
	if (!out.trim()) return;
	for (const line of out.trim().split('\n')) {
		// Exclude JSDoc examples: lines that are inside /** ... */ (trim starts with *)
		const contentPart = line.split(':').slice(2).join(':');
		if (contentPart.trim().startsWith('*')) continue;
		const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
		const loc = rel.split(':').slice(0, 2).join(':');
		findings.push({
			severity: 'error',
			rule: 'noConsole',
			location: loc,
			evidence: line.slice(0, 120),
			suggestedFix: `Remove console from src/ per biome.json:15-44 (allowed in test/ per 73-84)`,
			normativeRef: 'biome.json:15-44, AGENTS.md:565-572',
		});
	}
}

function checkNoRestrictedImports(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	const out = rg("from\\s+['\"]\\./|from\\s+['\"]\\.\\./", srcDir);
	if (!out.trim()) return;
	for (const line of out.trim().split('\n')) {
		const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
		const loc = rel.split(':').slice(0, 2).join(':');
		findings.push({
			severity: 'error',
			rule: 'noRestrictedImports',
			location: loc,
			evidence: line.slice(0, 120),
			suggestedFix: `Use #${pkgNameFromDir(pkgDir)}/* or @rimbu/* per AGENTS.md:138-152`,
			normativeRef: 'biome.json:27-35, AGENTS.md:138-152',
		});
		if (findings.filter((f) => f.rule === 'noRestrictedImports').length >= 20) break;
	}
}

function checkMutationLeak(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	// Only flag 'return this;' or 'return this' with no dot (not 'return this.get')
	const out = rg('return this\\s*;', srcDir);
	if (!out.trim()) return;
	for (const line of out.trim().split('\n')) {
		// Allow Builder returning this (mutable builder)
		if (line.includes('Builder') || line.includes('builder')) continue;
		// Only flag in immutable
		if (!line.includes('/immutable/')) continue;
		const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
		const loc = rel.split(':').slice(0, 2).join(':');
		findings.push({
			severity: 'warn',
			rule: 'mutation-leak',
			location: loc,
			evidence: line.slice(0, 120),
			suggestedFix: `Return new instance per AGENTS.md:9 (immutable)`,
			normativeRef: 'AGENTS.md:287-478 §6',
		});
		if (findings.filter((f) => f.rule === 'mutation-leak').length >= 10) break;
	}
}

function checkNonEmptyNarrowing(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	const out = rg('assumeNonEmpty', srcDir);
	if (!out.trim()) return;
	for (const line of out.trim().split('\n')) {
		// Check if preceding line in file has nonEmpty() guard — we can't easily, so just flag as warn to review
		// For now, flag all assumeNonEmpty without obvious guard as potential bug
		const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
		const loc = rel.split(':').slice(0, 2).join(':');
		// Only flag if not already guarded by nonEmpty in same line
		if (!line.includes('nonEmpty()')) {
			findings.push({
				severity: 'warn',
				rule: 'nonempty-narrowing',
				location: loc,
				evidence: line.slice(0, 120),
				suggestedFix: `Guard with if (x.nonEmpty()) before assumeNonEmpty() per AGENTS.md:335-352`,
				normativeRef: 'AGENTS.md:335-352 §6.2',
			});
			if (findings.filter((f) => f.rule === 'nonempty-narrowing').length >= 10) break;
		}
	}
}

function checkReducerMisuse(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	const hasReducer = rg('Reducer', srcDir).trim() !== '';
	const hasReduce = rg('\\.reduce\\(', srcDir).trim() !== '';
	if (hasReduce && !hasReducer) {
		const out = rg('\\.reduce\\(', srcDir);
		for (const line of out.trim().split('\n').slice(0, 5)) {
			const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
			const loc = rel.split(':').slice(0, 2).join(':');
			findings.push({
				severity: 'info',
				rule: 'reducer-misuse',
				location: loc,
				evidence: line.slice(0, 120),
				suggestedFix: `Consider Reducer composable per AGENTS.md:400-420 §6.5`,
				normativeRef: 'AGENTS.md:400-420 §6.5',
			});
		}
	}
}

function checkTokenRimbuError(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	const isBase = pkgNameFromDir(pkgDir) === 'base';
	const tokenOut = rg('\\bToken\\b', srcDir);
	if (tokenOut.trim() && !isBase) {
		for (const line of tokenOut.trim().split('\n').slice(0, 5)) {
			const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
			const loc = rel.split(':').slice(0, 2).join(':');
			findings.push({
				severity: 'warn',
				rule: 'token-misuse',
				location: loc,
				evidence: line.slice(0, 120),
				suggestedFix: `Use Token via @rimbu/base per packages/base`,
				normativeRef: 'AGENTS.md:287-478 §6',
			});
		}
	}
	const rimbuOut = rg('RimbuError', srcDir);
	if (rimbuOut.trim()) {
		for (const line of rimbuOut.trim().split('\n').slice(0, 5)) {
			if (line.includes('throw') || line.includes('RimbuError')) {
				// Only flag if not thrown
				if (!line.includes('throw')) {
					const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
					const loc = rel.split(':').slice(0, 2).join(':');
					findings.push({
						severity: 'warn',
						rule: 'rimbuerror-misuse',
						location: loc,
						evidence: line.slice(0, 120),
						suggestedFix: `Throw RimbuError via throw new RimbuError...`,
						normativeRef: 'packages/base',
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
	lines.push(`# review-impl — ${target}`);
	lines.push('');
	lines.push('## Summary');
	lines.push('');
	if (findings.length === 0) {
		lines.push(`Impl is clean for §6/§9. Counts: 0 error, 0 warn, 0 info.`);
	} else {
		lines.push(`Found ${findings.length} impl findings. Counts: ${counts.error} error, ${counts.warn} warn, ${counts.info} info. ${counts.error > 0 ? 'Requires fix before merge for errors.' : 'Requires attention for warn/info.'}`);
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
		lines.push('- No action required — impl is clean for review-impl.');
	} else {
		if (counts.error > 0) lines.push(`- Fix ${counts.error} error(s) (noUnusedImports/noConsole/noRestrictedImports) then re-run`);
		if (counts.warn > 0) lines.push(`- Review ${counts.warn} warn(s) (any/!/mutation/NonEmpty/Reducer/Token) and fix per AGENTS.md:287-478`);
		if (counts.info > 0) lines.push(`- ${counts.info} info — advisory`);
		lines.push(`- Re-run \`bun .opencode/skills/review-impl/scripts/run.ts -- ${target}\` to verify`);
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
		if (!norm || !existsSync(join(norm!, 'package.json'))) {
			console.error(`Package not found: ${target}`);
			process.exit(1);
		}
		pkgDirs = [norm!];
	} else {
		console.error('Usage: bun .opencode/skills/review-impl/scripts/run.ts -- <pkg> [--workspace] [--out <path>]');
		process.exit(1);
	}

	const allFindings: Finding[] = [];
	let reportTarget = workspace ? 'workspace' : toRepoRel(pkgDirs[0]!);

	if (workspace) {
		for (const dir of pkgDirs) {
			const findings: Finding[] = [];
			checkNoUnusedImports(dir, findings);
			checkNoExplicitAny(dir, findings);
			checkNoNonNullAssertion(dir, findings);
			checkNoConsole(dir, findings);
			checkNoRestrictedImports(dir, findings);
			checkMutationLeak(dir, findings);
			checkNonEmptyNarrowing(dir, findings);
			checkReducerMisuse(dir, findings);
			checkTokenRimbuError(dir, findings);
			for (const f of findings) {
				allFindings.push({ ...f, location: `${toRepoRel(dir)}: ${f.location}` });
			}
		}
	} else {
		const dir = pkgDirs[0]!;
		checkNoUnusedImports(dir, allFindings);
		checkNoExplicitAny(dir, allFindings);
		checkNoNonNullAssertion(dir, allFindings);
		checkNoConsole(dir, allFindings);
		checkNoRestrictedImports(dir, allFindings);
		checkMutationLeak(dir, allFindings);
		checkNonEmptyNarrowing(dir, allFindings);
		checkReducerMisuse(dir, allFindings);
		checkTokenRimbuError(dir, allFindings);
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

export {
	checkNoUnusedImports,
	checkNoExplicitAny,
	checkNoNonNullAssertion,
	checkNoConsole,
	checkNoRestrictedImports,
	checkMutationLeak,
	checkNonEmptyNarrowing,
	checkReducerMisuse,
	checkTokenRimbuError,
	generateReport,
	discoverPackages,
};
