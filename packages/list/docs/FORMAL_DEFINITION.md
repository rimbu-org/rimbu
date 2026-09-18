# Formal Definition of SpineList

## Overview

This document defines **SpineList**, a persistent, immutable sequence data structure that supports efficient random access, prepend, append, insert, remove, concat, and split operations. The structure is a recursive block tree: a list is either empty, a single leaf block of elements, or a spine node with a left boundary block, an optional recursive middle structure, and a right boundary block. The branching factor at each level is controlled by a configurable `blockSizeBits` parameter, giving each block between `minBlockSize` and `maxBlockSize` children. The middle of the spine recurses through a hierarchy of inner nodes, each level multiplying the addressable capacity by a factor of `maxBlockSize`. This design achieves O(log n) worst-case complexity for most operations and O(1) amortized complexity for prepend and append.

---

## Parameters

| Parameter | Type | Description |
|---|---|---|
| `blockSizeBits` | positive integer | Controls block sizes. Must be ≥ 1. |
| `minBlockSize` | positive integer | Minimum number of children in any non-root block. |
| `maxBlockSize` | positive integer | Maximum number of children in any block. |

The following constraints must hold:

$$\text{maxBlockSize} = 2^{\text{blockSizeBits}}$$

$$\left\lceil \frac{\text{maxBlockSize}}{2} \right\rceil \leq \text{minBlockSize} \leq \text{maxBlockSize} - 1$$

Setting $\text{minBlockSize} = \left\lfloor \frac{\text{maxBlockSize}}{2} \right\rfloor$ minimises restructuring work. Setting $\text{minBlockSize} = \left\lceil \frac{3}{4} \cdot \text{maxBlockSize} \right\rceil$ keeps blocks denser (better cache locality, shallower trees) at the cost of more frequent restructuring during concat and split.

---

## Persistence and Structural Sharing

All operations are non-destructive. Every operation that would logically modify the structure instead returns a new root node. Nodes that are unchanged by an operation are shared between the old and new versions — only the nodes on the path from the root to the modification site are copied. This is known as **path copying**.

For example, updating a single element at index $i$ copies $O(\log n)$ nodes (one per level of the tree), while all other nodes are shared with the original structure.

### Reversal and the Reversal Cache

Reversing a list is defined behaviorally: the reversed list contains the same elements in opposite order. An efficient implementation can achieve O(1) reversal of a leaf block by wrapping it in a reversed view without copying the underlying data.

For deeper structures, reversal recursively swaps the left and right boundary blocks and reverses the middle. Because structural sharing means the same inner node may be reachable via multiple paths, a **reversal cache** (a map from original node to reversed node) should be maintained during a deep reversal. When a node is encountered that is already in the cache, the cached result is returned immediately. This ensures the total work is O(unique nodes visited) rather than O(total nodes in the logical tree).

---

## Terminology

| Term | Definition |
|---|---|
| **Element type** $T$ | The type of values stored in the list. |
| **Block** | A node that directly holds an array of children (either elements or other blocks). |
| **Spine** | A node with a left block, an optional middle, and a right block. |
| **Level** | A property of inner nodes only. Level 1 inner nodes hold outer blocks as children. Level $\ell$ inner nodes hold level $(\ell - 1)$ inner nodes as children. |
| **Regular block** | An inner block in which every child subtree contains exactly $2^{\text{blockSizeBits} \cdot \ell}$ elements, where $\ell$ is the block's level. Enables O(1) index navigation via bit arithmetic. |
| **Irregular block** | An inner block that is not regular. Carries a **size table** to enable O(log maxBlockSize) index navigation via binary search. |
| **Size table** | A cumulative array stored on an irregular inner block where $\text{sizes}[k] = \sum_{i=0}^{k} |\text{children}[i]|$. Used to locate the correct child for a given index in O(log maxBlockSize) time. |

---

## Node Types

### Empty

The empty node represents a list with no elements. It is the unique representation of the empty list.

**Invariants:**
- Contains no elements.
- Is the only valid representation of the empty list.

---

### Outer Block

An outer block is a leaf node that directly stores elements of type $T$. It is the only node type that contains actual list elements.

