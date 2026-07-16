/**
 * Stage 1 — Rimbu docs extractor.
 *
 * Builds a per-package `.api.json` from the emitted `dist/*.d.ts` declarations,
 * using the TypeScript 6 compiler API (isolated in this folder's own
 * `node_modules` so it does not conflict with the root TypeScript 7 install).
 *
 * Produces an Entity graph with companion-object merging (interface + namespace
 * + const value -> one Entity), inlined inheritance (members tagged with their
 * source entity), structured JSDoc, tier tagging (public/advanced), and GitHub
 * source links.
 *
 * Run from this folder: `bun run extract`  (after the workspace is built with
 * the native TS7 `tsc` so that `dist/*.d.ts` exists).
 */
import { existsSync, readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import ts from 'typescript';

// ROOT is repo root: walk up from cwd until a 'packages' dir is found.
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

// Documentation-relevant packages, in dependency order. `reactor` is excluded
// (its tsconfig is broken at HEAD and it is experimental).
const ORDER = [
  'base',
  'common',
  'collection-types',
  'stream',
  'list',
  'hashed',
  'sorted',
  'ordered',
  'multimap',
  'multiset',
  'bimap',
  'bimultimap',
  'graph',
  'table',
  'proximity',
  'deep',
  'channel',
  'task',
  'actor',
  'spy',
  'typical',
  'core',
];
const EXCLUDED = new Set(['reactor']);

// Git ref for source links; overridable via env.
const GIT_REF = process.env.RIMBU_DOC_REF ?? 'main';
const GITHUB_BASE = `https://github.com/rimbu-org/rimbu/blob/${GIT_REF}`;

type Tier = 'public' | 'advanced';

interface SourceLink {
  file: string; // repo-relative path, e.g. packages/list/src/list.ts
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
  text: string; // the full signature text (no body)
  returnsNonEmpty: boolean;
  doc?: DocComment;
  source?: SourceLink;
}

interface Member {
  name: string;
  kind: 'method' | 'property' | 'accessor';
  signatures: Signature[]; // overloads (ordered)
  inheritedFrom?: string; // entity id
  source?: SourceLink;
}

interface NestedType {
  id: string;
  name: string;
}

interface Entity {
  id: string; // <package>/<Name> e.g. list/List
  name: string;
  qualifiedName: string;
  package: string; // @rimbu/<name>
  tier: Tier;
  kind: 'companion' | 'interface' | 'class' | 'type' | 'enum' | 'namespace' | 'function' | 'const';
  doc?: DocComment;
  source?: SourceLink;
  // companion facets
  type?: {
    typeParams: string[];
    extends: string[]; // entity ids
    members: Member[];
  };
  namespace?: {
    members: NestedType[]; // ids of List.NonEmpty, List.Builder, ...
  };
  value?: {
    staticMethods: Member[];
    typeId?: string;
  };
  redirected?: boolean;
  canonicalId?: string;
}

interface PackageApi {
  $schema: 'rimbu-docs/entity-graph/v1';
  package: string;
  dependsOn: string[];
  entities: Record<string, Entity>;
}

// ---------------------------------------------------------------------------
// File collection
// ---------------------------------------------------------------------------

// Entry .d.ts files per package: public/ tier + root entry + esm root (reactor).
function entryFiles(pkg: string): string[] {
  const dist = join(PACKAGES_DIR, pkg, 'dist');
  if (!existsSync(dist)) return [];
  const files: string[] = [];
  const scan = (dir: string, isRoot: boolean) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry === 'internal') continue; // excluded entirely (strict tier rule)
        if (isRoot || entry === 'public' || entry === 'advanced' || entry === 'esm')
          scan(full, false);
      } else if (entry.endsWith('.d.ts') && !entry.includes('.map')) {
        if (statSync(full).isFile()) files.push(full);
      }
    }
  };
  scan(dist, true);
  return files;
}

// All .d.ts in a package (for program construction / resolution).
function allDistDts(pkg: string): string[] {
  const dist = join(PACKAGES_DIR, pkg, 'dist');
  if (!existsSync(dist)) return [];
  const out: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d)) {
      const f = join(d, e);
      if (statSync(f).isDirectory()) walk(f);
      else if (e.endsWith('.d.ts') && !e.includes('.map')) out.push(f);
    }
  };
  walk(dist);
  return out;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Map a dist .d.ts path to its src .ts path (strip dist/, swap extension).
