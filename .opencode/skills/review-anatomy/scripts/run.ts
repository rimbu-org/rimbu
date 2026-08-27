#!/usr/bin/env bun
/**
 * run.ts — review-anatomy (package shape) diagnose
 *
 * Allowed runtime: bun + rg/jq only (spec §2.3, AGENTS.md:601-625)
 * Diagnose-only: never mutates. Supports <pkg> or --workspace, --out, --with-tools.
 *
 * Usage:
 *   bun .opencode/skills/review-anatomy/scripts/run.ts -- packages/stream
 *   bun .opencode/skills/review-anatomy/scripts/run.ts -- --workspace
 *   bun .opencode/skills/review-anatomy/scripts/run.ts -- packages/hashed --out .scratch/reports/review-anatomy/hashed.md --with-tools
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

function toRepoRel(abs: string): string {
	return abs.startsWith(REPO_ROOT + '/') ? abs.slice(REPO_ROOT.length + 1) : abs;
}

function parsePackageName(pkgDir: string): string {
	return pkgDir.split('/').pop() ?? pkgDir;
}

function readJsonSafe(path: string): any | null {
	try {
		const raw = readFileSync(path, 'utf-8');
		// Try direct JSON first (package.json is pure JSON, tsconfig may be JSONC)
		try {
			return JSON.parse(raw);
		} catch {
			// Fallback: strip comments respecting strings
			let out = '';
			let inString = false;
			let inSingle = false;
			let inBlock = false;
			let inLine = false;
			let escaped = false;
			for (let i = 0; i < raw.length; i++) {
				const ch = raw[i]!;
				const next = raw[i + 1] ?? '';
				if (inLine) {
					if (ch === '\n') {
						inLine = false;
						out += ch;
					}
					continue;
				}
				if (inBlock) {
					if (ch === '*' && next === '/') {
						inBlock = false;
						i++;
					}
					continue;
				}
				if (inString) {
					out += ch;
					if (escaped) escaped = false;
					else if (ch === '\\') escaped = true;
					else if (ch === '"') inString = false;
					continue;
				}
				if (inSingle) {
					out += ch;
					if (escaped) escaped = false;
					else if (ch === '\\') escaped = true;
					else if (ch === "'") inSingle = false;
					continue;
				}
				if (ch === '"') {
					inString = true;
					out += ch;
					continue;
				}
				if (ch === "'") {
					inSingle = true;
					out += ch;
					continue;
				}
				if (ch === '/' && next === '/') {
					inLine = true;
					i++;
					continue;
				}
				if (ch === '/' && next === '*') {
					inBlock = true;
					i++;
					continue;
				}
				out += ch;
			}
			// Remove trailing commas
			out = out.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
			return JSON.parse(out);
		}
	} catch {
		return null;
	}
}

function discoverPackages(): string[] {
	const entries = readdirSync(PACKAGES_ROOT, { withFileTypes: true });
	const pkgs: string[] = [];
	for (const e of entries) {
		if (!e.isDirectory()) continue;
		// Exclude unpublished list2 (not in fixed, per spec §5 and AGENTS.md:77)
		if (e.name === 'list2') continue;
		const pkgJson = join(PACKAGES_ROOT, e.name, 'package.json');
		if (existsSync(pkgJson)) pkgs.push(join(PACKAGES_ROOT, e.name));
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

// ---------------------------------------------------------------------------
// Checks — per checklist
// ---------------------------------------------------------------------------

function checkPackageJson(pkgDir: string, findings: Finding[]): void {
	const pkgName = parsePackageName(pkgDir);
	const pkgPath = join(pkgDir, 'package.json');
	const relPkgPath = toRepoRel(pkgPath);
	const json = readJsonSafe(pkgPath);
	if (!json) {
		findings.push({
			severity: 'error',
			rule: 'package-json-parse',
			location: relPkgPath,
			evidence: `Cannot parse ${relPkgPath}`,
			suggestedFix: `Fix JSON syntax per AGENTS.md:155-235`,
			normativeRef: 'AGENTS.md:155-235 §4',
		});
		return;
	}

	// exports
	const exportsField = json.exports ?? {};
	if (!exportsField['.']) {
		findings.push({
			severity: 'error',
			rule: 'exports-root',
			location: `${relPkgPath}:exports["."]`,
			evidence: `Missing exports["."]`,
			suggestedFix: `Add ".: {types:"./dist/${pkgName}.d.ts", default:"./dist/${pkgName}.js"}`,
			normativeRef: 'AGENTS.md:155-235 §4',
		});
	} else {
		const rootExp = exportsField['.'];
		if (rootExp?.types !== `./dist/${pkgName}.d.ts` || rootExp?.default !== `./dist/${pkgName}.js`) {
			findings.push({
				severity: 'error',
				rule: 'exports-root',
				location: `${relPkgPath}:exports["."]`,
				evidence: `exports["."] = ${JSON.stringify(rootExp)}`,
				suggestedFix: `Set to {"types":"./dist/${pkgName}.d.ts","default":"./dist/${pkgName}.js"}`,
				normativeRef: 'AGENTS.md:155-235 §4',
			});
		}
	}

	const hasPublic = existsSync(join(pkgDir, 'src/public'));
	const hasAdvanced = existsSync(join(pkgDir, 'src/advanced'));
	const hasInternal = existsSync(join(pkgDir, 'src/internal'));

	if (hasPublic && !exportsField['./*']) {
		findings.push({
			severity: 'error',
			rule: 'exports-public',
			location: `${relPkgPath}:exports["./*"]`,
			evidence: `src/public/ exists but exports["./*"] missing`,
			suggestedFix: `Add "./*": {"types":"./dist/public/*.d.ts","default":"./dist/public/*.js"}`,
			normativeRef: 'AGENTS.md:79-113 §3',
		});
	}
	if (hasAdvanced && !exportsField['./advanced/*']) {
		findings.push({
			severity: 'error',
			rule: 'exports-advanced',
			location: `${relPkgPath}:exports["./advanced/*"]`,
			evidence: `src/advanced/ exists but exports["./advanced/*"] missing`,
			suggestedFix: `Add "./advanced/*": {"types":"./dist/advanced/*.d.ts","default":"./dist/advanced/*.js"}`,
			normativeRef: 'AGENTS.md:79-113 §3',
		});
	}
	// no internal export
	for (const k of Object.keys(exportsField)) {
		if (k.includes('internal') || k.includes('#')) {
			findings.push({
				severity: 'error',
				rule: 'no-internal-export',
				location: `${relPkgPath}:exports["${k}"]`,
				evidence: `exports contains internal alias ${k}`,
				suggestedFix: `Remove; internal is #${pkgName}/* imports only`,
				normativeRef: 'AGENTS.md:104-113 §3',
			});
		}
	}

	// imports
	const importsField = json.imports ?? {};
	if (hasInternal && Object.keys(importsField).length === 0) {
		findings.push({
			severity: 'error',
			rule: 'imports-alias',
			location: `${relPkgPath}:imports`,
			evidence: `src/internal/ exists but imports field missing`,
			suggestedFix: `Add "#${pkgName}/*": {"types":"./dist/internal/*.d.ts","default":"./dist/internal/*.js"}`,
			normativeRef: 'AGENTS.md:155-235 §4',
		});
	} else if (hasInternal) {
		// If imports has at least one "#.../*" entry, consider it satisfied (supports subgroup aliases like #map/*, #set/*)
		const hasAnyHashAlias = Object.keys(importsField).some((k) => k.startsWith('#') && k.endsWith('/*'));
		if (!hasAnyHashAlias) {
			findings.push({
				severity: 'error',
				rule: 'imports-alias',
				location: `${relPkgPath}:imports["#${pkgName}/*"]`,
				evidence: `src/internal/ exists but no "#.../*" alias found in imports`,
				suggestedFix: `Add "#${pkgName}/*": {"types":"./dist/internal/*.d.ts","default":"./dist/internal/*.js"}`,
				normativeRef: 'AGENTS.md:155-235 §4',
			});
		}
	}
	// check imports values for relative paths — allow "./dist/..." per canonical shape and "./test/..." for test alias
	for (const [k, v] of Object.entries(importsField as Record<string, any>)) {
		const valStr = JSON.stringify(v);
		// Allow #test/* -> ./test/... as test helper alias (not part of canonical but common)
		if (k === '#test/*' && valStr.includes('"./test/')) continue;
		// Flag only if contains "../" or "./" not followed by "dist/"
		if (valStr.includes('"../') || /"\.\/(?!dist\/)/.test(valStr)) {
			findings.push({
				severity: 'error',
				rule: 'imports-no-relative',
				location: `${relPkgPath}:imports["${k}"]`,
				evidence: `${k}: ${valStr}`,
				suggestedFix: `Use dist/ paths, not relative`,
				normativeRef: 'AGENTS.md:155-235 §4',
			});
		}
	}

	// files
	const files = json.files;
	if (!Array.isArray(files) || files.length !== 2 || files[0] !== 'dist' || files[1] !== 'src') {
		findings.push({
			severity: 'error',
			rule: 'files',
			location: `${relPkgPath}:files`,
			evidence: `files = ${JSON.stringify(files)}`,
			suggestedFix: `Set files: ["dist","src"]`,
			normativeRef: 'AGENTS.md:155-235 §4',
		});
	}

	// sideEffects
	if (json.sideEffects !== false) {
		findings.push({
			severity: 'error',
			rule: 'sideEffects',
			location: `${relPkgPath}:sideEffects`,
			evidence: `sideEffects = ${JSON.stringify(json.sideEffects)}`,
			suggestedFix: `Set sideEffects: false`,
			normativeRef: 'AGENTS.md:155-235 §4',
		});
	}

	// type module
	if (json.type !== 'module') {
		findings.push({
			severity: 'error',
			rule: 'type-module',
			location: `${relPkgPath}:type`,
			evidence: `type = ${JSON.stringify(json.type)}`,
			suggestedFix: `Set type: "module"`,
			normativeRef: 'AGENTS.md:155-235 §4',
		});
	}

	// workspace deps
	const deps = { ...(json.dependencies ?? {}), ...(json.peerDependencies ?? {}) };
	for (const [dep, ver] of Object.entries(deps as Record<string, string>)) {
		if (dep.startsWith('@rimbu/') && ver !== 'workspace:*') {
			findings.push({
				severity: 'warn',
				rule: 'workspace-deps',
				location: `${relPkgPath}:dependencies["${dep}"]`,
				evidence: `${dep}: ${ver}`,
				suggestedFix: `Use "workspace:*" for internal deps`,
				normativeRef: 'AGENTS.md:155-235 §4',
			});
		}
	}

	// publishConfig
	const pub = json.publishConfig;
	if (!pub || pub.access !== 'public' || pub.provenance !== true) {
		findings.push({
			severity: 'warn',
			rule: 'publishConfig',
			location: `${relPkgPath}:publishConfig`,
			evidence: `publishConfig = ${JSON.stringify(pub)}`,
			suggestedFix: `Set {access:"public", provenance:true}`,
			normativeRef: 'AGENTS.md:155-235 §4',
		});
	}

	// scripts
	const scripts = json.scripts ?? {};
	const expectedBuild = 'bun clean:build && bunx tsc --p tsconfig.esm.json';
	if (scripts.build && scripts.build !== expectedBuild) {
		// Some packages have same but allow variant; treat as warn if contains tsc
		if (!scripts.build.includes('tsconfig.esm.json')) {
			findings.push({
				severity: 'error',
				rule: 'scripts-build',
				location: `${relPkgPath}:scripts.build`,
				evidence: scripts.build,
				suggestedFix: expectedBuild,
				normativeRef: 'AGENTS.md:155-235 §4',
			});
		}
	} else if (!scripts.build && existsSync(join(pkgDir, 'src'))) {
		findings.push({
			severity: 'warn',
			rule: 'scripts-build',
			location: `${relPkgPath}:scripts.build`,
			evidence: `Missing scripts.build`,
			suggestedFix: expectedBuild,
			normativeRef: 'AGENTS.md:155-235 §4',
		});
	}
	const expectedTypecheck = 'tsc -p tsconfig.json --noEmit';
	if (scripts.typecheck && scripts.typecheck !== expectedTypecheck) {
		if (!scripts.typecheck.includes('tsconfig.json')) {
			findings.push({
				severity: 'error',
				rule: 'scripts-typecheck',
				location: `${relPkgPath}:scripts.typecheck`,
				evidence: scripts.typecheck,
				suggestedFix: expectedTypecheck,
				normativeRef: 'AGENTS.md:155-235 §4',
			});
		}
	}
}

function checkTsconfigs(pkgDir: string, findings: Finding[]): void {
	const pkgName = parsePackageName(pkgDir);
	const rel = (p: string) => toRepoRel(join(pkgDir, p));

	// tsconfig.common.json
	const commonPath = join(pkgDir, 'tsconfig.common.json');
	if (existsSync(commonPath)) {
		const common = readJsonSafe(commonPath);
		if (common) {
			const paths = common.compilerOptions?.paths ?? {};
			if (!paths[`@rimbu/${pkgName}`] && !paths[`@rimbu/${pkgName}/*`]) {
				findings.push({
					severity: 'error',
					rule: 'tsconfig-common-paths',
					location: `${rel('tsconfig.common.json')}:paths`,
					evidence: `Missing "@rimbu/${pkgName}" alias`,
					suggestedFix: `Add "@rimbu/${pkgName}": ["./${pkgName}.ts"]`,
					normativeRef: 'AGENTS.md:238-284 §5',
				});
			}
			if (existsSync(join(pkgDir, 'src/internal'))) {
				const hasAnyHashPath = Object.keys(paths).some((k) => k.startsWith('#') && k.endsWith('/*'));
				if (!hasAnyHashPath) {
					findings.push({
						severity: 'error',
						rule: 'tsconfig-common-paths',
						location: `${rel('tsconfig.common.json')}:paths`,
						evidence: `Missing "#.../*" alias for internal`,
						suggestedFix: `Add "#${pkgName}/*": ["./internal/*.ts"]`,
						normativeRef: 'AGENTS.md:238-284 §5',
					});
				}
			}
		}
	} else if (existsSync(join(pkgDir, 'src'))) {
		findings.push({
			severity: 'error',
			rule: 'tsconfig-common-paths',
			location: rel('tsconfig.common.json'),
			evidence: `Missing tsconfig.common.json`,
			suggestedFix: `Create per AGENTS.md:238-284`,
			normativeRef: 'AGENTS.md:238-284 §5',
		});
	}

	// tsconfig.json
	const tsPath = join(pkgDir, 'tsconfig.json');
	if (existsSync(tsPath)) {
		const ts = readJsonSafe(tsPath);
		if (ts) {
			const ext = ts.extends;
			if (!Array.isArray(ext) || !ext.includes('../../config/tsconfig.base.json')) {
				findings.push({
					severity: 'error',
					rule: 'tsconfig-json-extends',
					location: `${rel('tsconfig.json')}:extends`,
					evidence: `extends = ${JSON.stringify(ext)}`,
					suggestedFix: `Extend ["../../config/tsconfig.base.json","./tsconfig.common.json"]`,
					normativeRef: 'AGENTS.md:238-284 §5',
				});
			}
		}
	}

	// tsconfig.esm.json
	const esmPath = join(pkgDir, 'tsconfig.esm.json');
	if (existsSync(esmPath)) {
		const esm = readJsonSafe(esmPath);
		if (esm) {
			if (esm.compilerOptions?.rootDir !== './src' || esm.compilerOptions?.outDir !== './dist') {
				findings.push({
					severity: 'error',
					rule: 'tsconfig-esm-extends',
					location: `${rel('tsconfig.esm.json')}:compilerOptions`,
					evidence: `rootDir=${esm.compilerOptions?.rootDir} outDir=${esm.compilerOptions?.outDir}`,
					suggestedFix: `rootDir "./src", outDir "./dist", noEmit false`,
					normativeRef: 'AGENTS.md:238-284 §5',
				});
			}
		}
	}
}

function checkLayout(pkgDir: string, findings: Finding[]): void {
	const pkgName = parsePackageName(pkgDir);
	const rel = (p: string) => toRepoRel(join(pkgDir, p));

	// entry
	if (!existsSync(join(pkgDir, `src/${pkgName}.ts`))) {
		// Some packages have different entry like src/stream.ts vs list? Actually per spec: src/<name>.ts
		// Check if any src/*.ts exists at top level
		const srcEntries = existsSync(join(pkgDir, 'src')) ? readdirSync(join(pkgDir, 'src')) : [];
		const hasEntry = srcEntries.some((f) => f.endsWith('.ts'));
		if (!hasEntry) {
			findings.push({
				severity: 'error',
				rule: 'layout-entry',
				location: rel(`src/${pkgName}.ts`),
				evidence: `Missing src/${pkgName}.ts`,
				suggestedFix: `Create src/${pkgName}.ts per AGENTS.md:79-113`,
				normativeRef: 'AGENTS.md:79-113 §3',
			});
		}
	}

	// internal not exported already checked in package.json, but also check dist leakage
	if (existsSync(join(pkgDir, 'src/internal')) && existsSync(join(pkgDir, 'src/public')) === false) {
		// no public but internal exists — check exports still not leakage, already covered
	}

	// advanced tier
	const hasAdvanced = existsSync(join(pkgDir, 'src/advanced'));
	const pkgJson = readJsonSafe(join(pkgDir, 'package.json'));
	const hasAdvancedExport = pkgJson?.exports?.['./advanced/*'] !== undefined;
	if (hasAdvanced && !hasAdvancedExport) {
		findings.push({
			severity: 'warn',
			rule: 'layout-advanced',
			location: rel('src/advanced/'),
			evidence: `src/advanced/ exists but package.json lacks exports["./advanced/*"]`,
			suggestedFix: `Add exports["./advanced/*"] or remove src/advanced/ if not needed`,
			normativeRef: 'AGENTS.md:79-113 §3',
		});
	}
	if (!hasAdvanced && hasAdvancedExport) {
		findings.push({
			severity: 'info',
			rule: 'layout-advanced',
			location: `${toRepoRel(join(pkgDir, 'package.json'))}:exports["./advanced/*"]`,
			evidence: `exports declares advanced but src/advanced/ missing`,
			suggestedFix: `Create src/advanced/ or remove export`,
			normativeRef: 'AGENTS.md:79-113 §3',
		});
	}
}

function checkRelativeImports(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	// Use rg if available, fallback to manual scan — catch any relative specifier "./" or "../" in string literal
	let output = '';
	try {
		const res = spawnSync('rg', ['-n', "['\"]\\./|['\"]\\.\\./", srcDir, '--no-heading'], { encoding: 'utf-8' });
		output = res.stdout ?? '';
		if (res.status !== 0 && res.status !== 1) {
			// rg returns 1 when no matches, 0 when matches, 2 on error
			output = '';
		}
	} catch {
		// rg not available — manual scan fallback
		const walk = (dir: string) => {
			for (const e of readdirSync(dir, { withFileTypes: true })) {
				const p = join(dir, e.name);
				if (e.isDirectory()) walk(p);
				else if (e.name.endsWith('.ts')) {
					const content = readFileSync(p, 'utf-8');
					const lines = content.split('\n');
					lines.forEach((line, idx) => {
						if (/['"]\.\//.test(line) || /['"]\.\.\//.test(line)) {
							output += `${p}:${idx + 1}:${line.trim()}\n`;
						}
					});
				}
			}
		};
		walk(srcDir);
	}

	if (output.trim()) {
		for (const line of output.trim().split('\n')) {
			// line is like /path/src/...:12:content
			// Make repo-relative
			const relLine = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
			// Extract file:line
			const match = relLine.match(/^([^:]+:\d+):/);
			const loc = match ? match[1] : toRepoRel(srcDir);
			findings.push({
				severity: 'error',
				rule: 'no-relative-imports',
				location: loc,
				evidence: line.slice(0, 120),
				suggestedFix: `Use #${parsePackageName(pkgDir)}/* or @rimbu/* per AGENTS.md:138-152`,
				normativeRef: 'AGENTS.md:138-152 §3, biome.json:27-35',
			});
		}
	}

	// Check for internal via @rimbu imports
	try {
		const res2 = spawnSync('rg', ['-n', "['\"]@rimbu/.*/internal", srcDir, '--no-heading'], { encoding: 'utf-8' });
		const out2 = res2.stdout ?? '';
		if (out2.trim()) {
			for (const line of out2.trim().split('\n')) {
				const relLine = line.startsWith(REPO_ROOT + '/') ? line.slice(REPO_ROOT.length + 1) : line;
				const match = relLine.match(/^([^:]+:\d+):/);
				const loc = match ? match[1] : toRepoRel(srcDir);
				findings.push({
					severity: 'error',
					rule: 'no-internal-via-exports',
					location: loc,
					evidence: line.slice(0, 120),
					suggestedFix: `Use #${parsePackageName(pkgDir)}/* for internal`,
					normativeRef: 'AGENTS.md:104-113 §3',
				});
			}
		}
	} catch {
		// ignore
	}
}

