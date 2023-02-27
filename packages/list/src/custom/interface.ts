import type { ArrayNonEmpty, Reducer, StringNonEmpty } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

import type { List } from '@rimbu/list';

export interface ListFactory {
  /**
   * Returns the (singleton) empty List for this context with given value type.
   * @typeparam T - the element type
   * @example
   * ```ts
   * List.empty<number>()    // => List<number>
   * List.empty<string>()    // => List<string>
   * ```
   */
  empty<T>(): List<T>;
  /**
   * Returns an immutable set of this type and context, containing the given `values`.
   * @param values - a non-empty array of values
   * @typeparam T - the element type
   * @example
   * ```ts
   * List.of(1, 2, 3).toArray()   // => [1, 2, 3]
   * ```
   */
  of<T>(...values: ArrayNonEmpty<T>): List.NonEmpty<T>;
  /**
   * Returns an immutable set of this collection type and context, containing the given values in `source`.
   * @param sources - a non-empty array of `StreamSource` instances containing values
   * @typeparam T - the element type
   * @example
   * ```ts
   * List.from([1, 2, 3], [4, 5]).toArray()
   * // => [1, 2, 3, 4, 5]
   * ```
   */
  from<T>(
    ...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
  ): List.NonEmpty<T>;
  from<T>(...sources: ArrayNonEmpty<StreamSource<T>>): List<T>;
  /**
   * Returns a List of characters from the given strings in `sources`.
   * @param sources - a non-empty array containing strings
   * @typeparam S - the source string type
   * @example
   * ```ts
   * List.fromString('abc').toArray()   // => ['a', 'b', 'c']
   * ```
   */
  fromString<S extends string>(
    ...sources: ArrayNonEmpty<StringNonEmpty<S>>
  ): List.NonEmpty<string>;
  fromString(...sources: ArrayNonEmpty<string>): List<string>;
  /**
   * Returns, if T is a valid `StreamSource`, the result of concatenating all
   * streamable elements of the given sources.
   * @param source - a `StreamSource` containing `StreamSource` instances of values to concatenate
   * @typeparam T - the element type
   * @example
   * ```ts
   * const m = List.of([1, 2], [3, 4, 5])
   * List.flatten(m).toArray() // => [1, 2, 3, 4, 5]
   * ```
   */
  flatten<T extends StreamSource.NonEmpty<unknown>>(
    source: StreamSource.NonEmpty<T>
  ): T extends StreamSource.NonEmpty<infer S> ? List.NonEmpty<S> : never;
  flatten<T extends StreamSource<unknown>>(
    source: StreamSource<T>
  ): T extends StreamSource<infer S> ? List<S> : never;
  /**
   * Returns an array of Lists, where each list contains the values of the corresponding index of tuple T.
   * @param source - a `StreamSource` containing tuples of type T to unzip
   * @param length - the length of the tuples in type T
   * @typeparam T - the StreamSource tuple element type
   * @typeparam L - the tuple element length
   * @example
   * ```ts
   * const m = List.of([1, 'a'], [2, 'b'])
   * List.unzip(m)  // => [List.NonEmpty<number>, List.NonEmpty<string>]
   * ```
   */
  unzip<T extends readonly unknown[] & { length: L }, L extends number>(
    source: StreamSource.NonEmpty<T>,
    length: L
  ): { [K in keyof T]: List.NonEmpty<T[K]> };
  unzip<T extends readonly unknown[] & { length: L }, L extends number>(
    source: StreamSource<T>,
    length: L
  ): { [K in keyof T]: List<T[K]> };

  /**
   * Returns an empty List Builder based on this context.
   * @typeparam T - the List element type
   * @example
   * ```ts
   * List.builder<number>()   // => List.Builder<number>
   * ```
   */
  builder<T>(): List.Builder<T>;
  /**
   * Returns a `Reducer` that appends received items to a List and returns the List as a result. When a `source` is given,
   * the reducer will first create a List from the source, and then append elements to it.
   * @param source - (optional) an initial source of elements to append to
   * @typeparam T - the element type
   * @example
   * ```ts
   * const someList = List.of(1, 2, 3);
   * const result = Stream.range({ start: 20, amount: 5 }).reduce(List.reducer(someList))
   * result.toArray()   // => [1, 2, 3, 20, 21, 22, 23, 24]
   * ```
   * @note uses a List builder under the hood. If the given `source` is a List in the same context, it will directly call `.toBuilder()`.
   */
  reducer<T>(source?: StreamSource<T>): Reducer<T, List<T>>;
}

export interface ListCreators extends ListFactory {
  /**
   * Returns a new `List.Creators` instance using the provided options.
   * @param options - (optional) an object containing the following properties:
   *  - blockSizeBits - (default: 5) the power of 2 to to `blockSizeBits` to use as block size for all `List` instances that are created from the context.
   *  - contextId - (default: random generated UUID) the unique context identifier
   */
  createContext(options?: List.Context.Options): List.Context;
  /**
   * Returns the default `List.Context` instance.
   */
  defaultContext(): List.Context;
}
