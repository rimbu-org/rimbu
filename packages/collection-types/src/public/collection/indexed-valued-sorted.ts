import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedSortedCollection } from '@rimbu/collection-types/collection/indexed-sorted';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';

export type IndexedValuedSortedCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = IndexedValuedSortedCollection.Advanced.ExtendFamily<E, F>['_NORMAL'];

export declare namespace IndexedValuedSortedCollection {
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
			extends IndexedSortedCollection.Advanced.Api<E, E, Tp>,
				ValuedCollection.Advanced.Api<E, Tp> {}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends IndexedSortedCollection.Advanced.BuilderApi<E, E, Tp>,
				ValuedCollection.Advanced.BuilderApi<E, Tp> {}

		export interface ContextApi<
			F extends IndexedSortedCollection.Advanced.Family<any, any> &
				ValuedCollection.Advanced.Family<any>,
		> extends IndexedSortedCollection.Advanced.ContextApi<F> {}

		export interface Family<E>
			extends IndexedSortedCollection.Advanced.Family<E, E>,
				ValuedCollection.Advanced.Family<E> {
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
