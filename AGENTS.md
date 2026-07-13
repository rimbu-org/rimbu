# Rimbu — Agent & Contributor Guide

This document is the primary reference for LLMs and developers contributing to the Rimbu monorepo. Read it fully before making changes.

---

## 1. What is Rimbu?

Rimbu is a TypeScript library of **immutable persistent data structures** and **composable async utilities**. Its key properties:

- All collections are fully immutable — mutations return new instances
- Non-empty collection variants are tracked at the type level (`Collection.NonEmpty<T>`)
- Cross-runtime: Node ≥ 18, Deno, Bun, browser (ESM)
- Runtime: **Bun only** — do not use npm, yarn, or pnpm

### 1.1 API Design Goals

A primary goal of Rimbu is to provide an API that is **simple, intuitive, easy to use, and predictable**. This shapes every design decision:

- **Consistent naming across packages** — the same concept always uses the same name. For example, `filter`, `map`, `flatMap`, `take`, `drop` mean the same thing everywhere. Never use synonyms for the same operation in different packages.
- **Mathematical index handling** — indices follow mathematical convention throughout:
  - Non-negative indices count from the start (0-based).
  - Negative indices count from the end, mirroring JavaScript's `Array.prototype.at()`: `-1` is the last element, `-2` is second-to-last, etc.
  - This applies to `List`, `Stream`, `fromArray`, `fromString`, `IndexRange`, and any other API that accepts positional indices.
- **Predictable option objects** — optional behaviour (negation, custom equality, fallback values) is always expressed as a trailing `options` object, never as positional booleans. Property names are consistent: `eq`, `negate`, `otherwise`, `amount`, `reversed`.
- **OptLazy for fallbacks** — any method that may return `undefined` when the collection is empty provides an `OptLazy<O>` overload so callers can supply an eager or lazy fallback value without a separate null-check.
- **NonEmpty at the type level** — methods that provably return a non-empty result (e.g. `prepend`, `append`, `concat` on a non-empty source) encode that fact in the return type. Users should never need to cast or guard against emptiness after such operations.

When adding new methods or packages, always ask: *"Is this name what a new user would expect?"* and *"Does this behave the same way the equivalent method does in every other package?"*

---

## 2. Monorepo Structure

```
rimbu/
├── .changeset/           # Changeset config for versioning (lockstep — all packages share one version)
├── .github/workflows/    # CI (build-packages.yaml) and release (publish-release.yaml)
├── config/               # Shared TypeScript and TypeDoc config
│   ├── tsconfig.base.json       # Base for typecheck tsconfigs (noEmit, bun-types)
│   ├── tsconfig.common.json     # Strict TS settings (ES2023, bundler resolution)
│   └── tsconfig.esm.base.json   # Base for build tsconfigs (declaration: true)
├── packages/             # 23 published npm packages
│   ├── actor/            # Experimental: state management
│   ├── base/             # Foundation: array primitives, RimbuError, Token
│   ├── bimap/            # BiMap: 1-to-1 bidirectional map
│   ├── bimultimap/       # BiMultiMap: many-to-many bidirectional map
│   ├── channel/          # Go-style typed channels, mutex, semaphore
│   ├── collection-types/ # Shared abstract base types (RMapBase, RSetBase, HKT machinery)
│   ├── common/           # Shared utilities: Eq, Comp, OptLazy, Range, Reducer types
│   ├── core/             # Umbrella re-export of all stable collections
│   ├── deep/             # Deep patch/match/path/select for plain objects
│   ├── graph/            # Directed and undirected graphs (valued and non-valued)
│   ├── hashed/           # HashMap, HashSet
│   ├── list/             # Immutable random-access list (block-tree)
│   ├── multimap/         # MultiMap: 1-to-many map
│   ├── multiset/         # MultiSet: counted set (bag)
│   ├── ordered/          # OrderedMap, OrderedSet
│   ├── proximity/        # ProximityMap: nearest-key lookups
│   ├── reactor/          # Experimental: React bindings for actor
│   ├── sorted/           # SortedMap, SortedSet
│   ├── spy/              # Dev: test spy/stub/mock utilities
│   ├── stream/           # Lazy Stream, AsyncStream, Reducer, Transformer
│   ├── table/            # 2D Table (row × column → value)
│   ├── task/             # Cancellable composable tasks
│   └── typical/          # Experimental: type-level numeric/string operations
├── support/
│   └── typedoc-rimbu-plugin/   # Custom TypeDoc plugin
├── biome.json            # Formatter + linter config (root, applies to all packages)
├── bunfig.toml           # Bun workspace config
└── package.json          # Root workspace scripts and devDependencies
```

