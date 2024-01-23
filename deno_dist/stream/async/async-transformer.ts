import { Eq } from '../../common/mod.ts';
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
        skipAmount?: number;
        collector: AsyncReducer<T, R>;
      }
    ): AsyncTransformer<T, R>;
    <T>(
      windowSize: number,
      options?: { skipAmount?: number }
    ): AsyncTransformer<T, T[]>;
  } = <T, R>(
    windowSize: number,
    options: { skipAmount?: number; collector?: AsyncReducer<T, R> } = {}
  ) => {
    const {
      skipAmount = windowSize,
      collector = AsyncReducer.toArray() as AsyncReducer<T, R>,
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
          const newInstance = collector.compile();

          await newInstance.next(elem);

          state.add(newInstance);
        }

        return state;
      },
      async (state) => {
        return AsyncStream.from(state).collect((instance, _, skip) =>
          instance.index === windowSize ? instance.getOutput() : skip
        );
      }
    );
  };

  /**
   * Returns an async transformer that returns only those elements from the input that are different to previous element
   * according to the optionally given `eq` function.
   * @param options - (optional) object specifying the following properties<br/>
   * - eq: (default: `Eq.objectIs`) the `Eq` instance to use to test equality of elements<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * await AsyncStream.of(1, 1, 2, 3, 2, 2)
   *   .transform(AsyncTransformer.distinctPrevious())
   *   .toArray()
   * // => [1, 2, 3, 2]
   * ```
   */
  export function distinctPrevious<T>(
    options: {
      eq?: Eq<T>;
      negate?: boolean;
    } = {}
  ): AsyncTransformer<T> {
    const { eq = Eq.objectIs, negate = false } = options;

    return AsyncReducer.create(
      () => [] as T[],
      (current, elem) => {
        current.push(elem);

        if (current.length > 2) {
          current.shift();
        }

        return current;
      },
      (state) => {
        if (state.length > 0) {
          if (state.length === 1) {
            return AsyncStream.of(state[0]);
          }
          if (eq(state[0], state[1]) === negate) {
            return AsyncStream.of(state[1]);
          }
        }

        return AsyncStream.empty();
      }
    );
  }
}