**Invariants:**
- Contains between 1 and $\text{maxBlockSize}$ elements inclusive.
- When an outer block appears as the left or right child of an outer spine, the lower bound is 1 — it may contain as few as 1 element. This is also true when the outer block is the sole non-empty node (i.e. the entire list).
- When an outer block is a child of a level 1 inner block, the lower bound is $\text{minBlockSize}$: it must contain at least $\text{minBlockSize}$ elements. An inner block's children are never boundary blocks of a spine, so they are not exempt from the usual minimum fill requirement.

---

### Outer Spine

An outer spine is the root node for lists too large to fit in a single outer block. It has three parts:

- **left**: an outer block
- **middle**: $\emptyset$, an inner block of level 1, or an inner spine of level 1
- **right**: an outer block

The total number of elements is:

$$|left| + |middle| + |right|$$

where $|middle| = 0$ when middle is $\emptyset$.

**Invariants:**
- $|left| \geq 1$ and $|right| \geq 1$.
- The total number of elements exceeds $\text{maxBlockSize}$ (otherwise a single outer block suffices).
- If middle is $\emptyset$, the total number of elements is at most $2 \cdot \text{maxBlockSize}$ (otherwise a non-empty middle is required).
- If middle is non-$\emptyset$, it has level 1.

---

### Inner Block (level $\ell$)

An inner block of level $\ell \geq 1$ holds an ordered array of child nodes. The children of a level 1 inner block are outer blocks. The children of a level $\ell > 1$ inner block are inner blocks of level $\ell - 1$.

**Invariants:**
- Contains between $\text{minBlockSize}$ and $\text{maxBlockSize}$ children inclusive.
  - Exception: an inner block that appears as the left or right child of an inner spine, or as the sole middle child of an outer spine or inner spine, may contain as few as 1 child (boundary blocks and root-level middle blocks are exempt from the usual minimum fill requirement).
  - When an inner block is a child of another inner block, it must satisfy $\text{minBlockSize}$ — its children are neither spine boundaries nor roots, so the full minimum applies.
- All children have the same type (all outer blocks, or all inner blocks of level $\ell - 1$).
- All children at the same level contain elements; the number of elements in a child of a level 1 inner block is between $\text{minBlockSize}$ and $\text{maxBlockSize}$.

---

### Inner Spine (level $\ell$)

An inner spine of level $\ell \geq 1$ is the inner equivalent of the outer spine. It has three parts:

- **left**: an inner block of level $\ell$
- **middle**: $\emptyset$, an inner block of level $\ell + 1$, or an inner spine of level $\ell + 1$
- **right**: an inner block of level $\ell$

