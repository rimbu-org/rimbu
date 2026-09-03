import type {
	IndexedCollectionEmptyBase,
	IndexedEmptyMixin,
} from '@rimbu/collection-types/advanced/collection/indexed-base';
import type {
	KeyedCollectionEmptyBase,
	KeyedEmptyMixin,
} from '@rimbu/collection-types/advanced/collection/keyed-base';
import type {
	ApiMixin,
	Constructor,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedKeyedCollection } from '@rimbu/collection-types/collection/indexed-keyed';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';

import { OptLazy } from '@rimbu/common';

export interface IndexedKeyedCollectionEmptyBase<
	K,
	V,
	Tp extends Collection.Advanced.Types<
		KeyedCollection.Advanced.Family<K, V>,
		readonly [K, V]
	>,
> extends IndexedKeyedCollection.Advanced.Api<K, V, Tp>,
		KeyedCollectionEmptyBase<K, V, Tp> {}

export interface IndexedKeyedEmptyMixin extends KeyedEmptyMixin {
	_API: IndexedKeyedCollectionEmptyBase<this['_K'], this['_V'], this['_TP']>;
}

export function WithIndexedKeyedCollectionEmptyBase<
	C extends ApiMixin & IndexedEmptyMixin & KeyedEmptyMixin,
>(
	Base: ApiMixin.Constructor<C>,
): ApiMixin.Constructor<C & IndexedKeyedEmptyMixin>;
export function WithIndexedKeyedCollectionEmptyBase<
	TBase extends Constructor<
		IndexedCollectionEmptyBase<readonly [K, V], Tp> &
			KeyedCollectionEmptyBase<K, V, Tp>
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
>(Base: TBase): TBase & Constructor<IndexedKeyedCollectionEmptyBase<K, V, Tp>> {
	return class extends Base {
		indexOf<O>(_: K, otherwise?: OptLazy<O>): O {
			return OptLazy(otherwise) as O;
		}
	};
}
