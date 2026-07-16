# Rimbu Code Documentation Pipeline — Plan

Status: approved direction (grilling session). Not yet implemented.

## Goal

Replace the entire `docs/` folder (currently TypeDoc + Docusaurus) with a
**Starlight**-based API-reference site purpose-built for Rimbu. The differentiator
is faithful treatment of the **companion-object pattern** (an entity that is
simultaneously an `interface`, a `namespace`, and a `const` value — e.g. `List`
is `List<T>` + `List.NonEmpty` + `List.empty()`), which no existing TS doc tool
renders correctly. (The existing `support/typedoc-rimbu-plugin` is a 7-line stub;
the merge is not actually implemented today, so this pipeline is the first real
solution and carries no regression risk on that front.)

Scope: **code documentation only**. Hand-written guides/blog are not migrated;
they remain recoverable from git history.

## Architecture

Three stages, decoupled by a single intermediate: per-package `.api.json`,
aggregated into a root JSON. Two renderers consume the aggregate — Starlight MDX
(the site) and Markdown (the LLM-review `API_SURFACE.md`).

```
src/*.ts + dist/*.d.ts
   │  (TS 5.9 compiler API — TS 7 dropped the programmatic API;
   │   the @typescript/old alias is currently a broken self-loop, so the
   │   extractor resolves typescript@5.9.3 explicitly)
   ▼
extract.ts  ──►  packages/<name>/dist/api/<name>.api.json   (per package)
   │
aggregate.ts ──►  docs/api.aggregate.json  (root; inheritance graph; xref check)
   │
   ├─► starlight.ts ──► docs/ (Starlight MDX site)
   └─► markdown.ts   ──► API_SURFACE.md   (LLM review; byproduct, no divergence)
```

### Stage 1 — Extract (`extract.ts`)

- Inputs: each package's `public/` tier + root entry `.d.ts`, and the `advanced/`
  tier `.d.ts`. Built via `build:seq` first (emitted `dist` has `#internal`
  imports rewritten to real `@rimbu/*` specifiers, so the checker resolves the
  whole graph via workspace symlinks).
- Traverses entry exports, following `extends` / `implements` / `import type`
  through the type graph (same technique as the prototype `gen-api-surface-resolved.ts`).
- **Companion merge:** a symbol that is simultaneously an `interface`/`class`
  (type facet), a `module` (namespace facet), and a `const`/`function` (value
  facet) becomes **one `Entity`** with `kind: "companion"` and `facets`:
  - `facets.type` — the interface/class: `typeParams`, `extends` (ids), inlined
    `members` (signatures + doc + source link).
  - `facets.namespace` — nested types (`NonEmpty`, `Builder`, `Context`, …) as
    referenced child entities.
  - `facets.value` — the `const`/`function`: static method signatures
    (`empty`, `of`, `from`, …) resolved from the `Creators` type.
- **Inheritance:** ancestors fully inlined (including cross-package bases such as
  `VariantMapBase`), each member tagged with `inheritedFrom` (entity id). Members
  are appended after the entity's own members, source-tagged.
- **Overloads:** grouped under one member name, **source order preserved**, each
  overload tagged `returnsNonEmpty: boolean` (drives the badge; preserves the
  AGENTS.md §1.1 NonEmpty-first contract).
- **Tier mapping (strict, fixed decision):** `public/` + root entry →
  `tier: "public"`; `advanced/` → `tier: "advanced"`; `internal/` → **excluded
  entirely**. No config-based overrides.
  - **Known limitation (accepted):** base interface declarations currently live in
    `internal/` (e.g. `ListBase`, `RMapBase`); under strict mapping their methods
    will NOT appear on the consuming page until those files are physically moved
    to `advanced/`. Resolving this is a **separate future plan** (file moves);
    this documentation plan does not work around it.
- **Structured doc comments:** JSDoc parsed into `{ summary, description, params[],
  examples[], notes[], deprecated?, see[] }` rather than raw text.
- **Source links:** per declaration, record
  `source: { file: "src/<pkg>/<rel>.ts", line: N, url }` where `url` is built from
  a configurable Git ref (default `main`):
  `https://github.com/rimbu-org/rimbu/blob/<ref>/packages/<pkg>/src/<rel>.ts#L<N>`.
  `dist` → `src` path mapping is mechanical (strip `dist/`, `.d.ts`→`.ts`). Line
  numbers refer to the **source** file. Inlined inherited members link to their
  base's source file.
