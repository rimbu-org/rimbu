import type { List } from '@rimbu/list';

export interface BitList extends List<boolean> {
	readonly context: BitList.Context;
}

export declare namespace BitList {
	export interface NonEmpty extends List.NonEmpty<boolean> {
		readonly context: BitList.Context<true>;
	}

	export interface Builder extends List.Builder<boolean> {
		readonly context: BitList.Context;
	}

	export interface Context<IsNonEmpty extends boolean = boolean>
		extends List.Context<boolean, IsNonEmpty> {
		__types: IsNonEmpty extends true ? BitList.Types.NonEmpty : BitList.Types;
	}

	export interface Types extends List.Types<boolean> {
		_UPPER_E: boolean;
		_NORMAL: BitList;
		_NON_EMPTY: BitList.NonEmpty;
		_NEW_TYPES: BitList.Types;
	}

	export namespace Types {
		export interface NonEmpty extends List.Types.NonEmpty<boolean> {
			_UPPER_E: boolean;
			_NORMAL: BitList;
			_NON_EMPTY: BitList.NonEmpty;
			_NEW_TYPES: BitList.Types.NonEmpty;
		}
	}
}
