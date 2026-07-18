import type {
	RMap,
	RSet,
	VariantMap,
	VariantSet,
} from '@rimbu/collection-types';
import type {
	KeyValue,
	WithKeyValue,
} from '@rimbu/collection-types/advanced/common';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type {
	ArrayNonEmpty,
	RelatedTo,
	ToJSON,
	WithValueResult,
} from '@rimbu/common/types';
import type { MultiMap } from '@rimbu/multimap';
import type {
	FastIterable,
	Stream,
	Streamable,
	StreamSource,
} from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

export interface VariantMultiMapBase<
	K,
	V,
	Tp extends VariantMultiMapBase.Types = VariantMultiMapBase.Types,
> extends FastIterable<[K, V]> {
	/**
	 * Returns true if the collection is empty.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.empty<number, number>().isEmpty); // => true
	 * console.log(HashMultiMapHashValue.of([1, 1], [2, 2]).isEmpty); // => false
	 * ```
	 */
	readonly isEmpty: boolean;
	/**
	 * Returns the number of keys in the collection.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 1], [2, 2]).keySize); // => 2
	 * console.log(HashMultiMapHashValue.of([1, 1], [1, 2]).keySize); // => 1
	 * ```
	 */
	readonly keySize: number;
	/**
	 * Returns the number of unique key-value combinations in this collection.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 1], [2, 2]).size); // => 2
	 * console.log(HashMultiMapHashValue.of([1, 1], [1, 2]).size); // => 2
	 * ```
	 */
	readonly size: number;
	/**
	 * Returns the Map representation of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 1], [2, 2])
	 * const map = m.keyMap
	 * console.log(map.at(1)!.toArray()); // => [ 1 ]
	 * ```
	 */
	readonly keyMap: WithKeyValue<Tp, K, V>['keyMap'];
	/**
	 * Returns the collection as a .NonEmpty type
	 * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * try {
	 *   HashMultiMapHashValue.empty<number, number>().assumeNonEmpty();
	 * } catch (err) {
	 *   console.log((err as Error).name); // => EmptyCollectionAssumedNonEmptyError
	 * }
	 * const m: HashMultiMapHashValue<number, number> = HashMultiMapHashValue.of([1, 1], [2, 2]).asNormal();
	 * const m3: HashMultiMapHashValue.NonEmpty<number, number> = m.assumeNonEmpty();
	 * console.log(m3.size); // => 2
	 * ```
	 * @note returns reference to this collection
	 */
	assumeNonEmpty(): WithKeyValue<Tp, K, V>['nonEmpty'];
	/**
	 * Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection
	 * as a .NonEmpty type.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m: HashMultiMapHashValue<number, number> = HashMultiMapHashValue.of([1, 1], [2, 2]).asNormal();
	 * console.log(m.stream().first(0)); // => [ 1, 1 ]
	 * if (m.nonEmpty()) {
	 *   console.log(m.stream().first()); // => [ 1, 1 ]
	 * }
	 * ```
	 */
	nonEmpty(): this is WithKeyValue<Tp, K, V>['nonEmpty'];
	/**
	 * Returns a Stream containing all entries of this collection as tuples of key and value.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 1], [2, 2]).stream().toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
	 * ```
	 */
	stream(): Stream<[K, V]>;
	/**
	 * Returns a Stream containing all keys of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b']).streamKeys().toArray()); // => [ 1, 2 ]
	 * ```
	 */
	streamKeys(): Stream<K>;
	/**
	 * Returns a Stream containing all values of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b']).streamValues().toArray()); // => [ "a", "b" ]
	 * ```
	 */
	streamValues(): Stream<V>;
	/**
	 * Returns true if the given `key` is present in the collection.
	 * @param key - the key to look for
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'])
	 * console.log(m.hasKey(2)); // => true
	 * console.log(m.hasKey(3)); // => false
	 * ```
	 */
	hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
	/**
	 * Returns true if the given `key` has the given `value` as one of its values in the collection.
	 * @param key - the key to look for
	 * @param value - the value to look for
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'])
	 * console.log(m.hasEntry(1, 'a')); // => true
	 * console.log(m.hasEntry(1, 'b')); // => false
	 * ```
	 */
	hasEntry<UK = K>(key: RelatedTo<K, UK>, value: V): boolean;
	/**
	 * Returns the value collection associated to the given `key`.
	 * @param key - the key to look for
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'])
	 * console.log(m.valuesAt(1).toArray()); // => [ "a" ]
	 * console.log(m.valuesAt(10).toArray()); // => []
	 * ```
	 */
	valuesAt<UK = K>(
		key: RelatedTo<K, UK>,
	): WithKeyValue<Tp, K, V>['keyMapValues'];
	/**
	 * Returns the collection where the values associated with given `key` are removed.
	 * @param key - the key of the entries to remove
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])
	 * console.log(m.removeKey(2).toArray()); // => [ [ 1, "a" ], [ 1, "c" ] ]
	 * console.log(m.removeKey(3) === m); // => true
	 * ```
	 * @note guarantees same object reference if the key is not present
	 */
	removeKey<UK = K>(key: RelatedTo<K, UK>): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns the collection where the values associated with given `keys` are removed.
	 * @param keys - a `StreamSource` of keys to remove
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])
	 * console.log(m.removeKeys([2, 10]).toArray()); // => [ [ 1, "a" ], [ 1, "c" ] ]
	 * console.log(m.removeKeys([10, 11]) === m); // => true
	 * ```
	 * @note guarantees same object reference if the key is not present
	 */
	removeKeys<UK = K>(
		keys: StreamSource<RelatedTo<K, UK>>,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns the collection where given `value` if removed from the values associated with given `key`.
	 * @param key - the key of the entry to remove
	 * @param value - the value of the entry to remove
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])
	 * console.log(m.removeEntry(2, 'b').toArray()); // => [ [ 1, "a" ], [ 1, "c" ] ]
	 * console.log(m.removeEntry(2, 'q').toArray()); // => [ [ 1, "a" ], [ 1, "c" ], [ 2, "b" ] ]
	 * console.log(m.removeEntry(3, 'a') === m); // => true
	 * ```
	 * @note guarantees same object reference if the key is not present
	 */
	removeEntry<UK = K, UV = V>(
		key: RelatedTo<K, UK>,
		value: RelatedTo<V, UV>,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns the collection where given `entries` are removed.
	 * @param entries - a `StreamSource` containing key-value entries to remove
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])
	 * console.log(m.removeEntries([[2, 'b'], [1, 'd']]).toArray()); // => [ [ 1, "a" ], [ 1, "c" ] ]
	 * console.log(m.removeEntries([[2, 'q']]).toArray()); // => [ [ 1, "a" ], [ 1, "c" ], [ 2, "b" ] ]
	 * console.log(m.removeEntries([[3, 'q']]) === m); // => true
	 * ```
	 * @note guarantees same object reference if the key is not present
	 */
	removeEntries<UK = K, UV = V>(
		entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns a tuple `[newMultiMap, values, hasValue]` containing the collection of which the given `key` is
	 * removed, the non-empty set of values that were associated with that key, and a `hasValue` flag indicating
	 * whether the `key` was present. If the key is not present, `newMultiMap` is unchanged and `hasValue` is `false`.
	 * @param key - the key of the entry to remove
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'])
	 * const result = m.removeKeyAndGet(2)
	 * console.log([result[0].toString(), result[1]?.toString(), result[2]]); // => [ "HashMultiMapHashValue(1 -> [a])", "HashSet(b)", true ]
	 * console.log(m.removeKeyAndGet(3)[2]); // => false
	 * ```
	 */
	removeKeyAndGet<UK = K>(
		key: RelatedTo<K, UK>,
	): WithValueResult<
		WithKeyValue<Tp, K, V>['normal'],
		WithKeyValue<Tp, K, V>['keyMapValuesNonEmpty']
	>;
	/**
	 * Performs given function `f` for each entry of the collection, using given `state` as initial traversal state.
	 * @param f - the function to perform for each element, receiving:<br/>
	 * - `entry`: the next tuple of a key and value<br/>
	 * - `index`: the index of the element<br/>
	 * - `halt`: a function that, if called, ensures that no new elements are passed
	 * @param state - (optional) the traverse state
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const collected: [string, number][] = [];
	 * HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).forEach((entry, i, halt) => {
	 *   collected.push([entry[1], entry[0]]);
	 *   if (i >= 1) halt();
	 * });
	 * console.log(collected); // => [ [ "a", 1 ], [ "c", 1 ] ]
	 * ```
	 * @note O(N)
	 */
	forEach(
		f: (entry: [K, V], index: number, halt: () => void) => void,
		options?: { state?: TraverseState },
	): void;
	/**
	 * Returns a collection containing only those entries that satisfy given `pred` predicate.
	 * @param pred - a predicate function receiving:<br/>
	 * - `entry`: the next entry<br/>
	 * - `index`: the entry index<br/>
	 * - `halt`: a function that, when called, ensures no next entries are passed
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - negate: (default: false) when true will negate the predicate
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])
	 * console.log(m.filter(entry => entry[0] === 2 || entry[1] === 'c').toArray()); // => [ [ 1, "c" ], [ 2, "b" ] ]
	 * ```
	 */
	filter(
		pred: (entry: [K, V], index: number, halt: () => void) => boolean,
		options?: { negate?: boolean },
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns a collection that is the result of applying given `transformFun` to the `Stream` of all entries of this collection.
	 *
	 * This is a general-purpose transformation method: `transformFun` receives the entries of this collection as a `Stream` of
	 * `[key, value]` tuples, and can apply any `Stream` operation such as `map`, `flatMap`, `filter`, `partition`, or `collect`
	 * to produce the resulting entries. The returned `StreamSource` is used to build a new collection in the same context.
	 * @typeparam V2 - the value type of the resulting collection
	 * @typeparam K2 - the key type of the resulting collection, a subtype of `K`
	 * @param transformFun - a function that receives the `Stream` of entries of this collection, and returns a `StreamSource` of resulting entries
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b']).transform(s => s.map(([k, v]) => [k, v.toUpperCase()])).toArray()); // => [ [ 1, "A" ], [ 2, "B" ] ]
	 * ```
	 * @note because the resulting collection is built in the same context, `K2` must be a subtype of `K` and `V2` a subtype of `V`.
	 * To transform to unrelated key or value types, build a new collection explicitly, for example `HashMultiMapHashValue.from(stream.map(...))`.
	 */
	transform<K2 extends K, V2 extends V>(
		transformFun: (stream: Stream<[K, V]>) => StreamSource<[K2, V2]>,
	): WithKeyValue<Tp, K2, V2>['normal'];
	/**
	 * Returns the number of values associated with given `key`, or `0` if the key is not present.
	 * @param key - the key to look for
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 'a'], [1, 'b'], [2, 'c'])
	 * console.log(m.count(1)); // => 2
	 * console.log(m.count(3)); // => 0
	 * ```
	 */
	count<UK = K>(key: RelatedTo<K, UK>): number;
	/**
	 * Returns an array containing all entries in this collection.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toArray()); // => [ [ 1, "a" ], [ 1, "c" ], [ 2, "b" ] ]
	 * ```
	 * @note O(log(N))
	 * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
	 */
	toArray(): [K, V][];
	/**
	 * Returns a string representation of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toString()); // => HashMultiMapHashValue(1 -> [a, c], 2 -> [b])
	 * ```
	 */
	toString(): string;
	/**
	 * Returns a JSON representation of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toJSON()); // => { dataType: "HashMultiMapHashValue", value: [ [ 1, [ "a", "c" ] ], [ 2, [ "b" ] ] ] }
	 * ```
	 */
	toJSON(): ToJSON<[K, V[]][]>;
}

