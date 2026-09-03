import type {
	ApiMixin,
	CollectionEmptyBase,
	Constructor,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { Op } from '@rimbu/collection-types/types';

import { OptLazy } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

export class KeyedCollectionContextBase<
	UK,
	UV,
	FAM extends KeyedCollection.Advanced.Family<UK, UV>,
> implements KeyedCollection.Advanced.KeyedContextApi<FAM>
{
	constructor(readonly collectionContext: FAM['_CONTEXT']) {}

	get empty(): <
		K extends FAM['_UPPER_K'],
		V extends FAM['_UPPER_V'],
	>() => Collection.Advanced.Types<FAM, readonly [K, V]>['_NORMAL'] {
		return this.collectionContext.empty as any;
	}

	get of(): <K extends FAM['_UPPER_K'], V extends FAM['_UPPER_V']>(
		...entries: readonly [K, V][]
	) => Collection.Advanced.Types<FAM, readonly [K, V]>['_NON_EMPTY'] {
		return this.collectionContext.of as any;
	}

	get from(): <K extends FAM['_UPPER_K'], V extends FAM['_UPPER_V']>(
		source: StreamSource<readonly [K, V]>,
	) => Collection.Advanced.Types<FAM, readonly [K, V]>['_NON_EMPTY'] {
		return this.collectionContext.from as any;
	}

	get builder(): <
		K extends FAM['_UPPER_K'],
		V extends FAM['_UPPER_V'],
	>() => Collection.Advanced.Types<FAM, readonly [K, V]>['_BUILDER'] {
		return this.collectionContext.builder as any;
	}
}

export interface KeyedCollectionEmptyBase<
	K,
	V,
	Tp extends Collection.Advanced.Types<
		KeyedCollection.Advanced.Family<K, V>,
		readonly [K, V]
	>,
> extends KeyedCollection.Advanced.Api<K, V, Tp>,
		Collection.Capability.WithAdd.Api<readonly [K, V], Tp>,
		KeyedCollection.Capability.WithRemove.Api<K, V, Tp>,
		KeyedCollection.Capability.WithMapValues.Api<K, V, Tp>,
		KeyedCollection.Capability.WithFlatMap.Api<K, V, Tp>,
		KeyedCollection.Capability.WithMap.Api<K, V, Tp>,
		KeyedCollection.Capability.WithRecompose.Api<K, V, Tp> {}

export interface KeyedEmptyMixin extends ApiMixin {
	_K: this['_E'][0];
	_V: this['_E'][1];

	_E: readonly [unknown, unknown];
	_TP: Collection.Advanced.Types<
		KeyedCollection.Advanced.Family<this['_K'], this['_V']>,
		this['_E']
	>;

	_API: KeyedCollectionEmptyBase<this['_K'], this['_V'], this['_TP']>;
}

export function WithKeyedCollectionEmptyBase<C extends ApiMixin>(
	Base: ApiMixin.Constructor<C>,
): ApiMixin.Constructor<C & KeyedEmptyMixin>;
export function WithKeyedCollectionEmptyBase<
	TBase extends Constructor<CollectionEmptyBase<readonly [K, V], FAM, Tp>>,
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
>(Base: TBase): TBase & Constructor<KeyedCollectionEmptyBase<K, V, Tp>> {
	return class extends Base {
		get add() {
			return this.context.of;
		}

		get addAll() {
			return this.context.from;
		}

		get<UK, O>(_: UK, otherwise?: OptLazy<O>): O {
			return OptLazy(otherwise) as O;
		}

		has(): false {
			return false;
		}

		streamKeys(): Stream.NonEmpty<K> {
			return Stream.empty() as any;
		}

		streamValues(): Stream.NonEmpty<V> {
			return Stream.empty() as any;
		}

		removeKey(): this {
			return this;
		}

		removeKeys(): this {
			return this;
		}

		removeKeyAndReturn<UK, O>(
			_: UK,
			otherwise?: OptLazy<O>,
		): Op.WithResult<this, O, false> {
			return {
				collection: this,
				hasResult: false,
				result: OptLazy(otherwise) as O,
				hasChanged: false,
			};
		}

		map<K2, V2>(): Collection.Advanced.ReTyped<Tp, readonly [K2, V2]>['_SELF'] {
			return this as any;
		}

		mapIndexed<K2, V2>(): Collection.Advanced.ReTyped<
			Tp,
			readonly [K2, V2]
		>['_NORMAL'] {
			return this as any;
		}

		flatMap(): this {
			return this;
		}

		flatMapIndexed(): this {
			return this;
		}

		mapValues<V2>(): Collection.Advanced.ReTyped<
			Tp,
			readonly [K, V2]
		>['_NORMAL'] {
			return this as any;
		}

		recompose(): Collection.Advanced.FamToTypes<
			FAM,
			readonly [unknown, unknown]
		>['_NORMAL'] {
			return this;
		}
	};
}
