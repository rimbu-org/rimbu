import type { Collection } from '@rimbu/collection-types/collection';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';

export type SortedValuedCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = SortedValuedCollection.Advanced.ExtendFamily<E, F>['_NORMAL'];

export namespace SortedValuedCollection {
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
			extends SortedCollection.Advanced.Api<E, E, Tp>,
				ValuedCollection.Advanced.Api<E, Tp> {}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends SortedCollection.Advanced.BuilderApi<E, E, Tp>,
				ValuedCollection.Advanced.BuilderApi<E, Tp> {}

		export interface ContextApi<
			F extends SortedCollection.Advanced.Family<any, any>,
		> extends SortedCollection.Advanced.ContextApi<F>,
				ValuedCollection.Advanced.ContextApi<F> {}

		export interface Family<E>
			extends SortedCollection.Advanced.Family<E, E>,
				ValuedCollection.Advanced.Family<E> {
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}
}
