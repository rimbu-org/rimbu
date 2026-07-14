import type { ListBase } from '#list/list-base';

import { BitListHelpers } from '#list/bit-list-helpers';

export interface BitList extends ListBase<boolean, BitListHelpers.Types> {}

export namespace BitList {
	export interface NonEmpty
		extends ListBase.NonEmpty<boolean, BitListHelpers.Types>,
			Omit<BitList, keyof ListBase.NonEmpty<any>> {}

	export interface Builder
		extends ListBase.Builder<boolean, BitListHelpers.Types> {}

	export interface Context
		extends BitListHelpers.Factory,
			ListBase.Context<BitListHelpers.Types> {}
}

export const BitList: BitListHelpers.Factory =
	BitListHelpers.createBitListContext();
