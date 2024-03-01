import { CollectFun, Eq } from '@rimbu/common';

import { Reducer, Stream, type StreamSource } from '@rimbu/stream';

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
   * @param options - (optional) object specifying the following properties<br/>
   * - skipAmount - (default: `windowSize`) the amount of elements between the start of each window
   * - collector - (default: Reducer.toArray()) the reducer to use to convert elements to windows
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
   * @param options:
   * - eq - (default: `Eq.objectIs`) the equality testing function
   * - negate: (default: false) when true will negate the given predicate<br/>
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

  /**
   * Returns a transformer that applies the given flatMap function to each element of the input stream,
   * and concatenates all the resulting resulting streams into one stream.
   * @typeparam T - the input element type
   * @typeparam T2 - the output element type
   * @param flatMapFun - a function that maps each input element to an `StreamSource` or a promise
   * resolving to a `StreamSource`. The function receives three parameters:<br/>
   * - `value`: the current element being processed<br/>
   * - `index`: the index of the current element in the input stream<br/>
   * - `halt`: a function that can be called to halt further processing of the input stream<br/>
   */
  export function flatMap<T, T2>(
    flatMapFun: (value: T, index: number, halt: () => void) => StreamSource<T2>
  ): Transformer<T, T2> {
    return Reducer.createOutput<T, StreamSource<T2>>(
      () => Stream.empty<T2>(),
      (state, next, index, halt) => flatMapFun(next, index, halt),
      (state, _, halted) => (halted ? Stream.empty() : state)
    );
  }

  /**
   * Returns a transformer that applies the given flatMap function to each element of the input stream,
   * and concatenates all the resulting resulting streams into one stream, where each resulting element is tupled
   * with the originating input element.
   * @typeparam T - the input element type
   * @typeparam T2 - the output element type
   * @param flatMapFun - a function that maps each input element to an `StreamSource` or a promise
   * resolving to an `StreamSource`. The function receives three parameters:<br/>
   * - `value`: the current element being processed<br/>
   * - `index`: the index of the current element in the input stream<br/>
   * - `halt`: a function that can be called to halt further processing of the input stream<br/>
   */
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

  /**
   * Returns a transformer that filters elements from the input stream based on the provided predicate function.
   * @typeparam T - the type of elements in the input stream
   * @param pred - a predicate function that determines whether an element should be included in the output stream, receiving:<br/>
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
  ): any => {
    const { negate = false } = options;

    return flatMap<T, T>((value, index, halt) =>
      pred(value, index, halt) !== negate ? Stream.of(value) : Stream.empty()
    );
  };

  /**
   * Returns a `Transformer` instance that converts or filters its input values using given `collectFun` before passing them to the reducer.
   * @param collectFun - a function receiving the following arguments, and returns a new value or `skip` if the value should be skipped:<br/>
   * - `value`: the next value<br/>
   * - `index`: the value index<br/>
   * - `skip`: a token that, when returned, will not add a value to the resulting collection<br/>
   * - `halt`: a function that, when called, ensures no next elements are passed
   * @typeparam T - the input element type
   * @typeparam R - the result element type
   */
  export function collect<T, R>(
    collectFun: CollectFun<T, R>
  ): Transformer<T, R> {
    return flatMap((value, index, halt) => {
      const result = collectFun(value, index, CollectFun.Skip, halt);

      return CollectFun.Skip === result ? Stream.empty() : Stream.of(result);
    });
  }

  /**
   * Returns a `Transfoemr` that inserts the given `sep` stream source elements between each received input element.
   * @param sep - the StreamSource to insert between each received element
   * @typeparam T - the input and output element type
   */
  export function intersperse<T>(sep: StreamSource<T>): Transformer<T> {
    return flatMap((value, index) =>
      index === 0 ? Stream.of(value) : Stream.from(sep).append(value)
    );
  }

  /**
   * Returns a `Transformer` that outputs the index of each received element that satisfies the given predicate.
   * @param pred - a predicate function taking an element
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @typeparam T - the input element type
   */
  export function indicesWhere<T>(
    pred: (value: T) => boolean,
    options: { negate?: boolean | undefined } = {}
  ): Transformer<T, number> {
    const { negate = false } = options;

    return flatMap((value, index) =>
      pred(value) !== negate ? Stream.of(index) : Stream.empty()
    );
  }

  /**
   * Returns a `Transformer` that outputs the index of each received element that is equal to the given `searchValue` value,
   * according to the `eq` equality function.
   * @param searchValue - the value to match input values to
   * @param options - (optional) object specifying the following properties<br/>
   * - eq - (default: `Eq.objectIs`) the equality testing function
   * - negate: (default: false) when true will negate the given predicate
   * @typeparam T - the input element type
   */
  export function indicesOf<T>(
    searchValue: T,
    options: { eq?: Eq<T> | undefined; negate?: boolean | undefined } = {}
  ): Transformer<T, number> {
    const { eq = Eq.objectIs, negate = false } = options;

    return flatMap((value, index) =>
      eq(value, searchValue) !== negate ? Stream.of(index) : Stream.empty()
    );
  }

  /**
   * Returns a `Transformer` that applies the given `pred` function to each received element, and collects the received elements
   * into a `collector` that will be returned as output every time the predicate returns true.
   * @typeparam T - the input element type
   * @typeparam R - the collector result type
   * @param pred - a predicate function taking an element
   * @param options - (optional) object specifying the following properties<br/>
   * - negate: (default: false) when true will negate the given predicate<br/>
   * - collector: (default: Reducer.toArray()) a Reducer that can accept multiple values and reduce them into a single value of type `R`.
   */
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

  /**
   * Returns a `Transformer` that collects the received elements
   * into a `collector` that will be returned as output every time the input matches the given `sepElem` value.
   * @typeparam T - the input element type
   * @typeparam R - the collector result type
   * @param pred - a predicate function taking an element
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

  /**
   * Returns a `Transformer` that collects the received elements
   * into a `collector` that will be returned as output every time the input matches the given `sepSlice` sequence of elements.
   * @typeparam T - the input element type
   * @typeparam R - the collector result type
   * @param pred - a predicate function taking an element
   * @param options - (optional) object specifying the following properties<br/>
   * - eq - (default: `Eq.objectIs`) the equality testing function
   * - collector: (default: Reducer.toArray()) an AsyncReducer that can accept multiple values and reduce them into a single value of type `R`.
   */
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
