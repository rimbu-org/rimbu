import type { RMap } from '@rimbu/collection-types';
import type {
	KeyValue,
	ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type {
	ArrayNonEmpty,
	RelatedTo,
	ToJSON,
	WithValueResult,
} from '@rimbu/common/types';

export type { WithValueResult };

import type {
	FastIterable,
	Stream,
	Streamable,
	StreamSource,
} from '@rimbu/stream';

import type { BiMapCreators, BiMapFactory } from '#bimap/factory';

import { createBiMapContextModule } from '#bimap/context-factory';

/**
 * A type-invariant immutable bi-directional Map where keys and values have a one-to-one mapping.
 * See the [BiMap documentation](https://rimbu.org/docs/collections/bimap) and the [BiMap API documentation](https://rimbu.org/api/rimbu/bimap/BiMap/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * import { BiMap } from '@rimbu/bimap';
 *
 * const b1 = BiMap.empty<number, string>()
 * const b2 = BiMap.of([1, 'a'], [2, 'b'])
 * ```
 */
export interface BiMap<K, V> extends FastIterable<readonly [K, V]> {
	/**
	 * Returns the `context` associated to this collection instance.
	 */
	readonly context: BiMap.Context<K, V>;
	/**
	 * Returns true if the collection is empty.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.empty<number, number>().isEmpty); // => true
	 * console.log(BiMap.of([1, 1], [2, 2]).isEmpty); // => false
	 * ```
	 */
	readonly isEmpty: boolean;
	/**
	 * Returns the number of entries
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 1], [2, 2]).size); // => 2
	 * ```
	 */
	readonly size: number;
	/**
	 * Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection
	 * as a .NonEmpty type.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m: BiMap<number, number> = BiMap.of([1, 1], [2, 2])
	 * console.log(m.stream().first(0)); // => [ 1, 1 ]
	 * if (m.nonEmpty()) {
	 *   console.log(m.stream().first()); // => [ 1, 1 ]
	 * }
	 * ```
	 */
	nonEmpty(): this is BiMap.NonEmpty<K, V>;
	/**
	 * Returns the collection as a .NonEmpty type
	 * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const empty = BiMap.empty<number, number>()
	 * try {
	 *   empty.assumeNonEmpty()
	 * } catch (e) {
	 *   console.log((e as Error).name); // => EmptyCollectionAssumedNonEmptyError
	 * }
	 * const m: BiMap<number, number> = BiMap.of([1, 1], [2, 2])
	 * const m3: BiMap.NonEmpty<number, number> = m.assumeNonEmpty()
	 * console.log(m3.nonEmpty()); // => true
	 * ```
	 * @note returns reference to this collection
	 */
	assumeNonEmpty(): BiMap.NonEmpty<K, V>;
	/**
	 * Returns the Map representation of the key to value mapping.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 10], [2, 20]).keyValueMap.toArray());
	 * // => [ [ 1, 10 ], [ 2, 20 ] ]
	 * ```
	 */
	readonly keyValueMap: RMap<K, V>;
	/**
	 * Returns the Map representation of the key to value mapping.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 10], [2, 20]).valueKeyMap.toArray());
	 * // => [ [ 10, 1 ], [ 20, 2 ] ]
	 * ```
	 */
	readonly valueKeyMap: RMap<V, K>;
	/**
	 * Returns true if the given `key` is present in the collection.
	 * @param key - the key to look for
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 'a'], [2, 'b'])
	 * console.log(m.hasKey(2)); // => true
	 * console.log(m.hasKey(3)); // => false
	 * ```
	 */
	hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
	/**
	 * Returns true if the given `value` is present in the collection.
	 * @param value - the value to look for
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 'a'], [2, 'b'])
	 * console.log(m.hasValue('a')); // => true
	 * console.log(m.hasValue('z')); // => false
	 * ```
	 */
	hasValue<UV = V>(value: RelatedTo<V, UV>): boolean;
	/**
	 * Returns the value associated with the given `key`, or given `otherwise` value if the key is not in the collection.
	 * @param key - the key to look for
	 * @param otherwise - (default: undefined) an `OptLazy` fallback value if the key is not in the collection
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 'a'], [2, 'b'])
	 * console.log(m.getValue(2)); // => b
	 * console.log(m.getValue(3)); // => undefined
	 * console.log(m.getValue(2, 'none')); // => b
	 * console.log(m.getValue(3, 'none')); // => none
	 * ```
	 */
	getValue<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	getValue<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	/**
	 * Returns the key associated with the given `value`, or given `otherwise` value if the key is not in the collection.
	 * @param value - the value to look for
	 * @param otherwise - (default: undefined) an `OptLazy` fallback value if the value is not in the collection
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 'a'], [2, 'b'])
	 * console.log(m.getKey('b')); // => 2
	 * console.log(m.getKey('z')); // => undefined
	 * console.log(m.getKey('b', 'none')); // => 2
	 * console.log(m.getKey('z', 'none')); // => none
	 * ```
	 */
	getKey<UV = V>(value: RelatedTo<V, UV>): K | undefined;
	getKey<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;
	/**
	 * Returns the collection with the given `key` associated to the given `value`.
	 * @param key - the entry key to add
	 * @param value - the entry value to add
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 1], [2, 2]).set(1, 2).toArray());
	 * // => [ [ 1, 2 ] ]
	 * ```
	 * @note if the key and/or value are already associated, the previous value will be 'replaced'
	 */
	set(key: K, value: V): BiMap.NonEmpty<K, V>;
	/**
	 * Returns a tuple `[newBiMap, entry, hasValue]` containing the collection with given `key` associated to given
	 * `value`, the entry that was previously associated with the `key` (or, if the `key` was not present, the entry
	 * that was previously associated with the `value`), and a `hasValue` flag indicating whether a previous entry was
	 * returned. If the given entry is entirely new (neither the `key` nor the `value` were present before) nothing is
	 * displaced and `entry` is `undefined` with `hasValue: false`. Otherwise `entry` holds the previously associated
	 * entry and `hasValue` is `true`, even when the key/value were already present with the exact same entry — in that
	 * case the collection is unchanged (`newBiMap === this`).
	 * @param key - the entry key to add
	 * @param value - the entry value to add
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const r1 = BiMap.of([1, 'a']).setAndGet(2, 'b')
	 * console.log([r1[0].toString(), r1[1], r1[2]]); // => [ "BiMap(1 <-> a, 2 <-> b)", undefined, false ]
	 * const r2 = BiMap.of([1, 'a']).setAndGet(1, 'b')
	 * console.log([r2[0].toString(), r2[1], r2[2]]); // => [ "BiMap(1 <-> b)", [ 1, "a" ], true ]
	 * const r3 = BiMap.of([1, 'a']).setAndGet(2, 'a')
	 * console.log([r3[0].toString(), r3[1], r3[2]]); // => [ "BiMap(2 <-> a)", [ 1, "a" ], true ]
	 * const r4 = BiMap.of([1, 'a']).setAndGet(1, 'a')
	 * console.log([r4[0].toString(), r4[1], r4[2]]); // => [ "BiMap(1 <-> a)", [ 1, "a" ], true ]
	 * ```
	 * @note if the key and/or value are already associated, the previous value/key will be 'replaced' and the
	 * displaced entry is returned
	 */
	setAndGet(
		key: K,
		value: V,
	): WithValueResult<BiMap.NonEmpty<K, V>, readonly [K, V]>;
	/**
	 * Returns the collection with given `entry` added.
	 * @param entry - a tuple containing a key and value
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 1], [2, 2]).addEntry([1, 2]).toArray());
	 * // => [ [ 1, 2 ] ]
	 * ```
	 */
	addEntry(entry: readonly [K, V]): BiMap.NonEmpty<K, V>;
	/**
	 * Returns a tuple `[newBiMap, entry, hasValue]` containing the collection with given `entry` added, the entry that
	 * was previously associated with the entry's `key` (or, if the key was not present, the entry that was previously
	 * associated with the entry's `value`), and a `hasValue` flag indicating whether a previous entry was returned. If
	 * the given entry is entirely new (neither its key nor its value were present before) nothing is displaced and
	 * `entry` is `undefined` with `hasValue: false`. Otherwise `entry` holds the previously associated entry and
	 * `hasValue` is `true`, even when the exact entry was already present — in that case the collection is unchanged
	 * (`newBiMap === this`).
	 * @param entry - a tuple containing a key and value
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const r1 = BiMap.of([1, 'a']).addEntryAndGet([2, 'b'])
	 * console.log([r1[0].toString(), r1[1], r1[2]]); // => [ "BiMap(1 <-> a, 2 <-> b)", undefined, false ]
	 * const r2 = BiMap.of([1, 'a']).addEntryAndGet([1, 'b'])
	 * console.log([r2[0].toString(), r2[1], r2[2]]); // => [ "BiMap(1 <-> b)", [ 1, "a" ], true ]
	 * const r3 = BiMap.of([1, 'a']).addEntryAndGet([2, 'a'])
	 * console.log([r3[0].toString(), r3[1], r3[2]]); // => [ "BiMap(2 <-> a)", [ 1, "a" ], true ]
	 * const r4 = BiMap.of([1, 'a']).addEntryAndGet([1, 'a'])
	 * console.log([r4[0].toString(), r4[1], r4[2]]); // => [ "BiMap(1 <-> a)", [ 1, "a" ], true ]
	 * ```
	 * @note if the key and/or value are already associated, the previous value/key will be 'replaced' and the
	 * displaced entry is returned
	 */
	addEntryAndGet(
		entry: readonly [K, V],
	): WithValueResult<BiMap.NonEmpty<K, V>, readonly [K, V]>;

	/**
	 * Returns the collection with the entries from the given `StreamSource` `entries` added.
	 * @param entries - a `StreamSource` containing tuples with a key and value
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 1]).addEntries([[2, 2], [1, 3]]).toArray());
	 * // => [ [ 1, 3 ], [ 2, 2 ] ]
	 * ```
	 */
	addEntries(
		entries: StreamSource.NonEmpty<readonly [K, V]>,
	): BiMap.NonEmpty<K, V>;
	addEntries(entries: StreamSource<readonly [K, V]>): BiMap<K, V>;

	/**
	 * Returns the collection where the entry associated with given `key` is removed if it was part of the collection.
	 * @param key - the key of the entry to remove
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * console.log(m.removeKey(2).toArray()); // => [ [ 1, 1 ] ]
	 * console.log(m.removeKey(3) === m); // => true
	 * ```
	 * @note guarantees same object reference if the value is not present
	 */
	removeKey<UK = K>(key: RelatedTo<K, UK>): BiMap<K, V>;
	/**
	 * Returns a tuple `[newBiMap, value, hasValue]` containing the collection of which the entry associated with given
	 * `key` is removed, the value that was associated with that key, and a `hasValue` flag indicating whether the key
	 * was present. If the key is not present, `newBiMap` is unchanged and `hasValue` is `false`.
	 * @param key - the key of the entry to remove
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * const result = m.removeKeyAndGet(2)
	 * if (result[2]) console.log([result[0].toString(), result[1]]); // => [ "BiMap(1 <-> 1)", 2 ]
	 * const missing = m.removeKeyAndGet(3)
	 * console.log([missing[0].toString(), missing[1], missing[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 2)", undefined, false ]
	 * ```
	 */
	removeKeyAndGet<UK = K>(
		key: RelatedTo<K, UK>,
	): WithValueResult<BiMap<K, V>, V>;

	/**
	 * Returns the collection where the entries associated with each key in given `keys` are removed if they were present.
	 * @param keys - a `StreamSource` of keys to remove
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * console.log(m.removeKeys([1, 3]).toArray()); // => [ [ 2, 2 ] ]
	 * console.log(m.removeKeys([1, 3, 2]).toArray()); // => []
	 * console.log(m.removeKeys([3, 4, 5]) === m); // => true
	 * ```
	 * @note guarantees same object reference if none of the keys are present
	 */
	removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): BiMap<K, V>;
	/**
	 * Returns the collection where the entry associated with given `value` is removed if it was part of the collection.
	 * @param value - the value of the entry to remove
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * console.log(m.removeValue(2).toArray()); // => [ [ 1, 1 ] ]
	 * console.log(m.removeValue(3) === m); // => true
	 * ```
	 * @note guarantees same object reference if the value is not present
	 */
	removeValue<UV = V>(value: RelatedTo<V, UV>): BiMap<K, V>;

	/**
	 * Returns a tuple `[newBiMap, key, hasValue]` containing the collection of which the entry associated with given
	 * `value` is removed, the key that was associated with that value, and a `hasValue` flag indicating whether the value
	 * was present. If the value is not present, `newBiMap` is unchanged and `hasValue` is `false`.
	 * @param value - the value of the entry to remove
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * const result = m.removeValueAndGet(2)
	 * if (result[2]) console.log([result[0].toString(), result[1]]); // => [ "BiMap(1 <-> 1)", 2 ]
	 * const missing = m.removeValueAndGet(3)
	 * console.log([missing[0].toString(), missing[1], missing[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 2)", undefined, false ]
	 * ```
	 */
	removeValueAndGet<UV = V>(
		value: RelatedTo<V, UV>,
	): WithValueResult<BiMap<K, V>, K>;

	/**
	 * Returns the collection where the entries associated with each value in given `values` are removed if they were present.
	 * @param values - a `StreamSource` of values to remove
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * console.log(m.removeValues([1, 3]).toArray()); // => [ [ 2, 2 ] ]
	 * console.log(m.removeValues([1, 3, 2]).toArray()); // => []
	 * console.log(m.removeValues([3, 4, 5]) === m); // => true
	 * ```
	 * @note guarantees same object reference if none of the values are present
	 */
	removeValues<UV = V>(values: StreamSource<RelatedTo<V, UV>>): BiMap<K, V>;
	/**
	 * Returns the collection where the entry associated with given `key` and `value` is removed, but only if both the
	 * key and value match an existing entry.
	 * @param entry - a tuple containing the key and value of the entry to remove
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 'a'], [2, 'b'])
	 * console.log(m.removeEntry([2, 'b']).toArray()); // => [ [ 1, "a" ] ]
	 * console.log(m.removeEntry([2, 'c']) === m); // => true
	 * console.log(m.removeEntry([3, 'b']) === m); // => true
	 * ```
	 * @note guarantees same object reference if no matching entry was removed
	 */
	removeEntry(entry: readonly [K, V]): BiMap<K, V>;
	/**
	 * Returns the collection where the value associated with given `key` is updated with the given `valueUpdate` value or update function.
	 * @param key - the key of the entry to update
	 * @param valueUpdate - a function taking the current value and returning a new value
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * console.log(m.updateValueAtKey(3, v => v + 100).toArray());
	 * // => [ [ 1, 1 ], [ 2, 2 ] ]
	 * console.log(m.updateValueAtKey(2, v => v + 8).toArray());
	 * // => [ [ 1, 1 ], [ 2, 10 ] ]
	 * console.log(m.updateValueAtKey(1, v => v + 1).toArray());
	 * // => [ [ 1, 2 ] ]
	 * ```
	 */
	updateValueAtKey<UK = K>(
		key: RelatedTo<K, UK>,
		valueUpdate: (value: V) => V,
	): BiMap<K, V>;
	/**
	 * Returns the collection where the key associated with given `value` is updated with the given `keyUpdate` update function.
	 * @param keyUpdate - a function taking the current key and returning a new key
	 * @param value - the value of the entry to update
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * console.log(m.updateKeyAtValue(k => k + 100, 3).toArray());
	 * // => [ [ 1, 1 ], [ 2, 2 ] ]
	 * console.log(m.updateKeyAtValue(k => k + 8, 2).toArray());
	 * // => [ [ 1, 1 ], [ 10, 2 ] ]
	 * console.log(m.updateKeyAtValue((k) => k + 1, 1).toArray());
	 * // => [ [ 2, 1 ] ]
	 * ```
	 */
	updateKeyAtValue<UV = V>(
		keyUpdate: (key: K) => K,
		value: RelatedTo<V, UV>,
	): BiMap<K, V>;
	/**
	 * Returns a tuple `[newBiMap, value, hasValue]` of the updated collection and the previous value that was
	 * associated with the key, or the unchanged collection and `undefined` if the `key` is not present. The `hasValue`
	 * flag indicates whether the `key` was present; if it was, `value` is the previous value and `hasValue` is `true`,
	 * even when the update function returns the same value (a no-op, where `newBiMap` is unchanged and
	 * `result[0] === this`).
	 * @param key - the key of the entry to update
	 * @param valueUpdate - a function taking the current value and returning a new value
	 * @typeparam UK - the key type to accept, related to `K`
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * const r1 = m.updateValueAtKeyAndGet(3, v => v + 1)
	 * console.log([r1[0].toString(), r1[1], r1[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 2)", undefined, false ]
	 * const r2 = m.updateValueAtKeyAndGet(2, v => v + 10)
	 * console.log([r2[0].toString(), r2[1], r2[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 12)", 2, true ]
	 * const r3 = m.updateValueAtKeyAndGet(2, v => v)
	 * console.log([r3[0].toString(), r3[1], r3[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 2)", 2, true ]
	 * ```
	 */
	updateValueAtKeyAndGet<UK = K>(
		key: RelatedTo<K, UK>,
		valueUpdate: (value: V) => V,
	): WithValueResult<BiMap.NonEmpty<K, V>, V, BiMap<K, V>>;

	/**
	 * Returns a tuple `[newBiMap, key, hasValue]` of the updated collection and the previous key that was associated
	 * with the value, or the unchanged collection and `undefined` if the `value` is not present. The `hasValue` flag
	 * indicates whether the `value` was present; if it was, `key` is the previous key and `hasValue` is `true`, even when
	 * the update function returns the same key (a no-op, where `newBiMap` is unchanged and `result[0] === this`).
	 * @param keyUpdate - a function taking the current key and returning a new key
	 * @param value - the value of the entry to update
	 * @typeparam UV - the value type to accept, related to `V`
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * const r1 = m.updateKeyAtValueAndGet(k => k + 1, 3)
	 * console.log([r1[0].toString(), r1[1], r1[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 2)", undefined, false ]
	 * const r2 = m.updateKeyAtValueAndGet(k => k + 10, 2)
	 * console.log([r2[0].toString(), r2[1], r2[2]]); // => [ "BiMap(1 <-> 1, 12 <-> 2)", 2, true ]
	 * const r3 = m.updateKeyAtValueAndGet(k => k, 2)
	 * console.log([r3[0].toString(), r3[1], r3[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 2)", 2, true ]
	 * ```
	 */
	updateKeyAtValueAndGet<UV = V>(
		keyUpdate: (key: K) => K,
		value: RelatedTo<V, UV>,
	): WithValueResult<BiMap.NonEmpty<K, V>, K, BiMap<K, V>>;

	/**
	 * Returns the collection with the entry at given `atKey` key modified according to given `options`.
	 * @param atKey - the key at which to modify the collection
	 * @param options - an object containing the following information:<br/>
	 * - ifNew: (optional) if the given `atKey` is not present, this value or function will be used to generate a new value.
	 * If a function returning the given token is used, no new entry is created.<br/>
	 * - ifExists: (optional) if a value is associated with given `atKey`, this function is called with the current value
	 * to return a new value. If it returns the given `remove` token, the entry is removed.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * console.log(m.modifyAtKey(3, { ifNew: { set: 3 } }).toArray()); // => [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]
	 * console.log(m.modifyAtKey(2, { ifExists: { update: v => v + 10 } }).toArray()); // => [ [ 1, 1 ], [ 2, 12 ] ]
	 * ```
	 */
	modifyAtKey(atKey: K, options: ModifyOptions<V>): BiMap<K, V>;
	/**
	 * Returns the collection with the entry at given `atValue` value modified according to given `options`.
	 * @param atValue - the value at which to modify the collection
	 * @param options - an object containing the following information:<br/>
	 * - ifNew: (optional) if the given `atValue` is not present, this value or function will be used to generate a new key.
	 * If a function returning the given token is used, no new entry is created.<br/>
	 * - ifExists: (optional) if a key is associated with given `atValue`, this function is called with the current key
	 * to return a new key. If it returns the given `remove` token, the entry is removed.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const m = BiMap.of([1, 1], [2, 2])
	 * console.log(m.modifyAtValue(3, { ifNew: { set: 3 } }).toArray()); // => [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ] ]
	 * console.log(m.modifyAtValue(2, { ifExists: { update: k => k + 10 } }).toArray()); // => [ [ 1, 1 ], [ 2, 2 ], [ 12, 2 ] ]
	 * ```
	 */
	modifyAtValue(atValue: V, options: ModifyOptions<K>): BiMap<K, V>;
	/**
	 * Returns a `Stream` containing all entries of this collection as tuples of key and value.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 1], [2, 2]).stream().toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
	 * ```
	 */
	stream(): Stream<readonly [K, V]>;
	/**
	 * Returns a `Stream` containing all keys of this collection.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 'a'], [2, 'b']).streamKeys().toArray()); // => [ 1, 2 ]
	 * ```
	 */
	streamKeys(): Stream<K>;
	/**
	 * Returns a `Stream` containing all values of this collection.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 'a'], [2, 'b']).streamValues().toArray()); // => [ "a", "b" ]
	 * ```
	 */
	streamValues(): Stream<V>;
	/**
	 * Performs given function `f` for each entry of the collection, using given `state` as initial traversal state.
	 * @param f - the function to perform for each entry, receiving:<br/>
	 * - `entry`: the next tuple of a key and value<br/>
	 * - `index`: the index of the element<br/>
	 * - `halt`: a function that, if called, ensures that no new elements are passed
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - state: (optional) the traverse state
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const collected: [string, number][] = []
	 * BiMap.of([1, 'a'], [2, 'b'], [3, 'c']).forEach((entry, i, halt) => {
	 *   collected.push([entry[1], entry[0]]);
	 *   if (i >= 1) halt();
	 * })
	 * console.log(collected); // => [ [ "a", 1 ], [ "b", 2 ] ]
	 * ```
	 * @note O(N)
	 */
	forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options?: { state?: TraverseState },
	): void;
	/**
	 * Returns a collection containing only those entries that satisfy given `pred` predicate.
	 * @param pred - a predicate function receiving:<br/>
	 * - `entry`: the next entry<br/>
	 * - `index`: the entry index<br/>
	 * - `halt`: a function that, when called, ensures no next elements are passed
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - negate: (default: false) when true will negate the given predicate
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 'a'], [2, 'b'], [3, 'c']).filter(entry => entry[0] === 2 || entry[1] === 'c').toArray());
	 * // => [ [ 2, "b" ], [ 3, "c" ] ]
	 * ```
	 */
	filter(
		pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean,
		options?: { negate?: boolean },
	): BiMap<K, V>;
	/**
	 * Returns a builder object containing the entries of this collection.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * const builder: BiMap.Builder<number, string> = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
	 * ```
	 */
	toBuilder(): BiMap.Builder<K, V>;
	/**
	 * Returns an array containing all entries in this collection.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 'a'], [2, 'b']).toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
	 * ```
	 * @note O(log(N))
	 * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
	 */
	toArray(): (readonly [K, V])[];
	/**
	 * Returns a string representation of this collection.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 'a'], [2, 'b']).toString()); // => BiMap(1 <-> a, 2 <-> b)
	 * ```
	 */
	toString(): string;
	/**
	 * Returns a JSON representation of this collection.
	 * @example
	 * ```ts
	 * import { BiMap } from '@rimbu/bimap';
	 *
	 * console.log(BiMap.of([1, 'a'], [2, 'b']).toJSON()); // => { dataType: "BiMap", value: [ [ 1, "a" ], [ 2, "b" ] ] }
	 * ```
	 */
	toJSON(): ToJSON<(readonly [K, V])[], this['context']['typeTag']>;
}

