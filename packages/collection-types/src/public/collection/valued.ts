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
	> = Advanced.ExtendFamily<E, F>['_NON_EMPTY'];

	export type Context<
		F extends
			Collection.Advanced.FamilyBase<any> = Collection.Advanced.Family<any>,
	> = Advanced.ExtendFamily<any, F>['_CONTEXT'];

	export type Builder<
		E,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Advanced.ExtendFamily<E, F>['_BUILDER'];

	export namespace Advanced {
		export type ExtendFamily<
			E,
			F extends
				Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
		> = F & Family<E>;

		export interface Api<E, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.Api<E, Tp> {
			has<UE = E>(value: RelatedTo<E, UE>): boolean;
		}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.BuilderApi<E, Tp> {
			has<UE = E>(value: RelatedTo<E, UE>): boolean;
		}

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends Collection.Advanced.ContextApi<F> {}

		export interface Family<E> extends Collection.Advanced.Family<E> {
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_FAM: Family<E>;
			_NEW_FAMILY: ValuedCollection.Advanced.Family<this['_NEW_E']>;
		}
	}
}
