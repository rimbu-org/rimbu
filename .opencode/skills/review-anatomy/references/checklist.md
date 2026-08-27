# Review-Anatomy Checklist

Source: `AGENTS.md:76-284` §3/§4/§5, `biome.json:27-35`, `spec.md:2.11`, ticket `03`. `AGENTS.md` wins > ADR > checklist (Q5).

## Package.json — `AGENTS.md:155-235` §4

| Rule | Severity | Check | Evidence | Fix |
|---|---|---|---|---|
| `exports-root` | error | `exports["."]` exists with `{"types":"./dist/<name>.d.ts","default":"./dist/<name>.js"}` | `package.json:exports["."]` JSON | Add per canonical shape |
| `exports-public` | error | If `src/public/` exists, `exports["./*"]` → `{"types":"./dist/public/*.d.ts","default":"./dist/public/*.js"}` | `package.json:exports["./*"]` | Add |
| `exports-advanced` | error | If `src/advanced/` exists, `exports["./advanced/*"]` → `{"types":"./dist/advanced/*.d.ts","default":"./dist/advanced/*.js"}` | `package.json:exports["./advanced/*"]` | Add |
| `no-internal-export` | error | `exports` never contains `#` or `internal` (tier `internal` is `#<pkg>/*` alias only, never exported) | `package.json:exports` keys | Remove |
| `imports-alias` | error | If `src/internal/` exists, `imports["#<name>/*"]` → `{"types":"./dist/internal/*.d.ts","default":"./dist/internal/*.js"}` | `package.json:imports` | Add per §4 |
| `imports-no-relative` | error | No relative paths in `imports` | `package.json:imports` values | Use `dist/` |
| `files` | error | `files: ["dist","src"]` exactly | `package.json:files` | Set to `["dist","src"]` |
| `sideEffects` | error | `sideEffects: false` | `package.json:sideEffects` | Set `false` |
| `type-module` | error | `type: "module"` | `package.json:type` | Set `module` |
| `workspace-deps` | warn | All `@rimbu/*` deps use `workspace:*` | `package.json:dependencies` | `workspace:*` |
| `publishConfig` | warn | `publishConfig: {access:"public", provenance:true}` | `package.json:publishConfig` | Add per §4 |
| `scripts-biome` | warn | `scripts` has `biome:check: "biome check src"` and `biome:fix: "biome check src --write"` | `package.json:scripts` | Add |
| `scripts-build` | error | `build: "bun clean:build && bunx tsc --p tsconfig.esm.json"` | `package.json:scripts.build` | Fix |
| `scripts-typecheck` | error | `typecheck: "tsc -p tsconfig.json --noEmit"` | `package.json:scripts.typecheck` | Fix |
| `scripts-test` | warn | `test: "bun test test/* --tsconfig-override tsconfig.common.json"` (or package-specific) | `package.json:scripts.test` | Add |

## Tsconfig — `AGENTS.md:238-284` §5

| Rule | Severity | Check | Evidence |
|---|---|---|---|
| `tsconfig-common-paths` | error | `tsconfig.common.json` has `compilerOptions.paths` for `@rimbu/<name>` and `#<name>/*` (and any extra `#<group>/*` if needed) | `tsconfig.common.json:paths` |
| `tsconfig-json-extends` | error | `tsconfig.json` extends `["../../config/tsconfig.base.json","./tsconfig.common.json"]`, `include: ["src","test","test-d"]` (plus `test-random` if exists), `compilerOptions.rootDir: "."` | `tsconfig.json` |
| `tsconfig-esm-extends` | error | `tsconfig.esm.json` extends `["../../config/tsconfig.esm.base.json","./tsconfig.common.json"]`, `include: ["src"]`, `compilerOptions.rootDir: "./src"`, `outDir: "./dist"`, `noEmit: false` | `tsconfig.esm.json` |

## Layout — `AGENTS.md:79-113` §3

| Rule | Severity | Check | Evidence |
|---|---|---|---|
| `layout-entry` | error | `src/<name>.ts` exists and re-exports public surface (`exports["."]`) | `src/<name>.ts` |
| `layout-public` | error | If `exports["./*"]` declared, `src/public/` exists and contains public sub-paths | `src/public/` |
| `layout-advanced` | warn | If `exports["./advanced/*"]` declared, `src/advanced/` exists; if `src/advanced/` exists but no export, warn | `src/advanced/` |
| `layout-internal-not-exported` | error | `src/internal/` exists but never listed in `exports` (tier `internal` is `#<pkg>/*` only) | `src/internal/` vs `exports` |
| `layout-test` | warn | `test/` exists with `bun test` files | `test/` |
| `layout-test-d` | warn | `test-d/` exists if package has type tests | `test-d/` |

## Import Rule — `AGENTS.md:138-152` + `biome.json:27-35`

| Rule | Severity | Check | Evidence |
|---|---|---|---|
| `no-relative-imports` | error | No `from "./` or `from "../` in `src/**/*.ts` (including `src/<name>.ts`, `public/`, `advanced/`, `internal/`) | `rg -n "from\s+['\"]\./|from\s+['\"]\.\./" src --no-heading` |
| `no-internal-via-exports` | error | `internal` not imported via `@rimbu/<pkg>/internal` (must be `#<pkg>/*`) | `rg -n "from\s+['\"]@rimbu/.*/internal"` |

All findings cite `AGENTS.md` § or `biome.json:27-35`. Run with `--with-tools` to also cite `biome:check`/`typecheck` verbatim output as evidence per Q10.
