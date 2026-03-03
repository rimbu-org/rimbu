import type { List } from '@rimbu/list';
import type { ListBase } from './list-base';

export namespace ListHelpers {
	export interface Types extends ListBase.Types {
		readonly normal: List<this['_T']>;
		readonly nonEmtpy: List.NonEmpty<this['_T']>;
	}
}
