import type {
	ApiMixin,
	Constructor,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op } from '@rimbu/collection-types/types';
import type {
	KeyedCollectionEmptyBase,
	KeyedEmptyMixin,
} from './collection/keyed-base';

export interface MapCollectionEmptyBase<
	K,
	V,
	Tp extends Collection.Advanced.Types<
		KeyedCollection.Advanced.Family<K, V>,
		readonly [K, V]
	>,
> extends KeyedCollectionEmptyBase<K, V, Tp>,
		MapCollection.Capability.WithModifyAtKey.Api<K, V, Tp>,
		MapCollection.Capability.WithSet.Api<K, V, Tp>,
		MapCollection.Capability.WithUpdateAtKey.Api<K, V, Tp> {}

export interface MapCollectionMixin extends KeyedEmptyMixin {
	_API: MapCollectionEmptyBase<this['_K'], this['_V'], this['_TP']>;
}

export function WithMapCollectionEmptyBase<C extends ApiMixin>(
	Base: ApiMixin.Constructor<C>,
): ApiMixin.Constructor<C & MapCollectionMixin>;
export function WithMapCollectionEmptyBase<
	TBase extends Constructor<KeyedCollectionEmptyBase<K, V, Tp>>,
	K,
	V,
	FAM extends KeyedCollection.Advanced.Family<
		K,
		V
	> = KeyedCollection.Advanced.Family<K, V>,
	Tp extends Collection.Advanced.Types<
		FAM,
		readonly [K, V]
	> = Collection.Advanced.Types<FAM, readonly [K, V]>,
>(Base: TBase): TBase & Constructor<MapCollectionEmptyBase<K, V, Tp>> {
	return class extends Base {
		updateAtKey(): Tp['_NORMAL'] {
			return this;
		}

		updateAtKeyAndReturn(): Op.WithResult<
			Tp['_NORMAL'],
			[previous: undefined, current: undefined],
			false
		> {
			return {
				collection: this,
				hasResult: false,
				result: [undefined, undefined],
				hasChanged: false,
			};
		}

		modifyAtKey(
			atKey: K,
			options: {
				ifNew?:
					| { set: V; create?: never }
					| {
							set?: never;
							create: <SKIP extends symbol>(skip: SKIP) => V | typeof skip;
					  };
				ifExists?:
					| { set: V; update?: never }
					| {
							set?: never;
							update: <REMOVE extends symbol>(
								current: V,
								remove: REMOVE,
							) => V | REMOVE;
					  };
			},
		): Tp['_NORMAL'] {
			const { ifNew } = options;
			if (undefined === ifNew) return this;

			const { set, create } = ifNew;
			const token = Symbol();
			const newValue = undefined !== create ? create(token) : set;

			if (token === newValue) return this;

			return this.set(atKey, newValue);
		}

		set(atKey: K, value: V): Tp['_NON_EMPTY'] {
			return this.context.of([atKey, value]);
		}
	};
}
