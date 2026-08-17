import type { Collection } from '@rimbu/collection-types/collection';
import type { RelatedTo } from '@rimbu/common';

export type ValuedCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = Collection.Advanced.Types<
	F & ValuedCollection.Advanced.Family<E>,
	E
>['_NORMAL'];

export declare namespace ValuedCollection {
	export type NonEmpty<
		E,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Collection.Advanced.TypesNonEmpty<F, E>['_NON_EMPTY'];

	export namespace Advanced {
		export interface Api<E, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.Api<E, Tp> {
			has<E2 = E>(value: RelatedTo<E2, E>): boolean;
		}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.BuilderApi<E, Tp> {
			has<E2 = E>(value: RelatedTo<E2, E>): boolean;
		}

		export interface Family<E> extends Collection.Advanced.Family<E> {
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;

			_FAM: Family<E>;
			_NEW_FAMILY: ValuedCollection.Advanced.Family<this['_NEW_E']>;
		}
	}
}
