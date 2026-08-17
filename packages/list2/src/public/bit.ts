import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed3';
import type { Collection } from '@rimbu/collection-types/collection2';
import type { List } from '@rimbu/list';

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
		extends IndexedCollection.Advanced.BuilderApi<
			boolean,
			Collection.Advanced.Types<BitList.Advanced.Family, boolean>
		> {
		readonly context: BitList.Context;
	}

	export interface Context
		extends Collection.Context<
			Collection.Advanced.Types<BitList.Advanced.Family, boolean>
		> {
		readonly blockSizeBits: number;

		createContext(options: { blockSizeBits?: number }): BitList.Context;
	}

	export namespace Advanced {
		export type Api<Tp extends Collection.Advanced.TypesBase> =
			List.Advanced.Api<boolean, Tp>;

		export interface Family extends IndexedCollection.Advanced.Family<boolean> {
			_NORMAL: BitList;
			_NON_EMPTY: BitList.NonEmpty;
			_BUILDER: BitList.Builder;
			_CONTEXT: BitList.Context;

			_UPPER_E: boolean;

			_FAM: Family;
			_NEW_FAMILY: Family;
		}
	}
}
