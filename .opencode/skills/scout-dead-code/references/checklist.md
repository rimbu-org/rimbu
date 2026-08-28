# Scout-Dead-Code Checklist

Source: `AGENTS.md:79-113` §3, `AGENTS.md:138-152` import rule, `spec.md:2.7` Q12, ticket `05`. All findings are `warn` (potential dead) or `info` (advisory), never `error` (Q12).

## Scope

- **Default:** single package `<pkg>` (`packages/<name>` with `src/public/` or `src/internal/` or `src/advanced/`)
- **`--workspace`:** all packages with `package.json` (exclude `list2` unpublished), builds cross-package import graph via `rg` + `tsconfig` `paths` (`#pkg/*`, `@rimbu/*`)

## Checks

| Rule | Severity | Check | Evidence (rg command + match count) | Fix |
|---|---|---|---|---|
| `unused-public-export` | warn | For each `export`/`export type`/`export *` in `src/public/**/*.ts` (and `src/<name>.ts` if it re-exports), search importers in `src/` + `test/` + `test-d/` + `test-random/` across `packages` (including cross-package via `@rimbu/<pkg>` and same-package via `src/public` self). If `0` matches, flag as potential dead. | `rg -n "from.*@rimbu/<pkg>.*<export>|import.*<export>" packages --no-heading => 0 matches` + `rg -n "export.*<export>" src/public` line | Remove export or add importer; re-run `rg` to confirm |
| `orphan-internal-file` | warn | For each `src/internal/**/*.ts` file (by basename without extension), search importers in `packages/<pkg>/src/` via `#<pkg>/*` alias and relative basename. If `0` importers (excluding self-import), flag as orphan. | `rg -n "from.*#<pkg>.*<basename>|from.*<basename>" packages/<pkg>/src --no-heading => 0 matches` | Remove file or add importer |
| `stale-advanced-reexport` | warn | For each `src/advanced/**/*.ts` that `export * from '#<pkg>/...'` or `export { ... } from '#<pkg>/...'`, check that target `src/internal/...` file still exists and is still private (not exposed via `src/public/`). If target missing or now also `export`ed via `public`, flag as stale. | `rg -n "export.*from.*#<pkg>" src/advanced --no-heading` + `ls src/internal/<target>` + `rg -n "export.*<target>" src/public` | Remove or update re-export |
| `files-exports-drift` | warn | Compare `src/public/` and `src/advanced/` existence vs `package.json` `exports` (`"./*"` → `src/public/`, `"./advanced/*"` → `src/advanced/`). If `src/public/` exists but no `exports["./*"]`, or `src/advanced/` exists but no `exports["./advanced/*"]`, or vice versa (exports declares but src missing), flag drift. | `ls src/public` vs `jq .exports package.json` | Add missing `exports` or remove `src` dir per `AGENTS.md:79-113` |
| `advanced-low-usage` | info | `src/advanced/` re-export has only `1` importer across `packages` (low usage, not dead). Advisory that `advanced` API may be underused but not dead. | `rg -n "from.*@rimbu/<pkg>/advanced" packages --no-heading => 1` | Consider keeping or promoting to `public` |
| `internal-single-importer` | info | `src/internal/` file has exactly `1` importer (low usage). Advisory. | `rg -n "from.*#<pkg>.*<basename>" packages/<pkg>/src => 1` | Keep if implementation split, or inline |

All findings include `rg` command + match count `0` (or `1` for advisory) as `Evidence`. Never `error` — even confirmed dead remains `warn` until human removes via `rg` confirmation (Q12). `maintain-skills` must not promote `warn` to `error`.

## Evidence Format

- `Evidence` column: `` `rg -n "<pattern>" <dir> --no-heading => 0 matches` `` plus the export line (e.g. `src/public/map.ts:12:export function filter(...`)
- `Location` column: `file:line` for the export/file (`src/public/map.ts:12`) or `package: <name>` for package-level drift
- `Suggested fix` column: `Remove <export> or add importer; re-run rg to confirm 0`
- `Normative ref` column: `AGENTS.md:79-113 §3` or `AGENTS.md:138-152` or `AGENTS.md:104-113`

## Exclusions

- Do not flag `src/<name>.ts` entry that re-exports whole `src/public/` (it will have many importers via `@rimbu/<pkg>`)
- Do not flag `src/internal/` files that are imported via `src/<name>.ts` barrel or via `test/` (test imports count as importer)
- Do not flag `advanced` re-exports that are type-only (`export type`) if target is still private type

## References

- `AGENTS.md:79-113` §3 anatomy, `AGENTS.md:104-113` tier table, `AGENTS.md:138-152` import rule, `AGENTS.md:238-284` §5 `tsconfig` paths
- `spec.md:2.7` Q12 `warn` until confirmed, `maintain-skills` caretaker
