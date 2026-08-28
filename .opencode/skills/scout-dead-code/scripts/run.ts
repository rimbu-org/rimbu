#!/usr/bin/env bun
/**
 * run.ts — scout-dead-code (orphan & unused) diagnose
 *
 * Diagnose-only, warn-only (never error per Q12). Package-scoped default, --workspace builds cross-package graph via rg + tsconfig paths.
 *
 * Usage:
 *   bun .opencode/skills/scout-dead-code/scripts/run.ts -- packages/stream
 *   bun .opencode/skills/scout-dead-code/scripts/run.ts -- --workspace
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

type Severity = 'warn' | 'info'; // never error per Q12
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

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function checkUnusedPublicExports(pkgDir: string, findings: Finding[], workspacePkgs?: string[]): void {
	const pubDir = join(pkgDir, 'src/public');
	const entryFile = join(pkgDir, `src/${pkgNameFromDir(pkgDir)}.ts`);
	const filesToScan = listFilesRec(pubDir);
	if (existsSync(entryFile)) filesToScan.push(entryFile);
	if (filesToScan.length === 0) return;

	for (const file of filesToScan) {
		let content: string;
		try {
			content = readFileSync(file, 'utf-8');
		} catch {
			continue;
		}
		// Find exported names
		const exportNames: { name: string; line: number }[] = [];
		const lines = content.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i] ?? '';
			// export function foo, export const foo, export class Foo, export interface Foo, export type Foo, export { foo, bar }
			const m1 = line.match(/export\s+(?:function|const|let|class|interface|type|enum)\s+(\w+)/);
			if (m1 && m1[1]) exportNames.push({ name: m1[1]!, line: i + 1 });
			const m2 = line.match(/export\s*\{\s*([^}]+)\s*\}/);
			if (m2 && m2[1]) {
				for (const part of m2[1]!.split(',')) {
					const n = part.trim().split(/\s+as\s+/)[0]?.trim().split(/\s+/)[0]?.trim();
					if (n && /^[A-Za-z_]\w*$/.test(n) && n !== 'type') exportNames.push({ name: n, line: i + 1 });
				}
			}
			// export * from — skip, not a named export to check for unused
		}
		// Deduplicate
		const seen = new Set<string>();
		for (const { name, line } of exportNames) {
			if (seen.has(name)) continue;
			seen.add(name);
			// Skip common re-export barrels that are expected to be used via package entry
			if (name === 'default') continue;
				// Search for importers: any occurrence of the export name outside its definition file
			let importerCount = 0;
			let evidence = '';
			const pattern = `\\b${name}\\b`;
			const searchDir = workspacePkgs ? join(REPO_ROOT, 'packages') : pkgDir;
			const outAll = rg(pattern, searchDir);
			if (outAll.trim()) {
				for (const l of outAll.trim().split('\n')) {
					// Exclude the export definition itself in the same file
					if (l.startsWith(file + ':') && l.includes(`export`)) continue;
					// Also exclude the file's own other lines that define the export (e.g. export interface line)
					if (l.startsWith(file + ':')) {
						// If the line is in the same file but not an export definition, it could be internal usage — count it
						// For public files, same-file usage (e.g. interface extends) is not an external importer, but still indicates live
						// Count it as importer if it's not the export line itself
						if (!l.includes(`export ${name}`) && !l.includes(`export interface ${name}`) && !l.includes(`export type ${name}`)) {
							importerCount++;
							if (!evidence) evidence = l.slice(0, 120);
						}
						continue;
					}
					// Any other file that mentions the name counts as importer (covers import, extends, type refs, etc.)
					importerCount++;
					if (!evidence) evidence = l.slice(0, 120);
				}
			}
			if (importerCount === 0) {
				const rel = toRepoRel(file);
				// Check if export is re-exported via package entry's export * (then it's live even if no direct name match)
				const isLiveViaEntry = (() => {
					if (!existsSync(entryFile)) return false;
					try {
						const entryContent = readFileSync(entryFile, 'utf-8');
						// If entry does export * from public, consider all public exports live
						if (entryContent.includes(`export * from`) && (entryContent.includes(`'./public/`) || entryContent.includes(`"./public/`))) {
							return true;
						}
						return entryContent.includes(name);
					} catch {
						return false;
					}
				})();
				if (isLiveViaEntry) continue;
				// Also check if export is used in test files (already covered by outAll search, but keep)
				findings.push({
					severity: 'warn',
					rule: 'unused-public-export',
					location: `${rel}:${line}`,
					evidence: `rg -n "\\b${name}\\b" ${toRepoRel(searchDir)} --no-heading => 0 matches | ${rel}:${line}:export ${name}`,
					suggestedFix: `Remove export ${name} or add importer; re-run rg to confirm 0`,
					normativeRef: 'AGENTS.md:79-113 §3',
				});
			}
		}
	}
}

function checkOrphanInternal(pkgDir: string, findings: Finding[]): void {
	const internalDir = join(pkgDir, 'src/internal');
	if (!existsSync(internalDir)) return;
	const files = listFilesRec(internalDir);
	const pkgName = pkgNameFromDir(pkgDir);
	for (const file of files) {
		const base = file.split('/').pop()?.replace(/\.ts$/, '') ?? '';
		if (!base) continue;
		// Search for importers in src (including advanced and public via # alias) and test
		const importerOut = rg(`#${pkgName}.*${base}|from.*${base}`, join(pkgDir, 'src'));
		// Also check for direct basename import without alias (relative)
		// Count matches excluding self
		let count = 0;
		let evidence = '';
		if (importerOut.trim()) {
			for (const line of importerOut.trim().split('\n')) {
				if (line.startsWith(file)) continue; // self
				count++;
				if (!evidence) evidence = line.slice(0, 120);
			}
		}
		// Also check for imports via @rimbu for internal? Not expected
		if (count === 0) {
			// Check if file is imported via barrel or via test
			const testOut = rg(base, join(pkgDir, 'test'));
			if (testOut.trim()) continue;
			// Check if file is used via advanced re-export (which would import it)
			const advOut = rg(base, join(pkgDir, 'src/advanced'));
			if (advOut.trim()) continue;

			const rel = toRepoRel(file);
			findings.push({
				severity: 'warn',
				rule: 'orphan-internal-file',
				location: `${rel}:1`,
				evidence: `rg -n "#${pkgName}.*${base}|from.*${base}" ${toRepoRel(join(pkgDir, 'src'))} --no-heading => 0 matches`,
				suggestedFix: `Remove ${rel} or add importer via #${pkgName}/*`,
				normativeRef: 'AGENTS.md:104-113 §3',
			});
		} else if (count === 1) {
			const rel = toRepoRel(file);
			findings.push({
				severity: 'info',
				rule: 'internal-single-importer',
				location: `${rel}:1`,
				evidence: `rg -n "#${pkgName}.*${base}" ${toRepoRel(join(pkgDir, 'src'))} => 1 match: ${evidence.slice(0, 60)}`,
				suggestedFix: `Keep if split, or inline if low usage`,
				normativeRef: 'AGENTS.md:79-113 §3',
			});
		}
	}
}

function checkStaleAdvanced(pkgDir: string, findings: Finding[]): void {
	const advDir = join(pkgDir, 'src/advanced');
	if (!existsSync(advDir)) return;
	const files = listFilesRec(advDir);
	const pkgName = pkgNameFromDir(pkgDir);
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
			const m = line.match(/from\s+['"]#([^'"]+)['"]/);
			if (!m || !m[1]) continue;
			const targetAlias = m[1]!; // e.g. #stream/internal or #hashed/map
			// Resolve alias to file path via tsconfig paths? Simplified: check if target file exists under src/internal
			// #pkg/* -> src/internal/*
			// #async/* -> src/internal/async/*
			// We can map #<alias> to src/internal path
			let targetPath: string | null = null;
			if (targetAlias.startsWith(`${pkgName}/`)) {
				const sub = targetAlias.slice(pkgName.length + 1);
				targetPath = join(pkgDir, 'src/internal', sub);
				if (!targetPath.endsWith('.ts')) targetPath += '.ts';
				// Also try without .ts as directory
			} else if (targetAlias.startsWith('async/')) {
				targetPath = join(pkgDir, 'src/internal/async', targetAlias.slice('async/'.length));
				if (!targetPath.endsWith('.ts')) targetPath += '.ts';
			} else {
				// For #map/* etc. in hashed
				const parts = targetAlias.split('/');
				const alias = parts[0] ?? '';
				const rest = parts.slice(1).join('/');
				const tsconfig = readJsonSafe(join(pkgDir, 'tsconfig.common.json'));
				const paths = tsconfig?.compilerOptions?.paths ?? {};
				const mapped = paths[`#${alias}/*`];
				if (mapped && Array.isArray(mapped) && mapped[0]) {
					const base = String(mapped[0]).replace('./', '').replace('/*.ts', '').replace('/*', '');
					targetPath = join(pkgDir, base, rest);
					if (!targetPath.endsWith('.ts')) targetPath += '.ts';
				}
			}
			if (targetPath) {
				const exists = existsSync(targetPath) || existsSync(targetPath.replace(/\.ts$/, '')) || existsSync(dirname(targetPath));
				if (!exists) {
					const rel = toRepoRel(file);
					findings.push({
						severity: 'warn',
						rule: 'stale-advanced-reexport',
						location: `${rel}:${i + 1}`,
						evidence: `rg -n "from '#${targetAlias}'" ${toRepoRel(advDir)} => target ${toRepoRel(targetPath)} missing`,
						suggestedFix: `Remove or update re-export from '#${targetAlias}'`,
						normativeRef: 'AGENTS.md:79-113 §3',
					});
				} else {
					// Check if target is now also public (redundant)
					const pubCounterpart = targetPath.replace('/internal/', '/public/');
					if (existsSync(pubCounterpart) || existsSync(pubCounterpart.replace(/\.ts$/, '.ts'))) {
						const rel = toRepoRel(file);
						findings.push({
							severity: 'info',
							rule: 'advanced-low-usage',
							location: `${rel}:${i + 1}`,
							evidence: `Target ${toRepoRel(targetPath)} now also in public`,
							suggestedFix: `Consider keeping advanced re-export or promoting to public`,
							normativeRef: 'AGENTS.md:79-113 §3',
						});
					}
				}
			}
		}
	}
}

function checkFilesExportsDrift(pkgDir: string, findings: Finding[]): void {
	const pkgJson = readJsonSafe(join(pkgDir, 'package.json'));
	if (!pkgJson) return;
	const hasPublicDir = existsSync(join(pkgDir, 'src/public'));
	const hasAdvancedDir = existsSync(join(pkgDir, 'src/advanced'));
	const hasPublicExport = pkgJson.exports?.['./*'] !== undefined;
	const hasAdvancedExport = pkgJson.exports?.['./advanced/*'] !== undefined;

	if (hasPublicDir && !hasPublicExport) {
		findings.push({
			severity: 'warn',
			rule: 'files-exports-drift',
			location: toRepoRel(join(pkgDir, 'package.json')),
			evidence: `src/public/ exists but package.json lacks exports["./*"]`,
			suggestedFix: `Add "./*": {"types":"./dist/public/*.d.ts","default":"./dist/public/*.js"}`,
			normativeRef: 'AGENTS.md:79-113 §3',
		});
	}
	if (!hasPublicDir && hasPublicExport) {
		findings.push({
			severity: 'warn',
			rule: 'files-exports-drift',
			location: toRepoRel(join(pkgDir, 'package.json')),
			evidence: `exports["./*"] declares but src/public/ missing`,
			suggestedFix: `Create src/public/ or remove export`,
			normativeRef: 'AGENTS.md:79-113 §3',
		});
	}
	if (hasAdvancedDir && !hasAdvancedExport) {
		findings.push({
			severity: 'warn',
			rule: 'files-exports-drift',
			location: toRepoRel(join(pkgDir, 'package.json')),
			evidence: `src/advanced/ exists but package.json lacks exports["./advanced/*"]`,
			suggestedFix: `Add "./advanced/*" per AGENTS.md:79-113`,
			normativeRef: 'AGENTS.md:79-113 §3',
		});
	}
	if (!hasAdvancedDir && hasAdvancedExport) {
		findings.push({
			severity: 'info',
			rule: 'files-exports-drift',
			location: toRepoRel(join(pkgDir, 'package.json')),
			evidence: `exports["./advanced/*"] declares but src/advanced/ missing`,
			suggestedFix: `Create src/advanced/ or remove export`,
			normativeRef: 'AGENTS.md:79-113 §3',
		});
	}
}

function generateReport(target: string, findings: Finding[]): string {
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
	lines.push(`# scout-dead-code — ${target}`);
	lines.push('');
	lines.push('## Summary');
	lines.push('');
	if (findings.length === 0) {
		lines.push(`No dead code found. Scouted ${target} — no orphan or unused exports. Counts: 0 error, 0 warn, 0 info.`);
	} else {
		lines.push(`Scouted ${target} for dead code. Found ${findings.length} potential dead findings. Counts: 0 error, ${counts.warn} warn, ${counts.info} info. All warn are potential dead until confirmed by rg 0 matches (Q12).`);
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
		lines.push('- No action required — no dead code found.');
	} else {
		if (counts.warn > 0) lines.push(`- Confirm each of ${counts.warn} warn(s) with rg 0 matches; remove dead code manually and re-run scout-dead-code`);
		if (counts.info > 0) lines.push(`- ${counts.info} info — low-usage advisory, keep or inline as needed`);
		lines.push(`- Re-run \`bun .opencode/skills/scout-dead-code/scripts/run.ts -- ${target}\` to verify`);
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
		console.error('Usage: bun .opencode/skills/scout-dead-code/scripts/run.ts -- <pkg> [--workspace] [--out <path>]');
		process.exit(1);
	}

	const allFindings: Finding[] = [];
	let reportTarget = workspace ? 'workspace' : toRepoRel(pkgDirs[0]!);

	if (workspace) {
		for (const dir of pkgDirs) {
			const findings: Finding[] = [];
			checkUnusedPublicExports(dir, findings, pkgDirs);
			checkOrphanInternal(dir, findings);
			checkStaleAdvanced(dir, findings);
			checkFilesExportsDrift(dir, findings);
			for (const f of findings) {
				allFindings.push({ ...f, location: `${toRepoRel(dir)}: ${f.location}` });
			}
		}
	} else {
		const dir = pkgDirs[0]!;
		checkUnusedPublicExports(dir, allFindings, undefined);
		checkOrphanInternal(dir, allFindings);
		checkStaleAdvanced(dir, allFindings);
		checkFilesExportsDrift(dir, allFindings);
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
	// Never error per Q12 — even warn stays warn, exit 0 unless info only
	const hasError = false; // never error
	process.exit(hasError ? 1 : 0);
}

export { checkUnusedPublicExports, checkOrphanInternal, checkStaleAdvanced, checkFilesExportsDrift, generateReport, discoverPackages };
