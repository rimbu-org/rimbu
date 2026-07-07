# @rimbu/deep — Agent Guide

Tools for working with plain JS objects immutably: match, patch, select, path navigation, and deep-readonly protection.

---

## Package layout

```
src/
  deep.ts          # main entry (.): protect, getAt, getAtWith; re-exports Protected
  match.ts         # @rimbu/deep/match
  patch.ts         # @rimbu/deep/patch
  path.ts          # @rimbu/deep/path
  select.ts        # @rimbu/deep/select
  tuple.ts         # @rimbu/deep/tuple
  protected.ts     # @rimbu/deep/protected
  internal/
    match-internal.ts   # MatchInternal namespace — all Match type machinery
    path-internal.ts    # PathInternal / PathResultInternal — path string types
    string-split.ts     # stringSplit() runtime helper for path parsing
test/              # runtime tests (bun test)
test-d/            # type-level tests (expectTypeOf)
```

Internal imports use `#deep/*` (maps to `src/internal/*.ts`). The legacy alias `#private/*` also maps there (used in `patch.ts` for `string-split`).

---

## Module responsibilities

| Module | What it does |
|---|---|
| `match` | Structural pattern matching on plain objects, arrays, primitives |
| `patch` | Immutable deep update — returns a new value with changes applied |
| `path` | Typed string path type generation (`'a.b.c'`, `'arr[0].x'`) |
| `select` | Projection / extraction using paths, functions, arrays, or object shapes |
| `tuple` | Readonly fixed-length typed arrays with full index-level type preservation |
| `protected` | `Protected<T>` — deep-readonly mapped type; `protect()` is a zero-cost cast |
| `deep` (main) | `getAt` / `getAtWith` navigate a value using a typed path string |

---

## Match

### Public API

```ts
match<T>(source: T, matcher: Match<T>): boolean
matchVerbose<T>(source: T, matcher: Match<T>): { result: boolean; failureLog: string[] }
matchAt<T, P>(source: T, path: P, matcher: Match<Path.Result<T,P>>): boolean
matchWith<T>(matcher: Match<T>): (source: T) => boolean
matchAtWith<T, P>(path: P, matcher: Match<...>): (source: T) => boolean
```

### Match type

`Match<T>` resolves to `MatchInternal.Entry<T, Partial<T>, T, T>`. The `C` parameter (defaults to `Partial<T>`) threads the user's chosen partial shape through recursive calls, keeping key narrowing accurate.

### Matcher forms by source type

| Source type | Allowed matchers |
|---|---|
| Function | Same function reference only |
| Plain object | `Partial<T>` props object, `[Compound]` tuple, or function returning either |
| Array / Tuple | Same-length array, `Compound`, `TraverseCompound`, sparse index object `{ 0: ..., 2: ... }`, or function returning those |
| Primitive | Same value, `Compound`, or function returning either |

A **function matcher** `(current, parent, root) => boolean | S` receives `Protected<T>` arguments and can return either a boolean decision or a new matcher `S` to recurse with.

### Compound (`every` / `some` / `none` / `single` / `customMatch`)

Tests multiple matchers against the **same** source value. Wrapped in `[...]` when used on objects:

```ts
match(obj, [{ every: [{ a: 1 }, { b: (v) => v > 0 }] }])
match(num, { some: [1, 2, (v) => v > 10] })
match(obj, [{ customMatch: { matchers: [...], getResult: (pass, fail) => pass > fail } }])
```

`ExactlyOne<T>` enforces exactly one key — the others must be absent (leverages `exactOptionalPropertyTypes: true`).

### TraverseCompound (`everyItem` / `someItem` / `noneItem` / `singleItem` / `customMatchItem`)

Tests a **single matcher** against every element of an array:

```ts
match(arr, { someItem: { x: 1 } })
match(arr, { everyItem: (v) => v > 0 })
match(arr, { customMatchItem: { matcher: (v) => v > 0, getResult: (p, f) => p > f } })
```

### Internal dispatch (`matchEntry`)

