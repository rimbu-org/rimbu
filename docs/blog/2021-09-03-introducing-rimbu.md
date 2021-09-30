---
slug: introducing-rimbu
title: Introducing Rimbu
author: Arvid Nicolaas
author_title: Rimbu Author
author_url: https://github.com/vitoke
author_image_url: https://github.com/vitoke.png
tags: [rimbu, immmutable, collections, typescript]
---

## Immutable collections and tools for TypeScript

A new collection library for TypeScript? Aren't `Array`, `Set`, and `Map` good enough? What about `immutable.js`? Well, I understand you have a lot of questions
my friend. Let me start by describing what Rimbu is all about.

### Immutability: Create safer code

When you start using TypeScript, you are taught it is better to use `const` where possible instead of `let` or `var`. Why is that? Well, mainly because, once you
assign a value with `const`, you cannot change its value. If you want a new value from that value, you will need to write a new `const` and give it a new name:

```ts
const a = 5;
a += 1; // Compiler error!
const b = a + 1; // OK
```

However, this principle breaks down when we use referenced values like `object` or `Array`. When we assign such a value to a `const`, we cannot make it `null`. But we
can change its contents:

```ts
const arr = [1, 2, 3];
arr.length = 0; // this is fine
console.log(arr);
// => []
```

You see that we can certainly change the value even though we use `const`. This breaks the whole story about not being able to change `const` values!

This is where immutable collections and objects come in to save the day. An immutable object, by definition, cannot be changed. Once it's created, its values
will always be the same, no matter what you do to it. Combined with `const`, we have back our sacred principle of not being able to change assigned values.

But, I hear you say, what's the use? How can we add values to immutable collections? Well, it simply the same as the story of adding 1 to a `const` number:

```ts
import { List } from '@rimbu/collections';

const list1 = List.of(1, 2, 3);
const list2 = list1.append(4);

console.log(list2.toString());
// => List(1, 2, 3, 4);
console.log(list1.toString());
// => List(1, 2, 3);
```

In this example you can clearly see that `list2` is a new list with other values than `list1`. Even though we added a value to `list1`, its contents did
not change. This is exactly the benefit of immutability, you never have to worry about values having changed while you were not looking.

### Smart and strong type safety

Rimbu goes to great lenghts to ensure that the compiler will 'understand' what you are trying to do, but still prevent you from making obvious mistakes.
For example, imagine the following:

```ts
import { List } from '@rimbu/collection';
const list1 = List.of(1, 2, 3);
// type of list1: List.NonEmpty<number>
const list2 = list1.append('a'); // error: string is not assignable to number
const list3 = list1.extendType<number | string>().append('a');
// type of list3: List.NonEmpty<number | string>
```

The compiler will rightly prevent you from appending a string to a list of numbers. However, you can still do that without needing to cast using the `extendType` method.
Furthermore, you see that the lists get type `List.NonEmpty` instead of `List`. All Rimbu collections have this type information to indicate whether the compiler can know at
compile time that the collection has at least one value. This allows us to write code that by definition rejects empty collections, and saves us from having to write
checks for empty collections and thinking about how to handle such situations. In particular, it saves us from writing boring tests.

These are just small examples from a plethora of built-in smartness that the Rimbu collections possess.

### Performance: Rimbu collections designed for performance

Because immutable collections are often described as 'copying' data, they are often assumed to be slow. However, there is a principle called 'persistence', which
allows them to actually be really fast. Persistance actually means memory sharing. Rimbu immutable collections will share memory as much as possible as long as no
changes need to be made. The collections only duplicates parts of shared data that are modified. The rest of the data remains shared. This is because the collections
keep their data in block-like structures, comparable to blocks on hard-drives. If some collection uses 50 blocks of data, and one value is changed, chances are that only 2 or 3 blocks need to be copied and changed, while the rest stays the same and shared. In some cases, persistent collections can be faster than mutable collections. For example, reversing a `List` of N elements in Rimbu has complexity O(logM(N)) where M is usually 32, so it is really fast for large collections as well. For a mutable array, the complexity is O(N), and therefore much slower. A similar story goes for memory complexity, however I will probably cover this topic some other time.

### Simplicity

Rimbu is mostly about giving the programmer new powerful tools to write safe and effective programs that are simple. For example, it avoids using advanced functional
programming concepts like Monads, because they make code harder to understand and read.

This is why you will not find an `Option` or `Maybe` type (which are monads). Still, Rimbu provides nearly the same power in all methods that can fail:

```ts
import { List, err } from '@rimbu/core';

const list = List.of(1, 2, 3);

const v1 = list.getAtIndex(1);
// type of v1: number | undefined

const v2 = list.getAtIndex(1, 'not found');
// type of v2: number | 'not found'

const v3 = list.getAtIndex(1, -1); // return -1 if not found
// type of v3: number

const v4 = list.getAtIndex(1, () => 'lazy failure');
// type of v4: number | 'lazy failure'

// err is a function that throws an error when invoked
const v5 = list.getAtIndex(1, err);
// type of v5: number
```

In this way it is not needed to write things like `list.getOption(..).map(..).getOrElse(..)` or `if (list.get(1) === undefined) throw Error()`

### But still, what about `immmutable.js`?

Of course we already have a very nice JavaScript immutable collection library for years, called `immutable.js`. To be honost, I've never used it myself in projects,
but I have read their documentation. The first thing that strikes me, in comparison to Rimbu, is that `immutable.js` is focused firstly on JavaScript and
added types later on. Secondly, it has a few basic collections, like Maps and Sets, but Rimbu has many more (up to `Graphs`). Finally, it has `Records` to
define immutable objects. However, with TypeScript, we can use the compiler to supply deep readonly types that prevent modification of plain objects. In this way
this is a very lightweight and easier to use approach.

### What's to come?

In the coming time, I want to write much more documentation, and I hope to receive feedback on the current state of the library from other users. If there
are requests for other types of collections, I would be willing to implement them and add them to the library.
