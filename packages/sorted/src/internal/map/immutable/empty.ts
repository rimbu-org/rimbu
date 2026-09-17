import type { ToJSON } from '@rimbu/common/types';
import type { SortedMap } from '@rimbu/sorted/map';

import type { ContextImpl } from '#map/context-factory';

import { IndexedKeyedSortedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/indexed-keyed-sorted-base';
import { KeyedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { MapCollectionEmpty } from '@rimbu/collection-types/advanced/map-base';
import { Stream } from '@rimbu/stream';

const EmptyBase = IndexedKeyedSortedCollectionEmpty.WithMixin(
	MapCollectionEmpty.WithMixin(
		KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor),
	),
);

export class SortedMapEmpty<K = any, V = any>
	extends EmptyBase<K, V, SortedMap.Advanced.Family<K, V>>
	implements SortedMap<K, V>
{
	constructor(readonly context: ContextImpl<K>) {
		super(context);
	}

	streamRange(): Stream<readonly [K, V]> {
		return Stream.empty();
	}

	get comp(): any {
		return this.context.comp;
	}

	toString(): string {
		return `SortedMap()`;
	}

	toJSON(): ToJSON<any[]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}
}
