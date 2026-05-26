# Formal Definition of the SpineList Builder

## Overview

The SpineList builder is a mutable staging structure for incrementally constructing or modifying a SpineList. It supports element-level operations — prepend, append, insert at index, remove at index, get, and update — all performed in-place without producing intermediate immutable lists. When construction is complete, `build()` materialises the mutable state into a fully immutable SpineList as defined in `FORMAL_DEFINITION.md`.

The builder mirrors the node structure of the immutable SpineList (outer block, outer spine, inner block, inner spine) but uses mutable fields and in-place mutation instead of path copying. The same parameters `blockSizeBits`, `minBlockSize`, and `maxBlockSize` govern block sizes, and the same structural invariants hold at all times.

Operations that are natural on immutable lists but not meaningful on a builder are intentionally absent. See the [Unsupported Operations](#unsupported-operations) section.

---

## Parameters

The builder shares the same parameters as the immutable list:

$$\text{maxBlockSize} = 2^{\text{blockSizeBits}}$$

$$\left\lceil \frac{\text{maxBlockSize}}{2} \right\rceil \leq \text{minBlockSize} \leq \text{maxBlockSize} - 1$$

See `FORMAL_DEFINITION.md` for the full SpineList specification.

---

## Lazy Copy-on-First-Write

Every builder node optionally holds a reference to the original immutable node it was created from, called its **source**. As long as the source is present:

- All reads are served directly from the immutable source node — zero overhead, no allocation.
- `build()` returns the source node directly — building an unmodified builder costs nothing and shares the entire original structure.

On the **first mutation** of a node, the source is consumed: the node copies the minimal state needed from the source into mutable local fields, clears the source reference, and proceeds with in-place mutation from that point on. This copy is **shallow** — child nodes are each wrapped in their own lazy builder, still pointing to their own immutable source. No deep copy occurs.

As a result, `build()` after a modification only reallocates nodes on the path from the root to the modification site. All unmodified subtrees are shared with the original immutable list, identical to the structural sharing achieved by path copying in the immutable layer.

---

## Iteration Safety

The builder maintains a **lock counter** that is incremented at the start of a `forEach` traversal and decremented when it completes. Any mutation operation (`prepend`, `append`, `insert`, `remove`, `updateAt`) checks the lock before proceeding and throws if the counter is non-zero.

This prevents structural modification during iteration, which would produce undefined behaviour. The immutable list has no equivalent constraint because its structure cannot change during traversal.

---

## Node Types

The builder's node types mirror the immutable structure exactly. Each builder node type wraps its corresponding immutable node type and uses the same left/middle/right decomposition and the same level semantics for inner nodes.

### Builder Node Correspondence

| Builder node | Corresponding immutable node |
|---|---|
| Outer block builder | Outer block |
| Outer spine builder | Outer spine |
| Inner block builder (level $\ell$) | Inner block (level $\ell$) |
| Inner spine builder (level $\ell$) | Inner spine (level $\ell$) |

The root of the builder is either an outer block builder or an outer spine builder, or absent (representing an empty list).

### Canonical Form

After every mutating operation, the builder restores itself to **canonical form**:

- If the root builder has become empty, it is discarded (the builder represents an empty list).
- If an outer spine builder's total element count has dropped to $\leq \text{maxBlockSize}$, it collapses into an outer block builder.
- If an outer block builder's element count has exceeded $\text{maxBlockSize}$, it is promoted to an outer spine builder.
- The same rules apply recursively for inner block and inner spine builders.

This invariant ensures the builder's structure is always minimal and valid — equivalent to the normalisation guarantee of the immutable structure.

---

## Operations

### Get — retrieve the element at index $i$

Navigates the builder tree using the same left/middle/right index dispatch and inner-block coordinate lookup as the immutable `get` operation. If a source node is present at any level, the read delegates directly to the immutable node without triggering a copy.

**Complexity:** O(log n).

---

### UpdateAt — replace the element at index $i$

Navigates to the target outer block builder, triggering lazy copy-on-first-write on each node along the path. Updates the element in-place. Returns the old value.

If the new value is identical to the old value (by reference equality), no copy is triggered and the source is preserved.

**Complexity:** O(log n).

---

### Prepend — add an element to the front

If the builder is empty, creates a new outer block builder containing just the element.

Otherwise, uses the same four-case waterfall as the immutable prepend, but mutates in place:

1. **Left block has room** ($|left| < \text{maxBlockSize}$): prepend directly to left.
2. **Left is full, no middle, right has room**: shift the last element of left to the front of right, prepend the new element to left.
3. **Left is full, middle exists, first middle block has room**: shift the last element of left into the front of the first middle block, prepend the new element to left.
4. **Left is full, no room available**: push the entire left block into the front of middle (creating or growing middle), create a new single-element left block, prepend the element to it.

After the operation, the builder is restored to canonical form.

**Complexity:** O(log n) worst case, O(1) amortized.

---

### Append — add an element to the back

The mirror image of prepend, operating on the right boundary.

**Complexity:** O(log n) worst case, O(1) amortized.

---

### Insert — insert a single element at index $i$

Navigates to the node containing index $i$, triggering lazy copies along the path. Inserts the element in-place at the correct position within the target outer block builder.

If the target block overflows ($|block| > \text{maxBlockSize}$) after the insert, the overflow is resolved by attempting to shift one element to an adjacent sibling. If no sibling has room, the block is split and the new block is inserted into the middle, which may cascade upward.

Negative indices are resolved relative to the end of the list: $i < 0$ is treated as $i + |L|$. An index of 0 delegates to prepend; an index $\geq |L|$ delegates to append.

**Complexity:** O(log n).

---

### Remove — remove the single element at index $i$

Navigates to the target outer block builder, triggering lazy copies along the path. Removes the element in-place and returns it.

If the target block underfills ($|block| < \text{minBlockSize}$) after the remove, the underflow is resolved by attempting to rebalance with an adjacent sibling: if the sibling has a surplus, one element is shifted across; if the combined size fits within $\text{maxBlockSize}$, the two blocks are merged. Merging may cascade upward, reducing the size of the parent inner block.

After the operation, the builder is restored to canonical form.

**Complexity:** O(log n).

---

### ForEach — iterate over all elements

Visits each element in order, calling a provided function. Increments the lock counter for the duration of the traversal to prevent concurrent modification. If a source node is present at any level, iteration delegates to the immutable node's traversal directly.

Iteration can be halted early by signalling a stop from within the callback.

**Complexity:** O(n).

---

### Build — materialise into an immutable list

Recursively converts the mutable builder tree into the corresponding immutable SpineList structure:

- A node whose source was never consumed (never mutated) returns the original immutable node directly — no allocation.
- A node whose source was consumed reconstructs the corresponding immutable node from its current mutable state, recursively building each child.

The result is a fully immutable, structurally valid SpineList. All unmodified subtrees are shared with any SpineList the builder was initialised from.

A variant **BuildMap** applies a transformation function $f : T \to T'$ to every element during materialisation, producing a list of a different element type. This is more efficient than `build()` followed by `map()` because it avoids allocating an intermediate untransformed list.

**Complexity:** O(modified nodes); O(1) if the builder was never mutated.

---

## Unsupported Operations

The following operations from the immutable list are intentionally absent from the builder:

| Operation | Reason |
|---|---|
| Concat | Two builders should be built into immutable lists first, then concatenated using the immutable `concat` operation. In-place merging of two mutable trees would require complex rebalancing with no structural-sharing benefit. |
| Split | Produces two independent lists; use `build()` then the immutable `split` (or `take`/`drop`). |
| Take / Drop | Equivalent to `build()` followed by immutable `take`/`drop`. |
| Multi-element insert | Use repeated single-element `insert`, or build the sequence separately and use immutable `concat` after `build()`. |
| Multi-element remove | Use repeated single-element `remove`, or use `build()` then immutable `take`/`drop`/`concat`. |
| Reverse | The builder always stores elements in forward order. Reverse after `build()` using the immutable `reverse` operation. |
| Map | Use `buildMap(f)` to apply a transformation during materialisation, or `map` on the immutable result of `build()`. |

---

## Complexity Summary

| Operation | Time Complexity | Notes |
|---|---|---|
| get | O(log n) | Reads from immutable source if unmodified |
| updateAt | O(log n) | No copy if value unchanged |
| prepend | O(log n) worst, O(1) amortized | Boundary block usually non-full |
| append | O(log n) worst, O(1) amortized | Boundary block usually non-full |
| insert | O(log n) | May cascade overflow upward |
| remove | O(log n) | May cascade underflow upward |
| forEach | O(n) | Lock prevents concurrent mutation |
| build | O(modified nodes) | O(1) if never mutated; shares all unmodified subtrees |
| buildMap | O(n) | Applies transformation during materialisation |
