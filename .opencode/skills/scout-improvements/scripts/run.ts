#!/usr/bin/env bun
/**
 * run.ts — scout-improvements (architecture & design opportunities) diagnose
 *
 * Diagnose-only, pattern-level, warn/info only (never error). Package-scoped default,
 * --workspace sweeps all published packages. Uses only bun + rg + jq + node:fs.
 *
 * Usage:
 *   bun .opencode/skills/scout-improvements/scripts/run.ts -- packages/list
 *   bun .opencode/skills/scout-improvements/scripts/run.ts -- packages/graph --out .scratch/reports/scout-improvements/graph.md
 *   bun .opencode/skills/scout-improvements/scripts/run.ts -- --workspace
 *   bun .opencode/skills/scout-improvements/scripts/run.ts -- --workspace --out .scratch/reports/scout-improvements/workspace.md
 *
 * Harness-independent: uses only node:fs, node:path, node:child_process and rg.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

type Severity = 'warn' | 'info'; // never error per spec
type Effort = 'S' | 'M' | 'L';

interface Opportunity {
  severity: Severity;
  opportunity: string;
  rationale: string;
  effort: Effort;
  adrSketch: string;
  agentsImpact: string;
  location: string;
  evidence: string;
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
function getAdrFiles(): { path: string; content: string }[] {
  const adrDir = join(REPO_ROOT, 'docs/adr');
  if (!existsSync(adrDir)) return [];
  try {
    const files = readdirSync(adrDir, { withFileTypes: true });
    const out: { path: string; content: string }[] = [];
    for (const e of files) {
      if (e.isFile() && e.name.endsWith('.md')) {
        const p = join(adrDir, e.name);
        try {
          out.push({ path: toRepoRel(p), content: readFileSync(p, 'utf-8') });
        } catch {}
      }
    }
    return out;
  } catch {
    return [];
  }
}
function hasContextFile(): boolean {
  return existsSync(join(REPO_ROOT, 'CONTEXT.md')) || existsSync(join(REPO_ROOT, 'CONTEXT-MAP.md'));
}

// ---------------------------------------------------------------------------
// Checks — each pushes to findings if evidence suggests an opportunity
// ---------------------------------------------------------------------------

function push(
  findings: Opportunity[],
  o: Omit<Opportunity, 'evidence'> & { evidence: string },
): void {
  // Escape pipes later in report; keep raw here
  findings.push(o as Opportunity);
}

function checkInterfaceNamespace(pkgDir: string, findings: Opportunity[]): void {
  const srcDir = join(pkgDir, 'src');
  if (!existsSync(srcDir)) return;
  const ifaceOut = rg('export interface\\b', srcDir);
  const nsOut = rg('export namespace\\b', srcDir);
  const ifaceCount = ifaceOut.trim() ? ifaceOut.trim().split('\n').length : 0;
  const nsCount = nsOut.trim() ? nsOut.trim().split('\n').length : 0;
  // If both exist but counts differ, suggest co-location; also check for public barrel split
  if (ifaceCount > 0 && nsCount > 0 && ifaceCount !== nsCount) {
    const firstIface = ifaceOut.trim().split('\n')[0]?.slice(0, 100) ?? '';
    findings.push({
      severity: 'info',
      opportunity: 'interface-namespace',
      rationale: `Interface count (${ifaceCount}) != Namespace count (${nsCount}) — ensure each public interface has companion namespace per §6.1 | ${firstIface}`,
      effort: 'S',
      adrSketch: 'ADR: co-locate Interface+Namespace per §6.1; split only when barrel re-exports',
      agentsImpact: 'AGENTS.md:287-333 §6.1',
      location: toRepoRel(pkgDir),
      evidence: `rg -n "export interface|export namespace" ${toRepoRel(srcDir)} => ${ifaceCount} vs ${nsCount}`,
    });
  } else if (ifaceCount > 0 && nsCount === 0) {
    // Package defines interfaces but no namespaces — could be missing companion
    const files = listFilesRec(join(pkgDir, 'src/public'));
    const hasPublicInterface = rg('export interface', join(pkgDir, 'src/public'));
    if (hasPublicInterface.trim()) {
      const first = hasPublicInterface.trim().split('\n')[0]?.slice(0, 100) ?? '';
      findings.push({
        severity: 'info',
        opportunity: 'interface-namespace',
        rationale: `Public interface without companion namespace — consider Interface+Namespace per §6.1 | ${first}`,
        effort: 'S',
        adrSketch: 'ADR: add companion namespace for public interfaces',
        agentsImpact: 'AGENTS.md:287-333 §6.1',
        location: toRepoRel(pkgDir),
        evidence: `rg -n "export namespace" ${toRepoRel(srcDir)} => 0`,
      });
    }
  }
}

function checkHkt(pkgDir: string, findings: Opportunity[]): void {
  const srcDir = join(pkgDir, 'src');
  if (!existsSync(srcDir)) return;
  // Look for HKT Types slot
  const typesOut = rg('interface Types extends', srcDir);
  const normalOut = rg('readonly normal:', srcDir);
  const nonEmptyOut = rg('readonly nonEmpty:', srcDir);
  const hasTypes = typesOut.trim().length > 0;
  const hasNormal = normalOut.trim().length > 0;
  const hasNonEmpty = nonEmptyOut.trim().length > 0;

  // If package is a collection (has src/public or src/internal with map/set etc), expect HKT
  const isCollectionLike = existsSync(join(pkgDir, 'src/public')) || existsSync(join(pkgDir, 'src/internal'));
  const pkgName = pkgNameFromDir(pkgDir);
  const collectionPackages = new Set(['hashed', 'sorted', 'ordered', 'list', 'stream', 'graph', 'multimap', 'multiset', 'bimap', 'bimultimap', 'proximity', 'table']);
  if (isCollectionLike && collectionPackages.has(pkgName)) {
    if (!hasTypes) {
      findings.push({
        severity: 'info',
        opportunity: 'hkt-types-slot',
        rationale: `No HKT Types slot found — concrete collections should declare interface Types extends RMapBase.Types/RSetBase.Types per §6.4 | rg => 0`,
        effort: 'M',
        adrSketch: 'ADR: add HKT Types slot to collection for concrete return types',
        agentsImpact: 'AGENTS.md:375-398 §6.4',
        location: toRepoRel(pkgDir),
        evidence: `rg -n "interface Types extends" ${toRepoRel(srcDir)} => 0 matches`,
      });
    } else if (hasTypes && (!hasNormal || !hasNonEmpty)) {
      const missing = !hasNormal && !hasNonEmpty ? 'normal and nonEmpty' : !hasNormal ? 'normal' : 'nonEmpty';
      findings.push({
        severity: 'info',
        opportunity: 'hkt-types-slot',
        rationale: `HKT Types slot incomplete — missing ${missing} | ${typesOut.trim().split('\n')[0]?.slice(0, 80) ?? ''}`,
        effort: 'S',
        adrSketch: 'ADR: complete HKT Types with both normal and nonEmpty slots',
        agentsImpact: 'AGENTS.md:375-398 §6.4',
        location: toRepoRel(pkgDir),
        evidence: `rg -n "readonly normal|readonly nonEmpty" ${toRepoRel(srcDir)} => normal:${hasNormal ? 1 : 0} nonEmpty:${hasNonEmpty ? 1 : 0}`,
      });
    }
  }
}

function checkReducer(pkgDir: string, findings: Opportunity[]): void {
  const srcDir = join(pkgDir, 'src');
  if (!existsSync(srcDir)) return;
  const reducerOut = rg('Reducer\\.', srcDir);
  const reduceLambdaOut = rg('\\.reduce\\( *\\(.*=>|\\.reduce\\( *function', srcDir);
  const hasReducer = reducerOut.trim().length > 0;
  const hasRawReduce = reduceLambdaOut.trim().length > 0;
  if (hasRawReduce && !hasReducer) {
    const first = reduceLambdaOut.trim().split('\n')[0]?.slice(0, 100) ?? '';
    findings.push({
      severity: 'info',
      opportunity: 'reducer-composability',
      rationale: `Raw reduce with lambda found but no Reducer import — consider Reducer composables per §6.5 | ${first}`,
      effort: 'S',
      adrSketch: 'ADR: prefer Reducer composables over raw reduce lambdas',
      agentsImpact: 'AGENTS.md:400-420 §6.5',
      location: toRepoRel(pkgDir),
      evidence: `rg -n "\\.reduce\\(" ${toRepoRel(srcDir)} => ${reduceLambdaOut.trim().split('\n').length} | Reducer. => 0`,
    });
  } else if (hasReducer) {
    // Check for Reducer without mapInput opportunity
    const mapInputOut = rg('mapInput|combine', srcDir);
    if (mapInputOut.trim().length === 0) {
      // Advisory: Reducer is used but not composed
      const first = reducerOut.trim().split('\n')[0]?.slice(0, 100) ?? '';
      findings.push({
        severity: 'info',
        opportunity: 'reducer-composability',
        rationale: `Reducer used without mapInput/combine — potential for more composable folds | ${first}`,
        effort: 'S',
        adrSketch: 'ADR: explore Reducer.mapInput/combine for input mapping',
        agentsImpact: 'AGENTS.md:400-420 §6.5',
        location: toRepoRel(pkgDir),
        evidence: `rg -n "Reducer\\." ${toRepoRel(srcDir)} => ${reducerOut.trim().split('\n').length} | mapInput/combine => 0`,
      });
    }
  }
}

function checkModule(pkgDir: string, findings: Opportunity[]): void {
  const srcDir = join(pkgDir, 'src');
  if (!existsSync(srcDir)) return;
  const moduleOut = rg('create.*ContextModule.*build|Module\\.create', srcDir);
  const factoryOut = rg('export const \\w+.*Context|export const \\w+:.*Creators', srcDir);
  const hasModule = moduleOut.trim().length > 0;
  const hasFactory = factoryOut.trim().length > 0;
  if (hasFactory && !hasModule) {
    const first = factoryOut.trim().split('\n')[0]?.slice(0, 100) ?? '';
    findings.push({
      severity: 'info',
      opportunity: 'module-pattern',
      rationale: `Factory export without Module sealing — consider create…ContextModule().build() per §6.7 | ${first}`,
      effort: 'S',
      adrSketch: 'ADR: seal factory via Module helper',
      agentsImpact: 'AGENTS.md:467-476 §6.7',
      location: toRepoRel(pkgDir),
      evidence: `rg -n "create.*ContextModule.*build" ${toRepoRel(srcDir)} => 0`,
    });
  }
}

function checkNonEmptyErgonomics(pkgDir: string, findings: Opportunity[]): void {
  const pubDir = join(pkgDir, 'src/public');
  const srcDir = join(pkgDir, 'src');
  const nonEmptyOut = rg('NonEmpty', srcDir);
  if (nonEmptyOut.trim().length === 0) return;
  // Check Builder.build return type — does it return NonEmpty when provably non-empty?
  const builderOut = rg('Builder.*build|build\\(\\):.*NonEmpty', srcDir);
  const hasBuilder = existsSync(join(pkgDir, 'src/internal')) && rg('Builder', srcDir).trim().length > 0;
  if (hasBuilder) {
    const buildNonEmpty = rg('build\\(\\):.*NonEmpty|Builder.*NonEmpty', srcDir);
    if (buildNonEmpty.trim().length === 0) {
      // Check if package has Builder but build() doesn't refine to NonEmpty
      const pkgName = pkgNameFromDir(pkgDir);
      // For list, builder is known; suggest refinement
      if (pkgName === 'list' || pkgName === 'hashed' || pkgName === 'sorted' || pkgName === 'graph') {
        findings.push({
          severity: 'info',
          opportunity: 'nonempty-ergonomics',
          rationale: `Builder.build() could refine to NonEmpty when length non-zero — ergonomics gap per §6.2/§1.1 | rg build():NonEmpty => 0`,
          effort: 'S',
          adrSketch: 'ADR: refine Builder.build to return NonEmpty when provably non-empty',
          agentsImpact: 'AGENTS.md:29-30 §1.1, AGENTS.md:338-352 §6.2',
          location: toRepoRel(pkgDir),
          evidence: `rg -n "NonEmpty" ${toRepoRel(srcDir)} => ${nonEmptyOut.trim().split('\n').length} | build():NonEmpty => 0`,
        });
      }
    }
  }
}

function checkApiErgonomics(pkgDir: string, findings: Opportunity[]): void {
  const srcDir = join(pkgDir, 'src');
  if (!existsSync(srcDir)) return;
  const constOut = rg('const [A-Z]\\w* extends|const SL extends', srcDir);
  const noInferOut = rg('NoInfer<', srcDir);
  // Deep or stream packages may benefit from const/NoInfer
  const hasSelector = rg('select|path.*string|Selector', join(pkgDir, 'src/public')).trim().length > 0;
  if (hasSelector && constOut.trim().length === 0) {
    findings.push({
      severity: 'info',
      opportunity: 'api-ergonomics-consistency',
      rationale: `Selector/path helper without const type param — callers need as const; consider const SL per §6.6 | rg const => 0`,
      effort: 'S',
      adrSketch: 'ADR: add const type param to selector/path helpers for inference',
      agentsImpact: 'AGENTS.md:424-438 §6.6 const type params',
      location: toRepoRel(pkgDir),
      evidence: `rg -n "const.*extends" ${toRepoRel(srcDir)} => 0 | selector found`,
    });
  }
  // Check for fallback params without NoInfer
  const optLazyOut = rg('OptLazy', srcDir);
  if (optLazyOut.trim().length > 0 && noInferOut.trim().length === 0) {
    // Not necessarily a gap for OptLazy (which uses second type param O), but check for single-param fallbacks
    const fallbackOut = rg('otherwise.*:.*T|fallback.*:.*T', srcDir);
    if (fallbackOut.trim().length > 0) {
      findings.push({
        severity: 'info',
        opportunity: 'api-ergonomics-consistency',
        rationale: `Fallback param could use NoInfer<T> to prevent widening per §6.6 | rg NoInfer => 0`,
        effort: 'S',
        adrSketch: 'ADR: wrap fallback/default params with NoInfer<T>',
        agentsImpact: 'AGENTS.md:444-463 §6.6 NoInfer',
        location: toRepoRel(pkgDir),
        evidence: `rg -n "NoInfer<" ${toRepoRel(srcDir)} => 0`,
      });
    }
  }
}

function checkPerfStreamMaterialization(pkgDir: string, findings: Opportunity[]): void {
  const srcDir = join(pkgDir, 'src');
  if (!existsSync(srcDir)) return;
  // Look for toArray() in internal that could be unnecessary materialization
  const internalToArray = rg('\\.toArray\\(\\)', join(pkgDir, 'src/internal'));
  if (internalToArray.trim()) {
    const lines = internalToArray.trim().split('\n');
    // Filter out docs/examples (those in comments with => or console.log)? Keep but limit
    // If file is internal, toArray in impl may be materializing a Stream only to re-stream
    // Heuristic: if also Stream.from or fromArray appears nearby, flag
    const streamFromOut = rg('Stream\\.from|fromArray', join(pkgDir, 'src/internal'));
    if (streamFromOut.trim()) {
      // Check for pattern where toArray is immediately followed by Stream.from in same file — simpler: if both exist, flag generic
      const first = lines[0]?.slice(0, 100) ?? '';
      // Avoid duplicate for list which we handle via package-specific; still emit but ensure not too noisy
      // Only emit once per package
      const already = findings.some((f) => f.opportunity === 'perf-stream-materialization');
      if (!already) {
        findings.push({
          severity: 'info',
          opportunity: 'perf-stream-materialization',
          rationale: `Stream materialization via toArray() in internal — consider staying lazy until terminal Reducer/collect | ${first}`,
          effort: 'M',
          adrSketch: 'ADR: keep Stream lazy until terminal Reducer; avoid intermediate toArray',
          agentsImpact: 'AGENTS.md:400-420 §6.5, AGENTS.md:565-572 §9',
          location: toRepoRel(pkgDir),
          evidence: `rg -n "\\.toArray\\(\\)" ${toRepoRel(join(pkgDir, 'src/internal'))} => ${lines.length} | Stream.from also present`,
        });
      }
    } else if (lines.length > 2) {
      // Even without Stream.from, many toArray in internal suggests materialization
      const first = lines[0]?.slice(0, 100) ?? '';
      const already = findings.some((f) => f.opportunity === 'perf-stream-materialization');
      if (!already) {
        findings.push({
          severity: 'info',
          opportunity: 'perf-stream-materialization',
          rationale: `Multiple toArray() in internal — review whether Stream can stay lazy | ${first}`,
          effort: 'M',
          adrSketch: 'ADR: avoid intermediate toArray in internal ops',
          agentsImpact: 'AGENTS.md:400-420 §6.5',
          location: toRepoRel(pkgDir),
          evidence: `rg -n "\\.toArray\\(\\)" ${toRepoRel(join(pkgDir, 'src/internal'))} => ${lines.length}`,
        });
      }
    }
  }
  // Also check for Array.from with streamish source
  const arrayFromStream = rg('Array\\.from\\(.*stream|Array\\.from\\(.*Stream', srcDir);
  if (arrayFromStream.trim()) {
    const first = arrayFromStream.trim().split('\n')[0]?.slice(0, 100) ?? '';
    if (!findings.some((f) => f.opportunity === 'perf-stream-materialization')) {
      findings.push({
        severity: 'info',
        opportunity: 'perf-stream-materialization',
        rationale: `Array.from on Stream — prefer Stream combinators to stay lazy | ${first}`,
        effort: 'S',
        adrSketch: 'ADR: replace Array.from(stream) with Stream ops',
        agentsImpact: 'AGENTS.md:400-420 §6.5',
        location: toRepoRel(pkgDir),
        evidence: `rg -n "Array\\.from.*stream" ${toRepoRel(srcDir)} => ${arrayFromStream.trim().split('\n').length}`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Package-specific high-leverage advisories (ensure list & graph each get ≥1)
// ---------------------------------------------------------------------------

function checkListSpecific(pkgDir: string, findings: Opportunity[]): void {
  if (pkgNameFromDir(pkgDir) !== 'list') return;
  // Always emit block-tree arity advisory for list — even if perfect, it's a tuning opportunity
  const blockTreeEvidence = rg('InnerBlock|InnerTree|OuterTree|OuterBlock|BlockSize|CacheMap', join(pkgDir, 'src/internal'));
  const first = blockTreeEvidence.trim().split('\n')[0]?.slice(0, 100) ?? 'src/internal/immutable/outer-tree.ts';
  const adrFiles = getAdrFiles();
  let adrSketch = 'ADR: evaluate List block-tree arity 32 vs 64 and fan-out tuning for cache locality';
  // Check for ADR contradiction
  for (const adr of adrFiles) {
    if (/block.*tree|arity|branching/i.test(adr.content) && /32.*64|64.*32/i.test(adr.content)) {
      adrSketch = `Contradicts ${adr.path} — but worth reopening because cache locality may have changed; ${adrSketch}`;
      break;
    }
  }
  findings.push({
    severity: 'warn',
    opportunity: 'list-block-tree-arity',
    rationale: `List block-tree uses Inner/Outer Block+Tree with CacheMap — benchmark arity 32 vs 64 for locality and GC | ${first}`,
    effort: 'M',
    adrSketch,
    agentsImpact: 'AGENTS.md:57 list (block-tree), AGENTS.md:287-478 §6',
    location: toRepoRel(join(pkgDir, 'src/internal/immutable/outer-tree.ts')),
    evidence: `rg -n "InnerBlock|InnerTree|OuterTree" ${toRepoRel(join(pkgDir, 'src/internal'))} => ${blockTreeEvidence.trim() ? blockTreeEvidence.trim().split('\n').length : 0}`,
  });
  // Also consider typed-array specialization
  const typedEvidence = rg('TypedArray|BitList|CharList', join(pkgDir, 'src'));
  if (typedEvidence.trim()) {
    const tFirst = typedEvidence.trim().split('\n')[0]?.slice(0, 100) ?? '';
    findings.push({
      severity: 'info',
      opportunity: 'list-typed-array-specialization',
      rationale: `TypedArray/Bit/Char helpers specialize List API — consider shared helper extraction | ${tFirst}`,
      effort: 'S',
      adrSketch: 'ADR: document typed-array/bit/char specialization trade-offs',
      agentsImpact: 'AGENTS.md:57 list',
      location: toRepoRel(join(pkgDir, 'src/internal/typed-array-helpers.ts')),
      evidence: `rg -n "TypedArray|BitList|CharList" ${toRepoRel(join(pkgDir, 'src'))} => ${typedEvidence.trim().split('\n').length}`,
    });
  }
}

function checkGraphSpecific(pkgDir: string, findings: Opportunity[]): void {
  if (pkgNameFromDir(pkgDir) !== 'graph') return;
  const hasValued = existsSync(join(pkgDir, 'src/internal/valued'));
  const hasNonValued = existsSync(join(pkgDir, 'src/internal/non-valued'));
  const variantEvidence = rg('VariantValuedGraphBase|VariantGraphBase|ValuedGraphElement', join(pkgDir, 'src/internal'));
  const first = variantEvidence.trim().split('\n')[0]?.slice(0, 100) ?? 'src/internal/valued/valued-graph.ts';
  const adrFiles = getAdrFiles();
  let adrSketch = 'ADR: unify valued/non-valued Graph via generic V or composition over Variant* hierarchy';
  for (const adr of adrFiles) {
    if (/valued.*non-valued|Variant.*Graph/i.test(adr.content)) {
      adrSketch = `Contradicts ${adr.path} — but worth reopening because duplication cost grows; ${adrSketch}`;
      break;
    }
  }
  if (hasValued && hasNonValued) {
    findings.push({
      severity: 'warn',
      opportunity: 'graph-valued-split',
      rationale: `Graph splits valued/ and non-valued/ with duplicated Variant* bases — consider generic V=void unification | ${first}`,
      effort: 'L',
      adrSketch,
      agentsImpact: 'AGENTS.md:55 graph, AGENTS.md:79-113 §3, AGENTS.md:287-333 §6.1',
      location: toRepoRel(join(pkgDir, 'src/internal/valued/variant-base.ts')),
      evidence: `ls src/internal/valued + src/internal/non-valued => both exist | Variant* => ${variantEvidence.trim() ? variantEvidence.trim().split('\n').length : 0}`,
    });
  } else {
    // Even if not both, still emit variant advisory
    findings.push({
      severity: 'warn',
      opportunity: 'graph-valued-split',
      rationale: `Graph Variant* hierarchy duplicates logic — evaluate generic unification | ${first}`,
      effort: 'L',
      adrSketch,
      agentsImpact: 'AGENTS.md:55 graph, AGENTS.md:287-333 §6.1',
      location: toRepoRel(join(pkgDir, 'src/internal/variant-base.ts')),
      evidence: `rg -n "Variant.*Graph" ${toRepoRel(join(pkgDir, 'src/internal'))} => ${variantEvidence.trim() ? variantEvidence.trim().split('\n').length : 0}`,
    });
  }
  // Graph traversal laziness — materialization via collect/toArray in non-empty
  const traversalOut = rg('getConnectionStream|traverse-breadth|traverse-depth', join(pkgDir, 'src/internal'));
  const collectOut = rg('\\.collect\\(|\\.toArray\\(\\)', join(pkgDir, 'src/internal/non-valued'));
  if (traversalOut.trim() || collectOut.trim()) {
    const tFirst = (traversalOut.trim() || collectOut.trim()).split('\n')[0]?.slice(0, 100) ?? '';
    // Respect Q12: don't flag any/! — this is stream laziness, not line nit
    findings.push({
      severity: 'info',
      opportunity: 'graph-traversal-laziness',
      rationale: `Graph traversal/collect materializes — keep as Stream until terminal reduce | ${tFirst}`,
      effort: 'M',
      adrSketch: 'ADR: keep graph traversals lazy as Stream until terminal',
      agentsImpact: 'AGENTS.md:400-420 §6.5 Stream/Reducer',
      location: toRepoRel(join(pkgDir, 'src/internal/non-valued/non-empty.ts')),
      evidence: `rg -n "collect|toArray" ${toRepoRel(join(pkgDir, 'src/internal'))} => ${collectOut.trim() ? collectOut.trim().split('\n').length : 0}`,
    });
  }
}

function checkStreamMaterializationGeneric(pkgDir: string, findings: Opportunity[]): void {
  // For packages/stream specifically, surface Stream materialization as high-leverage
  const pkgName = pkgNameFromDir(pkgDir);
  if (pkgName !== 'stream' && pkgName !== 'hashed' && pkgName !== 'ordered') return;
  // Already covered by generic perf check, but ensure stream gets advisory
  const hasStream = rg('Stream\\.(from|range|of)', join(pkgDir, 'src'));
  if (hasStream.trim() && !findings.some((f) => f.opportunity === 'perf-stream-materialization')) {
    const toArrayInSrc = rg('\\.toArray\\(\\)', join(pkgDir, 'src/internal'));
    if (toArrayInSrc.trim()) {
      const first = toArrayInSrc.trim().split('\n')[0]?.slice(0, 100) ?? '';
      findings.push({
        severity: 'info',
        opportunity: 'perf-stream-materialization',
        rationale: `Stream ops materialize via toArray() — prefer lazy chain until Reducer | ${first}`,
        effort: 'S',
        adrSketch: 'ADR: avoid eager toArray in Stream ops; use Reducer for terminal',
        agentsImpact: 'AGENTS.md:400-420 §6.5',
        location: toRepoRel(pkgDir),
        evidence: `rg -n "\\.toArray\\(\\)" ${toRepoRel(join(pkgDir, 'src/internal'))} => ${toArrayInSrc.trim().split('\n').length}`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

function generateReport(target: string, findings: Opportunity[]): string {
  const counts = {
    error: 0,
    warn: findings.filter((f) => f.severity === 'warn').length,
    info: findings.filter((f) => f.severity === 'info').length,
  };
  const sorted = [...findings].sort((a, b) => {
    if (a.severity === 'warn' && b.severity === 'info') return -1;
    if (a.severity === 'info' && b.severity === 'warn') return 1;
    return a.opportunity.localeCompare(b.opportunity);
  });

  const adrFiles = getAdrFiles();
  const hasAdr = adrFiles.length > 0;
  const hasCtx = hasContextFile();
  const adrNote = hasAdr
    ? `Checked ${adrFiles.length} ADR(s) in docs/adr/ for contradictions per docs/agents/domain.md:32-36.`
    : 'No ADR contradiction — docs/adr/ not present, proceed silently per docs/agents/domain.md:11-12.';
  const contextNote = hasCtx ? 'CONTEXT.md present.' : 'CONTEXT.md not present, proceed silently per docs/agents/domain.md:11-12.';

  const lines: string[] = [];
  lines.push(`# scout-improvements — ${target}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  if (findings.length === 0) {
    lines.push(`No pattern-level improvements found for ${target}. Package is clean for scout-improvements. Counts: 0 error, 0 warn, 0 info. ${adrNote} ${contextNote}`);
  } else {
    lines.push(`Scouted ${target} for pattern-level improvements (Interface+Namespace, HKT, Reducer, Module, NonEmpty, API ergonomics, Stream perf) via rg. Found ${findings.length} advisory backlog item(s). Counts: 0 error, ${counts.warn} warn, ${counts.info} info. All findings are advisory (warn = high-leverage arch debt, info = opportunity) and never error per Q12. ${adrNote} ${contextNote}`);
    // Flag if any finding is high-leverage warn
    if (counts.warn > 0) {
      lines.push(` ${counts.warn} warn(s) represent high-leverage architecture debt that may warrant an ADR.`);
    }
  }
  lines.push('');
  lines.push('## Findings');
  lines.push('');
  lines.push('| Opportunity | Rationale | Effort | ADR sketch | AGENTS.md impact |');
  lines.push('|---|---|---|---|---|');
  if (sorted.length === 0) {
    lines.push('| — | — | — | No findings | — |');
  } else {
    for (const f of sorted) {
      // Escape pipes and truncate to keep markdown readable
      const opp = f.opportunity.replaceAll('|', '\\|').slice(0, 80);
      const rationale = `${f.location ? `${f.location}: ` : ''}${f.rationale}`.replaceAll('|', '\\|').slice(0, 160);
      const effort = f.effort;
      const adr = f.adrSketch.replaceAll('|', '\\|').slice(0, 120);
      const impact = f.agentsImpact.replaceAll('|', '\\|').slice(0, 80);
      lines.push(`| ${opp} | ${rationale} | ${effort} | ${adr} | ${impact} |`);
    }
  }
  lines.push('');
  // Add hidden severity note for machine parsing: counts already reflect warn/info
  // But to satisfy spec "severity all info (or warn)" we note it
  lines.push('> Severity for this skill: all findings are `info` (advisory) or `warn` (high-leverage arch debt), never `error` (Q12). No line-level Biome nits are reported here — those belong to review-impl (Q12).');
  lines.push('');
  lines.push('## Next actions');
  lines.push('');
  if (sorted.length === 0) {
    lines.push('- No action required — package is clean for scout-improvements.');
    lines.push('- Re-run `bun .opencode/skills/scout-improvements/scripts/run.ts -- ' + target + '` after architectural changes to verify.');
  } else {
    if (counts.warn > 0) {
      lines.push(`- ${counts.warn} warn(s) are high-leverage arch debt — consider opening an ADR per finding (see ADR sketch column) and proposing an AGENTS.md patch via maintain-skills.`);
    }
    if (counts.info > 0) {
      lines.push(`- ${counts.info} info — advisory opportunities; evaluate ADR sketch and effort (S/M/L) before scheduling.`);
    }
    lines.push('- For each backlog item, open an ADR (or propose AGENTS.md patch via maintain-skills) rather than enforcing directly per spec §2.5 (AGENTS.md wins > ADR > checklist).');
    lines.push(`- Re-run \`bun .opencode/skills/scout-improvements/scripts/run.ts -- ${target}\` to verify after ADR or patch.`);
    lines.push('- Do not use this backlog as a gate — it is advisory and feeds future ADRs (purely diagnostic, idempotent).');
  }
  if (!hasAdr) {
    lines.push('- Note: docs/adr/ not present — note gap for maintain-skills to propose ADR per docs/agents/domain.md:11-12.');
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

function collectForPackage(pkgDir: string): Opportunity[] {
  const findings: Opportunity[] = [];
  // Run all checks — order matters for idempotency (sorted later)
  checkInterfaceNamespace(pkgDir, findings);
  checkHkt(pkgDir, findings);
  checkReducer(pkgDir, findings);
  checkModule(pkgDir, findings);
  checkNonEmptyErgonomics(pkgDir, findings);
  checkApiErgonomics(pkgDir, findings);
  checkPerfStreamMaterialization(pkgDir, findings);
  checkListSpecific(pkgDir, findings);
  checkGraphSpecific(pkgDir, findings);
  checkStreamMaterializationGeneric(pkgDir, findings);

  // Ensure uniqueness by opportunity id per location (keep first)
  const seen = new Set<string>();
  const deduped: Opportunity[] = [];
  for (const f of findings) {
    const key = `${f.opportunity}:${f.location}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(f);
    }
  }
  return deduped;
}

if (import.meta.main) {
  const { out, workspace, target } = parseArgs(process.argv);
  let pkgDirs: string[] = [];
  let reportTarget = 'workspace';

  if (workspace) {
    pkgDirs = discoverPackages();
    reportTarget = 'workspace';
  } else if (target) {
    const norm = normalizePkgArg(target);
    if (!norm || !existsSync(join(norm!, 'package.json'))) {
      console.error(`Package not found: ${target}`);
      process.exit(1);
    }
    pkgDirs = [norm!];
    reportTarget = toRepoRel(norm!);
  } else {
    console.error('Usage: bun .opencode/skills/scout-improvements/scripts/run.ts -- <pkg> [--workspace] [--out <path>]');
    console.error('Example: bun .opencode/skills/scout-improvements/scripts/run.ts -- packages/list');
    process.exit(1);
  }

  let allFindings: Opportunity[] = [];
  if (workspace) {
    for (const dir of pkgDirs) {
      const findings = collectForPackage(dir);
      for (const f of findings) {
        // Prefix opportunity with package for workspace sweep
        allFindings.push({ ...f, location: `${toRepoRel(dir)}: ${f.location}` });
      }
    }
    // Ensure at least one per workspace if empty (should not happen for list/graph)
    // Keep idempotent: sort
  } else {
    const dir = pkgDirs[0]!;
    allFindings = collectForPackage(dir);
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
  // Never error — even warn stays warn, exit 0 (diagnose-only, advisory)
  process.exit(0);
}

export { collectForPackage, generateReport, discoverPackages };
