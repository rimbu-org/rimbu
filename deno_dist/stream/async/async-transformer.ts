import { AsyncOptLazy, AsyncReducer, Eq } from '../../common/mod.ts';
import { AsyncStream, type AsyncStreamSource } from '../../stream/async/index.ts';

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
   * @param skipAmount - (default: `windowSize`) the amount of elements between the start of each window
   * @param collector - (default: Reducer.toArray()) the reducer to use to convert elements to windows
   * @example
   * ```ts
   * await AsyncStream.of(1, 2, 3, 4, 5, 6)
   *   .transform(AsyncTransformer.window(3))
   *   .toArray()
   * // => [[1, 2, 3], [4, 5, 6]]
   * ```
   */
  export const window: {
    <T>(windowSize: number, skipAmount?: number): AsyncTransformer<T, T[]>;
    <T, R>(
      windowSize: number,
      skipAmount?: number,
      collector?: AsyncReducer<T, R>
    ): AsyncTransformer<T, R>;
  } = <T, R>(
    windowSize: number,
    skipAmount = windowSize,
    collector = AsyncReducer.toArray()
  ) => {
    return AsyncReducer.create<
      T,
      AsyncStream<R>,
      Set<{ result: unknown; size: number; halted: boolean; halt: () => void }>
    >(
      () => new Set(),
      async (state, elem, index) => {
        for (const current of state) {
          if (current.size >= windowSize || current.halted) {
            state.delete(current);
          }

          current.result = await collector.next(
            current.result,
            elem,
            current.size,
            current.halt
          );
          current.size++;
        }

        if (index % skipAmount === 0) {
          const newState = {
            result: await AsyncOptLazy.toMaybePromise(collector.init),
            size: 1,
            halted: false,
            halt(): void {
              this.halted = true;
            },
          };

          newState.result = collector.next(
            await AsyncOptLazy.toMaybePromise(collector.init),
            elem,
            0,
            newState.halt
          );

          state.add(newState);
        }

        return state;
      },
      (current) => {
        return AsyncStream.from(current)
          .collect((v, _, skip) =>
            v.size === windowSize
              ? AsyncStream.of<R>(collector.stateToResult(v.result) as any)
              : skip
          )
          .first(AsyncStream.empty());
      }
    );
  };

  /**
   * Returns an async transformer that returns only those elements from the input that are different to previous element
   * according to the optionally given `eq` function.
   * @param eq - (default: `Eq.objectIs`) the equality testing function
   * @example
   * ```ts
   * await AsyncStream.of(1, 1, 2, 3, 2, 2)
   *   .transform(AsyncTransformer.distinctPrevious())
   *   .toArray()
   * // => [1, 2, 3, 2]
   * ```
   */
  export function distinctPrevious<T>(
    eq: Eq<T> = Eq.objectIs
  ): AsyncTransformer<T> {
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
          if (!eq(state[0], state[1])) {
            return AsyncStream.of(state[1]);
          }
        }

        return AsyncStream.empty();
      }
    );
  }
}
