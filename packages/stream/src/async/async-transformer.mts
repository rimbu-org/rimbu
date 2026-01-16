import {
  Eq,
  type AsyncCollectFun,
  type MaybePromise,
  CollectFun,
} from '@rimbu/common';

import { Reducer, Stream, type Transformer } from '../main/index.mjs';
import { AsyncReducer, AsyncStream, type AsyncStreamSource } from './index.mjs';

/**
 * An AsyncReducer that produces instances of `AsyncStreamSource`.
 * @typeparam T - the input element type
 * @typeparam R - the result stream element type
 */
export type AsyncTransformer<T, R = T> = AsyncReducer<T, AsyncStreamSource<R>>;

export namespace AsyncTransformer {
  /**
   * Convenience type to allow synchronous transformers to be supplied to functions that accept async transformers.
   * @typeparam T - the input type
   * @typeparam R - the output stream type
   */
  export type Accept<T, R> = AsyncTransformer<T, R> | Transformer<T, R>;

  /**
   * Convenience type to allow non-empty synchronous transformers to be supplied to functions that accept non-empty async transformers.
   * @typeparam T - the input type
   * @typeparam R - the output stream type
   */
  export type AcceptNonEmpty<T, R> =
    | AsyncTransformer.NonEmpty<T, R>
    | Transformer.NonEmpty<T, R>;

  /**
   * An AsyncReducer that produces instances `AsyncStreamSource.NonEmpty`.
   * @typeparam T - the input element type
   * @typeparam R - the result stream element type
   */
  export type NonEmpty<T, R = T> = AsyncReducer<
    T,
    AsyncStreamSource.NonEmpty<R>
  >;

  /**
   * Returns an AsyncTransformer based on a given synchronous or asynchronous transformer.
   * @param transformer - the transformer to convert
   * @typeparam T - the input element type
   * @typeparam R - the result stream element type
   */
  export function from<T, R>(
    transformer: AsyncTransformer.Accept<T, R>
  ): AsyncTransformer<T, R> {
    return AsyncReducer.from(transformer);
  }

  /**
   * Returns an async transformer that produces windows/collections of `windowSize` size, each
   * window starting `skipAmount` of elements after the previous, and optionally collected
   * by a custom reducer.
   * @typeparam T - the input element type
   * @typeparam R - the window type
   * @param windowSize - the amount of elements for each window
   * @param options - (optional) object specifying the following properties<br/>
   * - skipAmount: (default: `windowSize`) the amount of elements between the start of each window<br/>
   * - collector: (default: Reducer.toArray()) the reducer to use to convert elements to windows
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3, 4, 5, 6)
   *   .transform(AsyncTransformer.window(3))
   *   .toArray()
   * // => [[1, 2, 3], [4, 5, 6]]
   * ```
   */
  export const window: {
    <T, R>(
      windowSize: number,
      options: {
        skipAmount?: number | undefined;
        collector: AsyncReducer.Accept<T, R>;
      }
    ): AsyncTransformer<T, R>;
    <T>(
      windowSize: number,
      options?: { skipAmount?: number | undefined; collector?: undefined }
    ): AsyncTransformer<T, T[]>;
  } = <T, R>(
    windowSize: number,
    options: {
      skipAmount?: number | undefined;
      collector?: AsyncReducer.Accept<T, R> | undefined;
    } = {}
  ): AsyncTransformer<T, R> => {
    const {
      skipAmount = windowSize,
      collector = Reducer.toArray() as AsyncReducer.Accept<T, R>,
    } = options;

    return AsyncReducer.create<
      T,
      AsyncStreamSource<R>,
      Set<AsyncReducer.Instance<T, R>>
    >(
      () => new Set(),
      async (state, elem, index) => {
        for (const instance of state) {
          if (instance.index >= windowSize || instance.halted) {
            state.delete(instance);
          } else {
            await instance.next(elem);
          }
        }

        if (index % skipAmount === 0) {
          const newInstance = await AsyncReducer.from(collector).compile();
          await newInstance.next(elem);
          state.add(newInstance);
        }

        return state;
      },
      async (state, _, halted) => {
        if (halted) {
          return AsyncStream.empty<R>();
        }

        return AsyncStream.from(state).collect((instance, _, skip) =>
          instance.index === windowSize ? instance.getOutput() : skip
        );
      }
    );
  };