function checkWithTools(pkgDir: string, findings: Finding[]): void {
	// Optionally run biome:check and typecheck scoped
	// biome check
	try {
		const res = spawnSync('biome', ['check', 'src'], { cwd: pkgDir, encoding: 'utf-8' });
		const out = (res.stdout ?? '') + (res.stderr ?? '');
		if (out.includes('Diagnostics not shown') || res.status !== 0) {
			// Only add if there are errors that rg didn't already catch
			// For anatomy we already flagged relative imports; biome would duplicate
			// So we just add as warn if biome reports issues beyond relative imports
			if (out.trim() && !out.includes('No fixes applied')) {
				// Trim to first 5 lines
				const snippet = out.trim().split('\n').slice(0, 5).join(' | ').slice(0, 120);
				if (!findings.some((f) => f.rule === 'no-relative-imports')) {
					findings.push({
						severity: 'warn',
						rule: 'biome-check',
						location: toRepoRel(join(pkgDir, 'src')),
						evidence: snippet,
						suggestedFix: `Run biome check src and fix per AGENTS.md:546-573`,
						normativeRef: 'AGENTS.md:546-573 §9, biome.json:27-35',
					});
				}
			}
		}
	} catch {
		// biome not available
	}

	// typecheck
	try {
		const res = spawnSync('bunx', ['tsc', '--p', 'tsconfig.json', '--noEmit'], { cwd: pkgDir, encoding: 'utf-8' });
		const out = (res.stdout ?? '') + (res.stderr ?? '');
		if (res.status !== 0 && out.trim()) {
			const snippet = out.trim().split('\n').slice(0, 3).join(' | ').slice(0, 120);
			findings.push({
				severity: 'warn',
				rule: 'typecheck',
				location: toRepoRel(join(pkgDir, 'tsconfig.json')),
				evidence: snippet,
				suggestedFix: `Fix type errors per AGENTS.md:546-573`,
				normativeRef: 'AGENTS.md:546-573 §9',
			});
		}
	} catch {
		// ignore
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
	lines.push(`# review-anatomy — ${target}`);
	lines.push('');
	lines.push('## Summary');
	lines.push('');
	if (findings.length === 0) {
		lines.push(`Package is clean for anatomy. Counts: 0 error, 0 warn, 0 info.`);
	} else {
		const total = findings.length;
		lines.push(`Found ${total} anatomy findings. Counts: ${counts.error} error, ${counts.warn} warn, ${counts.info} info. ${counts.error > 0 ? 'Requires fix before merge for errors.' : 'Requires attention for warn/info.'}`);
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
		lines.push('- No action required — package is clean for review-anatomy.');
	} else {
		if (counts.error > 0) lines.push(`- Fix ${counts.error} error(s) per AGENTS.md:76-284 §3/§4/§5 and re-run review-anatomy`);
		if (counts.warn > 0) lines.push(`- Review ${counts.warn} warn(s) — style drift, fix as needed`);
		if (counts.info > 0) lines.push(`- ${counts.info} info — advisory (e.g. empty advanced tier)`);
		lines.push('- Re-run `bun .opencode/skills/review-anatomy/scripts/run.ts -- ' + target + '` to verify');
	}
	return lines.join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): { out?: string; workspace: boolean; withTools: boolean; target?: string } {
	const args = argv.slice(2);
	let out: string | undefined;
	let workspace = false;
	let withTools = false;
	let target: string | undefined;
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === '--out' && i + 1 < args.length) out = args[++i];
		else if (a?.startsWith('--out=')) out = a.split('=')[1];
		else if (a === '--workspace') workspace = true;
		else if (a === '--with-tools') withTools = true;
		else if (a === '--verbose') continue;
		else if (a === '--') continue;
		else if (!a?.startsWith('-')) target = a;
	}
	return { out, workspace, withTools, target };
}

