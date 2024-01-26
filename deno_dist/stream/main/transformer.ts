import { Eq } from '../../common/mod.ts';

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
        skipAmount?: number;
        collector: Reducer<T, R>;
      }
    ): Transformer<T, R>;
    <T>(windowSize: number, options?: { skipAmount?: number }): Transformer<
      T,
      T[]
    >;
  } = <T, R>(
    windowSize: number,
    options: { skipAmount?: number; collector?: Reducer<T, R> } = {}
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
      (state) => {
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
  export function distinctPrevious<T>(eq: Eq<T> = Eq.objectIs): Transformer<T> {
    return Reducer.create(
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
            return Stream.of(state[0]);
          }
          if (!eq(state[0], state[1])) {
            return Stream.of(state[1]);
          }
        }

        return Stream.empty();
      }
    );
  }
}
