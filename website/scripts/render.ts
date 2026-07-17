/**
 * Stage 3 — Starlight MDX renderer.
 *
 * Reads the Stage 2 aggregate (docs/api.aggregate.json) and generates:
 *   - src/content/docs/api/<pkg>/index.mdx          (package overview)
 *   - src/content/docs/api/<pkg>/<slug>.mdx         (one page per entity)
 *   - src/content/docs/api/index.mdx                (API landing page)
 *   - src/content/docs/index.mdx                    (site homepage)
 *   - src/generated/sidebar.json                    (nav consumed by astro.config)
 *
 * Design decisions (from the plan grilling + follow-up):
 *   - Companion layout A: interface members first, then collapsible
 *     "Static methods" (value facet) and "Related types" (namespace facet).
 *   - Inheritance tree (ancestors + descendants) on every type page.
 *   - Overloads: all shown by default (NonEmpty-first contract visible), with a
 *     per-member expander; NonEmpty signatures badged.
 *   - Advanced-tier entities hidden by default (CSS + a global toggle).
 *   - `core` redirected entities render as short stubs linking to the canonical
 *     page (no duplicated bodies).
 *   - Source links per entity/member -> GitHub.
 */
import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
} from 'node:fs';
import { join, resolve, dirname } from 'node:path';

// --------------------------------------------------------------------------
// Paths
// --------------------------------------------------------------------------
function findRepoRoot(start: string): string {
  let dir = resolve(start);
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, 'packages')) && existsSync(join(dir, 'AGENTS.md'))) return dir;
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return resolve(start, '..');
}
const ROOT = findRepoRoot(process.cwd());
const WEBSITE = join(ROOT, 'website');
const AGGREGATE = join(ROOT, 'docs', 'api.aggregate.json');
const RUNTIME = join(ROOT, 'docs', 'api.examples.runtime.json');
const DOCS_DIR = join(WEBSITE, 'src', 'content', 'docs');
const API_DIR = join(DOCS_DIR, 'api');
const GENERATED = join(WEBSITE, 'src', 'generated');

// --------------------------------------------------------------------------
// Types (subset of the aggregate schema)
// --------------------------------------------------------------------------
interface SourceLink {
  file: string;
  line: number;
  url: string;
}
interface DocComment {
  summary: string;
  description: string;
  params: { name: string; text: string }[];
  examples: string[];
  notes: string[];
  deprecated?: string;
  see: string[];
}
interface Signature {
  text: string;
  returnsNonEmpty: boolean;
  doc?: DocComment;
  source?: SourceLink;
}
interface Member {
  name: string;
  kind: 'method' | 'property' | 'accessor';
  signatures: Signature[];
  inheritedFrom?: string;
  source?: SourceLink;
}
interface NestedType {
  id: string;
  name: string;
}
interface Entity {
  id: string;
  name: string;
  qualifiedName: string;
  package: string;
  tier: 'public' | 'advanced';
  kind: string;
  doc?: DocComment;
  source?: SourceLink;
  type?: { typeParams: string[]; extends: string[]; members: Member[] };
  namespace?: { members: NestedType[] };
  value?: { staticMethods: Member[]; typeId?: string };
  redirected?: boolean;
  canonicalId?: string;
  ancestors?: string[];
  descendants?: string[];
}
interface Aggregate {
  $schema: string;
  generatedAt: string;
  gitRef: string;
  packages: string[];
  counts: Record<string, number>;
  redirects: { from: string; fromPackage: string; canonicalId: string }[];
  entities: Record<string, Entity>;
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
const pkgShort = (pkgName: string): string => pkgName.replace(/^@rimbu\//, '');

// MDX import line for the runnable-example island, inserted after frontmatter on
// pages that contain at least one runnable code example.
const RUNNABLE_IMPORT =
  "import RunExample from '../../../../components/RunExample.astro';\n";

// Slug for an entity id -> URL path segment. Ids look like `list/List` or
// `list/List.NonEmpty`. We keep the package as a directory and the dotted name
// as a lowercased, dot->- slug so it is filesystem/URL safe.
const entitySlug = (id: string): string => {
  const [, ...rest] = id.split('/');
  const name = rest.join('/');
  return name.replace(/\./g, '-').toLowerCase();
};
const pkgOf = (id: string): string => id.split('/')[0];
const entityPath = (id: string): string => `api/${pkgOf(id)}/${entitySlug(id)}`;
const entityHref = (id: string): string => `/${entityPath(id)}/`;

// Escape text that will appear as MDX body prose (not inside code fences).
const escapeMdx = (s: string): string =>
  s
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');

// Escape a value used inside a YAML double-quoted frontmatter string.
const yamlString = (s: string): string =>
  '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').trim() + '"';

const firstLine = (s: string): string => (s || '').split('\n')[0].trim();

// --------------------------------------------------------------------------
// Rendering
// --------------------------------------------------------------------------
class Renderer {
  private out: string[] = [];
  // Whether the currently-rendered page uses <RunnableExample>, so we can add
  // the component import to its frontmatter.
  private pageUsesRunnable = false;
  constructor(
    private agg: Aggregate,
    // Map: normalized example source -> runtime metadata (packages, typeChecks).
    // Content-keyed because the same example is shared across inherited members;
    // duplicates have identical metadata so the lookup is unambiguous.
    private runtime: Map<string, { packages: string[]; typeChecks: boolean }>,
  ) {}

