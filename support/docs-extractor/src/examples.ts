/**
 * Stage 4 — `@example` type-check gate.
 *
 * A fourth consumer of the Stage 2 aggregate (docs/api.aggregate.json). For every
 * entity/member `@example` block it:
 *   1. extracts the fenced ```ts code,
 *   2. type-checks the snippet *as written* in a single TS program whose `paths`
 *      map `@rimbu/*` to each package's built `dist`,
 *   3. reports diagnostics, and
 *   4. emits a runtime artifact (docs/api.examples.runtime.json) consumed by the
 *      Starlight site to build in-browser runnable examples (Sandpack).
 *
 * Examples are expected to include their own `import` statements — the gate does
 * NOT auto-inject imports. This keeps snippets copy-pasteable and makes the
 * dependency set for the in-browser runner exact (derived from the snippet's own
 * imports).
 *
 * By default failures are **warnings** written to docs/api.examples.report.json.
 * Pass `--strict-examples` (or set RIMBU_EXAMPLES_STRICT=1) to hard-fail (exit 1)
 * when any snippet has type errors — catches documentation rot.
 *
 * Run: `bun run src/examples.ts`  (from support/docs-extractor), or
 *      `bun run docs:examples` from the repo root.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import ts from 'typescript';

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
const AGGREGATE = join(ROOT, 'docs', 'api.aggregate.json');
const REPORT = join(ROOT, 'docs', 'api.examples.report.json');
// Runtime artifact consumed by the Starlight site renderer to build in-browser
// runnable examples (Sandpack). One entry per snippet: the snippet source plus
// the set of external packages it imports.
const RUNTIME = join(ROOT, 'docs', 'api.examples.runtime.json');
const WORKDIR = join(ROOT, 'docs', '.examples-check');

const STRICT =
  process.argv.includes('--strict-examples') || process.env.RIMBU_EXAMPLES_STRICT === '1';

// ---------------------------------------------------------------------------
// Aggregate shape (only the bits we read)
// ---------------------------------------------------------------------------
interface DocComment {
  examples?: string[];
}
interface Signature {
  doc?: DocComment;
}
interface Member {
  name: string;
  doc?: DocComment;
  signatures?: Signature[];
}
interface Entity {
  id: string;
  name: string;
  qualifiedName: string;
  package: string;
  source?: { file: string; line: number; url: string };
  doc?: DocComment;
  type?: { members: Member[] };
  value?: { staticMethods: Member[] };
}
interface Aggregate {
  redirects?: Array<{ from: string; fromPackage: string; canonicalId: string }>;
  entities: Record<string, Entity>;
}

// ---------------------------------------------------------------------------
// Package `exports` info — used to build the `paths` map so `@rimbu/*` resolves
// to each package's built dist (honoring root vs. subpath exports).
// ---------------------------------------------------------------------------
interface PkgExports {
  name: string; // @rimbu/<pkg>
  distDir: string; // absolute dist dir
  rootDts?: string; // absolute path of root .d.ts
  subpathDistPrefix?: string; // e.g. dist/public  (undefined if no ./* export)
}

function readPkgExports(pkgDir: string): PkgExports | undefined {
  const pj = join(pkgDir, 'package.json');
  if (!existsSync(pj)) return undefined;
  let pkg: any;
  try {
    pkg = JSON.parse(readFileSync(pj, 'utf8'));
  } catch {
    return undefined;
  }
  if (!pkg.name?.startsWith('@rimbu/')) return undefined;
  const distDir = join(pkgDir, 'dist');
  const info: PkgExports = { name: pkg.name, distDir };
  const dot = pkg.exports?.['.'];
  const rootRel = typeof dot === 'string' ? dot : dot?.types ?? dot?.default;
  if (rootRel) info.rootDts = resolve(pkgDir, rootRel.replace(/\.js$/, '.d.ts'));
  const star = pkg.exports?.['./*'];
  const starRel = typeof star === 'string' ? star : star?.types ?? star?.default;
  if (starRel) {
    // e.g. "./dist/public/*.d.ts" -> "dist/public"
    const m = starRel.match(/^\.\/(.*)\/\*/);
    if (m) info.subpathDistPrefix = m[1];
  }
  return info;
}

// ---------------------------------------------------------------------------
// Snippet extraction
// ---------------------------------------------------------------------------
// Examples can live at three levels:
//   - entity.doc.examples                (member = undefined, sig = -1)
//   - member.doc.examples                (sig = -1)
//   - member.signatures[i].doc.examples  (sig = i)  ← most examples live here,
//     because inherited members carry their docs on the signature.
// A snippet's stable key is `<ownerId>::<member>::<sig>::<index>`; the site
// renderer computes the same key to look up the runtime entry.
interface Snippet {
  ownerId: string;
  member?: string;
  sig: number; // signature index, or -1 for member/entity-level examples
  index: number; // nth example within that doc block
  code: string; // raw extracted code (no fences)
  file: string; // generated .ts path
}

