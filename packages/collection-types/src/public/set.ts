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
			extends ValuedCollection.Advanced.Api<E, Tp>,
				Collection.Capability.WithAdd.Api<E, Tp>,
				Collection.Capability.WithFlatMap.Api<E, Tp>,
				Collection.Capability.WithMap.Api<E, Tp>,
				Collection.Capability.WithRecompose.Api<E, Tp>,
				Collection.Capability.WithMutate.Api<E, Tp>,
				Collection.Capability.WithToBuilder.Api<E, Tp>,
				ValuedCollection.Capability.WithDifferenceAndIntersection.Api<E, Tp>,
				ValuedCollection.Capability.WithSymmetricDifferenceAndUnion.Api<E, Tp>,
				ValuedCollection.Capability.WithRemove.Api<E, Tp> {}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends ValuedCollection.Advanced.BuilderApi<E, Tp>,
				Collection.Capability.WithAdd.BuilderApi<E, Tp>,
				ValuedCollection.Capability.WithRemove.BuilderApi<E, Tp> {}

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends ValuedCollection.Advanced.ContextApi<F> {}

		export interface Family<E>
			extends ValuedCollection.Advanced.Family<E>,
				Collection.Capability.WithAdd<E>,
				Collection.Capability.WithFlatMap<E>,
				Collection.Capability.WithMap<E>,
				Collection.Capability.WithRecompose<E>,
				Collection.Capability.WithMutate<E>,
				Collection.Capability.WithToBuilder<E>,
				ValuedCollection.Capability.WithDifferenceAndIntersection<E>,
				ValuedCollection.Capability.WithSymmetricDifferenceAndUnion<E>,
				ValuedCollection.Capability.WithRemove<E> {
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_INVARIANT: (e: E) => E;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}
}
