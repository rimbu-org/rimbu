import { CollectFun, Eq } from '../../common/mod.ts';

import { Reducer, Stream, type StreamSource } from '../../stream/mod.ts';

/**
 * A Reducer that produces instances of `StreamSource`.
 * @typeparam T - the input element type
 * @typeparam R - the result stream element type
 */
export type Transformer<T, R = T> = Reducer<T, StreamSource<R>>;

export namespace Transformer {
  /**
   * A Reducer that produces instances of `StreamSource.NonEmpty`.
   * @typeparam T - the input element type
   * @typeparam R - the result stream element type
   */
  export type NonEmpty<T, R = T> = Reducer<T, StreamSource.NonEmpty<R>>;

  /**
   * Returns a transformer that produces windows/collections of `windowSize` size, each
   * window starting `skipAmount` of elements after the previous, and optionally collected
   * by a custom reducer.
   * @typeparam T - the input element type
   * @typeparam R - the window type
   * @param windowSize - the amount of elements for each window
   * @param skipAmount - (default: `windowSize`) the amount of elements between the start of each window
   * @param collector - (default: Reducer.toArray()) the reducer to use to convert elements to windows
   * @example
   * ```ts
   * Stream.of(1, 2, 3, 4, 5, 6)
   *   .transform(Transformer.window(3))
   *   .toArray()
   * // => [[1, 2, 3], [4, 5, 6]]
   * ```
   */
  export const window: {
    <T, R>(
      windowSize: number,
      options: {
        skipAmount?: number | undefined;
        collector: Reducer<T, R>;
      }
    ): Transformer<T, R>;
    <T>(
      windowSize: number,
      options?: { skipAmount?: number | undefined; collector?: undefined }
    ): Transformer<T, T[]>;
  } = <T, R>(
    windowSize: number,
    options: {
      skipAmount?: number | undefined;
      collector?: Reducer<T, R> | undefined;
    } = {}
  ) => {
    const {
      skipAmount = windowSize,
      collector = Reducer.toArray() as Reducer<T, R>,
    } = options;

    return Reducer.create<T, Stream<R>, Set<Reducer.Instance<T, R>>>(
      () => new Set(),
      (state, elem, index) => {
        for (const instance of state) {
          if (instance.index >= windowSize || instance.halted) {
            state.delete(instance);
          } else {
            instance.next(elem);
          }
        }

        if (index % skipAmount === 0) {
          const newInstance = collector.compile();
          newInstance.next(elem);
          state.add(newInstance);
        }

        return state;
      },
      (state, _, halted) => {
        if (halted) {
          return Stream.empty<R>();
        }

        return Stream.from(state).collect((instance, _, skip) =>
          instance.index === windowSize ? instance.getOutput() : skip
        );
      }
    );
  };

  /**
   * Returns a transformer that returns only those elements from the input that are different to previous element
   * according to the optionally given `eq` function.
   * @param eq - (default: `Eq.objectIs`) the equality testing function
   * @example
   * ```ts
   * Stream.of(1, 1, 2, 3, 2, 2)
   *   .transform(Transformer.distinctPrevious())
   *   .toArray()
   * // => [1, 2, 3, 2]
   * ```
   */
  export function distinctPrevious<T>(
    options: { eq?: Eq<T> | undefined; negate?: boolean | undefined } = {}
  ): Transformer<T> {
    const { eq = Eq.objectIs, negate = false } = options;
    const token = Symbol();

    return Reducer.create(
      () => token as T | typeof token,
      (state, next) =>
        token === state || eq(state, next) === negate ? next : token,
      (state, _, halted) =>
        halted || token === state ? Stream.empty() : Stream.of(state)
    );
  }

  export function flatMap<T, T2>(
    flatMapFun: (value: T, index: number, halt: () => void) => StreamSource<T2>
  ): Transformer<T, T2> {
    return Reducer.createOutput<T, StreamSource<T2>>(
      () => Stream.empty<T2>(),
      (state, next, index, halt) => flatMapFun(next, index, halt),
      (state, _, halted) => (halted ? Stream.empty() : state)
    );
  }

  export function flatZip<T, T2>(
    flatMapFun: (value: T, index: number, halt: () => void) => StreamSource<T2>
  ): Transformer<T, [T, T2]> {
    return flatMap((value, index, halt) =>
      Stream.from(flatMapFun(value, index, halt)).mapPure((stream) => [
        value,
        stream,
      ])
    );
  }

  export const filter: {
    <T, TF extends T>(
      pred: (value: T, index: number, halt: () => void) => value is TF,
      options?: { negate?: boolean | undefined }
    ): Transformer<T, TF>;
    <T, TF extends T>(
      pred: (value: T, index: number, halt: () => void) => value is TF,
      options: { negate: true }
    ): Transformer<T, Exclude<T, TF>>;
    <T>(
      pred: (value: T, index: number, halt: () => void) => boolean,
      options?: { negate?: boolean | undefined }
    ): Transformer<T>;
  } = <T, TF>(
    pred: (value: T, index: number, halt: () => void) => boolean,
    options: { negate?: boolean | undefined } = {}
  ): Transformer<never> => {
    const { negate = false } = options;

    return flatMap((value, index, halt) =>
      pred(value, index, halt) !== negate ? Stream.of(value) : Stream.empty()
    );
  };