export namespace VariantMultiMapBase {
	export interface NonEmpty<
		K,
		V,
		Tp extends VariantMultiMapBase.Types = VariantMultiMapBase.Types,
	> extends VariantMultiMapBase<K, V, Tp>,
			Streamable.NonEmpty<[K, V]> {
		/**
		 * Returns false since this collection is known to be non-empty
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 1], [2, 2]).isEmpty); // => false
		 * ```
		 */
		readonly isEmpty: false;
		/**
		 * Returns the non-empty Map representation of this collection.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 1], [2, 2])
		 * const map = m.keyMap
		 * console.log(map.at(1)!.toArray()); // => [ 1 ]
		 * ```
		 */
		readonly keyMap: WithKeyValue<Tp, K, V>['keyMapNonEmpty'];
		/**
		 * Returns a self reference since this collection is known to be non-empty.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 1], [2, 2]);
		 * console.log(m === m.assumeNonEmpty()); // => true
		 * ```
		 */
		assumeNonEmpty(): this;
		/**
		 * Returns this collection typed as a 'possibly empty' collection.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 1], [2, 2]).asNormal();
		 * console.log(m.toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
		 * ```
		 */
		asNormal(): WithKeyValue<Tp, K, V>['normal'];
		/**
		 * Returns true since this collection is known to be non-empty
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 1], [2, 2]).nonEmpty()); // => true
		 * ```
		 */
		nonEmpty(): this is WithKeyValue<Tp, K, V>['nonEmpty'];
		/**
		 * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 1], [2, 2]).stream().toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
		 * ```
		 */
		stream(): Stream.NonEmpty<[K, V]>;
		/**
		 * Returns a collection that is the result of applying given `transformFun` to the `Stream` of all entries of this collection.
		 *
		 * This is a general-purpose transformation method: `transformFun` receives the entries of this collection as a non-empty `Stream` of
		 * `[key, value]` tuples, and can apply any `Stream` operation such as `map`, `flatMap`, `filter`, `partition`, or `collect`
		 * to produce the resulting entries. The returned `StreamSource` is used to build a new collection in the same context.
		 * @typeparam V2 - the value type of the resulting collection
		 * @typeparam K2 - the key type of the resulting collection, a subtype of `K`
		 * @param transformFun - a function that receives the non-empty `Stream` of entries of this collection, and returns a `StreamSource` of resulting entries
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b']).transform(s => s.map(([k, v]) => [k, v.toUpperCase()])).toArray()); // => [ [ 1, "A" ], [ 2, "B" ] ]
		 * ```
		 * @note because the resulting collection is built in the same context, `K2` must be a subtype of `K` and `V2` a subtype of `V`.
		 * To transform to unrelated key or value types, build a new collection explicitly, for example `HashMultiMapHashValue.from(stream.map(...))`.
		 */
		transform<K2 extends K, V2 extends V>(
			transformFun: (
				stream: Stream.NonEmpty<[K, V]>,
			) => StreamSource.NonEmpty<[K2, V2]>,
		): WithKeyValue<Tp, K2, V2>['nonEmpty'];
		transform<K2 extends K, V2 extends V>(
			transformFun: (stream: Stream.NonEmpty<[K, V]>) => StreamSource<[K2, V2]>,
		): WithKeyValue<Tp, K2, V2>['normal'];
		/**
		 * Returns a non-empty Stream containing all keys of this collection.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b']).streamKeys().toArray()); // => [ 1, 2 ]
		 * ```
		 */
		streamKeys(): Stream.NonEmpty<K>;
		/**
		 * Returns a non-empty Stream containing all values of this collection.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b']).streamValues().toArray()); // => [ "a", "b" ]
		 * ```
		 */
		streamValues(): Stream.NonEmpty<V>;
		/**
		 * Returns a tuple `[newMultiMap, values, hasValue]` containing the collection of which the given `key` is
		 * removed, the non-empty set of values that were associated with that key, and a `hasValue` flag indicating
		 * whether the `key` was present. Since this collection is non-empty, `newMultiMap` is always non-empty; if
		 * the key is not present, `newMultiMap` is unchanged (and still non-empty) and `hasValue` is `false`.
		 * @param key - the key of the entry to remove
		 */
		removeKeyAndGet<UK = K>(
			key: RelatedTo<K, UK>,
		): WithValueResult<
			WithKeyValue<Tp, K, V>['normal'],
			WithKeyValue<Tp, K, V>['keyMapValuesNonEmpty'],
			WithKeyValue<Tp, K, V>['nonEmpty']
		>;
		/**
		 * Returns a non-empty array containing all entries in this collection.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toArray()); // => [ [ 1, "a" ], [ 1, "c" ], [ 2, "b" ] ]
		 * ```
		 * @note O(log(N))
		 * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
		 */
		toArray(): ArrayNonEmpty<[K, V]>;
	}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends KeyValue {
		readonly normal: VariantMultiMapBase<this['_K'], this['_V']>;
		readonly nonEmpty: VariantMultiMapBase.NonEmpty<this['_K'], this['_V']>;
		readonly keyMapValues: VariantSet<this['_V']>;
		readonly keyMapValuesNonEmpty: VariantSet.NonEmpty<this['_V']>;
		readonly keyMap: VariantMap<this['_K'], VariantSet.NonEmpty<this['_V']>>;
		readonly keyMapNonEmpty: VariantMap.NonEmpty<
			this['_K'],
			VariantSet.NonEmpty<this['_V']>
		>;
	}
}

