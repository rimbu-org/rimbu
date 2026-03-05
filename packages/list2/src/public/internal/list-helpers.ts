import type { List } from '@rimbu/list';

import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';

export namespace ListHelpers {
	export interface Factory extends ListBase.Factory<ListHelpers.Types> {}

	export interface Types extends ListBase.Types {
		readonly normal: List<this['_T']>;
		readonly nonEmpty: List.NonEmpty<this['_T']>;
		readonly builder: List.Builder<this['_T']>;
		readonly context: List.Context;
	}

	export interface TypesImpl extends ListImpl.Types {
		readonly leafChildren: readonly this['_T'][] & ListBase.LeafChildrenTag;
	}
}
