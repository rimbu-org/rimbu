import { MultiSet } from '@rimbu/multiset';
import { SortedMap } from '@rimbu/sorted/map';

/**
 * A `MultiSet` backed by a `SortedMap` count map, so `stream()` and `toArray()`
 * yield values in sorted order.
 *
 * This is a {@link MultiSet.Context}, **not** a distinct collection type: the
 * collection type is `MultiSet<T>` whichever backing is chosen, and the backing
 * is fixed by the context. The two historical variants are now two preconfigured
 * contexts.
 *
 * Note that `countMap` is the **generic** `MapCollection<T, number>` on every
 * variant — the concrete `SortedMap` backing is an implementation detail, exactly
 * as `BiMap` exposes its delegate maps generically. Use
 * `MultiSet.createContext({ countMapContext })` for any other backing.
 * @example
 * ```ts
 * import { SortedMultiSet } from '@rimbu/multiset/sorted';
 *
 * console.log(SortedMultiSet.of('b', 'a', 'a').toArray()); // => [ "a", "a", "b" ]
 * console.log(SortedMultiSet.of('a', 'a').count('a')); // => 2
 * ```
 */
export const SortedMultiSet: MultiSet.Context<any> = MultiSet.createContext({
	countMapContext: SortedMap.collectionContext,
});