export interface MultiMapBase<
	K,
	V,
	Tp extends MultiMapBase.Types = MultiMapBase.Types,
> extends VariantMultiMapBase<K, V, Tp> {
	/**
	 * Returns the `context` associated to this collection instance.
	 */
	readonly context: WithKeyValue<Tp, K, V>['context'];
	/**
	 * Returns the collection with the given `value` added to the given `key` values.
	 * @param key - the key for which to add a value
	 * @param value - the value to add to the key values
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a']).add(2, 'b').toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
	 * console.log(HashMultiMapHashValue.of([1, 'a']).add(1, 'b').toArray()); // => [ [ 1, "a" ], [ 1, "b" ] ]
	 * ```
	 */
	add(key: K, value: V): WithKeyValue<Tp, K, V>['nonEmpty'];
	/**
	 * Returns the collection with the given `entries` added.
	 * @param entries - a `StreamSource` containing entries to add
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a']).addEntries([[2, 'b'], [1, 'c']]).toArray()); // => [ [ 1, "a" ], [ 1, "c" ], [ 2, "b" ] ]
	 * ```
	 */
	addEntries(
		entries: StreamSource.NonEmpty<readonly [K, V]>,
	): WithKeyValue<Tp, K, V>['nonEmpty'];
	addEntries(
		entries: StreamSource<readonly [K, V]>,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns the collection where given `key` has the given `values` associated with it.
	 * @param key - the key for which to set the values
	 * @param values - the values to set for the key
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b']).setValues(1, ['d', 'e']).toArray()); // => [ [ 1, "d" ], [ 1, "e" ], [ 2, "b" ] ]
	 * ```
	 */
	setValues(
		key: K,
		values: StreamSource.NonEmpty<V>,
	): WithKeyValue<Tp, K, V>['nonEmpty'];
	setValues(key: K, values: StreamSource<V>): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns a MultiMap with the same keys, but where given `mapFun` is applied to each of its values.
	 * @typeparam W - the type of the resulting values (a subtype of `V`)
	 * @param mapFun - a function taking a value and its key, returning a new value
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [1, 'b']).mapValues(v => v.toUpperCase()).toArray()); // => [ [ 1, "A" ], [ 1, "B" ] ]
	 * ```
	 * @note the number of values per key is preserved, so a non-empty collection stays non-empty.
	 * Because the result is built in the same context, `W` must be a subtype of `V`.
	 */
	mapValues<V2 extends V>(
		mapFun: (value: V, key: K) => V2,
	): WithKeyValue<Tp, K, V2>['normal'];
	/**
	 * Returns a MultiMap where, for each key, given `flatMapFun` is applied to each of its values,
	 * and the resulting values are collected as the new values for that key.
	 * @typeparam W - the type of the resulting values (a subtype of `V`)
	 * @param flatMapFun - a function taking a value and its key, returning a `StreamSource` of new values
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a']).flatMapValues(v => [v, v.toUpperCase()]).toArray()); // => [ [ 1, "A" ], [ 1, "a" ] ]
	 * ```
	 * @note a key may end up with zero values (for example if `flatMapFun` returns an empty
	 * `StreamSource` for all its values), in which case the key is removed. Because the result is
	 * built in the same context, `W` must be a subtype of `V`.
	 */
	flatMapValues<V2 extends V>(
		flatMapFun: (value: V, key: K) => StreamSource<V2>,
	): WithKeyValue<Tp, K, V2>['normal'];
	/**
	 * Returns the collection with the given `atKey` key modified according to given `options`.
	 * @param atKey - the key at which to modify the collection
	 * @param options - an object containing the following information:<br/>
	 * - ifNew: (optional) if the given `atKey` is not present in the collection, this value or function will be used
	 * to generate the new values. Returning or providing an empty `StreamSource` creates no new entry.<br/>
	 * - ifExists: (optional) if given `atKey` exists in the collection, this function is called with the current
	 * non-empty value set to return the new values. Returning an empty `StreamSource` removes the key (and its values).
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'])
	 * console.log(m.modifyAt(3, { ifNew: { set: ['c', 'd'] } }).toArray()); // => [ [ 1, "a" ], [ 2, "b" ], [ 3, "c" ], [ 3, "d" ] ]
	 * console.log(m.modifyAt(3, { ifNew: { create: () => 1 < 2 ? [] : ['c'] } }).toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
	 * console.log(m.modifyAt(2, { ifExists: { set: ['c'] } }).toArray()); // => [ [ 1, "a" ], [ 2, "c" ] ]
	 * console.log(m.modifyAt(2, { ifExists: { update: (v) => v.add('d') } }).toArray()); // => [ [ 1, "a" ], [ 2, "b" ], [ 2, "d" ] ]
	 * console.log(m.modifyAt(2, { ifExists: { update: (v) => v.has('a') ? v : [] } }).toArray()); // => [ [ 1, "a" ] ]
	 * ```
	 */
	modifyAt(
		atKey: K,
		options: MultiMap.ModifyOptions<
			V,
			WithKeyValue<Tp, K, V>['keyMapValuesNonEmpty'] & RSet.NonEmpty<V>
		>,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns the collection with the given `values` added to the values associated with given `key`.
	 * @param key - the key to which to add the values
	 * @param values - a `StreamSource` of values to add
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a']).addValues(1, ['b', 'c']).toArray()); // => [ [ 1, "a" ], [ 1, "b" ], [ 1, "c" ] ]
	 * ```
	 * @note if `values` is empty, the collection is returned unchanged (and, if the key was
	 * absent, the same object reference)
	 */
	addValues(
		key: K,
		values: StreamSource.NonEmpty<V>,
	): WithKeyValue<Tp, K, V>['nonEmpty'];
	addValues(key: K, values: StreamSource<V>): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns a MultiMap that is the result of applying given `flatMapFun` to each key-value entry,
	 * where the function returns a `StreamSource` of resulting entries.
	 * @typeparam K2 - the key type of the resulting entries (a subtype of `K`)
	 * @typeparam V2 - the value type of the resulting entries (a subtype of `V`)
	 * @param flatMapFun - a function taking an entry, its index, and a halt function,
	 * returning a `StreamSource` of new entries
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a']).flatMap(([k, v]) => [[k, v], [k, v.toUpperCase()]]).toArray()); // => [ [ 1, "A" ], [ 1, "a" ] ]
	 * ```
	 * @note because the result is built in the same context, `K2` must be a subtype of `K` and
	 * `V2` a subtype of `V`. To transform to unrelated key or value types, build a new collection
	 * explicitly, for example `HashMultiMapHashValue.from(stream.flatMap(...))`
	 */
	flatMap<K2 extends K, V2 extends V>(
		flatMapFun: (
			entry: [K, V],
			index: number,
			halt: () => void,
		) => StreamSource<[K2, V2]>,
	): WithKeyValue<Tp, K2, V2>['normal'];
	/**
	 * Returns the union of this and given `other` MultiMap, where for each key the value sets are
	 * combined using set union. Keys that are present in only one of the collections keep their values.
	 * @param other - a `MultiMap` to combine with
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b']).union(HashMultiMapHashValue.of([1, 'c'], [3, 'd'])).toArray()); // => [ [ 1, "a" ], [ 1, "c" ], [ 2, "b" ], [ 3, "d" ] ]
	 * ```
	 */
	union<U extends V>(
		other: MultiMap.NonEmpty<K, U>,
	): WithKeyValue<Tp, K, V>['nonEmpty'];
	union<U extends V>(other: MultiMap<K, U>): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns the intersection of this and given `other` MultiMap, where for each key that is present
	 * in both collections, the resulting value set is the set intersection of both value sets. Keys
	 * that are not present in both are removed.
	 * @param other - a `MultiMap` to combine with
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [1, 'b'], [2, 'b']).intersect(HashMultiMapHashValue.of([1, 'b'], [3, 'd'])).toArray()); // => [ [ 1, "b" ] ]
	 * ```
	 */
	intersect<U extends V>(
		other: MultiMap<K, U>,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns the difference of this and given `other` MultiMap, where for each key the resulting
	 * value set is the set difference of this collection's values minus `other`'s values. Keys whose
	 * value set becomes empty are removed.
	 * @param other - a `MultiMap` to subtract
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [1, 'b'], [2, 'b']).difference(HashMultiMapHashValue.of([1, 'b'], [3, 'd'])).toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
	 * ```
	 */
	difference<U extends V>(
		other: MultiMap<K, U>,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns the symmetric difference of this and given `other` MultiMap, where for each key the
	 * resulting value set is the symmetric set difference of both value sets. Keys present in only
	 * one collection keep their values; keys present in both keep only the values not shared.
	 * @param other - a `MultiMap` to combine with
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * console.log(HashMultiMapHashValue.of([1, 'a'], [1, 'b'], [2, 'b']).symDifference(HashMultiMapHashValue.of([1, 'b'], [3, 'd'])).toArray()); // => [ [ 1, "a" ], [ 2, "b" ], [ 3, "d" ] ]
	 * ```
	 */
	symDifference<U extends V>(
		other: MultiMap<K, U>,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns a builder object containing the entries of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
	 * const builder = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [2, 'c']).toBuilder();
	 * console.log(builder.size); // => 3
	 * ```
	 */
	toBuilder(): WithKeyValue<Tp, K, V>['builder'];
}

export namespace MultiMapBase {
	export interface NonEmpty<
		K,
		V,
		Tp extends MultiMapBase.Types = MultiMapBase.Types,
	> extends VariantMultiMapBase.NonEmpty<K, V, Tp>,
			Omit<
				MultiMapBase<K, V, Tp>,
				keyof VariantMultiMapBase.NonEmpty<any, any, any>
			>,
			Streamable.NonEmpty<[K, V]> {
		/**
		 * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 1], [2, 2]).stream().toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
		 * ```
		 */
		stream(): Stream.NonEmpty<[K, V]>;
		/**
		 * Returns the collection with the given `entries` added.
		 * @param entries - a `StreamSource` containing entries to add
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 'a']).addEntries([[2, 'b'], [1, 'c']]).toArray()); // => [ [ 1, "a" ], [ 1, "c" ], [ 2, "b" ] ]
		 * ```
		 */
		addEntries(
			entries: StreamSource<readonly [K, V]>,
		): WithKeyValue<Tp, K, V>['nonEmpty'];
		/**
		 * Returns the collection with the given `values` added to the values associated with given `key`.
		 * @param key - the key to which to add the values
		 * @param values - a non-empty `StreamSource` of values to add
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 'a']).addValues(1, ['b', 'c']).toArray()); // => [ [ 1, "a" ], [ 1, "b" ], [ 1, "c" ] ]
		 * ```
		 */
		addValues(
			key: K,
			values: StreamSource<V>,
		): WithKeyValue<Tp, K, V>['nonEmpty'];
		/**
		 * Returns a MultiMap with the same keys, but where given `mapFun` is applied to each of its values.
		 * @typeparam W - the type of the resulting values (a subtype of `V`)
		 * @param mapFun - a function taking a value and its key, returning a new value
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 'a'], [1, 'b']).mapValues(v => v.toUpperCase()).toArray()); // => [ [ 1, "A" ], [ 1, "B" ] ]
		 * ```
		 * @note the number of values per key is preserved, so a non-empty collection stays non-empty
		 */
		mapValues<V2 extends V>(
			mapFun: (value: V, key: K) => V2,
		): WithKeyValue<Tp, K, V2>['nonEmpty'];
		/**
		 * Returns a MultiMap that is the result of applying given `flatMapFun` to each key-value entry,
		 * where the function returns a `StreamSource` of resulting entries.
		 * @typeparam K2 - the key type of the resulting entries (a subtype of `K`)
		 * @typeparam V2 - the value type of the resulting entries (a subtype of `V`)
		 * @param flatMapFun - a function taking an entry, its index, and a halt function,
		 * returning a `StreamSource` of new entries
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 'a']).flatMap(([k, v]) => [[k, v], [k, v.toUpperCase()]]).toArray()); // => [ [ 1, "A" ], [ 1, "a" ] ]
		 * ```
		 * @note because the result is built in the same context, `K2` must be a subtype of `K` and
		 * `V2` a subtype of `V`. To transform to unrelated key or value types, build a new collection
		 * explicitly, for example `HashMultiMapHashValue.from(stream.flatMap(...))`
		 */
		flatMap<K2 extends K, V2 extends V>(
			flatMapFun: (
				entry: [K, V],
				index: number,
				halt: () => void,
			) => StreamSource.NonEmpty<[K2, V2]>,
		): WithKeyValue<Tp, K2, V2>['nonEmpty'];
		flatMap<K2 extends K, V2 extends V>(
			flatMapFun: (
				entry: [K, V],
				index: number,
				halt: () => void,
			) => StreamSource<[K2, V2]>,
		): WithKeyValue<Tp, K2, V2>['normal'];
		/**
		 * Returns the union of this and given `other` MultiMap, where for each key the value sets are
		 * combined using set union. Since this collection is non-empty, the result is non-empty as well.
		 * @param other - a non-empty `MultiMap` to combine with
		 */
		union<U extends V>(
			other: MultiMap<K, U>,
		): WithKeyValue<Tp, K, V>['nonEmpty'];
	}

	export interface Factory<
		Tp extends MultiMapBase.Types,
		UK = unknown,
		UV = unknown,
	> {
		/**
		 * Returns the (singleton) empty instance of this type and context with given key and value types.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.empty<number, string>().size); // => 0
		 * console.log(HashMultiMapHashValue.empty<string, boolean>().toString()); // => HashMultiMapHashValue()
		 * ```
		 */
		empty<K extends UK, V extends UV>(): WithKeyValue<Tp, K, V>['normal'];
		/**
		 * Returns an immutable multimap of this collection type and context, containing the given `entries`.
		 * @param entries - a non-empty array of key-value entries
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toString()); // => HashMultiMapHashValue(1 -> [a, c], 2 -> [b])
		 * ```
		 */
		of<K extends UK, V extends UV>(
			...entries: ArrayNonEmpty<readonly [K, V]>
		): WithKeyValue<Tp, K, V>['nonEmpty'];
		/**
		 * Returns an immutable multimap of this type and context, containing the entries in the given `source` `StreamSource`.
		 * @param sources - an array of `StreamSource` instances containing key-value entries
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.from([[1, 'a'], [2, 'b']]).toString()); // => HashMultiMapHashValue(1 -> [a], 2 -> [b])
		 * ```
		 */
		from<K extends UK, V extends UV>(
			...sources: ArrayNonEmpty<StreamSource.NonEmpty<readonly [K, V]>>
		): WithKeyValue<Tp, K, V>['nonEmpty'];
		from<K extends UK, V extends UV>(
			...sources: ArrayNonEmpty<StreamSource<readonly [K, V]>>
		): WithKeyValue<Tp, K, V>['normal'];
		/**
		 * Returns an empty builder instance for this type of collection and context.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.builder<number, string>().size); // => 0
		 * ```
		 */
		builder<K extends UK, V extends UV>(): WithKeyValue<Tp, K, V>['builder'];
		/**
		 * Returns a `Reducer` that adds received tuples to a MultiMap and returns the MultiMap as a result. When a `source` is given,
		 * the reducer will first create a MultiMap from the source, and then add tuples to it.
		 * @param source - (optional) an initial source of tuples to add to
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * import { Stream } from '@rimbu/stream';
		 * const someSource: [number, string][] = [[1, 'a'], [2, 'b']];
		 * const result = Stream.of<readonly [number, string]>([1, 'c'], [3, 'a']).reduce(HashMultiMapHashValue.reducer(someSource));
		 * console.log(result.toArray()); // => [ [ 1, "a" ], [ 1, "c" ], [ 2, "b" ], [ 3, "a" ] ]
		 * ```
		 * @note uses a builder under the hood. If the given `source` is a `MultiMap` in the same context, it will directly call `.toBuilder()`.
		 */
		reducer<K extends UK, V extends UV>(
			source?: StreamSource<readonly [K, V]>,
		): Reducer<readonly [K, V], WithKeyValue<Tp, K, V>['normal']>;
	}

	/**
	 * The multimap's Context instance that serves as a factory for all related immutable instances and builders.
	 */
	export interface Context<
		UK,
		UV,
		Tp extends MultiMapBase.Types = MultiMapBase.Types,
	> extends MultiMapBase.Factory<Tp, UK, UV> {
		/**
		 * A string tag defining the specific collection type
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.defaultContext().typeTag); // => HashMultiMapHashValue
		 * ```
		 */
		readonly typeTag: string;
		/**
		 * The context used for the internal keymap instances.
		 */
		readonly keyMapContext: WithKeyValue<Tp, UK, UV>['keyMapContext'];
		readonly keyMapValuesContext: WithKeyValue<
			Tp,
			UK,
			UV
		>['keyMapValuesContext'];
	}

	export interface Builder<
		K,
		V,
		Tp extends MultiMapBase.Types = MultiMapBase.Types,
	> {
		/**
		 * Returns the amount of entries in the builder.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toBuilder().size); // => 3
		 * ```
		 */
		readonly size: number;
		/**
		 * Returns true if there are no entries in the builder.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * console.log(HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder().isEmpty); // => false
		 * ```
		 */
		readonly isEmpty: boolean;
		/**
		 * Returns a built immutable collection of the values associated with given `key`
		 * @param key - the key for which to get the associated values
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toBuilder()
		 * console.log(m.valuesAt(1).toArray()); // => [ "a", "c" ]
		 * console.log(m.valuesAt(10).toArray()); // => []
		 * ```
		 */
		valuesAt<UK = K>(
			key: RelatedTo<K, UK>,
		): WithKeyValue<Tp, K, V>['keyMapValues'];
		/**
		 * Assigns given `values` `StreamSource` to the given `key`, replacing potential existing
		 * values, and removing the key if `values` is empty.
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.setValues(1, ['a'])); // => true
		 * console.log(m.setValues(2, ['c', 'd'])); // => true
		 * ```
		 */
		setValues(key: K, values: StreamSource<V>): boolean;
		/**
		 * Adds given `values` to the values associated with given `key`.
		 * @param key - the key to which to add the values
		 * @param values - a `StreamSource` of values to add
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.addValues(1, ['c'])); // => true
		 * console.log(m.addValues(1, [])); // => false
		 * ```
		 */
		addValues(key: K, values: StreamSource<V>): boolean;
		/**
		 * Returns true if the given `key` is present in the builder.
		 * @param key - the key to look for
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.hasKey(2)); // => true
		 * console.log(m.hasKey(3)); // => false
		 * ```
		 */
		hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
		/**
		 * Returns true if the given `value` is associated with given `key` in the builder.
		 * @param key - the key to look for
		 * @param value - the value to look for
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.hasEntry(2, 'b')); // => true
		 * console.log(m.hasEntry(2, 'c')); // => false
		 * console.log(m.hasEntry(3, 'a')); // => false
		 * ```
		 */
		hasEntry<UK = K>(key: RelatedTo<K, UK>, value: V): boolean;
		/**
		 * Adds an entry with given `key` and `value` to the builder.
		 * @param key - the entry key
		 * @param value - the entry value
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.add(1, 'a')); // => false
		 * console.log(m.add(1, 'b')); // => true
		 * ```
		 */
		add(key: K, value: V): boolean;
		/**
		 * Adds given `entries` to the builder.
		 * @param entries - a `StreamSource` containing entries to add
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.addEntries([[1, 'a'], [2, 'b']])); // => false
		 * console.log(m.addEntries([[1, 'b'], [2, 'd']])); // => true
		 * ```
		 */
		addEntries(entries: StreamSource<readonly [K, V]>): boolean;
		/**
		 * Removes the given `value` from the values associated with given `key` from the builder.
		 * @param key - the key at which to remove the value
		 * @param value - the value to remove
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toBuilder()
		 * console.log(m.removeEntry(3, 'a')); // => false
		 * console.log(m.removeEntry(1, 'a')); // => true
		 * ```
		 */
		removeEntry<UK = K, UV = V>(
			key: RelatedTo<K, UK>,
			value: RelatedTo<V, UV>,
		): boolean;
		/**
		 * Removes the given `entries` from the builder.
		 * @param entries - a `StreamSource` containing entries to remove
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
		 * console.log(m.removeEntries([[3, 'a'], [3, 'b']])); // => false
		 * console.log(m.removeEntries([[1, 'a'], [3, 'b']])); // => true
		 * ```
		 */
		removeEntries<UK = K, UV = V>(
			entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>,
		): boolean;
		/**
		 * Removes the values associated with given `key` from the builder.
		 * @param key - the key of which to remove all values
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toBuilder()
		 * console.log(m.removeKey(3)); // => false
		 * console.log(m.removeKey(1)); // => true
		 * ```
		 */
		removeKey<UK = K>(key: RelatedTo<K, UK>): boolean;
		/**
		 * Removes the values associated with each key of the given `keys`
		 * @param keys - a `StreamSource` of keys for which to remove all values
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toBuilder()
		 * console.log(m.removeKeys([10, 11])); // => false
		 * console.log(m.removeKeys([1])); // => true
		 * ```
		 */
		removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): boolean;
		/**
		 * Performs given function `f` for each entry of the builder, using given `state` as initial traversal state.
		 * @param f - the function to perform for each element, receiving:<br/>
		 * - `entry`: the next tuple of a key and value<br/>
		 * - `index`: the index of the element<br/>
		 * - `halt`: a function that, if called, ensures that no new elements are passed
		 * @param state - (optional) the traverse state
		 * @throws RimbuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while
		 * looping over it
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const collected: [string, number][] = [];
		 * HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toBuilder().forEach((entry, i, halt) => {
		 *   collected.push([entry[1], entry[0]]);
		 *   if (i >= 1) halt();
		 * });
		 * console.log(collected); // => [ [ "a", 1 ], [ "c", 1 ] ]
		 * ```
		 * @note O(N)
		 */
		forEach(
			f: (entry: [K, V], index: number, halt: () => void) => void,
			options?: { state?: TraverseState },
		): void;
		/**
		 * Returns an immutable collection instance containing the entries in this builder.
		 * @example
		 * ```ts
		 * import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
		 * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder();
		 * const m2: HashMultiMapHashValue<number, string> = m.build();
		 * console.log(m2.toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
		 * ```
		 */
		build(): WithKeyValue<Tp, K, V>['normal'];
	}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends VariantMultiMapBase.Types {
		readonly normal: MultiMapBase<this['_K'], this['_V']>;
		readonly nonEmpty: MultiMapBase.NonEmpty<this['_K'], this['_V']>;
		readonly context: MultiMapBase.Context<this['_K'], this['_V']>;
		readonly builder: MultiMapBase.Builder<this['_K'], this['_V']>;
		readonly keyMap: RMap<this['_K'], RSet.NonEmpty<this['_V']>>;
		readonly keyMapNonEmpty: RMap.NonEmpty<
			this['_K'],
			RSet.NonEmpty<this['_V']>
		>;
		readonly keyMapContext: RMap.Context<this['_K']>;
		readonly keyMapValuesContext: RSet.Context<this['_V']>;
		readonly keyMapValues: RSet<this['_V']>;
		readonly keyMapValuesNonEmpty: RSet.NonEmpty<this['_V']>;
	}
}
