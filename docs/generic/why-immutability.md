# Why Immutability

## TL;DR

- Immutable objects make code **easier to read** and **more predictable**.
- Immutable collections require **less mental load** to remember whether methods return a new collection, or modify the existing one.
- Immutable collections are quite **fast and efficient** due to **persistence**, but generally somewhat less performant than mutable collections.
- Immutable collections can, in some cases, be faster and require less extra memory, for example when reversing a List.

## Introduction

If you're a coder like us, you may often find the standard offered collection libraries in programming languages lacking. The standard Arrays, Maps, and Sets do their job, but they seem to be mainly there because, well, all other languages also have it. They seem to be mostly an afterthought.

Most standard libraries focus on mutable collections. Mutability seems easy to understand for beginners. You add something, you add something else, and voila, we're done.

## Benefits against mutable objects

Some languages, like Scala, put a large focus on the immutable collections. The main advantage is the same reason why most programmers these days prefer constant assignments to variable assignments (in TS: `const` vs `let`). A constant assignment with a primitive value makes it easy to reason about the code: you assign something, and that value will always be the same.

Using a constant assignment with a mutable object, e.g. an array, is possible, but it loses a large part of the predictability. Basically it only tells you that the reference won't change, however there's no guarantee about its contents. While often this is no issue, in theory one should always use defensive copying to avoid surprises.

To show this, imagine the following program:

```ts
const myArray = [1, 2, 3];
processElements(myArray);
const element = myArray[1];
```

What can we say about the value of `element`? Actually, surprisingly little. We've passed the array to some `processElements` function that can do anything, including clearing the entire array, or replacing it with completely different values. `element` can therefore also be any value. This holds for any mutable collection library (except for languages like Rust).

Now let's do the same with a Rimbu `List`:

```ts
const myList = List.of(1, 2, 3);
processElements(myList);
const element = myList.get(1);
```

What can we now say about the value of `element`? Well, it will always be 2, no matter what the `processElements` function does, because it can never change the contents of `myList`. Therefore, we can deal with immutable instances in exactly the same predictable way as we usually deal with primitive values.

## Mutable collections have arbitrary immutable methods

Most standard mutable collection libraries seem to partly choose immutability, but in somewhat arbitrary places. A JS array is mutable, however, when we `filter` it, it will not mutate the array, but return a copy containing the filtered elements. `push` will mutate the array, `map` will not, `reverse` will mutate the array, `slice` will not, `sort` will mutate the array, and `splice` will too. The user needs to keep this in mind every time, leading to _mental load_.

So then, why not split this into two "modes":

- `immutable` mode: you can never change content, but you can create new instances with modified content using methods like `map` and `filter`. Methods like `append` will also return a new instance.
- `builder` mode: you can change the content, and will always work on the same instance. You cannot use methods like `map` and `filter`. Methods like `append` will modify the contents of the builder.

This is exactly what Rimbu collections offer: each immutable collection has a corresponding builder that allows content modification, and switching between the modes is made very easy and efficient, meaning that data is only copied when strictly necessary.

## Immutability and performance

_"Isn't it inefficient to copy a complete collection instance just to add one value at the end?"_ This question can arise intuitively when thinking about immutable collections.

It is indeed less efficient than modifying in-place, but Rimbu uses persistence to minimize the data copying, meaning that a large part of the original collection is re-used without copying. I often see code like the following:

```ts
function addItem(items: Item[], newItem: Item): Item[] {
  return [...item, newItem];
}
```

Here, the programmer is careful not to modify the incoming array. However, in memory there are now two copies of the original array. Usually, one of them will be thrown away quite quickly due to garbage collection, but doing this a lot of not so efficient, especially for large arrays.

The immutable `List` offers the standard `append` method for this:

```ts
function addItem(list: List<Item>, newItem: Item): List<Item> {
  return list.append(newItem);
}
```

When the given `list` has many items, most of the original data is not copied but referenced. This is much more efficient than array copying.

Sometimes, immutable collections can be more efficient than expected. For example, one can immutably reverse and array as follows:

```ts
function rev(items: number[]): number[] {
  return [...items].reverse();
}
```

This again creates 2 arrays in memory, of which one is reversed.

With a List we have the `reversed` method: `list.reversed()` which returns a new instance with the items in reversed order. However, it does not copy any elements. Instead, it references the same data but has an internal indicator that the data should be accessed in reverse order. It is a reverse view instead of a reverse copy. This is safe, because we know the original data will never change, nor will the new view.
