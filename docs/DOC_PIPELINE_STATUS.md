# Docs Pipeline — Status

**Stages 1–3 are DONE** — extractor (`.api.json`), aggregator (gates +
inheritance graph), and both renderers (Starlight site + `API_SURFACE.md`).
Implementation lives in `support/docs-extractor/` and `website/`.

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