function distToSrc(distFile: string): string {
  const rel = relative(PACKAGES_DIR, distFile); // <pkg>/dist/.../*.d.ts
  const noDist = rel.replace(/^([^/]+)\/dist\//, '$1/src/');
  return noDist.replace(/\.d\.ts$/, '.ts');
}

// Compute a SourceLink for a declaration node.
const srcLineCache = new Map<string, string[]>();
function getSourceLink(decl: ts.Node): SourceLink | undefined {
  const sf = decl.getSourceFile();
  const distFile = sf.fileName;
  if (!distFile.includes('/dist/')) return undefined;
  const srcRel = distToSrc(distFile);
  const repoFile = `packages/${srcRel}`;
  const lineText = sf.text.slice(sf.getLineStarts()[ts.getLineOfLocalPosition(sf, decl.getStart())] ?? 0).trim().split('\n')[0] ?? '';
  // find first occurrence of that line in the src file
  let cache = srcLineCache.get(repoFile);
  if (!cache) {
    const p = join(ROOT, repoFile);
    if (!existsSync(p)) return undefined;
    cache = readFileSync(p, 'utf-8').split('\n');
    srcLineCache.set(repoFile, cache);
  }
  let line = -1;
  const needle = lineText.slice(0, 120);
  for (let i = 0; i < cache.length; i++) {
    if (cache[i].includes(needle)) {
      line = i + 1;
      break;
    }
  }
  if (line < 0) line = 1;
  return {
    file: repoFile,
    line,
    url: `${GITHUB_BASE}/${repoFile}#L${line}`,
  };
}

// Parse a JSDoc comment into structured form.
function parseDoc(node: ts.Node): DocComment | undefined {
  const jsDoc = (node as any).jsDoc as ts.JSDoc[] | undefined;
  if (!jsDoc || jsDoc.length === 0) return undefined;
  const doc = jsDoc[jsDoc.length - 1];
  const full = doc.comment;
  const summary = typeof full === 'string' ? full.split('\n\n')[0].trim() : '';
  const description = typeof full === 'string' ? full.trim() : '';
  const out: DocComment = { summary, description, params: [], examples: [], notes: [], see: [] };
  for (const t of doc.tags ?? []) {
    const tagText = typeof t.comment === 'string' ? t.comment : '';
    switch (t.tagName.text) {
      case 'param': {
        const name = (t as ts.JSDocParameterTag).name.getText();
        out.params.push({ name, text: tagText.trim() });
        break;
      }
      case 'example':
        out.examples.push(tagText.trim());
        break;
      case 'note':
        out.notes.push(tagText.trim());
        break;
      case 'see':
        out.see.push(tagText.trim());
        break;
      case 'deprecated':
        out.deprecated = tagText.trim() || 'deprecated';
        break;
    }
  }
  return out;
}

// Does a type node refer to a *.NonEmpty type? (drives the badge)
function returnsNonEmpty(sigText: string): boolean {
  return /NonEmpty[<(]/i.test(sigText) && /:\s*\S.*NonEmpty/.test(sigText) === false
    ? /\b\w*NonEmpty\b/.test(sigText)
    : /\b\w*NonEmpty\b/.test(sigText);
}

// Build a stable entity id from a symbol + package.
function entityId(pkg: string, symbol: ts.Symbol): string {
  const name = symbol.getName();
  // try to find the file's package to qualify cross-package
  const decl = symbol.getDeclarations()?.[0];
  if (decl) {
    const fn = decl.getSourceFile().fileName;
    const m = fn.match(/packages\/([^/]+)\/dist/);
    const ownerPkg = m ? m[1] : pkg;
    return `${ownerPkg}/${name}`;
  }
  return `${pkg}/${name}`;
}

// ---------------------------------------------------------------------------
// Member extraction
// ---------------------------------------------------------------------------

function extractMembers(
  decl: ts.InterfaceDeclaration | ts.ClassDeclaration,
  checker: ts.TypeChecker,
  pkg: string,
): Member[] {
  // Group overloads by member name into a single Member with multiple signatures.
  const byName = new Map<string, { kind: Member['kind']; sigs: Signature[]; source?: SourceLink }>();
  for (const m of decl.members) {
    const name = (m as any).name?.getText?.() ?? (ts.isConstructorDeclaration(m) ? 'constructor' : '');
    if (!name) continue;
    const sigs = extractSignatures(m, checker);
    if (sigs.length === 0) continue;
    const kind: Member['kind'] = ts.isPropertyDeclaration(m) || ts.isPropertySignature(m)
      ? 'property'
      : ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m)
        ? 'accessor'
        : 'method';
    const existing = byName.get(name);
    if (existing) {
      existing.sigs.push(...sigs);
    } else {
      byName.set(name, { kind, sigs, source: getSourceLink(m) });
    }
  }
  const members: Member[] = [];
  for (const [name, v] of byName) {
    members.push({ name, kind: v.kind, signatures: v.sigs, source: v.source });
  }
  return members;
}

function extractSignatures(m: ts.Node, checker: ts.TypeChecker): Signature[] {
  const sigs: Signature[] = [];
  const pushOne = (node: ts.SignatureDeclaration) => {
    const text = node.getText().replace(/\{[^}]*\}\s*$/, '').trim().replace(/;$/, '');
    sigs.push({
      text,
      returnsNonEmpty: returnsNonEmpty(text),
      doc: parseDoc(node),
      source: getSourceLink(node),
    });
  };
  if (ts.isFunctionDeclaration(m) || ts.isMethodSignature(m) || ts.isMethodDeclaration(m) ||
      ts.isConstructorDeclaration(m) || ts.isCallSignatureDeclaration(m) ||
      ts.isGetAccessorDeclaration(m) || ts.isSetAccessorDeclaration(m)) {
    pushOne(m as ts.SignatureDeclaration);
  } else if (ts.isPropertySignature(m) || ts.isPropertyDeclaration(m)) {
    const text = m.getText().replace(/[;=].*$/, '').trim();
    sigs.push({ text, returnsNonEmpty: returnsNonEmpty(text), doc: parseDoc(m), source: getSourceLink(m) });
  }
  return sigs;
}

