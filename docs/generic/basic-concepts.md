# Basic concepts of immutable Rimbu collections

## TL;DR

- Constructing instances can be done with the **constructor methods** exposed by each collection namespace
  - e.g. `List.empty<number>()` and `HashMap.of([1, 'a'], [2, 'b'])`
- When "**changing**" an immutable instance, the resulting **reference needs to be stored**, otherwise the result is lost
  - e.g. `const newList = oldList.append(4).prepend(3)`
- Each collection type has a `.NonEmpty` type associated with it. These instances are **guaranteed** to have at least 1 value.
  - NonEmpty collections have a **simpler API**.
  - NonEmpty types as function arguments remove the need to **check for emptiness**.
- Each immutable collection has a corresponding mutable `Builder` that can be used to perform bulk changes with more performance when needed.
- All methods that can 'fail' like `List.get(index)` offer a choice of **Error Mode**:
  - `List.get(10)` returns undefined if the index is out of bounds
  - `List.get(10, Err)` throws an error if the index is out of bounds
  - `List.get(10, 4)` returns 4 if ths index is out of bounds
  - `List.get(10, () => computeLargePrime())` returns the result from the given function if the index is out of bounds

## Introduction

This section describes some basic concepts of Rimbu immutable collections that ares shared amongst all types of collections. Knowing these basics enables a quick start in using the collections in the right way.

## Constructing instances

Because immutable collection instances, naturally, can't be mutated, each instance needs to be constructed from the data it contains. Every collection exposes a number of constructor methods. They are attached to the collection's namespace.

### Empty instances

To create an empty instance, one can use the `.empty()` method:

```ts
import { List, HashMap } from '@rimbu/core';

// create an empty List of numbers
const list1 = List.empty<number>();

// create an empty List of strings
const list2 = List.empty<string>();

// create an empty HashMap with keys of type number, and values of type string
const map1 = HashMap.empty<number, string>();

// create an empty HashMap with keys of type string, and values of type boolean
const map2 = HashMap.empty<string, boolean>();
```

### Instances with given values

To create an instance with immediately given values, the collections offer the `.of(...)` method:

```ts
import { List, HashMap } from '@rimbu/core';

// Create a List with given number values
const list1 = List.of(1, 2, 3);

// Create a List with given string values
const list2 = List.of('a', 'b', 'c');

// Create a HashMap with given key-value entries
const map1 = HashMap.of([1, 'a'], [2, 'b']);

// Create a HashMap with given key-value entries
const map2 = HashMap.of(['a', true], ['b', false]);
```

### Instances from other sources

It is also possible to create collections from other `Iterable` sources, like Arrays, Streams, or even other collection instances. The `.from(...)` constructor method does this:

```ts
import { List, HashSet } from '@rimbu/core';

const array = [1, 2];

// Create a List with the elements from the array
const list1 = List.from(array);

// Create a List with the elements from the array, three times
const list2 = List.from(array, array, array);

// Convert the last list to a HashSet
const set = HashSet.from(list2);
```

### Collection Builders

Every method of an immutable collection instance that modifies the content will return a new instance (if it actually modified the content). While it is easy to chain methods, this may not always be the most efficient.

When it does not suffice to use the methods above, or if they would lead to many intermediate instances, it is possible to use Builders to create mutable instances. A Builder is a mutable collection instance that can be converted to an immutable instance.

```ts
import { List } from '@rimbu/core';

// Create a mutable List builder
const lb = List.builder<number>();

// Manipulate the builder
for (let i = 0; i < 20; i++) {
  if (i % 2 === 0) lb.append(i);
  else lb.prepend(i);
}

// Create an immutable instance with the builder's contents
const list = lb.build();
```

It's also possible to easily convert to and from a builder for each collection, as the following code demonstrates for a `List`:

```ts
import { List, Stream } from '@rimbu/core';

const list = List.from(Stream.range{ amount: 10 });
const builder = list.toBuilder();

for (let i = 0; i < 20; i++) {
  builder.insert(i, i);
}

const list2 = builder.build();
```

In this way, it is always possible to choose the mode that is the best fit for a specific situation.

## Changing immutable instances

Every collection offers basic methods to manipulate or process the contained data. Keep in mind that it is never possible to change the data in the collection, as the following example illustrates:

