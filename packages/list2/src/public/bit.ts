import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { TypesKey } from '@rimbu/collection-types/types';
import type { List } from '@rimbu/list';

export interface BitList extends List<boolean> {
	readonly [TypesKey]: BitList.Advanced.Types;
	readonly context: BitList.Context;
}

export declare namespace BitList {
	export interface NonEmpty extends BitList, List.NonEmpty<boolean> {
		readonly [TypesKey]: BitList.Advanced.TypesNonEmpty;
	}

	export interface Builder extends List.Builder<boolean> {
		readonly [TypesKey]: BitList.Advanced.Types;
		readonly context: BitList.Context;
	}

	export interface Context extends List.Context<boolean> {}

	export namespace Advanced {
		export interface Family extends List.Advanced.FamilyBase<boolean> {
			_UPPER_E: boolean;

			_NEW_FAMILY: BitList.Advanced.Family;
		}

		export type Types = BitList.Advanced.Family &
			IndexedCollection.Advanced.NormalKind<boolean>;

		export type TypesNonEmpty = BitList.Advanced.Family &
			IndexedCollection.Advanced.NonEmptyKind<boolean>;
	}
}
