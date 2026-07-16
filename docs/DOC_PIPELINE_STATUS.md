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

- Stage 4: `@example` extraction + type-check gate; final `docs/` cutover /
  deployment wiring.

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
| `List.updateAtAndGet` | `WithValueResult<WithElem<Tp,T>['nonEmpty'], …>` | `WithValueResult<List.NonEmpty<T>, T, List<T>>` |
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
