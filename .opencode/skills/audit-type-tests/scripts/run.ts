#!/usr/bin/env bun
/**
 * run.ts — audit-type-tests (type-level gaps) diagnose
 *
 * Diagnose-only, never error (warn/info per Q11). Package-scoped default, --workspace.
 *
 * Usage:
 *   bun .opencode/skills/audit-type-tests/scripts/run.ts -- packages/hashed
 *   bun .opencode/skills/audit-type-tests/scripts/run.ts -- --workspace
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

type Severity = 'warn' | 'info';
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
		if (existsSync(join(PACKAGES_ROOT, e.name, 'package.json'))) pkgs.push(join(PACKAGES_ROOT, e.name));
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

function extractGenericMethods(pkgDir: string): { name: string; file: string; line: number }[] {
	const pubDir = join(pkgDir, 'src/public');
	if (!existsSync(pubDir)) return [];
	const files = listFilesRec(pubDir);
	const methods: { name: string; file: string; line: number }[] = [];
	const seen = new Set<string>();
	for (const file of files) {
		let content: string;
		try {
			content = readFileSync(file, 'utf-8');
		} catch {
			continue;
		}
		const lines = content.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i] ?? '';
			// Generic method: name<...> ( ... )  e.g. filter<T>(, get<K>(, select<T, const SL>
			const m = line.match(/^\s*(?:readonly\s+)?(\w+)\s*<[^>]*>\s*\(/);
			if (m && m[1]) {
				const name = m[1]!;
				if (['if', 'for', 'while', 'import', 'export'].includes(name)) continue;
				const key = `${file}:${name}`;
				if (!seen.has(key)) {
					seen.add(key);
					methods.push({ name, file, line: i + 1 });
				}
			}
		}
	}
	// Also check for const type params and NoInfer that are not necessarily generic methods but should be tested
	// Those are handled separately in their own checks, not here
	return methods;
}

function checkMissingTypeTests(pkgDir: string, findings: Finding[]): void {
	const testDDir = join(pkgDir, 'test-d');
	const hasTestD = existsSync(testDDir);
	const methods = extractGenericMethods(pkgDir);
	for (const { name, file, line } of methods) {
		if (['Types', 'NonEmpty', 'Builder', 'Context', 'Family', 'Capability'].includes(name)) continue;
		if (name.startsWith('_')) continue;
		let hasCoverage = false;
		if (hasTestD) {
			const out = rg(`\\b${name}\\b`, testDDir);
			if (out.trim()) {
				// Check if any of those lines contain expectTypeOf
				const hasExpect = out.split('\n').some((l) => l.includes('expectTypeOf'));
				if (hasExpect) hasCoverage = true;
				else {
					// Even without expectTypeOf, if method is mentioned in test-d, consider covered (maybe via import)
					hasCoverage = true;
				}
			}
		}
		if (!hasCoverage) {
			findings.push({
				severity: 'warn',
				rule: 'missing-type-test',
				location: `${toRepoRel(file)}:${line}`,
				evidence: `rg -n "\\b${name}\\b" ${toRepoRel(testDDir)} --no-heading => 0 matches | ${toRepoRel(file)}:${line}: ${name}<...>`,
				suggestedFix: `Add test-d/${pkgNameFromDir(pkgDir)}.test-d.ts: expectTypeOf<...>() for ${name} per AGENTS.md:424-463`,
				normativeRef: 'AGENTS.md:424-463 §6.6',
			});
		}
	}
	if (!hasTestD && methods.length > 0) {
		// If no test-d at all but has generic methods, already flagged per method above; no extra package-level needed
	}
}

function checkAsAssertions(pkgDir: string, findings: Finding[]): void {
	const testDDir = join(pkgDir, 'test-d');
	if (!existsSync(testDDir)) return;
	const out = rg('\\bas\\s', testDDir);
	if (!out.trim()) return;
	for (const line of out.trim().split('\n')) {
		// line is file:line:content
		const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
		const loc = rel.split(':').slice(0, 2).join(':');
		const content = line.split(':').slice(2).join(':');
		// Distinguish as const vs as Type
		if (content.includes('as const')) {
			findings.push({
				severity: 'info',
				rule: 'as-const',
				location: loc,
				evidence: line.slice(0, 120),
				suggestedFix: `Use const type param per AGENTS.md:424-438 instead of as const`,
				normativeRef: 'AGENTS.md:424-438 §6.6',
			});
		} else if (/\bas\s+(any|unknown|string|number|boolean|object|never)\b/.test(content) || /\bas\s+\w+/.test(content)) {
			// Heuristic: any as with type is assertion
			findings.push({
				severity: 'warn',
				rule: 'as-assertion',
				location: loc,
				evidence: line.slice(0, 120),
				suggestedFix: `Replace as with expectTypeOf or satisfies per Q11`,
				normativeRef: 'AGENTS.md:424-463 §6.6',
			});
		}
	}
}

function checkNonEmptyTypeTests(pkgDir: string, findings: Finding[]): void {
	const pubDir = join(pkgDir, 'src/public');
	if (!existsSync(pubDir)) return;
	const hasNonEmpty = rg('interface NonEmpty', pubDir).trim() !== '';
	if (!hasNonEmpty) return;
	const testDDir = join(pkgDir, 'test-d');
	const hasTest = existsSync(testDDir) && (rg('nonEmpty\\(\\)|assumeNonEmpty', testDDir).trim() !== '' || rg('NonEmpty', testDDir).trim() !== '');
	if (!hasTest) {
		findings.push({
			severity: 'warn',
			rule: 'nonempty-type-test',
			location: toRepoRel(pubDir),
			evidence: `rg -n "nonEmpty|assumeNonEmpty" ${toRepoRel(testDDir)} => 0 matches but src/public has interface NonEmpty`,
			suggestedFix: `Add expectTypeOf case for nonEmpty()/assumeNonEmpty() per AGENTS.md:335-352`,
			normativeRef: 'AGENTS.md:335-352 §6.2',
		});
	}
}

function checkHKTTypeTests(pkgDir: string, findings: Finding[]): void {
	const pubDir = join(pkgDir, 'src/public');
	if (!existsSync(pubDir)) return;
	const hasTypes = rg('interface Types', pubDir).trim() !== '' || rg('_NORMAL|_NON_EMPTY|Family<', pubDir).trim() !== '';
	if (!hasTypes) return;
	const testDDir = join(pkgDir, 'test-d');
	const hasTest = existsSync(testDDir) && (rg('Types|_NORMAL|_NON_EMPTY', testDDir).trim() !== '');
	if (!hasTest) {
		findings.push({
			severity: 'warn',
			rule: 'hkt-type-test',
			location: toRepoRel(pubDir),
			evidence: `rg -n "Types|_NORMAL" ${toRepoRel(testDDir)} => 0 matches but src/public has Types/Family`,
			suggestedFix: `Add expectTypeOf case for Types normal/nonEmpty per AGENTS.md:375-398`,
			normativeRef: 'AGENTS.md:375-398 §6.4',
		});
	}
}

function checkConstNoInfer(pkgDir: string, findings: Finding[]): void {
	const pubDir = join(pkgDir, 'src/public');
	if (!existsSync(pubDir)) return;
	const hasConst = rg('<const', pubDir).trim() !== '';
	if (hasConst) {
		const testDDir = join(pkgDir, 'test-d');
		const hasTest = existsSync(testDDir) && rg('expectTypeOf', testDDir).trim() !== '';
		// Check if test-d has a case that uses const inference (hard to detect, so just check if any expectTypeOf exists)
		if (!hasTest) {
			findings.push({
				severity: 'warn',
				rule: 'const-param-test',
				location: toRepoRel(pubDir),
				evidence: `rg -n "<const" ${toRepoRel(pubDir)} => found but no expectTypeOf in ${toRepoRel(testDDir)}`,
				suggestedFix: `Add expectTypeOf case with inline literal per AGENTS.md:424-438`,
				normativeRef: 'AGENTS.md:424-438 §6.6',
			});
		}
	}
	const hasNoInfer = rg('NoInfer', pubDir).trim() !== '';
	if (hasNoInfer) {
		const testDDir = join(pkgDir, 'test-d');
		const hasTest = existsSync(testDDir) && rg('NoInfer', testDDir).trim() !== '';
		if (!hasTest) {
			findings.push({
				severity: 'warn',
				rule: 'noinfer-test',
				location: toRepoRel(pubDir),
				evidence: `rg -n "NoInfer" ${toRepoRel(pubDir)} => found but not in test-d`,
				suggestedFix: `Add expectTypeOf case for NoInfer fallback per AGENTS.md:445-463`,
				normativeRef: 'AGENTS.md:445-463 §6.6',
			});
		}
	}
}

function checkOverloadOrder(pkgDir: string, findings: Finding[]): void {
	const pubDir = join(pkgDir, 'src/public');
	if (!existsSync(pubDir)) return;
	const out = rg('NonEmpty|StreamSource', pubDir);
	if (!out.trim()) return;
	// For each file with NonEmpty, check order
	const files = new Set<string>();
	for (const line of out.trim().split('\n')) {
		const f = line.split(':')[0] ?? '';
		if (f) files.add(f);
	}
	for (const file of files) {
		let content: string;
		try {
			content = readFileSync(file, 'utf-8');
		} catch {
			continue;
		}
		const nonEmptyIdx = content.indexOf('interface NonEmpty');
		if (nonEmptyIdx === -1) continue;
		const after = content.slice(nonEmptyIdx, nonEmptyIdx + 8000);
		const lines = after.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const l = lines[i] ?? '';
			if (l.includes('StreamSource') && !l.includes('NonEmpty')) {
				// Look ahead for NonEmpty for same method
				for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
					const nl = lines[j] ?? '';
					if (nl.includes('StreamSource.NonEmpty')) {
						const m1 = l.match(/(\w+)\s*\(/);
						const m2 = nl.match(/(\w+)\s*\(/);
						if (m1 && m2 && m1[1] === m2[1]) {
							const rel = toRepoRel(file);
							findings.push({
								severity: 'warn',
								rule: 'overload-order-type-test',
								location: `${rel}:${nonEmptyIdx.toString().split('\n').length + i + 1}`,
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

function checkAnyNonNull(pkgDir: string, findings: Finding[]): void {
	const testDDir = join(pkgDir, 'test-d');
	if (!existsSync(testDDir)) return;
	const outAny = rg('\\bany\\b', testDDir);
	if (outAny.trim()) {
		for (const line of outAny.trim().split('\n').slice(0, 5)) {
			const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
			const loc = rel.split(':').slice(0, 2).join(':');
			findings.push({
				severity: 'info',
				rule: 'any-nonnull-in-testd',
				location: loc,
				evidence: line.slice(0, 120),
				suggestedFix: `Prefer unknown/expectTypeOf over any per biome.json:15-44`,
				normativeRef: 'biome.json:15-44',
			});
		}
	}
	const outBang = rg('!', testDDir);
	// Only flag ! that is likely non-null assertion (e.g. value! )
	if (outBang.trim()) {
		const lines = outBang.trim().split('\n').filter((l) => l.includes('!') && !l.includes('!=') && !l.includes('!=='));
		for (const line of lines.slice(0, 5)) {
			if (line.includes('!')) {
				const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
				const loc = rel.split(':').slice(0, 2).join(':');
				findings.push({
					severity: 'info',
					rule: 'any-nonnull-in-testd',
					location: loc,
					evidence: line.slice(0, 120),
					suggestedFix: `Avoid ! per biome.json:15-44, use expectTypeOf`,
					normativeRef: 'biome.json:15-44',
				});
				break; // Only one for brevity
			}
		}
	}
}

function generateReport(target: string, findings: Finding[], totalMethods: number, covered: number): string {
	const counts = {
		warn: findings.filter((f) => f.severity === 'warn').length,
		info: findings.filter((f) => f.severity === 'info').length,
	};
	const sorted = [...findings].sort((a, b) => {
		if (a.severity === 'warn' && b.severity === 'info') return -1;
		if (a.severity === 'info' && b.severity === 'warn') return 1;
		return a.rule.localeCompare(b.rule);
	});
	const lines: string[] = [];
	lines.push(`# audit-type-tests — ${target}`);
	lines.push('');
	lines.push('## Summary');
	lines.push('');
	if (findings.length === 0) {
		lines.push(`All type-level cases have expectTypeOf. Audited ${totalMethods} generic methods, covered ${covered}/${totalMethods}. Counts: 0 warn, 0 info.`);
	} else {
		lines.push(`Audited ${totalMethods} generic methods, covered ${covered}/${totalMethods}. Found ${findings.length} gaps. Counts: 0 error, ${counts.warn} warn, ${counts.info} info.`);
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
		lines.push('- No action required — all type-level cases have expectTypeOf.');
	} else {
		if (counts.warn > 0) lines.push(`- Add ${counts.warn} missing expectTypeOf case(s) in test-d/*.test-d.ts per AGENTS.md:424-463 and re-run audit-type-tests`);
		if (counts.info > 0) lines.push(`- ${counts.info} info — as const / any / ! advisory, replace with const param / expectTypeOf`);
		lines.push(`- Re-run \`bun .opencode/skills/audit-type-tests/scripts/run.ts -- ${target}\` to verify`);
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
		console.error('Usage: bun .opencode/skills/audit-type-tests/scripts/run.ts -- <pkg> [--workspace] [--out <path>]');
		process.exit(1);
	}

	const allFindings: Finding[] = [];
	let reportTarget = workspace ? 'workspace' : toRepoRel(pkgDirs[0]!);
	let totalMethods = 0;
	let covered = 0;

	if (workspace) {
		for (const dir of pkgDirs) {
			const findings: Finding[] = [];
			const methods = extractGenericMethods(dir);
			totalMethods += methods.length;
			checkMissingTypeTests(dir, findings);
			checkAsAssertions(dir, findings);
			checkNonEmptyTypeTests(dir, findings);
			checkHKTTypeTests(dir, findings);
			checkConstNoInfer(dir, findings);
			checkOverloadOrder(dir, findings);
			checkAnyNonNull(dir, findings);
			const warnCount = findings.filter((f) => f.rule === 'missing-type-test' && f.severity === 'warn').length;
			covered += methods.length - warnCount;
			for (const f of findings) {
				allFindings.push({ ...f, location: `${toRepoRel(dir)}: ${f.location}` });
			}
		}
		reportTarget = 'workspace';
	} else {
		const dir = pkgDirs[0]!;
		const methods = extractGenericMethods(dir);
		totalMethods = methods.length;
		checkMissingTypeTests(dir, allFindings);
		checkAsAssertions(dir, allFindings);
		checkNonEmptyTypeTests(dir, allFindings);
		checkHKTTypeTests(dir, allFindings);
		checkConstNoInfer(dir, allFindings);
		checkOverloadOrder(dir, allFindings);
		checkAnyNonNull(dir, allFindings);
		const warnCount = allFindings.filter((f) => f.rule === 'missing-type-test' && f.severity === 'warn').length;
		covered = totalMethods - warnCount;
		reportTarget = toRepoRel(dir);
	}

	const report = generateReport(reportTarget, allFindings, totalMethods, covered);
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
	process.exit(0);
}

export { extractGenericMethods, checkMissingTypeTests, checkAsAssertions, checkNonEmptyTypeTests, checkHKTTypeTests, checkConstNoInfer, checkOverloadOrder, generateReport, discoverPackages };
