# @rimbu/stream

A Stream is an Iterable-like structure that represents a source that can stream values when requested. The source is unspecified, it may be a materialized object (e.g. an Array), or a calculated sequence (e.g. the fibonacci numbers). However, unlike an Iterable, a Stream offers many methods to change the values produced by the Stream, before it is consumed, without the need to `materialize` intermediate instances.

Streams are reusable, and in general, they should always return the same values in the same order (exceptions are randomized streams). This makes them excellent to use as glue between various collection instances.

## Usage

### Create

```ts
import { Stream, Tuple } from '@rimbu/core';

const stream1 = Stream.of(1, 2, 3);
stream1.contains(2);
stream1.first();
const stream2 = Stream.from([1, 2, 3]);
const stream3 = Stream.range({ start: 5, amount: 5 });
const stream4 = Stream.range({ start: 5 });

const fibonacciState = Stream.unfold(Tuple.of(1, 1), ([first, second]) =>
  Tuple.of(second, first + second)
);

const fibonacciStream = fibonacciState.map(Tuple.first);
```

### Modify

```ts
import { Stream } from '@rimbu/core';

const stream1 = Stream.of(1, 2, 3).map((v) => v + 1);
const stream2 = Stream.of(1, 2, 3).filter((v) => v > 1);
const stream3 = Stream.of([1, 2, 3]).flatten();
const stream4 = Stream.of(1, 2, 3).repeat();
```

### Reduce

```ts
import { Stream, Reducer } from '@rimbu/core';

Stream.range({ amount: 10 }).reduce(Reducer.sum);
Stream.range({ amount: 10 }).reduceAll(
  Reducer.sum,
  Reducer.average,
  Reducer.product
);
Stream.range({ start: 0 }).reduceAllStream(
  Reducer.sum,
  Reducer.average,
  Reducer.product
);
```

# Stream

A `Stream` is basically an `Iterable` that satisfies the following contract:

- An iterator produced by the Stream should always return the same values in the same order.

Imagine we have two arrays of numbers, and we want to append the even numbers of the second array to the first one:

```ts
function logic(arr1: number[], arr2: number[]): number[] {
  return arr1.concat(arr2.filter((v) => v % 2 === 0));
}
```

Calling `arr2.filter` creates an intermediate copy of the array that will be immediately thrown away. It becomes even more obvious when we generalize it to an `Iterable`:

```ts
function logic(arr1: number[], source2: Iterable<number>): number[] {
  return arr1.concat([...source2].filter((v) => v % 2 === 0));
}
```

Since Iterables have no overall methods to influence the iterated values, we first need to convert the iterable to an array, and then filter it, producing 2 intermediate copies.

Using a `Stream` we can avoid this problem as follows:

```ts
function logic(arr1: number[], stream: Stream<number>): number[] {
  return arr1.push(...stream.filter((v) => v % 2 === 0));
}
```

Since the `Stream` is Iterable, we can avoid materializing the stream and directly pass it to the array's `push` method. It has a `filter` method that returns a new `Stream` instance without materializing the values.

`Stream` has a very rich interface to manipulate the values it produces, and therefore acts as way to glue various collections together.

## Streamable

Many of the methods in Rimbu collections accept parameters of the `StreamSource` type. This is a flexible type to make it easy for the user to pass various streamable types, and it also makes it possible for the library to decide the most efficient approach based on the provided instance.

For example, `List.concat` accepts one or more `StreamSource` instances. Any type that can be converted to a `Stream` satisfies this, including arrays, and in some cases strings.

For example, the following are all valid:

```ts
List.of(1, 2, 3).concat([4, 5, 6]);
// => List(1, 2, 3, 4, 5, 6)

List.from('abc').concat('def');
// => List("a", "b", "c", "d", "e", "f")

List.of(1, 2, 3).concat(List.of(4, 5, 6));
// => List(1, 2, 3, 4, 5, 6)

List.of(1, 2, 3).concat(new Set([4, 5, 6]));
// => List(1, 2, 3, 4, 5, 6)
```