function snippetKey(ownerId: string, member: string | undefined, sig: number, index: number): string {
  return `${ownerId}::${member ?? ''}::${sig}::${index}`;
}

// Pull the code out of a ```ts fenced block (or the whole text if unfenced).
function extractCode(example: string): string {
  const fence = example.match(/```(?:ts|typescript|js|javascript)?\s*\n([\s\S]*?)```/i);
  return (fence ? fence[1] : example).trim();
}

// External module specifiers imported by the snippet (from its own `import`s).
function importedSpecifiers(code: string): string[] {
  const specs = new Set<string>();
  for (const m of code.matchAll(/^\s*import\b[^;]*?from\s+['"]([^'"]+)['"]/gm)) {
    specs.add(m[1]);
  }
  // Side-effect / bare imports: `import 'x';`
  for (const m of code.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm)) {
    specs.add(m[1]);
  }
  return [...specs];
}

// Package names (e.g. @rimbu/core, uuid) referenced by import specifiers,
// excluding relative and Node built-in (`node:`) imports.
function packagesFromSpecifiers(specifiers: string[]): string[] {
  const pkgs = new Set<string>();
  for (const spec of specifiers) {
    if (spec.startsWith('.') || spec.startsWith('node:')) continue;
    const m = spec.match(/^(@[^/]+\/[^/]+)/);
    if (m) pkgs.add(m[1]);
    else pkgs.add(spec.split('/')[0]);
  }
  return [...pkgs].sort();
}

// Build the type-check source: hoist the snippet's imports above an async wrapper
// so top-level `await` in async examples is valid. No imports are injected.
function buildSnippetSource(code: string): string {
  const importLines: string[] = [];
  const bodyLines: string[] = [];
  for (const line of code.split('\n')) {
    if (/^\s*import\b/.test(line)) importLines.push(line.trim());
    else bodyLines.push(line);
  }
  const body = bodyLines.join('\n');
  return `${importLines.join('\n')}\nasync function __example__() {\n${body}\n}\nvoid __example__;\n`;
}

