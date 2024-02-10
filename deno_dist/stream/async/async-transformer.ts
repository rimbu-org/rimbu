import {
  Eq,
  type AsyncCollectFun,
  type MaybePromise,
  CollectFun,
} from '../../common/mod.ts';
import { Reducer, Stream, type Transformer } from '../../stream/mod.ts';
import {
  AsyncReducer,
  AsyncStream,
  type AsyncStreamSource,
} from '../../stream/async/index.ts';

/**
 * An AsyncReducer that produces instances of `AsyncStreamSource`.
 * @typeparam T - the input element type
 * @typeparam R - the result stream element type
 */
export type AsyncTransformer<T, R = T> = AsyncReducer<T, AsyncStreamSource<R>>;

export namespace AsyncTransformer {
  export type Accept<T, R> = AsyncTransformer<T, R> | Transformer<T, R>;
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
  ) => {
    const {
      skipAmount = windowSize,
      collector = Reducer.toArray() as AsyncReducer.Accept<T, R>,
    } = options;

    return AsyncReducer.create<
      T,
      AsyncStream<R>,
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

  export function filter<T>(
    pred: (value: T, index: number, halt: () => void) => MaybePromise<boolean>,
    options: { negate?: boolean | undefined } = {}
  ): AsyncTransformer<T> {
    const { negate = false } = options;

    return flatMap(async (value, index, halt) =>
      (await pred(value, index, halt)) !== negate
        ? AsyncStream.of(value)
        : AsyncStream.empty()
    );
  }

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

  export function intersperse<T>(
    sep: AsyncStreamSource<T>
  ): AsyncTransformer<T> {
    return flatMap((value, index) =>
      index === 0 ? AsyncStream.of(value) : AsyncStream.from(sep).append(value)
    );
  }

  export function indicesWhere<T>(
    pred: (value: T) => MaybePromise<boolean>,
    options: { negate?: boolean | undefined } = {}
  ): AsyncTransformer<T, number> {
    const { negate = false } = options;

    return flatMap((value, index) =>
      pred(value) !== negate ? AsyncStream.of(index) : AsyncStream.empty()
    );
  }

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
      AsyncStream<R>,
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