  private e(id: string): Entity | undefined {
    return this.agg.entities[id];
  }

  private displayName(id: string): string {
    return this.e(id)?.qualifiedName ?? id.split('/').slice(1).join('/');
  }

  // A link to an entity if it exists in the aggregate, else plain code text.
  private link(id: string): string {
    const ent = this.e(id);
    const label = this.displayName(id);
    if (!ent) return `\`${label}\``;
    return `[\`${label}\`](${entityHref(id)})`;
  }

  private badge(text: string, variant: string): string {
    return `<span class="rimbu-badge rimbu-badge--${variant}">${text}</span>`;
  }

  private sourceLink(src?: SourceLink): string {
    if (!src) return '';
    return ` <a class="rimbu-source-link" href="${src.url}">source</a>`;
  }

  private doc(doc?: DocComment): string {
    if (!doc) return '';
    const parts: string[] = [];
    if (doc.deprecated !== undefined) {
      parts.push(
        `:::caution[Deprecated]\n${escapeMdx(doc.deprecated || 'This API is deprecated.')}\n:::`
      );
    }
    if (doc.description?.trim()) parts.push(escapeMdx(doc.description.trim()));
    for (const p of doc.params) {
      parts.push(`- **${escapeMdx(p.name)}** — ${escapeMdx(p.text)}`);
    }
    for (const note of doc.notes) parts.push(escapeMdx(note.trim()));
    for (const ex of doc.examples) {
      parts.push(this.example(ex));
    }
    for (const s of doc.see) parts.push(`See: ${escapeMdx(s)}`);
    return parts.join('\n\n');
  }

  // Render a single @example. TypeScript/JS examples are emitted as a normal
  // fenced code block (so Starlight/Expressive Code highlights it, adds a copy
  // button, etc. — always visible, no hydration) wrapped by a small RunExample
  // island that lazy-mounts Sandpack beneath the code on demand. Non-code (or
  // non-ts) examples fall back to the verbatim block.
  private example(ex: string): string {
    const trimmed = ex.trim();
    const m = trimmed.match(/^```(ts|typescript|js|javascript)\s*\n([\s\S]*?)```$/i);
    if (!m) return trimmed;
    const lang = m[1];
    const code = m[2].replace(/\s+$/, '');
    const meta = this.runtime.get(code.trim());
    const packages = meta?.packages ?? [];
    const typeChecks = meta?.typeChecks ?? false;
    this.pageUsesRunnable = true;
    // The fenced block is Astro-rendered (highlighted, static). The RunExample
    // wrapper hydrates only a small Run button; Sandpack loads on click.
    const fence = '```' + lang + '\n' + code + '\n```';
    return (
      `<RunExample ` +
      `code={${JSON.stringify(code)}} ` +
      `packages={${JSON.stringify(packages)}} ` +
      `typeChecks={${JSON.stringify(typeChecks)}}>\n\n` +
      `${fence}\n\n` +
      `</RunExample>`
    );
  }