export namespace BiMap {
	/**
	 * A non-empty type-invariant immutable bi-directional Map where keys and values have a one-to-one mapping.
	 * See the [BiMap documentation](https://rimbu.org/docs/collections/bimap) and the [BiMap API documentation](https://rimbu.org/api/rimbu/bimap/BiMap/interface)
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 */
	export interface NonEmpty<K, V>
		extends BiMap<K, V>,
			Streamable.NonEmpty<readonly [K, V]> {
		/**
		 * Returns false since this collection is known to be non-empty.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.of([1, 1], [2, 2]).isEmpty); // => false
		 * ```
		 */
		readonly isEmpty: false;
		/**
		 * Returns true since this collection is known to be non-empty
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.of([1, 1], [2, 2]).nonEmpty()); // => true
		 * ```
		 */
		nonEmpty(): this is BiMap.NonEmpty<K, V>;
		/**
		 * Returns a self reference since this collection is known to be non-empty.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 1], [2, 2]);
		 * console.log(m === m.assumeNonEmpty()); // => true
		 * ```
		 */
		assumeNonEmpty(): this;
		/**
		 * Returns this collection typed as a 'possibly empty' collection.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * BiMap.of([1, 1], [2, 2]).asNormal();  // type: BiMap<number, number>
		 * ```
		 */
		asNormal(): BiMap<K, V>;
		/**
		 * Returns the non-empty Map representation of the key to value mapping.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.of([1, 10], [2, 20]).keyValueMap.toArray());
		 * // => [ [ 1, 10 ], [ 2, 20 ] ]
		 * ```
		 */
		readonly keyValueMap: RMap.NonEmpty<K, V>;
		/**
		 * Returns the non-empty Map representation of the key to value mapping.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.of([1, 10], [2, 20]).valueKeyMap.toArray());
		 * // => [ [ 10, 1 ], [ 20, 2 ] ]
		 * ```
		 */
		readonly valueKeyMap: RMap.NonEmpty<V, K>;
		/**
		 * Returns the collection with the entries from the given `StreamSource` `entries` added.
		 * @param entries - a `StreamSource` containing tuples with a key and value
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.of([1, 1]).addEntries([[2, 2], [1, 3]]).toArray());
		 * // => [ [ 1, 3 ], [ 2, 2 ] ]
		 * ```
		 */
		addEntries(entries: StreamSource<readonly [K, V]>): BiMap.NonEmpty<K, V>;
		/**
		 * Returns a tuple `[newBiMap, value, hasValue]` containing the collection of which the entry associated with given
		 * `key` is removed, the value that was associated with that key, and a `hasValue` flag indicating whether the key
		 * was present. If the key is not present, `newBiMap` is unchanged (and still non-empty) and `hasValue` is `false`.
		 */
		removeKeyAndGet<UK = K>(
			key: RelatedTo<K, UK>,
		): WithValueResult<BiMap<K, V>, V, BiMap.NonEmpty<K, V>>;

		/**
		 * Returns the collection where the value associated with given `key` is updated with the given `update` function.
		 * @param key - the key of the entry to update
		 * @param valueUpdate - a function taking the current value and returning a new value
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 1], [2, 2])
		 * console.log(m.updateValueAtKey(3, v => v + 100).toArray());
		 * // => [ [ 1, 1 ], [ 2, 2 ] ]
		 * console.log(m.updateValueAtKey(2, v => v + 8).toArray());
		 * // => [ [ 1, 1 ], [ 2, 10 ] ]
		 * console.log(m.updateValueAtKey(1, v => v + 1).toArray());
		 * // => [ [ 1, 2 ] ]
		 * ```
		 */
		updateValueAtKey<UK = K>(
			key: RelatedTo<K, UK>,
			valueUpdate: (value: V) => V,
		): BiMap.NonEmpty<K, V>;
		/**
		 * Returns the collection where the key associated with given `value` is updated with the given `update` function.
		 * @param keyUpdate - a function taking the current key and returning a new key
		 * @param value - the value of the entry to update
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 1], [2, 2])
		 * console.log(m.updateKeyAtValue(k => k + 100, 3).toArray());
		 * // => [ [ 1, 1 ], [ 2, 2 ] ]
		 * console.log(m.updateKeyAtValue(k => k + 8, 2).toArray());
		 * // => [ [ 1, 1 ], [ 10, 2 ] ]
		 * console.log(m.updateKeyAtValue((k) => k + 1, 1).toArray());
		 * // => [ [ 2, 1 ] ]
		 * ```
		 */
		updateKeyAtValue<UV = V>(
			keyUpdate: (key: K) => K,
			value: RelatedTo<V, UV>,
		): BiMap.NonEmpty<K, V>;
		/**
		 * Returns a tuple `[newBiMap, key, hasValue]` of the updated non-empty collection and the previous key that was
		 * associated with the value, or the unchanged collection and `undefined` if the `value` is not present. The `hasValue`
		 * flag indicates whether the `value` was present; if it was, `key` is the previous key and `hasValue` is `true`, even
		 * when the update function returns the same key (a no-op, where `newBiMap` is unchanged and `result[0] === this`).
		 * @param keyUpdate - a function taking the current key and returning a new key
		 * @param value - the value of the entry to update
		 * @typeparam UV - the value type to accept, related to `V`
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 1], [2, 2])
		 * const r1 = m.updateKeyAtValueAndGet(k => k + 1, 3)
		 * console.log([r1[0].toString(), r1[1], r1[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 2)", undefined, false ]
		 * const r2 = m.updateKeyAtValueAndGet(k => k + 10, 2)
		 * console.log([r2[0].toString(), r2[1], r2[2]]); // => [ "BiMap(1 <-> 1, 12 <-> 2)", 2, true ]
		 * const r3 = m.updateKeyAtValueAndGet(k => k, 2)
		 * console.log([r3[0].toString(), r3[1], r3[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 2)", 2, true ]
		 * ```
		 */
		updateKeyAtValueAndGet<UV = V>(
			keyUpdate: (key: K) => K,
			value: RelatedTo<V, UV>,
		): WithValueResult<BiMap.NonEmpty<K, V>, K>;

		/**
		 * Returns a tuple `[newBiMap, value, hasValue]` of the updated non-empty collection and the previous value that
		 * was associated with the key, or the unchanged collection and `undefined` if the `key` is not present. The `hasValue`
		 * flag indicates whether the `key` was present; if it was, `value` is the previous value and `hasValue` is `true`,
		 * even when the update function returns the same value (a no-op, where `newBiMap` is unchanged and
		 * `result[0] === this`).
		 * @param key - the key of the entry to update
		 * @param valueUpdate - a function taking the current value and returning a new value
		 * @typeparam UK - the key type to accept, related to `K`
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 1], [2, 2])
		 * const r1 = m.updateValueAtKeyAndGet(3, v => v + 1)
		 * console.log([r1[0].toString(), r1[1], r1[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 2)", undefined, false ]
		 * const r2 = m.updateValueAtKeyAndGet(2, v => v + 10)
		 * console.log([r2[0].toString(), r2[1], r2[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 12)", 2, true ]
		 * const r3 = m.updateValueAtKeyAndGet(2, v => v)
		 * console.log([r3[0].toString(), r3[1], r3[2]]); // => [ "BiMap(1 <-> 1, 2 <-> 2)", 2, true ]
		 * ```
		 */
		updateValueAtKeyAndGet<O, UK = K>(
			key: RelatedTo<K, UK>,
			valueUpdate: (value: V) => V,
		): WithValueResult<BiMap.NonEmpty<K, V>, V>;

		/**
		 * Returns a non-empty `Stream` containing all entries of this collection as tuples of key and value.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.of([1, 1], [2, 2]).stream().toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
		 * ```
		 */
		stream(): Stream.NonEmpty<readonly [K, V]>;
		/**
		 * Returns a non-empty `Stream` containing all keys of this collection.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.of([1, 'a'], [2, 'b']).streamKeys().toArray()); // => [ 1, 2 ]
		 * ```
		 */
		streamKeys(): Stream.NonEmpty<K>;
		/**
		 * Returns a non-empty `Stream` containing all values of this collection.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.of([1, 'a'], [2, 'b']).streamValues().toArray()); // => [ "a", "b" ]
		 * ```
		 */
		streamValues(): Stream.NonEmpty<V>;
		/**
		 * Returns a non-empty array containing all entries in this collection.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.of([1, 'a'], [2, 'b']).toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
		 * ```
		 * @note O(log(N))
		 * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
		 */
		toArray(): ArrayNonEmpty<readonly [K, V]>;
	}

