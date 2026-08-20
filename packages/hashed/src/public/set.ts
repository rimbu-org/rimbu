import type { Collection } from '@rimbu/collection-types/collection';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { Eq } from '@rimbu/common';
import type { Hasher } from '@rimbu/hashed';
import type { List } from '@rimbu/list';

import { HashSetContext } from '#set/context';

export interface HashSet<E>
	extends HashSet.Advanced.Api<
		E,
		Collection.Advanced.Types<HashSet.Advanced.Family<E>, E>
	> {}

export namespace HashSet {
	export interface NonEmpty<E>
		extends Advanced.Api<
			E,
			Collection.Advanced.TypesNonEmpty<Advanced.Family<E>, E>
		> {}

	export interface Builder<E>
		extends Advanced.BuilderApi<
			E,
			Collection.Advanced.Types<Advanced.Family<E>, E>
		> {}

	export interface Context
		extends Advanced.ContextApi<HashSet.Advanced.Family<any>> {}

	export namespace Advanced {
		export type Api<
			E,
			Tp extends Collection.Advanced.TypesBase,
		> = Collection.Capability.WithFlatMap.Api<E, Tp> &
			Collection.Capability.WithMap.Api<E, Tp> &
			Collection.Capability.WithMutate.Api<E, Tp> &
			Collection.Capability.WithRecompose.Api<E, Tp> &
			Collection.Capability.WithToBuilder.Api<E, Tp> &
			SetCollection.Advanced.Api<E, Tp> &
			SetCollection.Capability.WithAdd.Api<E, Tp> &
			SetCollection.Capability.WithDifferenceAndIntersection.Api<E, Tp> &
			SetCollection.Capability.WithRemove.Api<E, Tp> &
			SetCollection.Capability.WithSymmetricDifferenceAndUnion.Api<E, Tp>;

		export type BuilderApi<
			E,
			Tp extends Collection.Advanced.TypesBase,
		> = SetCollection.Advanced.BuilderApi<E, Tp> &
			SetCollection.Capability.WithAdd.BuilderApi<E, Tp> &
			SetCollection.Capability.WithRemove.BuilderApi<E, Tp>;

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends SetCollection.Advanced.ContextApi<F> {
			readonly blockSizeBits: number;
			readonly hasher: Hasher<F['_UPPER_E']>;
			readonly eq: Eq<F['_UPPER_E']>;

			createContext<UE extends F['_UPPER_E']>(options: {
				hasher?: Hasher<UE> | undefined;
				eq?: Eq<UE> | undefined;
				blockSizeBits?: number | undefined;
				listContext?: List.Context | undefined;
			}): F['_CONTEXT'];
		}

		export interface Family<E> extends SetCollection.Advanced.Family<E> {
			_NORMAL: HashSet<E>;
			_NON_EMPTY: HashSet.NonEmpty<E>;
			_BUILDER: HashSet.Builder<E>;
			_CONTEXT: HashSet.Context;

			_UPPER_E: any;
			_INVARIANT: (element: E) => E;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}

		export type DefaultFactory = Context;
	}
}

export const HashSet: HashSet.Advanced.DefaultFactory = new HashSetContext();
