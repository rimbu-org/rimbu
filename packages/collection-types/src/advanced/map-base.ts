import type { AbstractConstructor } from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op } from '@rimbu/collection-types/types';
import type {
	KeyedApiMixin,
	KeyedCollectionEmpty,
} from './collection/keyed-base';

export namespace MapCollectionEmpty {
	export interface ApiBase<
		K,
		V,
		Tp extends Collection.Advanced.Types<
			KeyedCollection.Advanced.Family<K, V>,
			readonly [K, V]
		>,
	> extends MapCollection.Advanced.Api<K, V, Tp>,
			KeyedCollectionEmpty.Base<K, V, Tp>,
			MapCollection.Capability.WithModifyAtKey.Api<K, V, Tp>,
			MapCollection.Capability.WithSet.Api<K, V, Tp>,
			MapCollection.Capability.WithUpdateAtKey.Api<K, V, Tp> {}

	export interface Mixin extends KeyedApiMixin {
		_API: ApiBase<this['_K'], this['_V'], this['_TP']>;
	}

	export function WithMixin<C extends KeyedApiMixin>(
		Base: KeyedApiMixin.AbstractEmptyConstructor<C>,
	): KeyedApiMixin.AbstractEmptyConstructor<C & Mixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<KeyedCollectionEmpty.Base<K, V, Tp>>,
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
	>(Base: TBase): TBase & AbstractConstructor<ApiBase<K, V, Tp>> {
		abstract class Result extends Base {
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
				return this.add([atKey, value]);
			}

			toBuilder(): Tp['_BUILDER'] {
				return this.context.builder();
			}
		}

		return Result;
	}
}