  private member(m: Member): string {
    const lines: string[] = [];
    const inherited = m.inheritedFrom
      ? ` ${this.badge('inherited', 'inherited')} from ${this.link(m.inheritedFrom)}`
      : '';
    const anyNonEmpty = m.signatures.some((s) => s.returnsNonEmpty);
    const neBadge = anyNonEmpty ? ` ${this.badge('NonEmpty', 'nonempty')}` : '';
    lines.push(
      `<div class="rimbu-member">\n\n#### \`${escapeMdx(m.name)}\`${neBadge}${inherited}${this.sourceLink(m.source)}\n`
    );

    const renderSig = (s: Signature, isFallback: boolean): string => {
      const badge = s.returnsNonEmpty ? this.badge('NonEmpty', 'nonempty') : '';
      const code = '```ts\n' + s.text + '\n```';
      const d = s.doc ? '\n\n' + this.doc(s.doc) : '';
      const inner = (badge ? badge + '\n\n' : '') + code + d;
      return `<div class="rimbu-overload" data-fallback="${isFallback}">\n\n${inner}\n\n</div>`;
    };

    if (m.signatures.length <= 1) {
      lines.push(m.signatures.map((s) => renderSig(s, true)).join('\n\n'));
    } else {
      // Multiple overloads: show all inside an open expander. The last overload
      // is the fallback; the fallback-only toggle hides the rest via CSS.
      const last = m.signatures.length - 1;
      lines.push(
        `<details class="rimbu-overloads" open>\n<summary>${m.signatures.length} overloads</summary>\n\n` +
          m.signatures.map((s, i) => renderSig(s, i === last)).join('\n\n') +
          `\n\n</details>`
      );
    }
    lines.push('\n</div>');
    return lines.join('\n');
  }

  private inheritanceTree(ent: Entity): string {
    const anc = (ent.ancestors ?? []).filter((id) => this.e(id));
    const desc = (ent.descendants ?? []).filter((id) => this.e(id));
    if (anc.length === 0 && desc.length === 0) return '';
    const parts: string[] = ['<div class="rimbu-inheritance">\n', '## Inheritance\n'];
    if (anc.length) {
      parts.push('**Extends:**\n');
      parts.push(anc.map((id) => `- ${this.link(id)}`).join('\n'));
      parts.push('');
    }
    if (desc.length) {
      parts.push('**Extended by:**\n');
      parts.push(desc.map((id) => `- ${this.link(id)}`).join('\n'));
      parts.push('');
    }
    parts.push('</div>');
    return parts.join('\n');
  }

  private frontmatter(title: string, description: string, extra: string[] = []): string {
    const lines = ['---', `title: ${yamlString(title)}`];
    if (description) lines.push(`description: ${yamlString(description)}`);
    lines.push(...extra, '---', '');
    return lines.join('\n');
  }

