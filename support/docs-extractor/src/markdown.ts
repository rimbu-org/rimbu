/**
 * Stage 3 — Markdown renderer (LLM-review `API_SURFACE.md`).
 *
 * A second consumer of the Stage 2 aggregate (docs/api.aggregate.json). Produces
 * a single flat Markdown document summarizing every public entity and its
 * members — the same source of truth as the Starlight site, so the two cannot
 * diverge. Advanced-tier and `core` redirects are marked but not expanded.
 *
 * Run: `bun run src/markdown.ts`  (from support/docs-extractor), or
 *      `bun run docs:markdown` from the repo root.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

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
const AGGREGATE = join(ROOT, 'docs', 'api.aggregate.json');
const OUT = join(ROOT, 'API_SURFACE.md');

interface Signature {
  text: string;
  returnsNonEmpty: boolean;
}
interface Member {
  name: string;
  kind: string;
  signatures: Signature[];
  inheritedFrom?: string;
}
interface Entity {
  id: string;
  name: string;
  qualifiedName: string;
  package: string;
  tier: 'public' | 'advanced';
  kind: string;
  doc?: { summary?: string };
  type?: { typeParams: string[]; extends: string[]; members: Member[] };
  namespace?: { members: { id: string; name: string }[] };
  value?: { staticMethods: Member[] };
  redirected?: boolean;
  canonicalId?: string;
  ancestors?: string[];
}
interface Aggregate {
  generatedAt: string;
  gitRef: string;
  packages: string[];
  counts: Record<string, number>;
  entities: Record<string, Entity>;
}

const firstLine = (s?: string) => (s || '').split('\n')[0].trim();

function renderMember(m: Member): string[] {
  const lines: string[] = [];
  const ne = m.signatures.some((s) => s.returnsNonEmpty) ? ' [NonEmpty]' : '';
  const inh = m.inheritedFrom ? ` (inherited from ${m.inheritedFrom})` : '';
  lines.push(`- \`${m.name}\`${ne}${inh}`);
  for (const s of m.signatures) {
    lines.push('  ```ts');
    for (const l of s.text.split('\n')) lines.push('  ' + l);
    lines.push('  ```');
  }
  return lines;
}

function renderEntity(e: Entity, agg: Aggregate): string[] {
  const lines: string[] = [];
  const tp = e.type?.typeParams?.length ? `<${e.type.typeParams.join(', ')}>` : '';
  const flags: string[] = [e.kind];
  if (e.tier === 'advanced') flags.push('advanced');
  lines.push(`### ${e.qualifiedName}${tp}  _(${flags.join(', ')})_`);
  const summary = firstLine(e.doc?.summary);
  if (summary) lines.push('', summary);

  if (e.redirected && e.canonicalId && e.canonicalId !== e.id) {
    lines.push('', `Re-exported via \`@rimbu/core\`. Canonical: \`${e.canonicalId}\`.`);
    return lines;
  }

  if (e.type?.extends?.length) {
    lines.push('', `Extends: ${e.type.extends.map((x) => `\`${x}\``).join(', ')}`);
  }

  if (e.type?.members?.length) {
    const own = e.type.members.filter((m) => !m.inheritedFrom);
    const inh = e.type.members.filter((m) => m.inheritedFrom);
    if (own.length) {
      lines.push('', '**Members:**');
      for (const m of own) lines.push(...renderMember(m));
    }
    if (inh.length) {
      lines.push('', '**Inherited members:**');
      for (const m of inh) lines.push(...renderMember(m));
    }
  }

  if (e.value?.staticMethods?.length) {
    lines.push('', '**Static methods:**');
    for (const m of e.value.staticMethods) lines.push(...renderMember(m));
  }

  if (e.namespace?.members?.length) {
    const rel = e.namespace.members.filter((n) => agg.entities[n.id]);
    if (rel.length) {
      lines.push('', `Related types: ${rel.map((n) => `\`${n.name}\``).join(', ')}`);
    }
  }

  return lines;
}

function main(): void {
  if (!existsSync(AGGREGATE)) {
    console.error(`Aggregate not found: ${AGGREGATE}. Run 'bun run docs' first.`);
    process.exit(1);
  }
  const agg = JSON.parse(readFileSync(AGGREGATE, 'utf8')) as Aggregate;

  const byPkg = new Map<string, Entity[]>();
  for (const e of Object.values(agg.entities)) {
    if (!byPkg.has(e.package)) byPkg.set(e.package, []);
    byPkg.get(e.package)!.push(e);
  }

  const out: string[] = [];
  out.push('# Rimbu API Surface');
  out.push('');
  out.push(
    '> Generated from `docs/api.aggregate.json` by `support/docs-extractor/src/markdown.ts`.',
    '> Do not edit by hand — regenerate with `bun run docs:markdown`.'
  );
  out.push('');
  out.push(
    `Packages: ${agg.packages.length} · Entities: ${agg.counts.entities} ` +
      `(public ${agg.counts.public}, advanced ${agg.counts.advanced}, companion ${agg.counts.companion}) · ` +
      `git ref: \`${agg.gitRef}\``
  );
  out.push('');

  for (const pkg of [...byPkg.keys()].sort()) {
    out.push(`## ${pkg}`);
    out.push('');
    const ents = byPkg
      .get(pkg)!
      .slice()
      .sort((a, b) => a.qualifiedName.localeCompare(b.qualifiedName));
    for (const e of ents) {
      out.push(...renderEntity(e, agg));
      out.push('');
    }
  }

  writeFileSync(OUT, out.join('\n'));
  console.log(`API surface written to ${OUT} (${out.length} lines)`);
}

main();
