import type { BiMap } from '@rimbu/bimap/bimap';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op } from '@rimbu/collection-types/types';

import type { BiMapCollectionContext } from '#bimap/context';

import { KeyedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { MapCollectionEmpty } from '@rimbu/collection-types/advanced/map-base';
import { OptLazy, type RelatedTo } from '@rimbu/common';

const BiMapEmptyBase = MapCollectionEmpty.WithMixin(
	KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor),
);

export class BiMapEmpty<K = any, V = any>
	extends BiMapEmptyBase<K, V, BiMap.Advanced.Family<K, V>>
	implements BiMap<K, V>
{
	constructor(readonly context: BiMapCollectionContext<K, V>) {
		super(context);
	}

	get keyValueMap(): MapCollection<K, V> {
		return this.context.keyValueContext.empty<readonly [K, V]>();
	}

	get valueKeyMap(): MapCollection<V, K> {
		return this.context.valueKeyContext.empty<readonly [V, K]>();
	}

	getKey<UV = V>(value: RelatedTo<V, UV>): K | undefined;
	getKey<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;
	getKey<UV, O>(_value: RelatedTo<V, UV>, otherwise?: OptLazy<O>): K | O {
		return OptLazy(otherwise) as O;
	}

	hasValue(): false {
		return false;
	}

	removeValue(): this {
		return this;
	}

	removeValueAndReturn<UV = V>(
		value: RelatedTo<V, UV>,
	): Op.DynamicResult<BiMap<K, V>, undefined, K, BiMap<K, V>>;
	removeValueAndReturn<UV, O>(
		value: RelatedTo<V, UV>,
		otherwise: OptLazy<O>,
	): Op.DynamicResult<BiMap<K, V>, O, K, BiMap<K, V>>;
	removeValueAndReturn<UV, O>(
		_value: RelatedTo<V, UV>,
		otherwise?: OptLazy<O>,
	): Op.DynamicResult<BiMap<K, V>, O | undefined, K, BiMap<K, V>> {
		return {
			collection: this,
			hasResult: false,
			result: OptLazy(otherwise) as O,
			hasChanged: false,
		};
	}

	removeValues(): this {
		return this;
	}

	removeEntries(): this {
		return this;
	}

	removeEntry(): this {
		return this;
	}

	updateAtValue(): this {
		return this;
	}

	updateAtValueAndReturn(): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		[previous: undefined, current: undefined],
		[previous: K, current: K],
		BiMap.NonEmpty<K, V>
	> {
		return {
			collection: this as any,
			hasResult: false,
			result: [undefined, undefined],
			hasChanged: false,
		};
	}

	modifyAtValue(atValue: V, options: ModifyOptions<K>): BiMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this;
		const { ifNew } = options;
		if (undefined === ifNew) return this;

		const { set, create } = ifNew;
		const skip = Symbol();
		const newKey = undefined !== create ? create(skip) : set;

		if (skip === newKey) return this;
		return this.set(newKey, atValue);
	}

	invert(): BiMap<V, K> {
		return this.context.invertContext().empty<readonly [V, K]>();
	}

	addAndReturn(
		entry: readonly [K, V],
	): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		undefined,
		readonly [K, V],
		BiMap.NonEmpty<K, V>
	> {
		return {
			collection: this.add(entry),
			hasResult: false,
			result: undefined,
			hasChanged: true,
		};
	}

	setAndReturn(
		key: K,
		value: V,
	): Op.DynamicResult<
		BiMap.NonEmpty<K, V>,
		undefined,
		readonly [K, V],
		BiMap.NonEmpty<K, V>
	> {
		return this.addAndReturn([key, value]);
	}

	toBuilder(): BiMap.Builder<K, V> {
		return this.context.builder();
	}

	toString(): string {
		return `BiMap()`;
	}
}