  // ---- Entity page ------------------------------------------------------
  renderEntity(ent: Entity): string {
    this.pageUsesRunnable = false;
    // Redirected (core re-export) -> short stub linking to canonical.
    if (ent.redirected && ent.canonicalId && ent.canonicalId !== ent.id) {
      const canon = this.e(ent.canonicalId);
      const fm = this.frontmatter(
        ent.qualifiedName,
        `Re-exported from ${canon?.package ?? ''} via @rimbu/core`
      );
      return (
        fm +
        `This entity is re-exported by \`@rimbu/core\` from ${canon ? canon.package : 'another package'}.\n\n` +
        `See the canonical documentation: ${this.link(ent.canonicalId)}\n`
      );
    }

    const tp = ent.type?.typeParams?.length ? `<${ent.type.typeParams.join(', ')}>` : '';
    const kindBadge = this.badge(ent.kind, ent.kind === 'companion' ? 'companion' : 'kind');
    const advBadge = ent.tier === 'advanced' ? ' ' + this.badge('advanced', 'advanced') : '';

    const fm = this.frontmatter(
      ent.qualifiedName,
      firstLine(ent.doc?.summary ?? '') || `${ent.kind} in ${ent.package}`
    );

    const body: string[] = [fm];
    body.push(
      `<div class="rimbu-entity-header">\n\n` +
        `${kindBadge}${advBadge} \`${escapeMdx(ent.package)}\`${this.sourceLink(ent.source)}\n\n</div>\n`
    );

    if (ent.doc) body.push(this.doc(ent.doc));

    // Type facet (interface/class members)
    if (ent.type) {
      const own = ent.type.members.filter((m) => !m.inheritedFrom);
      const inh = ent.type.members.filter((m) => m.inheritedFrom);
      if (own.length) {
        body.push('\n## Members\n');
        body.push(own.map((m) => this.member(m)).join('\n\n'));
      }
      if (inh.length) {
        body.push('\n## Inherited members\n');
        body.push(inh.map((m) => this.member(m)).join('\n\n'));
      }
    }

    // Value facet (static methods) — collapsible, Layout A.
    if (ent.value?.staticMethods?.length) {
      body.push('\n## Static methods\n');
      body.push(
        `<details class="rimbu-overloads" open>\n<summary>${ent.value.staticMethods.length} static members</summary>\n`
      );
      body.push(ent.value.staticMethods.map((m) => this.member(m)).join('\n\n'));
      body.push('</details>');
    }

    // Namespace facet (related types) — collapsible, Layout A.
    if (ent.namespace?.members?.length) {
      const items = ent.namespace.members.filter((n) => this.e(n.id));
      if (items.length) {
        body.push('\n## Related types\n');
        body.push(items.map((n) => `- ${this.link(n.id)}`).join('\n'));
      }
    }

    // Inheritance tree
    const tree = this.inheritanceTree(ent);
    if (tree) body.push('\n' + tree);

    // If any example on this page became a runnable widget, import the component
    // right after the frontmatter block.
    if (this.pageUsesRunnable) {
      body[0] = body[0] + RUNNABLE_IMPORT + '\n';
    }

    return body.join('\n');
  }

  // ---- Package index ----------------------------------------------------
  renderPackageIndex(pkg: string, entities: Entity[]): string {
    const short = pkgShort(pkg);
    const fm = this.frontmatter(pkg, `API reference for the ${pkg} package`);
    const body = [fm];
    const publics = entities.filter((e) => e.tier === 'public').sort(byName);
    const advanced = entities.filter((e) => e.tier === 'advanced').sort(byName);
    body.push(`Install: \`npm install ${pkg}\`\n`);
    if (publics.length) {
      body.push('## Entities\n');
      body.push(publics.map((e) => this.entityListItem(e)).join('\n'));
    }
    if (advanced.length) {
      body.push(
        '\n## Advanced\n\n<div data-rimbu-tier="advanced">\n\n' +
          advanced.map((e) => this.entityListItem(e)).join('\n') +
          '\n\n</div>'
      );
    }
    return body.join('\n');
  }

  private entityListItem(e: Entity): string {
    const summary = firstLine(e.doc?.summary ?? '');
    const kind = e.kind === 'companion' ? this.badge('companion', 'companion') : '';
    return `- [\`${escapeMdx(e.qualifiedName)}\`](${entityHref(e.id)}) ${kind}${summary ? ' — ' + escapeMdx(summary) : ''}`;
  }

  // ---- API landing ------------------------------------------------------
  renderApiIndex(pkgs: string[]): string {
    const fm = this.frontmatter('API Reference', 'Rimbu package API reference');
    const body = [fm, 'Rimbu is organized into focused packages.\n', '## Packages\n'];
    for (const pkg of pkgs.sort()) {
      body.push(`- [${pkg}](/api/${pkgShort(pkg)}/)`);
    }
    return body.join('\n');
  }

