#!/usr/bin/env bun
/**
 * run.ts — audit-tests (unit coverage gaps) diagnose
 *
 * Diagnose-only, never error (warn/info only per Q11). Package-scoped default, --workspace.
 *
 * Usage:
 *   bun .opencode/skills/audit-tests/scripts/run.ts -- packages/hashed
 *   bun .opencode/skills/audit-tests/scripts/run.ts -- --workspace
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
function readJsonSafe(p: string): any | null {
	try {
		return JSON.parse(readFileSync(p, 'utf-8'));
	} catch {
		return null;
	}
}

function extractPublicMethods(pkgDir: string): { name: string; file: string; line: number }[] {
	// For audit, use a curated canonical list per package type rather than fragile parsing
	// This matches AGENTS.md:480-518 §7 method checklist and AGENTS.md:20 naming
	const pkgName = pkgNameFromDir(pkgDir);
	const pubDir = join(pkgDir, 'src/public');
	const hasPublic = existsSync(pubDir);
	if (!hasPublic && !existsSync(join(pkgDir, `src/${pkgName}.ts`))) return [];

	// Canonical collection methods (from AGENTS.md and collection-types)
	const canonicalMap = [
		'filter',
		'map',
		'flatMap',
		'forEach',
		'reduce',
		'find',
		'findEntry',
		'get',
		'has',
		'set',
		'remove',
		'update',
		'modifyAt',
		'updateAt',
		'hasKey',
		'hasValue',
		'getAt',
		'first',
		'last',
		'at',
		'take',
		'drop',
		'slice',
		'stream',
		'toArray',
		'toString',
		'equals',
		'size',
		'isEmpty',
		'nonEmpty',
		'assumeNonEmpty',
		'toBuilder',
		'from',
		'of',
		'empty',
	];
	const canonicalList = [
		'filter',
		'map',
		'flatMap',
		'forEach',
		'reduce',
		'find',
		'first',
		'last',
		'at',
		'get',
		'take',
		'drop',
		'slice',
		'span',
		'splitAt',
		'insert',
		'updateAt',
		'removeAt',
		'stream',
		'toArray',
		'toString',
		'equals',
		'size',
		'isEmpty',
		'nonEmpty',
		'assumeNonEmpty',
		'toBuilder',
		'from',
		'of',
		'empty',
		'prepend',
		'append',
		'concat',
	];
	const canonicalStream = [
		'filter',
		'map',
		'flatMap',
		'forEach',
		'reduce',
		'find',
		'first',
		'last',
		'at',
		'take',
		'drop',
		'dropWhile',
		'takeWhile',
		'slice',
		'stream',
		'toArray',
		'collect',
		'toString',
		'equals',
		'isEmpty',
		'nonEmpty',
		'assumeNonEmpty',
		'of',
		'from',
		'range',
		'empty',
	];

	let canonical: string[] = [];
	if (['hashed', 'ordered', 'sorted', 'bimap', 'bimultimap', 'multimap', 'multiset', 'proximity', 'table', 'graph'].includes(pkgName)) {
		canonical = canonicalMap;
	} else if (['list', 'list2'].includes(pkgName)) {
		canonical = canonicalList;
	} else if (pkgName === 'stream') {
		canonical = canonicalStream;
	} else if (['base', 'common', 'collection-types', 'deep', 'channel', 'spy', 'task', 'core', 'typical', 'actor', 'reactor'].includes(pkgName)) {
		// For non-collection packages, use whatever public methods exist via simple scan
		const files = listFilesRec(pubDir);
		const seen = new Set<string>();
		const out: { name: string; file: string; line: number }[] = [];
		for (const file of files) {
			try {
				const content = readFileSync(file, 'utf-8');
				const lines = content.split('\n');
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i] ?? '';
					const m = line.match(/^\s*(?:readonly\s+)?(\w+)\s*\(/);
					if (m && m[1] && !['if', 'for', 'while', 'switch', 'import', 'export', 'return', 'super', 'throw', 'new', 'await', 'yield', 'break', 'continue', 'case', 'default', 'catch', 'try'].includes(m[1]!) && m[1]!.length > 1) {
						if (!seen.has(m[1]!)) {
							seen.add(m[1]!);
							out.push({ name: m[1]!, file, line: i + 1 });
						}
					}
				}
			} catch {}
		}
		return out.slice(0, 10); // limit
	} else {
		canonical = canonicalMap.slice(0, 10);
	}

	// For canonical, check which actually appear in public API (via rg) to avoid flagging methods that don't exist for this package
	const present: { name: string; file: string; line: number }[] = [];
	for (const name of canonical) {
		const out = rg(`\\b${name}\\b`, pubDir);
		if (out.trim()) {
			// Find first occurrence file:line
			const first = out.trim().split('\n')[0] ?? '';
			const file = first.split(':')[0] ?? join(pubDir, 'unknown.ts');
			const lineNo = parseInt(first.split(':')[1] ?? '1', 10) || 1;
			present.push({ name, file, line: lineNo });
		} else {
			// If not in public but in src/<name>.ts entry, check there
			const entryFile = join(pkgDir, `src/${pkgName}.ts`);
			if (existsSync(entryFile)) {
				const entryOut = rg(`\\b${name}\\b`, entryFile);
				if (entryOut.trim()) {
					present.push({ name, file: entryFile, line: 1 });
				}
			}
		}
	}
	// If no canonical found (e.g. for non-collection), fallback to simple scan
	if (present.length === 0) {
		const files = listFilesRec(pubDir);
		const seen = new Set<string>();
		for (const file of files) {
			try {
				const content = readFileSync(file, 'utf-8');
				const lines = content.split('\n');
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i] ?? '';
					const m = line.match(/^\s*(?:readonly\s+)?(\w+)\s*\(/);
					if (m && m[1] && !['if', 'for', 'while', 'import', 'export', 'return', 'super', 'throw', 'new', 'await', 'yield', 'break', 'continue'].includes(m[1]!) && !seen.has(m[1]!)) {
						seen.add(m[1]!);
						present.push({ name: m[1]!, file, line: i + 1 });
						if (present.length >= 8) break;
					}
				}
			} catch {}
		}
	}
	return present;
}

function checkUnitTests(pkgDir: string, findings: Finding[]): void {
	const testDir = join(pkgDir, 'test');
	const hasTestDir = existsSync(testDir);
	const testFiles = listFilesRec(testDir, '.test.ts');
	const hasTestFiles = testFiles.length > 0;

	// If package uses collection-types standard test utils, consider many methods covered via shared suite
	const hasStandardSuite = (() => {
		if (!hasTestFiles) return false;
		for (const f of testFiles) {
			try {
				const c = readFileSync(f, 'utf-8');
				if (c.includes('runMapTests') || c.includes('runSetTests') || c.includes('runCollectionTests') || c.includes('runListTests') || c.includes('test-utils')) {
					return true;
				}
			} catch {}
		}
		return false;
	})();

	const methods = extractPublicMethods(pkgDir);
	// If no methods found, still check test-random
	if (methods.length === 0) {
		// Try broader: list all export names via rg
		const out = rg('export', join(pkgDir, 'src/public'));
		if (!out.trim() && !hasTestDir) {
			findings.push({
				severity: 'info',
				rule: 'missing-test-file',
				location: toRepoRel(pkgDir),
				evidence: `No public methods found in ${toRepoRel(join(pkgDir, 'src/public'))}`,
				suggestedFix: `Add public methods per AGENTS.md:480-518 §7`,
				normativeRef: 'AGENTS.md:480-518 §7',
			});
		}
	}

	for (const { name, file, line } of methods) {
		// Skip type-only or NonEmpty scaffolding that doesn't need direct test
		if (['Types', 'NonEmpty', 'Builder', 'Context', 'Types', 'Family', 'Capability'].includes(name)) continue;
		if (name.startsWith('_')) continue;
		// Skip very common non-method names that are not part of §7 checklist
		if (['constructor', 'length', 'name', 'prototype'].includes(name)) continue;

		// If package uses standard test suite, many canonical methods are covered via shared utils
		const standardMethods = new Set([
			'filter',
			'map',
			'flatMap',
			'forEach',
			'reduce',
			'find',
			'findEntry',
			'get',
			'has',
			'set',
			'remove',
			'update',
			'modifyAt',
			'updateAt',
			'hasKey',
			'hasValue',
			'getAt',
			'first',
			'last',
			'at',
			'take',
			'drop',
			'slice',
			'span',
			'splitAt',
			'stream',
			'toArray',
			'toString',
			'equals',
			'size',
			'isEmpty',
			'nonEmpty',
			'assumeNonEmpty',
			'toBuilder',
			'from',
			'of',
			'empty',
			'prepend',
			'append',
			'concat',
			'insert',
			'removeAt',
			'collect',
			'range',
		]);
		if (hasStandardSuite && standardMethods.has(name)) {
			continue; // covered via runMapTestsWith etc.
		}

		// Check if test files contain this method name
		let hasCoverage = false;
		let evidence = '';
		if (hasTestFiles) {
			const out = rg(`\\b${name}\\b`, testDir);
			if (out.trim()) {
				// Find a line that looks like a test for this method
				for (const l of out.trim().split('\n')) {
					if (l.includes(`test`) || l.includes(`describe`) || l.includes(`it(`) || l.includes(name)) {
						hasCoverage = true;
						evidence = l.slice(0, 120);
						break;
					}
				}
				if (!hasCoverage) {
					// Still consider covered if any mention
					hasCoverage = true;
					evidence = out.trim().split('\n')[0]!.slice(0, 120);
				}
			}
		}

		if (!hasCoverage) {
			// Determine if method is type-only (e.g. interface method that is type, not runtime)
			// For now, treat all as warn, except if name is type-like (starts with uppercase)
			const isTypeLike = /^[A-Z]/.test(name);
			const severity: Severity = isTypeLike ? 'info' : 'warn';
			const rule = 'missing-unit-test';
			findings.push({
				severity,
				rule,
				location: `${toRepoRel(file)}:${line}`,
				evidence: `rg -n "\\b${name}\\b" ${toRepoRel(testDir)} --no-heading => 0 matches | ${toRepoRel(file)}:${line}: ${name}`,
				suggestedFix: `Add test/${pkgNameFromDir(pkgDir)}.test.ts: test("${name} ...") per AGENTS.md:506`,
				normativeRef: 'AGENTS.md:480-518 §7',
			});
		} else {
			// For covered methods, we could optionally emit info, but we just count for summary
		}
	}

	if (!hasTestDir || !hasTestFiles) {
		// If no test dir/files, the per-method warns already cover, but also add package-level warn if no methods were evaluated
		if (methods.length === 0) {
			findings.push({
				severity: 'warn',
				rule: 'missing-test-file',
				location: toRepoRel(pkgDir),
				evidence: `test/ missing or no *.test.ts in ${toRepoRel(testDir)}`,
				suggestedFix: `Create test/${pkgNameFromDir(pkgDir)}.test.ts per AGENTS.md:79-113`,
				normativeRef: 'AGENTS.md:79-113 §3',
			});
		}
	}
}

function checkTestRandom(pkgDir: string, findings: Finding[]): void {
	const pkgJson = readJsonSafe(join(pkgDir, 'package.json'));
	const hasTestRandomScript = !!(pkgJson?.scripts?.['test:random'] || pkgJson?.scripts?.['test-random']);
	const hasTestRandomDir = existsSync(join(pkgDir, 'test-random'));
	const hasTestRandomFiles = hasTestRandomDir && listFilesRec(join(pkgDir, 'test-random')).length > 0;

	if (hasTestRandomScript || hasTestRandomDir) {
		if (!hasTestRandomFiles) {
			findings.push({
				severity: 'info',
				rule: 'missing-test-random',
				location: toRepoRel(pkgDir),
				evidence: `test-random/ dir exists or scripts has test:random but no files in ${toRepoRel(join(pkgDir, 'test-random'))}`,
				suggestedFix: `Add test-random/*.ts property tests per Q11`,
				normativeRef: 'AGENTS.md:79-113 §3',
			});
		}
		// If has files, no finding (covered)
	}
	// If no infra, skip (don't flag info)
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
	lines.push(`# audit-tests — ${target}`);
	lines.push('');
	lines.push('## Summary');
	lines.push('');
	if (findings.length === 0) {
		lines.push(`All public methods have unit tests. Audited ${totalMethods} methods, covered ${covered}/${totalMethods}. Counts: 0 warn, 0 info.`);
	} else {
		lines.push(`Audited ${totalMethods} public methods, covered ${covered}/${totalMethods}. Found ${findings.length} gaps. Counts: 0 error, ${counts.warn} warn, ${counts.info} info.`);
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
		lines.push('- No action required — all public methods have unit tests.');
	} else {
		if (counts.warn > 0) lines.push(`- Add ${counts.warn} missing unit test(s) in test/*.test.ts per AGENTS.md:506 and re-run audit-tests`);
		if (counts.info > 0) lines.push(`- ${counts.info} info — test-random or type-only gaps, add test-random/*.ts if package has infra (Q11)`);
		lines.push(`- Re-run \`bun .opencode/skills/audit-tests/scripts/run.ts -- ${target}\` to verify`);
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
		console.error('Usage: bun .opencode/skills/audit-tests/scripts/run.ts -- <pkg> [--workspace] [--out <path>]');
		process.exit(1);
	}

	const allFindings: Finding[] = [];
	let reportTarget = workspace ? 'workspace' : toRepoRel(pkgDirs[0]!);
	let totalMethods = 0;
	let covered = 0;

	if (workspace) {
		for (const dir of pkgDirs) {
			const findings: Finding[] = [];
			const methods = extractPublicMethods(dir);
			totalMethods += methods.length;
			checkUnitTests(dir, findings);
			checkTestRandom(dir, findings);
			// For workspace, count covered as total - warn
			const warnCount = findings.filter((f) => f.rule === 'missing-unit-test' && f.severity === 'warn').length;
			covered += methods.length - warnCount;
			for (const f of findings) {
				allFindings.push({ ...f, location: `${toRepoRel(dir)}: ${f.location}` });
			}
		}
		reportTarget = 'workspace';
	} else {
		const dir = pkgDirs[0]!;
		const methods = extractPublicMethods(dir);
		totalMethods = methods.length;
		checkUnitTests(dir, allFindings);
		checkTestRandom(dir, allFindings);
		const warnCount = allFindings.filter((f) => f.rule === 'missing-unit-test' && f.severity === 'warn').length;
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
	// Never error for audit (warn/info only), exit 0
	process.exit(0);
}

export { extractPublicMethods, checkUnitTests, checkTestRandom, generateReport, discoverPackages };
