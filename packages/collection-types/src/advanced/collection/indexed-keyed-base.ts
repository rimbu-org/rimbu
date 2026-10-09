import type {
	KeyedApiMixin,
	KeyedApiMixinEmpty,
	KeyedApiMixinNonEmpty,
} from '@rimbu/collection-types/advanced/collection/keyed-base';
import type {
	AbstractConstructor,
	CollectionNonEmpty,
} from '@rimbu/collection-types/advanced/collection-base';
import type {
	MapCollectionEmpty,
	MapCollectionNonEmpty,
} from '@rimbu/collection-types/advanced/map-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op } from '@rimbu/collection-types/types';
import type { IndexRange, OptLazy } from '@rimbu/common';

import { OptLazy as OptLazyValue } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

/**
 * Keyed counterpart of `IndexedCollectionEmpty`.
 *
 * The set-oriented empty mixins are generic over the element type `E`, and their
 * leading overloads only accept `ApiMixin.AbstractEmptyConstructor`. A keyed
 * collection — whose "element" is always `readonly [K, V]` and whose context
 * additionally requires `keyedContext` — cannot be wrapped by those overloads.
 * This namespace supplies a keyed-aware entry point so a map can compose the
 * indexed collection capabilities (without the sorted ones) on top of its
 * keyed-map base.
 *
 * Used by insertion-ordered maps, where positional order comes from an internal
 * indicator map rather than a user comparator; a sorted-keyed map should use
 * {@link IndexedKeyedSortedCollectionEmpty} instead.
 */
export namespace IndexedKeyedCollectionEmpty {
	export interface Base<
		K,
		V,
		Tp extends Collection.Advanced.Types<
			KeyedCollection.Advanced.FamilyBase<K, V>,
			readonly [K, V]
		>,
	> extends MapCollectionEmpty.ApiBase<K, V, Tp>,
			IndexedCollection.Advanced.Api<readonly [K, V], Tp>,
			IndexedCollection.Capability.WithPrependAppend.Api<readonly [K, V], Tp>,
			IndexedCollection.Capability.WithRemoveAt.Api<readonly [K, V], Tp>,
			IndexedCollection.Capability.WithSwapAt.Api<readonly [K, V], Tp> {}

	export interface Mixin extends KeyedApiMixinEmpty {
		_API: Base<this['_K'], this['_V'], this['_TP']>;
	}

	export function WithMixin<C extends KeyedApiMixin>(
		Base: KeyedApiMixin.AbstractEmptyConstructor<C>,
	): KeyedApiMixin.AbstractEmptyConstructor<C & Mixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<MapCollectionEmpty.ApiBase<K, V, Tp>>,
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
			streamSlice(): Stream<readonly [K, V]> {
				return Stream.empty();
			}

			at<O>(_index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
				return OptLazyValue(otherwise) as O;
			}

			first<O>(otherwise?: OptLazy<O>): O {
				return OptLazyValue(otherwise) as O;
			}

			last<O>(otherwise?: OptLazy<O>): O {
				return OptLazyValue(otherwise) as O;
			}

			take(): this {
				return this;
			}

			drop(): this {
				return this;
			}

			prepend(element: readonly [K, V]): FAM['_NON_EMPTY'] {
				return this.context.of(element);
			}

			append(element: readonly [K, V]): FAM['_NON_EMPTY'] {
				return this.context.of(element);
			}

			removeAt(): this {
				return this;
			}

			removeAtAndReturn(): Op.WithResult<Tp['_NORMAL'], Tp['_NORMAL'], false> {
				return {
					collection: this,
					hasResult: false,
					result: this,
					hasChanged: false,
				};
			}

			swapAt(): this {
				return this;
			}

			swapAtAndReturn(): Op.WithResult<
				Tp['_NORMAL'],
				[previous1: undefined, previous2: undefined],
				false
			> {
				return {
					collection: this,
					hasResult: false,
					result: [undefined, undefined],
					hasChanged: false,
				};
			}