	/**
	 * The BiMap's Context instance that serves as a factory for all related immutable instances and builders.
	 * @typeparam UK - the upper type limit for key types for which this context can create instances
	 * @typeparam UV - the upper type limit for value types for which this context can create instances
	 */
	export interface Context<UK, UV, Tp extends BiMap.Types = BiMap.Types>
		extends BiMapFactory<UK, UV> {
		/**
		 * A string tag defining the specific collection type
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.defaultContext().typeTag); // => BiMap
		 * ```
		 */
		readonly typeTag: 'BiMap';
		readonly _types: Tp;
		readonly keyValueContext: RMap.Context<UK>;
		readonly valueKeyContext: RMap.Context<UV>;
	}

	/**
	 * A mutable `BiMap` builder used to efficiently create new immutable instances.
	 * See the [BiMap documentation](https://rimbu.org/docs/collections/bimap) and the [BiMap.Builder API documentation](https://rimbu.org/api/rimbu/bimap/BiMap/Builder/interface)
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 */
	export interface Builder<K, V> {
		/**
		 * Returns the amount of entries in the builder.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.of([1, 'a'], [2, 'b']).toBuilder().size);
		 * // => 2
		 * ```
		 */
		readonly size: number;
		/**
		 * Returns true if there are no entries in the builder.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * console.log(BiMap.of([1, 'a'], [2, 'b']).toBuilder().isEmpty);
		 * // => false
		 * ```
		 */
		readonly isEmpty: boolean;
		/**
		 * Returns the value associated with the given `key`, or given `otherwise` value if the key is not in the collection.
		 * @param key - the key to look for
		 * @param otherwise - (default: undefined) an `OptLazy` fallback value if the key is not in the collection
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.getValue(2)); // => b
		 * console.log(m.getValue(3)); // => undefined
		 * console.log(m.getValue(2, 'none')); // => b
		 * console.log(m.getValue(3, 'none')); // => none
		 * ```
		 */
		getValue<UK = K>(key: RelatedTo<K, UK>): V | undefined;
		getValue<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
		/**
		 * Returns the key associated with the given `value`, or given `otherwise` value if the value is not in the collection.
		 * @param value - the value to look for
		 * @param otherwise - (default: undefined) an `OptLazy` fallback value if the value is not in the collection
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.getKey('b')); // => 2
		 * console.log(m.getKey('z')); // => undefined
		 * console.log(m.getKey('b', 'none')); // => 2
		 * console.log(m.getKey('z', 'none')); // => none
		 * ```
		 */
		getKey<UV = V>(value: RelatedTo<V, UV>): K | undefined;
		getKey<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;
		/**
		 * Returns true if the given `key` is present in the builder.
		 * @param key - the key to look for
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.hasKey(2)); // => true
		 * console.log(m.hasKey(3)); // => false
		 * ```
		 */
		hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
		/**
		 * Returns true if the given `value` is present in the builder.
		 * @param value - the value to look for
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.hasValue('a')); // => true
		 * console.log(m.hasValue('z')); // => false
		 * ```
		 */
		hasValue<UV = V>(value: RelatedTo<V, UV>): boolean;
		/**
		 * Associates given `key` with given `value` in the builder.
		 * @param key - the entry key
		 * @param value - the entry value
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.set(1, 'a')); // => false
		 * console.log(m.set(1, 'b')); // => true
		 * ```
		 */
		set(key: K, value: V): boolean;
		/**
		 * Adds the given `entry` to the builder, where the entry key is associated with the entry value.
		 * @param entry - the entry to add
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.addEntry([1, 'a'])); // => false
		 * console.log(m.addEntry([1, 'b'])); // => true
		 * ```
		 */
		addEntry(entry: readonly [K, V]): boolean;
		/**
		 * Adds given `entries` to the builder.
		 * @param entries - a `StreamSource` containing the entries to add
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.addEntries([[1, 'a'], [3, 'c']])); // => true
		 * console.log(m.addEntries([])); // => false
		 * ```
		 */
		addEntries(entries: StreamSource<readonly [K, V]>): boolean;
		/**
		 * Removes the entries related to given `key` from the builder.
		 * @param key - the key to remove
		 * @param otherwise - (default: undefined) the value to return if the key is not in the builder
		 * @returns the value previously associated with given `key`, or the fallback value otherwise
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.removeKey(2)); // => b
		 * console.log(m.removeKey(3)); // => undefined
		 * console.log(m.removeKey(3, 'c')); // => c
		 * ```
		 */
		removeKey<UK = K>(key: RelatedTo<K, UK>): V | undefined;
		removeKey<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
		/**
		 * Removes the entries related to the given `keys` `StreamSource` from the builder.
		 * @param keys - the `StreamSource` containing the keys to remove.
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.removeKeys([3, 4, 5])); // => false
		 * console.log(m.removeKeys([1, 10])); // => true
		 * ```
		 */
		removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): boolean;
		/**
		 * Removes the entries related to given `value` from the builder.
		 * @param value - the value to remove
		 * @param otherwise - (default: undefined) the key to return if the value is not in the builder
		 * @returns the key previously associated with given `value`, or the fallback value otherwise
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.removeValue('b')); // => 2
		 * console.log(m.removeValue('c')); // => undefined
		 * console.log(m.removeValue('c', 0)); // => 0
		 * ```
		 */
		removeValue<UV = V>(value: RelatedTo<V, UV>): K | undefined;
		removeValue<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;
		/**
		 * Removes the entries related to the given `values` `StreamSource` from the builder.
		 * @param values - the `StreamSource` containing the values to remove.
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.removeValues(['c', 'd', 'e'])); // => false
		 * console.log(m.removeValues(['a', 'e'])); // => true
		 * ```
		 */
		removeValues<UV = V>(values: StreamSource<RelatedTo<V, UV>>): boolean;
		/**
		 * Removes the entry related to given `entry` from the builder, but only if both the key and value match an
		 * existing entry.
		 * @param entry - a tuple containing the key and value of the entry to remove
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.removeEntry([2, 'b'])); // => true
		 * console.log(m.removeEntry([2, 'c'])); // => false
		 * ```
		 */
		removeEntry(entry: readonly [K, V]): boolean;
		/**
		 * Performs given function `f` for each entry of the builder.
		 * @param f - the function to perform for each element, receiving:<br/>
		 * - `entry`: the next key-value entry<br/>
		 * - `index`: the index of the element<br/>
		 * - `halt`: a function that, if called, ensures that no new elements are passed
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - state: (optional) the traverse state
		 * @throws RimbuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while
		 * looping over it
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const collected: [string, number][] = []
		 * BiMap.of([1, 'a'], [2, 'b'], [3, 'c']).toBuilder().forEach((entry, i, halt) => {
		 *   collected.push([entry[1], entry[0]]);
		 *   if (i >= 1) halt();
		 * })
		 * console.log(collected); // => [ [ "a", 1 ], [ "b", 2 ] ]
		 * ```
		 * @note O(N)
		 */
		forEach(
			f: (entry: readonly [K, V], index: number, halt: () => void) => void,
			options?: { state?: TraverseState },
		): void;
		/**
		 * Returns an immutable collection instance containing the entries in this builder.
		 * @example
		 * ```ts
		 * import { BiMap } from '@rimbu/bimap';
		 *
		 * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
		 * const m2: BiMap<number, string> = m.build()
		 * ```
		 */
		build(): BiMap<K, V>;
	}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends KeyValue {
		/**
		 * The 'normal' collection type (higher-kinded type).
		 */
		readonly normal: BiMap<this['_K'], this['_V']>;
		/**
		 * The 'non-empty' collection type (higher-kinded type).
		 */
		readonly nonEmpty: BiMap.NonEmpty<this['_K'], this['_V']>;
	}
}

/**
 * @expandType BiMapCreators
 */
export const BiMap: BiMapCreators = createBiMapContextModule().build();
