/**
 * Stage 2 — Rimbu docs aggregator.
 *
 * Merges every per-package `.api.json` (produced by Stage 1 `extract.ts`) into a
 * single root `docs/api.aggregate.json`, computes the global inheritance graph
 * (ancestors[] / descendants[] per entity), and enforces the pipeline gates.
 *
 * Deduplication: Stage 1 emits an entity under every package that reaches it
 * through inheritance or `core` re-export, so the same id can appear in many
 * per-package files. Exactly one copy per id is authoritative — the one emitted
 * by the id's *owning* package (id prefix === package name) that is not a
 * redirect. That owner copy wins; all other copies are dropped. `core`
 * re-exports are recorded as `redirected` pointers to the owner.
 *
 * Gates:
 *   1. Broken cross-package xref          -> hard fail
 *   2. Duplicate owner ids                -> hard fail
 *   3. Orphan base (extends -> no entity) -> hard fail
 *   4. Public entity missing a doc comment
 *        - default: warning (+ report file)
 *        - with --strict-docs / RIMBU_DOCS_STRICT=1: hard fail
 *      Packages in DOC_EXCLUDED are never checked.
 *
 * Run: `bun run src/aggregate.ts`  (from support/docs-extractor), or
 *      `bun run docs:aggregate` from the repo root.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

// ---------------------------------------------------------------------------
// Repo root discovery (cwd-independent, mirrors extract.ts)
// ---------------------------------------------------------------------------
function findRepoRoot(start: string): string {
  let dir = resolve(start);
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'packages')) && existsSync(join(dir, 'AGENTS.md'))) return dir;
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return resolve(start, '..', '..');
}
const ROOT = findRepoRoot(process.cwd());
const PACKAGES_DIR = join(ROOT, 'packages');
const DOCS_DIR = join(ROOT, 'docs');
const OUT_FILE = join(DOCS_DIR, 'api.aggregate.json');
const REPORT_FILE = join(DOCS_DIR, 'api.aggregate.report.json');

// Packages whose public entities are exempt from the missing-doc gate.
const DOC_EXCLUDED = new Set(['actor', 'reactor', 'spy', 'typical', 'core']);

// Missing-doc gate strictness.
const STRICT_DOCS =
  process.argv.includes('--strict-docs') ||
  process.env.RIMBU_DOCS_STRICT === '1' ||
  process.env.RIMBU_DOCS_STRICT === 'true';

// ---------------------------------------------------------------------------
// Types (shared shape with extract.ts output)
// ---------------------------------------------------------------------------
type Tier = 'public' | 'advanced';

interface DocComment {
  summary: string;
  description: string;
  params: { name: string; text: string }[];
  examples: string[];
  notes: string[];
  deprecated?: string;
  see: string[];
}

interface NestedType {
  id: string;
  name: string;
}

interface Member {
  name: string;
  kind: 'method' | 'property' | 'accessor';
  signatures: unknown[];
  inheritedFrom?: string;
  source?: unknown;
}

interface Entity {
  id: string;
  name: string;
  qualifiedName: string;
  package: string;
  tier: Tier;
  kind: string;
  doc?: DocComment;
  source?: unknown;
  type?: { typeParams: string[]; extends: string[]; members: Member[] };
  namespace?: { members: NestedType[] };
  value?: { staticMethods: Member[]; typeId?: string };
  redirected?: boolean;
  canonicalId?: string;
  // added by aggregation:
  ancestors?: string[];
  descendants?: string[];
}

interface PackageApi {
  $schema: string;
  package: string;
  dependsOn: string[];
  entities: Record<string, Entity>;
}

interface Redirect {
  from: string; // id as re-exported (e.g. by core)
  fromPackage: string; // package that re-exports it (e.g. @rimbu/core)
  canonicalId: string;
}

interface Aggregate {
  $schema: 'rimbu-docs/aggregate/v1';
  generatedAt: string;
  gitRef: string;
  packages: string[];
  counts: {
    entities: number;
    public: number;
    advanced: number;
    companion: number;
    redirects: number;
    droppedDuplicateCopies: number;
  };
  redirects: Redirect[];
  entities: Record<string, Entity>;
}

// ---------------------------------------------------------------------------
// Load per-package api files
// ---------------------------------------------------------------------------
function loadPackageApis(): { dir: string; api: PackageApi }[] {
  const out: { dir: string; api: PackageApi }[] = [];
  for (const dir of readdirSync(PACKAGES_DIR)) {
    const file = join(PACKAGES_DIR, dir, 'dist', 'api', `${dir}.api.json`);
    if (!existsSync(file)) continue;
    const api = JSON.parse(readFileSync(file, 'utf8')) as PackageApi;
    out.push({ dir, api });
  }
  return out;
}

function pkgPrefix(pkgName: string): string {
  return pkgName.replace(/^@rimbu\//, '');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main(): void {
  const apis = loadPackageApis();
  if (apis.length === 0) {
    console.error(
      'No per-package .api.json files found. Run the extractor first (bun run docs).'
    );
    process.exit(1);
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // --- Dedup: choose the owner copy for each id -----------------------------
  // owners: id -> Entity (authoritative). ownerPackages: id -> Set of packages
  // that emitted a non-redirected owner-prefixed copy (duplicate detection).
  const owners = new Map<string, Entity>();
  const ownerClaims = new Map<string, Set<string>>();
  const redirects: Redirect[] = [];
  let droppedDuplicateCopies = 0;

  for (const { api } of apis) {
    const prefix = pkgPrefix(api.package);
    for (const [id, entity] of Object.entries(api.entities)) {
      const idPrefix = id.split('/')[0];

      if (entity.redirected) {
        // A re-export (e.g. core). Record the pointer; do not treat as owner.
        redirects.push({
          from: id,
          fromPackage: api.package,
          canonicalId: entity.canonicalId ?? id,
        });
        continue;
      }

      if (idPrefix === prefix) {
        // Owner copy for this id.
        if (owners.has(id)) {
          // Two owner copies of the same id => genuine duplicate.
          droppedDuplicateCopies++;
          let s = ownerClaims.get(id);
          if (!s) ownerClaims.set(id, (s = new Set()));
          s.add(api.package);
        } else {
          owners.set(id, entity);
          const s = new Set<string>();
          s.add(api.package);
          ownerClaims.set(id, s);
        }
      } else {
        // Foreign inheritance-inlined copy; the owner package will provide the
        // authoritative one. Drop it.
        droppedDuplicateCopies++;
      }
    }
  }

  // Gate 2: duplicate owner ids.
  for (const [id, pkgs] of ownerClaims) {
    if (pkgs.size > 1) {
      errors.push(
        `Duplicate entity id "${id}" claimed by multiple owning packages: ${[...pkgs].join(', ')}`
      );
    }
  }

  const entities: Record<string, Entity> = {};
  for (const [id, e] of owners) entities[id] = e;

  // --- Gate 1 + 3: xref / orphan base --------------------------------------
  // Any referenced id (extends, namespace member, value.typeId) must resolve to
  // an emitted owner entity.
  const referenceProblems = new Map<string, Set<string>>(); // missingId -> referrers
  const addRef = (targetId: string | undefined, referrer: string) => {
    if (!targetId) return;
    if (!entities[targetId]) {
      let s = referenceProblems.get(targetId);
      if (!s) referenceProblems.set(targetId, (s = new Set()));
      s.add(referrer);
    }
  };

  for (const e of Object.values(entities)) {
    for (const ext of e.type?.extends ?? []) addRef(ext, e.id);
    for (const nm of e.namespace?.members ?? []) addRef(nm.id, e.id);
    addRef(e.value?.typeId, e.id);
  }

  for (const [missing, referrers] of referenceProblems) {
    // Distinguish orphan-base (extends) from generic broken xref for clarity;
    // both are hard failures.
    errors.push(
      `Broken reference: "${missing}" is referenced by [${[...referrers].join(', ')}] but no entity was emitted for it`
    );
  }

  // --- Redirects must resolve to a canonical owner -------------------------
  for (const r of redirects) {
    if (!entities[r.canonicalId]) {
      errors.push(
        `Redirect "${r.from}" (from ${r.fromPackage}) points to canonicalId "${r.canonicalId}" which has no owner entity`
      );
    }
  }

  // --- Inheritance graph: ancestors[] / descendants[] ----------------------
  // ancestors = transitive closure over type.extends. descendants = reverse.
  const directParents = new Map<string, string[]>();
  const directChildren = new Map<string, string[]>();
  for (const e of Object.values(entities)) {
    const parents = (e.type?.extends ?? []).filter((p) => entities[p]);
    directParents.set(e.id, parents);
    for (const p of parents) {
      let c = directChildren.get(p);
      if (!c) directChildren.set(p, (c = []));
      c.push(e.id);
    }
  }

  const ancestorCache = new Map<string, string[]>();
  const computeAncestors = (id: string, stack: Set<string>): string[] => {
    if (ancestorCache.has(id)) return ancestorCache.get(id)!;
    if (stack.has(id)) return []; // cycle guard
    stack.add(id);
    const acc: string[] = [];
    const seen = new Set<string>();
    for (const p of directParents.get(id) ?? []) {
      if (!seen.has(p)) {
        seen.add(p);
        acc.push(p);
      }
      for (const a of computeAncestors(p, stack)) {
        if (!seen.has(a)) {
          seen.add(a);
          acc.push(a);
        }
      }
    }
    stack.delete(id);
    ancestorCache.set(id, acc);
    return acc;
  };

  const descendantCache = new Map<string, string[]>();
  const computeDescendants = (id: string, stack: Set<string>): string[] => {
    if (descendantCache.has(id)) return descendantCache.get(id)!;
    if (stack.has(id)) return [];
    stack.add(id);
    const acc: string[] = [];
    const seen = new Set<string>();
    for (const c of directChildren.get(id) ?? []) {
      if (!seen.has(c)) {
        seen.add(c);
        acc.push(c);
      }
      for (const d of computeDescendants(c, stack)) {
        if (!seen.has(d)) {
          seen.add(d);
          acc.push(d);
        }
      }
    }
    stack.delete(id);
    descendantCache.set(id, acc);
    return acc;
  };

  for (const e of Object.values(entities)) {
    e.ancestors = computeAncestors(e.id, new Set());
    e.descendants = computeDescendants(e.id, new Set());
  }

  // --- Gate 4: missing public doc ------------------------------------------
  const missingDocs: string[] = [];
  const hasDoc = (d?: DocComment): boolean =>
    !!d && (!!d.summary?.trim() || !!d.description?.trim());
  for (const e of Object.values(entities)) {
    if (e.tier !== 'public') continue;
    const pkg = e.id.split('/')[0];
    if (DOC_EXCLUDED.has(pkg)) continue;
    if (!hasDoc(e.doc)) missingDocs.push(e.id);
  }
  missingDocs.sort();
  if (missingDocs.length > 0) {
    const msg = `${missingDocs.length} public entities are missing a doc comment (see ${REPORT_FILE})`;
    if (STRICT_DOCS) errors.push(msg);
    else warnings.push(msg);
  }

  // --- Warnings (non-fatal): deprecated w/o replacement --------------------
  for (const e of Object.values(entities)) {
    if (e.tier !== 'public') continue;
    const pkg = e.id.split('/')[0];
    if (DOC_EXCLUDED.has(pkg)) continue;
    if (e.doc?.deprecated !== undefined && e.doc.deprecated.trim() === '') {
      warnings.push(`Deprecated entity "${e.id}" has no replacement note`);
    }
  }

  // --- Counts ---------------------------------------------------------------
  const all = Object.values(entities);
  const counts = {
    entities: all.length,
    public: all.filter((e) => e.tier === 'public').length,
    advanced: all.filter((e) => e.tier === 'advanced').length,
    companion: all.filter((e) => e.kind === 'companion').length,
    redirects: redirects.length,
    droppedDuplicateCopies,
  };

  const aggregate: Aggregate = {
    $schema: 'rimbu-docs/aggregate/v1',
    generatedAt: new Date().toISOString(),
    gitRef: process.env.RIMBU_DOC_REF ?? 'main',
    packages: apis.map((a) => a.api.package).sort(),
    counts,
    redirects: redirects.sort((a, b) => a.from.localeCompare(b.from)),
    entities,
  };

  // --- Write report (always) ------------------------------------------------
  mkdirSync(DOCS_DIR, { recursive: true });
  const report = {
    generatedAt: aggregate.generatedAt,
    strictDocs: STRICT_DOCS,
    counts,
    errors,
    warnings,
    missingDocs,
  };
  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  // --- Report to console ----------------------------------------------------
  for (const w of warnings) console.warn(`warn:  ${w}`);
  for (const err of errors) console.error(`error: ${err}`);

  if (errors.length > 0) {
    console.error(
      `\nAggregation FAILED: ${errors.length} error(s), ${warnings.length} warning(s).`
    );
    console.error(`Report written to ${REPORT_FILE}`);
    process.exit(1);
  }

  writeFileSync(OUT_FILE, JSON.stringify(aggregate, null, 2));
  console.log(
    `Aggregate written to ${OUT_FILE}\n` +
      `  entities: ${counts.entities} (public ${counts.public}, advanced ${counts.advanced}, companion ${counts.companion})\n` +
      `  redirects: ${counts.redirects} | dropped duplicate copies: ${counts.droppedDuplicateCopies}\n` +
      `  warnings: ${warnings.length}` +
      (missingDocs.length
        ? ` (incl. ${missingDocs.length} missing-doc; run with --strict-docs to enforce)`
        : '')
  );
}

main();
