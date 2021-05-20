# BiMap

A BiMap is a bidirectional Map of keys and values, where each key has exactly one value, and each value has exactly one key. There is a one-to-one mapping between keys and values.

This package exports the following types:

| Name                | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| `BiMap<K, V>`       | a generic `BiMap` between keys of type K and values of type V |
| `HashBiMap<K, V>`   | a `BiMap` implementation where keys and values are hashed     |
| `SortedBiMap<K, V>` | a `BiMap` implementation where keys and values are sorted     |

## Usage

```ts
import { HashBiMap } from '@rimbu/core';

const bimap = HashBiMap.of([1, 'a'], [2, 'b'], [3, 'b']);

console.log(bimap.toString());
// HashBiMap(1 <-> a, 3 <-> b)
```

## Motivation

A BiMap is useful when we need a `Map` in which both the keys and values are unique, and have a one-to-one relation.

Imagine we have a collection of cats, and a collection of toys, where each cat can have at most one toy. Conversely, each toy can belong to at most one cat. We want to keep track of the cat-toy associations.

Assume we have the following cats and toys:

```ts
type Cat = Readonly<{ name: string }>;

const alice = { name: 'Alice' };
const bob = { name: 'Bob' };
const carol = { name: 'Carol' };

type Toy = Readonly<{ description: string }>;

const yarn = { description: 'yarn' };
const ball = { description: 'ball' };
```

Imagine we have a 'normal' Map from Cats to Toys. This would allow us to add the same toy to multiple cats:

```ts
import { HashMap } from '@rimbu/core';

const assignments = HashMap.of([alice, yarn], [bob, yarn]);

console.log(assignments.get(alice));
// { description: 'yarn' }
console.log(assignments.get(bob));
// { description: 'yarn' }
```

This is not what we want. Also, we cannot do a reverse lookup if we want to know who currently has the yarn.

Using a BiMap, we automatically get this functionality:

```ts
import { HashBiMap } from '@rimbu/core';

const assignments = HashBiMap.of([alice, yarn], [bob, yarn]);

console.log(assignments.getValue(alice));
// undefined
console.log(assignments.getValue(bob));
// { description: 'yarn' }
console.log(assignments.getKey(yarn));
// { name: 'Bob' }
```

Here, Alice does not have the yarn since it has later been assigned to Bob. Also, we can query the owner of the yarn, which is Bob. The BiMap structure automatically takes care of removing obsolete assignments.
