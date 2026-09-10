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
				Collection.Capability.WithAddAll.Api<E, Tp>,
				Collection.Capability.WithFlatMap.Api<E, Tp>,
				Collection.Capability.WithFlatMapIndexed.Api<E, Tp>,
				Collection.Capability.WithMap.Api<E, Tp>,
				Collection.Capability.WithMapIndexed.Api<E, Tp>,
				Collection.Capability.WithRecompose.Api<E, Tp>,
				Collection.Capability.WithMutate.Api<E, Tp>,
				Collection.Capability.WithToBuilder.Api<E, Tp>,
				ValuedCollection.Capability.WithDifference.Api<E, Tp>,
				ValuedCollection.Capability.WithIntersection.Api<E, Tp>,
				ValuedCollection.Capability.WithSymmetricDifference.Api<E, Tp>,
				ValuedCollection.Capability.WithUnion.Api<E, Tp>,
				ValuedCollection.Capability.WithRemove.Api<E, Tp>,
				ValuedCollection.Capability.WithRemoveAll.Api<E, Tp> {}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends ValuedCollection.Advanced.BuilderApi<E, Tp>,
				Collection.Capability.WithAdd.BuilderApi<E, Tp>,
				Collection.Capability.WithAddAll.BuilderApi<E, Tp>,
				ValuedCollection.Capability.WithRemove.BuilderApi<E, Tp>,
				ValuedCollection.Capability.WithRemoveAll.BuilderApi<E, Tp> {}

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends ValuedCollection.Advanced.ContextApi<F> {}

		export interface Family<E>
			extends ValuedCollection.Advanced.Family<E>,
				Collection.Capability.WithAdd<E>,
				Collection.Capability.WithAddAll<E>,
				Collection.Capability.WithFlatMap<E>,
				Collection.Capability.WithFlatMapIndexed<E>,
				Collection.Capability.WithMap<E>,
				Collection.Capability.WithMapIndexed<E>,
				Collection.Capability.WithRecompose<E>,
				Collection.Capability.WithMutate<E>,
				Collection.Capability.WithToBuilder<E>,
				ValuedCollection.Capability.WithDifference<E>,
				ValuedCollection.Capability.WithIntersection<E>,
				ValuedCollection.Capability.WithUnion<E>,
				ValuedCollection.Capability.WithSymmetricDifference<E>,
				ValuedCollection.Capability.WithRemove<E>,
				ValuedCollection.Capability.WithRemoveAll<E> {
			_NORMAL: Api<E, this['_TYPES']>;
			_NON_EMPTY: Api<E, this['_TYPES_NON_EMPTY']>;
			_BUILDER: BuilderApi<E, this['_TYPES']>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_INVARIANT: (e: E) => E;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}
}
