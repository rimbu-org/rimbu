# @rimbu/list

The List is an immutable ordered sequence of elements that can be manipulated and accessed randomly in a relatively efficient way. It can handle data sizes from small to very large since it is block-based. This means that, for larger data sets, the data is cut into chunks. When updating one element in a large collection, this will only require copying of one chunk of data, and updating the element in the copy (and then updating the List administration). The rest of the chunks remain the same.

# Usage

## Creation

```ts
import { List } from '@rimbu/core';

List.empty<number>();
List.of(1, 2, 3);
List.from([1, 2, 3]);
List.from(Stream.range({ amount: 10 }));
```

## Retrieval

```ts
import { List } from '@rimbu/core';

const list = List.of(0, 1, 2, 3, 4, 5, 6);
list.first(); // => 0
list.last(); // => 6
list.get(2); // => 2
list.get(-2); // => 5 (2nd element from end)
list.get(10); // => undefined
list.get(10, 100); // => 100
list.get(10, () => 100); // => 100
```

## Manipulation

```ts
import { List, Stream } from '@rimbu/core';

List.of(Stream.range({ amount: 10 }))
  .insert(5, [100, 101])
  .filter((v) => v > 2)
  .map((v) => v + 1)
  .reversed()
  .append(500);
```

## Building

```ts
import { List } from '@rimbu/core';

const builder = List.builder<number>();

for (let i = 0; i < 5; i++) {
  builder.append(i);
  builder.prepend(i);
}

const list = builder.build();
// list => List(4, 3, 2, 1, 0, 0, 1, 2, 3, 4)
```

## Non-emptiness

Rimbu types are designed to keep track of collections that are guaranteed to be non-empty. This saves the developer from doing many standard tests and prevents bugs.

```ts
import { List } from '@rimbu/core';

const list1 = List.empty<number>();
// list1 has type: List<number>

const list2 = List.of(1, 2, 3);
// list2 has type: List.NonEmpty<number>
```

The benefits are that certain methods are guaranteed to give a result for non-empty Lists:

```ts
const r1 = list1.first() + list1.last();
// ==> compiler error! list1.first() and list1.last() can be undefined

const r2 = list2.first() + list2.last();
// => no error, r2 is a number
```

However, most methods offer an easy way to fallback to default values:

```ts
const r1 = list1.first(0) + list1.last(() => 0);
// no error, r1 is a number
```

The biggest benefit is when requiring non-empty collections in function signatures:

```ts
function processSomething(list: List.NonEmpty<number>): number {
    ...
}

processSomething(List.empty<number>());
// compiler error

processSomething(List.of(1, 2, 3));
// no error
```

Sometimes the compiler cannot infer non-emptiness. When needed, there is `assumeNonEmpty()`. However, this method will throw if the collection is empty, so only use when absolutely necessary.

```ts
processSomething(List.of(1, 2, 3).take(2));
// compiler error: .take does not know if the result is non-empty

processSomething(List.of(1, 2, 3).take(2).assumeNonEmpty());
// no error

processSomething(List.of(1, 2, 3).take(0).assumeNonEmpty());
// throws runtime error!
```

Especially for mutable references to Lists, it may sometimes be useful to drop the .NonEmpty type. This is possible with .asNormal():

```ts
import { List } from '@rimbu/core';

let list1 = List.of(1, 2, 3);
list1 = List.empty<number>();
// => error: List<number> is not assignable to List.NonEmpty<number>

let list2 = List.of(1, 2, 3).asNormal();
list2 = List.empty<number>();
// OK
```

# Implementation details

The List structure is implemented as a block-based structure, similar to Vectors in Scala and Clojure. However the implementation differs radically in many ways from any known existing List/Vector implementation. One requirement for the Rimbu List was to allow for random insertion and deletion, which the other Vector implementations do not allow. There are other implementations (see below) that do allow insertion and deletion, however the Rimbu List uses a different approach.

To key to efficient insertion and deletion is to have efficient splits and concatenation. These should both be of complexity O(log(N)) for large N. When this is the case, it follows that insertion and deletion are also O(log(N)), since they can be represented as combinations of splits and concatenations. For example, imagine a List with elements (0, 1, 2, 3, 4, 5) (this is not a good example for O(log(N)) since N here is very small, but it serves as an example). We want to insert values (10, 11) at index 2. This can be done as follows:

