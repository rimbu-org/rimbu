import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';

import type { ChildrenOps } from '#advanced/children-ops';

import { ArrayOuterChildrenOps } from '#list/children-ops/array';
import { ListContext } from '#list/context';
export interface List<T>
	extends List.Advanced.Api<
		T,
		Collection.Advanced.Types<List.Advanced.Family<T>, T>
	> {}

export declare namespace List {
	export interface NonEmpty<T>
		extends List.Advanced.Api<
			T,
			Collection.Advanced.TypesNonEmpty<List.Advanced.Family<T>, T>
		> {}

	export interface Builder<T>
		extends List.Advanced.BuilderApi<
			T,
			Collection.Advanced.Types<List.Advanced.Family<T>, T>
		> {}

	export interface Context
		extends List.Advanced.ContextApi<List.Advanced.Family<any>> {}

	export namespace Advanced {
		export type Api<
			T,
			Tp extends Collection.Advanced.TypesBase,
		> = Collection.Capability.WithFlatMap.Api<T, Tp> &
			Collection.Capability.WithMap.Api<T, Tp> &
			Collection.Capability.WithMutate.Api<T, Tp> &
			Collection.Capability.WithRecompose.Api<T, Tp> &
			Collection.Capability.WithToBuilder.Api<T, Tp> &
			IndexedCollection.Capability.WithConcat.Api<T, Tp> &
			IndexedCollection.Capability.WithPadTo.Api<T, Tp> &
			IndexedCollection.Capability.WithPrependAppend.Api<T, Tp> &
			IndexedCollection.Capability.WithInsertAt.Api<T, Tp> &
			IndexedCollection.Capability.WithRemoveAt.Api<T, Tp> &
			IndexedCollection.Capability.WithSpliceAt.Api<T, Tp> &
			IndexedCollection.Capability.WithSwapAt.Api<T, Tp> &
			IndexedCollection.Capability.WithUpdateAt.Api<T, Tp>;

		export type BuilderApi<
			T,
			Tp extends Collection.Advanced.TypesBase,
		> = IndexedCollection.Capability.WithPrependAppend.BuilderApi<T, Tp> &
			IndexedCollection.Capability.WithInsertAt.BuilderApi<T, Tp> &
			IndexedCollection.Capability.WithRemoveAt.BuilderApi<T, Tp>;

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends IndexedCollection.Advanced.ContextApi<F>,
				Collection.Capability.WithReducer.ContextApi<F> {
			readonly blockSizeBits: number;
		}

		export type DefaultFactory = Omit<Context, 'blockSizeBits'> & {
			createContext(options: { blockSizeBits?: number }): List.Context;
		};

		export interface Family<T> extends IndexedCollection.Advanced.Family<T> {
			_NORMAL: List<T>;
			_NON_EMPTY: List.NonEmpty<T>;
			_BUILDER: List.Builder<T>;
			_CONTEXT: List.Context;

			_INVARIANT: (value: any) => any;

			_FAM: Family<T>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}
}

export const List: List.Advanced.DefaultFactory = new ListContext<
	Collection.Advanced.Types<List.Advanced.Family<any>, any>
>(5, new ArrayOuterChildrenOps() as ChildrenOps);
