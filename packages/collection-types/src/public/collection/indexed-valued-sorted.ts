import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedValuedCollection } from '@rimbu/collection-types/collection/indexed-valued';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';

export type IndexedValuedSortedCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = IndexedValuedSortedCollection.Advanced.ExtendFamily<E, F>['_NORMAL'];

export namespace IndexedValuedSortedCollection {
	export type NonEmpty<
		E,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Advanced.ExtendFamily<E, F>['_NON_EMPTY'];

	export namespace Advanced {
		export type ExtendFamily<
			E,
			F extends
				Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
		> = F & Family<E>;

		export interface Api<E, Tp extends Collection.Advanced.TypesBase>
			extends IndexedValuedCollection.Advanced.Api<E, Tp>,
				SortedCollection.Advanced.Api<E, E, Tp> {}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends IndexedValuedCollection.Advanced.BuilderApi<E, Tp>,
				SortedCollection.Advanced.BuilderApi<E, E, Tp> {}

		export interface ContextApi<
			F extends IndexedValuedCollection.Advanced.Family<any> &
				SortedCollection.Advanced.Family<any, any>,
		> extends IndexedValuedCollection.Advanced.ContextApi<F> {}

		export interface Family<E>
			extends IndexedValuedCollection.Advanced.Family<E>,
				SortedCollection.Advanced.Family<E, E> {
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_NEW_E_TO_S: this['_NEW_E'];

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}
}
