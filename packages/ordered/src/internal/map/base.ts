import type { RMap } from '@rimbu/collection-types';
import type { RMapBase } from '@rimbu/collection-types/advanced/map/base';
import type { SortedMap } from '@rimbu/sorted';
import type { Streamable } from '@rimbu/stream';

import type { Indicator } from '#ordered/common/ordered-indicator';

export interface OrderedMapBase<
	K,
	V,
	Tp extends OrderedMapBase.Types = OrderedMapBase.Types,
> extends RMapBase<K, V, Tp> {}

export namespace OrderedMapBase {
	export interface NonEmpty<
		K,
		V,
		Tp extends OrderedMapBase.Types = OrderedMapBase.Types,
	> extends RMapBase.NonEmpty<K, V, Tp>,
			Streamable.NonEmpty<readonly [K, V]> {}

	export interface Builder<
		K,
		V,
		Tp extends OrderedMapBase.Types = OrderedMapBase.Types,
	> extends RMapBase.Builder<K, V, Tp> {}

	export interface Context<
		UK,
		Tp extends OrderedMapBase.Types = OrderedMapBase.Types,
	> extends RMapBase.Context<UK, Tp> {
		readonly typeTag: 'OrderedMap';

		readonly keyMapContext: RMap.Context<UK>;
		readonly indicatorMapContext: SortedMap.Context<Indicator>;
	}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends RMapBase.Types {
		readonly normal: OrderedMapBase<this['_K'], this['_V']>;
		readonly nonEmpty: OrderedMapBase.NonEmpty<this['_K'], this['_V']>;
		readonly context: OrderedMapBase.Context<this['_K']>;
		readonly builder: OrderedMapBase.Builder<this['_K'], this['_V']>;
		readonly sourceContext: RMap.Context<this['_K']>;
		readonly sourceMap: RMap<this['_K'], this['_V']>;
		readonly sourceMapNonEmpty: RMap.NonEmpty<this['_K'], this['_V']>;
	}
}