- **`core` re-exports:** entities reachable only via `@rimbu/core` are emitted with
  `redirected: true` + `canonicalId` pointing at the defining package (see Stage 3).

### Stage 2 — Aggregate (`aggregate.ts`)

- Merges all per-package `.api.json` into `docs/api.aggregate.json`.
- Computes the **global inheritance graph**: for every entity, `ancestors[]` and
  `descendants[]` (id lists), used to render the inheritance tree on each page.
- **Hard-fail (exit non-zero) on:**
  1. Broken cross-package xref (an `extends`/`references` id that resolves to no
     emitted entity).
  2. Duplicate entity IDs (within or across packages).
  3. Orphan base (a parent referenced in the inheritance tree but with no emitted
     declaration).
  4. A **public**-tier method/entity missing a doc comment — **unless** the package
     is in the **exclusion list** (`actor`, `reactor`, `spy`, `typical`, `core`).
- Warnings (non-fatal): missing `@summary` on public entities; `@deprecated`
  without a replacement note.

### Stage 3 — Render

Two independent consumers of `docs/api.aggregate.json`.

**Starlight MDX (`starlight.ts`)**
- `docs/` becomes a Starlight project (new `package.json`, `astro.config.mjs`,
  content tree). One `.mdx` page per `Entity`, URLs like `/api/list`,
  `/api/hashed`, grouped in the sidebar under an `API` section; `core` is an
  umbrella index.
- `kind: "companion"` page layout: **deferred decision (A vs B)** — generate both
  as example pages post-Stage-3 to choose. A = interface-first with collapsible
  *Static methods* and *Related types* sections; B = tabbed (Instance / Static /
  Types).
- Every interface page renders an **inheritance tree**: ancestors (with links)
  and descendants (with links).
- **Overload UI:** expander showing all overloads (ordered, NonEmpty-badged); a
  toggle to show only the fallback (last) overload.
- **Advanced-tier toggle:** UI switch to show/hide `tier: "advanced"` entities in
  the API tree (default hidden).
- **Source links:** "Source" link on each entity and member → GitHub (Stage 1 url).
- **`core` reference pages:** `redirected` entities render as a short page linking
  to the canonical package page (no duplicated method bodies). `core` itself is an
  umbrella index listing aggregated packages.
- Search: Starlight built-in (client-side index over generated MDX). Single version.

**Markdown (`markdown.ts`)**
- Regenerates `API_SURFACE.md` from the aggregate JSON (the LLM-review artifact).
  Single source of truth with the site; no separate script, no divergence.

### Stage 4 — Doc examples gate

- `@example` blocks extracted to standalone `.ts` snippet files and **type-checked**
  against the built packages. A snippet that fails to compile fails the build
  (catches doc rot). Rendered as highlighted, copy-pastable code blocks.

## Orchestration

Root script `bun run docs:build`:
1. `build:seq` (emit `dist`)
2. `extract.ts` → per-package `.api.json`
3. `aggregate.ts` (fail on gates) → `docs/api.aggregate.json`
4. `starlight.ts` → `docs/` MDX  (+ example type-check gate)
5. `markdown.ts` → `API_SURFACE.md`
6. `astro build` (Starlight site)

Git ref for source links supplied via env/CLI (default `main`).

## Phasing (delivery order)

1. **Stage 1** — extractor + per-package `.api.json` + companion merge + source
   links + structured docs. Foundation everything else consumes.
2. **Stage 2** — aggregator + inheritance graph + all hard-fail gates.
3. **Stage 3** — Starlight scaffold + MDX renderer (companion collapse, inheritance
   tree, overload expander + fallback toggle, advanced toggle, `core` reference
   pages) + Markdown renderer.
4. **Stage 4 + orchestration** — example extraction/type-check, `bun run docs:build`,
   replace `docs/`.

Each phase is independently reviewable; Phase 1 is the critical path.

## Open decisions (deferred, non-blocking)

- Companion page layout **A vs B**: generate both example pages after Stage 3.
- Default on/off state of the two UI toggles (overload fallback; advanced tier).

## Out of scope

- File moves from `internal/` → `advanced/` (separate future plan; required to
  surface base-interface methods under strict tier mapping).
- Migrating hand-written guides/blog (recoverable from git).
- Version switcher / multi-version docs.
- New packages beyond the current 23.
