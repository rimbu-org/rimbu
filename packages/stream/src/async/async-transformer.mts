import {
  CollectFun,
  Eq,
  type AsyncCollectFun,
  type MaybePromise,
} from '@rimbu/common';
import { Reducer, Stream, type Transformer } from '@rimbu/stream';
import {
  AsyncReducer,
  AsyncStream,
  type AsyncStreamSource,
} from '@rimbu/stream/async';
import { createAsyncState } from '@rimbu/stream/custom';

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
      Set<{ index: number; halted: boolean; state: any }>
    >(
      () => new Set(),
      async (combinedStateSet, elem, index) => {
        for (const reducerState of combinedStateSet) {
          if (reducerState.index >= windowSize || reducerState.halted) {
            combinedStateSet.delete(reducerState);
          } else {
            reducerState.state = await collector.next(
              reducerState.state,
              elem,
              reducerState.index++,
              () => {
                reducerState.halted = true;
              }
            );
          }
        }

        if (index % skipAmount === 0) {
          const initState = await createAsyncState(
            { index: 0, halted: false },
            async (baseState) => ({
              state: await collector.init(() => {
                baseState.halted = true;
              }),
            })
          );
          combinedStateSet.add(initState);
          if (!initState.halted) {
            initState.state = await collector.next(
              initState.state,
              elem,
              initState.index++,
              () => {
                initState.halted = true;
              }
            );
          }
        }

        return combinedStateSet;
      },
      async (combinedStateSet, _, halted) => {
        if (halted) {
          return AsyncStream.empty<R>();
        }

        return AsyncStream.from(combinedStateSet).collect(
          (reducerState, _, skip) =>
            reducerState.index === windowSize
              ? collector.stateToResult(
                  reducerState.state,
                  reducerState.index,
                  reducerState.halted
                )
              : skip
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

    return AsyncReducer.create(
      async (initHalt) => ({
        sliceState: await collector.init(initHalt),
        sliceIndex: 0,
        sliceDone: false,
      }),
      async (combinedState, nextValue, index, halt) => {
        if (combinedState.sliceDone) {
          combinedState.sliceDone = false;
          combinedState.sliceState = await collector.init(halt);
          combinedState.sliceIndex = 0;
        }

        if ((await pred(nextValue, index)) === negate) {
          combinedState.sliceState = await collector.next(
            combinedState.sliceState,
            nextValue,
            combinedState.sliceIndex++,
            halt
          );
        } else {
          combinedState.sliceDone = true;
        }

        return combinedState;
      },
      (combinedState, _, halted) =>
        combinedState.sliceDone !== halted
          ? AsyncStream.of(
              collector.stateToResult(
                combinedState.sliceState,
                combinedState.sliceIndex,
                combinedState.sliceDone
              )
            )
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

    return AsyncReducer.create(
      async (initHalt) => ({
        sliceState: await collector.init(initHalt),
        sliceIndex: 0,
        sliceDone: false,
      }),
      async (combinedState, nextValue, _, halt) => {
        if (combinedState.sliceDone) {
          combinedState.sliceDone = false;
          combinedState.sliceState = await collector.init(halt);
          combinedState.sliceIndex = 0;
        }

        if (eq(nextValue, sepElem) === negate) {
          combinedState.sliceState = await collector.next(
            combinedState.sliceState,
            nextValue,
            combinedState.sliceIndex++,
            halt
          );
        } else {
          combinedState.sliceDone = true;
        }

        return combinedState;
      },
      (combinedState, _, halted) =>
        combinedState.sliceDone !== halted
          ? AsyncStream.of(
              collector.stateToResult(
                combinedState.sliceState,
                combinedState.sliceIndex,
                combinedState.sliceDone
              )
            )
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

    const nextStartsWithReducer = AsyncReducer.startsWithSlice(sepSlice, {
      eq,
    });

    return AsyncReducer.create<
      T,
      AsyncStreamSource<R>,
      {
        done: boolean;
        nextStartsWithStates: Map<
          { index: number; halted: boolean; state: any },
          number
        >;
        buffer: T[];
        collectorState: { index: number; halted: boolean; state: any };
      }
    >(
      async () => {
        const collectorState = await createAsyncState(
          { index: 0, halted: false },
          async (baseState) => ({
            state: await collector.init(() => {
              baseState.halted = true;
            }),
          })
        );

        return {
          done: false,
          nextStartsWithStates: new Map(),
          buffer: [],
          collectorState,
        };
      },
      async (combinedState, nextValue) => {
        if (combinedState.done) {
          const collectorState = await createAsyncState(
            { index: 0, halted: false },
            async (baseState) => ({
              state: await collector.init(() => {
                baseState.halted = true;
              }),
            })
          );
          combinedState.collectorState = collectorState;
          combinedState.done = false;
        }

        const { nextStartsWithStates } = combinedState;

        for (const [nextStartsWithState, startIndex] of nextStartsWithStates) {
          nextStartsWithState.state = await nextStartsWithReducer.next(
            nextStartsWithState.state,
            nextValue,
            nextStartsWithState.index++,
            () => {
              nextStartsWithState.halted = true;
            }
          );

          if (nextStartsWithState.halted) {
            nextStartsWithStates.delete(nextStartsWithState);
          }

          if (
            await nextStartsWithReducer.stateToResult(
              nextStartsWithState.state,
              nextStartsWithState.index,
              nextStartsWithState.halted
            )
          ) {
            combinedState.done = true;
            const { collectorState } = combinedState;

            await AsyncStream.from(
              Stream.fromArray(combinedState.buffer, {
                range: { end: [startIndex, false] },
              })
            ).forEach(async (item, _, halt) => {
              collectorState.state = await collector.next(
                collectorState.state,
                item,
                collectorState.index++,
                () => {
                  collectorState.halted = true;
                  halt();
                }
              );
            });

            combinedState.buffer = [];
            nextStartsWithStates.clear();
            return combinedState;
          }
        }

        const nextStartsWithReducerState = await createAsyncState(
          {
            index: 0,
            halted: false,
          },
          async (baseState) => ({
            state: await nextStartsWithReducer.init(() => {
              baseState.halted = true;
            }),
          })
        );

        if (!nextStartsWithReducerState.halted) {
          nextStartsWithReducerState.state = await nextStartsWithReducer.next(
            nextStartsWithReducerState.state,
            nextValue,
            nextStartsWithReducerState.index++,
            () => {
              nextStartsWithReducerState.halted = true;
            }
          );
        }

        if (
          await nextStartsWithReducer.stateToResult(
            nextStartsWithReducerState.state,
            nextStartsWithReducerState.index,
            nextStartsWithReducerState.halted
          )
        ) {
          combinedState.done = true;
          const { collectorState } = combinedState;

          await AsyncStream.from(combinedState.buffer).forEach(
            async (item, _, halt) => {
              if (collectorState.halted) {
                halt();
                return;
              }
              collectorState.state = await nextStartsWithReducer.next(
                collectorState.state,
                item,
                collectorState.index++,
                () => {
                  collectorState.halted = true;
                  halt();
                }
              );
            }
          );

          combinedState.buffer = [];
          nextStartsWithStates.clear();
          return combinedState;
        } else if (!nextStartsWithReducerState.halted) {
          nextStartsWithStates.set(
            nextStartsWithReducerState,
            combinedState.buffer.length
          );
        }

        if (nextStartsWithStates.size === 0) {
          const { collectorState } = combinedState;
          collectorState.state = await collector.next(
            collectorState.state,
            nextValue,
            collectorState.index++,
            () => {
              collectorState.halted = true;
            }
          );
        } else {
          combinedState.buffer.push(nextValue);
        }

        return combinedState;
      },
      async (combinedState, _, halted) => {
        if (combinedState.done === halted) {
          return AsyncStream.empty();
        }

        const { collectorState } = combinedState;

        if (halted) {
          await AsyncStream.from(combinedState.buffer).forEach(
            async (item, _, halt) => {
              if (collectorState.halted) {
                halt();
                return;
              }
              collectorState.state = await collector.next(
                collectorState.state,
                item,
                collectorState.index++,
                () => {
                  collectorState.halted = true;
                  halt();
                }
              );
            }
          );
          combinedState.buffer = [];
        }

        return AsyncStream.of(
          collector.stateToResult(
            collectorState.state,
            collectorState.index,
            collectorState.halted
          )
        );
      }
    );
  }
}
