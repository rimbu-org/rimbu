# @rimbu/list2 — Package Agent Guide

This package is a **rewrite** of `@rimbu/list` — a faster, cleaner immutable
block-tree `List`. It shares the same public API contract (`@rimbu/list` types) but
has a redesigned internal architecture.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test,
> the Interface + Namespace pattern, HKT `Types` slots, NonEmpty tracking,
> `OptLazy`, and the changeset workflow) see the **root `AGENTS.md`**.
> This file only covers what is specific to `@rimbu/list2`.

## Source layout

```
src/
├── list.ts           # exports["."]   — List interface re-exports + OpWithResult types
├── public/           # exports["./*"] — public subpaths (dist/public/*)
│   └── bit.ts             # @rimbu/list2/bit → BitList (specialized BitArray backend)
└── advanced/         # exports["./advanced/*"] — extension / implementer API
│   ├── children-ops.ts    # ChildrenOps interface (pluggable leaf-storage backend)
│   └── immutable/
│       ├── empty-base.ts       # ListEmptyBase → implements List<T> for empty case
│       └── non-empty-base.ts   # ListNonEmptyBase → shared non-empty logic
└── internal/          # NEVER exported; "#list/*" alias only
    ├── children-ops/
    │   └── array.ts           # ArrayOuterChildrenOps — default array-backed backend
    ├── context.ts             # ListContext interface + createListContextModule
    ├── size-table.ts          # SizeTable — O(log n) child-to-index lookup for InnerBlock
    ├── immutable/
    │   ├── common.ts          # Node type hierarchy: ListNode, Block, Tree, Inner
    │   ├── tree.ts            # treeGet, treeStream, treeUpdate — delegate to left/middle/right
    │   ├── outer-block.ts     # OuterBlock — leaf block (children = elements)
    │   ├── outer-block-left-right.ts   # LeftRight concrete block (forward order)
    │   ├── outer-block-right-left.ts   # RightLeft concrete block (reversed order)
    │   ├── outer-tree.ts      # OuterTree — top-level 2-3 finger tree
    │   ├── inner-block.ts     # InnerBlock — block of blocks at level > 0
    │   └── inner-tree.ts      # InnerTree — inner finger tree at level > 0
    └── mutable/
        ├── common.ts          # BlockBuilder, InnerBuilder interfaces
        ├── builder.ts         # ListBuilder — public mutable builder
        ├── outer-block-builder.ts
        ├── outer-tree-builder.ts
        ├── inner-block-builder.ts
        └── inner-tree-builder.ts
```

## Key differences from `@rimbu/list`

| Aspect | `list` (old) | `list2` (new) |
|---|---|---|
| Size property | `length` | `size` |
| Block constructors | `this.context.outerBlockLeftRight(children)` | Same, but separate `LeftRight` / `RightLeft` classes |
| Normalization | `_normalize()` — recursive, handles 5+ structural cases | `#createNormalized()` — one-level pass; some cases deferred |
| Block children access | `this.left.children[0]` | `this.left.childAt(0)` — uses SizeTable |
| Child sizing | `children.reduce((s, c) => s + c.length, 0)` | `SizeTable` precomputed sums with O(log n) lookup |
| Random access in InnerBlock | Linear scan of children | `SizeTable.getCoordinates(index)` — binary search |
| Int checks | `amount <= 0`, `amount > 0` comparisons | `Int.isAtLeastOne(amount)`, `Int.isAtLeastZero(amount)` — narrows TS types |
| OpWithResult | Tuple: `[collection, hasResult, result, hasChanged]` | Object: `{ collection, hasResult, result, hasChanged }` |
| CacheMap | Yes — for recursive operations | No |
| Internal method prefix | No prefix convention | `_` prefix on structural internals (`_get`, `_update`, `_nrChildren`, `_canAddChild`, etc.) |
| Private members | No | JS private fields (`#createNormalized`, `#copyAsType`, `#ops`) |
| Reversed block | Single `ReversedOuterBlock` class | Separate `OuterBlockLeftRight` / `OuterBlockRightLeft` classes |
| Tree helpers | `tree-base.ts` with `treeForEach`, `treeToArray`, `treeToStreamRange` | `tree.ts` with `treeGet`, `treeStream`, `treeUpdate` only |
| Bit / typed-array backends | Yes | Only `BitList` so far (via `ArrayOuterChildrenOps`) |
| `blockSizeBits` | `int` (0, 1, 2, ...) | Only `[2, 3, 4, 5]` (block sizes 4, 8, 16, 32) |

## Architecture

### Node hierarchy (`common.ts`)