  /**
   * Returns an async transformer that applies the given flatMap function to each element of the input stream,
   * and concatenates all the resulting resulting streams into one stream.
   * @typeparam T - the input element type
   * @typeparam T2 - the output element type
   * @param flatMapFun - a potentially async function that maps each input element to an `AsyncStreamSource`.
   * The function receives three parameters:<br/>
   * - `value`: the current element being processed<br/>
   * - `index`: the index of the current element in the input stream<br/>
   * - `halt`: a function that can be called to halt further processing of the input stream<br/>
   */
  export function flatMap<T, T2>(
    flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<AsyncStreamSource<T2>>
  ): AsyncTransformer<T, T2> {
    return AsyncReducer.createOutput<T, AsyncStreamSource<T2>>(
      () => AsyncStream.empty<T2>(),
      (state, next, index, halt) => flatMapFun(next, index, halt),
      (state, _, halted) => (halted ? AsyncStream.empty() : state)
    );
  }

  /**
   * Returns an async transformer that applies the given flatMap function to each element of the input stream,
   * and concatenates all the resulting resulting streams into one stream, where each resulting element is tupled
   * with the originating input element.
   * @typeparam T - the input element type
   * @typeparam T2 - the output element type
   * @param flatMapFun - a potentially async function that maps each input element to an `AsyncStreamSource`.
   * The function receives three parameters:<br/>
   * - `value`: the current element being processed<br/>
   * - `index`: the index of the current element in the input stream<br/>
   * - `halt`: a function that can be called to halt further processing of the input stream<br/>
   */
  export function flatZip<T, T2>(
    flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => MaybePromise<AsyncStreamSource<T2>>
  ): AsyncTransformer<T, [T, T2]> {
    return flatMap(async (value, index, halt) =>
      AsyncStream.from(await flatMapFun(value, index, halt)).mapPure(
        (stream) => [value, stream]
      )
    );
  }

  /**
   * Returns an async transformer that filters elements from the input stream based on the provided predicate function.
   * @typeparam T - the type of elements in the input stream
   * @param pred - a potentially async predicate function that determines whether an element should be included in the output stream, receiving:<br/>
   * - `value`: the current element being processed<br/>
   * - `index`: the index of the current element in the input stream<br/>
   * - `halt`: a function that can be called to halt further processing of the input stream
   * @param options - (optional) object specifying the following properties:<br/>
   * - negate: (default: false) if true, the predicate will be negated
   * @note if the predicate is a type guard, the return type is automatically inferred
   */
  export const filter: {
    <T, TF extends T>(
      pred: (value: T, index: number, halt: () => void) => value is TF,
      options?: { negate?: false | undefined }
    ): AsyncTransformer<TF>;
    <T, TF extends T>(
      pred: (value: T, index: number, halt: () => void) => value is TF,
      options: { negate: true }
    ): AsyncTransformer<Exclude<T, TF>>;
    <T>(
      pred: (
        value: T,
        index: number,
        halt: () => void
      ) => MaybePromise<boolean>,
      options?: { negate?: boolean | undefined }
    ): AsyncTransformer<T>;
  } = <T, TF>(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>,
    options: { negate?: boolean | undefined } = {}
  ): any => {
    const { negate = false } = options;

    return flatMap<T, T>(async (value, index, halt) =>
      (await pred(value, index, halt)) !== negate
        ? AsyncStream.of(value)
        : AsyncStream.empty()
    );
  };

