import type { ListBase } from '@rimbu/list/internal/list-base';
import type { ListHelpers } from '@rimbu/list/internal/list-helpers';

export interface List<T> extends ListBase<T, ListHelpers.Types> {}

export namespace List {
	export interface NonEmpty<T>
		extends List<T>,
			ListBase<T, ListHelpers.Types> {}

	export interface Builder<T> extends ListBase.Builder<T, ListHelpers.Types> {}

	export interface Context extends ListBase.Context {}
}
