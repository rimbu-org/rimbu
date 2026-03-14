import type { ArrayNonEmpty, StringNonEmpty } from '@rimbu/common/types';
import type { List } from '@rimbu/list';

import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';

import { ListContext } from '#list/context';

export namespace ListHelpers {
	export interface Factory extends ListBase.Factory<ListHelpers.Types> {
		/**
		 * Returns a List of characters from the given strings in `sources`.
		 * @param sources - a non-empty array containing strings
		 * @typeparam S - the source string type
		 * @example
		 * ```ts
		 * List.fromString('abc').toArray()   // => ['a', 'b', 'c']
		 * ```
		 */
		fromString<S extends string>(
			...sources: ArrayNonEmpty<StringNonEmpty<S>>
		): List.NonEmpty<string>;
		fromString(...sources: ArrayNonEmpty<string>): List<string>;
	}

	export interface Context extends ListBase.Context<ListHelpers.Types> {}

	export interface Types extends ListBase.Types {
		readonly normal: List<this['_T']>;
		readonly nonEmpty: List.NonEmpty<this['_T']>;
		readonly builder: List.Builder<this['_T']>;
		readonly context: List.Context;
	}

	export class ContextImpl
		extends ListContext<ListHelpers.TypesImpl>
		implements ListHelpers.Context
	{
		fromString = (...sources: ArrayNonEmpty<string>) => {
			return this.from(...sources);
		};
	}

	export interface TypesImpl extends ListImpl.Types {
		readonly leafChildren: readonly this['_T'][] & ListBase.LeafChildrenTag;
		readonly context: ListHelpers.ContextImpl;
	}
}