  /**
   * Returns an `AsyncTransformer` instance that converts or filters its input values using given `collectFun` before passing them to the reducer.
   * @param collectFun - a potentially async function receiving the following arguments, and returns a new value or `skip` if the value should be skipped:<br/>
   * - `value`: the next value<br/>
   * - `index`: the value index<br/>
   * - `skip`: a token that, when returned, will not add a value to the resulting collection<br/>
   * - `halt`: a function that, when called, ensures no next elements are passed
   * @typeparam T - the input element type
   * @typeparam R - the result element type
   */
  export function collect<T, R>(
    collectFun: AsyncCollectFun<T, R>
  ): AsyncTransformer<T, R> {
    return flatMap(async (value, index, halt) => {
      const result = await collectFun(value, index, CollectFun.Skip, halt);

      return CollectFun.Skip === result
        ? AsyncStream.empty()
        : AsyncStream.of(result);
    });
  }

  /**
   * Returns an `AsyncTransformer` that inserts the given `sep` stream source elements between each received input element.
   * @param sep - the async StreamSource to insert between each received element
   * @typeparam T - the input and output element type
   */
  export function intersperse<T>(
    sep: AsyncStreamSource<T>
  ): AsyncTransformer<T> {
    return flatMap((value, index) =>
      index === 0 ? AsyncStream.of(value) : AsyncStream.from(sep).append(value)
    );
  }

  /**
   * Returns an `AsyncTransformer` that outputs the index of each received element that satisfies the given predicate.
   * @param pred - a potentially async predicate function taking an element
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @typeparam T - the input element type
   */
  export function indicesWhere<T>(
    pred: (value: T) => MaybePromise<boolean>,
    options: { negate?: boolean | undefined } = {}
  ): AsyncTransformer<T, number> {
    const { negate = false } = options;

    return flatMap((value, index) =>
      pred(value) !== negate ? AsyncStream.of(index) : AsyncStream.empty()
    );
  }

  /**
   * Returns an `AsyncTransformer` that applies the given `pred` function to each received element, and collects the received elements
   * into a `collector` that will be returned as output every time the predicate returns true.
   * @typeparam T - the input element type
   * @typeparam R - the collector result type
   * @param pred - a potentially async predicate function taking an element
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate<br/>
   * - collector: (default: Reducer.toArray()) an AsyncReducer that can accept multiple values and reduce them into a single value of type `R`.
   */
  export function splitWhere<T, R>(
    pred: (value: T, index: number) => MaybePromise<boolean>,
    options: {
      negate?: boolean | undefined;
      collector?: AsyncReducer.Accept<T, R> | undefined;
    } = {}
  ): AsyncTransformer<T, R> {
    const {
      negate = false,
      collector = Reducer.toArray() as AsyncReducer.Accept<T, R>,
    } = options;

    return AsyncReducer.create<
      T,
      AsyncStreamSource<R>,
      { collection: AsyncReducer.Instance<T, R>; done: boolean }
    >(
      async () => ({
        collection: await AsyncReducer.from(collector).compile(),
        done: false,
      }),
      async (state, nextValue, index) => {
        if (state.done) {
          state.done = false;
          state.collection = await AsyncReducer.from(collector).compile();
        }

        if ((await pred(nextValue, index)) === negate) {
          await state.collection.next(nextValue);
        } else {
          state.done = true;
        }

        return state;
      },
      (state, _, halted) =>
        state.done !== halted
          ? AsyncStream.of(state.collection.getOutput())
          : AsyncStream.empty()
    );
  }