```
ListNode<T>           — shared read-only shape: size, get, update, filter, reversed
├── Block<T>          — leaf or inner block: nrChildren, canAddChild, map, toBuilder
│   └── OuterBlock    — leaf-level block (children = T[])
│   └── InnerBlock    — higher-level block (children = InnerBlock[] / OuterBlock[])
├── Tree<T, C>        — 2-3 finger tree node: left, right, middle
│   ├── OuterTree     — top-level tree (left/right = OuterBlock)
│   └── InnerTree     — inner tree (left/right = InnerBlock)
└── Inner<T, C>       — extends ListNode, adds child-level rebalancing ops
    └── InnerBlock / InnerTree — both implement Inner
```

### Self-type pattern

All node types carry a `_self` phantom type for `this`-returning signatures:

```ts
class OuterTree<T> { declare _self: OuterTree<T>; }
interface Block<T> { readonly _self: Block<T>; }
type Self<T, S extends T = T> = T & { _self: S };
```

### How random access works

1. **OuterTree._get(index)**: dispatches via `treeGet(this, index)` → left, middle, or right
2. **OuterBlock._get(index)**: children-ops array access — O(1) for arrays
3. **InnerBlock._get(index)**: uses `SizeTable.getCoordinates(index)` to binary-search which child holds the index, then recurses — O(log n)
4. **InnerTree._get(index)**: same pattern as OuterTree via `treeGet`

### SizeTable

An internal acceleration structure stored on `InnerBlock` that precomputes cumulative
child sizes for O(log n) index→child lookup:

```ts
class SizeTable {
    readonly cumulativeTable: number[];  // running totals
    readonly maxChildSize: number;       // 1 << (level * blockSizeBits)

    getCoordinates(index): [childIndex, indexInChild];  // for random access
    getCoordinatesForTake(index): [childIndex, indexInChild];  // for takeInternal (different boundary)
    totalSize: number;
}
```

`getCoordinates` uses the block structure via `cumulativeTable`, while
`getCoordinatesForTake` treats the table as a dense array of max-sized blocks (used
when taking N elements without knowing individual block sizes).

### `Int` type guards

The codebase uses branded integer types from `@rimbu/base`:

```ts
import { Int } from '@rimbu/base';
// Int.isAtLeastOne(value): value is Int.AtLeastOne     (narrows to ≥1)
// Int.isAtLeastZero(value): value is Int.AtLeastZero   (narrows to ≥0)
// Int.checkAtLeastOne(value): asserts value >= 1
// Int.checkAtLeastZero(value): asserts value >= 0
```

These narrow TypeScript types so downstream code knows indices/counts are valid.

## Normalization

### `#createNormalized` vs `_normalize()`

- **list2 uses `#createNormalized()`** — a one-level structural check called at
  construction/rebalancing time. It returns a simpler node when possible:

  ```ts
  // OuterTree: collapse to 1-2 blocks when total size ≤ 2*maxBlockSize
  // InnerTree: merge left+right when nrChildren ≤ 2*maxBlockSize
  ```

- **`list` uses `_normalize()`** — a recursive, cascading normalization that
  handles more cases (merging first/last middle children into left/right,
  flattening to two blocks). The richer normalization in `list` prevents edge
  cases that `list2`'s simpler approach may let through.

### Known normalization gaps in list2 (vs list)

Cases that `list._normalize()` handles but `list2.#createNormalized()` does not:

1. **`size ≤ maxBlockSize` + middle is InnerBlock** → list merges left + firstMiddleChild + right into one block; list2 only handles this when middle is null
2. **First middle child can merge into left** → list moves it; list2 doesn't
3. **Last middle child can merge into right** → list moves it; list2 doesn't
4. **`size ≤ 2·maxBlockSize` + middle exists** → list flattens all elements into two blocks by hand; list2 calls `context.from()` which re-builds from leaf blocks (correct but different approach)

`_verifyStructure` on `OuterTree` catches the violations that case 2/3/4 would
fix — calls to `_verifyStructure` will flag "size ≤ 2*max with middle" and
"can merge first/last middle child" cases.

### `dropInternal` recursion

Both `list` and `list2` have the same tail-recursive call pattern in
`InnerTree.dropInternal`:

```ts
return newSelf.dropInternal(inUpLeft);
```

This recurses one level after rebuilding `newSelf` from the result of
`this.middle.dropInternal()`. `list`'s richer normalization may prevent cascading
bad states that cause this to crash on deep trees.

## Block operations naming convention

Internal methods are prefixed with `_` and operate on the structural, non-public
level. Public methods omit the prefix.