// ---------------------------------------------------------------------------
// Main extraction per package
// ---------------------------------------------------------------------------

function extractPackage(pkg: string, program: ts.Program, checker: ts.TypeChecker): PackageApi {
  const fullName = `@rimbu/${pkg}`;
  const entities: Record<string, Entity> = {};
  const seen = new Set<string>(); // declaration keys already emitted
  const ORDER_LOCAL = [pkg];

  const markSeen = (d: ts.Declaration) => {
    const k = d.getSourceFile().fileName + ':' + d.pos + ':' + d.end;
    seen.add(k);
    return k;
  };
  const isSeen = (d: ts.Declaration) =>
    seen.has(d.getSourceFile().fileName + ':' + d.pos + ':' + d.end);

  const tierOf = (decl: ts.Declaration): Tier => {
    const fn = decl.getSourceFile().fileName;
    if (fn.includes('/advanced/')) return 'advanced';
    return 'public';
  };

  const extractFromSymbol = (symbol: ts.Symbol, depth: number): Entity | undefined => {
    const decls = symbol.getDeclarations();
    if (!decls || decls.length === 0) return undefined;
    const id = entityId(pkg, symbol);
    if (entities[id]) return entities[id];

    // Determine kind by declaration mix (companion detection)
    const iface = decls.find((d) => ts.isInterfaceDeclaration(d)) as ts.InterfaceDeclaration | undefined;
    const cls = decls.find((d) => ts.isClassDeclaration(d)) as ts.ClassDeclaration | undefined;
    const mod = decls.find((d) => ts.isModuleDeclaration(d)) as ts.ModuleDeclaration | undefined;
    const vardecl = decls.find((d) => ts.isVariableDeclaration(d) || ts.isFunctionDeclaration(d));

    const isCompanion = !!(iface || cls) && (!!mod || !!vardecl);

    const primaryDecl = (iface ?? cls ?? mod ?? vardecl) as ts.Declaration | undefined;
    if (!primaryDecl) return undefined; // symbol with no recognized declaration kind
    const tier = tierOf(primaryDecl);
    const source = getSourceLink(primaryDecl);
    const doc = parseDoc(primaryDecl);

    const entity: Entity = {
      id,
      name: symbol.getName(),
      qualifiedName: symbol.getName(),
      package: fullName,
      tier,
      kind: isCompanion ? 'companion' : iface ? 'interface' : cls ? 'class' : mod ? 'namespace' : 'const',
      doc,
      source,
    };

    // type facet
    const typeDecl = iface ?? cls;
    if (typeDecl) {
      const typeParams = typeDecl.typeParameters?.map((tp) => tp.getText()) ?? [];
      const extendsIds: string[] = [];
      for (const hc of typeDecl.heritageClauses ?? []) {
        for (const t of hc.types) {
          const bt = checker.getTypeAtLocation(t);
          const bsym = bt.symbol ?? (t.expression ? checker.getSymbolAtLocation(t.expression) : undefined);
          if (bsym) {
            const bid = entityId(pkg, bsym);
            extendsIds.push(bid);
            // recurse to ensure base entity exists (inlined later)
            extractFromSymbol(bsym, depth + 1);
          }
          if (bt && typeof bt === 'object') {
            const bases: ts.BaseType[] =
              typeof checker.getBaseTypes === 'function' ? checker.getBaseTypes(bt) : [];
            for (const b of bases) {
              if (b.symbol) extractFromSymbol(b.symbol, depth + 1);
            }
          }
        }
      }
      const members = extractMembers(typeDecl, checker, pkg);
      entity.type = { typeParams, extends: extendsIds, members };
    }

    // namespace facet
    if (mod) {
      const nested: NestedType[] = [];
      const modSymbol = checker.getSymbolAtLocation(mod) ?? symbol;
      modSymbol.exports?.forEach((sym, name) => {
        if (name.startsWith('__')) return;
        const childId = `${id}.${name}`;
        nested.push({ id: childId, name: String(name) });
        // recursively extract the nested entity so it appears in entities map
        const childEntity = buildEntityFromSymbol(sym, pkg, `${pkg}/${name}`);
        if (childEntity) entities[childId] = childEntity;
      });
      entity.namespace = { members: nested };
    }

    // value facet (const/function with static methods)
    if (vardecl && ts.isVariableDeclaration(vardecl)) {
      const typeNode = vardecl.type;
      const staticMethods: Member[] = [];
      if (typeNode) {
        const ttype = checker.getTypeFromTypeNode(typeNode);
        for (const sm of ttype.getProperties()) {
          const sd = sm.getDeclarations()?.[0];
          if (!sd) continue;
          const sigs = extractSignatures(sd, checker);
          if (sigs.length) {
            staticMethods.push({
              name: sm.getName(),
              kind: 'method',
              signatures: sigs,
              source: getSourceLink(sd),
            });
          }
        }
      }
      if (staticMethods.length) entity.value = { staticMethods };
    }

    entities[id] = entity;
    return entity;
  };

  // Build a nested entity (e.g. List.NonEmpty) from a symbol.
  const buildEntityFromSymbol = (symbol: ts.Symbol, p: string, fallbackId: string): Entity | undefined => {
    const decls = symbol.getDeclarations();
    if (!decls || !decls.length) return undefined;
    const id = entityId(p, symbol);
    if (entities[id]) return entities[id];
    const iface = decls.find((d) => ts.isInterfaceDeclaration(d)) as ts.InterfaceDeclaration | undefined;
    const cls = decls.find((d) => ts.isClassDeclaration(d)) as ts.ClassDeclaration | undefined;
    const primary = (iface ?? cls ?? decls[0]) as ts.Declaration;
    const tier = tierOf(primary);
    const typeDecl = iface ?? cls;
    const entity: Entity = {
      id,
      name: symbol.getName(),
      qualifiedName: symbol.getName(),
      package: `@rimbu/${p}`,
      tier,
      kind: iface ? 'interface' : cls ? 'class' : 'namespace',
      doc: parseDoc(primary),
      source: getSourceLink(primary),
    };
    if (typeDecl) {
      const extendsIds: string[] = [];
      const members = extractMembers(typeDecl, checker, p);
      entity.type = {
        typeParams: typeDecl.typeParameters?.map((tp) => tp.getText()) ?? [],
        extends: extendsIds,
        members,
      };
    }
    entities[id] = entity;
    return entity;
  };

  // Walk entry files
  for (const file of entryFiles(pkg)) {
    const sf = program.getSourceFile(file);
    if (!sf) continue;
    const fileSym = checker.getSymbolAtLocation(sf);
    const emitExports = (exports: ts.SymbolTable | undefined) => {
      exports?.forEach((sym, name) => {
        if (name.startsWith('__')) return;
        extractFromSymbol(sym, 0);
      });
    };
    emitExports(fileSym?.exports);
    for (const stmt of sf.statements) {
      if (ts.isExportDeclaration(stmt) && stmt.moduleSpecifier && ts.isStringLiteral(stmt.moduleSpecifier)) {
        const modSym = checker.getSymbolAtLocation(stmt.moduleSpecifier);
        emitExports(modSym?.exports);
      }
    }
  }

  // Post-pass: inline inherited members (Q4/C — fully inline, tagging source).
  // Bases that were not extracted (e.g. internal/ bases excluded by tier rule)
  // are left as `extends` edges only (known limitation; resolved by moving files
  // to advanced/).
  const collectBaseMembers = (baseId: string, out: Member[]) => {
    const base = entities[baseId];
    if (!base || !base.type) return;
    for (const m of base.type.members) {
      out.push({ ...m, inheritedFrom: baseId });
    }
    for (const ext of base.type.extends) collectBaseMembers(ext, out);
  };
  for (const id of Object.keys(entities)) {
    const ent = entities[id];
    if (!ent.type || ent.type.extends.length === 0) continue;
    const inherited: Member[] = [];
    for (const ext of ent.type.extends) collectBaseMembers(ext, inherited);
    // own members first, then inherited (de-dup by name+signature text)
    const seenKeys = new Set(ent.type.members.map((m) => m.name + '|' + m.signatures.map((s) => s.text).join('|')));
    const extra = inherited.filter((m) => {
      const k = m.name + '|' + m.signatures.map((s) => s.text).join('|');
      if (seenKeys.has(k)) return false;
      seenKeys.add(k);
      return true;
    });
    ent.type.members = [...ent.type.members, ...extra];
  }

  // For the umbrella `core` package, re-exported entities are references to the
  // defining package. Tag them redirected so the renderer links instead of dupes.
  if (pkg === 'core') {
    for (const id of Object.keys(entities)) {
      if (!id.startsWith('core/')) {
        entities[id].redirected = true;
        entities[id].canonicalId = id;
      }
    }
  }

  return {
    $schema: 'rimbu-docs/entity-graph/v1',
    package: fullName,
    dependsOn: [],
    entities,
  };
}