1. Split the list at index 2: (0, 1), (2, 3, 4, 5)
2. Concatenate the first part with the values to insert: (0, 1) + (10, 11) => (0, 1, 10, 11)
3. Concatenate the result with the last part from 1: (0, 1, 10, 11) + (2, 3, 4, 5) => (0, 1, 10, 11, 2, 3, 4, 5)

In total this takes 3 times O(log(N)), which is still O(log(N)).

Similarly, we can remove 2 values at index 2 from the same List (0, 1, 2, 3, 4, 5) as follows:

1. Split the list at index 2: (0, 1), (2, 3, 4, 5)
2. Split the second list at index 2: (2, 3), (4, 5)
3. Concatenate the first list from 1 with the second list from 2: (0, 1) + (4, 5) => (0, 1, 4, 5)

Again, this takes 3 times O(log(N)), which is still O(log(N)).

## Underlying structure

### Block size

As mentioned, a List is based on blocks of size S = 2^B where B >= 2. However, where default Scala and Clojure Vectors require all blocks to be exactly S = 2^B size, the List relaxes this requirement to be ((2^B) / 2) < S <= 2^B. Some more advanced implementations of Vectors also have such a relaxation to allow for more flexibility. Without this flexibility, it is not possible to concatenate in O(log(N)), since it may require shifting all elements in a Vector to make the blocks well aligned with another Vector.

### Structure

Another difference with existing Vectors is the way blocks are connected and navigated to find elements at a certain index. A common Vector has one entry block, which contains information about its sub-blocks. Each sub-block again has information about its sub-blocks, until a leaf is reached which contains the element to be retrieved. This makes all operations relatively constant in access time: O(log(N)). Some implementations use 'caching' strategies to make successive access to values in the same block quicker.

The Rimbu List has a different strategy. At the entry level, is has pointers to 3 blocks: The first leaf block, the last leaf block, and a middle section. The middle section is a recursive List of Lists. More on that later. The consequence is that the first and last blocks are always immediately accessible: O(1). Often List-like structures are used mostly to append or prepend values and to look at the first and last values. The List is therefore very suitable for such cases.

Then about the middle section. As mentioned, this is a List of Lists. Meaning, that again, it has references to three parts: the first block of sub-lists, the last block of sub-lists, and a middle section again containing a List of sub-lists (and so forth). Because the first and last blocks now contain blocks instead of elements, finding a specific element requires finding the corresponding sub-list in the first or last block, and then retrieving the element in that sub-list. The consequence is that, while elements at the start or end of the list are accessed very quickly, elements at the middle of the collection take longer to retrieve (for a large collection or small block size), but still O(log(N)).

### Concatenation

The nice thing about this structure is that splitting and concatenation become nice recursive features. In the case of a split, this involves finding the leaf block containing the split, splitting that leaf block, and setting the remainder of the block as the new top-level end block. The sub-block that used to point to the leaf block is split to no longer include the elements from the selected leaf block. The remained is concatenated with the middle section. This happens recursively. Since the amount of nesting levels of the tree is O(log(N)), it follows that the process of splitting is O(log(N)).

A similar process happens for concatenation. For List A and B to be concatenated, the last block of A and first block of B are concatenated. The resulting block is then appended to the middle section of List A, and the middle section of B is then concatenated. Again, this happens recursively for each level, resulting in O(log(N)) for concatenation.

### Reversal

Each block in a List can be reversed without copying the underlying data. Basically, each block has a boolean indicating whether the block elements should be read from left to right, or right to left. To reverse a block, the pointer to the elements remains the same, but the new block has an inverted boolean. Therefore, to reverse an entire List, each block needs to flip its switch. There are approx. log(N) blocks in a List, therefore reversing a List has complexity O(log(N)).

A List can have mixed reversed and non-reversed blocks, which is necessary to keep the same performance when concatenating a non-reversed and a reversed List. In such a case, at most some elements will need to be copied since within a block all elements need to have the same direction. But other blocks can be kept as is.
