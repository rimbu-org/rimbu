import type {
	AbstractConstructor,
	ApiMixin,
	CollectionEmpty,
	CollectionNonEmpty,
} from '@rimbu/collection-types/advanced/collection-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';

import { OptLazy } from '@rimbu/common';

export interface SortedApiMixin extends ApiMixin {
	_S: unknown;

	_Tp: Collection.Advanced.Types<
		SortedCollection.Advanced.Family<this['_E'], this['_S']>,
		this['_E']
	>;
}

export declare namespace SortedApiMixin {
	export type Apply<
		C extends SortedApiMixin,
		E,
		S,
		Tp extends Collection.Advanced.TypesBase,
	> = (C & { _E: E; _S: S; _TP: Tp })['_API'];

	export interface AbstractEmptyConstructor<C extends SortedApiMixin> {
		new <
			E,
			S,
			FAM extends SortedCollection.Advanced.Family<E, S>,
			Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
				FAM,
				E
			>,
		>(
			context: FAM['_CONTEXT'],
		): SortedCollectionEmpty.Base<E, S, Tp> & SortedApiMixin.Apply<C, E, S, Tp>;
	}

	export interface AbstractNonEmptyConstructor<C extends SortedApiMixin> {
		new <
			E,
			S,
			FAM extends SortedCollection.Advanced.Family<E, S>,
			Tp extends Collection.Advanced.TypesNonEmpty<
				FAM,
				E
			> = Collection.Advanced.TypesNonEmpty<FAM, E>,
		>(
			context: FAM['_CONTEXT'],
		): CollectionNonEmpty.Base<E, Tp> & SortedApiMixin.Apply<C, E, S, Tp>;
	}
}

export namespace SortedCollectionEmpty {
	export interface Base<E, S, Tp extends Collection.Advanced.TypesBase>
		extends SortedCollection.Advanced.Api<E, S, Tp> {}

	export interface Mixin extends SortedApiMixin {
		_API: Base<this['_E'], this['_S'], this['_TP']>;
	}

	/**
	 * Adds the sorted-collection API to an empty collection base constructor.
	 */
	export function WithMixin<C extends ApiMixin>(
		Base: ApiMixin.AbstractEmptyConstructor<C>,
	): ApiMixin.AbstractEmptyConstructor<C & Mixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<CollectionEmpty.Base<E, Tp>>,
		E,
		S,
		FAM extends Collection.Advanced.Family<E> = Collection.Advanced.Family<E>,
		Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
			FAM,
			E
		>,
	>(Base: TBase): TBase & AbstractConstructor<Base<E, S, Tp>> {
		abstract class Result extends Base {
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
