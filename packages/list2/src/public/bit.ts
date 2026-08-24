import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { List } from '@rimbu/list';

import type { ChildrenOps } from '#advanced/children-ops';

import { ListContext } from '#list/context';

export interface BitList
	extends BitList.Advanced.Api<
		Collection.Advanced.Types<BitList.Advanced.Family, boolean>
	> {}

export declare namespace BitList {
	export interface NonEmpty
		extends BitList.Advanced.Api<
			Collection.Advanced.TypesNonEmpty<BitList.Advanced.Family, boolean>
		> {}

	export interface Builder
		extends BitList.Advanced.BuilderApi<
			Collection.Advanced.Types<BitList.Advanced.Family, boolean>
		> {}

	export interface Context
		extends BitList.Advanced.ContextApi<BitList.Advanced.Family> {}

	export namespace Advanced {
		export type Api<Tp extends Collection.Advanced.TypesBase> =
			List.Advanced.Api<boolean, Tp>;

		export type BuilderApi<Tp extends Collection.Advanced.TypesBase> =
			List.Advanced.BuilderApi<boolean, Tp>;

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends List.Advanced.ContextApi<F> {
			readonly blockSizeBits: number;
		}

		export interface Family extends IndexedCollection.Advanced.Family<boolean> {
			_NORMAL: BitList;
			_NON_EMPTY: BitList.NonEmpty;
			_BUILDER: BitList.Builder;
			_CONTEXT: BitList.Context;

			_UPPER_E: boolean;
			_INVARIANT: (element: boolean) => boolean;

			_FAM: Family;
			_NEW_FAMILY: Family;
		}

		export type DefaultFactory = Omit<Context, 'blockSizeBits'> & {
			createContext(options: { blockSizeBits?: number }): BitList.Context;
		};
	}
}

export const BitList: BitList.Advanced.DefaultFactory =
	ListContext.createDefault(5, 0 as unknown as ChildrenOps);