// ---------------------------------------------------------------------------
// Path mapping so `@rimbu/*` resolves to built dist (honoring each package's
// actual `exports` map: root -> dist/<pkg>.d.ts, subpath -> dist/public/*).
// ---------------------------------------------------------------------------
function buildPaths(pkgExports: Map<string, PkgExports>): ts.MapLike<string[]> {
  const paths: ts.MapLike<string[]> = {};
  for (const info of pkgExports.values()) {
    if (info.rootDts && existsSync(info.rootDts)) paths[info.name] = [info.rootDts];
    if (info.subpathDistPrefix) {
      const prefixDir = join(info.distDir, info.subpathDistPrefix.replace(/^dist\//, ''));
      paths[`${info.name}/*`] = [join(prefixDir, '*')];
    } else {
      // Root-only package: still allow deep imports into dist as a fallback.
      paths[`${info.name}/*`] = [join(info.distDir, '*')];
    }
  }
  return paths;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  if (!existsSync(AGGREGATE)) {
    console.error(`Aggregate not found at ${AGGREGATE}. Run \`bun run docs:aggregate\` first.`);
    process.exit(1);
  }
  const agg: Aggregate = JSON.parse(readFileSync(AGGREGATE, 'utf8'));
  const pkgExports = new Map<string, PkgExports>();
  for (const pkg of readdirSync(PACKAGES_DIR)) {
    const info = readPkgExports(join(PACKAGES_DIR, pkg));
    if (info) pkgExports.set(info.name, info);
  }

  // Collect all examples into snippets.
  const snippets: Snippet[] = [];
  const addFromDoc = (
    ownerId: string,
    member: string | undefined,
    sig: number,
    doc?: DocComment,
  ) => {
    if (!doc?.examples) return;
    doc.examples.forEach((ex, i) => {
      const code = extractCode(ex);
      if (!code) return;
      snippets.push({ ownerId, member, sig, index: i, code, file: '' });
    });
  };
  const addMember = (ownerId: string, m: Member) => {
    addFromDoc(ownerId, m.name, -1, m.doc);
    (m.signatures ?? []).forEach((s, si) => addFromDoc(ownerId, m.name, si, s.doc));
  };
  for (const id of Object.keys(agg.entities)) {
    const e = agg.entities[id];
    addFromDoc(id, undefined, -1, e.doc);
    for (const m of e.type?.members ?? []) addMember(id, m);
    for (const m of e.value?.staticMethods ?? []) addMember(id, m);
  }

  if (snippets.length === 0) {
    console.log('No @example snippets found.');
    return;
  }

  // Write snippet files.
  rmSync(WORKDIR, { recursive: true, force: true });
  mkdirSync(WORKDIR, { recursive: true });
  snippets.forEach((s, i) => {
    const slug =
      `${s.ownerId}${s.member ? '.' + s.member : ''}.${s.sig}.${s.index}`.replace(
        /[^\w.-]/g,
        '_',
      ) + `.${i}.ts`;
    s.file = join(WORKDIR, slug);
    writeFileSync(s.file, buildSnippetSource(s.code));
  });

  // Type-check all snippets in one program.
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    types: [],
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    baseUrl: ROOT,
    paths: buildPaths(pkgExports),
    // Examples are illustrative: don't fail on unused locals or implicit any noise
    // that is inherent to short snippets; we care about *type* correctness.
    noUnusedLocals: false,
    noUnusedParameters: false,
  };
  const program = ts.createProgram(
    snippets.map((s) => s.file),
    options,
  );
  const fileToSnippet = new Map(snippets.map((s) => [s.file, s]));

  const diagnostics = [
    ...program.getSemanticDiagnostics(),
    ...program.getSyntacticDiagnostics(),
  ].filter((d) => d.file && fileToSnippet.has(d.file.fileName));

  interface FailReport {
    ownerId: string;
    member?: string;
    sig: number;
    index: number;
    errors: string[];
  }
  const failByFile = new Map<string, FailReport>();
  for (const d of diagnostics) {
    const s = fileToSnippet.get(d.file!.fileName)!;
    const key = d.file!.fileName;
    if (!failByFile.has(key)) {
      failByFile.set(key, {
        ownerId: s.ownerId,
        member: s.member,
        sig: s.sig,
        index: s.index,
        errors: [],
      });
    }
    const { line, character } = d.file!.getLineAndCharacterOfPosition(d.start ?? 0);
    const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
    failByFile.get(key)!.errors.push(`(${line + 1}:${character + 1}) TS${d.code}: ${msg}`);
  }

  const fails = [...failByFile.values()];
  const failedKeys = new Set(fails.map((f) => snippetKey(f.ownerId, f.member, f.sig, f.index)));
  const report = {
    generatedAt: new Date().toISOString(),
    total: snippets.length,
    failed: fails.length,
    passed: snippets.length - fails.length,
    strict: STRICT,
    failures: fails,
  };
  writeFileSync(REPORT, JSON.stringify(report, null, 2));

  // Emit the runtime artifact for the in-browser runner. One entry per snippet,
  // keyed `<ownerId>::<member>::<sig>::<index>`, holding the snippet source (as
  // written), the external packages it imports, and whether it type-checked.
  const runtime: Record<string, { code: string; packages: string[]; typeChecks: boolean }> = {};
  for (const s of snippets) {
    const key = snippetKey(s.ownerId, s.member, s.sig, s.index);
    runtime[key] = {
      code: s.code,
      packages: packagesFromSpecifiers(importedSpecifiers(s.code)),
      typeChecks: !failedKeys.has(key),
    };
  }
  writeFileSync(RUNTIME, JSON.stringify(runtime, null, 2));

  // Cleanup snippet workdir (kept only on request for debugging).
  if (!process.env.RIMBU_EXAMPLES_KEEP) rmSync(WORKDIR, { recursive: true, force: true });

  console.log(
    `Examples: ${report.passed}/${report.total} type-checked ok, ${report.failed} with errors.`,
  );
  console.log(`Report: ${REPORT}`);
  console.log(`Runtime: ${RUNTIME}`);

  if (fails.length > 0) {
    const preview = fails.slice(0, 10);
    for (const f of preview) {
      console.log(`  - ${f.ownerId}${f.member ? '.' + f.member : ''} [#${f.index}]`);
      for (const e of f.errors.slice(0, 3)) console.log(`      ${e}`);
    }
    if (fails.length > preview.length) console.log(`  … and ${fails.length - preview.length} more`);
    if (STRICT) {
      console.error(`\nFAIL: ${fails.length} example(s) have type errors (--strict-examples).`);
      process.exit(1);
    } else {
      console.warn(
        `\nwarn:  ${fails.length} example(s) have type errors (see report). ` +
          `Run with --strict-examples to enforce.`,
      );
    }
  }
}

main();
