import { HashMap } from '@rimbu/hashed/map';
import { MultiSet } from '@rimbu/multiset';

/**
 * A `MultiSet` backed by a `HashMap` count map.
 *
 * This is a {@link MultiSet.Context}, **not** a distinct collection type: the
 * collection type is `MultiSet<T>` whichever backing is chosen, and the backing
 * is fixed by the context. The two historical variants are now two preconfigured
 * contexts.
 *
 * Note that `countMap` is the **generic** `MapCollection<T, number>` on every
 * variant — the concrete `HashMap` backing is an implementation detail, exactly
 * as `BiMap` exposes its delegate maps generically. Use
 * `MultiSet.createContext({ countMapContext })` for any other backing.
 * @example
 * ```ts
 * import { HashMultiSet } from '@rimbu/multiset/hashed';
 *
 * console.log(HashMultiSet.empty<string>().toArray()); // => []
 * console.log(HashMultiSet.of('a', 'b', 'a', 'c').toArray()); // => [ "a", "a", "b", "c" ]
 * console.log(HashMultiSet.of('a', 'a').count('a')); // => 2
 * ```
 */
export const HashMultiSet: MultiSet.Context<any> = MultiSet.createContext({
	countMapContext: HashMap.collectionContext,
});
