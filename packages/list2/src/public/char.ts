import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { List } from '@rimbu/list';

import type { ChildrenOps } from '#advanced/children-ops';

import { CharOuterChildrenOps } from '#list/children-ops/char';
import { ListContext } from '#list/context';

export interface CharList
	extends CharList.Advanced.Api<
		Collection.Advanced.Types<CharList.Advanced.Family, string>
	> {}

export declare namespace CharList {
	export interface NonEmpty
		extends CharList.Advanced.Api<
			Collection.Advanced.TypesNonEmpty<CharList.Advanced.Family, string>
		> {}

	export interface Builder
		extends CharList.Advanced.BuilderApi<
			Collection.Advanced.Types<CharList.Advanced.Family, string>
		> {}

	export interface Context
		extends CharList.Advanced.ContextApi<CharList.Advanced.Family> {}

	export namespace Advanced {
		export type Api<Tp extends Collection.Advanced.TypesBase> =
			List.Advanced.Api<string, Tp>;

		export type BuilderApi<Tp extends Collection.Advanced.TypesBase> =
			List.Advanced.BuilderApi<string, Tp>;

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends List.Advanced.ContextApi<F> {}

		export interface Family extends IndexedCollection.Advanced.Family<string> {
			_NORMAL: CharList;
			_NON_EMPTY: CharList.NonEmpty;
			_BUILDER: CharList.Builder;
			_CONTEXT: CharList.Context;

			_UPPER_E: string;
			_INVARIANT: (element: string) => boolean;

			_FAM: Family;
			_NEW_FAMILY: Family;
		}

		export type DefaultFactory = Omit<Context, 'blockSizeBits'> & {
			createContext(options: { blockSizeBits?: number }): CharList.Context;
		};
	}
}

export const CharList: CharList.Advanced.DefaultFactory =
	ListContext.createDefault(5, () => new CharOuterChildrenOps() as ChildrenOps);
