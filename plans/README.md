# Rimbu restructuring plans — index

Per-package handoff plans implementing the **locked target model** (decisions B / B1 / A / C1 / D1 / F1 / G1):

- **B / B1** — a scoped, curated `public/` folder behind a wildcard: `exports["./*"] → "./dist/public/*"`. Short subpath names are preserved; `internal/` is unreachable from outside the package.
- **A** — the root `.` re-exports the package's **whole** public surface. (React hooks stay subpath-only, not in the root.)
- **C1** — three explicit tiers via three folders:
  - `src/public/` → `"./*"` (normal user API, e.g. `@rimbu/<pkg>/map`)
  - `src/advanced/` → `"./advanced/*"` (implementer / extension API, e.g. `@rimbu/<pkg>/advanced/map/base`)
  - `src/internal/` → **never exported**; reachable only via the `#<pkg>/*` import alias
- **D1** — structure focus; fix only *obvious* naming inconsistencies, document the rest as intentional.
- **F1** — a single global version-reconciliation step at the end (true lockstep, per AGENTS.md).
- **G1** — this `plans/` folder: one file per package + this index.

## Target layout (every package)

```
src/
  <pkg>.ts      # root "."  → re-exports public + advanced surfaces
  public/       # "./*" → dist/public/*      (normal user API)
  advanced/     # "./advanced/*" → dist/advanced/*  (implementer / extension API)
  internal/     # never exported; "#<pkg>/*" only   (private impl)
```

## Packages

### Foundation
| Package | Plan | Key action |
|---|---|---|
| `@rimbu/base` | [base.md](base.md) | Create `src/base.ts` root; move 5 utility files to `src/public/`. |
| `@rimbu/common` | [common.md](common.md) | Create `src/common.ts` root; move 11 files to `src/public/`; document `range` vs `index-range` naming collision. |
| `@rimbu/collection-types` | [collection-types.md](collection-types.md) | Move implementer bases (`map/base`, `set/base`, `base-module`) to `src/advanced/`; keep HKT machinery in `src/internal/`; remove `"./*"` leak + `./common`; fix banned relative `./internal` imports. **Breaking import change for downstream packages.** |
| `@rimbu/stream` | [stream.md](stream.md) | Move public entries (incl. `stream-types`) to `src/public/`; remove `./async/internal/*` leaks and `"./*"`; fold `#private/*` into `#stream/*`. |
| `@rimbu/core` | [core.md](core.md) | Replace `"./*"` with explicit subpaths; surface `collection-types/advanced` HKT helpers. No file moves. |

### Core collections
| Package | Plan | Key action |
|---|---|---|
| `@rimbu/hashed` | [hashed.md](hashed.md) | Root must re-export `Hasher` + `HashMap` + `HashSet`; move `map.ts`/`set.ts` to `src/public/`. |
| `@rimbu/sorted` | [sorted.md](sorted.md) | **Empty root** — create proper `src/sorted.ts` re-exporting `SortedMap`+`SortedSet`; move `map`/`set` to `src/public/`; **remove explicit `./internal/*` export (currently leaks impl).** |
| `@rimbu/ordered` | [ordered.md](ordered.md) | **No root export** — create `src/ordered.ts`; move `map`/`set` to `src/public/`, impl to `src/internal/`; **remove `"./*"` leak.** |
| `@rimbu/bimap` | [bimap.md](bimap.md) | Root re-exports whole surface; `internal/` stays. Document `getValue`/`getKey` (no `get`/`mapValues`) as intentional. |
| `@rimbu/bimultimap` | [bimultimap.md](bimultimap.md) | Root re-exports whole surface; `hashed`/`sorted` variants → `src/public/`; **remove `"./*"` leak.** |
| `@rimbu/multimap` | [multimap.md](multimap.md) | Root re-exports; `variant.ts` → `src/advanced/`; key-type impl → `src/internal/`; **remove `"./*"` leak.** Document `setValues`/`addValues` as intentional. |
| `@rimbu/multiset` | [multiset.md](multiset.md) | Root re-exports; `hashed`/`sorted` → `src/public/`, `variant.ts` → `src/advanced/`; **remove `"./*"` leak.** Document `count`/`streamWithCounts` as intentional. |
| `@rimbu/proximity` | [proximity.md](proximity.md) | **DONE** — root re-exports; `distance-function`/`key-matching` → `src/public/`; **removed `"./*"` leak** (now `./dist/public/*`). |
| `@rimbu/table` | [table.md](table.md) | **DONE** — `hash-row`/`sorted-row` variant factories → `src/advanced/`; **removed `"./*"` leak** (now `./dist/public/*` + `./dist/advanced/*`). |
| `@rimbu/graph` | [graph.md](graph.md) | **DONE** — root re-exports whole surface; top-level modules → `src/public/` (incl. `non-valued/`+`valued/` kept public: core re-exports the former, variant ctor = public per table precedent); **removed `"./*"` leak**; fold `#private/*` → `#graph/*`. |

### Async / utilities / misc
| Package | Plan | Key action |
|---|---|---|
| `@rimbu/list` | [list.md](list.md) | Root re-exports `List` + `CharList`/`BitList`/`TypedArrayList`; `char`/`bit`/`typed-array` → `src/public/`; **remove explicit `./internal/*` export (currently leaks entire block-tree impl).** |
| `@rimbu/channel` | [channel.md](channel.md) | Root re-exports all; move 9 modules to `src/public/`; wildcard `./dist/*` → `./dist/public/*`. |
| `@rimbu/task` | [task.md](task.md) | Root re-exports; `ops-impl.ts` → `src/advanced/`; rename internal `utils.ts` → `internal/task-utils.ts`; add root re-exports. |
| `@rimbu/actor` | [actor.md](actor.md) | Root re-exports `Actor`+`Action`+`Slice` (hooks subpath-only); `action`/`slice` → `src/public/`; **remove `"./*"` leak.** |
| `@rimbu/spy` | [spy.md](spy.md) | Already conformant — no changes. |
| `@rimbu/deep` | [deep.md](deep.md) | Fold `#private/*` into `#deep/*`; add root re-exports; wildcard `./dist/*` → `./dist/public/*`. |
| `@rimbu/typical` | [typical.md](typical.md) | Already largely conformant; type-only root, no `public/` needed. |

### Deferred
| Package | Plan | Key action |
|---|---|---|
| `@rimbu/reactor` | — | **DEFERRED** (no plan). Broken/off-convention: empty `scripts`, no `src/internal/`, relative `.mjs` imports, no `dist/`. Revisit separately. |

## Cross-cutting notes

- **`@rimbu/collection-types` is the highest-risk package.** Its `./common`, `./map/base`, `./set/base` (and `base-module`) subpaths are consumed by nearly every other collection package and must be rewritten to `@rimbu/collection-types/advanced/...` after the restructure. Sequence it **first** or handle its downstream rewrites in the same change.
- **`@rimbu/collection-types/test-utils/...`** (used in tests) is currently unexported and out of scope — track separately.
- **`reactor` is intentionally excluded** from this round.
- **Build order:** run `bun run build:seq` before `bun run typecheck` / `bun run test` after each package change (per AGENTS.md §9). The build catches `dist/`-specific diagnostics that `--noEmit` suppresses.
- **No package source was modified** — these files are planning artifacts only.
- **Final step (F1):** after all packages conform, run one coordinated changeset bump so every package shares a single lockstep version.
