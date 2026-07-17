# Docs Pipeline — Status

**Stages 1–3 are DONE** — extractor (`.api.json`), aggregator (gates +
inheritance graph), and both renderers (Starlight site + `API_SURFACE.md`).
Implementation lives in `support/docs-extractor/` and `website/`.

## Example-fixing effort (Stage 4 follow-up) — guidelines DONE, tool NEXT

Goal: rewrite the ~3,687 `@example` blocks to a consistent, high-quality,
verifiable style so agents can fix them autonomously. Design was settled in a
grilling session; see **`docs/EXAMPLE_GUIDELINES.md`** for the full rulebook.

Key decisions (rationale in the guidelines):
- **Examples live on base interfaces** (where members are declared). ~63% of
  members (3,943/6,291) are inherited by empty HKT sub-interfaces (`HashMap`,
  `SortedMap`, `CharList`, graphs/tables/multimaps, …), which have no declaration
  site. Base examples instantiate a **concrete** implementation; variety
  encouraged. **No overlay/`@impl`/override machinery.**
- **Accepted regression:** an inherited example on a sub-interface page may show a
  sibling's concrete type (e.g. `CharList` page showing a `List`-based example).
  Chosen for simplicity over per-page correctness.
- **Cross-package concrete imports verified to type-check** — a `collection-types`
  base example importing `@rimbu/hashed` + `@rimbu/sorted` passes the gate with
  `typeChecks: true`, no gate changes needed (all 23 package dists exist).
- One `@example` per member on the **first signature** (matches TypeDoc); covers
  all overloads in the current interface; base overloads only when valuable.
- Two example kinds: **entity-level** = broad real-world showcase; **member-level**
  = isolate that member's benefit.
- Style: no explicit type annotations (showcase inference); `// inferred type:`
  only for genuinely surprising inference (overload-dependent results like
  `RMapBase.updateAtAndGet`; non-obvious narrowing like `List.of(1,2,3)` →
  `List.NonEmpty<number>`); descriptive names; ≤ 8 lines (hard max ~15).
- Output: final `console.log`; simple values logged directly, collections via
  `.toString()`; never log `undefined`.
- **`// =>` output comment:** inline if line ≤ 80 chars (configurable) else
  next-line (`// =>` marker + plain `//` continuation, one space); one per
  `console.log` in stdout order; **exact byte-for-byte** match.
