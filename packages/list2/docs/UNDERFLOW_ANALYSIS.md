# Builder Deep-Tree Remove: Underflow Analysis and Proposed Fix

Status: analysis + design proposal — **not yet implemented**
Scope: `@rimbu/list2` builder (`ListBuilder` / mutable builders)
Related tests: `test/list-builder-insert-remove.test.ts` ("builder deep tree random (level >= 2)")

---

## 1. Problem statement

`test/list-builder-insert-remove.test.ts` contains seeded randomized tests that
hover around deep structures (level >= 2: the outer tree's middle is itself a
tree of blocks). Four of them currently **fail deterministically**:

| Case | Failing op | Symptom |
|---|---|---|
| bsb=2, level=2, seed 4242 | op 1642 (`remove(27)`) | `OuterBlockBuilder has fewer children than allowed: 1 < 2` |
| bsb=2, level=3, seed 77 | op 633 (`remove(28)`) | `OuterBlockBuilder has fewer children than allowed: 1 < 2` |
| bsb=2, level=4, seed 5 | op 257 (`remove(4)`) | `OuterBlockBuilder has fewer children than allowed: 1 < 2` |
| bsb=3, level=2, seed 77 | op 1886 (`remove(21)`) | `OuterBlockBuilder has fewer children than allowed: 1 < 2` |

All four report the same invariant violation: a leaf (outer) block below
`minBlockSize` that is a child of an inner block.

These failures were never caught before because the previous mixed random test
in `test/list-verify-builder.test.ts` keeps sizes below `maxBlockSize^2` — it
never builds level >= 2 structures for bsb=4/5 and only marginally for bsb=2/3.
`InnerTreeBuilder` also has no insert/remove unit tests (its insert/remove is
inherited from the shared `TreeBuilderBase`, but the level >= 1 dynamics differ).

### 1.1 Previously fixed issues (same failing test file)

Two earlier failures in the same suite were fixed already:

- **Crash** (`InvalidStateError` in `SizeTable.takeChildren`): `dropLastChild`
  on a single-child inner block called `takeChildren(0)`, which threw.
  Fixed in `SizeTable.takeChildren` (returns an empty table for `0`, mirroring
  `dropChildren`).
- **Size drift** (builder size diverges from content): the collapse branch of
  `OuterTreeBuilder.normalized()` merged only the middle's *first* child into
  the left block, silently dropping the remaining middle children after a
  rebalance left the middle with two children. Fixed by merging first *and*
  last middle children.

The remaining underflow issue is what this document analyzes.

---

## 2. How the invariant is checked

`ListBuilder._verifyStructure()` delegates to the outer builder's
`_verifyStructure`. The chain enforces `minBlockSize` only where it matters:

- `InnerBlockBuilder._verifyStructure(errors, enforce)` passes
  `enforce = true` to *its* children (inner-block-builder.ts).
- `TreeBuilderBase._verifyStructure` passes `false` to the left/middle/right
  spine blocks (tree-builder-base.ts:473-475) — spine blocks have lower
  bound 1.
- `OuterBlockBuilder._verifyStructure(errors, enforce)` reports
  `OuterBlockBuilder has fewer children than allowed: n < minBlockSize` when
  `enforce` is set and the block is below `minBlockSize`.

So the reported violation means: an **outer block with fewer than
`minBlockSize` elements sits inside a level-1 (or deeper) inner block** — i.e.
in the middle of a tree, not on a spine.

---

## 3. Root cause analysis

### 3.1 Mechanism 1 — unrepaired underfull child inside a single-child spine block (3 of 4 cases)

Traced shape at the failing op for seed 4242 (bsb=2, level=2, op 1642
`remove(27)`):

```
before: T(B(2), T(I(B(3),B(4),B(3)), I(I(B(3),B(4),B(4),B(4))), I(B(2))), B(3))
after:  T(B(2), T(I(B(3),B(4),B(3)), I(I(B(3),B(4),B(4))), I(B(4),B(1))), B(3))
```

Chain of events:

1. The remove lands in the **right spine block `I(B(2))`** of a level-1 inner
   tree — an inner block with a single child.
2. `InnerBlockBuilder.remove` **early-exits when `this.nrChildren <= 1`**
   (inner-block-builder.ts:195-199): a single-child block has no sibling to
   rebalance against, so its only child drops below `minBlockSize`
   (`B(2) -> B(1)`).
3. `TreeBuilderBase.remove`'s right-branch rebalance (tree-builder-base.ts:
   310-330) repairs the spine block's child **count** by moving whole blocks
   from the middle's adjacent child (`I(B(4),B(1))` — count 2, ok) but never
   repairs the element-underfull `B(1)`.

