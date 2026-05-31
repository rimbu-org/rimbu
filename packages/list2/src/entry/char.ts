import type { ListBase } from '#list/list-base';

import { CharListHelpers } from '@rimbu/list2/internal/char-list-helpers';

export interface CharList extends ListBase<string, CharListHelpers.Types> {}

export namespace CharList {
	export interface NonEmpty
		extends ListBase.NonEmpty<string, CharListHelpers.Types>,
			Omit<CharList, keyof ListBase.NonEmpty<any>> {}

	export interface Builder
		extends ListBase.Builder<string, CharListHelpers.Types> {}

	export interface Context
		extends CharListHelpers.Factory,
			ListBase.Context<CharListHelpers.Types> {}
}

export const CharList: CharListHelpers.Factory =
	CharListHelpers.createCharListContext();
