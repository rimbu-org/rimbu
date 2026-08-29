import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';

export type SetCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = SetCollection.Advanced.ExtendFamily<E, F>['_NORMAL'];

export declare namespace SetCollection {
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
			extends ValuedCollection.Advanced.Api<E, Tp> {}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends ValuedCollection.Advanced.BuilderApi<E, Tp> {}

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends ValuedCollection.Advanced.ContextApi<F> {}

		export interface Family<E> extends ValuedCollection.Advanced.Family<E> {
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}
}
