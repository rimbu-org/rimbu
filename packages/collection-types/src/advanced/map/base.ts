import type {
	KeyValue,
	VariantModifyOptions,
	VariantUpdate,
	WithKeyValue,
} from '@rimbu/collection-types/advanced/common';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type {
	ArrayNonEmpty,
	RelatedTo,
	ToJSON,
	WithValueResult,
} from '@rimbu/common/types';
import type {
	FastIterable,
	Stream,
	Streamable,
	StreamSource,
} from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

export interface VariantMapBase<
	K,
	V,
	Tp extends VariantMapBase.Types = VariantMapBase.Types,
> extends FastIterable<readonly [K, V]> {
	/**
	 * Returns true if the collection is empty.
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * console.log(HashMap.empty<number, number>().isEmpty); // => true
	 * console.log(HashMap.of([1, 1], [2, 2]).isEmpty); // => false
	 * ```
	 */
	readonly isEmpty: boolean;
	/**
	 * Returns the number of entries
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * console.log(HashMap.of([1, 1], [2, 2]).size); // => 2
	 * ```
	 */
	readonly size: number;
	/**
	 * Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection
	 * as a .NonEmpty type.
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const source: HashMap<number, number> = HashMap.of([1, 1], [2, 2]);
	 * // the fallback value is allowed since the Stream may be empty
	 * console.log(source.stream().first([0, 0])); // => [ 1, 1 ]
	 * if (source.nonEmpty()) {
	 *   // no fallback needed since the collection is known to be non-empty
	 *   console.log(source.stream().first()); // => [ 1, 1 ]
	 * }
	 * ```
	 */
	nonEmpty(): this is WithKeyValue<Tp, K, V>['nonEmpty'];
	/**
	 * Returns the collection as a .NonEmpty type
	 * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const source: HashMap<number, number> = HashMap.of([1, 1], [2, 2]);
	 * const nonEmpty: HashMap.NonEmpty<number, number> = source.assumeNonEmpty();
	 * console.log(nonEmpty.toString()); // => HashMap(1 -> 1, 2 -> 2)
	 * // HashMap.empty<number, number>().assumeNonEmpty() throws RimbuError.EmptyCollectionAssumedNonEmptyError
	 * ```
	 * @note returns reference to this collection
	 */
	assumeNonEmpty(): WithKeyValue<Tp, K, V>['nonEmpty'];
	/**
	 * Returns a `Stream` containing all entries of this collection as tuples of key and value.
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * console.log(HashMap.of([1, 1], [2, 2]).stream().toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
	 * ```
	 */
	stream(): Stream<readonly [K, V]>;
	/**
	 * Returns a `Stream` containing all keys of this collection.
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * console.log(HashMap.of([1, 'a'], [2, 'b']).streamKeys().toArray()); // => [ 1, 2 ]
	 * ```
	 */
	streamKeys(): Stream<K>;
	/**
	 * Returns a `Stream` containing all values of this collection.
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * console.log(HashMap.of([1, 'a'], [2, 'b']).streamValues().toArray()); // => [ "a", "b" ]
	 * ```
	 */
	streamValues(): Stream<V>;
	/**
	 * Returns the value associated with the given `key`, or given `otherwise` value if the key is not in the collection.
	 * @typeparam UK - the type of key to look for, a related type to K
	 * @param key - the key to look for
	 * @param otherwise - (default: undefined) an `OptLazy` fallback value if the key is not in the collection
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const source = HashMap.of([1, 'a'], [2, 'b']);
	 * console.log(source.at(2)); // => b
	 * console.log(source.at(3)); // => undefined
	 * console.log(source.at(2, 'none')); // => b
	 * console.log(source.at(3, 'none')); // => none
	 * ```
	 */
	at<UK = K>(key: RelatedTo<K, UK>): V | undefined;
	at<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
	/**
	 * Returns true if the given `key` is present in the collection.
	 * @typeparam UK - the type of key to look for, a related type to K
	 * @param key - the key to look for
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const source = HashMap.of([1, 'a'], [2, 'b']);
	 * console.log(source.hasKey(2)); // => true
	 * console.log(source.hasKey(3)); // => false
	 * ```
	 */
	hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
	/**
	 * Returns the collection where the entry associated with given `key` is removed if it was part of the collection.
	 * @typeparam UK - the type of key to look for, a related type to K
	 * @param key - the key of the entry to remove
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const source = HashMap.of([1, 'a'], [2, 'b']);
	 * console.log(source.removeKey(2).toArray()); // => [ [ 1, "a" ] ]
	 * console.log(source.removeKey(3) === source); // => true
	 * ```
	 * @note guarantees same object reference if the key is not present
	 */
	removeKey<UK = K>(key: RelatedTo<K, UK>): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns the collection where the entries associated with each key in given `keys` are removed if they were present.
	 * @typeparam UK - the type of keys to look for, a related type to K
	 * @param keys - a `StreamSource` of keys to remove
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const source = HashMap.of([1, 'a'], [2, 'b']);
	 * console.log(source.removeKeys([1, 3]).toArray()); // => [ [ 2, "b" ] ]
	 * console.log(source.removeKeys([1, 3, 2]).toArray()); // => []
	 * console.log(source.removeKeys([3, 4, 5]) === source); // => true
	 * ```
	 * @note guarantees same object reference if none of the keys are present
	 */
	removeKeys<UK = K>(
		keys: StreamSource<RelatedTo<K, UK>>,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns a tuple `[newMap, value, hasValue]` containing the collection of which the entry associated with given `key`
	 * is removed, the value that was associated with that key, and a `hasValue` flag indicating whether the key was
	 * present. If the key is not present, `newMap` is unchanged and `hasValue` is `false`.
	 * @typeparam UK - the type of key to look for, a related type to K
	 * @param key - the key of the entry to remove
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const source = HashMap.of([1, 'a'], [2, 'b']);
	 * const [newMap, value, hasValue] = source.removeKeyAndGet(2);
	 * console.log([newMap.toString(), value, hasValue]); // => [ "HashMap(1 -> a)", "b", true ]
	 * console.log(source.removeKeyAndGet(3)[2]); // => false
	 * ```
	 */
	removeKeyAndGet<UK = K>(
		key: RelatedTo<K, UK>,
	): WithValueResult<WithKeyValue<Tp, K, V>['normal'], V>;
	/**
	 * Performs given function `f` for each entry of the collection, using given `state` as initial traversal state.
	 * @param f - the function to perform for each entry, receiving:<br/>
	 * - `entry`: the next tuple of a key and value<br/>
	 * - `index`: the index of the element<br/>
	 * - `halt`: a function that, if called, ensures that no new elements are passed
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - state: (optional) the traversal state
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const collected: [string, number][] = [];
	 * HashMap.of([1, 'a'], [2, 'b'], [3, 'c']).forEach((entry, i, halt) => {
	 *   collected.push([entry[1], entry[0]]);
	 *   if (i >= 1) halt();
	 * });
	 * console.log(collected); // => [ [ "a", 1 ], [ "b", 2 ] ]
	 * ```
	 * @note O(N)
	 */
	forEach(
		f: (entry: readonly [K, V], index: number, halt: () => void) => void,
		options?: { state?: TraverseState },
	): void;
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
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const result = HashMap.of([1, 'a'], [2, 'b']).transform((s) => s.map(([k, v]): [number, string] => [k, v.toUpperCase()]));
	 * console.log(result.toArray()); // => [ [ 1, "A" ], [ 2, "B" ] ]
	 * ```
	 * @note because the resulting collection is built in the same context, `K2` must be a subtype of `K`. To transform to an
	 * unrelated key type, build a new collection explicitly, for example `HashMap.from(stream.map(...))`.
	 */
	transform<V2, K2 extends K = K>(
		transformFun: (stream: Stream<readonly [K, V]>) => StreamSource<[K2, V2]>,
	): (Tp & KeyValue<K2, V2>)['normal'];
	/**
	 * Returns a collection with the same keys, but where the given `mapFun` function is applied to each entry value.
	 * @typeparam V2 - the type of the resulting values
	 * @param mapFun - a function taking a `value` and a `key`, and returning a new value
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const result = HashMap.of([1, 'a'], [2, 'abc']).mapValues((v) => v.length);
	 * console.log(result.toArray()); // => [ [ 1, 1 ], [ 2, 3 ] ]
	 * ```
	 */
	mapValues<V2>(
		mapFun: (value: V, key: K) => V2,
	): (Tp & KeyValue<K, V2>)['normal'];
	/**
	 * Returns a collection containing only those entries that satisfy given `pred` predicate.
	 * @param pred - a predicate function receiving:<br/>
	 * - `entry`: the next entry<br/>
	 * - `index`: the entry index<br/>
	 * - `halt`: a function that, when called, ensures no next elements are passed
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - negate: (default: false) when true will negate the predicate
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const result = HashMap.of([1, 'a'], [2, 'b'], [3, 'c']).filter(
	 *   (entry) => entry[0] === 2 || entry[1] === 'c',
	 * );
	 * console.log(result.toArray()); // => [ [ 2, "b" ], [ 3, "c" ] ]
	 * ```
	 */
	filter(
		pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean,
		options?: { negate?: boolean },
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns an array containing all entries in this collection.
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * console.log(HashMap.of([1, 'a'], [2, 'b']).toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
	 * ```
	 * @note O(log(N))
	 * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
	 */
	toArray(): (readonly [K, V])[];
	/**
	 * Returns a string representation of this collection.
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * console.log(HashMap.of([1, 'a'], [2, 'b']).toString()); // => HashMap(1 -> a, 2 -> b)
	 * ```
	 */
	toString(): string;
	/**
	 * Returns a JSON representation of this collection.
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * console.log(HashMap.of([1, 'a'], [2, 'b']).toJSON()); // => { dataType: "HashMap", value: [ [ 1, "a" ], [ 2, "b" ] ] }
	 * ```
	 */
	toJSON(): ToJSON<(readonly [K, V])[]>;
}

export namespace VariantMapBase {
	export interface NonEmpty<
		K,
		V,
		Tp extends VariantMapBase.Types = VariantMapBase.Types,
	> extends VariantMapBase<K, V, Tp>,
			Streamable.NonEmpty<readonly [K, V]> {
		/**
		 * Returns false since this collection is known to be non-empty.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.of([1, 1], [2, 2]).isEmpty); // => false
		 * ```
		 */
		readonly isEmpty: false;
		/**
		 * Returns true since this collection is known to be non-empty
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.of([1, 1], [2, 2]).nonEmpty()); // => true
		 * ```
		 */
		nonEmpty(): this is WithKeyValue<Tp, K, V>['nonEmpty'];
		/**
		 * Returns a self reference since this collection is known to be non-empty.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const source = HashMap.of([1, 1], [2, 2]);
		 * console.log(source === source.assumeNonEmpty()); // => true
		 * ```
		 */
		assumeNonEmpty(): this;
		/**
		 * Returns this collection typed as a 'possibly empty' collection.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.of([1, 1], [2, 2]).asNormal().toString()); // => HashMap(1 -> 1, 2 -> 2)
		 * ```
		 */
		asNormal(): (Tp & KeyValue<K, V>)['normal'];
		/**
		 * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.of([1, 1], [2, 2]).stream().toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
		 * ```
		 */
		stream(): Stream.NonEmpty<readonly [K, V]>;
		/**
		 * Returns a non-empty Stream containing all keys of this collection.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.of([1, 'a'], [2, 'b']).streamKeys().toArray()); // => [ 1, 2 ]
		 * ```
		 */
		streamKeys(): Stream.NonEmpty<K>;
		/**
		 * Returns a non-empty Stream containing all values of this collection.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.of([1, 'a'], [2, 'b']).streamValues().toArray()); // => [ "a", "b" ]
		 * ```
		 */
		streamValues(): Stream.NonEmpty<V>;
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
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const result = HashMap.of([1, 'a'], [2, 'b']).transform((s) =>
		 *   s.map(([k, v]): [number, string] => [k, v.toUpperCase()]),
		 * );
		 * console.log(result.toArray()); // => [ [ 1, "A" ], [ 2, "B" ] ]
		 * ```
		 * @note because the resulting collection is built in the same context, `K2` must be a subtype of `K`. To transform to an
		 * unrelated key type, build a new collection explicitly, for example `HashMap.from(stream.map(...))`.
		 */
		transform<V2, K2 extends K = K>(
			transformFun: (
				stream: Stream.NonEmpty<readonly [K, V]>,
			) => StreamSource<[K2, V2]>,
		): (Tp & KeyValue<K2, V2>)['normal'];
		transform<V2, K2 extends K = K>(
			transformFun: (
				stream: Stream.NonEmpty<readonly [K, V]>,
			) => StreamSource.NonEmpty<[K2, V2]>,
		): (Tp & KeyValue<K2, V2>)['nonEmpty'];
		/**
		 * Returns a non-empty collection with the same keys, but where the given `mapFun` function is
		 * applied to each entry value.
		 * @typeparam V2 - the type of the resulting values
		 * @param mapFun - a function taking a `value` and a `key`, and returning a new value
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const result = HashMap.of([1, 'a'], [2, 'abc']).mapValues((v) => v.length);
		 * console.log(result.toArray()); // => [ [ 1, 1 ], [ 2, 3 ] ]
		 * ```
		 */
		mapValues<V2>(
			mapFun: (value: V, key: K) => V2,
		): (Tp & KeyValue<K, V2>)['nonEmpty'];
		/**
		 * Returns a non-empty array containing all entries in this collection.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.of([1, 'a'], [2, 'b']).toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
		 * ```
		 * @note O(log(N))
		 * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
		 */
		toArray(): ArrayNonEmpty<readonly [K, V]>;
	}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends KeyValue {
		readonly normal: VariantMapBase<this['_K'], this['_V']>;
		readonly nonEmpty: VariantMapBase.NonEmpty<this['_K'], this['_V']>;
	}
}

export interface RMapBase<K, V, Tp extends RMapBase.Types = RMapBase.Types>
	extends VariantMapBase<K, V, Tp> {
	/**
	 * Returns the `context` associated to this collection instance.
	 */
	readonly context: WithKeyValue<Tp, K, V>['context'];
	/**
	 * Returns the collection with the given `key` associated to the given `value`.
	 * @param key - the entry key to add
	 * @param value - the entry value to add
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * console.log(HashMap.of([1, 'a']).set(2, 'b').toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
	 * console.log(HashMap.of([1, 'a']).set(1, 'b').toArray()); // => [ [ 1, "b" ] ]
	 * ```
	 * @note if the key is already associated, the previous value will be 'replaced'
	 */
	set(key: K, value: V): WithKeyValue<Tp, K, V>['nonEmpty'];
	/**
	 * Returns the collection with given `entry` added.
	 * @param entry - a tuple containing a key and value
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * console.log(HashMap.of([1, 'a']).addEntry([2, 'b']).toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
	 * console.log(HashMap.of([1, 'a']).addEntry([1, 'b']).toArray()); // => [ [ 1, "b" ] ]
	 * ```
	 */
	addEntry(entry: readonly [K, V]): WithKeyValue<Tp, K, V>['nonEmpty'];
	/**
	 * Returns the collection with the entries from the given `StreamSource` `entries` added.
	 * @typeparam V2 - the type of the values to add, a subtype of V
	 * @param entries - a `StreamSource` containing tuples with a key and value
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const result = HashMap.of([1, 'a']).addEntries([[2, 'b']]);
	 * console.log(result.toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
	 * ```
	 */
	addEntries<V2 extends V = V>(
		entries: StreamSource.NonEmpty<readonly [K, V2]>,
	): WithKeyValue<Tp, K, V>['nonEmpty'];
	addEntries<V2 extends V = V>(
		entries: StreamSource<readonly [K, V2]>,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns the collection with the given `atKey` key modified according to given `options`.
	 * @param atKey - the key at which to modify the collection
	 * @param options - an object containing the following information:<br/>
	 * - ifNew: (optional) if the given `atKey` is not present in the collection, this value or function will be used
	 * to generate a new entry. If a function returning the token argument is given, no new entry is created.<br/>
	 * - ifExists: (optional) if a value is associated with given `atKey`, this function is called with the given value
	 * to return a new value. As a second argument, a `remove` token is given. If the function returns this token, the current
	 * entry is removed.
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const source = HashMap.of([1, 'a'], [2, 'b']);
	 * console.log(source.modifyAt(3, { ifNew: { set: 'c' } }).toArray()); // => [ [ 1, "a" ], [ 2, "b" ], [ 3, "c" ] ]
	 * console.log(source.modifyAt(3, { ifNew: { create: (skip) => skip } }).toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
	 * console.log(source.modifyAt(2, { ifExists: { set: 'c' } }).toArray()); // => [ [ 1, "a" ], [ 2, "c" ] ]
	 * console.log(source.modifyAt(2, { ifExists: { update: (v) => v + 'z' } }).toArray()); // => [ [ 1, "a" ], [ 2, "bz" ] ]
	 * console.log(source.modifyAt(2, { ifExists: { update: (v, remove) => (v === 'a' ? v : remove) } }).toArray()); // => [ [ 1, "a" ] ]
	 * ```
	 */
	modifyAt(
		atKey: K,
		options: VariantModifyOptions<V>,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns the collection where the value associated with given `key` is updated with the given `update` value or update function.
	 * @typeparam UK - the type of key to look for, a related type to K
	 * @param key - the key of the entry to update
	 * @param update - a new value or function taking the current value and returning a new value
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const source = HashMap.of([1, 'a'], [2, 'b']);
	 * console.log(source.updateAt(3, () => 'a').toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
	 * console.log(source.updateAt(2, () => 'c').toArray()); // => [ [ 1, "a" ], [ 2, "c" ] ]
	 * console.log(source.updateAt(2, (v) => v + 'z').toArray()); // => [ [ 1, "a" ], [ 2, "bz" ] ]
	 * ```
	 */
	updateAt<UK = K>(
		key: RelatedTo<K, UK>,
		update: (value: V) => V,
	): WithKeyValue<Tp, K, V>['normal'];
	/**
	 * Returns a tuple `[newMap, value, hasValue]` containing the collection where the value associated with given `key` is
	 * updated with the given `update` value or update function, the value that was previously associated with that key, and
	 * a `hasValue` flag indicating whether the `key` was present.
	 * If the key is present, `value` is the previous value and `hasValue` is `true`, even when the update yields the same
	 * value (a no-op): in that case `newMap` is unchanged and `result[0] === this`. If the key is not present, `newMap` is
	 * unchanged, `value` is `undefined`, and `hasValue` is `false`.
	 * @typeparam UK - the type of key to look for, a related type to K
	 * @param key - the key of the entry to update
	 * @param update - a new value or function taking the current value and returning a new value
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const source = HashMap.of([1, 'a'], [2, 'b']);
	 * const [newMap, value, hasValue] = source.updateAtAndGet(2, (v) => v + 'c');
	 * console.log([newMap.toArray(), value, hasValue]); // => [ [ [ 1, "a" ], [ 2, "bc" ] ], "b", true ]
	 * console.log(source.updateAtAndGet(3, (v) => v + 'c')[2]); // => false
	 * console.log(source.updateAtAndGet(2, (v) => v)[2]); // => true
	 * ```
	 */
	updateAtAndGet<UK = K>(
		key: RelatedTo<K, UK>,
		update: VariantUpdate<V>,
	): WithValueResult<
		WithKeyValue<Tp, K, V>['nonEmpty'],
		V,
		WithKeyValue<Tp, K, V>['normal']
	>;
	/**
	 * Returns a builder object containing the entries of this collection.
	 * @example
	 * ```ts
	 * import { HashMap } from '@rimbu/hashed';
	 *
	 * const builder: HashMap.Builder<number, string> = HashMap.of([1, 'a'], [2, 'b']).toBuilder();
	 * console.log(builder.size); // => 2
	 * ```
	 */
	toBuilder(): WithKeyValue<Tp, K, V>['builder'];
}

export namespace RMapBase {
	export interface NonEmpty<K, V, Tp extends RMapBase.Types = RMapBase.Types>
		extends VariantMapBase.NonEmpty<K, V, Tp>,
			Omit<RMapBase<K, V, Tp>, keyof VariantMapBase.NonEmpty<any, any, any>>,
			Streamable.NonEmpty<readonly [K, V]> {
		/**
		 * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.of([1, 1], [2, 2]).stream().toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
		 * ```
		 */
		stream(): Stream.NonEmpty<readonly [K, V]>;
		/**
		 * Returns the collection with the entries from the given `StreamSource` `entries` added.
		 * @param entries - a `StreamSource` containing tuples with a key and value
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const result = HashMap.of([1, 'a']).addEntries([[2, 'b']]);
		 * console.log(result.toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
		 * ```
		 */
		addEntries(
			entries: StreamSource<readonly [K, V]>,
		): WithKeyValue<Tp, K, V>['nonEmpty'];
		/**
		 * Returns the collection where the value associated with given `key` is updated with the given `update` value or update function.
		 * @typeparam UK - the type of key to look for, a related type to K
		 * @param key - the key of the entry to update
		 * @param update - a new value or function taking the current value and returning a new value
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const source = HashMap.of([1, 'a'], [2, 'b']);
		 * console.log(source.updateAt(3, () => 'a').toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
		 * console.log(source.updateAt(2, () => 'c').toArray()); // => [ [ 1, "a" ], [ 2, "c" ] ]
		 * console.log(source.updateAt(2, (v) => v + 'z').toArray()); // => [ [ 1, "a" ], [ 2, "bz" ] ]
		 * ```
		 */
		updateAt<UK = K>(
			key: RelatedTo<K, UK>,
			update: (value: V) => V,
		): WithKeyValue<Tp, K, V>['nonEmpty'];
		/**
		 * Returns a tuple `[newMap, value, hasValue]` containing the collection where the value associated with given `key` is
		 * updated with the given `update` value or update function, the value that was previously associated with that key, and
		 * a `hasValue` flag indicating whether the `key` was present. Since this collection is non-empty, `newMap` is always
		 * non-empty; if the key is present, `value` is the previous value and `hasValue` is `true`, even when the update yields
		 * the same value (a no-op, where `newMap` is unchanged and `result[0] === this`). If the key is not present, `newMap`
		 * is unchanged, `value` is `undefined`, and `hasValue` is `false`.
		 * @typeparam UK - the type of key to look for, a related type to K
		 * @param key - the key of the entry to update
		 * @param update - a new value or function taking the current value and returning a new value
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const source = HashMap.of([1, 'a'], [2, 'b']);
		 * const [newMap, value, hasValue] = source.updateAtAndGet(2, (v) => v + 'c');
		 * console.log([newMap.toArray(), value, hasValue]); // => [ [ [ 1, "a" ], [ 2, "bc" ] ], "b", true ]
		 * console.log(source.updateAtAndGet(2, (v) => v)[2]); // => true
		 * ```
		 */
		updateAtAndGet<UK = K>(
			key: RelatedTo<K, UK>,
			update: VariantUpdate<V>,
		): WithValueResult<WithKeyValue<Tp, K, V>['nonEmpty'], V>;
	}

	export interface Factory<Tp extends RMapBase.Types, UK = unknown> {
		/**
		 * Returns the (singleton) empty instance of this type and context with given key and value types.
		 * @typeparam K - the key type
		 * @typeparam V - the value type
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.empty<number, string>().toString()); // => HashMap()
		 * console.log(HashMap.empty<string, boolean>().toString()); // => HashMap()
		 * ```
		 */
		empty<K extends UK, V>(): WithKeyValue<Tp, K, V>['normal'];
		/**
		 * Returns an immutable map of this collection type and context, containing the given `entries`.
		 * @typeparam K - the key type
		 * @typeparam V - the value type
		 * @param entries - a non-empty array of key-value entries
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.of([1, 'a'], [2, 'b']).toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
		 * ```
		 */
		of<K extends UK, V>(
			...entries: ArrayNonEmpty<readonly [K, V]>
		): WithKeyValue<Tp, K, V>['nonEmpty'];
		/**
		 * Returns an immutable map of this type and context, containing the entries in the given `sources` `StreamSource` instances.
		 * @typeparam K - the key type
		 * @typeparam V - the value type
		 * @param sources - an array of `StreamSource` instances containing key-value entries
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.from([[1, 'a'], [2, 'b']]).toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
		 * ```
		 */
		from<K extends UK, V>(
			...sources: ArrayNonEmpty<StreamSource.NonEmpty<readonly [K, V]>>
		): WithKeyValue<Tp, K, V>['nonEmpty'];
		from<K extends UK, V>(
			...sources: ArrayNonEmpty<StreamSource<readonly [K, V]>>
		): WithKeyValue<Tp, K, V>['normal'];
		/**
		 * Returns an empty builder instance for this type of collection and context.
		 * @typeparam K - the key type
		 * @typeparam V - the value type
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder: HashMap.Builder<number, string> = HashMap.builder<number, string>();
		 * console.log(builder.size); // => 0
		 * ```
		 */
		builder<K extends UK, V>(): WithKeyValue<Tp, K, V>['builder'];
		/**
		 * Returns a `Reducer` that adds received tuples to an RMap and returns the RMap as a result. When a `source` is given,
		 * the reducer will first create an RMap from the source, and then add tuples to it.
		 * @typeparam K - the key type
		 * @typeparam V - the value type
		 * @param source - (optional) an initial source of tuples to add to
		 * @example
		 * ```ts
		 * import { Stream } from '@rimbu/stream';
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const someSource = HashMap.of([1, 'a'], [2, 'b']);
		 * const result = Stream.of<readonly [number, string]>([1, 'c'], [3, 'a']).reduce(
		 *   HashMap.reducer(someSource),
		 * );
		 * console.log(result.toArray()); // => [ [ 1, "c" ], [ 2, "b" ], [ 3, "a" ] ]
		 * ```
		 * @note uses a builder under the hood. If the given `source` is an RMap in the same context, it will directly call `.toBuilder()`.
		 */
		reducer<K extends UK, V>(
			source?: StreamSource<readonly [K, V]>,
		): Reducer<readonly [K, V], WithKeyValue<Tp, K, V>['normal']>;
		/**
		 * Returns a Map containing all keys from this map and all the given `sources` key-value stream sources,
		 * and as values tuples of all the corresponding values for each key. If a source doesn't have a key,
		 * the tuple will be filled with the given `fillValue`.
		 * @typeparam O - the type of the fill value
		 * @typeparam I - the array of input source value types
		 * @typeparam K - the common key type
		 * @param fillValue - the value to use for the result tuple if a source does not have a certain key
		 * @param sources - a non-empty set of StreamSources containing tuples of keys and values
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const m = HashMap.of([1, 'a'], [2, 'b']);
		 * const result = HashMap.mergeAll('none', m, [[2, true]], HashMap.of([3, 15]));
		 * // type of result: HashMap<number, [string, boolean | string, number | string]>
		 * console.log(result.toArray());
		 * // => [ [ 1, [ "a", "none", "none" ] ], [ 2, [ "b", true, "none" ] ], [ 3, [ "none", "none", 15 ] ] ]
		 * ```
		 */
		mergeAll<
			O,
			I extends readonly [unknown, unknown, ...unknown[]],
			K extends UK,
		>(
			fillValue: O,
			...sources: {
				[KT in keyof I]: StreamSource.NonEmpty<readonly [K, I[KT]]>;
			} & unknown[]
		): WithKeyValue<Tp, K, { [KT in keyof I]: I[KT] | O }>['nonEmpty'];
		mergeAll<
			O,
			I extends readonly [unknown, unknown, ...unknown[]],
			K extends UK,
		>(
			fillValue: O,
			...sources: {
				[KT in keyof I]: StreamSource<readonly [K, I[KT]]>;
			} & unknown[]
		): WithKeyValue<Tp, K, { [KT in keyof I]: I[KT] | O }>['normal'];
		/**
		 * Returns a Map containing all keys from this map and all the given `sources` key-value stream sources,
		 * and as values the result of applying the given `mergeFun` to the key and all the corresponding values for each key. If a source doesn't have a key,
		 * the given tuple will be filled with the given `fillValue`.
		 * @typeparam I - the array of input source value types
		 * @typeparam K - the common key type
		 * @typeparam O - the type of the fill value
		 * @typeparam R - the resulting Map value type
		 * @param fillValue - the value to use for the result tuple if a source does not have a certain key
		 * @param sources - a non-empty set of StreamSources containing tuples of keys and values
		 * @param mergeFun - a function that receives each key of the given sources and, if present, the corresponding source values, or the given fill value otherwise,
		 * and returns the result value to use in the resulting map.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const m = HashMap.of([1, 'a'], [2, 'b']);
		 * const result = HashMap.mergeAllWith(
		 *   m,
		 *   [[2, 'c']],
		 *   HashMap.of([3, 'd']),
		 * )('q', (key, v1, v2, v3) => `${key}${v1}${v2}${v3}`);
		 * // type of result: HashMap<number, string>
		 * console.log(result.toArray());
		 * // => [ [ 1, "1aqq" ], [ 2, "2bcq" ], [ 3, "3qqd" ] ]
		 * ```
		 */
		mergeAllWith<
			I extends readonly [unknown, unknown, ...unknown[]],
			K extends UK,
		>(
			...sources: {
				[KT in keyof I]: StreamSource.NonEmpty<readonly [K, I[KT]]>;
			} & unknown[]
		): <O, R>(
			fillValue: O,
			mergeFun: (key: K, ...values: { [KT in keyof I]: I[KT] | O }) => R,
		) => WithKeyValue<Tp, K, R>['nonEmpty'];
		mergeAllWith<
			I extends readonly [unknown, unknown, ...unknown[]],
			K extends UK,
		>(
			...sources: {
				[KT in keyof I]: StreamSource<readonly [K, I[KT]]>;
			} & unknown[]
		): <O, R>(
			fillValue: O,
			mergeFun: (key: K, ...values: { [KT in keyof I]: I[KT] | O }) => R,
		) => WithKeyValue<Tp, K, R>['normal'];
		/**
		 * Returns a Map containing the common keys from this map and all the given `sources` key-value stream sources,
		 * and as values tuples of all the corresponding values for each common key. If a source doesn't have a key,
		 * the key will be skipped.
		 * @typeparam I - the array of input source value types
		 * @typeparam K - the common key type
		 * @param sources - a non-empty set of StreamSources containing tuples of keys and values
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const m = HashMap.of([1, 'a'], [2, 'b']);
		 * const result = HashMap.merge(m, [[2, true]], HashMap.of([2, 15]));
		 * // type of result: HashMap<number, [string, boolean, number]>
		 * console.log(result.toArray()); // => [ [ 2, [ "b", true, 15 ] ] ]
		 * ```
		 */
		merge<K extends UK, I extends readonly [unknown, unknown, ...unknown[]]>(
			...sources: {
				[KT in keyof I]: StreamSource.NonEmpty<readonly [K, I[KT]]>;
			} & unknown[]
		): WithKeyValue<Tp, K, { [KT in keyof I]: I[KT] }>['nonEmpty'];
		merge<K extends UK, I extends readonly [unknown, unknown, ...unknown[]]>(
			...sources: {
				[KT in keyof I]: StreamSource<readonly [K, I[KT]]>;
			} & unknown[]
		): WithKeyValue<Tp, K, { [KT in keyof I]: I[KT] }>['normal'];
		/**
		 * Returns a Map containing the common keys from this map and all the given `sources` key-value stream sources,
		 * and as values the result of applying given `mergeFun` to the key and values of all the corresponding values for each common key.
		 * If a source doesn't have a key, the key will be skipped.
		 * @typeparam I - the array of input source value types
		 * @typeparam K - the common key type
		 * @typeparam R - the resulting Map value type
		 * @param sources - a non-empty set of StreamSources containing tuples of keys and values
		 * @param mergeFun - a function taking the key and values from this map and all sources corresponding to the key, and
		 * returning a value for the resulting Map.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const m = HashMap.of([1, 'a'], [2, 'b']);
		 * const result = HashMap.mergeWith(
		 *   m,
		 *   [[2, true]],
		 *   HashMap.of([2, 15]),
		 * )((key, v1, v2) => `${key}${v1}${v2}`);
		 * // type of result: HashMap<number, string>
		 * console.log(result.toArray()); // => [ [ 2, "2btrue" ] ]
		 * ```
		 */
		mergeWith<
			I extends readonly [unknown, unknown, ...unknown[]],
			K extends UK,
		>(
			...sources: {
				[KT in keyof I]: StreamSource.NonEmpty<readonly [K, I[KT]]>;
			} & unknown[]
		): <R>(
			mergeFun: (key: K, ...values: I) => R,
		) => WithKeyValue<Tp, K, R>['nonEmpty'];
		mergeWith<
			I extends readonly [unknown, unknown, ...unknown[]],
			K extends UK,
		>(
			...sources: {
				[KT in keyof I]: StreamSource<readonly [K, I[KT]]>;
			} & unknown[]
		): <R>(
			mergeFun: (key: K, ...values: I) => R,
		) => WithKeyValue<Tp, K, R>['normal'];
	}

	/**
	 * The map's Context instance that serves as a factory for all related immutable instances and builders.
	 */
	export interface Context<UK, Tp extends RMapBase.Types = RMapBase.Types>
		extends RMapBase.Factory<Tp, UK> {
		readonly _fixedKeyType: (key: UK) => never;

		/**
		 * A string tag defining the specific collection type
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.defaultContext().typeTag); // => HashMap
		 * ```
		 */
		readonly typeTag: string;

		readonly _types: Tp;

		/**
		 * Returns true if given `obj` could be a valid key in this Context.
		 * @param obj - the object to check
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.defaultContext().isValidKey(1)); // => true
		 * ```
		 */
		isValidKey(obj: any): obj is UK;
	}

	export interface Builder<K, V, Tp extends RMapBase.Types = RMapBase.Types> {
		/**
		 * Returns the `context` associated to this collection instance.
		 */
		readonly context: WithKeyValue<Tp, K, V>['context'];
		/**
		 * Returns the amount of entries in the builder.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.of([1, 'a'], [2, 'b']).toBuilder().size); // => 2
		 * ```
		 */
		readonly size: number;
		/**
		 * Returns true if there are no entries in the builder.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * console.log(HashMap.of([1, 'a'], [2, 'b']).toBuilder().isEmpty); // => false
		 * ```
		 */
		readonly isEmpty: boolean;
		/**
		 * Returns the value associated with the given `key`, or given `otherwise` value if the key is not in the collection.
		 * @typeparam UK - the type of key to look for, a related type to K
		 * @param key - the key to look for
		 * @param otherwise - (default: undefined) an `OptLazy` fallback value if the key is not in the collection
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder = HashMap.of([1, 'a'], [2, 'b']).toBuilder();
		 * console.log(builder.get(2)); // => b
		 * console.log(builder.get(3)); // => undefined
		 * console.log(builder.get(2, 'none')); // => b
		 * console.log(builder.get(3, 'none')); // => none
		 * ```
		 */
		at<UK = K>(key: RelatedTo<K, UK>): V | undefined;
		at<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
		/**
		 * Returns true if the given `key` is present in the builder.
		 * @typeparam UK - the type of key to look for, a related type to K
		 * @param key - the key to look for
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder = HashMap.of([1, 'a'], [2, 'b']).toBuilder();
		 * console.log(builder.hasKey(2)); // => true
		 * console.log(builder.hasKey(3)); // => false
		 * ```
		 */
		hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
		/**
		 * Performs given function `f` for each entry of the builder.
		 * @param f - the function to perform for each element, receiving:<br/>
		 * - `entry`: the next key-value entry<br/>
		 * - `index`: the index of the element<br/>
		 * - `halt`: a function that, if called, ensures that no new elements are passed
		 * @throws RimbuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while
		 * looping over it
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const collected: [string, number][] = [];
		 * HashMap.of([1, 'a'], [2, 'b'], [3, 'c']).toBuilder().forEach((entry, i, halt) => {
		 *   collected.push([entry[1], entry[0]]);
		 *   if (i >= 1) halt();
		 * });
		 * console.log(collected); // => [ [ "a", 1 ], [ "b", 2 ] ]
		 * ```
		 * @note O(N)
		 */
		forEach(
			f: (entry: readonly [K, V], index: number, halt: () => void) => void,
			options?: { state?: TraverseState },
		): void;
		/**
		 * Adds given `entry` to the builder.
		 * @param entry - the entry to add
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder = HashMap.of([1, 'a'], [2, 'b']).toBuilder();
		 * console.log(builder.addEntry([3, 'c'])); // => true
		 * console.log(builder.addEntry([1, 'a'])); // => false
		 * ```
		 */
		addEntry(entry: readonly [K, V]): boolean;
		/**
		 * Adds given `entries` to the builder.
		 * @param entries - a `StreamSource` containing the entries to add
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder = HashMap.of([1, 'a'], [2, 'b']).toBuilder();
		 * console.log(builder.addEntries([[3, 'c']])); // => true
		 * console.log(builder.addEntries([])); // => false
		 * ```
		 */
		addEntries(entries: StreamSource<readonly [K, V]>): boolean;
		/**
		 * Associates given `key` with given `value` in the builder.
		 * @param key - the entry key
		 * @param value - the entry value
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder = HashMap.of([1, 'a'], [2, 'b']).toBuilder();
		 * console.log(builder.set(3, 'c')); // => true
		 * console.log(builder.set(1, 'a')); // => false
		 * ```
		 */
		set(key: K, value: V): boolean;
		/**
		 * Removes the entry with given `key` from the builder.
		 * @typeparam UK - the type of key to look for, a related type to K
		 * @param key - the key of the entry to remove
		 * @param otherwise - (default: undefined) the value to return if the key is not in the builder
		 * @returns the value previously associated with given `key`, or the fallback value otherwise
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder = HashMap.of([1, 'a'], [2, 'b']).toBuilder();
		 * console.log(builder.removeKey(2)); // => b
		 * console.log(builder.removeKey(3)); // => undefined
		 * console.log(builder.removeKey(3, 'c')); // => c
		 * ```
		 */
		removeKey<UK = K>(key: RelatedTo<K, UK>): V | undefined;
		removeKey<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
		/**
		 * Removes the entries in the given `keys` `StreamSource` from the builder.
		 * @typeparam UK - the type of keys to look for, a related type to K
		 * @param source - the `StreamSource` containing the keys to remove.
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder = HashMap.of([1, 'a'], [2, 'b']).toBuilder();
		 * console.log(builder.removeKeys([3, 4, 5])); // => false
		 * console.log(builder.removeKeys([1, 10])); // => true
		 * ```
		 */
		removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): boolean;
		/**
		 * Modifies or creates the builder entry with given `atKey` as its key according to given `options`.
		 * @param atKey - the key at which to modify the collection
		 * @param options - an object containing the following information:<br/>
		 * - ifNew: (optional) if the given `atKey` is not present in the collection, this value or function will be used
		 * to generate a new entry. If a function returning the token argument if given, no new entry is created.<br/>
		 * - ifExists: (optional) if a value is associated with given `atKey`, this function is called with the given value.
		 * As a second argument, a `remove` token is given. If the function returns this token, the current entry is removed.
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder = HashMap.of([1, 'a'], [2, 'b']).toBuilder();
		 * console.log(builder.modifyAt(1, { ifNew: { set: 'd' } })); // => false
		 * console.log(builder.modifyAt(3, { ifNew: { set: 'c' } })); // => true
		 * console.log(builder.modifyAt(4, { ifNew: { create: (skip) => skip } })); // => false
		 * console.log(builder.modifyAt(2, { ifExists: { set: 'c' } })); // => true
		 * console.log(builder.modifyAt(1, { ifExists: { update: (v) => v + 'z' } })); // => true
		 * console.log(builder.modifyAt(3, { ifExists: { update: (v, remove) => (v === 'c' ? remove : v) } })); // => true
		 * ```
		 */
		modifyAt(key: K, options: VariantModifyOptions<V>): boolean;
		/**
		 * Updates the value in the builder associated with given `key` according to given `update` value or function.
		 * @param key - the key of the entry to update
		 * @param update - a new value or function taking the previous value and returning a new value
		 * @param otherwise - (default: undefined) a fallback value to return if the key is not in the builder
		 * @returns the previous value associated with given key, of the fallback value otherwise.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder = HashMap.of([1, 'a'], [2, 'b']).toBuilder();
		 * console.log(builder.updateAt(1, () => 'a')); // => a
		 * console.log(builder.updateAt(1, () => 'b')); // => a
		 * console.log(builder.updateAt(2, (v) => v + 'z')); // => b
		 * ```
		 */
		updateAt(key: K, update: VariantUpdate<V>): V | undefined;
		updateAt<O>(key: K, update: VariantUpdate<V>, otherwise: OptLazy<O>): V | O;
		/**
		 * Returns an immutable collection instance containing the entries in this builder.
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder = HashMap.of([1, 'a'], [2, 'b']).toBuilder();
		 * const result: HashMap<number, string> = builder.build();
		 * console.log(result.toArray()); // => [ [ 1, "a" ], [ 2, "b" ] ]
		 * ```
		 */
		build(): WithKeyValue<Tp, K, V>['normal'];
		/**
		 * Returns an immutable instance of the entries in this builder, with given `mapValues` function applied
		 * to all the values in the entries.
		 * @typeparam V2 - the type of the resulting values
		 * @param mapFun - a function that takes an entry value and its key, and returns a new value
		 * @example
		 * ```ts
		 * import { HashMap } from '@rimbu/hashed';
		 *
		 * const builder = HashMap.of([1, 'a'], [2, 'bc']).toBuilder();
		 * const result: HashMap<number, number> = builder.buildMapValues((value) => value.length);
		 * console.log(result.toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
		 * ```
		 */
		buildMapValues<V2>(
			mapFun: (value: V, key: K) => V2,
		): (Tp & KeyValue<K, V2>)['normal'];
	}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends VariantMapBase.Types {
		readonly normal: RMapBase<this['_K'], this['_V']>;
		readonly nonEmpty: RMapBase.NonEmpty<this['_K'], this['_V']>;
		readonly context: RMapBase.Context<this['_K']>;
		readonly builder: RMapBase.Builder<this['_K'], this['_V']>;
	}
}
