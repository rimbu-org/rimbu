import type { KeyedApiMixin } from '@rimbu/collection-types/advanced/collection/keyed-base';
import type { AbstractConstructor } from '@rimbu/collection-types/advanced/collection-base';
import type { MapCollectionEmpty } from '@rimbu/collection-types/advanced/map-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { IndexedSortedCollection } from '@rimbu/collection-types/collection/indexed-sorted';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { Op } from '@rimbu/collection-types/types';

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

	export interface Mixin extends KeyedApiMixin {
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

			at<O>(otherwise?: OptLazy<O>): O {
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

			previous<O>(otherwise?: OptLazy<O>): O {
				return OptLazy(otherwise) as O;
			}

			next<O>(otherwise?: OptLazy<O>): O {
				return OptLazy(otherwise) as O;
			}
		}

		return Result;
	}
}