**Invariants:**
- $|left| \geq 1$ and $|right| \geq 1$ (where $|\cdot|$ counts direct children, not elements). Left and right blocks of an inner spine are boundary blocks and are exempt from the $\text{minBlockSize}$ requirement — they may contain as few as 1 child, mirroring the outer spine's relaxed lower bound for its boundary blocks.
- The total number of direct children (across left, middle's children, and right) exceeds $\text{maxBlockSize}$ (otherwise a single inner block suffices).
- If middle is $\emptyset$, the total number of direct children is at most $2 \cdot \text{maxBlockSize}$.
- If middle is non-$\emptyset$, it has level $\ell + 1$.

---

## Index Navigation

A flat integer index $i$ into a list maps to a path through the tree. This section describes how that mapping works at each node type.

### Outer Spine

Given index $i$ into an outer spine with left $L$, middle $M$, right $R$:

1. If $i < |L|$: navigate into $L$ with index $i$.
2. Else if $M \neq \emptyset$ and $i - |L| < |M|$: navigate into $M$ with index $i - |L|$.
3. Else: navigate into $R$ with index $i - |L| - |M|$.

### Inner Block (level $\ell$)

Given index $i$ into an inner block $B$ of level $\ell$:

Let $\text{levelBits} = \text{blockSizeBits} \cdot \ell$ and $\text{subtreeSize} = 2^{\text{levelBits}}$.

**Regular case** (all children have exactly $\text{subtreeSize}$ elements):

$$\text{childIndex} = i \gg \text{levelBits}$$
$$\text{inChildIndex} = i \mathbin{\&} (\text{subtreeSize} - 1)$$

This is O(1) using integer bit operations.

**Irregular case** (block carries a size table):

Given the size table $\text{sizes}[0..n-1]$, find the smallest $k$ such that $\text{sizes}[k] > i$ using binary search:

$$\text{childIndex} = \min \{ k \mid \text{sizes}[k] > i \}$$
$$\text{inChildIndex} = i - (childIndex > 0 \; ? \; \text{sizes}[\text{childIndex} - 1] : 0)$$

This is O(log maxBlockSize) — effectively O(1) since maxBlockSize is fixed (e.g. 32 → at most 5 comparisons).

The size table is computed when a block first becomes irregular (after take, drop, concat, or split) and stored on the block. Regular blocks carry no size table.

### Inner Spine

Same as outer spine navigation, but counting children (of the left/right inner blocks) rather than elements.

---

## Operations

### Get — retrieve the element at index $i$

Navigate the tree using the index navigation rules above, descending until an outer block is reached. Return the element at the computed in-block index.

**Complexity:** O(log n).

---

### Update — replace the element at index $i$

Navigate as in get, identifying the path from root to the target outer block. On the way back up, construct new copies of each node on the path with the updated child, sharing all off-path subtrees with the original. Return the new root.

**Complexity:** O(log n).

---

### Prepend — add an element to the front

**Case: Empty.** Return a new outer block containing just the element.

**Case: Outer block with room** ($|block| < \text{maxBlockSize}$). Return a new outer block with the element prepended.

**Case: Outer block at capacity.** Return a new outer spine with a fresh single-element outer block as left, the original block as right, and empty middle.

**Case: Outer spine, left has room** ($|left| < \text{maxBlockSize}$). Return a new outer spine with the element prepended to left.

**Case: Outer spine, left is full, middle is $\emptyset$, right has room.** Shift the last element of left to the front of right, freeing one slot in left. Prepend the new element to left. Return the updated spine.

**Case: Outer spine, left is full, middle is non-$\emptyset$, first block of middle has room.** Shift the last element of left into the front of the first block of middle. Prepend the new element to left.

**Case: Outer spine, left is full, no room available without restructuring.** Push the entire left block into the front of middle (possibly growing middle into an inner spine). Create a new single-element outer block as the new left. The recursive push into middle follows the same four-case waterfall at the inner level.

**Complexity:** O(log n) worst case, O(1) amortized (the boundary block is non-full in the common case).

---

### Append — add an element to the back

The mirror image of prepend, operating on the right boundary.

**Complexity:** O(log n) worst case, O(1) amortized.

---

### Take — return the first $n$ elements

Determine how $n$ partitions across left, middle, and right by successive subtraction. Recursively take from the appropriate child. Reconstruct the spine and **normalize**: if the result is small enough to fit in a single outer block, collapse it; if the middle can be absorbed into the boundary blocks, do so.

**Complexity:** O(log n).

---

### Drop — return all elements from index $n$ onward

The mirror image of take.

**Complexity:** O(log n).

---

### Concat — join two lists

Let $A$ and $B$ be the two lists.

**Both empty or one empty:** return the non-empty list (or empty if both empty).

**Both outer blocks:** concatenate the element arrays. If the result exceeds $\text{maxBlockSize}$, create an outer spine with \$A$ as left and $B$ as right.

**One outer block, one outer spine:** try to merge the block into the boundary block of the spine. If it fits, done. Otherwise rebalance: split the combined children across two outer blocks.

**Both outer spines:** merge the right boundary of $A$ with the left boundary of $B$ into a combined block sequence. Split this sequence into one or two blocks and insert them into the middle, recursively concatenating the middles. Rebalance the resulting middle if it has too many or too few children per block.

**Complexity:** O(log n).

---

### Insert — insert elements at index $i$

Let $L$ be the list and $V$ be an ordered sequence of values to insert.

1. Split $L$ at index $i$ into $L_{\text{before}} = \text{take}(L, i)$ and $L_{\text{after}} = \text{drop}(L, i)$.
2. Convert $V$ into a list $L_V$.
3. Return $\text{concat}(L_{\text{before}}, \text{concat}(L_V, L_{\text{after}}))$.

When $V$ is a single element, this reduces to splitting at $i$ and concatenating the three parts. Negative indices are resolved relative to the end of the list: $i < 0$ is treated as $i + |L|$.

**Complexity:** O(log n) — dominated by the two splits and two concats.

---

### Remove — remove $k$ elements starting at index $i$

Let $L$ be the list and $k \geq 0$ be the number of elements to remove.

1. $L_{\text{before}} = \text{take}(L, i)$
2. $L_{\text{after}} = \text{drop}(L, i + k)$
3. Return $\text{concat}(L_{\text{before}}, L_{\text{after}})$.

When $k = 0$, the list is returned unchanged. When $i + k \geq |L|$, the result is equivalent to $\text{take}(L, i)$.

**Complexity:** O(log n) — dominated by the two splits and one concat.

---

### Splice — generalised insert and remove at index $i$

Insert and remove can be combined into a single **splice** operation: remove $k$ elements starting at index $i$ and insert a sequence $V$ in their place.

1. $L_{\text{before}} = \text{take}(L, i)$
2. $L_{\text{after}} = \text{drop}(L, i + k)$
3. Return $\text{concat}(L_{\text{before}}, \text{concat}(L_V, L_{\text{after}}))$, where $L_V$ is the list formed from $V$ (empty if $V$ is omitted).

Insert is splice with $k = 0$; remove is splice with $V = \emptyset$.

**Complexity:** O(log n).

---

### Reverse — return the list with elements in reverse order

The reversed list contains the same elements in the opposite order. A leaf block can be reversed in O(1) by returning a reversed view over the same storage. Deeper structures are reversed by recursively swapping and reversing the left and right boundaries and reversing the middle, using a reversal cache to avoid redundant work on shared subtrees.

**Complexity:** O(unique nodes) with reversal cache; O(1) for a single outer block.

---

## Complexity Summary

| Operation | Time Complexity | Notes |
|---|---|---|
| get | O(log n) | O(1) per level for regular blocks; O(log maxBlockSize) per level for irregular |
| update | O(log n) | Path copying; shares all off-path nodes |
| prepend | O(log n) worst, O(1) amortized | Boundary block usually non-full |
| append | O(log n) worst, O(1) amortized | Boundary block usually non-full |
| take | O(log n) | Includes normalization |
| drop | O(log n) | Includes normalization |
| concat | O(log n) | Boundary merge + recursive middle concat |
| insert | O(log n) | Two splits + two concats |
| remove | O(log n) | Two splits + one concat |
| splice | O(log n) | Generalises insert and remove |
| reverse | O(unique nodes) | O(1) for leaf blocks; cache avoids redundant work |

---

## Implementation Notes

### Reversed Leaf Blocks

An efficient implementation can represent a reversed outer block as a thin wrapper over the original block's storage, overriding index arithmetic to map forward indices to reverse positions. This makes `reverse` O(1) for leaf-level lists and avoids allocating a new element array. Reversing the wrapper returns the original block.

### Reversal Cache

When reversing a deep structure with structural sharing, the same inner node may be logically reachable via multiple paths. A reversal cache (a map from original node identity to its reversed counterpart) prevents the same node from being reversed more than once, bounding total reversal work by the number of unique nodes rather than the number of logical references.

### Regular vs. Irregular Blocks and Size Tables

Most inner blocks in a list built purely via prepend/append are regular: all children hold exactly $2^{\text{blockSizeBits} \cdot \ell}$ elements. Index navigation in regular blocks is O(1) via bit shifts. Irregular blocks arise after take, drop, split, or concat. Each irregular block carries a **size table** — a cumulative array of child sizes — so that index navigation remains O(log maxBlockSize) via binary search rather than falling back to a linear scan. Regular blocks carry no size table, so there is no memory overhead for the common case.

### Choosing `blockSizeBits` and `minBlockSize`

A value of `blockSizeBits = 5` (maxBlockSize = 32) is a typical default, balancing tree depth against block scan cost. Setting `minBlockSize` closer to $\frac{3}{4} \cdot \text{maxBlockSize}$ produces denser trees with better cache behaviour at the cost of more frequent rebalancing during concat and split.
