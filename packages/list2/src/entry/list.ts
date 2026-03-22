import type { ListBase } from '#list/list-base';

import { ListHelpers } from '#list/list-helpers';

export interface List<T> extends ListBase<T, ListHelpers.Types> {}

export namespace List {
	export interface NonEmpty<T>
		extends ListBase.NonEmpty<T, ListHelpers.Types>,
			Omit<List<T>, keyof ListBase.NonEmpty<any>> {}

	export interface Builder<T> extends ListBase.Builder<T, ListHelpers.Types> {}

	export interface Context extends ListHelpers.Context {}
}

export const List: ListHelpers.Factory = ListHelpers.createListContext();