The same pattern appears in:
- bsb=2, level=3, op 633: `I(B(2)) -> I(B(4),B(1))` after a right-spine remove.
- bsb=2, level=4, op 257: left-spine remove; the merge branch produces
  `I(B(1),B(4),B(4),B(4))` — the underfull `B(1)` stays first.

**Why the underfull child only ever appears in the single-child case:** a
multi-child inner block repairs an underfull child internally (merge with a
sibling, or merge+split with the richest sibling; both provably keep all
children >= `minBlockSize`, because the merge checks run first and the
rebalance only fires when the joint total >= `2*minBlockSize + 1`, making both
split halves valid). The `nrChildren <= 1` early-exit is the *only* path that
lets an underfull child survive inside a block — and the block it survives in
is necessarily the spine block, which is exactly when the tree-level rebalance
fires (it fires iff the spine block's count is below `minBlockSize`).

### 3.2 Mechanism 2 — donor shrink below `minBlockSize` (1 of 4 cases)

Traced shape at the failing op for bsb=3, level=2 (op 1886 `remove(21)`):

```
before: T(B(1), I(B(8),B(6),B(6)), B(1))
after:  T(B(1), I(B(8),B(6),B(3)), B(3))
```

The remove empties the outer right spine (`B(1) -> B(0)`). The right-branch
balance computes `toMove = (total >>> 1) - right.nrChildren` with
`total = 0 + 6 = 6` and executes `lastBlock.splitRight(-toMove)`, shrinking the
middle's last child to `ceil(total/2) = 3 < minBlockSize 4`.

The split only keeps the donor >= `minBlockSize` when
`total >= 2*minBlockSize - 1`. The current gate for the split branch is
`lastBlock.canRemoveChild` (= `donor > minBlockSize`), which is **insufficient
when the spine side is small**: e.g. right = 0 and donor = 6 with
minBlockSize = 4 gives `total = 6 < 7`, yet the split branch fires. (A latent
variant also exists at the outer level with right = 1 and donor = min+1.)

Note: the spine block itself may legitimately end up below `minBlockSize`
(spine lower bound is 1); it is the **donor** — a middle child — that must
stay >= `minBlockSize`.

### 3.3 Why `#repairSingleChildMiddle` does not catch these

`#repairSingleChildMiddle` (tree-builder-base.ts:368-404) repairs the
**middle's** single child after a middle-region remove. The failures above
live in the **left/right spine blocks** of inner trees (Mechanism 1) or in the
middle's own child after a donor shrink (Mechanism 2), and the method only
runs on the middle-region branch. The "repair the single-child underflow"
idea is simply missing for the spine branches.

---

## 4. Proposed fix (Mechanism 1 + the split gate)

Implement as private helpers on `TreeBuilderBase` mirroring
`#repairSingleChildMiddle`, so `remove` stays small. The helpers must preserve
the direct-child counts and cached sizes described below.

### Step 1 — repair the underfull boundary child (new)

In the left and right spine branches, **before** the existing count rebalance:

```
right side (mirror for left):
if (level > 0 && right.nrChildren == 1 && middle exists):
    child       = right.firstChild()
    if child.nrChildren >= minBlockSize: return

    donor       = middle.lastChild()      // donor precedes the right spine
    donorBlock  = donor.lastChild()       // donor's boundary block adjacent to right
    childNeeds  = minBlockSize - child.nrChildren

    if (donorBlock.nrChildren >= 2*minBlockSize - child.nrChildren):
        // top-up: move `childNeeds` direct children from donorBlock into child
        // (right side: remove from donor's end, prepend to child's front)
    else:
        // donorBlock.nrChildren + child.nrChildren <= 2*minBlockSize - 1
        // <= maxBlockSize, so the merge always fits
        absorbed = right.dropLastChild()
        donorBlock.appendFrom(absorbed)   // donor precedes child in list order
        right becomes temporarily empty (0 children)
```

At least one branch always applies:
- Top-up requires the donor block to stay >= `minBlockSize` after giving
  (`donorBlock.nrChildren >= minBlockSize + childNeeds =
  2*minBlockSize - child.nrChildren`).
- When that fails, the direct-child counts satisfy
  `donorBlock.nrChildren + child.nrChildren <= 2*minBlockSize - 1 <=
  maxBlockSize`, so the absorb merge fits. In the observed one-remove cases,
  `child.nrChildren` is `minBlockSize - 1` and the donor boundary is exactly
  `minBlockSize`, but the inequality is the general condition.

The counts above must be **direct-child counts**. At level 1 a block's
`size` happens to equal its number of children, but at higher levels `size` is
the total number of leaf elements and cannot be used for this calculation.

The transfer must also be implemented with the correct granularity. For a
top-up, move direct children one at a time (`dropLastChild` + `prependChild` on
the right, mirrored by `dropFirstChild` + `appendChild` on the left). Do not use
`prependFrom`/`appendFrom` for the top-up: `InnerBlockBuilder` may merge boundary
children, so the recipient may still have too few direct children.

Nested builder mutations must go through the enclosing `modifyFirstChild` /
`modifyLastChild` operations, returning the corresponding size deltas. Directly
mutating a nested child leaves its parent's `size` and `SizeTable` stale. The
absorb path can use `appendFrom` on the right and `prependFrom` on the left,
because it intentionally merges the two boundary regions into one block.

At the outer level (`level === 0`) the spine block's children are elements, not
blocks, so the helper is a no-op. The level guard is still needed before reading
`child.nrChildren`.

### Step 2 — correct the split gate (existing branch)

The balance branch must split only when the donor keeps >= `minBlockSize`
children: **`total >= 2*minBlockSize - 1`** (equivalently
`lastBlock.nrChildren - toMove >= minBlockSize`). Otherwise fall through to
the merge branch (drop the entire middle child into the spine block — always
valid, because the donor is a middle child and hence >= `minBlockSize`).

This gate protects the donor, not necessarily both resulting halves. The
left/right spine blocks have a lower bound of 1, so with `total ===
2*minBlockSize - 1` the spine can receive `minBlockSize - 1` children and still
be valid. Requiring both halves to have at least `minBlockSize` would use the
stronger threshold `2*minBlockSize`, which is not required for a spine.

This is required by the absorb path (spine = 0 children), and as a side effect
fixes the observed Mechanism-2 case (right = 0, donor = 6, min 4:
`total = 6 < 7` -> merge instead of split).

### 4.1 Correctness argument

- Step 1 runs once per remove; the boundary child either becomes valid
  (top-up) or is dissolved into the donor (absorb).
- Step 2 then always produces a valid configuration:
  - merge branch: spine block gets the donor's (>= `minBlockSize`) valid
    children;
  - split branch (gated): the donor half remains >= `minBlockSize`, the
    spine remains non-empty, and all boundary children are valid.
- No loops: each branch runs at most once per remove.
- Element order is preserved: on the right side the moved blocks are the
  donor's *last* children (adjacent to the spine) and are prepended to the
  spine child; the absorbed spine child follows the donor and is appended to
  the donor's boundary block. The left side is the mirror image.

### 4.2 Rejected alternatives

1. **Post-rebalance repair** (merge the underfull child with a moved-in block
   after the count rebalance): fails when the moved block is at
   `maxBlockSize` (overflow, and the top-up alternative cannot fix a
   `minBlockSize`-sized donor), and the merge re-drops the spine count below
   `minBlockSize`, requiring another pull — cascade.
2. **Fix in `InnerBlockBuilder.remove`** (drop the early-exit): impossible —
   with one child there is no sibling to rebalance against; the block cannot
   repair itself and has no parent reference. The repair must come from the
   tree.
3. **Top-up only** (no absorb): fails when the donor's boundary block is at
   `minBlockSize` — it cannot spare elements.
4. **Absorb only**: works in principle (the spine may end below
   `minBlockSize`, legal for spines), but the absorb merge can overflow when
   the donor block is at `maxBlockSize` — the top-up fallback is still needed.
5. **Bulk `prependFrom`/`appendFrom` for top-up**: unsafe at deeper levels,
   because those operations may merge boundary children instead of increasing
   the recipient's direct-child count by the requested amount.

---

## 5. Verification plan

1. The four failing seeded combos must pass after the fix.
2. Add targeted unit tests constructing the exact failing joints (like the
   existing repair-branch tests in `test/list-builder-insert-remove.test.ts`):
    - top-up path: `right = I(B(1))` with middle's last child
      `I(B(3),B(4),B(3),B(4))` (bsb=2);
    - absorb path: a min=4 variant where the donor boundary block is at
      `minBlockSize`;
    - a level-2 top-up where the repaired child is an `InnerBlockBuilder`,
      confirming that direct-child counts are used instead of total element
      sizes and that the enclosing `SizeTable`s stay consistent;
    - the Mechanism-2 gate: outer right spine empty, donor at 6 elements with
      minBlockSize 4 -> merge, not split;
    - assert content order, builder and built structure, cached sizes, and the
      exact resulting shape.
3. Re-run the exhaustive small-sequence tests and the full suite to confirm
   no regressions (the exhaustive suite covers level-2 spine removes for bsb=2
   and guards against over-repair).

---

## 6. Completion of the repair symmetry

`#repairSingleChildMiddle` covers the middle region. The proposed helpers
complete the symmetry: after this change, all three remove regions (left,
middle, right) handle their single-child underflows at the tree level.