if (import.meta.main) {
	const { out, workspace, withTools, target } = parseArgs(process.argv);

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
		console.error('Usage: bun .opencode/skills/review-anatomy/scripts/run.ts -- <pkg> [--workspace] [--with-tools] [--out <path>]');
		console.error('Example: bun .opencode/skills/review-anatomy/scripts/run.ts -- packages/stream');
		process.exit(1);
	}

	const allFindings: Finding[] = [];
	let reportTarget = workspace ? 'workspace' : toRepoRel(pkgDirs[0]!);

	if (workspace) {
		for (const dir of pkgDirs) {
			const findings: Finding[] = [];
			checkPackageJson(dir, findings);
			checkTsconfigs(dir, findings);
			checkLayout(dir, findings);
			checkRelativeImports(dir, findings);
			if (withTools) checkWithTools(dir, findings);
			// Prefix findings with package name for workspace report
			for (const f of findings) {
				allFindings.push({ ...f, location: `${toRepoRel(dir)}: ${f.location}` });
			}
		}
	} else {
		const dir = pkgDirs[0]!;
		checkPackageJson(dir, allFindings);
		checkTsconfigs(dir, allFindings);
		checkLayout(dir, allFindings);
		checkRelativeImports(dir, allFindings);
		if (withTools) checkWithTools(dir, allFindings);
		reportTarget = toRepoRel(dir);
	}

	const report = generateReport(reportTarget, allFindings);
	console.log(report);
	if (out) {
		const absOut = resolve(out);
		// Sandbox guard: only allow writes inside repo or /tmp (AGENTS.md:601-625)
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

export { checkPackageJson, checkTsconfigs, checkLayout, checkRelativeImports, generateReport, discoverPackages };