---

## 3. Per-Package Anatomy

Every package follows this exact layout:

```
packages/<name>/
├── src/
│   ├── <name>.ts          # Main entry: maps to exports["."] and defines the public API
│   ├── <sub>.ts           # Named sub-path entries: maps to exports["./<sub>"]
│   │                      # (only if the package has multiple public sub-paths)
│   └── internal/          # Implementation details — NOT accessible from outside the package
│       ├── *.ts           # Flat or nested implementation files
│       └── <group>/       # Grouped internals (e.g., internal/map/, internal/set/)
├── test/                  # Runtime tests (bun test)
├── test-d/                # Type-level tests (expectTypeOf)
├── test-random/           # Property-based / randomized tests (optional)
├── dist/                  # Built output (gitignored, generated by `bun run build`)
├── package.json           # Package manifest — see canonical shape below
├── tsconfig.json          # Typecheck config (includes src + test + test-d)
├── tsconfig.esm.json      # Build config (emits to dist/)
└── tsconfig.common.json   # Path aliases for this package's own exports and imports
```

### Key rule: imports within a package

All imports inside `src/` must use **package paths**, never relative paths (`./`, `../`):

```ts
// CORRECT — uses package imports field
import { something } from '#mypackage/internal-file';

// CORRECT — uses package exports
import type { MyType } from '@rimbu/mypackage';

// WRONG — relative imports are banned by Biome
import { something } from '../internal/something';
```

---

## 4. Canonical package.json Shape

Every package's `package.json` must follow this shape exactly:

```jsonc
{
  "name": "@rimbu/<name>",
  "version": "<shared version>",          // All packages share one lockstep version
  "description": "...",
  "keywords": ["rimbu", "typescript", ...],
  "homepage": "https://rimbu.org",
  "author": {
    "name": "Arvid Nicolaas",
    "email": "arvid@rimbu.org",
    "url": "https://github.com/vitoke"
  },
  "license": "MIT",
  "funding": [{ "type": "individual", "url": "https://github.com/sponsors/vitoke" }],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/rimbu-org/rimbu.git",
    "directory": "packages/<name>"
  },
  "type": "module",
  "sideEffects": false,

  // exports: one entry per public sub-path, mapped to dist/
  "exports": {
    ".": {
      "types": "./dist/<name>.d.ts",
      "default": "./dist/<name>.js"
    }
    // Additional named sub-paths if the package has them:
    // "./async": { "types": "./dist/async-stream.d.ts", "default": "./dist/async-stream.js" }
  },

  // imports: internal paths used within src/ via #<name>/* pattern
  // Only include if the package has an internal/ directory
  "imports": {
    "#<name>/*": {
      "types": "./dist/internal/*.d.ts",
      "default": "./dist/internal/*.js"
    }
    // Additional internal groups if needed:
    // "#map/*": { "types": "./dist/internal/map/*.d.ts", "default": "./dist/internal/map/*.js" }
  },

  "files": ["dist", "src"],

  "scripts": {
    "biome:check": "biome check src",
    "biome:fix": "biome check src --write",
    "build": "bun clean:build && bunx tsc --p tsconfig.esm.json",
    "clean": "rimraf dist node_modules",
    "clean:build": "rimraf dist",
    "format:check": "biome format src",
    "lint:check": "biome lint src",
    "test": "bun test test/* --tsconfig-override tsconfig.common.json",
    "typecheck": "tsc -p tsconfig.json --noEmit"
    // Optional: "test:random": "bun test test-random"
  },

  "dependencies": {
    "@rimbu/dep": "workspace:*"   // Use workspace:* for all internal deps
  },

  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

---

## 5. Canonical tsconfig Shape

### `tsconfig.common.json` — path aliases for this package

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@rimbu/<name>": ["./<name>.ts"],
      // Named sub-paths (if applicable):
      // "@rimbu/<name>/<sub>": ["./<sub>.ts"],
      // "@rimbu/<name>/*": ["./*.ts"],
      // Internal paths:
      "#<name>/*": ["./internal/*.ts"]
      // Additional internal groups:
      // "#<group>/*": ["./internal/<group>/*.ts"]
    }
  }
}
```

### `tsconfig.json` — for typecheck (`bun run typecheck`)

```jsonc
{
  "extends": ["../../config/tsconfig.base.json", "./tsconfig.common.json"],
  "include": ["src", "test", "test-d"],   // add "test-random" if needed
  "compilerOptions": {
    "rootDir": ".",
  }
}
```