```ts
import { List } from '@rimbu/core';

const list = List.of(1, 2, 3);
console.log(list.toString());
// List(1, 2, 3)

// Remove the item at index 1
list.remove(1);

console.log(list.toString());
// => List(1, 2, 3)
// the item is still there!

// we need to assign the result to a new variable
const list2 = list.remove(1);

console.log(list2.toString());
// => List(1, 3)
```

When changing immutable instances, Rimbu takes care to do the minimum amount of work possible. For example, if an operation does not actually change the data, often a reference to the same instance is returned. The can also help to determine if an operation actually changed anything.

```ts
import { HashSet } from '@rimbu/core';

const set1 = HashSet.of(1, 2, 3);
// add an element that was already present
const set2 = set1.add(2);
console.log(set1 === set2);
// => true
// the object references are equal

// how can we easily determine if the element to remove was present?
const set3 = set1.remove(5);

// answer: check the result object equality
if (set3 === set1) console.log('nothing changed');
else console.log('element was removed');
// => logs 'nothing changed'
```

## Non-emptiness

When creating immutable instances with given elements, the compiler will indicate through its type that the collection is inferred to be non-empty:

```ts
import { List } from '@rimbu/core';

const list = List.of(1, 2, 3);
// type of list: List.NonEmpty<number>
```

This has an impact on the methods that the instance offers. Certain methods will require less checking or exception values, for example:

```ts
import { List } from '@rimbu/core';

const list = List.of(1, 2, 3);
const list2 = list as List<number>;

const f1 = list.first();
// type is number
const f2 = list2.first();
// type is number | undefined
const f3 = list2.first(0);
// type is number
list.first(0);
// compiler error! cannot provide fallback value because first cannot fail
```

### Less checking

Having non-empty types also makes it easier to create functions that no longer need to check whether their arguments are empty:

```ts
import { List } from '@rimbu/core';

// old way
function exec1(list: List<number>): number {
  // need to check for emptiness
  if (list.isEmpty) throw Error('cannot handle empty list');

  // need to provide fallback values
  return (list.first(0) + list.last(0)) / 2;
}

// better way
function exec2(list: List.NonEmpty<number>): number {
  // no need to check for emptiness
  // no need to provide fallback values
  return (list.first() + list.last()) / 2;
}

exec1(List.empty<number>());
// throws runtime error

exec2(List.empty<number>());
// gives compiler error
```

### Helping the compiler with .nonEmpty()

It is also possible to use `.nonEmpty()` to have better compiler assistance than `.isEmpty`

```ts
import { List } from '@rimbu/core';

function exec(list: List<number>): number {
  if (list.nonEmpty()) {
    // compiler will now know that the list is a List.NonEmpty<number>
    // thus, no fallback values needed
    return (list.first() + list.last()) / 2;
  }

  // list is empty
  throw Error('should have at least one element');
}
```

## Error modes and fallback values

Many languages and collection libraries offer different Error modes to deal with exceptional conditions. A mode in this case is, for example, when the user tries to get an element that is out of bounds:

- runtime error mode: throw a runtime error
- fallback value mode: return some default or given fallback vaue
- option mode: wrap the result in a monad like `Option` or `Either`

Often such modes result in methods being specified multiple times for each mode, e.g. `Array.getOrError(index)`, `Array.getOrValue(index, fallback)` and `Array.getOption(index)`. Try-catch can also be considered an error mode.

Rimbu offers ways to determine the desired mode on every method call that could benefit from having such modes. Each such method has an optional `otherwise` parameter that can cover each of the given modes.

```ts
import { List, Err } from '@rimbu/core';

const list = List.of(1, 2, 3);

const e1 = list.get(10);
// type of e1: number | undefined
// e1 will receive value undefined

const e2 = list.get(10, Err);
// type of e2: number
// will throw a runtime error

const e3 = list.get(10, 0);
// type of e3: number
// e3 will receive value 0

const e4_1 = list.get(10, () => calculateLargePrime());
// type of e4_1 : number
// e4_1 will receive the result value of the `calculateLargePrime` function

const e4_2 = list.get(1, () => calculateLargePrime());
// type of e4_2 : number
// e4_2 will receive value 2 and not execute the `calculateLargePrime` function

const e5 = list.get(10, 'no value');
// type of e5: number | string
// e5 will receive string 'no value'
```
