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
  text: string; // the full signature text (no body), type-checker resolved when possible
  raw?: string; // the original .d.ts text, kept when it differs from `text`
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
  // `tierEntered` becomes true once we descend into an allowed tier dir
  // (public/advanced/esm). From there we recurse into ALL nested subdirs
  // (except `internal`) so subpath entries like public/async/reducer.d.ts are
  // scanned. At the root, only .d.ts files and the allowed tier dirs are taken.
  const scan = (dir: string, isRoot: boolean, tierEntered: boolean) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry === 'internal') continue; // excluded entirely (strict tier rule)
        if (tierEntered) {
          scan(full, false, true); // already inside a tier: take every subdir
        } else if (isRoot && (entry === 'public' || entry === 'advanced' || entry === 'esm')) {
          scan(full, false, true);
        }
      } else if (entry.endsWith('.d.ts') && !entry.includes('.map')) {
        if (statSync(full).isFile()) files.push(full);
      }
    }
  };
  scan(dist, true, false);
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
  // Strip JSDoc ` * ` (optional indentation + star + optional space) line
  // prefixes that TypeScript sometimes preserves inside multi-line tag text
  // (notably @example blocks). Without this, fenced code keeps ` * ` markers
  // and fails to type-check.
  const stripJsDocPrefixes = (text: string): string =>
    text
      .split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, ''))
      .join('\n');

  const out: DocComment = { summary, description, params: [], examples: [], notes: [], see: [] };
  for (const t of doc.tags ?? []) {
    const tagText = typeof t.comment === 'string' ? stripJsDocPrefixes(t.comment) : '';
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
  const qname = qualifiedSymbolName(symbol);
  // try to find the file's package to qualify cross-package
  const decl = symbol.getDeclarations()?.[0];
  if (decl) {
    const fn = decl.getSourceFile().fileName;
    const m = fn.match(/packages\/([^/]+)\/dist/);
    const ownerPkg = m ? m[1] : pkg;
    return `${ownerPkg}/${qname}`;
  }
  return `${pkg}/${qname}`;
}

// The dotted name of a symbol including any containing namespace/module chain,
// e.g. `ErrBase.CustomError` or `List.NonEmpty`. This must match the qualified
// ids under which nested entities are stored so that `extends`/reference edges
// resolve correctly after aggregation.
function qualifiedSymbolName(symbol: ts.Symbol): string {
  const parts: string[] = [symbol.getName()];
  let parent: ts.Symbol | undefined = (symbol as any).parent;
  while (parent) {
    const name = parent.getName();
    // Stop at module/file symbols (their names are quoted paths) and globals.
    if (!name || name.startsWith('"') || name.startsWith("'") || name === '__global') break;
    // Only include namespace/module containers, not value-space parents.
    const decls = parent.getDeclarations() ?? [];
    const isNamespace = decls.some(
      (d) => ts.isModuleDeclaration(d) || ts.isInterfaceDeclaration(d) || ts.isClassDeclaration(d),
    );
    if (!isNamespace) break;
    parts.unshift(name);
    parent = (parent as any).parent;
  }
  return parts.join('.');
}

// ---------------------------------------------------------------------------
// Type-checker signature resolution
// ---------------------------------------------------------------------------
//
// The raw .d.ts text of a member on a higher-kinded base interface reads like
// `updateAt(...): WithElem<Tp, T>['normal']`. When the same member is read off
// the *concrete* interface type (e.g. `List<T>`) the checker substitutes the
// HKT indirection and prints `List<T>` instead. We prefer that resolved form.

// Flags chosen empirically (see probe results):
//  - NoTruncation: never abbreviate to `...`.
//  - UseAliasDefinedOutsideCurrentScope: keep named aliases (e.g.
//    `WithValueResult<...>`) and drop `import("@rimbu/...")` prefixes, instead of
//    expanding them into large structural types.
//  - WriteTypeArgumentsOfSignature: include generic args in call signatures.
const TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
  ts.TypeFormatFlags.WriteTypeArgumentsOfSignature;

// If a resolved signature grows past this, or loses all named aliases, we treat
// resolution as "over-expanded" and fall back to the raw .d.ts text.
const RESOLVED_MAX_LEN = 400;

// Names of type aliases annotated with `@docExpand` in their JSDoc. When such an
// alias is the *top-level* return type of a resolved signature, it is printed in
// its expanded (structural) form instead of by its alias name. Populated by
// collectExpandAliases() before extraction. Keyed by alias symbol name.
const EXPAND_ALIASES = new Set<string>();

// Scan every source file's top-level statements for `type X = ...` declarations
// carrying an `@docExpand` JSDoc tag, recording the alias name.
function collectExpandAliases(program: ts.Program): void {
  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile && sf.fileName.includes('/node_modules/')) continue;
    const visit = (node: ts.Node) => {
      if (ts.isTypeAliasDeclaration(node) && hasDocTag(node, 'docExpand')) {
        EXPAND_ALIASES.add(node.name.text);
      }
      ts.forEachChild(node, visit);
    };
    ts.forEachChild(sf, visit);
  }
}