// ---------------------------------------------------------------------------
// Program + entry
// ---------------------------------------------------------------------------

function main() {
  // Build a single program over all packages' dist so cross-package resolution works.
  const allDts: string[] = [];
  for (const pkg of ORDER) {
    if (EXCLUDED.has(pkg)) continue;
    allDts.push(...allDistDts(pkg));
  }
  const program = ts.createProgram(allDts, {
    skipLibCheck: true,
    types: [],
    target: ts.ScriptTarget.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  });
  const checker = program.getTypeChecker();

  let count = 0;
  if (process.env.DOC_DEBUG) {
    console.error('ROOT', ROOT, 'PACKAGES_DIR', PACKAGES_DIR);
    console.error('list entryFiles', entryFiles('list').length, entryFiles('list'));
  }
  for (const pkg of ORDER) {
    if (EXCLUDED.has(pkg)) {
      console.log(`skip: ${pkg} (excluded)`);
      continue;
    }
    if (entryFiles(pkg).length === 0) {
      console.log(`skip: ${pkg} (no dist)`);
      continue;
    }
    const api = extractPackage(pkg, program, checker);
    const outDir = join(PACKAGES_DIR, pkg, 'dist', 'api');
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, `${pkg}.api.json`), JSON.stringify(api, null, 2));
    count++;
    console.log(`ok:   ${pkg} (${Object.keys(api.entities).length} entities)`);
  }
  console.log(`\nPackages extracted: ${count}`);
}

main();
