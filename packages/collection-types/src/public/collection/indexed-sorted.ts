import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';
import type { OptLazy, RelatedTo } from '@rimbu/common';

export type IndexedSortedCollection<
	E,
	S,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = IndexedSortedCollection.Advanced.ExtendFamily<E, S, F>['_NORMAL'];

export namespace IndexedSortedCollection {
	export type NonEmpty<
		E,
		S,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Advanced.ExtendFamily<E, S, F>['_NON_EMPTY'];

	export namespace Advanced {
		export type ExtendFamily<
			E,
			S,
			F extends
				Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
		> = F & Family<E, S>;

		export interface Api<E, S, Tp extends Collection.Advanced.TypesBase>
			extends IndexedCollection.Advanced.Api<E, Tp>,
				SortedCollection.Advanced.Api<E, S, Tp> {
			indexOf<US = S>(search: RelatedTo<S, US>): number | undefined;
			indexOf<US, O>(
				search: RelatedTo<S, US>,
				otherwise: OptLazy<O>,
			): number | O;

			lowerBound<US = S>(search: RelatedTo<S, US>): number;
			upperBound<US = S>(search: RelatedTo<S, US>): number;
		}

		export interface BuilderApi<E, S, Tp extends Collection.Advanced.TypesBase>
			extends IndexedCollection.Advanced.BuilderApi<E, Tp>,
				SortedCollection.Advanced.BuilderApi<E, S, Tp> {
			indexOf<US = S>(search: RelatedTo<S, US>): number | undefined;
			indexOf<US, O>(
				search: RelatedTo<S, US>,
				otherwise: OptLazy<O>,
			): number | O;

			lowerBound(value: E): number;
			upperBound(value: E): number;
		}

		export interface ContextApi<
			F extends IndexedCollection.Advanced.Family<any> &
				SortedCollection.Advanced.Family<any, any>,
		> extends IndexedCollection.Advanced.ContextApi<F> {}

		export interface Family<E, S>
			extends IndexedCollection.Advanced.Family<E>,
				SortedCollection.Advanced.Family<E, S> {
			_NORMAL: Api<E, S, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, S, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, S, Collection.Advanced.Types<this['_FAM'], E>>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_FAM: Family<E, S>;
			_NEW_FAMILY: Family<this['_NEW_E'], this['_NEW_E_TO_S']>;
		}
	}
}