### `tsconfig.esm.json` — for build (`bun run build`)

```jsonc
{
  "extends": ["../../config/tsconfig.esm.base.json", "./tsconfig.common.json"],
  "include": ["src"],
  "compilerOptions": {
    "rootDir": "./src",
    "noEmit": false,
    "outDir": "./dist"
  }
}
```

---

## 6. Core Code Patterns

### 6.1 Interface + Companion Namespace

The fundamental pattern in Rimbu. Every public type is defined as an interface with a companion namespace:

```ts
// The interface defines the instance API
export interface HashMap<K, V> extends FastIterable<readonly [K, V]> {
  readonly isEmpty: boolean;
  readonly size: number;
  nonEmpty(): this is HashMap.NonEmpty<K, V>;
  assumeNonEmpty(): HashMap.NonEmpty<K, V>;
  get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
  get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
  set(key: K, value: V): HashMap.NonEmpty<K, V>;
  // ...
}

// The namespace holds nested types and is also the factory object
export namespace HashMap {
  // NonEmpty variant: refines return types
  export interface NonEmpty<K, V> extends HashMap<K, V>, Streamable.NonEmpty<readonly [K, V]> {
    readonly isEmpty: false;
    nonEmpty(): this is HashMap.NonEmpty<K, V>;
    assumeNonEmpty(): this;
    asNormal(): HashMap<K, V>;
    // Methods that always return NonEmpty here override the base
    set(key: K, value: V): HashMap.NonEmpty<K, V>;
  }

  // Context: the factory that creates instances
  export interface Context<UK, UV> extends HashMapFactory<UK, UV> {
    readonly typeTag: 'HashMap';
  }

  // Builder: mutable accumulator
  export interface Builder<K, V> { ... }

  // Types: HKT slot (see section 6.3)
  export interface Types extends KeyValue { ... }
}

// The value export — HashMap is BOTH the type (via interface) AND the factory object
export const HashMap: HashMapCreators = createHashMapContextModule().build();
```

### 6.2 NonEmpty Refinements

Every collection has a `.NonEmpty` variant that is tracked at the type level:

```ts
const m: HashMap<number, string> = HashMap.of([1, 'a']);
m.first()           // returns [number, string] | undefined — might be empty
m.stream().first()  // needs a fallback

if (m.nonEmpty()) {
  // m is now HashMap.NonEmpty<number, string>
  m.first()           // returns [number, string] — compiler knows it's non-empty
  m.stream().first()  // no fallback needed
}

// Methods that add entries always return NonEmpty:
const ne: HashMap.NonEmpty<number, string> = HashMap.empty<number, string>().set(1, 'a');
```

### 6.3 OptLazy — Fallback Values

Methods that may return `undefined` are overloaded with an `OptLazy<O>` fallback parameter:

```ts
// Without fallback — may return undefined
m.get(key): V | undefined

// With fallback — always returns V or O
m.get(key, 'default'): V | string
m.get(key, () => computeDefault()): V | string  // OptLazy: value or function

// Type: OptLazy<T> = T | (() => T)
```

Always provide both overloads:
```ts
get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
```

### 6.4 Higher-Kinded Types (HKT) via Types interface

Abstract base classes use a `Types` interface to preserve concrete return types:

```ts
// In collection-types, the abstract base:
export interface RMapBase<K, V, Tp extends RMapBase.Types> {
  filter(...): (Tp & { _K: K; _V: V })['normal'];
  // The return type uses the Types slot to get the correct concrete type
}

// In hashed, the concrete binding:
export interface HashMap<K, V> extends RMapBase<K, V, HashMap.Types> {}
export namespace HashMap {
  export interface Types extends RMapBase.Types {
    readonly normal: HashMap<this['_K'], this['_V']>;
    readonly nonEmpty: HashMap.NonEmpty<this['_K'], this['_V']>;
  }
}
// Now HashMap.filter() returns HashMap<K,V>, not RMapBase<K,V>
```

When modifying abstract base methods in `collection-types`, check all concrete implementations (hashed, sorted, ordered, etc.) still satisfy the type constraints.

### 6.5 Reducers

`Reducer<I, O>` is a composable, stateful fold operation. Think of it as a typesafe description of a fold that can be combined with other Reducers:

