import type {
	Collection,
	IndexedCollection,
} from '@rimbu/collection-types/capabilities';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

import type { ChildrenOps } from '#advanced/children-ops';

import { ArrayOuterChildrenOps } from '#list/children-ops/array';
import { createListContextModule } from '#list/context';

export interface List<T> extends IndexedCollection<T>, List.Capabilities<T> {
	readonly context: List.Context<T>;
}

export declare namespace List {
	export interface NonEmpty<T>
		extends IndexedCollection.NonEmpty<T>,
			List.Capabilities<T> {
		readonly context: List.Context<T, true>;
	}

	export interface Builder<T> extends IndexedCollection.Builder<T> {
		readonly context: List.Context<T>;
	}

	export interface Capabilities<T>
		extends Collection.WithFilter<T>,
			IndexedCollection.WithOrderEditable<T>,
			IndexedCollection.WithMap<T> {
		readonly context: List.Context<T>;
	}

	export interface Context<T, IsNonEmpty extends boolean = boolean> {
		readonly blockSizeBits: number;

		__types: IsNonEmpty extends true ? List.Types.NonEmpty<T> : List.Types<T>;

		empty<T extends this['__types']['_UPPER_E']>(): (this['__types'] & {
			_NEW_E: T;
		})['_NEW_TYPES']['_NORMAL'];

		of<T extends this['__types']['_UPPER_E']>(
			...elements: ArrayNonEmpty<T>
		): (this['__types'] & { _NEW_E: T })['_NEW_TYPES']['_NON_EMPTY'];

		from<T extends this['__types']['_UPPER_E']>(
			...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
		): (this['__types'] & { _NEW_E: T })['_NEW_TYPES']['_NON_EMPTY'];
		from<T extends this['__types']['_UPPER_E']>(
			...sources: ArrayNonEmpty<StreamSource<T>>
		): (this['__types'] & { _NEW_E: T })['_NEW_TYPES']['_NORMAL'];
	}

	export type Factory = Pick<List.Context<any>, 'empty' | 'of'>;

	export interface Types<T> extends IndexedCollection.Types<T> {
		_NORMAL: List<T>;
		_NON_EMPTY: List.NonEmpty<T>;
		_NEW_TYPES: List.Types<this['_NEW_E']>;
	}

	export namespace Types {
		export interface NonEmpty<T> extends IndexedCollection.Types.NonEmpty<T> {
			_NORMAL: List<T>;
			_NON_EMPTY: List.NonEmpty<T>;
			_NEW_TYPES: List.Types.NonEmpty<this['_NEW_E']>;
		}
	}
}

export const List: List.Factory = createListContextModule({
	blockSizeBits: 5,
	childrenOps: new ArrayOuterChildrenOps() as ChildrenOps,
});
