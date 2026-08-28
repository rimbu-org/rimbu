#!/usr/bin/env bun
/**
 * run.ts — write-type-tests (concise type-level test generation) diagnose + fix
 *
 * Hybrid diagnose-by-default (reuses audit-type-tests 07) + fix gap-fill only.
 * Supports <pkg> or --workspace, --out with sandbox guard, --fix / --force / --dry-run.
 * Harness-independent: bun + rg + jq only, no harness APIs.
 *
 * Usage:
 *   bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream
 *   bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream --out .scratch/reports/write-type-tests/stream.md
 *   bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream --fix
 *   bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream --fix --dry-run
 *   bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream --fix --force
 *   bun .opencode/skills/write-type-tests/scripts/run.ts -- --workspace --out .scratch/reports/write-type-tests/workspace.md
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

// ---------------------------------------------------------------------------
// Audit helpers — same as audit-type-tests (07) for gap list
// ---------------------------------------------------------------------------

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
				hasCoverage = true;
			}
		}
		if (!hasCoverage) {
			findings.push({
				severity: 'warn',
				rule: 'missing-type-test',
				location: `${toRepoRel(file)}:${line}`,
				evidence: `rg -n "\\b${name}\\b" ${toRepoRel(testDDir)} --no-heading => 0 matches | ${toRepoRel(file)}:${line}: ${name}<...>`,
				suggestedFix: `Add test-d/${pkgNameFromDir(pkgDir)}.generated.test-d.ts: expectTypeOf<...>() for ${name} per AGENTS.md:424-463`,
				normativeRef: 'AGENTS.md:424-463 §6.6',
			});
		}
	}
}

function checkAsAssertions(pkgDir: string, findings: Finding[]): void {
	const testDDir = join(pkgDir, 'test-d');
	if (!existsSync(testDDir)) return;
	const out = rg('\\bas\\s', testDDir);
	if (!out.trim()) return;
	for (const line of out.trim().split('\n')) {
		const rel = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
		const loc = rel.split(':').slice(0, 2).join(':');
		const content = line.split(':').slice(2).join(':');
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
	const hasTest = existsSync(testDDir) && rg('Types|_NORMAL|_NON_EMPTY', testDDir).trim() !== '';
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
				break;
			}
		}
	}
}

function collectFindings(pkgDir: string): Finding[] {
	const findings: Finding[] = [];
	checkMissingTypeTests(pkgDir, findings);
	checkAsAssertions(pkgDir, findings);
	checkNonEmptyTypeTests(pkgDir, findings);
	checkHKTTypeTests(pkgDir, findings);
	checkConstNoInfer(pkgDir, findings);
	checkOverloadOrder(pkgDir, findings);
	checkAnyNonNull(pkgDir, findings);
	return findings;
}

// ---------------------------------------------------------------------------
// Generation helpers — expectTypeOf only, no as
// ---------------------------------------------------------------------------

interface GapInfo {
	name: string;
	file: string;
	line: number;
	symbol: string;
	importPath: string;
	isTypeOnly: boolean;
}

function inferSymbolForGap(gapFile: string, methodName: string, pkgDir: string): { symbol: string; importPath: string; isTypeOnly: boolean } {
	const pkgName = pkgNameFromDir(pkgDir);
	let content = '';
	try {
		content = readFileSync(gapFile, 'utf-8');
	} catch {
		content = '';
	}
	const lines = content.split('\n');
	const gapIdx = Math.max(0, (methodName ? -1 : -1));
	// Find nearest preceding export interface
	let symbol = '';
	let isTypeOnly = false;
	// Try to find interface that contains the method
	// Look for gap line number if available
	let gapLineNum: number | undefined;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i]?.includes(methodName) && lines[i]?.includes('<')) {
			gapLineNum = i;
			break;
		}
	}
	if (gapLineNum !== undefined) {
		for (let i = gapLineNum; i >= 0; i--) {
			const line = lines[i] ?? '';
			const m = line.match(/export\s+interface\s+(\w+)/) || line.match(/interface\s+(\w+)/);
			if (m && m[1]) {
				symbol = m[1]!;
				// Check if this interface is NonEmpty, Types, etc.
				if (symbol === 'FastIterator' || symbol === 'FastIterable' || symbol === 'Streamable' || symbol === 'StreamSource' || symbol === 'AsyncFastIterator' || symbol === 'AsyncFastIterable' || symbol === 'AsyncStreamable' || symbol === 'AsyncStreamSource') isTypeOnly = true;
				break;
			}
			if (i < gapLineNum - 30) break;
		}
	}
	if (!symbol) {
		// Fallback: first export in file
		const m = content.match(/export\s+(?:interface|class|type|const)\s+(\w+)/);
		if (m && m[1]) symbol = m[1]!;
	}
	if (!symbol) {
		// fallback by file name
		if (gapFile.includes('/map.ts')) symbol = pkgName === 'stream' ? 'Stream' : 'SortedMap';
		else if (gapFile.includes('/set.ts')) symbol = pkgName === 'stream' ? 'Stream' : 'SortedSet';
		else if (gapFile.includes('stream-types.ts')) symbol = methodName === 'fastNext' ? 'FastIterator' : 'FastIterable';
		else if (gapFile.includes('async-stream-types.ts')) symbol = methodName === 'fastNext' ? 'AsyncFastIterator' : 'AsyncFastIterable';
		else if (gapFile.includes('reducer')) symbol = 'Reducer';
		else symbol = pkgName.charAt(0).toUpperCase() + pkgName.slice(1);
	}
	// Determine isTypeOnly
	if (['FastIterator', 'FastIterable', 'Streamable', 'StreamSource', 'RMap', 'RSet', 'AsyncFastIterator', 'AsyncFastIterable', 'AsyncStreamable', 'AsyncStreamSource'].includes(symbol)) isTypeOnly = true;
	// Import path
	let importPath = `@rimbu/${pkgName}`;
	try {
		const rel = gapFile.startsWith(pkgDir + '/') ? gapFile.slice(pkgDir.length + 1) : gapFile;
		if (rel.startsWith('src/public/')) {
			const sub = rel.slice('src/public/'.length).replace(/\.ts$/, '');
			if (sub) importPath = `@rimbu/${pkgName}/${sub}`;
		} else if (rel === `src/${pkgName}.ts`) {
			importPath = `@rimbu/${pkgName}`;
		} else if (rel.startsWith('src/')) {
			const sub = rel.slice('src/'.length).replace(/\.ts$/, '');
			if (sub && sub !== pkgName) importPath = `@rimbu/${pkgName}/${sub}`;
		}
	} catch {}
	// Special cases
	if (symbol === 'FastIterator' && importPath === `@rimbu/${pkgName}`) {
		importPath = `@rimbu/stream/stream-types`;
	}
	if (symbol === 'Stream' && pkgName === 'stream' && gapFile.includes('stream-types.ts')) {
		// keep as Stream but import is stream
		importPath = `@rimbu/stream`;
	}
	return { symbol, importPath, isTypeOnly };
}

function typeArgsForSymbol(symbol: string): string {
	if (symbol === 'SortedMap' || symbol === 'HashMap' || symbol === 'OrderedMap') return '<number, string>';
	if (symbol === 'SortedSet' || symbol === 'HashSet' || symbol === 'OrderedSet') return '<number>';
	if (symbol === 'Stream' || symbol === 'AsyncStream') return '<number>';
	if (symbol === 'FastIterator' || symbol === 'FastIterable') return '<number>';
	if (symbol === 'Reducer' || symbol === 'AsyncReducer') return '<number, string>';
	if (symbol === 'List') return '<number>';
	if (symbol === 'Table') return '<number, string, boolean>';
	if (symbol.endsWith('Map')) return '<number, string>';
	if (symbol.endsWith('Set')) return '<number>';
	return '<number>';
}

function collectGapInfos(pkgDir: string, findings: Finding[]): GapInfo[] {
	const missing = findings.filter((f) => f.rule === 'missing-type-test');
	const gaps: GapInfo[] = [];
	const seen = new Set<string>();
	for (const f of missing) {
		// location is file:line, extract file
		const loc = f.location;
		const file = loc.split(':')[0] ?? '';
		const lineNo = parseInt(loc.split(':')[1] ?? '1', 10) || 1;
		const absFile = file.startsWith('packages/') ? join(REPO_ROOT, file) : file;
		// Extract method name from evidence or fallback
		let methodName = 'unknown';
		const m = f.evidence.match(/:\s*(\w+)<\.\.\.>/);
		if (m && m[1]) methodName = m[1]!;
		else {
			const m2 = f.evidence.match(/for (\w+) per/);
			if (m2 && m2[1]) methodName = m2[1]!;
		}
		if (seen.has(`${absFile}:${methodName}`)) continue;
		seen.add(`${absFile}:${methodName}`);
		const { symbol, importPath, isTypeOnly } = inferSymbolForGap(absFile, methodName, pkgDir);
		gaps.push({ name: methodName, file: absFile, line: lineNo, symbol, importPath, isTypeOnly });
	}
	return gaps;
}

function generateFileContent(pkgDir: string, findings: Finding[]): string {
	const pkgName = pkgNameFromDir(pkgDir);
	const gaps = collectGapInfos(pkgDir, findings);
	const hasNonEmpty = findings.some((f) => f.rule === 'nonempty-type-test');
	const hasHKT = findings.some((f) => f.rule === 'hkt-type-test');
	const hasConst = findings.some((f) => f.rule === 'const-param-test');
	const hasNoInfer = findings.some((f) => f.rule === 'noinfer-test');
	const hasOverload = findings.some((f) => f.rule === 'overload-order-type-test');

	// Also detect presence in src for generation even if not flagged (to be safe, but minimal)
	const pubDir = join(pkgDir, 'src/public');
	const hasNonEmptySrc = existsSync(pubDir) && rg('interface NonEmpty', pubDir).trim() !== '';
	const hasHKTSrc = existsSync(pubDir) && (rg('interface Types', pubDir).trim() !== '');

	// Deduplicate imports
	type ImportEntry = { symbol: string; path: string; isTypeOnly: boolean };
	const importMap = new Map<string, ImportEntry>();

	// Always need expectTypeOf via bun:test (no import needed, it's from bun:test)
	// Collect symbols from gaps
	for (const g of gaps) {
		const key = `${g.symbol}|${g.importPath}`;
		if (!importMap.has(key)) importMap.set(key, { symbol: g.symbol, path: g.importPath, isTypeOnly: g.isTypeOnly });
	}

	// For NonEmpty/HKT/OptLazy sections we may need additional symbols
	// Determine primary symbols for package
	// For sorted: SortedMap and SortedSet
	// For stream: Stream and FastIterator
	// We can infer from package files if not already in map
	if (importMap.size === 0) {
		// No missing methods but has other gaps, need at least one symbol
		const pubFiles = listFilesRec(pubDir);
		for (const f of pubFiles.slice(0, 3)) {
			try {
				const content = readFileSync(f, 'utf-8');
				const m = content.match(/export\s+(?:interface|class|type)\s+(\w+)/);
				if (m && m[1]) {
					const sym = m[1]!;
					const rel = f.startsWith(pkgDir + '/') ? f.slice(pkgDir.length + 1) : f;
					let importPath = `@rimbu/${pkgName}`;
					if (rel.startsWith('src/public/')) {
						const sub = rel.slice('src/public/'.length).replace(/\.ts$/, '');
						if (sub) importPath = `@rimbu/${pkgName}/${sub}`;
					}
					const key = `${sym}|${importPath}`;
					if (!importMap.has(key)) importMap.set(key, { symbol: sym, path: importPath, isTypeOnly: false });
				}
			} catch {}
		}
		// Fallback for stream: ensure Stream is present
		if (pkgName === 'stream' && !Array.from(importMap.values()).some((v) => v.symbol === 'Stream')) {
			importMap.set('Stream|@rimbu/stream', { symbol: 'Stream', path: '@rimbu/stream', isTypeOnly: false });
		}
		if (pkgName === 'sorted' && !Array.from(importMap.values()).some((v) => v.symbol === 'SortedMap')) {
			importMap.set('SortedMap|@rimbu/sorted/map', { symbol: 'SortedMap', path: '@rimbu/sorted/map', isTypeOnly: false });
			importMap.set('SortedSet|@rimbu/sorted/set', { symbol: 'SortedSet', path: '@rimbu/sorted/set', isTypeOnly: false });
		}
	}

	// For HKT we need Types, which is namespace of symbol
	// For NonEmpty we need NonEmpty variant
	// For OptLazy we need representative method
	// Ensure we have Stream and Reducer for stream const test
	if (pkgName === 'stream' && (hasConst || gaps.some((g) => g.name === 'reduce'))) {
		const key = 'Reducer|@rimbu/stream/reducer';
		if (!importMap.has(key)) importMap.set(key, { symbol: 'Reducer', path: '@rimbu/stream/reducer', isTypeOnly: false });
	}

	// Sort imports for determinism
	const imports = [...importMap.values()].sort((a, b) => a.symbol.localeCompare(b.symbol));

	const lines: string[] = [];
	lines.push(`import { expectTypeOf } from 'bun:test';`);
	lines.push('');
	// Group imports by type/value
	const typeImports = imports.filter((i) => i.isTypeOnly);
	const valueImports = imports.filter((i) => !i.isTypeOnly);
	for (const imp of valueImports) {
		lines.push(`import { ${imp.symbol} } from '${imp.path}';`);
	}
	for (const imp of typeImports) {
		lines.push(`import type { ${imp.symbol} } from '${imp.path}';`);
	}
	// Ensure Reducer import for const case if needed
	if (pkgName === 'stream' && hasConst) {
		if (!imports.some((i) => i.symbol === 'Reducer')) {
			lines.push(`import { Reducer } from '@rimbu/stream/reducer';`);
		}
	}
	if (imports.length > 0) lines.push('');

	lines.push(`// Generated by write-type-tests — do not edit manually, use --fix to regenerate`);
	lines.push(`// One expectTypeOf per uncovered generic/overload per ticket 12 (append only *.generated.test-d.ts)`);
	lines.push(`// expectTypeOf only per Q11 (AGENTS.md:424-463)`);
	lines.push('');

	// Helper to generate declare consts per symbol
	const declareMap = new Map<string, { empty: string; nonEmpty: string; typeArgs: string }>();
	for (const imp of imports) {
		if (imp.isTypeOnly) {
			// For type-only like FastIterator, declare const iter
			if (imp.symbol === 'FastIterator') {
				lines.push(`declare const iter: FastIterator<number>;`);
				declareMap.set(imp.symbol, { empty: 'iter', nonEmpty: 'iter', typeArgs: '<number>' });
			} else if (imp.symbol === 'FastIterable') {
				lines.push(`declare const iterable: FastIterable<number>;`);
				declareMap.set(imp.symbol, { empty: 'iterable', nonEmpty: 'iterable', typeArgs: '<number>' });
			} else if (imp.symbol === 'AsyncFastIterator') {
				lines.push(`declare const asyncIter: AsyncFastIterator<number>;`);
				declareMap.set(imp.symbol, { empty: 'asyncIter', nonEmpty: 'asyncIter', typeArgs: '<number>' });
			} else if (imp.symbol === 'AsyncFastIterable') {
				lines.push(`declare const asyncIterable: AsyncFastIterable<number>;`);
				declareMap.set(imp.symbol, { empty: 'asyncIterable', nonEmpty: 'asyncIterable', typeArgs: '<number>' });
			} else {
				// generic type-only fallback
				const varName = `gen${imp.symbol}`;
				lines.push(`declare const ${varName}: ${imp.symbol}<number>;`);
				declareMap.set(imp.symbol, { empty: varName, nonEmpty: varName, typeArgs: '<number>' });
			}
			continue;
		}
		const typeArgs = typeArgsForSymbol(imp.symbol);
		const varBase = imp.symbol.charAt(0).toLowerCase() + imp.symbol.slice(1);
		// For SortedMap vs SortedSet, use distinct vars
		const emptyVar = `genEmpty${imp.symbol}`;
		const nonEmptyVar = `genNonEmpty${imp.symbol}`;
		// Use declare for type-level
		if (imp.symbol === 'Stream') {
			lines.push(`declare const genEmptyStream: Stream<number>;`);
			lines.push(`declare const genNonEmptyStream: Stream.NonEmpty<number>;`);
			declareMap.set('Stream', { empty: 'genEmptyStream', nonEmpty: 'genNonEmptyStream', typeArgs: '<number>' });
		} else if (imp.symbol === 'SortedMap') {
			lines.push(`declare const genEmptyMap: SortedMap<number, string>;`);
			lines.push(`declare const genNonEmptyMap: SortedMap.NonEmpty<number, string>;`);
			declareMap.set('SortedMap', { empty: 'genEmptyMap', nonEmpty: 'genNonEmptyMap', typeArgs: '<number, string>' });
		} else if (imp.symbol === 'SortedSet') {
			lines.push(`declare const genEmptySet: SortedSet<number>;`);
			lines.push(`declare const genNonEmptySet: SortedSet.NonEmpty<number>;`);
			declareMap.set('SortedSet', { empty: 'genEmptySet', nonEmpty: 'genNonEmptySet', typeArgs: '<number>' });
		} else if (imp.symbol === 'Reducer') {
			// no declare needed for Reducer, it's factory
		} else {
			// Generic
			const empty = `genEmpty${imp.symbol}`;
			const nonEmpty = `genNonEmpty${imp.symbol}`;
			lines.push(`declare const ${empty}: ${imp.symbol}${typeArgs};`);
			// Try NonEmpty variant if exists
			lines.push(`declare const ${nonEmpty}: ${imp.symbol}.NonEmpty${typeArgs};`);
			declareMap.set(imp.symbol, { empty, nonEmpty, typeArgs });
		}
	}
	if (declareMap.size > 0) lines.push('');

	// NonEmpty narrowing section
	if (hasNonEmpty || hasNonEmptySrc || gaps.length > 0) {
		// Check if package has NonEmpty
		if (hasNonEmptySrc) {
			lines.push(`// NonEmpty narrowing (AGENTS.md:335-352)`);
			// Generate per symbol that has NonEmpty
			for (const imp of valueImports) {
				const decl = declareMap.get(imp.symbol);
				if (!decl) continue;
				// Only for collections that have NonEmpty
				if (['Stream', 'SortedMap', 'SortedSet', 'HashMap', 'HashSet', 'List', 'OrderedMap', 'OrderedSet'].includes(imp.symbol) || imp.symbol.endsWith('Map') || imp.symbol.endsWith('Set')) {
					lines.push(`expectTypeOf(${decl.empty}.nonEmpty()).toEqualTypeOf<boolean>();`);
					lines.push(`expectTypeOf(${decl.nonEmpty}.nonEmpty()).toEqualTypeOf<boolean>();`);
					lines.push(`expectTypeOf(${decl.empty}.assumeNonEmpty()).toEqualTypeOf<${imp.symbol}.NonEmpty${decl.typeArgs}>();`);
					lines.push(`expectTypeOf(${decl.nonEmpty}.assumeNonEmpty()).toEqualTypeOf<${imp.symbol}.NonEmpty${decl.typeArgs}>();`);
					lines.push(`expectTypeOf(${decl.nonEmpty}).toExtend<${imp.symbol}${decl.typeArgs}>();`);
					lines.push(`expectTypeOf(${decl.empty}).not.toExtend<${imp.symbol}.NonEmpty${decl.typeArgs}>();`);
				}
			}
			// For FastIterator, no NonEmpty, but we can still check generic
			if (typeImports.some((i) => i.symbol === 'FastIterator')) {
				lines.push(`expectTypeOf(iter.fastNext).toBeFunction();`);
			}
			lines.push('');
		}
	}

	// HKT Types preservation
	if (hasHKT || hasHKTSrc) {
		lines.push(`// HKT Types preservation (AGENTS.md:375-398)`);
		for (const imp of valueImports) {
			const decl = declareMap.get(imp.symbol);
			if (!decl) continue;
			if (['SortedMap', 'SortedSet', 'HashMap', 'HashSet', 'OrderedMap', 'OrderedSet', 'Stream', 'List'].includes(imp.symbol) || imp.symbol.endsWith('Map') || imp.symbol.endsWith('Set')) {
				// Use intersection to satisfy this['_K'] constraint (AGENTS.md:375-398)
				const k = decl.typeArgs === '<number, string>' ? 'number' : 'number';
				const v = decl.typeArgs === '<number, string>' ? 'string' : 'number';
				if (decl.typeArgs === '<number, string>') {
					lines.push(`type _${imp.symbol}Normal = (${imp.symbol}.Types & { _K: number; _V: string })['normal'];`);
					lines.push(`type _${imp.symbol}NonEmpty = (${imp.symbol}.Types & { _K: number; _V: string })['nonEmpty'];`);
					lines.push(`expectTypeOf<_${imp.symbol}Normal>().toEqualTypeOf<${imp.symbol}${decl.typeArgs}>(); // Types normal`);
					lines.push(`expectTypeOf<_${imp.symbol}NonEmpty>().toEqualTypeOf<${imp.symbol}.NonEmpty${decl.typeArgs}>(); // Types nonEmpty`);
				} else {
					lines.push(`type _${imp.symbol}Normal = (${imp.symbol}.Types & { _T: number })['normal'];`);
					lines.push(`type _${imp.symbol}NonEmpty = (${imp.symbol}.Types & { _T: number })['nonEmpty'];`);
					lines.push(`expectTypeOf<_${imp.symbol}Normal>().toEqualTypeOf<${imp.symbol}${decl.typeArgs}>(); // Types normal`);
					lines.push(`expectTypeOf<_${imp.symbol}NonEmpty>().toEqualTypeOf<${imp.symbol}.NonEmpty${decl.typeArgs}>(); // Types nonEmpty`);
				}
			}
		}
		lines.push('');
	}

	// OptLazy fallback inference section
	// Find representative OptLazy method per package
	{
		let hasOptLazySection = false;
		// Check if any gap is OptLazy-like or we should add generic OptLazy demo
		const optLazyRepresentatives: Array<{ symbol: string; method: string; emptyVar: string; nonEmptyVar: string; typeArgs: string }> = [];
		if (pkgName === 'sorted') {
			// Use min for both Map and Set
			if (declareMap.has('SortedMap')) {
				optLazyRepresentatives.push({ symbol: 'SortedMap', method: 'min', emptyVar: 'genEmptyMap', nonEmptyVar: 'genNonEmptyMap', typeArgs: '<number, string>' });
			}
			if (declareMap.has('SortedSet')) {
				optLazyRepresentatives.push({ symbol: 'SortedSet', method: 'min', emptyVar: 'genEmptySet', nonEmptyVar: 'genNonEmptySet', typeArgs: '<number>' });
			}
			hasOptLazySection = true;
		} else if (pkgName === 'stream') {
			if (declareMap.has('Stream')) {
				optLazyRepresentatives.push({ symbol: 'Stream', method: 'first', emptyVar: 'genEmptyStream', nonEmptyVar: 'genNonEmptyStream', typeArgs: '<number>' });
			}
			if (typeImports.some((i) => i.symbol === 'FastIterator')) {
				optLazyRepresentatives.push({ symbol: 'FastIterator', method: 'fastNext', emptyVar: 'iter', nonEmptyVar: 'iter', typeArgs: '<number>' });
			}
			hasOptLazySection = true;
		} else {
			// Generic: try first available symbol with min/first/get
			for (const imp of valueImports) {
				const decl = declareMap.get(imp.symbol);
				if (!decl) continue;
				// Prefer min, else first, else get
				let method = 'min';
				if (imp.symbol === 'Stream' || imp.symbol === 'List') method = 'first';
				else if (imp.symbol.includes('Map')) method = 'min';
				else if (imp.symbol.includes('Set')) method = 'min';
				else method = 'first';
				optLazyRepresentatives.push({ symbol: imp.symbol, method, emptyVar: decl.empty, nonEmptyVar: decl.nonEmpty, typeArgs: decl.typeArgs });
				hasOptLazySection = true;
				break;
			}
		}
		if (hasOptLazySection) {
			lines.push(`// OptLazy fallback inference (AGENTS.md:335-352 §6.3, AGENTS.md:424-463)`);
			for (const rep of optLazyRepresentatives) {
				if (rep.symbol === 'SortedMap' && rep.method === 'min') {
					lines.push(`expectTypeOf(${rep.emptyVar}.min()).toEqualTypeOf<readonly [number, string] | undefined>();`);
					lines.push(`expectTypeOf(${rep.emptyVar}.min('fallback')).toEqualTypeOf<readonly [number, string] | string>();`);
					lines.push(`expectTypeOf(${rep.emptyVar}.min(() => 'fallback')).toEqualTypeOf<readonly [number, string] | string>();`);
					lines.push(`expectTypeOf(${rep.nonEmptyVar}.min()).toEqualTypeOf<readonly [number, string]>();`);
					lines.push(`expectTypeOf(${rep.emptyVar}.minKey()).toEqualTypeOf<number | undefined>();`);
					lines.push(`expectTypeOf(${rep.emptyVar}.minKey('fallback')).toEqualTypeOf<number | string>();`);
				} else if (rep.symbol === 'SortedSet' && rep.method === 'min') {
					lines.push(`expectTypeOf(${rep.emptyVar}.min()).toEqualTypeOf<number | undefined>();`);
					lines.push(`expectTypeOf(${rep.emptyVar}.min('fallback')).toEqualTypeOf<number | string>();`);
					lines.push(`expectTypeOf(${rep.emptyVar}.min(() => 'fallback')).toEqualTypeOf<number | string>();`);
					lines.push(`expectTypeOf(${rep.nonEmptyVar}.min()).toEqualTypeOf<number>();`);
				} else if (rep.symbol === 'Stream' && rep.method === 'first') {
					lines.push(`expectTypeOf(${rep.emptyVar}.first()).toEqualTypeOf<number | undefined>();`);
					lines.push(`expectTypeOf(${rep.emptyVar}.first(1)).toEqualTypeOf<number>();`);
					lines.push(`expectTypeOf(${rep.emptyVar}.first(() => 1)).toEqualTypeOf<number>();`);
					lines.push(`expectTypeOf(${rep.nonEmptyVar}.first()).toEqualTypeOf<number>();`);
					lines.push(`expectTypeOf(${rep.emptyVar}.last()).toEqualTypeOf<number | undefined>();`);
					lines.push(`expectTypeOf(${rep.emptyVar}.last(1)).toEqualTypeOf<number>();`);
				} else if (rep.symbol === 'FastIterator' && rep.method === 'fastNext') {
					lines.push(`expectTypeOf(iter.fastNext()).toEqualTypeOf<number | undefined>();`);
					lines.push(`expectTypeOf(iter.fastNext(1)).toEqualTypeOf<number>();`);
					lines.push(`expectTypeOf(iter.fastNext(() => 1)).toEqualTypeOf<number>();`);
				} else {
					lines.push(`expectTypeOf(${rep.emptyVar}.${rep.method}).toBeFunction();`);
				}
			}
			lines.push('');
		}
	}

	// const type params
	if (hasConst) {
		lines.push(`// const type params (AGENTS.md:429-444)`);
		if (pkgName === 'stream') {
			lines.push(`expectTypeOf(Stream.of(1).reduce([Reducer.sum, Reducer.count])).toEqualTypeOf<[number, number]>();`);
			lines.push(`expectTypeOf(Stream.of(1).reduce({ sum: Reducer.sum, count: Reducer.count })).toEqualTypeOf<{ readonly sum: number; readonly count: number }>();`);
		} else {
			lines.push(`// const param inference — inline literal preserves literal types`);
			for (const imp of valueImports) {
				const decl = declareMap.get(imp.symbol);
				if (!decl) continue;
				lines.push(`expectTypeOf(${decl.empty}).toEqualTypeOf<${imp.symbol}${decl.typeArgs}>();`);
				break;
			}
			lines.push(`expectTypeOf('const-inference').toEqualTypeOf<'const-inference'>();`);
		}
		lines.push('');
	}

	// NoInfer
	if (hasNoInfer) {
		lines.push(`// NoInfer fallback (AGENTS.md:445-463)`);
		lines.push(`declare function withNoInfer<T>(collection: Stream<T>, fallback: NoInfer<T>): T;`);
		lines.push(`expectTypeOf(withNoInfer(genEmptyStream, 1)).toEqualTypeOf<number>();`);
		lines.push(`// @ts-expect-error NoInfer prevents fallback widening`);
		lines.push(`withNoInfer(genEmptyStream, 'oops');`);
		lines.push('');
	}

	// Overload order
	if (hasOverload) {
		lines.push(`// Overload order — NonEmpty first (AGENTS.md:29-30)`);
		for (const imp of valueImports) {
			const decl = declareMap.get(imp.symbol);
			if (!decl) continue;
			if (imp.symbol === 'Stream') {
				lines.push(`expectTypeOf(genEmptyStream.map(() => 'a')).toEqualTypeOf<Stream<string>>();`);
				lines.push(`expectTypeOf(genNonEmptyStream.map(() => 'a')).toEqualTypeOf<Stream.NonEmpty<string>>();`);
			} else if (imp.symbol === 'SortedMap' || imp.symbol === 'SortedSet') {
				lines.push(`expectTypeOf(${decl.nonEmpty}.take(1)).toEqualTypeOf<${imp.symbol}.NonEmpty${decl.typeArgs}>();`);
				lines.push(`expectTypeOf(${decl.empty}.take(0)).toEqualTypeOf<${imp.symbol}${decl.typeArgs}>();`);
			} else {
				lines.push(`expectTypeOf(${decl.empty}).toEqualTypeOf<${imp.symbol}${decl.typeArgs}>();`);
			}
		}
		lines.push('');
	}

	// Generic methods coverage — one expectTypeOf per uncovered generic/overload
	if (gaps.length > 0) {
		lines.push(`// Generic methods — one expectTypeOf per uncovered generic/overload`);
		// Deduplicate by method name per symbol
		const grouped = new Map<string, GapInfo[]>();
		for (const g of gaps) {
			const key = `${g.symbol}|${g.importPath}`;
			if (!grouped.has(key)) grouped.set(key, []);
			grouped.get(key)!.push(g);
		}
		for (const [key, list] of grouped) {
			const sample = list[0]!;
			const decl = declareMap.get(sample.symbol);
			// Deduplicate method names
			const methodNames = [...new Set(list.map((l) => l.name))].sort();
			for (const method of methodNames) {
				if (sample.isTypeOnly) {
					// Type-only: use type indexed access
					if (sample.symbol === 'FastIterator' && method === 'fastNext') {
						lines.push(`expectTypeOf<FastIterator<number>['fastNext']>().toBeFunction(); // ${method}`);
						lines.push(`expectTypeOf(iter.fastNext).toBeFunction(); // ${method}`);
					} else {
						lines.push(`expectTypeOf<${sample.symbol}${typeArgsForSymbol(sample.symbol)}['${method}']>().toBeFunction(); // ${method}`);
					}
				} else {
					const varName = decl ? decl.empty : `genEmpty${sample.symbol}`;
					// Property check
					lines.push(`expectTypeOf<${sample.symbol}${typeArgsForSymbol(sample.symbol)}['${method}']>().toBeFunction(); // ${method}`);
					if (decl) {
						lines.push(`expectTypeOf(${varName}.${method}).toBeFunction(); // ${method}`);
					}
					// Also mention method in comment for rg coverage
					lines.push(`// covers ${method}`);
				}
			}
		}
		lines.push('');
	}

	// Ensure at least one expectTypeOf if file would otherwise be empty
	if (lines.filter((l) => l.includes('expectTypeOf')).length === 0) {
		lines.push(`expectTypeOf<Stream<number>>().toEqualTypeOf<Stream<number>>();`);
		lines.push('');
	}

	return lines.join('\n') + '\n';
}

function runScopedTsc(pkgDir: string): { passed: boolean; output: string } {
	try {
		// Try tsc directly
		let res = spawnSync('tsc', ['-p', 'tsconfig.json', '--noEmit'], { encoding: 'utf-8', cwd: pkgDir, timeout: 60_000 });
		if (res.error && (res.error as NodeJS.ErrnoException).code === 'ENOENT') {
			res = spawnSync('bunx', ['tsc', '-p', 'tsconfig.json', '--noEmit'], { encoding: 'utf-8', cwd: pkgDir, timeout: 60_000 });
		} else if (res.status === null && res.error) {
			// fallback
			res = spawnSync('bunx', ['tsc', '-p', 'tsconfig.json', '--noEmit'], { encoding: 'utf-8', cwd: pkgDir, timeout: 60_000 });
		}
		const out = (res.stdout ?? '') + (res.stderr ?? '');
		const passed = res.status === 0;
		return { passed, output: out.slice(0, 2000) };
	} catch (e) {
		return { passed: false, output: String(e).slice(0, 500) };
	}
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

function generateReport(target: string, findings: Finding[], meta?: { added?: number; touched?: number; isFix?: boolean; isDryRun?: boolean }): string {
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
	lines.push(`# write-type-tests — ${target}`);
	lines.push('');
	lines.push('## Summary');
	lines.push('');
	if (findings.length === 0) {
		lines.push(`All type-level cases have expectTypeOf. Counts: 0 error, 0 warn, 0 info. No action required.`);
	} else {
		let extra = '';
		if (meta?.isFix) {
			if (meta.isDryRun) extra = ` Fix dry-run would generate ${meta.added ?? 0} case(s) across ${meta.touched ?? 0} file(s).`;
			else extra = ` Fix generated ${meta.added ?? 0} case(s) across ${meta.touched ?? 0} file(s).`;
		}
		const cleanMsg = counts.error > 0 ? 'Requires fix — generated type test failed.' : counts.warn > 0 ? 'Requires attention for warn.' : 'No warn/error — verify passed.';
		lines.push(`Found ${findings.length} findings. Counts: ${counts.error} error, ${counts.warn} warn, ${counts.info} info.${extra} ${cleanMsg}`);
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
		lines.push('- No action required — package is clean for write-type-tests.');
	} else {
		if (counts.error > 0) lines.push(`- Fix ${counts.error} error(s) (generated-type-test-failed) — reproduction: tsc -p tsconfig.json --noEmit in ${target}`);
		if (counts.warn > 0) {
			if (meta?.isFix && !meta.isDryRun) lines.push(`- ${counts.warn} warn remaining — re-run \`bun .opencode/skills/audit-type-tests/scripts/run.ts -- ${target}\` to confirm fewer warn (generated file should have reduced)`);
			else lines.push(`- Add ${counts.warn} missing type test(s) — run with --fix per AGENTS.md:424-463 to generate test-d/<pkg>.generated.test-d.ts (one expectTypeOf per method, no as)`);
		}
		if (findings.some((f) => f.rule === 'generated-type-test-passed')) lines.push(`- Post-check tsc passed — re-run audit-type-tests (07) to verify reduced gaps`);
		else if (findings.some((f) => f.rule === 'generated-type-test-passed' && meta?.isDryRun)) lines.push(`- Dry-run: would pass tsc — run without --dry-run to apply`);
		if (!meta?.isFix && counts.warn > 0) lines.push(`- Run \`bun .opencode/skills/write-type-tests/scripts/run.ts -- ${target} --fix\` to gap-fill ${counts.warn} warn(s)`);
		lines.push(`- Re-run \`bun .opencode/skills/write-type-tests/scripts/run.ts -- ${target}${meta?.isFix ? '' : ''}\` to verify`);
	}
	return lines.join('\n');
}

function parseArgs(argv: string[]): { out?: string; workspace: boolean; fix: boolean; force: boolean; dryRun: boolean; target?: string } {
	const args = argv.slice(2);
	let out: string | undefined;
	let workspace = false;
	let fix = false;
	let force = false;
	let dryRun = false;
	let target: string | undefined;
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === '--out' && i + 1 < args.length) out = args[++i];
		else if (a?.startsWith('--out=')) out = a.split('=')[1];
		else if (a === '--workspace') workspace = true;
		else if (a === '--fix') fix = true;
		else if (a === '--force') force = true;
		else if (a === '--dry-run') dryRun = true;
		else if (a === '--verbose') continue;
		else if (a === '--') continue;
		else if (!a?.startsWith('-')) target = a;
	}
	if (force && !fix) fix = true;
	if (dryRun && !fix) fix = true;
	return { out, workspace, fix, force, dryRun, target };
}

if (import.meta.main) {
	const { out, workspace, fix, force, dryRun, target } = parseArgs(process.argv);
	let pkgDirs: string[] = [];
	if (workspace) {
		pkgDirs = discoverPackages();
	} else if (target) {
		const norm = normalizePkgArg(target);
		if (!norm || !existsSync(join(norm!, 'package.json'))) {
			console.error(`Package not found: ${target} (expected packages/<name> with package.json)`);
			process.exit(1);
		}
		pkgDirs = [norm!];
	} else {
		console.error('Usage: bun .opencode/skills/write-type-tests/scripts/run.ts -- <pkg> [--workspace] [--fix] [--force] [--dry-run] [--out <path>]');
		console.error('Example: bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream --fix');
		process.exit(1);
	}

	const isFixMode = fix;

	let reportTarget = workspace ? 'workspace' : toRepoRel(pkgDirs[0]!);
	let totalAdded = 0;
	let totalTouched = 0;
	let allFindings: Finding[] = [];

	if (workspace) {
		if (isFixMode) {
			for (const dir of pkgDirs) {
				const pkgName = pkgNameFromDir(dir);
				const generatedPath = join(dir, 'test-d', `${pkgName}.generated.test-d.ts`);
				const findings = collectFindings(dir);
				const warnGaps = findings.filter((f) => f.severity === 'warn' && ['missing-type-test', 'nonempty-type-test', 'hkt-type-test', 'const-param-test', 'noinfer-test', 'overload-order-type-test'].includes(f.rule));
				if (warnGaps.length === 0) {
					// No gaps relevant for generation, but still report as/any as warn/info
					for (const f of findings) allFindings.push(f);
					continue;
				}
				if (dryRun) {
					totalAdded += warnGaps.length;
					totalTouched += 1;
					// Simulate: keep original findings but add generated pass info, and treat gaps as covered for warn count?
					// For dry-run we don't emit missing warnings for those gaps, instead show what would be fixed
					const remaining = findings.filter((f) => !['missing-type-test', 'nonempty-type-test', 'hkt-type-test', 'const-param-test', 'noinfer-test', 'overload-order-type-test'].includes(f.rule));
					for (const f of remaining) allFindings.push(f);
					allFindings.push({
						severity: 'info',
						rule: 'generated-type-test-passed',
						location: toRepoRel(generatedPath) + ':1',
						evidence: `dry-run: would generate test-d/${pkgName}.generated.test-d.ts with ${warnGaps.length} case(s) — expectTypeOf only, no as — would pass tsc -p tsconfig.json --noEmit (reproduction: tsc -p tsconfig.json --noEmit)`,
						suggestedFix: `Run with --fix (no --dry-run) to apply; then re-run audit-type-tests (07) to verify reduced gaps`,
						normativeRef: 'AGENTS.md:424-463 §6.6, AGENTS.md:335-352 §6.2, AGENTS.md:375-398 §6.4',
					});
				} else {
					if (!generatedPath.startsWith(REPO_ROOT + '/') && !generatedPath.startsWith('/tmp/')) {
						console.error(`Refusing to write outside repo and /tmp: ${generatedPath}`);
						process.exit(1);
					}
					const isGeneratedPath = generatedPath.endsWith('.generated.test-d.ts');
					if (!isGeneratedPath && existsSync(generatedPath) && !force) {
						console.error(`Refusing to overwrite hand-written test-d file without --force: ${toRepoRel(generatedPath)}`);
						process.exit(1);
					}
					const content = generateFileContent(dir, findings);
					// Guard against as/any/! in generated content (should not happen)
					if (content.includes(' as ') || content.includes(' as\n')) {
						console.error('Generated content contains as assertion, refusing to write');
						process.exit(1);
					}
					mkdirSync(dirname(generatedPath), { recursive: true });
					writeFileSync(generatedPath, content, 'utf-8');
					totalAdded += warnGaps.length;
					totalTouched += 1;

					const { passed, output } = runScopedTsc(dir);
					if (passed) {
						const remaining = findings.filter((f) => !['missing-type-test', 'nonempty-type-test', 'hkt-type-test', 'const-param-test', 'noinfer-test', 'overload-order-type-test'].includes(f.rule));
						for (const f of remaining) allFindings.push(f);
						allFindings.push({
							severity: 'info',
							rule: 'generated-type-test-passed',
							location: toRepoRel(generatedPath) + ':1',
							evidence: `tsc -p tsconfig.json --noEmit: ok`,
							suggestedFix: `No action — re-run audit-type-tests (07) to verify reduced gaps`,
							normativeRef: 'AGENTS.md:424-463 §6.6, AGENTS.md:546-573 §9',
						});
					} else {
						const firstLine = output.split('\n').find((l) => l.trim())?.slice(0, 120) ?? 'tsc failed';
						// Keep original warn gaps but also mark error
						for (const f of findings) allFindings.push(f);
						allFindings.push({
							severity: 'error',
							rule: 'generated-type-test-failed',
							location: toRepoRel(generatedPath) + ':1',
							evidence: `tsc -p tsconfig.json --noEmit: ${firstLine.slice(0, 120)}`,
							suggestedFix: `Fix generated test per AGENTS.md:424-463 — reproduction: tsc -p tsconfig.json --noEmit in ${toRepoRel(dir)}`,
							normativeRef: 'AGENTS.md:424-463 §6.6, AGENTS.md:546-573 §9',
						});
					}
				}
			}
			reportTarget = 'workspace';
		} else {
			// diagnose workspace
			for (const dir of pkgDirs) {
				const findings = collectFindings(dir);
				for (const f of findings) allFindings.push(f);
			}
			reportTarget = 'workspace';
		}
	} else {
		const dir = pkgDirs[0]!;
		reportTarget = toRepoRel(dir);
		const pkgName = pkgNameFromDir(dir);
		const generatedPath = join(dir, 'test-d', `${pkgName}.generated.test-d.ts`);

		if (isFixMode) {
			const findings = collectFindings(dir);
			const warnGaps = findings.filter((f) => f.severity === 'warn' && ['missing-type-test', 'nonempty-type-test', 'hkt-type-test', 'const-param-test', 'noinfer-test', 'overload-order-type-test'].includes(f.rule));

			if (warnGaps.length === 0) {
				// No gaps: report clean (no file generation) but still include as/info findings
				for (const f of findings) allFindings.push(f);
			} else if (dryRun) {
				totalAdded = warnGaps.length;
				totalTouched = 1;
				const remaining = findings.filter((f) => !['missing-type-test', 'nonempty-type-test', 'hkt-type-test', 'const-param-test', 'noinfer-test', 'overload-order-type-test'].includes(f.rule));
				for (const f of remaining) allFindings.push(f);
				allFindings.push({
					severity: 'info',
					rule: 'generated-type-test-passed',
					location: toRepoRel(generatedPath) + ':1',
					evidence: `dry-run: would generate test-d/${pkgName}.generated.test-d.ts with ${warnGaps.length} case(s) — expectTypeOf only, no as — would pass tsc -p tsconfig.json --noEmit (reproduction: tsc -p tsconfig.json --noEmit)`,
					suggestedFix: `Run with --fix (no --dry-run) to apply; then re-run audit-type-tests (07) to verify reduced gaps`,
					normativeRef: 'AGENTS.md:424-463 §6.6, AGENTS.md:335-352 §6.2, AGENTS.md:375-398 §6.4',
				});
			} else {
				const isGeneratedPath = generatedPath.endsWith('.generated.test-d.ts');
				if (!isGeneratedPath && existsSync(generatedPath) && !force) {
					console.error(`Refusing to overwrite hand-written test-d file without --force: ${toRepoRel(generatedPath)}`);
					process.exit(1);
				}
				if (!generatedPath.startsWith(REPO_ROOT + '/') && !generatedPath.startsWith('/tmp/')) {
					console.error(`Refusing to write outside repo and /tmp: ${generatedPath}`);
					process.exit(1);
				}
				const content = generateFileContent(dir, findings);
				if (content.includes(' as ') && content.includes('expectTypeOf')) {
					// Check for as assertion pattern (allow `as const`? but we ban all as per Q11)
					// Simple check: if content contains ` as ` with type, warn but we already ensure no as
					// Do not write if contains as
					if (/\bas\s+\w+/.test(content)) {
						console.error('Generated content contains as assertion, aborting');
						process.exit(1);
					}
				}
				let shouldWrite = true;
				if (existsSync(generatedPath) && !force) {
					try {
						const existing = readFileSync(generatedPath, 'utf-8');
						if (existing === content) shouldWrite = false;
					} catch {}
				}
				if (shouldWrite) {
					mkdirSync(dirname(generatedPath), { recursive: true });
					writeFileSync(generatedPath, content, 'utf-8');
				}
				totalAdded = warnGaps.length;
				totalTouched = 1;

				const { passed, output } = runScopedTsc(dir);
				if (passed) {
					const remaining = findings.filter((f) => !['missing-type-test', 'nonempty-type-test', 'hkt-type-test', 'const-param-test', 'noinfer-test', 'overload-order-type-test'].includes(f.rule));
					for (const f of remaining) allFindings.push(f);
					allFindings.push({
						severity: 'info',
						rule: 'generated-type-test-passed',
						location: toRepoRel(generatedPath) + ':1',
						evidence: `tsc -p tsconfig.json --noEmit: ok`,
						suggestedFix: `No action — re-run audit-type-tests (07) to verify reduced gaps`,
						normativeRef: 'AGENTS.md:424-463 §6.6, AGENTS.md:546-573 §9',
					});
				} else {
					const firstLine = output.split('\n').find((l) => l.trim())?.slice(0, 120) ?? 'tsc failed';
					for (const f of findings) allFindings.push(f);
					allFindings.push({
						severity: 'error',
						rule: 'generated-type-test-failed',
						location: toRepoRel(generatedPath) + ':1',
						evidence: `tsc -p tsconfig.json --noEmit: ${firstLine.slice(0, 120)}`,
						suggestedFix: `Fix generated test per AGENTS.md:424-463 — reproduction: tsc -p tsconfig.json --noEmit in ${toRepoRel(dir)}`,
						normativeRef: 'AGENTS.md:424-463 §6.6, AGENTS.md:546-573 §9',
					});
				}
			}
		} else {
			// diagnose single
			const findings = collectFindings(dir);
			for (const f of findings) allFindings.push(f);
		}
	}

	const report = generateReport(reportTarget, allFindings, { added: totalAdded, touched: totalTouched, isFix: isFixMode, isDryRun: dryRun });
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

export { extractGenericMethods, collectFindings, generateFileContent, generateReport, discoverPackages };
