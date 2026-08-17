import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';

export type SetCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = Collection.Advanced.Types<
	F & SetCollection.Advanced.Family<E>,
	E
>['_NORMAL'];

export namespace SetCollection {
	export type NonEmpty<
		E,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Collection.Advanced.TypesNonEmpty<F, E>['_NON_EMPTY'];

	export namespace Advanced {
		export interface Api<E, Tp extends Collection.Advanced.TypesBase>
			extends ValuedCollection.Advanced.Api<E, Tp> {}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends ValuedCollection.Advanced.BuilderApi<E, Tp> {}

		export interface Family<E> extends ValuedCollection.Advanced.Family<E> {
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}
}