  export function collect<T, R>(
    collectFun: CollectFun<T, R>
  ): Transformer<T, R> {
    return flatMap((value, index, halt) => {
      const result = collectFun(value, index, CollectFun.Skip, halt);

      return CollectFun.Skip === result ? Stream.empty() : Stream.of(result);
    });
  }

  export function intersperse<T>(sep: StreamSource<T>): Transformer<T> {
    return flatMap((value, index) =>
      index === 0 ? Stream.of(value) : Stream.from(sep).append(value)
    );
  }

  export function indicesWhere<T>(
    pred: (value: T) => boolean,
    options: { negate?: boolean | undefined } = {}
  ): Transformer<T, number> {
    const { negate = false } = options;

    return flatMap((value, index) =>
      pred(value) !== negate ? Stream.of(index) : Stream.empty()
    );
  }

  export function indicesOf<T>(
    searchValue: T,
    options: { eq?: Eq<T> | undefined; negate?: boolean | undefined } = {}
  ): Transformer<T, number> {
    const { eq = Eq.objectIs, negate = false } = options;

    return flatMap((value, index) =>
      eq(value, searchValue) !== negate ? Stream.of(index) : Stream.empty()
    );
  }

  export function splitWhere<T, R>(
    pred: (value: T, index: number) => boolean,
    options: {
      negate?: boolean | undefined;
      collector?: Reducer<T, R> | undefined;
    } = {}
  ): Transformer<T, R> {
    const { negate = false, collector = Reducer.toArray() as Reducer<T, R> } =
      options;

    return Reducer.create(
      () => ({ collection: collector.compile(), done: false }),
      (state, nextValue, index) => {
        if (state.done) {
          state.done = false;
          state.collection = collector.compile();
        }

        if (pred(nextValue, index) === negate) {
          state.collection.next(nextValue);
        } else {
          state.done = true;
        }

        return state;
      },
      (state, _, halted) =>
        state.done !== halted
          ? Stream.of(state.collection.getOutput())
          : Stream.empty()
    );
  }

  export function splitOn<T, R>(
    sepElem: T,
    options: {
      eq?: Eq<T> | undefined;
      negate?: boolean | undefined;
      collector?: Reducer<T, R> | undefined;
    } = {}
  ): Transformer<T, R> {
    const {
      eq = Eq.objectIs,
      negate = false,
      collector = Reducer.toArray() as Reducer<T, R>,
    } = options;

    return Reducer.create(
      () => ({ collection: collector.compile(), done: false }),
      (state, nextValue) => {
        if (state.done) {
          state.done = false;
          state.collection = collector.compile();
        }

        if (eq(nextValue, sepElem) === negate) {
          state.collection.next(nextValue);
        } else {
          state.done = true;
        }

        return state;
      },
      (state, _, halted) =>
        state.done !== halted
          ? Stream.of(state.collection.getOutput())
          : Stream.empty()
    );
  }

  export function splitOnSlice<T, R>(
    sepSlice: StreamSource<T>,
    options: {
      eq?: Eq<T> | undefined;
      collector?: Reducer<T, R> | undefined;
    } = {}
  ): Transformer<T, R> {
    const { eq = Eq.objectIs, collector = Reducer.toArray() as Reducer<T, R> } =
      options;

    return Reducer.create<
      T,
      Stream<R>,
      {
        done: boolean;
        instances: Map<Reducer.Instance<T, boolean>, number>;
        buffer: T[];
        result: Reducer.Instance<T, R>;
      }
    >(
      () => ({
        done: false,
        instances: new Map(),
        buffer: [],
        result: collector.compile(),
      }),
      (state, nextValue) => {
        if (state.done) {
          state.result = collector.compile();
          state.done = false;
        }

        for (const [instance, startIndex] of state.instances) {
          instance.next(nextValue);

          if (instance.halted) {
            state.instances.delete(instance);
          }

          if (instance.getOutput()) {
            state.done = true;
            Stream.fromArray(state.buffer, {
              range: { end: [startIndex, false] },
            }).forEachPure(state.result.next);
            state.buffer = [];
            state.instances.clear();
            return state;
          }
        }

        const nextStartsWith = Reducer.startsWithSlice(sepSlice, {
          eq,
        }).compile();
        nextStartsWith.next(nextValue);

        if (nextStartsWith.getOutput()) {
          state.done = true;
          Stream.fromArray(state.buffer).forEachPure(state.result.next);
          state.buffer = [];
          state.instances.clear();
          return state;
        } else if (!nextStartsWith.halted) {
          state.instances.set(nextStartsWith, state.buffer.length);
        }

        if (state.instances.size === 0) {
          state.result.next(nextValue);
        } else {
          state.buffer.push(nextValue);
        }

        return state;
      },
      (state, _, halted) => {
        if (state.done === halted) {
          return Stream.empty();
        }

        if (halted) {
          Stream.fromArray(state.buffer).forEachPure(state.result.next);
          state.buffer = [];
        }

        return Stream.of(state.result.getOutput());
      }
    );
  }
}
