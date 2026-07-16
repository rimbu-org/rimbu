# @rimbu/docs-extractor (Stage 1)

Generates a per-package `.api.json` (the intermediate for the Rimbu docs
pipeline) from the emitted `dist/*.d.ts` declarations.

## Why this folder is isolated

Rimbu builds with the native **TypeScript 7** `tsc` (the root `typescript`
dependency). TypeScript 7 dropped the programmatic compiler API, so this
extractor uses **TypeScript 6** (`typescript@^6` installed locally here) via the
classic `ts.createProgram` / `TypeChecker` API. Bun's workspace hoisting broke a
dual-setup alias, so this folder has its own `node_modules` to keep TS6 isolated
from the root TS7.

## Usage

```sh
cd support/docs-extractor
bun install          # installs local typescript@6
bun run extract      # requires packages to be built first (dist/*.d.ts present)
```

Output: `packages/<name>/dist/api/<name>.api.json` for each package
(`reactor` is excluded — its tsconfig is broken at HEAD and it is experimental).

Set `RIMBU_DOC_REF` to change the Git ref baked into source links (default `main`).

## What it produces

- **Companion-object merge**: a symbol that is simultaneously an `interface`,
  `namespace`, and `const`/`function` becomes one `Entity` with `facets`
  (`type` / `namespace` / `value`) — e.g. `List` = `List<T>` + `List.NonEmpty` +
  `List.empty()`.
- **Inheritance inlined**: members of base types (incl. cross-package, e.g.
  `VariantMapBase`) are copied onto the derived entity, each tagged
  `inheritedFrom`.
- **Overloads grouped**: multiple overloads of one method become one `Member`
  with an array of `signatures` (order preserved; `returnsNonEmpty` badge).
- **Structured JSDoc**: `summary`, `description`, `params`, `examples`, `notes`,
  `deprecated`, `see`.
- **Tier tagging**: `public` (public/ + root) vs `advanced` (advanced/);
  `internal/` is excluded entirely (strict rule — base interfaces currently in
  `internal/` are pulled in only via inheritance recursion; moving them to
  `advanced/` is a separate plan).
- **Source links**: GitHub URL per entity/member (`file` + `line` + `url`).
- **`core` redirection**: re-exported entities are tagged `redirected` with a
  `canonicalId` pointing at the defining package (no duplication).

The JSON schema is `rimbu-docs/entity-graph/v1` (see `Entity` in `src/extract.ts`).
Stage 2 (aggregate) and Stage 3 (Starlight + Markdown renderers) consume it.
