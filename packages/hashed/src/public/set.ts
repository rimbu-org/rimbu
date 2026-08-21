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

	export interface Context<UE>
		extends Advanced.ContextApi<UE, HashSet.Advanced.Family<UE>> {}

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

		export interface ContextApi<
			UE,
			F extends Collection.Advanced.FamilyBase<UE>,
		> extends SetCollection.Advanced.ContextApi<F>,
				Collection.Capability.WithReducer.ContextApi<F> {
			readonly blockSizeBits: number;
			readonly hasher: Hasher<UE>;
			readonly eq: Eq<UE>;
		}

		export interface Family<E> extends SetCollection.Advanced.Family<E> {
			_NORMAL: HashSet<E>;
			_NON_EMPTY: HashSet.NonEmpty<E>;
			_BUILDER: HashSet.Builder<E>;
			_CONTEXT: HashSet.Context<E>;

			_UPPER_E: E;
			_INVARIANT: (element: E) => E;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}

		export type DefaultFactory = Pick<
			Context<any>,
			'builder' | 'empty' | 'from' | 'of' | 'reducer'
		> & {
			createContext<E>(options: {
				hasher?: Hasher<E> | undefined;
				eq?: Eq<E> | undefined;
				blockSizeBits?: number | undefined;
				listContext?: List.Context | undefined;
			}): Context<E>;
		};
	}
}

export const HashSet: HashSet.Advanced.DefaultFactory = new HashSetContext();
