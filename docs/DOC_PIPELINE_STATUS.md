# Docs Pipeline — Status

**Stage 1 (extractor → per-package `.api.json`) and Stage 2 (aggregate + gates)
are DONE.** Implementation lives in `support/docs-extractor/`.

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

- Stage 3: Starlight MDX renderer + Markdown (`API_SURFACE.md`) renderer, both
  consuming `docs/api.aggregate.json`.