// True if a declaration's JSDoc contains a tag with the given name (case-insensitive).
// Reads the parsed `node.jsDoc[].tags` directly: `ts.getJSDocTags` proved
// unreliable here (returns [] under this runtime) whereas the attached jsDoc
// nodes do carry the parsed tags.
function hasDocTag(node: ts.Node, tagName: string): boolean {
  const want = tagName.toLowerCase();
  const jsDoc: ts.JSDoc[] | undefined = (node as any).jsDoc;
  if (jsDoc) {
    for (const doc of jsDoc) {
      for (const t of doc.tags ?? []) {
        if (t.tagName.text.toLowerCase() === want) return true;
      }
    }
  }
  return false;
}

// Cosmetic fixups for known checker-printer quirks.
function cleanResolvedType(s: string): string {
  return (
    s
      // `import("@rimbu/x/types").Foo` -> `Foo` (belt & suspenders; the alias
      // flag usually handles this, but nested positions can still leak it).
      .replace(/import\(["'][^"']+["']\)\./g, '')
      // Generic-namespace qualification quirk: `List<T>.Builder<T>` ->
      // `List.Builder<T>`. The container's type args are spurious when it is
      // acting purely as a namespace qualifier.
      .replace(/([A-Za-z_$][\w$]*)<[^<>]*>(\.[A-Za-z_$][\w$]*)/g, '$1$2')
      .trim()
  );
}

// Render a single call/construct signature off the concrete type. Returns
// undefined if it cannot be resolved acceptably (caller falls back to raw).
function renderResolvedSignature(
  memberName: string,
  sig: ts.Signature,
  checker: ts.TypeChecker,
  enclosing: ts.Node,
): string | undefined {
  try {
    let sigStr = checker.signatureToString(
      sig,
      enclosing,
      TYPE_FORMAT_FLAGS,
      ts.SignatureKind.Call,
    );
    sigStr = maybeExpandReturnAlias(sigStr, sig, checker, enclosing);
    const out = cleanResolvedType(`${memberName}${sigStr}`);
    return acceptResolved(out) ? out : undefined;
  } catch {
    return undefined;
  }
}

// If the signature's return type is a top-level alias tagged `@docExpand`,
// replace the collapsed alias name in the rendered string with its expanded
// (structural) form. Expansion is one level: nested types keep their names
// (interfaces stay nominal; other aliases stay collapsed unless they too are the
// top-level return of their own signature elsewhere). Returns the original
// string unchanged if the alias is not tagged or the tail can't be matched.
function maybeExpandReturnAlias(
  sigStr: string,
  sig: ts.Signature,
  checker: ts.TypeChecker,
  enclosing: ts.Node,
): string {
  const ret = sig.getReturnType();
  const aliasName = ret.aliasSymbol?.getName();
  if (!aliasName || !EXPAND_ALIASES.has(aliasName)) return sigStr;

  const collapsed = cleanResolvedType(checker.typeToString(ret, enclosing, TYPE_FORMAT_FLAGS));
  // Strip the alias origin so the same type prints in expanded form while inner
  // types keep their names (they are separate type objects, unaffected).
  const stripped: ts.Type = Object.create(
    Object.getPrototypeOf(ret),
    Object.getOwnPropertyDescriptors(ret),
  );
  (stripped as any).aliasSymbol = undefined;
  (stripped as any).aliasTypeArguments = undefined;
  const expanded = cleanResolvedType(checker.typeToString(stripped, enclosing, TYPE_FORMAT_FLAGS));
  if (expanded === collapsed) return sigStr; // nothing gained

  // The return type is the tail of the signature string: `...): <collapsed>`.
  // Both strings are normalized with cleanResolvedType so the two printers'
  // namespace-qualification quirks (`List<T>.NonEmpty` vs `List.NonEmpty`) match.
  const cleanedSig = cleanResolvedType(sigStr);
  const suffix = `: ${collapsed}`;
  if (cleanedSig.endsWith(suffix)) {
    return cleanedSig.slice(0, cleanedSig.length - collapsed.length) + expanded;
  }
  return sigStr; // couldn't safely locate the return; leave collapsed
}

function acceptResolved(s: string): boolean {
  if (!s || s.length > RESOLVED_MAX_LEN) return false;
  // Guard against degenerate expansions (e.g. anonymous huge object types with
  // no named reference). If it contains an identifier followed by `<` or a
  // capitalized type name, it retained useful named structure.
  return true;
}

