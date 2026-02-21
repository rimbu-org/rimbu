# Rimbu – Copilot Instructions

## Project Overview

Rimbu is a TypeScript library of immutable, persistent data structures (lists, maps, sets, graphs, etc.) and composable async utilities (streams, channels, tasks). It targets Node, Deno, Bun, and browsers using ESM-only packages.

## Commands

All commands are run from the repo root with `bun run`.

| Task | Command |
|---|---|
| Build all packages | `bun run build` |
| Test all packages | `bun run test` |
| Type-check all | `bun run typecheck` |
| Lint/format check | `bun run biome:check` |
| Auto-fix lint | `bun run biome:fix` |
| Type-level tests | `bun run test:types` |

**Run a single test file:**
```bash
bun test packages/<pkg>/test/<file>.test.ts --tsconfig-override packages/<pkg>/tsconfig.common.json
# e.g.
bun test packages/common/test/eq.test.ts --tsconfig-override packages/common/tsconfig.common.json
```

**Build/test a single package:**
```bash
cd packages/<pkg> && bun run build
cd packages/<pkg> && bun run test
```

## Monorepo Structure

Bun workspaces (`package.json` → `workspaces.packages`). Each package lives under `packages/<name>/` and is published as `@rimbu/<name>`.

**Dependency tiers** (lower tiers don't depend on higher):
1. **Primitives**: `base`, `common` – utilities, types, equality, comparison
2. **Interfaces**: `collection-types` – shared abstract collection interfaces
3. **Collections**: `hashed`, `sorted`, `ordered`, `list`, `bimap`, `bimultimap`, `multimap`, `multiset`, `table`, `graph`, `proximity`
4. **Async**: `stream`, `channel`, `task`
5. **Meta**: `core` – re-exports all stable packages
6. **Experimental**: `actor`, `reactor`, `spy`, `typical` – not included in `core`

Each package has a wildcard export map (`"exports": { "./*": { "types": "./dist/*.d.ts", "default": "./dist/*.js" } }`), so imports look like `@rimbu/common/eq`, `@rimbu/common/module`, etc.

## TypeScript & Module System

- **ESM only** – `"type": "module"` in every package
- `"moduleResolution": "bundler"`, `"verbatimModuleSyntax": true`, target ES2023
- `"exactOptionalPropertyTypes": true`, strict mode
- Three tsconfigs per package: `tsconfig.json` (typecheck), `tsconfig.common.json` (tests), `tsconfig.esm.json` (build output to `dist/`)
- Path aliases: within a package, `@rimbu/<pkg>/*` resolves to `./src/*.ts`

## Key Conventions

### Module / Dependency Injection Pattern
All cross-cutting singletons (e.g. `Eq`, `Comp`, `Reducer`) use the `Module` DI pattern from `@rimbu/common/module`. Implementations are assembled via `Module.create<Interface>(m => ({ ... }))` and exposed through the namespace's `Factory` interface. Never create bare class instances for these – always go through the factory.

```ts
// The public interface uses namespace merging:
export type Eq<T> = (v1: T, v2: T) => boolean;
export namespace Eq {
  export interface Factory { objectIs: Eq<any>; /* ... */ }
}

// The concrete implementation builds the module:
const eqInstance = Module.create<Eq.Factory>(m => ({
  objectIs: Module.lazy(() => Object.is),
  ...
}));
export const Eq: Eq.Factory = eqInstance.build();
```

### Namespace Merging
Types and their factory/namespace are exported from the same name using TypeScript namespace merging. A type `Foo` and `namespace Foo` coexist in the same file; consumers use `Foo.bar()` for factory methods.

### No Relative Imports
Biome enforces no relative imports inside `src/`. Always use the package alias (`@rimbu/common/eq`) even within the same package. Cross-package imports must use the published package name.

### JSDoc on Everything Public
All exported types, functions, and namespace members must have TSDoc. Include `@typeparam`, `@returns`, and at least one `@example` block with a ` ```ts ` code fence.

### Test Style
Tests use `bun:test` (`describe`/`it`/`expect`). Type-level tests live in `test-d/` and use `@ts-expect-error` annotations. No test framework setup files – tests are self-contained.

### Biome Formatting
- Tabs for indentation
- Single quotes
- Trailing commas in multi-line structures
- Run `bun run biome:fix` to auto-fix before committing

### Commits
Conventional Commits format. Use `bun run commit` to get the interactive commitizen prompt.