| Internal method | Purpose |
|---|---|
| `_get(index)` | Get element at index (caller ensures bounds) |
| `_update(index, f)` | Update element at index, return `OpWithResult` |
| `_nrChildren` | Number of direct children |
| `_canAddChild` | Room for one more child? |
| `_canRemoveChild` | Can drop one child without underflow? |
| `_hasEnoughChildren` | At or above minBlockSize? |
| `_notTooManyChildren` | At or below maxBlockSize? |
| `_prependBlockChild(value)` | Prepend a child element |
| `_appendBlockChild(value)` | Append a child element |
| `_takeChildren(amount)` | Take `amount` front children of a block |
| `_dropChildren(amount)` | Drop `amount` front children of a block |
| `_dropFirstChild()` | Drop first child, return [newBlock, dropped] |
| `_dropLastChild()` | Drop last child, return [newBlock, dropped] |
| `_concatChildren(other)` | Concat two blocks' children |
| `_mutateSplitRight(count?)` | Split children at `count` (mutable, builder-only) |
| `_copyChildren()` | Shallow copy of children array |
| `_verifyStructure(errors?)` | Check invariants, append violations to array |

## The 2-3 finger tree model

Every tree node (`OuterTree`, `InnerTree`) has the shape:

```
left | middle? | right
```

Where:
- `left` and `right` are blocks at the same level
- `middle` is an `Inner` node at one level up, or `null`

**OuterTree** (`level = 0`):
- `left` / `right` are `OuterBlock` (leaf blocks containing elements `T`)
- `middle` is `Inner<T, OuterBlock<T>>` — an inner block/tree whose children are `OuterBlock`s

**InnerTree** (`level > 0`):
- `left` / `right` are `InnerBlock<T, C>` (blocks containing child blocks)
- `middle` is `Inner<T, InnerBlock<T, C>>` — one level up

### Block size invariants

- **maxBlockSize** = `2^blockSizeBits` (4, 8, 16, or 32)
- **minBlockSize** = `ceil(maxBlockSize / 2)` (2, 4, 8, or 16)
- Outer blocks: lower bound is **1** for root/spine boundaries, **minBlockSize** when child of a level-1 inner block
- Inner blocks: **minBlockSize** except boundary blocks (left/right/middle of spine) which have lower bound **1**
- Total children in left+right without middle ≤ `2·maxBlockSize`

## Known issues / work in progress

1. **Normalization gaps** — `#createNormalized()` handles fewer cases than `list`'s `_normalize()` (see Normalization section above)
2. **`dropInternal` recursion crash** — deep tree drops can trigger a crash when `inUpLeft` cascades through recursive calls; masked by narrow drop test offsets
3. **`placeAt` not implemented** — stub returns `0 as any`
4. **`streamSlice` not implemented** — stub returns `0 as any`
5. **Only array backend** — `BitList` exists but `CharList` and `TypedArrayList` are not yet ported

## Key rules for internal imports

- Use `#list/*` for anything in `src/internal/*`:
  ```ts
  import { SizeTable } from '#list/size-table';
  import type { Block, Inner } from '#list/immutable/common';
  ```
- Use `#advanced/*` for extension API:
  ```ts
  import type { ChildrenOps } from '#advanced/children-ops';
  ```
- Use `@rimbu/list` for the public type contract:
  ```ts
  import type { List, OpWithResult } from '@rimbu/list';
  ```
- **Never use relative imports** (`./`, `../`) — banned by Biome

## Testing

Tests use `bun:test` with `--tsconfig-override tsconfig.common.json`. No external
test framework.

| Directory | Purpose |
|---|---|
| `test/` | Runtime tests — one file per module |
| `test-types/` | Type-level tests (`expectTypeOf`) |

Key test files:
- `list-verify-append.test.ts` — structure verification across append/prepend/take/drop/concat/filter/reversed at all block sizes
- `inner-block.test.ts` / `inner-tree.test.ts` — internal node operations
- `outer-block.test.ts` / `outer-tree.test.ts` — internal node operations
- `children-ops.test.ts` — `updateAt`, `mutateUpdate` for `OpWithResult` objects
- `list.test.ts` — basic public API smoke tests

### Structure verification in tests

`_verifyStructure()` is a `[Symbol.for('Rimbu')]` / cast-accessible method on all
internal nodes that returns `string[]` of invariant violations. Tests verify that
after every operation the structure is valid:

```ts
function verifyStructure(list: List<number>): string[] {
  if (list.isEmpty) return [];
  return (list as unknown as { _verifyStructure(errors?: string[]): string[] })._verifyStructure();
}
expect(verifyStructure(list)).toEqual([]);
```

## Building

```bash
# From repo root — build sequentially (never parallel)
bun run build:seq

# From this package
bun run typecheck    # tsc --noEmit
bun run test         # bun test
bun run biome:check  # lint + format
```