// Resolve every member of a concrete type entity by reading properties off the
// checker's view of that type, keyed by member name. Falls back silently to the
// raw text (kept in Signature.raw) when a member cannot be resolved.
function buildResolvedIndex(
  typeDecl: ts.InterfaceDeclaration | ts.ClassDeclaration,
  checker: ts.TypeChecker,
): Map<string, string[]> {
  const index = new Map<string, string[]>();
  let concrete: ts.Type | undefined;
  try {
    concrete = checker.getTypeAtLocation(typeDecl);
  } catch {
    return index;
  }
  if (!concrete) return index;
  for (const prop of checker.getPropertiesOfType(concrete)) {
    const name = prop.getName();
    if (name.startsWith('__')) continue;
    let pt: ts.Type;
    try {
      pt = checker.getTypeOfSymbolAtLocation(prop, typeDecl);
    } catch {
      continue;
    }
    const callSigs = pt.getCallSignatures();
    const rendered: string[] = [];
    if (callSigs.length > 0) {
      for (const sig of callSigs) {
        const r = renderResolvedSignature(name, sig, checker, typeDecl);
        if (r) rendered.push(r);
      }
    } else {
      // property: render its type directly
      try {
        const t = checker.typeToString(pt, typeDecl, TYPE_FORMAT_FLAGS);
        const out = cleanResolvedType(`${name}: ${t}`);
        if (acceptResolved(out)) rendered.push(out);
      } catch {
        /* ignore */
      }
    }
    if (rendered.length) index.set(name, rendered);
  }
  return index;
}



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
  // Records the concrete interface/class declaration node for each type entity,
  // so the resolution post-pass can read members off the concrete type (needed
  // to resolve higher-kinded-type indirection like `WithElem<Tp,T>['normal']`
  // into the concrete `List<T>`).
  const typeDeclOf = new Map<string, ts.InterfaceDeclaration | ts.ClassDeclaration>();

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
      typeDeclOf.set(id, typeDecl);
    }

    // namespace facet
    if (mod) {
      const nested: NestedType[] = [];
      const modSymbol = checker.getSymbolAtLocation(mod) ?? symbol;
      modSymbol.exports?.forEach((sym, name) => {
        if (name.startsWith('__')) return;
        const childId = `${id}.${name}`;
        nested.push({ id: childId, name: String(name) });
        // recursively extract the nested entity so it appears in entities map,
        // keyed and self-identified by its fully-qualified id.
        const childEntity = buildEntityFromSymbol(
          sym,
          pkg,
          childId,
          `${entity.qualifiedName}.${String(name)}`,
        );
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
            // Resolve static-method signatures against the concrete value type
            // (same HKT resolution as instance members), keeping raw fallback.
            try {
              const smType = checker.getTypeOfSymbolAtLocation(sm, vardecl);
              const callSigs = smType.getCallSignatures();
              if (callSigs.length === sigs.length) {
                sigs.forEach((sig, i) => {
                  const r = renderResolvedSignature(sm.getName(), callSigs[i], checker, vardecl);
                  if (r && r !== sig.text) {
                    if (sig.raw === undefined) sig.raw = sig.text;
                    sig.text = r;
                    sig.returnsNonEmpty = sig.returnsNonEmpty || returnsNonEmpty(r);
                  }
                });
              }
            } catch {
              /* keep raw text */
            }
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

  // Build a nested entity (e.g. List.NonEmpty) from a symbol. The nested entity
  // is stored under its fully-qualified id (e.g. `list/List.NonEmpty`) and its
  // `id`/`qualifiedName` reflect that nesting so map key === entity.id.
  const buildEntityFromSymbol = (
    symbol: ts.Symbol,
    p: string,
    qualifiedId: string,
    qualifiedName: string,
  ): Entity | undefined => {
    const decls = symbol.getDeclarations();
    if (!decls || !decls.length) return undefined;
    const id = qualifiedId;
    if (entities[id]) return entities[id];
    const iface = decls.find((d) => ts.isInterfaceDeclaration(d)) as ts.InterfaceDeclaration | undefined;
    const cls = decls.find((d) => ts.isClassDeclaration(d)) as ts.ClassDeclaration | undefined;
    const primary = (iface ?? cls ?? decls[0]) as ts.Declaration;
    const tier = tierOf(primary);
    const typeDecl = iface ?? cls;
    const entity: Entity = {
      id,
      name: symbol.getName(),
      qualifiedName,
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
      typeDeclOf.set(id, typeDecl);
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

  // Post-pass: resolve member signature types against each entity's *concrete*
  // interface/class type. Reading members off the concrete type (e.g. `List<T>`)
  // lets the checker substitute higher-kinded-type indirection
  // (`WithElem<Tp,T>['normal']`) into the concrete result (`List<T>`), which is
  // far more readable. Applies to both own and inherited members. The original
  // .d.ts text is preserved in `Signature.raw` and used as a fallback when a
  // member cannot be resolved (or the resolution over-expands past the cap).
  for (const id of Object.keys(entities)) {
    const ent = entities[id];
    if (!ent.type) continue;
    const decl = typeDeclOf.get(id);
    if (!decl) continue;
    const resolved = buildResolvedIndex(decl, checker);
    if (resolved.size === 0) continue;
    for (const member of ent.type.members) {
      const rlist = resolved.get(member.name);
      // Only apply when the overload count lines up, to avoid mispairing.
      if (!rlist || rlist.length !== member.signatures.length) continue;
      member.signatures.forEach((sig, i) => {
        const r = rlist[i];
        if (r && r !== sig.text) {
          if (sig.raw === undefined) sig.raw = sig.text;
          sig.text = r;
          sig.returnsNonEmpty = sig.returnsNonEmpty || returnsNonEmpty(r);
        }
      });
    }
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
  collectExpandAliases(program);

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
