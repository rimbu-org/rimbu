/**
 * Example verifier — run-and-capture + inferred-type checking.
 *
 * Companion to `examples.ts` (the type-check gate). For every `@example` in the
 * Stage 2 aggregate this tool VERIFIES that the example's output and inferred-type
 * comments actually match reality, so the docs stay correct-by-construction. It is
 * READ-ONLY: it never mutates source. It reports mismatches (with the correct
 * value to paste) and, under `--strict`, exits non-zero.
 *
 * What it checks, per snippet:
 *   1. Type-checks the snippet (same resolution as the gate).
 *   2. `// inferred type: <T>` comments — compares against the TS checker's actual
 *      inferred type of the annotated `const`/`let` binding.
 *   3. `// =>` output comments — EXECUTES the snippet with Bun (resolving @rimbu/*
 *      to built dist) and compares captured stdout, per `console.log`, in order,
 *      byte-for-byte. Three comment forms are recognized (see EXAMPLE_GUIDELINES):
 *        - inline:      `console.log(x); // => VALUE`
 *        - next-line:   `console.log(x);` then `// => VALUE`
 *        - multi-line:  `console.log(x); // =>` then a `//` block of output lines
 *
 * Flags:
 *   --strict            exit 1 if any mismatch (for CI)
 *   --filter=<substr>   only verify snippets whose key contains <substr>
 *                       (e.g. --filter=list/ to pilot on the List package)
 *
 * Run: `bun run src/verify-examples.ts` (from support/docs-extractor), or
 *      `bun run docs:verify-examples` from the repo root.
 */
import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  readdirSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
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
const REPORT = join(ROOT, 'docs', 'api.examples.verify.report.json');
const WORKDIR = join(ROOT, 'docs', '.examples-verify');

const STRICT = process.argv.includes('--strict');
const FILTER = (process.argv.find((a) => a.startsWith('--filter=')) ?? '').replace('--filter=', '');

// ---------------------------------------------------------------------------
// Aggregate shape (only what we read)
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
  doc?: DocComment;
  type?: { members: Member[] };
  value?: { staticMethods: Member[] };
}
interface Aggregate {
  entities: Record<string, Entity>;
}

// ---------------------------------------------------------------------------
// Package exports → paths maps (one for type-check .d.ts, one for runtime .js)
// ---------------------------------------------------------------------------
interface PkgExports {
  name: string;
  distDir: string;
  rootDts?: string;
  rootJs?: string;
  subpathDistPrefix?: string;
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
  const rootTypes = typeof dot === 'string' ? dot : dot?.types ?? dot?.default;
  const rootDefault = typeof dot === 'string' ? dot : dot?.default ?? dot?.types;
  if (rootTypes) info.rootDts = resolve(pkgDir, rootTypes.replace(/\.js$/, '.d.ts'));
  if (rootDefault) info.rootJs = resolve(pkgDir, rootDefault.replace(/\.d\.ts$/, '.js'));
  const star = pkg.exports?.['./*'];
  const starRel = typeof star === 'string' ? star : star?.types ?? star?.default;
  if (starRel) {
    const m = starRel.match(/^\.\/(.*)\/\*/);
    if (m) info.subpathDistPrefix = m[1];
  }
  return info;
}

