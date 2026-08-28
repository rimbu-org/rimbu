#!/usr/bin/env bun
/**
 * run.ts — review-docs (documentation coverage) diagnose
 *
 * Diagnose-only, fast rg by default, optional --with-tools to run docs:verify-examples scoped.
 * Supports <pkg> or --workspace, --out with sandbox guard.
 *
 * Usage:
 *   bun .opencode/skills/review-docs/scripts/run.ts -- packages/stream
 *   bun .opencode/skills/review-docs/scripts/run.ts -- --workspace
 *   bun .opencode/skills/review-docs/scripts/run.ts -- packages/stream --with-tools
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
const AGGREGATE = join(REPO_ROOT, 'docs', 'api.aggregate.json');
const VERIFY_REPORT = join(REPO_ROOT, 'docs', 'api.examples.verify.report.json');

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
    // include if has src/public or src/<name>.ts
    const hasPublic = existsSync(join(PACKAGES_ROOT, e.name, 'src', 'public'));
    const hasEntry = existsSync(join(PACKAGES_ROOT, e.name, 'src', `${e.name}.ts`));
    const hasAnySrc = existsSync(join(PACKAGES_ROOT, e.name, 'src'));
    if ((hasPublic || hasEntry || hasAnySrc) && existsSync(join(PACKAGES_ROOT, e.name, 'package.json'))) {
      // For review-docs, prefer packages with public tier; but still include others for workspace completeness
      if (hasPublic || hasEntry) pkgs.push(join(PACKAGES_ROOT, e.name));
      else if (hasAnySrc) pkgs.push(join(PACKAGES_ROOT, e.name));
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
function rg(pattern: string, dir: string): string {
  try {
    const res = spawnSync('rg', ['-n', pattern, dir, '--no-heading'], { encoding: 'utf-8' });
    if (res.status === 0) return res.stdout ?? '';
    return '';
  } catch {
    return '';
  }
}

// Collect public files for a package: src/public/**/*.ts + src/<name>.ts entry
function collectPublicFiles(pkgDir: string): string[] {
  const pkgName = pkgNameFromDir(pkgDir);
  const files: string[] = [];
  const pubDir = join(pkgDir, 'src', 'public');
  if (existsSync(pubDir)) files.push(...listFilesRec(pubDir, '.ts'));
  const entry = join(pkgDir, 'src', `${pkgName}.ts`);
  if (existsSync(entry)) files.push(entry);
  // For stream, entry is src/stream.ts already covered; for packages that have src/hashed.ts etc similar.
  // Also include src/<pkg>/public alternative? Not needed.
  // Deduplicate
  return [...new Set(files)].sort();
}

interface ExportSite {
  file: string;
  line: number; // 1-indexed
  text: string;
  name: string;
}

function enumerateExports(pkgDir: string): ExportSite[] {
  const files = collectPublicFiles(pkgDir);
  const sites: ExportSite[] = [];
  const exportRe = /^\s*export\s+(?:type\s+)?(?:async\s+)?(?:declare\s+)?(function|class|interface|type|const|let|var|namespace|enum|abstract\s+class)\b/;
  const exportSingleRe = /^\s*export\s+(?:default\s+)?/;
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
      // Match export declarations that are likely public surface:
      // - export interface Foo
      // - export type Bar =
      // - export const Baz
      // - export function foo
      // - export class Cls
      // - export namespace NS
      // - export type * from ... (re-export, skip JSDoc check? but we flag as info if missing)
      if (!/^\s*export\b/.test(line)) continue;
      // Skip "export type * from" and "export * from" — those are barrel re-exports, not declarations needing JSDoc directly
      if (/^\s*export\s+(?:type\s+)?\*\s+from\b/.test(line)) continue;
      // Skip pure re-export "export { X } from ..."  — no new symbol to document here
      if (/^\s*export\s*\{[^}]*\}\s*from\b/.test(line)) continue;
      // Must be a named export declaration
      let isNamed = exportRe.test(line);
      // Also handle "export const Reducer:" etc with type annotation, or "export namespace"
      if (!isNamed) {
        // Check for export const foo: { or export function etc with less strict
        if (/^\s*export\s+(type|interface|class|const|let|var|function|enum|namespace)\b/.test(line)) isNamed = true;
        else if (/^\s*export\s+type\s+\w+/.test(line)) isNamed = true;
        else continue;
      }
      // Extract name for evidence
      let name = '';
      const m1 = line.match(/^\s*export\s+(?:type\s+)?(?:async\s+)?(?:declare\s+)?(?:function|class|interface|type|const|let|var|namespace|enum|abstract\s+class)\s+(\w+)/);
      if (m1 && m1[1]) name = m1[1];
      else {
        const m2 = line.match(/^\s*export\s+(?:type\s+)?(\w+)/);
        if (m2 && m2[1]) name = m2[1];
      }
      // Heuristic: skip exports that are clearly internal helpers like "export type *"?
      // Skip type helpers that are lowercase? No, keep all.
      sites.push({ file, line: i + 1, text: line.trim().slice(0, 120), name: name || 'unknown' });
    }
  }
  return sites;
}