Resolution order:
1. `Object.is(source, matcher)` → `true`
2. `matcher === null | undefined` → `false`
3. `typeof source === 'function'` → `false` (reference already failed)
4. `typeof matcher === 'function'` → call it; if boolean use directly, else recurse on returned value
5. `isPlainObj(source)` → `matchPlainObj`
6. `Array.isArray(source)` → `matchArr`
7. `isCompound(matcher)` → `matchCompound` (handles primitives with compound logic)
8. → `false`

### Type machinery (`match-internal.ts`)

| Type | Role |
|---|---|
| `Entry<T,C,P,R>` | Central dispatch — nested ternary on `IsAnyFunc`, `IsPlainObj`, `IsArray` |
| `Obj<T,C,P,R>` | `ObjProps \| [Compound]` — mirrors `Array.isArray` check at runtime |
| `ObjProps<T,C,R>` | `[K in keyof C]?: K extends keyof T ? Entry<...> : never` — maps invalid keys to `never`, rejecting extra keys under `exactOptionalPropertyTypes` |
| `Arr<T,C,P,R>` | Union: `C \| Compound \| TraverseCompound<element,...> \| TupIndices` |
| `WithResult<T,P,R,S>` | `S \| Func<T,P,R,S>` |
| `Func<T,P,R,S>` | `(current: Protected<T>, parent: Protected<P>, root: Protected<R>) => boolean \| S` |
| `Compound<T,C,P,R>` | `ExactlyOne<{ every/some/none/single: Entry[]; customMatch: {...} }>` |
| `TraverseCompound<T,C,P,R>` | `ExactlyOne<{ everyItem/someItem/noneItem/singleItem: Entry; customMatchItem: {...} }>` |
| `ExactlyOne<T>` | Canonical "exactly one key" pattern via `{ [P in Exclude<keyof T, K>]?: never }` |
| `TupIndices<T,C,R>` | `{ [K in Tuple.KeysOf<C>]?: Entry<...> } & NotIterable` — sparse numeric index match |
| `CompoundType` | `'every' \| 'some' \| 'none' \| 'single'` |
| `ArrayTraversalType` | `` `${CompoundType}Item` `` — derives traversal keys mechanically |

`TraversalForArr` was a dead predecessor type and has been deleted. `TraverseCompound` is used directly in `Arr`.

---

## `Protected<T>`

Deep-readonly mapped type. Handles arrays, `Map`, `Set`, `Promise`, plain objects, and passes everything else through unchanged. `protect(x)` is a zero-cost cast — no runtime effect.

`NotIterable = { [Symbol.iterator]?: never }` is imported from `@rimbu/base/plain-object` in both `match-internal.ts` and `patch.ts` (do not re-define locally).

---

## Key invariants

- **Plain object detection**: `isPlainObj` (from `@rimbu/base/plain-object`) requires: object, non-null, constructor is `Object` or not a function (class instances fail), not iterable, not async-iterable. Class instances are matched by reference only.
- **Function sources**: matched by reference (`Object.is`) only — no structural matching possible.
- **`Object.is` semantics**: `NaN === NaN` is `true`; `+0 === -0` is `false`.
- **Empty compounds**: `{ every: [] }` → `true` (vacuously); `{ some: [] }` → `false`; `{ none: [] }` → `true`; `{ single: [] }` → `false`.
- **Sparse array index matching**: uses `index in source` — out-of-bounds indices are always `false`.
- **`C` parameter**: never collapse to `Partial<T>` inline — it tracks the user's specific partial shape through the recursive call tree.

---

## Known pre-existing issue

`test-d/patch.test-d.ts:199` has an unused `@ts-expect-error` directive that predates this work. Do not attempt to remove it without understanding the intended test.

---

## Testing

```sh
bun run build         # compile to dist/ — always run this first
bun run test          # runtime tests (test/*.test.ts)
bun run typecheck     # type-level tests + src (test-d/*.test-d.ts)
bun run biome:check   # lint + format
```

**Always run `bun run build` before `bun run test`, `bun run typecheck`, or any other verification step.** The build catches emit-specific diagnostics that `--noEmit` suppresses (notably TS2731: implicit symbol-to-string coercion in template literals, introduced in TS 5.5), and it ensures the `dist/` output is consistent with the current source before any downstream check runs against it.

Type tests use `expectTypeOf` from `bun:test`. Error cases use `// @ts-expect-error` on the preceding line.
