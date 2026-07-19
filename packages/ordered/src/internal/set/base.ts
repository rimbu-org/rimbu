import type { RSetBase } from '@rimbu/collection-types/advanced/set/base';
import type { Streamable } from '@rimbu/stream';

export interface OrderedSetBase<
	T,
	Tp extends OrderedSetBase.Types = OrderedSetBase.Types,
> extends RSetBase<T, Tp> {}

export namespace OrderedSetBase {
	export interface NonEmpty<
		T,
		Tp extends OrderedSetBase.Types = OrderedSetBase.Types,
	> extends RSetBase.NonEmpty<T, Tp>,
			Streamable.NonEmpty<T> {}

	export interface Builder<
		T,
		Tp extends OrderedSetBase.Types = OrderedSetBase.Types,
	> extends RSetBase.Builder<T, Tp> {}

	export interface Context<
		UT,
		Tp extends OrderedSetBase.Types = OrderedSetBase.Types,
	> extends RSetBase.Context<UT, Tp> {
		readonly typeTag: 'OrderedSet';
	}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends RSetBase.Types {
		readonly normal: OrderedSetBase<this['_T']>;
		readonly nonEmpty: OrderedSetBase.NonEmpty<this['_T']>;
		readonly context: OrderedSetBase.Context<this['_T']>;
		readonly builder: OrderedSetBase.Builder<this['_T']>;
	}
}
