import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op } from '@rimbu/collection-types/types';
import type { StreamSource } from '@rimbu/stream';

import {
	KeyedCollectionBuilderBase,
	KeyedCollectionEmptyBase,
	KeyedCollectionNonEmptyBase,
} from '@rimbu/collection-types/advanced/collection/keyed-base';
import { Stream } from '@rimbu/stream';

export abstract class MapCollectionEmptyBase<
		K,
		V,
		FAM extends MapCollection.Advanced.Family<
			K,
			V
		> = MapCollection.Advanced.Family<K, V>,
		Tp extends Collection.Advanced.Types<
			FAM,
			readonly [K, V]
		> = Collection.Advanced.Types<FAM, readonly [K, V]>,
	>
	extends KeyedCollectionEmptyBase<K, V, FAM, Tp>
	implements
		MapCollection.Advanced.Api<K, V, Tp>,
		Collection.Capability.WithAdd.Api<readonly [K, V], Tp>,
		MapCollection.Capability.WithSet.Api<K, V, Tp>,
		MapCollection.Capability.WithUpdateAt.Api<K, V, Tp>,
		MapCollection.Capability.WithModifyAt.Api<K, V, Tp>
{
	abstract readonly context: MapCollection.Context<FAM>;

	set(key: K, value: V): Tp['_NON_EMPTY'] {
		return this.context.of([key, value] as readonly [K, V]) as Tp['_NON_EMPTY'];
	}

	add(entry: readonly [K, V]): Tp['_NON_EMPTY'] {
		return this.context.of(entry as readonly [K, V]) as Tp['_NON_EMPTY'];
	}

	addAll(entries: StreamSource.NonEmpty<readonly [K, V]>): Tp['_NON_EMPTY'];
	addAll(entries: StreamSource<readonly [K, V]>): Tp['_NORMAL'] {
		return this.context.from(
			entries as StreamSource<readonly [K, V]>,
		) as Tp['_NORMAL'];
	}

	updateAt(): Tp['_NORMAL'] {
		return this;
	}

	updateAtAndReturn(): Op.WithResult<
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

	modifyAt(
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

	recompose(f: any): any {
		return this.context.from(f(Stream.empty<readonly [K, V]>()));
	}
}

export abstract class MapCollectionNonEmptyBase<
		K,
		V,
		FAM extends MapCollection.Advanced.Family<
			K,
			V
		> = MapCollection.Advanced.Family<K, V>,
		Tp extends Collection.Advanced.TypesNonEmpty<
			FAM,
			readonly [K, V]
		> = Collection.Advanced.TypesNonEmpty<FAM, readonly [K, V]>,
	>
	extends KeyedCollectionNonEmptyBase<K, V, FAM, Tp>
	implements MapCollection.Advanced.Api<K, V, Tp> {}

export abstract class MapCollectionBuilderBase<
		K,
		V,
		FAM extends MapCollection.Advanced.Family<
			K,
			V
		> = MapCollection.Advanced.Family<K, V>,
		Tp extends Collection.Advanced.Types<
			FAM,
			readonly [K, V]
		> = Collection.Advanced.Types<FAM, readonly [K, V]>,
	>
	extends KeyedCollectionBuilderBase<K, V, FAM, Tp>
	implements MapCollection.Advanced.BuilderApi<K, V, Tp> {}