			splitAt(): [this, this] {
				return [this, this];
			}

			slice(): this {
				return this;
			}
		}

		return Result;
	}
}

/**
 * Keyed counterpart of `IndexedCollectionNonEmpty`.
 *
 * Like {@link IndexedKeyedCollectionEmpty}, this exists because the set-oriented
 * non-empty mixins only accept `ApiMixin.AbstractNonEmptyConstructor` and cannot
 * wrap a keyed constructor. It composes the keyed-map surface with the indexed
 * non-empty surface for `E = readonly [K, V]`.
 */
export namespace IndexedKeyedCollectionNonEmpty {
	export interface Base<
		K,
		V,
		Tp extends Collection.Advanced.TypesNonEmpty<
			KeyedCollection.Advanced.FamilyBase<K, V>,
			readonly [K, V]
		>,
	> extends MapCollectionNonEmpty.ApiBase<K, V, Tp>,
			IndexedCollection.Advanced.Api<readonly [K, V], Tp>,
			IndexedCollection.Capability.WithPrependAppend.Api<readonly [K, V], Tp>,
			IndexedCollection.Capability.WithRemoveAt.Api<readonly [K, V], Tp>,
			IndexedCollection.Capability.WithSwapAt.Api<readonly [K, V], Tp> {}

	export interface Mixin extends KeyedApiMixinNonEmpty {
		_API: Base<this['_K'], this['_V'], this['_TP']>;
	}

	export function WithMixin<C extends KeyedApiMixin>(
		Base: KeyedApiMixin.AbstractNonEmptyConstructor<C>,
	): KeyedApiMixin.AbstractNonEmptyConstructor<C & Mixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<
			MapCollectionNonEmpty.ApiBase<K, V, Tp> &
				CollectionNonEmpty.Base<readonly [K, V], Tp>
		>,
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
	>(Base: TBase): TBase & AbstractConstructor<Base<K, V, Tp>> {
		abstract class Result extends Base implements Base<K, V, Tp> {
			abstract streamSlice(
				range: IndexRange,
				options?: { reversed?: boolean | undefined } | undefined,
			): Stream<readonly [K, V]>;
			abstract at<O>(
				index: number,
				otherwise?: OptLazy<O>,
			): readonly [K, V] | O;
			abstract take<const N extends number>(
				amount: N,
			): 0 extends N ? Tp['_NORMAL'] : Tp['_NON_EMPTY'];
			abstract drop(amount: number): Tp['_NORMAL'];
			abstract splitAt<const N extends number>(
				amount: N,
			): [0 extends N ? Tp['_NORMAL'] : Tp['_NON_EMPTY'], Tp['_NORMAL']];
			abstract slice(range: IndexRange): Tp['_NORMAL'];
			abstract prepend(element: readonly [K, V]): Tp['_NON_EMPTY'];
			abstract append(element: readonly [K, V]): Tp['_NON_EMPTY'];
			abstract removeAt(
				index: number,
				amount?: number | undefined,
			): Tp['_NORMAL'];
			abstract removeAtAndReturn(
				index: number,
				amount?: number | undefined,
			): Op.DynamicResult<
				Tp['_SELF'],
				Tp['_NORMAL'],
				Tp['_NON_EMPTY'],
				Tp['_NORMAL']
			>;
			abstract swapAt(index1: number, index2: number): Tp['_SELF'];
			abstract swapAtAndReturn(
				index1: number,
				index2: number,
			): Op.DynamicResult<
				Tp['_SELF'],
				[previous1: undefined, previous2: undefined],
				[previous1: readonly [K, V], previous2: readonly [K, V]],
				Tp['_NON_EMPTY']
			>;

			first<O>(otherwise?: OptLazy<O>): readonly [K, V] | O {
				return this.at(0, otherwise);
			}

			last<O>(otherwise?: OptLazy<O>): readonly [K, V] | O {
				return this.at(-1, otherwise);
			}
		}

		return Result;
	}
}
