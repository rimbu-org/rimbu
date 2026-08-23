import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { Op } from '@rimbu/collection-types/types';
import type { RelatedTo } from '@rimbu/common/types';
import type { HashMap } from '@rimbu/hashed/map';

import type { HashMapContext } from '#map/context';

import { MapCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/map-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

export abstract class HashMapNonEmptyBase<K, V>
	extends MapCollectionNonEmptyBase<K, V, HashMap.Advanced.Family<K, V>>
	implements HashMap.NonEmpty<K, V>
{
	abstract readonly context: HashMapContext<K>;

	abstract add(entry: readonly [K, V], hash?: number): HashMap.NonEmpty<K, V>;

	abstract modifyAt(
		atKey: K,
		options: ModifyOptions<V>,
		atKeyHash?: number,
	): HashMap<K, V>;

	set(key: K, value: V): HashMap.NonEmpty<K, V> {
		return this.add([key, value]);
	}

	addAll(entries: StreamSource<readonly [K, V]>): HashMap.NonEmpty<K, V> {
		if (Stream.isEmptyStreamSourceInstance(entries)) return this;

		const builder = this.toBuilder();
		builder.addAll(entries);
		return builder.build().assumeNonEmpty();
	}

	removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): HashMap<K, V> {
		if (Stream.isEmptyStreamSourceInstance(keys)) return this;

		const builder = this.toBuilder();
		builder.removeKeys(keys);
		return builder.build();
	}

	updateAt<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): HashMap.NonEmpty<K, V> {
		if (!this.context.isValidKey(key)) return this;
		return this.modifyAt(key, {
			ifExists: { update },
		}).assumeNonEmpty();
	}

	updateAtAndReturn<UK>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): Op.DynamicResult<
		HashMap.NonEmpty<K, V>,
		[previous: undefined, current: undefined],
		[previous: V, current: V],
		HashMap.NonEmpty<K, V>
	> {
		const token = Symbol();
		let oldValue: V | typeof token = token;
		let newValue: V | undefined;

		const newMap = this.modifyAt(key as K, {
			ifExists: {
				update: (value: V, _remove) => {
					oldValue = value;
					newValue = update(value);
					return newValue;
				},
			},
		});

		if (token === oldValue) {
			return {
				collection: this,
				hasResult: false,
				result: [undefined, undefined],
				hasChanged: false,
			};
		}

		// modifyAt may have returned this if no change
		const hasChanged = newMap !== this;
		return {
			collection: newMap as HashMap.NonEmpty<K, V>,
			hasResult: true,
			result: [oldValue as V, newValue as V],
			hasChanged,
		};
	}

	removeKey<UK>(key: RelatedTo<K, UK>): HashMap<K, V> {
		if (!this.context.hasher.isValid(key)) return this;
		return this.modifyAt(key, {
			ifExists: { update: (_, remove) => remove },
		});
	}

	removeKeyAndReturn<UK>(
		key: RelatedTo<K, UK>,
	): Op.DynamicResult<HashMap.NonEmpty<K, V>, undefined, V, HashMap<K, V>>;
	removeKeyAndReturn<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise: OptLazy<O>,
	): Op.DynamicResult<HashMap.NonEmpty<K, V>, O, V, HashMap<K, V>>;
	removeKeyAndReturn<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
	): Op.DynamicResult<HashMap.NonEmpty<K, V>, O | undefined, V, HashMap<K, V>> {
		if (!this.context.hasher.isValid(key)) {
			return {
				collection: this,
				hasResult: false,
				result: OptLazy(otherwise) as O,
				hasChanged: false,
			};
		}

		const token = Symbol();
		let currentValue: V | typeof token = token;

		const newMap = this.modifyAt(key, {
			ifExists: {
				update: (value, remove) => {
					currentValue = value;
					return remove;
				},
			},
		});

		if (token === currentValue) {
			return {
				collection: this,
				hasResult: false,
				result: OptLazy(otherwise) as O,
				hasChanged: false,
			};
		}

		return {
			collection: newMap as HashMap<K, V>,
			hasResult: true,
			result: currentValue as V,
			hasChanged: true,
		};
	}

	filter(
		pred: (entry: readonly [K, V]) => boolean,
		options: { negate?: boolean | undefined } = {},
	): HashMap<K, V> {
		const builder = this.context.builder<K, V>();

		builder.addAll(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	recompose<K2 extends K, V2>(
		f: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource.NonEmpty<readonly [K2, V2]>,
	): HashMap.NonEmpty<K2, V2>;
	recompose<K2 extends K, V2>(
		f: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<readonly [K2, V2]>,
	): HashMap<K2, V2>;
	recompose<K2 extends K, V2>(
		f: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<readonly [K2, V2]>,
	): HashMap<K2, V2> {
		return this.context.from(f(this.stream()));
	}

	toBuilder(): HashMap.Builder<K, V> {
		return this.context.createBuilder<K, V>(this);
	}

	toString(): string {
		return this.stream().join({
			start: 'HashMap(',
			sep: ', ',
			end: ')',
			valueToString: (entry) => `${entry[0]} -> ${entry[1]}`,
		});
	}

	map: any;
	mapIndexed: any;
	flatMap: any;
	flatMapIndexed: any;

	// map<W extends readonly [any, any]>(
	// 	f: (entry: readonly [K, V]) => W,
	// ): HashMap<W[0], W[1]> {
	// 	return this.context.from(this.stream().map(f));
	// }

	// flatMap<W extends readonly [any, any]>(
	// 	f: (entry: readonly [K, V]) => StreamSource<W>,
	// ): HashMap<W[0], W[1]> {
	// 	const builder = this.context.builder<W[0], W[1]>();
	// 	this.stream().forEach((entry) => {
	// 		const result = f(entry);
	// 		builder.setAll(Stream.from(result).map((e) => e));
	// 	});
	// 	return builder.build();
	// }
}