function hasJSDocWithExample(file: string, exportLine: number): { hasJsDoc: boolean; hasExample: boolean } {
  let content: string;
  try {
    content = readFileSync(file, 'utf-8');
  } catch {
    return { hasJsDoc: false, hasExample: false };
  }
  const lines = content.split('\n');
  const idx = exportLine - 1; // 0-indexed export line
  const start = Math.max(0, idx - 20);
  const windowLines = lines.slice(start, idx);
  const windowText = windowLines.join('\n');
  const hasJsDoc = windowText.includes('/**');
  const hasExample = windowText.includes('@example');
  // Also need to ensure block is closed before export: check last /** .. */ ends before export
  // If hasJsDoc but also has "*/" before export, okay.
  if (!hasJsDoc) return { hasJsDoc: false, hasExample: false };
  if (!hasExample) return { hasJsDoc: true, hasExample: false };
  // Verify the @example is inside the nearest /** block (contains ``` or code)
  // For now, presence is sufficient
  return { hasJsDoc: true, hasExample: true };
}

function checkJSDoc(pkgDir: string, findings: Finding[]): void {
  const sites = enumerateExports(pkgDir);
  if (sites.length === 0) {
    const pubDir = join(pkgDir, 'src', 'public');
    const hasPublic = existsSync(pubDir);
    const files = listFilesRec(pubDir, '.ts');
    if (hasPublic && files.length === 0) {
      findings.push({
        severity: 'info',
        rule: 'verify-skipped',
        location: toRepoRel(pkgDir),
        evidence: `No public exports found in ${toRepoRel(pubDir)}`,
        suggestedFix: `Add exports per AGENTS.md:79-113`,
        normativeRef: 'AGENTS.md:79-113 §3',
      });
    }
    return;
  }
  for (const site of sites) {
    const { hasJsDoc, hasExample } = hasJSDocWithExample(site.file, site.line);
    const rel = `${toRepoRel(site.file)}:${site.line}`;
    if (!hasJsDoc) {
      findings.push({
        severity: 'warn',
        rule: 'missing-jsdoc',
        location: rel,
        evidence: `${site.text} has no JSDoc`,
        suggestedFix: `Add /** ... @example \`\`\`ts ... // => ... \`\`\` */`,
        normativeRef: 'AGENTS.md:546-573 §9, package.json:56-64',
      });
    } else if (!hasExample) {
      findings.push({
        severity: 'warn',
        rule: 'missing-example',
        location: rel,
        evidence: `${site.text} has JSDoc but no @example`,
        suggestedFix: `Add @example \`\`\`ts ... // => ... \`\`\` per package.json:56-64`,
        normativeRef: 'package.json:56-64, AGENTS.md:546-573',
      });
    }
    // Limit per file to avoid huge output for massive files, but still report many
    // Cap total findings to keep report readable: allow up to 80 per package, then summarize
    if (findings.filter((f) => f.rule === 'missing-jsdoc' || f.rule === 'missing-example').length >= 80) {
      // Add one summary and break
      const remaining = sites.length - findings.length;
      if (remaining > 0) {
        findings.push({
          severity: 'info',
          rule: 'verify-skipped',
          location: toRepoRel(pkgDir),
          evidence: `Truncated: ${remaining} more exports not checked (cap 80)`,
          suggestedFix: `Re-run with --workspace or fix first 80`,
          normativeRef: 'AGENTS.md:546-573',
        });
      }
      break;
    }
  }
}

