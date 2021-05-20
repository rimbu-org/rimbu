# BiMultiMap

A BiMultiMap is a bidirectional MultiMap of keys and values, where each key-value association also has an inverse value-key association. There is a many-to-many mapping between keys and values.

This package exports the following types:

| Name                     | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `BiMultiMap<K, V>`       | a generic BiMultiMap between keys of type K and values of type V |
| `HashBiMultiMap<K, V>`   | a BiMultiMap implementation where keys and values are hashed     |
| `SortedBiMultiMap<K, V>` | a BiMultiMap implementation where keys and values are sorted     |

<img id="inheritance" class="diagram" />

<script src="core/bimultimap.js"></script>

## Usage

```ts
import { HashBiMultiMap } from '@rimbu/core';

const biMultiMap = HashBiMultiMap.of([1, 'a'], [2, 'b'], [3, 'b']);
console.log(biMultiMap.toString());
// HashBiMultiMap(1 <-> ['a'], 2 <-> ['b'], 3 <-> ['b'])

console.log(biMultiMap.getValues(1).toArray());
// ['a']
console.log(biMultiMap.getKeys('b').toArray());
// [2, 3]
```

## Motivation

Imagine we have a collection of cats, and a collection of badges. Cats can earn badges for certain behavior, and we want to query which badges a cat has, and also which cats have a certain badge.

Assume we have the following cats and toys:

```ts
class Cat {
  constructor(readonly name: string) {}
}
const alice = new Cat('Alice');
const bob = new Cat('Bob');
const carol = new Cat('Carol');

class Badge {
  constructor(readonly description: string) {}
}
const honor = new Badge('honor');
const courage = new Badge('courage');
```

If we use a `normal` MultiMap from Cats to Badges, we can assign badges to cats, and see which badges a certain cat has. But we cannot easily see which cats have a certain badge.

With a 'BiMultiMap` this becomes easy:

```ts
import { HashBiMultiMap } from '@rimbu/core`

const catBadges = HashBiMultiMap.of([alice, honor], [alice, courage], [bob, honor])

console.log(catBadges.getValues(alice).toArray())
// [Badge('honor'), Badge('courage')]

console.log(catBadges.getKeys(honor).toArray())
// [Cat('Alice'), Cat('Bob')]

const newCatBadges = catBadges.removeValue(honor)

console.log(newCatBadges.getValues(alice).toArray())
// [Badge('courage')]
```

We see that removing a Badge from the multimap also automatically ensures that the badge is removed from all cat associations.
