import type { BiMultiMap } from '@rimbu/bimultimap';
import type { BiMultiMapCollection } from '@rimbu/bimultimap/advanced/bimultimap-base';
import type { Collection } from '@rimbu/collection-types/collection';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { Op } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common';
import type { MultiMap } from '@rimbu/multimap';
import type { Stream, StreamSource } from '@rimbu/stream';

import type { BiMultiMapContextImpl } from '#bimultimap/context-factory';

import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { checkEmptyModifyOptions } from '@rimbu/collection-types/advanced/common';
import { Stream as StreamImpl } from '@rimbu/stream';

type BiMultiMapTypesNonEmpty<K, V> = Collection.Advanced.TypesNonEmpty<
	BiMultiMap.Advanced.Family<K, V>,
	readonly [K, V]
>;

/**
 * The non-empty BiMultiMap.
 *
 * Every mutation must update **both** backing maps in lockstep, because each is
 * the other's inverse. Rather than re-deriving the reverse map on each call
 * (O(n) per mutation), the two-map structure is mutated through
 * {@link BiMultiMap.Builder}, which already maintains both directions and is
 * covered by the bidirectional differential tests. A result is non-empty iff at
 * least one direction survived, which `copyE` decides by inspecting the forward
 * map alone — valid precisely because the two are exact inverses.
 */
