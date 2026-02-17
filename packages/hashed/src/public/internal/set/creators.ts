import type { RSetBase } from '@rimbu/collection-types/set/base';
import type { Eq } from '@rimbu/common/eq';
import type { Hasher } from '@rimbu/hashed';
import type { HashSet } from '@rimbu/hashed/set';
import type { List } from '@rimbu/list';

export interface HashSetCreators extends RSetBase.Factory<HashSet.Types> {
	/**
	 * Returns a new `HashSet` context instance based on the given `options`.
	 * @typeparam UT - the upper element type for which the context can create instances
	 * @param options - (optional) an object containing the following properties:
	 * - `hasher` (optional): a `Hasher` instance used to hash set values
	 * - `eq` (optional): an `Eq` instance used to determine value equality
	 * - `blockSizeBits` (optional): determines the maximum block size as 2^`blockSizeBits`
	 * - `listContext` (optional): the context used to create list instances for collision buckets
	 * @returns a new `HashSet.Context<UT>` configured with the provided options
	 */
	createContext<UT>(options?: {
		hasher?: Hasher<UT>;
		eq?: Eq<UT>;
		blockSizeBits?: number;
		listContext?: List.Context;
	}): HashSet.Context<UT>;
	/**
	 * Returns the default context for `HashSet`.
	 * @typeparam UT - the upper element type for which the context can create instances
	 * @returns the default `HashSet.Context<UT>` instance
	 */
	defaultContext<UT>(): HashSet.Context<UT>;
}