  /**
   * Returns an `AsyncTransformer` that collects the received elements
   * into a `collector` that will be returned as output every time the input matches the given `sepElem` value.
   * @typeparam T - the input element type
   * @typeparam R - the collector result type
   * @param pred - a potentially async predicate function taking an element
   * @param options - (optional) object specifying the following properties<br/>
   * - eq - (default: `Eq.objectIs`) the equality testing function
   * - negate: (default: false) when true will negate the given predicate<br/>
   * - collector: (default: Reducer.toArray()) an AsyncReducer that can accept multiple values and reduce them into a single value of type `R`.
   */
  export function splitOn<T, R>(
    sepElem: T,
    options: {
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
      collector?: AsyncReducer.Accept<T, R> | undefined;
    } = {}
  ): AsyncTransformer<T, R> {
    const {
      eq = Eq.objectIs,
      negate = false,
      collector = Reducer.toArray() as AsyncReducer.Accept<T, R>,
    } = options;

    return AsyncReducer.create<
      T,
      AsyncStreamSource<R>,
      { collection: AsyncReducer.Instance<T, R>; done: boolean }
    >(
      async () => ({
        collection: await AsyncReducer.from(collector).compile(),
        done: false,
      }),
      async (state, nextValue) => {
        if (state.done) {
          state.done = false;
          state.collection = await AsyncReducer.from(collector).compile();
        }

        if (eq(nextValue, sepElem) === negate) {
          await state.collection.next(nextValue);
        } else {
          state.done = true;
        }

        return state;
      },
      (state, _, halted) =>
        state.done !== halted
          ? AsyncStream.of(state.collection.getOutput())
          : AsyncStream.empty()
    );
  }

  /**
   * Returns an `AsyncTransformer` that collects the received elements
   * into a `collector` that will be returned as output every time the input matches the given `sepSlice` sequence of elements.
   * @typeparam T - the input element type
   * @typeparam R - the collector result type
   * @param pred - a potentially async predicate function taking an element
   * @param options - (optional) object specifying the following properties<br/>
   * - eq - (default: `Eq.objectIs`) the equality testing function
   * - collector: (default: Reducer.toArray()) an AsyncReducer that can accept multiple values and reduce them into a single value of type `R`.
   */
  export function splitOnSlice<T, R>(
    sepSlice: AsyncStreamSource<T>,
    options: {
      eq?: Eq<T> | undefined;
      collector?: AsyncReducer.Accept<T, R> | undefined;
    } = {}
  ): AsyncTransformer<T, R> {
    const {
      eq = Eq.objectIs,
      collector = Reducer.toArray() as AsyncReducer.Accept<T, R>,
    } = options;

    return AsyncReducer.create<
      T,
      AsyncStreamSource<R>,
      {
        done: boolean;
        instances: Map<AsyncReducer.Instance<T, boolean>, number>;
        buffer: T[];
        result: AsyncReducer.Instance<T, R>;
      }
    >(
      async () => ({
        done: false,
        instances: new Map(),
        buffer: [],
        result: await AsyncReducer.from(collector).compile(),
      }),
      async (state, nextValue) => {
        if (state.done) {
          state.result = await AsyncReducer.from(collector).compile();
          state.done = false;
        }

        for (const [instance, startIndex] of state.instances) {
          await instance.next(nextValue);

          if (instance.halted) {
            state.instances.delete(instance);
          }

          if (await instance.getOutput()) {
            state.done = true;
            await AsyncStream.from(
              Stream.fromArray(state.buffer, {
                range: { end: [startIndex, false] },
              })
            ).forEachPure(state.result.next);
            state.buffer = [];
            state.instances.clear();
            return state;
          }
        }

        const nextStartsWith = await AsyncReducer.startsWithSlice(sepSlice, {
          eq,
        }).compile();
        await nextStartsWith.next(nextValue);

        if (await nextStartsWith.getOutput()) {
          state.done = true;
          await AsyncStream.from(state.buffer).forEachPure(state.result.next);
          state.buffer = [];
          state.instances.clear();
          return state;
        } else if (!nextStartsWith.halted) {
          state.instances.set(nextStartsWith, state.buffer.length);
        }

        if (state.instances.size === 0) {
          await state.result.next(nextValue);
        } else {
          state.buffer.push(nextValue);
        }

        return state;
      },
      async (state, _, halted) => {
        if (state.done === halted) {
          return AsyncStream.empty();
        }

        if (halted) {
          await AsyncStream.from(state.buffer).forEachPure(state.result.next);
          state.buffer = [];
        }

        return AsyncStream.of(state.result.getOutput());
      }
    );
  }
}