export class BiMultiMapNonEmpty<K, V>
	extends CollectionNonEmpty.Constructor<
		readonly [K, V],
		BiMultiMap.Advanced.Family<K, V>,
		BiMultiMapTypesNonEmpty<K, V>
	>
	implements BiMultiMap.NonEmpty<K, V>
{
	constructor(
		readonly context: BiMultiMapContextImpl<K, V>,
		readonly keyValueMultiMap: MultiMap.NonEmpty<K, V>,
		readonly valueKeyMultiMap: MultiMap.NonEmpty<V, K>,
		readonly size: number,
	) {
		super(context);
	}

	/** `this` as the public non-empty type. */
	get #self(): BiMultiMap.NonEmpty<K, V> {
		return this as unknown as BiMultiMap.NonEmpty<K, V>;
	}

	/** `this` as the public normal type. */
	get #normal(): BiMultiMap<K, V> {
		return this as unknown as BiMultiMap<K, V>;
	}

	get isEmpty(): false {
		return false;
	}

	/** The number of distinct keys — not the number of entries. */
	get keySize(): number {
		return this.keyValueMultiMap.keySize;
	}

	override assumeNonEmpty(): this {
		return this as unknown as this;
	}

	/**
	 * Rebuilds from both directions, reusing `this` when nothing changed.
	 *
	 * Returns the *normal* type: the caller decides via `assumeNonEmpty()`
	 * whether the result still has entries.
	 */
	copy(
		keyValueMultiMap: MultiMap.NonEmpty<K, V>,
		valueKeyMultiMap: MultiMap.NonEmpty<V, K>,
		size: number,
	): BiMultiMap<K, V> {
		if (
			keyValueMultiMap === this.keyValueMultiMap &&
			valueKeyMultiMap === this.valueKeyMultiMap &&
			size === this.size
		) {
			return this.#self;
		}
		return this.context.createNonEmpty(
			keyValueMultiMap,
			valueKeyMultiMap,
		) as unknown as BiMultiMap<K, V>;
	}

	/**
	 * Like {@link copy}, but yields the empty collection when the forward map
	 * emptied out.
	 *
	 * Only the forward map is consulted: the invariant guarantees both directions
	 * empty simultaneously, and both are `NonEmpty`-typed, so a `MultiMap<K,V>`
	 * that is empty has no `MultiMap<V,K>` counterpart to pass.
	 */
	copyE(
		keyValueMultiMap: MultiMap<K, V>,
		valueKeyMultiMap: MultiMap<V, K>,
		size: number,
	): BiMultiMap<K, V> {
		if (keyValueMultiMap.nonEmpty() && valueKeyMultiMap.nonEmpty()) {
			return this.copy(keyValueMultiMap, valueKeyMultiMap, size);
		}
		return this.context.empty<readonly [K, V]>();
	}

	toBuilder(): BiMultiMap.Builder<K, V> {
		return this.context.createBuilder(this.#self);
	}

	mutate(f: (builder: BiMultiMap.Builder<K, V>) => void): BiMultiMap<K, V> {
		const builder = this.toBuilder();
		f(builder);
		return builder.build();
	}

	stream(): Stream.NonEmpty<readonly [K, V]> {
		return this.keyValueMultiMap.stream();
	}

	streamKeys(): Stream.NonEmpty<K> {
		return this.keyValueMultiMap.streamKeys();
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.keyValueMultiMap.streamValues();
	}

	[Symbol.iterator](): ReturnType<BiMultiMap<K, V>[typeof Symbol.iterator]> {
		return this.stream()[Symbol.iterator]() as ReturnType<
			BiMultiMap<K, V>[typeof Symbol.iterator]
		>;
	}

	forEach(f: (entry: readonly [K, V], halt: () => void) => void): void {
		// `MultiMap.forEach` offers no `halt`, so drive the loop off the stream,
		// whose `forEach` does. An early exit must actually stop traversing.
		let halted = false;
		this.stream().forEach((entry) => {
			if (halted) return;
			f(entry, () => {
				halted = true;
			});
		});
	}

	forEachIndexed(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
	): void {
		this.keyValueMultiMap.forEachIndexed(f);
	}

	toArray(): ArrayNonEmpty<readonly [K, V]> {
		return this.stream().toArray();
	}

	getValues<UK = K>(key: RelatedTo<K, UK>): SetCollection<V> {
		return this.keyValueMultiMap.getValues(key);
	}

	getKeys<UV = V>(value: RelatedTo<V, UV>): SetCollection<K> {
		return this.valueKeyMultiMap.getValues(value);
	}

	has<UK = K>(key: RelatedTo<K, UK>): boolean {
		return this.keyValueMultiMap.has(key);
	}

	hasValue<UV = V>(value: RelatedTo<V, UV>): boolean {
		return this.valueKeyMultiMap.has(value);
	}

	/**
	 * Membership of a specific pair.
	 *
	 * Read from the forward map only. A cross-product check against the reverse
	 * map (key present AND value present) would report `true` for pairs that were
	 * never added — that was bug B2.
	 */
	hasEntry<UK = K, UV = V>(
		key: RelatedTo<K, UK>,
		value: RelatedTo<V, UV>,
	): boolean {
		return this.keyValueMultiMap.hasEntry(key, value as V);
	}

	addTo(key: K, value: V): BiMultiMap.NonEmpty<K, V> {
		const builder = this.toBuilder();
		builder.addTo(key, value);
		return builder.build().assumeNonEmpty();
	}

	addEach(
		entries: StreamSource.NonEmpty<readonly [K, V]>,
	): BiMultiMap.NonEmpty<K, V>;
	addEach(entries: StreamSource<readonly [K, V]>): BiMultiMap<K, V>;
	addEach(entries: StreamSource<readonly [K, V]>): BiMultiMap<K, V> {
		if (StreamImpl.isEmptyStreamSourceInstance(entries)) return this.#normal;
		const builder = this.toBuilder();
		builder.addEach(entries);
		return builder.build();
	}

	/**
	 * Replaces the whole value set at `key`.
	 *
	 * Unlike a naive `removeKey` + `setEachValue`, this goes through
	 * `modifyValuesAt` so the reverse map is pruned in the same pass. It also
	 * never assumes the result is non-empty — setting a key to an empty set
	 * removes the key entirely, which can empty the collection. That was bug B4.
	 */
	setEachValue(
		key: K,
		values: StreamSource.NonEmpty<V>,
	): BiMultiMap.NonEmpty<K, V>;
	setEachValue(key: K, values: StreamSource<V>): BiMultiMap<K, V>;
	setEachValue(key: K, values: StreamSource<V>): BiMultiMap<K, V> {
		return this.modifyValuesAt(key, {
			ifNew: { set: values },
			ifExists: { set: values },
		});
	}

	setEachKey(
		value: V,
		keys: StreamSource.NonEmpty<K>,
	): BiMultiMap.NonEmpty<K, V>;
	setEachKey(value: V, keys: StreamSource<K>): BiMultiMap<K, V>;
	setEachKey(value: V, keys: StreamSource<K>): BiMultiMap<K, V> {
		return this.modifyKeysAt(value, {
			ifNew: { set: keys },
			ifExists: { set: keys },
		});
	}

	/**
	 * Applies `ifNew` / `ifExists` to the value set at `atKey`, keeping the
	 * reverse map in step.
	 *
	 * An empty resulting set removes the key entirely: storing an empty set would
	 * make the forward and reverse maps disagree about which keys exist.
	 */
	modifyValuesAt(
		atKey: K,
		options: BiMultiMapCollection.Advanced.ModifySetOptions<V>,
	): BiMultiMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this.#normal;

		const builder = this.toBuilder();
		const { ifNew, ifExists } = options;

		if (undefined !== ifNew) {
			const { set, create } = ifNew;
			builder.setEachValue(atKey, undefined !== create ? create() : set);
		}

		if (undefined !== ifExists) {
			const { set, update } = ifExists;
			// `ifNew` above may have created the key, in which case `ifExists`
			// applies to the freshly created set rather than to an absent one.
			const current = builder.getValues(atKey);
			if (current.nonEmpty()) {
				builder.setEachValue(
					atKey,
					undefined !== update
						? update(current as SetCollection.NonEmpty<V>)
						: set,
				);
			}
		}

		return builder.build();
	}

	/** The reverse-direction twin of {@link modifyValuesAt}. */
	modifyKeysAt(
		atValue: V,
		options: BiMultiMapCollection.Advanced.ModifySetOptions<K>,
	): BiMultiMap<K, V> {
		if (checkEmptyModifyOptions(options)) return this.#normal;

		const builder = this.toBuilder();
		const { ifNew, ifExists } = options;

		if (undefined !== ifNew) {
			const { set, create } = ifNew;
			builder.setEachKey(atValue, undefined !== create ? create() : set);
		}

		if (undefined !== ifExists) {
			const { set, update } = ifExists;
			const current = builder.getKeys(atValue);
			if (current.nonEmpty()) {
				builder.setEachKey(
					atValue,
					undefined !== update
						? update(current as SetCollection.NonEmpty<K>)
						: set,
				);
			}
		}

		return builder.build();
	}

	removeKey<UK = K>(key: RelatedTo<K, UK>): BiMultiMap<K, V> {
		const builder = this.toBuilder();
		builder.removeKey(key);
		return builder.build();
	}

	removeKeyAndReturn<UK = K>(
		key: RelatedTo<K, UK>,
	): Op.DynamicResult<
		BiMultiMap.NonEmpty<K, V>,
		undefined,
		SetCollection<V>,
		BiMultiMap<K, V>
	> {
		const removed = this.getValues(key);
		if (removed.isEmpty) {
			return {
				collection: this.#self,
				hasResult: false,
				result: undefined,
				hasChanged: false,
			};
		}

		return {
			collection: this.removeKey(key).assumeNonEmpty(),
			hasResult: true,
			result: removed,
			hasChanged: true,
		};
	}

	removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): BiMultiMap<K, V> {
		if (StreamImpl.isEmptyStreamSourceInstance(keys)) return this.#normal;
		const builder = this.toBuilder();
		builder.removeKeys(keys);
		return builder.build();
	}

	removeEntry<UK = K, UV = V>(
		key: RelatedTo<K, UK>,
		value: RelatedTo<V, UV>,
	): BiMultiMap<K, V> {
		const builder = this.toBuilder();
		builder.removeEntry(key, value);
		return builder.build();
	}

	removeEntries<UK = K, UV = V>(
		entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>,
	): BiMultiMap<K, V> {
		if (StreamImpl.isEmptyStreamSourceInstance(entries)) return this.#normal;
		const builder = this.toBuilder();
		builder.removeEntries(entries);
		return builder.build();
	}

	removeValue<UV = V>(value: RelatedTo<V, UV>): BiMultiMap<K, V> {
		const builder = this.toBuilder();
		builder.removeValue(value);
		return builder.build();
	}

	removeValues<UV = V>(
		values: StreamSource<RelatedTo<V, UV>>,
	): BiMultiMap<K, V> {
		if (StreamImpl.isEmptyStreamSourceInstance(values)) return this.#normal;
		const builder = this.toBuilder();
		builder.removeValues(values);
		return builder.build();
	}

	/**
	 * Swaps the two directions.
	 *
	 * The maps are exact inverses, so the reverse map *is* already a valid
	 * `K → V` multimap for the inverted collection — no rebuild needed.
	 */
	invert(): BiMultiMap.NonEmpty<V, K> {
		return this.context.createNonEmpty(
			this.valueKeyMultiMap,
			this.keyValueMultiMap,
		) as unknown as BiMultiMap.NonEmpty<V, K>;
	}

	mapValues<V2 extends V>(
		mapFun: (value: V, key: K) => V2,
	): BiMultiMap.NonEmpty<K, V2> {
		// Mapping values one-to-one keeps every pair distinct, so the reverse map
		// is just the same pairs with the two sides swapped.
		const builder = this.context.createBuilder<K, V2>();
		this.forEach(([key, value]) => {
			builder.addTo(key, mapFun(value, key));
		});

		return builder.build().assumeNonEmpty();
	}

	map<K2 extends K, V2 extends V>(
		mapFun: (entry: readonly [K, V]) => readonly [K2, V2],
	): BiMultiMap.NonEmpty<K2, V2> {
		return this.context
			.from<readonly [K2, V2]>(this.stream().map(mapFun))
			.assumeNonEmpty();
	}

	mapIndexed<K2 extends K, V2 extends V>(
		mapFun: (entry: readonly [K, V], index: number) => readonly [K2, V2],
		options?: { indexOffset?: number | undefined } | undefined,
	): BiMultiMap.NonEmpty<K2, V2> {
		const { indexOffset = 0 } = options ?? {};
		let index = indexOffset;
		return this.context
			.from<readonly [K2, V2]>(
				this.stream().map((entry) => mapFun(entry, index++)),
			)
			.assumeNonEmpty();
	}

	flatMap<K2 extends K, V2 extends V>(
		flatMapFun: (
			entry: readonly [K, V],
		) => StreamSource.NonEmpty<readonly [K2, V2]>,
	): BiMultiMap.NonEmpty<K2, V2>;
	flatMap<K2 extends K, V2 extends V>(
		flatMapFun: (entry: readonly [K, V]) => StreamSource<readonly [K2, V2]>,
	): BiMultiMap<K2, V2>;
	flatMap<K2 extends K, V2 extends V>(
		flatMapFun: (entry: readonly [K, V]) => StreamSource<readonly [K2, V2]>,
	): BiMultiMap<K2, V2> {
		return this.context.from<readonly [K2, V2]>(
			this.stream().flatMap(flatMapFun),
		);
	}

	flatMapIndexed<K2 extends K, V2 extends V>(
		flatMapFun: (
			entry: readonly [K, V],
			index: number,
		) => StreamSource<readonly [K2, V2]>,
		options: { indexOffset?: number | undefined } | undefined,
	): BiMultiMap<K2, V2>;
	flatMapIndexed<K2 extends K, V2 extends V>(
		flatMapFun: (
			entry: readonly [K, V],
			index: number,
		) => StreamSource.NonEmpty<readonly [K2, V2]>,
		options?: { indexOffset?: number | undefined } | undefined,
	): BiMultiMap.NonEmpty<K2, V2>;
	flatMapIndexed<K2 extends K, V2 extends V>(
		flatMapFun: (
			entry: readonly [K, V],
			index: number,
		) => StreamSource<readonly [K2, V2]>,
		options?: { indexOffset?: number | undefined } | undefined,
	): BiMultiMap<K2, V2> {
		const { indexOffset = 0 } = options ?? {};
		let index = indexOffset;
		return this.context.from<readonly [K2, V2]>(
			this.stream().flatMap((entry) => flatMapFun(entry, index++)),
		);
	}

	filter<E2 extends readonly [K, V]>(
		pred: (element: readonly [K, V]) => element is E2,
		options?: { negate?: false | undefined } | undefined,
	): Collection.Advanced.ReTyped<BiMultiMapTypesNonEmpty<K, V>, E2>['_NORMAL'];
	filter(
		pred: (element: readonly [K, V], index?: number) => boolean,
		options?: { negate?: boolean | undefined } | undefined,
	): BiMultiMap<K, V>;
	filter(
		pred: (element: readonly [K, V], index?: number) => boolean,
		options?: { negate?: boolean | undefined } | undefined,
	): BiMultiMap<K, V> {
		const { negate = false } = options ?? {};
		const builder = this.context.createBuilder<K, V>();

		this.forEach((entry) => {
			if (negate !== pred(entry)) {
				builder.addTo(entry[0], entry[1]);
			}
		});

		return builder.build();
	}

	filterIndexed<E2 extends readonly [K, V]>(
		pred: (element: readonly [K, V], index: number) => element is E2,
		options?: { negate?: false | undefined } | undefined,
	): Collection.Advanced.ReTyped<BiMultiMapTypesNonEmpty<K, V>, E2>['_NORMAL'];
	filterIndexed(
		pred: (element: readonly [K, V], index: number) => boolean,
		options?: { negate?: boolean | undefined } | undefined,
	): BiMultiMap<K, V>;
	filterIndexed(
		pred: (element: readonly [K, V], index: number) => boolean,
		options?: { negate?: boolean | undefined } | undefined,
	): BiMultiMap<K, V> {
		const { negate = false } = options ?? {};
		const builder = this.context.createBuilder<K, V>();

		let index = 0;

		this.forEach((entry) => {
			if (negate !== pred(entry, index++)) {
				builder.addTo(entry[0], entry[1]);
			}
		});

		return builder.build();
	}

	recompose<K2 extends K, V2 extends V>(
		recomposeFun: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource.NonEmpty<readonly [K2, V2]>,
	): BiMultiMap.NonEmpty<K2, V2>;
	recompose<K2 extends K, V2 extends V>(
		recomposeFun: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<readonly [K2, V2]>,
	): BiMultiMap<K2, V2>;
	recompose<K2 extends K, V2 extends V>(
		recomposeFun: (
			stream: Stream.NonEmpty<readonly [K, V]>,
		) => StreamSource<readonly [K2, V2]>,
	): BiMultiMap<K2, V2> {
		return this.context.from<readonly [K2, V2]>(recomposeFun(this.stream()));
	}

	asNormal(): BiMultiMap<K, V> {
		return this.#normal;
	}

	toString(): string {
		// Keyed traversal, so each key is rendered once with its whole value set
		// rather than once per pair.
		return this.keyValueMultiMap.streamKeys().join({
			start: `${this.context.typeTag}(`,
			sep: ', ',
			end: ')',
			valueToString: (key: K) =>
				`${key} <-> ${this.keyValueMultiMap
					.getValues(key)
					.stream()
					.join({ start: '(', sep: ', ', end: ')' })}`,
		});
	}
}