  renderHome(): string {
    const fm = [
      '---',
      'title: Rimbu',
      'description: Immutable collections and tools for TypeScript.',
      'template: splash',
      'hero:',
      '  tagline: Immutable, performant, type-safe collections for TypeScript.',
      '  actions:',
      '    - text: API Reference',
      '      link: /api/',
      '      icon: right-arrow',
      '---',
      '',
    ].join('\n');
    return fm + 'Welcome to the Rimbu documentation.\n';
  }
}

const byName = (a: Entity, b: Entity) => a.qualifiedName.localeCompare(b.qualifiedName);

// --------------------------------------------------------------------------
// Sidebar
// --------------------------------------------------------------------------
interface SidebarEntry {
  label: string;
  link?: string;
  items?: SidebarEntry[];
  attrs?: Record<string, string>;
  badge?: { text: string; variant: string };
  collapsed?: boolean;
}

function buildSidebar(byPkg: Map<string, Entity[]>): SidebarEntry[] {
  const groups: SidebarEntry[] = [{ label: 'Overview', link: '/api/' }];
  for (const pkg of [...byPkg.keys()].sort()) {
    const ents = byPkg.get(pkg)!.slice().sort(byName);
    const items: SidebarEntry[] = [{ label: 'Overview', link: `/api/${pkgShort(pkg)}/` }];
    for (const e of ents) {
      const entry: SidebarEntry = {
        label: e.qualifiedName,
        link: entityHref(e.id),
      };
      if (e.tier === 'advanced') {
        entry.attrs = { 'data-rimbu-tier': 'advanced' };
        entry.badge = { text: 'advanced', variant: 'caution' };
      }
      items.push(entry);
    }
    groups.push({ label: pkg, items, collapsed: true });
  }
  return groups;
}

// --------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------
function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function main(): void {
  if (!existsSync(AGGREGATE)) {
    console.error(`Aggregate not found: ${AGGREGATE}. Run 'bun run docs' first.`);
    process.exit(1);
  }
  const agg = JSON.parse(readFileSync(AGGREGATE, 'utf8')) as Aggregate;

  // Load the examples runtime artifact (produced by `docs:examples`) and index
  // it by normalized example source so the renderer can attach runnable metadata.
  const runtime = new Map<string, { packages: string[]; typeChecks: boolean }>();
  if (existsSync(RUNTIME)) {
    const raw = JSON.parse(readFileSync(RUNTIME, 'utf8')) as Record<
      string,
      { code: string; packages: string[]; typeChecks: boolean }
    >;
    for (const entry of Object.values(raw)) {
      runtime.set(entry.code.trim(), {
        packages: entry.packages,
        typeChecks: entry.typeChecks,
      });
    }
  } else {
    console.warn(`No examples runtime at ${RUNTIME}; examples render as static code.`);
  }

  const renderer = new Renderer(agg, runtime);

  // Clean previously generated api/ pages (leave hand-written docs alone).
  if (existsSync(API_DIR)) rmSync(API_DIR, { recursive: true, force: true });
  mkdirSync(API_DIR, { recursive: true });

  // Group entities by owning package.
  const byPkg = new Map<string, Entity[]>();
  for (const ent of Object.values(agg.entities)) {
    // Redirected entities live under their re-exporting package (core); still
    // render them as stubs so links resolve.
    const pkg = ent.package;
    if (!byPkg.has(pkg)) byPkg.set(pkg, []);
    byPkg.get(pkg)!.push(ent);
  }

  let pageCount = 0;
  for (const [pkg, ents] of byPkg) {
    const short = pkgShort(pkg);
    writeFile(join(API_DIR, short, 'index.mdx'), renderer.renderPackageIndex(pkg, ents));
    for (const ent of ents) {
      const file = join(DOCS_DIR, `${entityPath(ent.id)}.mdx`);
      writeFile(file, renderer.renderEntity(ent));
      pageCount++;
    }
  }

  // API landing + homepage.
  writeFile(join(API_DIR, 'index.mdx'), renderer.renderApiIndex([...byPkg.keys()]));
  writeFile(join(DOCS_DIR, 'index.mdx'), renderer.renderHome());

  // Sidebar.
  const sidebar = buildSidebar(byPkg);
  writeFile(join(GENERATED, 'sidebar.json'), JSON.stringify(sidebar, null, 2));

  console.log(
    `Rendered ${pageCount} entity pages across ${byPkg.size} packages.\n` +
      `  content: ${API_DIR}\n  sidebar: ${join(GENERATED, 'sidebar.json')}`
  );
}

main();
