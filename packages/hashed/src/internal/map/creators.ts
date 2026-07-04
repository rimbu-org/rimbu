import type { RMapBase } from '@rimbu/collection-types/map/base';
import type { Eq } from '@rimbu/common/eq';
import type { Hasher } from '@rimbu/hashed';
import type { HashMap } from '@rimbu/hashed/map';
import type { List } from '@rimbu/list';

export interface HashMapCreators extends RMapBase.Factory<HashMap.Types> {
	/**
	 * Returns a new `HashMap` context instance based on the given `options`.
	 * @typeparam UK - the upper key type for which the context can create instances
	 * @param options - (optional) an object containing the following properties:
	 * - `hasher` (optional): a `Hasher` instance used to hash map keys
	 * - `eq` (optional): an `Eq` instance used to determine key equality
	 * - `blockSizeBits` (optional): determines the maximum block size as 2^`blockSizeBits`
	 * - `listContext` (optional): the context used to create list instances for collision buckets
	 * @returns a new `HashMap.Context<UK>` configured with the provided options
	 */
	createContext<UK>(options?: {
		hasher?: Hasher<UK>;
		eq?: Eq<UK>;
		blockSizeBits?: number;
		listContext?: List.Context;
	}): HashMap.Context<UK>;
	/**
	 * Returns the default context for HashMaps.
	 * @typeparam UK - the upper key type for which the context can create instances
	 * @returns the default `HashMap.Context<UK>` instance
	 */
	defaultContext<UK>(): HashMap.Context<UK>;
}