- **Correct-by-construction:** outputs are **run-and-captured, never
  hand-written**; hashed/order-sensitive output must come from a real run (prefer
  deterministic collections/accessors when hashing isn't the point);
  non-deterministic output (timestamps/random/`Date`) forbidden.
- **`// inferred type:` is also verifiable** against the compiler's real inferred
  type.

**Sequencing (agreed):** build the **run-and-capture + verify tool FIRST**
(extend the existing execute step to capture stdout per `console.log`, fill/verify
`// =>`, and assert `// inferred type:`), then pilot on **List**, then roll out.
The guidelines doc is done and under review; the tool is the next build.

**Verify tool — DONE (`support/docs-extractor/src/verify-examples.ts`,
`bun run docs:verify-examples`).** READ-ONLY verifier (never mutates source):
- **Runtime = Bun** (user decision); `@rimbu/*` resolved to built dist via a
  generated `tsconfig.json` `paths` map (root `.js`, deep `@rimbu/x/*`, and
  package-internal `#x/*` → `dist/internal/*`). Minor browser/Sandpack formatting
  drift for arrays/objects is accepted.
- Per snippet: (1) type-checks (same resolution as the gate; type-erroring
  snippets are reported and skipped for runtime), (2) verifies `// inferred type:`
  against the TS checker's actual inferred type of the named binding, (3) executes
  the snippet and compares captured stdout **per `console.log`, in order,
  byte-for-byte**, recognizing all three comment forms (inline `// => X`,
  next-line `// => X`, multi-line trailing `// =>` + `//` block). `console.log` is
  overridden to delimit each call and format via `Bun.inspect` so splitting is
  reliable.
- Flags: `--strict` (exit 1 on any mismatch, for CI), `--filter=<substr>` (scope
  to a package/entity, e.g. `--filter=list/`). Report:
  `docs/api.examples.verify.report.json` (mismatches include expected vs actual,
  so the correct value is easy to paste).
- **Validated end-to-end**: on real List examples it caught a genuine output bug
  (`[1, 2, 3]` vs Bun's actual `[ 1, 2, 3 ]`). A synthetic example confirmed all
  paths: correct/incorrect inferred type, inline correct/incorrect output, and
  multi-line output all behave correctly. It also **empirically confirmed**
  `List.of(1,2,3)` infers `List.NonEmpty<number>`.

> Note: the worked-example outputs in `EXAMPLE_GUIDELINES.md` §8 are hand-written
> format illustrations and have NOT been run-captured yet (per the doc's own
> rule). Verify them once the capture tool exists.  ← now doable via the verify
> tool; note Bun formats arrays with inner spaces (`[ 1, 2, 3 ]`).

Root scripts:

- `bun run docs` — full pipeline so far (extract + aggregate).
- `bun run docs:extract` — Stage 1 only.
- `bun run docs:aggregate` — Stage 2 only (add `--strict-docs` to enforce the
  missing-doc gate).

## What was built

- `src/extract.ts` uses **TypeScript 6** via an isolated `support/docs-extractor`
  package (own `node_modules`). Reason: the root installs native **TS7**, which
  dropped the programmatic compiler API; Bun's workspace hoisting broke a
  dual-setup alias, so the folder is isolated instead.
- Root `bun run docs` runs the extractor. Packages must be built first with the
  native TS7 `tsc` (the root `bun run build:seq` currently fails to build some
  packages under the resolved `tsc`; build each package individually with native
  tsc, or fix the workspace `tsc` resolution).

## Validated output (22 packages, `reactor` excluded)

- 1,472 entities, 0 invalid JSON files.
- 150 **companion** merges (interface + namespace + const → one entity).
- 508 `core` **redirects** (re-exports tagged `redirected` + `canonicalId`, no dup).
- 164 **advanced-tier** entities (separate from public).
- 1,452 entities with **GitHub source links**.
- Inheritance **inlined** (members tagged `inheritedFrom`, incl. cross-package
  like `VariantMapBase`); overloads **grouped** with `returnsNonEmpty` badge;
  JSDoc **structured**.

## Notes

- Base interfaces currently in `internal/` (e.g. `ListBase`) are still surfaced
  because inheritance recursion pulls them in. Strict tier purity (moving them to
  `advanced/`) is a separate future plan, out of scope here.

## Stage 2 — Aggregate (`src/aggregate.ts` → `docs/api.aggregate.json`)

Merges all per-package `.api.json` into one aggregate (schema
`rimbu-docs/aggregate/v1`), deduplicates, builds the inheritance graph, and runs
the gates. Report always written to `docs/api.aggregate.report.json`.

- **Dedup rule:** exactly one authoritative copy per id — the one emitted by the
  id's *owning* package (id prefix === package) that is not a redirect. Foreign
  inheritance-inlined copies and `core` re-exports are dropped in favour of the
  owner; `core` re-exports recorded as `redirects[]` (from / fromPackage /
  canonicalId).
- **Inheritance graph:** `ancestors[]` (transitive `extends` closure) and
  `descendants[]` (reverse) added to every entity, cycle-guarded. Works
  cross-package (e.g. `HashMap` → `RMapBase`, `VariantMapBase`, `FastIterable`).
- **Gates:**
  1. Broken cross-package xref → **hard fail**
  2. Duplicate owner ids → **hard fail**
  3. Orphan base (`extends` → no entity) → **hard fail**
  4. Public entity missing a doc comment → **warning** by default (written to the
     report); promoted to **hard fail** with `--strict-docs` / `RIMBU_DOCS_STRICT=1`.
     Packages `actor`, `reactor`, `spy`, `typical`, `core` are exempt.
- **Validated output:** 784 unique entities (public 745, advanced 39, companion
  93), 378 redirects, 80 dropped duplicate copies. 0 unresolved
  extends/namespace/redirect/ancestry/`inheritedFrom` references. 232 public
  entities currently lack docs (report only; not enforced yet).

### Two Stage-1 extractor bugs found & fixed during Stage 2

- **Nested subpath entries were not scanned.** `entryFiles` only recursed into
  `public/`, `advanced/`, `esm/` at the top level, skipping nested dirs like
  `public/async/` — so `@rimbu/stream/async` exports (`AsyncReducer`,
  `AsyncTransformer`) were missing, producing 37 broken `core` redirects. Fixed
  to recurse into all non-`internal` subdirs once inside a tier.
- **Nested entity ids were unqualified.** `List.Builder`, `ErrBase.CustomError`,
  etc. were all keyed correctly but their `id` field (and `extends` targets) used
  the bare name (`graph/Builder`, `common/CustomError`), colliding many distinct
  entities onto one id and breaking references. `entityId` now computes the fully
  qualified dotted name (`ErrBase.CustomError`) via the symbol's namespace chain;
  map key === `entity.id` for all 1,242 copies.

## Next

- Stage 4b: final `docs/` cutover (replace Docusaurus with the Starlight
  `website/`) + deployment wiring. Deferred as a separate reviewed step.

## Stage 4a — `@example` type-check gate (DONE)

`support/docs-extractor/src/examples.ts` (script `docs:examples`) is a fourth
consumer of `docs/api.aggregate.json`. It type-checks every documented example so
doc rot fails loudly.

Pipeline per snippet:

1. **Extract** the fenced ` ```ts ` code from each entity/member `@example`
   (111 snippets across the surface).
2. **Type-check the snippet as written.** Examples are expected to include their
   own `import` statements — the gate does **not** auto-inject imports (this was
   removed by design; see below). The snippet's imports are hoisted above an
   `async function` wrapper so top-level `await` in async examples is valid.
3. **Type-check** all snippets in one `ts.Program` with `strict: true` and a
   `paths` map (`@rimbu/*` → each package's built `dist`, honoring the real
   `exports` layout: root → `dist/<pkg>.d.ts`, subpath → `dist/public/*`).
   `noUnusedLocals/Parameters` are off (illustrative snippets).
4. **Report** to `docs/api.examples.report.json` and emit the runtime artifact
   `docs/api.examples.runtime.json` (see "In-browser runnable examples").

Severity (per user): **warning by default**; pass `--strict-examples` (or
`RIMBU_EXAMPLES_STRICT=1`) to hard-fail (exit 1). Wired into `docs:build` before
markdown/site.

### Auto-import removed (design change)

Earlier the gate auto-injected imports for bare identifiers (mapping each entity
name to the specifier it is exported from, preferring `@rimbu/core`). Per user
decision this was **removed**: examples will be updated to carry their own correct
imports. Benefits: snippets are copy-pasteable, the gate is simpler (no identifier
scanning / specifier inference), and the in-browser runner's dependency set is
exact (derived from the snippet's own `import` statements). The identifier→
specifier map, `specifierFromSource`, and `referencedImports` were deleted;
`readPkgExports`/`buildPaths` are kept (still needed to resolve `@rimbu/*` to
built dist for type-checking).

Interim state: since no `@example` has imports yet, the gate reports **0/111**
clean — expected, and non-blocking because the gate is warning-by-default. A
follow-up pass will add correct imports to every `@example`, after which both the
type-check pass rate and the runtime `packages` lists populate automatically.

Transient snippet workdir `docs/.examples-check/` is cleaned after each run
(kept with `RIMBU_EXAMPLES_KEEP=1` for debugging) and git-ignored.

## In-browser runnable examples (Sandpack) — IN PROGRESS

Decision (user): make every `@example` runnable in the browser with an
interactive editor + console output, using **Sandpack (React), lazy-loaded**;
**all** examples get a runner; `@rimbu/*` deps resolved to **`latest`** on the CDN.

### Signature-level example capture (bug fix)

While wiring this up we found the gate was only collecting **111** of the actual
**3687** examples — it read `entity.doc.examples` and `member.doc.examples` but
NOT `member.signatures[i].doc.examples`, where the vast majority live (inherited
members carry their docs on the signature). Fixed: the gate now walks all three
levels. Snippet/runtime key is `"<ownerId>::<member>::<sig>::<index>"` (`sig=-1`
for entity/member-level examples).

### Runtime artifact

`docs/api.examples.runtime.json`: `key → { code, packages, typeChecks }`. `code`
is the snippet as written; `packages` are the external packages it imports (Rimbu
+ others, excluding relative/`node:`); `typeChecks` is the gate result. The
Starlight renderer indexes this **by normalized code string** (examples are shared
across inherited members; duplicates carry identical metadata, so content-keyed
lookup is unambiguous).

### Site architecture (static code + lazy player)

Per user decision the code block stays **always visible and statically
highlighted** (Starlight/Expressive Code — copy button, theme, no hydration);
only a small **Run** control is hydrated (`client:idle`), and clicking Run
**expands the live Sandpack editor + console in place below the code**. Sandpack
is code-split (~621 KB `sandpack` chunk) and fetched only on Run.

Components (`website/src/components/`):
- `RunExample.astro` — wraps the static fenced code block (default slot) + the
  control island.
- `RunExampleControl.tsx` — the Run button; lazy-imports the player on click.
- `SandpackPlayer.tsx` — `SandpackProvider` (`vanilla-ts`, `theme: auto`,
  `layout: console`), deps pinned to `latest`.

`render.ts` emits `<RunExample …>` + a normal ` ```ts ` fence per example, and
injects the component import after frontmatter on pages that have runnable
examples (238 of 784 entity pages). Deps: `@astrojs/react`, `react`, `react-dom`,
`@codesandbox/sandpack-react` added to `website/`; `react()` registered in
`astro.config.mjs`; `jsx: react-jsx` / `jsxImportSource: react` added to
`website/tsconfig.json` (SSR was erroring `React is not defined`).

### Verification status

- **Sandpack empty-console fix (DONE):** the player had `SandpackCodeEditor` +
  `SandpackConsole` but **no `SandpackPreview`**. Per Sandpack docs, "the Preview
  component runs the bundler — without it there is no bundling or evaluation", so
  the code never executed and the console stayed empty (Run button also inert).
  Fix: mark the console `standalone` (`<SandpackConsole standalone … />`), which
  mounts its own client/bundler — correct for Rimbu examples which are
  console-only (no UI to preview). `standalone` confirmed present in the installed
  `@codesandbox/sandpack-react@2.20`. Also added `showSyntaxError`. List-only
  build clean.
- **Gate + runtime:** rebuilt `@rimbu/list` dist (TS7), re-ran extract → aggregate
  → examples. Two hand-fixed List examples (`list.ts` entity, `list-helpers.ts`
  `fromString`) now show `packages: ["@rimbu/list"], typeChecks: true`; overall
  **2/3687** pass (the rest still lack imports — see follow-up).
- **Site build (list-only):** 29 pages build cleanly. Verified the page has
  statically highlighted code (Expressive Code), 39 tiny control islands, and
  **0 Sandpack in the page HTML** (separate 621 KB chunk). ✅ Architecture correct.
- **Full-site build (all 21 packages):** OOM-killed on this container (**3.6 GB
  RAM**, ~2.4 GB free) during Vite's "Building static entrypoints" phase — Sandpack
  + 238 island entrypoints exceed available memory here. Tried `--max-old-space-size`
  up to 6 GB, `build.concurrency: 1`, and a `manualChunks` sandpack split; none
  fit the ceiling. This is an **environment limit, not a code defect** (the
  pre-Sandpack full build produced 802 pages earlier this session). CI/prod with
  ≥ ~6–8 GB should build it. **Open item:** confirm full build on a larger machine
  (and/or further reduce the island footprint).

## Toolchain: Astro 5 → 7 upgrade (fixes React island + rolldown errors) — DONE

Symptoms after wiring Sandpack on Astro 5: dev server spammed
`[vite] Internal server error: Missing field 'moduleType'` from
`builtin:vite-react-refresh-wrapper`, code blocks lost highlighting, and Run
buttons did nothing (browser: `Failed to fetch dynamically imported module
.../astro:scripts/before-hydration.js` — islands never hydrated).

**Root cause (confirmed against withastro/astro#16229):** a **Vite version
mismatch**. `@astrojs/react@6` depends on `vite@8` + `@vitejs/plugin-react@5`
(Rolldown-based, Astro-7-era), but Astro 5 runs its pipeline on `vite@6`
(Rollup-based). With hoisting, the Rolldown-native react-refresh wrapper got
injected into the vite@6 transform pipeline, which lacks the `moduleType` field →
error, which cascaded into broken hydration and highlighting. `@astrojs/react@6`
targets **Astro 7** (its own devDep is `astro@7`).

**Fix (chosen over downgrading to `@astrojs/react@4`, since Astro is moving to
Rolldown anyway):** upgraded the whole stack so every package agrees on
`vite@8`/Rolldown:
- `astro` `^5.13` → **`^7.1.0`**
- `@astrojs/starlight` `^0.36` → **`^0.41.3`** (peer `astro@^7`)
- `@astrojs/react` **`^6.0.1`** (kept; now matches Astro 7)
- `@astrojs/check@0.9.9` (unchanged; supports TS6), `typescript ~6.0`, React 19 —
  all compatible. Node here is 22.23 (Astro 7 needs ≥ 22.12).
- Clean reinstall (`rm -rf node_modules bun.lock && bun install`) → **single
  `vite@8.1.5`**, no nested vite under `astro/`, no dual-vite.

**Verified:**
- `astro check` on full content (all 21 packages): **0 errors, 0 warnings** (3
  pre-existing unused-var hints in `render.ts`).
- List-only `astro build`: clean, **8.6s** (was 10.5s on Astro 5). Built page has
  39 Expressive Code highlight markers, 36 hydration islands each with a valid
  `renderer-url="/_astro/client.*.js"` (the React renderer that previously failed
  to load), **0 Sandpack inlined**, and separate `sandpack.*.js` /
  `SandpackPlayer.*.js` chunks. `RunExampleControl` chunk still `lazy(() =>
  import('./SandpackPlayer'))`. Built through `rolldown-runtime.*.js` with no
  `moduleType` error. ✅
- `manualChunks` sandpack split still works under Rolldown.

**Note (dev server):** couldn't keep a long-lived `astro dev` alive in this
sandbox (background processes get reaped), so dev-mode HMR wasn't re-verified
here; the production build exercises the same vite8/rolldown + react pipeline and
is clean. On a normal machine `astro dev` should no longer show the `moduleType`
error now that the vite versions are unified.

**Still open — build time/CI:** full build was ~2 min on an M2 Max/32 GB (user).
238 island pages dominate. Options to speed CI: further reduce island count, or
accept the cost. Tracked separately from the OOM item above.

## Orchestration (root scripts)

- `docs` → extract + aggregate
- `docs:extract` / `docs:aggregate` / `docs:examples` / `docs:markdown` /
  `docs:render`
- `docs:site` → render MDX + `astro build`
- `docs:build` → **full chain**: extract → aggregate → **examples** → markdown →
  render → astro build. Verified end-to-end: 802 pages + Pagefind index; examples
  gate ran in warning mode without blocking.

## Type resolution (HKT) — DONE

The extractor previously emitted the raw `.d.ts` signature text, so
higher-kinded-type indirection leaked through — e.g. `List.updateAt` read as
`updateAt(index: number, update: (current: T) => T): WithElem<Tp, T>['normal']`.

The extractor now renders **type-checker-resolved** signatures by reading each
member off the entity's *concrete* interface/class type (and, for companion
value facets, off the concrete value type). The checker substitutes the HKT
indirection into the concrete result:

| member | before (raw) | after (resolved) |
| --- | --- | --- |
| `List.updateAt` | `WithElem<Tp, T>['normal']` | `List<T>` |
| `List.append` | `WithElem<Tp, T>['nonEmpty']` | `List.NonEmpty<T>` |
| `List.updateAtAndGet` | `WithValueResult<WithElem<Tp,T>['nonEmpty'], …>` | expanded — see `@docExpand` below |
| `List.empty()` | `WithElem<Tp, T>['normal']` | `List<T>` |

Design / safeguards:

- **Where:** a post-pass in `extract.ts` runs after inheritance inlining and
  resolves each type entity's members (own **and** inherited) against its own
  concrete type recorded in `typeDeclOf`. Value-facet static methods are resolved
  inline against the concrete value type.
- **Flags:** `NoTruncation | UseAliasDefinedOutsideCurrentScope |
  WriteTypeArgumentsOfSignature`. `UseAliasDefinedOutsideCurrentScope` is
  essential — it keeps named aliases (`WithValueResult<…>`) and strips
  `import("@rimbu/…")` prefixes instead of expanding aliases into large
  structural types. `InTypeAlias` is deliberately **not** used (it over-expands).
- **Raw fallback (per user):** the original `.d.ts` text is preserved in
  `Signature.raw`; `text` holds the resolved form. Resolution is applied
  positionally only when the overload count matches, else raw is kept (avoids
  mispairing — e.g. `List.from`, whose single union-typed source signature the
  checker splits into two).
- **Over-expansion guard (per user):** resolved strings over `RESOLVED_MAX_LEN`
  (400 chars) are rejected and raw is kept. Verified: no resolved signature
  exceeds the cap; the 14 signatures >380 chars are all genuine raw source.
- **Cosmetic fixups:** `cleanResolvedType` normalizes the generic-namespace
  qualification quirk (`List<T>.Builder<T>` → `List.Builder<T>`) and strips any
  residual `import("…")` prefixes.
- **Coverage:** ~70.7% of 11,313 signatures resolved to a more concrete form;
  the rest were already concrete or safely fell back to raw. `returnsNonEmpty`
  badges recomputed on resolved text (e.g. `append` now correctly badged).
- **Renderers unchanged:** both consume `Signature.text`; `raw` rides along in
  the JSON for future use (e.g. a "show source type" toggle). `API_SURFACE.md`
  shrank 38.9k → 34.1k lines; `astro build` still green (802 pages).

### Opt-in alias expansion — `@docExpand`

By default resolution keeps type **aliases** named (e.g.
`WithValueResult<List.NonEmpty<T>, T, List<T>>`) rather than expanding them,
because `UseAliasDefinedOutsideCurrentScope` makes the printer prefer the
alias's `aliasSymbol`. For a few aliases the *expanded* structural form is more
useful. To opt one in, add a `@docExpand` JSDoc tag **on the alias definition**:

```ts
/**
 * ...
 * @docExpand
 */
export type WithValueResult<R, V, RNoValue = R, VNoValue = undefined> =
  | [result: R, value: V, hasValue: true]
  | [result: RNoValue, value: VNoValue, hasValue: false];
```

Result (`List.updateAtAndGet`):

```
before: WithValueResult<List.NonEmpty<T>, T, List<T>>
after:  [result: List.NonEmpty<T>, value: T, hasValue: true]
      | [result: List<T>, value: undefined, hasValue: false]
```

Mechanism (`extract.ts`):

- `collectExpandAliases()` scans all `type X = …` declarations for the tag and
  records the alias names in `EXPAND_ALIASES` before extraction. Tags are read
  from `node.jsDoc[].tags` directly — `ts.getJSDocTags` returned `[]` under this
  runtime even though the parsed jsDoc nodes carry the tags.
- When a resolved signature's **return type** has an `aliasSymbol` in the set,
  `maybeExpandReturnAlias()` re-prints that type with the `aliasSymbol` stripped
  (a shallow clone of the `ts.Type` with `aliasSymbol`/`aliasTypeArguments`
  cleared), forcing one-level expansion. **Inner types keep their names**
  (`List<T>`, `List.NonEmpty<T>`) because they are separate type objects; nested
  interfaces are nominal, nested aliases stay collapsed.
- **Top-level only** (per user): expansion applies when the tagged alias is the
  method's return type. Nested occurrences stay collapsed. Both the collapsed
  return string and the signature string are normalized with `cleanResolvedType`
  before the tail match, so the two printers' `List<T>.NonEmpty` vs
  `List.NonEmpty` quirk doesn't defeat the substitution.
- **Source of truth is the `.ts`** (`packages/common/src/public/types.ts`); the
  emitted `.d.ts` was also patched so the current `dist` reflects it before a
  rebuild. A native-TS7 `tsc` rebuild of `common` regenerates the `.d.ts` from
  source with the tag intact.
- **Applied surface-wide:** 138 signatures now render the expanded
  `WithValueResult` tuple; 0 resolved signatures remain collapsed; the 6 raw
  fallbacks (overload-count mismatch) are unaffected.


## Stage 3 — Render (DONE)

Two independent consumers of `docs/api.aggregate.json`.

### Starlight site (`website/`, renderer `website/scripts/render.ts`)

Scaffolded as an **isolated** Astro + Starlight project in `website/` (its own
`package.json`/lockfile; **not** a root workspace member, so it stays clear of
the monorepo's TS7 toolchain). The existing Docusaurus `docs/` is left untouched
until the Stage 4 cutover.

- `render.ts` reads the aggregate and emits, into `website/src/content/docs/`:
  one MDX page per entity (`api/<pkg>/<slug>.mdx`), a package index per package,
  an API landing page, the homepage, and `src/generated/sidebar.json` (imported
  by `astro.config.mjs`). All generated paths are git-ignored and regenerated.
- **Companion layout A** (chosen): interface members first, then collapsible
  *Static methods* (value facet) and *Related types* (namespace facet).
- **Inheritance tree** (Extends / Extended by) rendered from `ancestors[]` /
  `descendants[]`, cross-package links included.
- **Overloads**: all shown by default inside an open expander; each signature
  tagged `data-fallback` and NonEmpty signatures badged.
- **Toggles** (Starlight `Sidebar` override, `src/components/Sidebar.astro`):
  *Show advanced API* (default off — advanced entities hidden via CSS) and
  *Fallback overloads only* (default off). State persisted in `localStorage`.
- **Source links** per entity/member → GitHub. **`core` redirects** render as
  short stubs linking to the canonical page (no duplicated bodies).
- **Validated:** `astro build` produces **802 pages** + Pagefind search index
  with no errors; `astro check` reports **0 errors / 0 warnings** (requires TS
  6.x — pinned in `website/devDependencies`, since native TS7 lacks the
  programmatic API `astro check` needs, same constraint as the extractor).

### Markdown (`support/docs-extractor/src/markdown.ts` → `API_SURFACE.md`)

Regenerates the LLM-review `API_SURFACE.md` (38.9k lines) from the same
aggregate, so the site and the flat surface can't diverge.

### Scripts (root `package.json`)

- `docs` — extract + aggregate.
- `docs:extract` / `docs:aggregate` / `docs:markdown` / `docs:render` — stages.
- `docs:site` — render MDX + `astro build`.
- `docs:build` — full pipeline: extract + aggregate + markdown + site.

Prerequisite unchanged: packages must be built (`dist/*.d.ts`) with native TS7
`tsc` first; `reactor` remains excluded.
