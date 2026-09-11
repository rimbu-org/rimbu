import type {
	AbstractConstructor,
	ApiMixin,
	CollectionEmpty,
	CollectionNonEmpty,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { Op } from '@rimbu/collection-types/types';

import { first, second } from '@rimbu/base/entry';
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

export interface KeyedApiMixin extends ApiMixin {
	_K: this['_E'][0];
	_V: this['_E'][1];

	_E: readonly [unknown, unknown];
	_TP: Collection.Advanced.Types<
		KeyedCollection.Advanced.Family<this['_K'], this['_V']>,
		this['_E']
	>;
}

export declare namespace KeyedApiMixin {
	export type Apply<
		C extends KeyedApiMixin,
		K,
		V,
		Tp extends Collection.Advanced.TypesBase,
	> = (C & { _E: readonly [K, V]; _TP: Tp })['_API'];

	export interface AbstractEmptyConstructor<C extends KeyedApiMixin> {
		new <
			K,
			V,
			FAM extends KeyedCollection.Advanced.Family<K, V>,
			Tp extends Collection.Advanced.Types<
				FAM,
				readonly [K, V]
			> = Collection.Advanced.Types<FAM, readonly [K, V]>,
		>(
			context: FAM['_CONTEXT'],
		): KeyedCollectionEmpty.Base<K, V, Tp> & KeyedApiMixin.Apply<C, K, V, Tp>;
	}

	export interface AbstractNonEmptyConstructor<C extends KeyedApiMixin> {
		new <
			K,
			V,
			FAM extends KeyedCollection.Advanced.Family<K, V>,
			Tp extends Collection.Advanced.TypesNonEmpty<
				FAM,
				readonly [K, V]
			> = Collection.Advanced.TypesNonEmpty<FAM, readonly [K, V]>,
		>(
			context: FAM['_CONTEXT'],
		): KeyedCollectionNonEmpty.Base<K, V, Tp> &
			KeyedApiMixin.Apply<C, K, V, Tp>;
	}
}

export namespace KeyedCollectionEmpty {
	export interface Base<
		K,
		V,
		Tp extends Collection.Advanced.Types<
			KeyedCollection.Advanced.Family<K, V>,
			readonly [K, V]
		>,
	> extends KeyedCollection.Advanced.Api<K, V, Tp>,
			Collection.Capability.WithAdd.Api<readonly [K, V], Tp>,
			Collection.Capability.WithAddAll.Api<readonly [K, V], Tp>,
			Collection.Capability.WithMutate.Api<readonly [K, V], Tp>,
			KeyedCollection.Capability.WithRemoveKey.Api<K, V, Tp>,
			KeyedCollection.Capability.WithRemoveKeys.Api<K, V, Tp>,
			KeyedCollection.Capability.WithMapValues.Api<K, V, Tp>,
			KeyedCollection.Capability.WithFlatMap.Api<K, V, Tp>,
			KeyedCollection.Capability.WithFlatMapIndexed.Api<K, V, Tp>,
			KeyedCollection.Capability.WithMap.Api<K, V, Tp>,
			KeyedCollection.Capability.WithMapIndexed.Api<K, V, Tp>,
			KeyedCollection.Capability.WithRecompose.Api<K, V, Tp> {}

	export interface Mixin extends KeyedApiMixin {
		_API: Base<this['_K'], this['_V'], this['_TP']>;
	}

	export function WithMixin<C extends ApiMixin>(
		Base: ApiMixin.AbstractEmptyConstructor<C>,
	): KeyedApiMixin.AbstractEmptyConstructor<C & Mixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<
			CollectionEmpty.Base<readonly [K, V], Tp>
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
			get add() {
				return this.context.keyedContext.of;
			}

			get addAll() {
				return this.context.keyedContext.from;
			}

			get<UK, O>(_: UK, otherwise?: OptLazy<O>): O {
				return OptLazy(otherwise) as O;
			}

			has(): false {
				return false;
			}

			streamKeys(): Stream.NonEmpty<K> {
				return Stream.empty<K>() as any;
			}

			streamValues(): Stream.NonEmpty<V> {
				return Stream.empty<V>() as any;
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

			map<K2, V2>(): Collection.Advanced.ReTyped<
				Tp,
				readonly [K2, V2]
			>['_SELF'] {
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
		}

		return Result;
	}
}

export namespace KeyedCollectionNonEmpty {
	export interface Base<
		K,
		V,
		Tp extends Collection.Advanced.TypesNonEmpty<
			KeyedCollection.Advanced.Family<K, V>,
			readonly [K, V]
		>,
	> extends KeyedCollection.Advanced.Api<K, V, Tp>,
			KeyedCollection.Capability.WithRecompose.Api<K, V, Tp> {}

	export function WithMixin<C extends ApiMixin>(
		Base: ApiMixin.AbstractNonEmptyConstructor<C>,
	): KeyedApiMixin.AbstractNonEmptyConstructor<C & KeyedApiMixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<
			CollectionNonEmpty.Base<readonly [K, V], Tp>
		>,
		K,
		V,
		FAM extends KeyedCollection.Advanced.Family<
			K,
			V
		> = KeyedCollection.Advanced.Family<K, V>,
		Tp extends Collection.Advanced.TypesNonEmpty<
			FAM,
			readonly [K, V]
		> = Collection.Advanced.TypesNonEmpty<FAM, readonly [K, V]>,
	>(Base: TBase): TBase & AbstractConstructor<Base<K, V, Tp>> {
		abstract class Result extends Base {
			abstract get<UK, O>(value: UK, otherwise?: OptLazy<O>): V | O;
			abstract toBuilder(): Tp['_BUILDER'];

			has = (value: K): boolean => {
				const notFound = Symbol();
				return notFound !== this.get(value, notFound);
			};

			streamKeys(): Stream.NonEmpty<K> {
				return this.stream().map(first);
			}

			streamValues(): Stream.NonEmpty<V> {
				return this.stream().map(second);
			}

			mutate(f: (builder: Tp['_BUILDER']) => void): Tp['_NORMAL'] {
				const builder = this.toBuilder();
				f(builder);
				return builder.build();
			}

			recompose<K extends Tp['_UPPER_K'], V extends Tp['_UPPER_V']>(
				f: (stream: Tp['_AS_STREAM']) => StreamSource<readonly [K, V]>,
			): Collection.Advanced.ReTyped<Tp, readonly [K, V]>['_NON_EMPTY'] {
				return this.context.keyedContext.from(f(this.stream())) as any;
			}
		}

		return Result;
	}
}