// Type-check paths → .d.ts (mirrors examples.ts).
function buildTypePaths(pkgExports: Map<string, PkgExports>): ts.MapLike<string[]> {
  const paths: ts.MapLike<string[]> = {};
  for (const info of pkgExports.values()) {
    if (info.rootDts && existsSync(info.rootDts)) paths[info.name] = [info.rootDts];
    if (info.subpathDistPrefix) {
      const prefixDir = join(info.distDir, info.subpathDistPrefix.replace(/^dist\//, ''));
      paths[`${info.name}/*`] = [join(prefixDir, '*')];
    } else {
      paths[`${info.name}/*`] = [join(info.distDir, '*')];
    }
  }
  return paths;
}

// Runtime paths → .js dist, plus package-internal `#pkg/*` imports so the
// transitive graph resolves when Bun executes a snippet. Written into a
// tsconfig.json that Bun honors.
function buildRuntimePaths(pkgExports: Map<string, PkgExports>): Record<string, string[]> {
  const paths: Record<string, string[]> = {};
  for (const info of pkgExports.values()) {
    if (info.rootJs && existsSync(info.rootJs)) paths[info.name] = [info.rootJs];
    // deep imports: @rimbu/x/foo -> dist/foo (subpath prefix if declared)
    if (info.subpathDistPrefix) {
      const prefixDir = join(info.distDir, info.subpathDistPrefix.replace(/^dist\//, ''));
      paths[`${info.name}/*`] = [join(prefixDir, '*')];
    } else {
      paths[`${info.name}/*`] = [join(info.distDir, '*')];
    }
    // package-internal imports: #x/* -> that package's dist/internal/*
    const short = info.name.replace('@rimbu/', '');
    paths[`#${short}/*`] = [join(info.distDir, 'internal', '*')];
  }
  return paths;
}

// ---------------------------------------------------------------------------
// Snippet model
// ---------------------------------------------------------------------------
interface Snippet {
  key: string;
  ownerId: string;
  member?: string;
  code: string;
  file: string; // generated .ts path (for type-check + inferred type)
}

function snippetKey(ownerId: string, member: string | undefined, sig: number, index: number): string {
  return `${ownerId}::${member ?? ''}::${sig}::${index}`;
}

function extractCode(example: string): string {
  const fence = example.match(/```(?:ts|typescript|js|javascript)?\s*\n([\s\S]*?)```/i);
  return (fence ? fence[1] : example).trim();
}

// ---------------------------------------------------------------------------
// Output-comment parsing (three forms from EXAMPLE_GUIDELINES §6b)
// ---------------------------------------------------------------------------
interface LogExpectation {
  logLine: number; // 0-based line index of the console.log statement
  expected: string; // expected stdout for this log (may contain newlines)
  form: 'inline' | 'next-line' | 'multi-line' | 'missing';
}

// Parse a snippet's lines and pair each console.log with its declared expected
// output. Returns one expectation per console.log, in source order.
function parseLogExpectations(code: string): LogExpectation[] {
  const lines = code.split('\n');
  const out: LogExpectation[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/\bconsole\.log\s*\(/.test(line)) continue;
    // strip line/inline comments to detect an inline `// =>`
    const inline = line.match(/\/\/\s*=>(.*)$/);
    if (inline) {
      const after = inline[1];
      if (after.trim().length > 0) {
        // inline form: `console.log(x); // => VALUE`
        out.push({ logLine: i, expected: after.replace(/^\s/, ''), form: 'inline' });
        continue;
      }
      // trailing empty `// =>` → multi-line block follows
      const block: string[] = [];
      let j = i + 1;
      while (j < lines.length && /^\s*\/\//.test(lines[j]) && !/\/\/\s*=>/.test(lines[j])) {
        block.push(lines[j].replace(/^\s*\/\/ ?/, ''));
        j++;
      }
      out.push({ logLine: i, expected: block.join('\n'), form: 'multi-line' });
      continue;
    }
    // no inline comment: look for a next-line `// => VALUE`
    const next = lines[i + 1];
    const nextMatch = next?.match(/^\s*\/\/\s*=>(.*)$/);
    if (nextMatch && nextMatch[1].trim().length > 0) {
      out.push({ logLine: i, expected: nextMatch[1].replace(/^\s/, ''), form: 'next-line' });
      continue;
    }
    out.push({ logLine: i, expected: '', form: 'missing' });
  }
  return out;
}

// `// inferred type: T` comments, keyed by the declared variable name on that line.
interface InferredExpectation {
  line: number; // 0-based
  varName: string;
  expected: string;
}
function parseInferredExpectations(code: string): InferredExpectation[] {
  const lines = code.split('\n');
  const out: InferredExpectation[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/\/\/\s*inferred type:\s*(.+?)\s*$/);
    if (!m) continue;
    const decl = lines[i].match(/\b(?:const|let|var)\s+(?:\[[^\]]*\]|\{[^}]*\}|([A-Za-z_$][\w$]*))/);
    const varName = decl?.[1] ?? '';
    out.push({ line: i, varName, expected: m[1] });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Runtime execution: run one snippet with Bun, capturing stdout per console.log.
// We rewrite console.log to emit a delimiter so multiple logs can be split.
// ---------------------------------------------------------------------------
const LOG_DELIM = '\u0000__RIMBU_LOG__\u0000';

function buildRunnableSource(code: string): string {
  // Keep imports at top; wrap the body so top-level await works. Override
  // console.log to print a delimiter before each call's formatted output, using
  // Bun's inspector so formatting matches the type-check runtime.
  const importLines: string[] = [];
  const bodyLines: string[] = [];
  for (const line of code.split('\n')) {
    if (/^\s*import\b/.test(line)) importLines.push(line);
    else bodyLines.push(line);
  }
  const preamble = [
    `const __origLog = console.log;`,
    `let __first = true;`,
    `console.log = (...args) => {`,
    `  const s = args.map((a) => (typeof a === 'string' ? a : Bun.inspect(a, { breakLength: Infinity, compact: true }))).join(' ');`,
    `  __origLog((__first ? '' : ${JSON.stringify(LOG_DELIM)}) + s);`,
    `  __first = false;`,
    `};`,
  ].join('\n');
  return (
    importLines.join('\n') +
    '\n' +
    preamble +
    '\n' +
    'await (async () => {\n' +
    bodyLines.join('\n') +
    '\n})();\n'
  );
}

interface RunResult {
  ok: boolean;
  logs: string[]; // captured output per console.log, in order
  error?: string;
}

function runSnippet(code: string, runtimeTsconfig: string, tmpDir: string, idx: number): RunResult {
  const file = join(tmpDir, `run_${idx}.ts`);
  writeFileSync(file, buildRunnableSource(code));
  const res = spawnSync('bun', ['run', file], {
    cwd: tmpDir,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
    timeout: 20000,
  });
  if (res.status !== 0) {
    return {
      ok: false,
      logs: [],
      error: (res.stderr || res.stdout || 'unknown error').trim().split('\n').slice(0, 6).join('\n'),
    };
  }
  const raw = res.stdout ?? '';
  // Split on our delimiter; trim a single trailing newline per chunk.
  const logs = raw.split(LOG_DELIM).map((c) => c.replace(/\n$/, ''));
  // If nothing was logged, raw is '' → [''] → treat as no logs.
  if (logs.length === 1 && logs[0] === '') return { ok: true, logs: [] };
  return { ok: true, logs };
}

// ---------------------------------------------------------------------------
// Inferred-type checking via the TS checker
// ---------------------------------------------------------------------------
function getInferredTypeForVar(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  varName: string,
): string | undefined {
  let found: string | undefined;
  const visit = (node: ts.Node) => {
    if (found) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === varName) {
      const type = checker.getTypeAtLocation(node.name);
      found = checker.typeToString(
        type,
        node,
        ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedType,
      );
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

// Normalize a type string for comparison: collapse whitespace. (Fully-qualified
// names include import paths; we compare on a best-effort normalized basis and
// also try a suffix match on the simple name.)
function normalizeType(t: string): string {
  return t.replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
interface Mismatch {
  key: string;
  ownerId: string;
  member?: string;
  kind: 'output' | 'inferred-type' | 'runtime-error' | 'type-error';
  detail: string;
  expected?: string;
  actual?: string;
}

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

  // Collect snippets.
  const snippets: Snippet[] = [];
  const addFromDoc = (ownerId: string, member: string | undefined, sig: number, doc?: DocComment) => {
    if (!doc?.examples) return;
    doc.examples.forEach((ex, i) => {
      const code = extractCode(ex);
      if (!code) return;
      const key = snippetKey(ownerId, member, sig, i);
      if (FILTER && !key.includes(FILTER)) return;
      snippets.push({ key, ownerId, member, code, file: '' });
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
    console.log(FILTER ? `No @example snippets match --filter=${FILTER}.` : 'No @example snippets found.');
    return;
  }

  // Prepare workdir + a tsconfig with runtime paths so Bun resolves @rimbu/*.
  rmSync(WORKDIR, { recursive: true, force: true });
  mkdirSync(WORKDIR, { recursive: true });
  const runtimePaths = buildRuntimePaths(pkgExports);
  writeFileSync(
    join(WORKDIR, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { baseUrl: '.', paths: runtimePaths } }, null, 2),
  );

  // Write type-check snippet files (imports hoisted; body wrapped).
  snippets.forEach((s, i) => {
    s.file = join(WORKDIR, `tc_${i}.ts`);
    const importLines: string[] = [];
    const bodyLines: string[] = [];
    for (const line of s.code.split('\n')) {
      if (/^\s*import\b/.test(line)) importLines.push(line.trim());
      else bodyLines.push(line);
    }
    writeFileSync(
      s.file,
      `${importLines.join('\n')}\nasync function __example__() {\n${bodyLines.join('\n')}\n}\nvoid __example__;\n`,
    );
  });

  // One TS program for type-check + inferred-type queries.
  const program = ts.createProgram(
    snippets.map((s) => s.file),
    {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
      lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
      baseUrl: ROOT,
      paths: buildTypePaths(pkgExports),
      noUnusedLocals: false,
      noUnusedParameters: false,
    },
  );
  const checker = program.getTypeChecker();
  const fileToSnippet = new Map(snippets.map((s) => [s.file, s]));
  const typeErrorFiles = new Set<string>();
  for (const d of [...program.getSemanticDiagnostics(), ...program.getSyntacticDiagnostics()]) {
    if (d.file && fileToSnippet.has(d.file.fileName)) typeErrorFiles.add(d.file.fileName);
  }

  const mismatches: Mismatch[] = [];
  let checkedOutputs = 0;
  let checkedTypes = 0;

  snippets.forEach((s, i) => {
    const base = { key: s.key, ownerId: s.ownerId, member: s.member };

    // (1) type errors — report and skip runtime (can't trust it).
    const hasTypeError = typeErrorFiles.has(s.file);
    if (hasTypeError) {
      mismatches.push({ ...base, kind: 'type-error', detail: 'snippet has type errors (see gate report)' });
    }

    // (2) inferred-type comments.
    const inferredExps = parseInferredExpectations(s.code);
    if (inferredExps.length && !hasTypeError) {
      const sf = program.getSourceFile(s.file);
      if (sf) {
        for (const exp of inferredExps) {
          checkedTypes++;
          if (!exp.varName) {
            mismatches.push({
              ...base,
              kind: 'inferred-type',
              detail: 'could not determine the variable for an "// inferred type:" comment (destructuring or complex declaration not supported)',
              expected: exp.expected,
            });
            continue;
          }
          const actual = getInferredTypeForVar(sf, checker, exp.varName);
          if (actual === undefined) {
            mismatches.push({ ...base, kind: 'inferred-type', detail: `variable "${exp.varName}" not found`, expected: exp.expected });
            continue;
          }
          const na = normalizeType(actual);
          const ne = normalizeType(exp.expected);
          // Accept exact match, or the checker's fully-qualified string ending in the declared one.
          const ok = na === ne || na.endsWith(ne) || na.replace(/import\([^)]*\)\./g, '') === ne;
          if (!ok) {
            mismatches.push({
              ...base,
              kind: 'inferred-type',
              detail: `inferred type of "${exp.varName}" does not match`,
              expected: exp.expected,
              actual: actual,
            });
          }
        }
      }
    }

    // (3) output comments — execute and compare (skip if type errors).
    const logExps = parseLogExpectations(s.code);
    const hasOutputComments = logExps.some((e) => e.form !== 'missing');
    if (!hasTypeError && logExps.length > 0) {
      const run = runSnippet(s.code, join(WORKDIR, 'tsconfig.json'), WORKDIR, i);
      if (!run.ok) {
        mismatches.push({ ...base, kind: 'runtime-error', detail: 'snippet threw at runtime', actual: run.error });
      } else {
        // Compare each console.log's expectation with captured output, in order.
        for (let li = 0; li < logExps.length; li++) {
          const exp = logExps[li];
          const actual = run.logs[li] ?? '';
          if (exp.form === 'missing') {
            // Only flag missing comments if the example declares any (author intent
            // to document output). A snippet with zero output comments is allowed
            // during authoring; the gate/verify reports it as advisory below.
            mismatches.push({
              ...base,
              kind: 'output',
              detail: `console.log #${li + 1} has no "// =>" output comment`,
              actual,
            });
            continue;
          }
          checkedOutputs++;
          if (exp.expected !== actual) {
            mismatches.push({
              ...base,
              kind: 'output',
              detail: `console.log #${li + 1} output mismatch (${exp.form})`,
              expected: exp.expected,
              actual,
            });
          }
        }
        // Extra logs beyond declared expectations.
        if (run.logs.length > logExps.length) {
          mismatches.push({
            ...base,
            kind: 'output',
            detail: `captured ${run.logs.length} logs but only ${logExps.length} console.log statements parsed`,
          });
        }
      }
    }
    void hasOutputComments;
  });

  const report = {
    generatedAt: new Date().toISOString(),
    filter: FILTER || null,
    totalSnippets: snippets.length,
    checkedOutputs,
    checkedInferredTypes: checkedTypes,
    mismatches: mismatches.length,
    strict: STRICT,
    details: mismatches,
  };
  writeFileSync(REPORT, JSON.stringify(report, null, 2));

  if (!process.env.RIMBU_EXAMPLES_KEEP) rmSync(WORKDIR, { recursive: true, force: true });

  console.log(
    `Verified ${snippets.length} snippet(s)${FILTER ? ` (filter="${FILTER}")` : ''}: ` +
      `${checkedOutputs} output comment(s), ${checkedTypes} inferred-type comment(s). ` +
      `${mismatches.length} issue(s).`,
  );
  console.log(`Report: ${REPORT}`);

  const preview = mismatches.slice(0, 15);
  for (const m of preview) {
    console.log(`  - [${m.kind}] ${m.ownerId}${m.member ? '.' + m.member : ''}: ${m.detail}`);
    if (m.expected !== undefined) console.log(`      expected: ${JSON.stringify(m.expected)}`);
    if (m.actual !== undefined) console.log(`      actual:   ${JSON.stringify(m.actual)}`);
  }
  if (mismatches.length > preview.length) console.log(`  … and ${mismatches.length - preview.length} more`);

  if (STRICT && mismatches.length > 0) process.exit(1);
}

main();
