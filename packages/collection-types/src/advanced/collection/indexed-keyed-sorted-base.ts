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
import type { IndexedSortedCollection } from '@rimbu/collection-types/collection/indexed-sorted';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op } from '@rimbu/collection-types/types';
import type { IndexRange, RelatedTo } from '@rimbu/common';

import { OptLazy } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

/**
 * Keyed counterpart of `IndexedSortedCollectionEmpty`.
 *
 * The set-oriented empty mixins are generic over the element type `E` and the
 * search type `S`, and their leading overloads only accept
 * `ApiMixin.AbstractEmptyConstructor`. A keyed collection — whose "element" is
 * always `readonly [K, V]` and whose context additionally requires
 * `keyedContext` — cannot be wrapped by those overloads. This namespace
 * supplies a keyed-aware entry point so a map can compose the same
 * indexed/sorted empty capabilities on top of its keyed-map base.
 */
export namespace IndexedKeyedSortedCollectionEmpty {
	export interface Base<
		K,
		V,
		Tp extends Collection.Advanced.Types<
			KeyedCollection.Advanced.FamilyBase<K, V>,
			readonly [K, V]
		>,
	> extends MapCollectionEmpty.ApiBase<K, V, Tp>,
			IndexedSortedCollection.Advanced.Api<readonly [K, V], K, Tp>,
			IndexedCollection.Capability.WithRemoveAt.Api<readonly [K, V], Tp> {}

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
				return OptLazy(otherwise) as O;
			}

			first<O>(otherwise?: OptLazy<O>): O {
				return OptLazy(otherwise) as O;
			}

			last<O>(otherwise?: OptLazy<O>): O {
				return OptLazy(otherwise) as O;
			}

			take(): this {
				return this;
			}

			drop(): this {
				return this;
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

			splitAt(): [this, this] {
				return [this, this];
			}

			slice(): this {
				return this;
			}

			indexOf<O>(_: K, otherwise?: OptLazy<O>): O {
				return OptLazy(otherwise) as O;
			}

			lowerBound(): 0 {
				return 0;
			}

			upperBound(): 0 {
				return 0;
			}

			min<O>(otherwise?: OptLazy<O>): O {
				return OptLazy(otherwise) as O;
			}

			max<O>(otherwise?: OptLazy<O>): O {
				return OptLazy(otherwise) as O;
			}

			previous<US, O>(
				_search: RelatedTo<K, US>,
				options?: {
					inclusive?: boolean | undefined;
					otherwise?: OptLazy<O>;
				},
			): readonly [K, V] | O {
				return OptLazy(options?.otherwise) as O;
			}

			next<US, O>(
				_search: RelatedTo<K, US>,
				options?: {
					inclusive?: boolean | undefined;
					otherwise?: OptLazy<O>;
				},
			): readonly [K, V] | O {
				return OptLazy(options?.otherwise) as O;
			}
		}

		return Result;
	}
}

/**
 * Keyed counterpart of `IndexedSortedCollectionNonEmpty`.
 *
 * Like {@link IndexedKeyedSortedCollectionEmpty}, this exists because the
 * set-oriented non-empty mixins only accept `ApiMixin.AbstractNonEmptyConstructor`
 * and cannot wrap a keyed constructor. It composes the keyed-map surface with
 * the indexed/sorted non-empty surface for `E = readonly [K, V]` and `S = K`.
 *
 * `min`/`max` are declared as abstract methods rather than implemented as
 * getters (as {@link IndexedSortedCollectionNonEmpty} does) because sorted map
 * nodes implement them as methods, and a base-class getter cannot be overridden
 * by a method.
 */
export namespace IndexedKeyedSortedCollectionNonEmpty {
	export interface Base<
		K,
		V,
		Tp extends Collection.Advanced.TypesNonEmpty<
			KeyedCollection.Advanced.FamilyBase<K, V>,
			readonly [K, V]
		>,
	> extends MapCollectionNonEmpty.ApiBase<K, V, Tp>,
			IndexedCollection.Advanced.Api<readonly [K, V], Tp>,
			SortedCollection.Capability.WithNeighbor.Api<readonly [K, V], K, Tp>,
			IndexedSortedCollection.Capability.WithIndexOf.Api<
				readonly [K, V],
				K,
				Tp
			>,
			IndexedSortedCollection.Capability.WithBounds.Api<readonly [K, V], K, Tp>,
			IndexedCollection.Capability.WithRemoveAt.Api<readonly [K, V], Tp> {
		min(): readonly [K, V];
		max(): readonly [K, V];
	}

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
			abstract min(): readonly [K, V];
			abstract max(): readonly [K, V];
			abstract previous<O>(
				search: K,
				options?:
					| { inclusive?: boolean | undefined; otherwise?: OptLazy<O> }
					| undefined,
			): readonly [K, V] | O;
			abstract next<O>(
				search: K,
				options?:
					| { inclusive?: boolean | undefined; otherwise?: OptLazy<O> }
					| undefined,
			): readonly [K, V] | O;
			abstract indexOf(search: K): number | undefined;
			abstract indexOf<O>(search: K, otherwise: OptLazy<O>): number | O;
			abstract lowerBound(search: K): number;
			abstract upperBound(search: K): number;
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