```ts
// Simple usage
const sum = Stream.of(1, 2, 3).reduce(Reducer.sum);  // => 6

// Parallel combination into a shape
const [count, total] = Stream.of(1, 2, 3).reduce([Reducer.count, Reducer.sum]);

// Object shape
const stats = Stream.of(1, 2, 3).reduce({
  count: Reducer.count,
  sum: Reducer.sum,
  avg: Reducer.average,
});
// => { count: 3, sum: 6, avg: 2 }

// Reducer is composable:
const doubled = Reducer.sum.mapInput((x: number) => x * 2);
```

### 6.6 Advanced Inference Helpers

Two TypeScript 5.x features that are easy to forget but frequently useful in a library with deeply generic APIs.

#### `const` type parameters (TS 5.0+)

Adding `const` to a type parameter causes TypeScript to infer literal/tuple/object types from inline arguments **without requiring the caller to write `as const`**. This is the right default for any function that accepts a selector, descriptor, path, or shape that the return type depends on.

```ts
// Without const: caller must write 'as const' to get precise types
function selectPlain<T, SL extends Select<T>>(source: T, selector: SL): Select.Result<T, SL>
select(m, ['a', 'b.c'])         // SL inferred as string[] → result is useless

// With const: inference is precise automatically
function select<T, const SL extends Select<T>>(source: T, selector: SL): Select.Result<T, SL>
select(m, ['a', 'b.c'])         // SL inferred as readonly ['a', 'b.c'] → result is readonly [number, boolean]
```

Rules:
- Use `const SL` whenever the return type is computed from `SL` and callers pass inline literals, arrays, or objects.
- The constraint must use `readonly` arrays (e.g. `extends readonly unknown[]`, not `extends unknown[]`); otherwise TypeScript cannot assign the inferred readonly tuple to the mutable constraint and falls back to widening.
- `const` only affects **inline expressions at the call site** — a variable passed as an argument is already typed and is not affected.

#### `NoInfer<T>` (TS 5.4+)

`NoInfer<T>` prevents a type parameter position from participating in inference. Use it when one argument should **constrain** the type and a second argument should only be **checked** against the already-inferred type, not allowed to influence it.

```ts
// Problem: both `fallback` and the collection element type influence T,
// so passing a wider fallback silently widens T
declare function first<T>(list: List<T>, fallback: T): T;
first(List.of(1, 2, 3), 'oops') // T inferred as number | string — no error

// Fix: only the list drives T; fallback is checked against the settled type
declare function first<T>(list: List<T>, fallback: NoInfer<T>): T;
first(List.of(1, 2, 3), 'oops') // error: string not assignable to number ✓
```

Rules:
- Wrap **fallback / default / otherwise** parameters in `NoInfer<T>` when the primary source of truth for `T` is another parameter (typically the collection itself).
- The `OptLazy<O>` overload pattern (section 6.3) already separates concerns via a second type parameter `O`, so `NoInfer` is most useful on single-type-parameter helpers or internal utilities.
- Do not use `NoInfer` on the parameter that *should* drive inference — only on the ones that should be checked against it.

---

### 6.7 Module Pattern

Some types use the `Module` helper from `@rimbu/common` to create namespace-style factory objects:

```ts
// Module creates a sealed object with factory methods
export const HashMap: HashMapCreators = createHashMapContextModule().build();
```

`createHashMapContextModule()` returns a `Module.Definition` that `build()` converts to the final factory object. This is the implementation detail behind the `HashMap.of(...)`, `HashMap.empty()` pattern.

---

## 7. How to Add a New Collection Method

Example: adding `mapValues<W>(f: (v: V) => W): HashMap<K, W>` to HashMap.

1. **Add to the interface** in `packages/hashed/src/hashed.ts` (or `packages/hashed/src/map.ts`):
   ```ts
   mapValues<W>(f: (v: V, key: K) => W): HashMap<K, W>;
   ```

2. **Add to NonEmpty** in the same file:
   ```ts
   // In HashMap.NonEmpty:
   mapValues<W>(f: (v: V, key: K) => W): HashMap.NonEmpty<K, W>;
   ```

3. **Add to the abstract base** in `packages/collection-types/src/map/base.ts` (if it belongs there):
   ```ts
   mapValues<W>(f: (v: V, key: K) => W): (Tp & { _K: K; _V: W })['normal'];
   ```

4. **Implement in the internal class** at `packages/hashed/src/internal/map/immutable.ts`:
   ```ts
   mapValues<W>(f: (v: V, key: K) => W): HashMap<K, W> {
     return this.context.from(
       this.stream().map(([k, v]) => [k, f(v, k)] as [K, W])
     );
   }
   ```

5. **Add to Builder** if it makes sense for the mutable builder.

