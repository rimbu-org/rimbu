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

	// NOTE: do not add a `_TP` override here naming an aggregate `Family`.
	// This interface previously carried a `_Tp` slot (lowercase `p`) that was
	// never read — a typo for `_TP`. Had it been spelled `_TP`, it would have
	// contributed `SortedCollection.Advanced.Family` to the composed `_TP`
	// intersection, which is exactly the pattern that makes every
	// `Tp['_NORMAL']` / `['_BUILDER']` / `['_CONTEXT']` read an N-way
	// intersection and defeats TypeScript's nominal fast path. The kind-specific
	// `_TP` belongs on `SortedApiMixinEmpty` / `SortedApiMixinNonEmpty`, stated
	// in terms of `FamilyBase`.
}

/**
 * The empty counterpart of {@link SortedApiMixin}.
 *
 * As with {@link SortedApiMixinNonEmpty}, the `_TP` declaration must stay
 * textually identical to `ApiMixinEmpty['_TP']` so the two dedupe when
 * intersected; it cannot simply extend `ApiMixinEmpty`, because
 * {@link SortedApiMixin} already inherits the wider `ApiMixin['_TP']`.
 */
export interface SortedApiMixinEmpty extends SortedApiMixin {
	_TP: Collection.Advanced.Types<
		Collection.Advanced.FamilyBase<this['_E']>,
		this['_E']
	>;
}

/**
 * The non-empty counterpart of {@link SortedApiMixin}.
 *
 * Inherits `_TP` from {@link ApiMixinNonEmpty} so that sorted capabilities
 * contribute the *same* `_TP` declaration as every other non-empty capability.
 * That is what lets the composed `_TP` collapse to a single type instead of an
 * N-way intersection — see the note on {@link ApiMixinNonEmpty}.
 */
export interface SortedApiMixinNonEmpty extends SortedApiMixin {
	// Must stay textually identical to `ApiMixinNonEmpty['_TP']` so the two
	// resolve to the same type and dedupe when intersected. It cannot simply
	// extend `ApiMixinNonEmpty`, because `SortedApiMixin` already inherits the
	// wider `ApiMixin['_TP']` and TypeScript rejects the conflicting merge.
	_TP: Collection.Advanced.TypesNonEmpty<
		Collection.Advanced.FamilyBase<this['_E']>,
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

	export interface Mixin extends SortedApiMixinEmpty {
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
			previous<US, O>(
				_search: US,
				options?: {
					inclusive?: boolean | undefined;
					otherwise?: OptLazy<O>;
				},
			): O {
				return OptLazy(options?.otherwise) as O;
			}
			next<US, O>(
				_search: US,
				options?: {
					inclusive?: boolean | undefined;
					otherwise?: OptLazy<O>;
				},
			): O {
				return OptLazy(options?.otherwise) as O;
			}
		}

		return Result;
	}
}
