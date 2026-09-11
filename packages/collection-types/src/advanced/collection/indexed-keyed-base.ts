import type { IndexedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/indexed-base';
import type {
	KeyedApiMixin,
	KeyedCollectionEmpty,
} from '@rimbu/collection-types/advanced/collection/keyed-base';
import type { AbstractConstructor } from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedKeyedCollection } from '@rimbu/collection-types/collection/indexed-keyed';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';

import { OptLazy } from '@rimbu/common';

export namespace IndexedKeyedCollectionEmpty {
	export interface Base<
		K,
		V,
		Tp extends Collection.Advanced.Types<
			KeyedCollection.Advanced.Family<K, V>,
			readonly [K, V]
		> = Collection.Advanced.Types<
			KeyedCollection.Advanced.Family<K, V>,
			readonly [K, V]
		>,
	> extends IndexedKeyedCollection.Advanced.Api<K, V, Tp>,
			KeyedCollectionEmpty.Base<K, V, Tp> {}

	export interface IndexedKeyedEmptyMixin extends KeyedApiMixin {
		_API: Base<this['_K'], this['_V'], this['_TP']>;
	}

	export function WithMixin<
		TBase extends AbstractConstructor<
			IndexedCollectionEmpty.Base<readonly [K, V], Tp> &
				KeyedCollectionEmpty.Base<K, V, Tp>
		>,
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
	>(Base: TBase): TBase & AbstractConstructor<Base<K, V, Tp>> {
		abstract class Result extends Base {
			indexOf<O>(_: K, otherwise?: OptLazy<O>): O {
				return OptLazy(otherwise) as O;
			}
		}

		return Result;
	}
}