6. **Write tests** in `packages/hashed/test/hashmap.test.ts`.

7. **Write type tests** in `packages/hashed/test-d/` if the types are non-trivial.

8. **Propagate to SortedMap, OrderedMap, etc.** if the method belongs to the `RMapBase` interface.

9. **Export from `@rimbu/core`** if the method is on the public API surface (`packages/core/src/hashed.ts` re-exports everything from `@rimbu/hashed`).

---

## 8. How to Add a New Package

1. **Create the directory**: `packages/<name>/`

2. **Create `package.json`** using the canonical shape from Section 4.

3. **Create `tsconfig.common.json`** using the shape from Section 5.

4. **Create `tsconfig.json`** and **`tsconfig.esm.json`** using the shapes from Section 5.

5. **Create `src/<name>.ts`** — the main entry point. Follow the Interface + Namespace pattern.

6. **Create `src/internal/`** for implementation files.

7. **Add to root `package.json` workspaces** (already covered by `packages/*` glob).

8. **Add to `.changeset/config.json`** `fixed` array so it participates in lockstep versioning.

9. **Add as a dependency to `@rimbu/core`** (`packages/core/package.json` and `packages/core/src/<name>.ts`) if it's a stable collection.

10. **Run `bun install`** from the repo root to wire up the workspace.

11. **Verify**: `bun run typecheck && bun run build:seq && bun run test`

---

## 9. Tooling Reference

| Tool | Command | Purpose |
|---|---|---|
| Bun | `bun install` | Install dependencies |
| TypeScript | `bun run build:seq` | Compile all packages to `dist/` — **run this first** |
| TypeScript | `bun run typecheck` | Type-check (no emit) — run after build |
| Biome | `bun run biome:check` | Lint + format check |
| Biome | `bun run biome:fix` | Auto-fix lint + format |
| Bun test | `bun run test` | Run tests — run after build |
| Changesets | `bunx changeset` | Create a changeset for a release |
| Changesets | `bun run version` | Apply changeset version bumps |
| Changesets | `bun run release` | Full release: prerelease checks + publish |

**Always run `bun run build:seq` before `bun run typecheck` or `bun run test`.** The build catches emit-specific diagnostics that `--noEmit` suppresses (notably TS2731: implicit symbol-to-string coercion in template literals, introduced in TS 5.5). Running typecheck or tests against a stale `dist/` can produce misleading errors.

**Use `build:seq`, never the per-package `build`.** Running `bun run build` (which build every workspace package in parallel) exhausts the container's CPU/memory limits and can hang or be killed. `build:seq` builds all packages sequentially with the same end result and stays within the container's resource constraints.

### Lint rules enforced by Biome

- **No relative imports** — `./` and `../` are banned; use package paths or `#` imports
- **No unused imports** — error with auto-fix
- **No `any`** — warning
- **No non-null assertion** (`!`) — warning
- **No `console`** — error in src, allowed in tests
- **Import order**: Bun imports → blank line → external types → blank line → local types → blank line → external values → blank line → local values

---

## 10. Release Process

All packages share a single version (lockstep). Releasing:

1. **Make changes** — commit with conventional commit messages (`feat:`, `fix:`, `chore:`, `BREAKING CHANGE:`)

2. **Create a changeset**: `bunx changeset` — describe the change and select the bump type (patch/minor/major). Since all packages are `fixed`, one changeset bumps all.

3. **Merge to main** — CI runs build, lint, and tests.

4. **Release**: Trigger the `Publish release to NPM` GitHub Actions workflow (manual dispatch). It will:
   - Run `bun prerelease` (typecheck + type tests + tests)
    - Run `bun build:seq`
   - Apply version bumps via `bunx changeset version`
   - Commit version bumps
   - Publish all packages via `bunx changeset publish` with OIDC provenance

---

## 11. Pre-existing Known Issues

All packages currently typecheck cleanly. There are no known pre-existing typecheck errors.

---

## 12. Shell and Sandbox Restrictions

When running shell commands (via Bash or the build/test tooling), observe these sandbox rules:

- **Never ask for permission** to run a shell command. Execute the needed command directly; do not prompt the user or wait for approval.
- **Restrict file access to the repository and `/tmp`**. Never attempt to read, write, or traverse directories outside the repository root (`/workspace/rimbu-worktree`) and the `/tmp` scratch directory.
  - Use the repository root for all project work.
  - Use `/tmp/opencode` for any temporary files or external work that must live outside the repository.
- Do not access home directories, system folders (`/etc`, `/usr`, etc.), or other users' data.