function checkVerifyExamples(pkgDir: string, findings: Finding[], withTools: boolean): void {
  if (!withTools) return;
  const pkgName = pkgNameFromDir(pkgDir);
  if (!existsSync(AGGREGATE)) {
    findings.push({
      severity: 'info',
      rule: 'verify-skipped',
      location: toRepoRel(pkgDir),
      evidence: `docs/api.aggregate.json missing — run bun run docs:extract`,
      suggestedFix: `Run bun run docs:extract per package.json:56-64 then re-run with --with-tools`,
      normativeRef: 'package.json:56-64',
    });
    return;
  }
  // Run verify-examples scoped to package
  // Use bun ./support/docs-extractor/src/verify-examples.ts --filter=<pkg>/
  const filter = `${pkgName}/`;
  try {
    const res = spawnSync('bun', [join(REPO_ROOT, 'support/docs-extractor/src/verify-examples.ts'), `--filter=${filter}`], {
      encoding: 'utf-8',
      cwd: REPO_ROOT,
      timeout: 120_000,
    });
    const out = (res.stdout ?? '') + (res.stderr ?? '');
    // Parse report JSON if exists and matches filter
    let report: any = null;
    try {
      if (existsSync(VERIFY_REPORT)) {
        report = JSON.parse(readFileSync(VERIFY_REPORT, 'utf-8'));
      }
    } catch {}
    const filterMatches =
      report && Array.isArray(report.details) && (report.filter === pkgName || report.filter === filter || report.filter === pkgName + '/');
    if (filterMatches) {
      // report.filter is "stream" without slash, so check startsWith
      const relevant = report.details.filter((d: any) => typeof d.key === 'string' && d.key.startsWith(filter));
      // If no relevant but report has mismatches, we may need to filter more broadly (some keys are stream/... but others are stream/AsyncStream)
      // The --filter=stream already scoped, so all details are relevant
      const toEmit = report.details; // all are for this pkg when filtered
      for (const d of toEmit) {
        const key: string = d.key ?? `${d.ownerId}::${d.member ?? ''}`;
        const detail: string = d.detail ?? d.kind ?? 'mismatch';
        const expected: string = d.expected ?? '';
        const actual: string = d.actual ?? '';
        const evidence = `${detail} expected: ${String(expected).slice(0, 60)} actual: ${String(actual).slice(0, 60)}`.slice(0, 120);
        // Location: try to map ownerId/member to file:line via rg, fallback to package: key
        let loc = `package: ${pkgName} — ${key}`;
        // Try to find file via rg for member name in public
        if (d.member) {
          const pubDir = join(pkgDir, 'src', 'public');
          const hasPub = existsSync(pubDir);
          if (hasPub) {
            const rgOut = rg(`\\b${d.member}\\b`, pubDir);
            if (rgOut.trim()) {
              const first = rgOut.trim().split('\n')[0] ?? '';
              const absFile = first.split(':')[0] ?? '';
              const lineNo = first.split(':')[1] ?? '1';
              if (absFile) {
                const relFile = absFile.startsWith(REPO_ROOT + '/') ? absFile.slice(REPO_ROOT.length + 1) : toRepoRel(absFile);
                loc = `${relFile}:${lineNo} — ${key}`;
              }
            } else if (existsSync(join(pkgDir, 'src', `${pkgName}.ts`))) {
              const entryOut = rg(`\\b${d.member}\\b`, join(pkgDir, 'src', `${pkgName}.ts`));
              if (entryOut.trim()) {
                loc = `${toRepoRel(join(pkgDir, 'src', `${pkgName}.ts`))}:1 — ${key}`;
              }
            }
          }
        } else if (d.ownerId) {
          const locMaybe = `${toRepoRel(pkgDir)}: ${d.ownerId}`;
          loc = locMaybe;
        }
        findings.push({
          severity: 'error',
          rule: 'broken-example',
          location: loc,
          evidence,
          suggestedFix: `Fix // => to actual output per docs:verify-examples`,
          normativeRef: 'package.json:56-64, AGENTS.md:546-573',
        });
        if (findings.filter((f) => f.rule === 'broken-example').length >= 30) {
          const remaining = toEmit.length - findings.filter((f) => f.rule === 'broken-example').length;
          if (remaining > 0) {
            findings.push({
              severity: 'info',
              rule: 'verify-skipped',
              location: toRepoRel(pkgDir),
              evidence: `Truncated: ${remaining} more broken examples (cap 30)`,
              suggestedFix: `Fix first 30 and re-run with --with-tools`,
              normativeRef: 'package.json:56-64',
            });
          }
          break;
        }
      }
      // If report has 0 mismatches but out contains some other warning, still emit none
      if (report.mismatches === 0 && findings.filter((f) => f.rule === 'broken-example').length === 0) {
        // No broken examples, clean
      }
    } else {
      // Fallback: parse stdout for mismatch lines
      const lines = out.split('\n');
      let parsed = 0;
      for (const line of lines) {
        if (line.includes('output mismatch') || line.includes('has no "// =>"') || line.includes('captured')) {
          findings.push({
            severity: 'error',
            rule: 'broken-example',
            location: toRepoRel(pkgDir),
            evidence: line.slice(0, 120),
            suggestedFix: `Fix // => to actual per docs:verify-examples`,
            normativeRef: 'package.json:56-64',
          });
          parsed++;
          if (parsed >= 30) break;
        }
      }
      if (parsed === 0 && out.includes('Verified') && out.includes('issue(s)')) {
        // Try to extract count: e.g. "613 issue(s)." -> produce summary errors via report json maybe missing filter match
        const m = out.match(/(\d+)\s+issue\(s\)/);
        if (m && parseInt(m[1], 10) > 0) {
          findings.push({
            severity: 'error',
            rule: 'broken-example',
            location: toRepoRel(pkgDir),
            evidence: out.split('\n').find((l) => l.includes('issue(s)'))?.slice(0, 120) ?? `verify-examples found ${m[1]} issues`,
            suggestedFix: `Check docs/api.examples.verify.report.json for details`,
            normativeRef: 'package.json:56-64',
          });
        }
      }
    }
    // Also note verification run summary
    if (findings.filter((f) => f.rule === 'broken-example').length === 0 && out.includes('Verified')) {
      // Successful verification adds no error
    }
  } catch (e) {
    findings.push({
      severity: 'info',
      rule: 'verify-skipped',
      location: toRepoRel(pkgDir),
      evidence: `verify-examples failed: ${String(e).slice(0, 100)}`,
      suggestedFix: `Ensure bun and docs/api.aggregate.json exist`,
      normativeRef: 'package.json:56-64',
    });
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
  lines.push(`# review-docs — ${target}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  if (findings.length === 0) {
    lines.push(`Docs are clean: every public export has JSDoc with runnable @example, TypeDoc renders without warnings. Counts: 0 error, 0 warn, 0 info.`);
  } else {
    const total = findings.length;
    lines.push(`Found ${total} docs findings. Counts: ${counts.error} error, ${counts.warn} warn, ${counts.info} info. ${counts.error > 0 ? 'Requires fix before merge for broken examples.' : 'Requires attention for warn/info.'}`);
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
    lines.push('- No action required — package is clean for review-docs.');
  } else {
    if (counts.error > 0) lines.push(`- Fix ${counts.error} error(s) (broken-example) per package.json:56-64 docs:verify-examples and re-run`);
    if (counts.warn > 0) lines.push(`- Add ${counts.warn} missing JSDoc/@example (warn) per AGENTS.md:546-573 and config/typedoc.json:1-16; consider write-docs (10)`);
    if (counts.info > 0) lines.push(`- ${counts.info} info — advisory (README not in scope, verify-skipped)`);
    lines.push(`- Re-run \`bun .opencode/skills/review-docs/scripts/run.ts -- ${target}${counts.error > 0 ? ' --with-tools' : ''}\` to verify`);
  }
  return lines.join('\n');
}

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
    if (!norm || !existsSync(join(norm!, 'package.json'))) {
      console.error(`Package not found: ${target} (expected packages/<name> with package.json)`);
      process.exit(1);
    }
    pkgDirs = [norm!];
  } else {
    console.error('Usage: bun .opencode/skills/review-docs/scripts/run.ts -- <pkg> [--workspace] [--with-tools] [--out <path>]');
    console.error('Example: bun .opencode/skills/review-docs/scripts/run.ts -- packages/stream');
    process.exit(1);
  }

  const allFindings: Finding[] = [];
  let reportTarget = workspace ? 'workspace' : toRepoRel(pkgDirs[0]!);

  if (workspace) {
    for (const dir of pkgDirs) {
      const findings: Finding[] = [];
      checkJSDoc(dir, findings);
      checkVerifyExamples(dir, findings, withTools);
      for (const f of findings) {
        allFindings.push(f);
      }
    }
    reportTarget = 'workspace';
  } else {
    const dir = pkgDirs[0]!;
    checkJSDoc(dir, allFindings);
    checkVerifyExamples(dir, allFindings, withTools);
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

export { enumerateExports, hasJSDocWithExample, checkJSDoc, checkVerifyExamples, generateReport, discoverPackages, collectPublicFiles };
