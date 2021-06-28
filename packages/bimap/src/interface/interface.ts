import type { CustomBase, RMap } from '@rimbu/collection-types';
import type {
  ArrayNonEmpty,
  OmitStrong,
  OptLazy,
  RelatedTo,
  ToJSON,
  TraverseState,
  Update,
} from '@rimbu/common';
import { HashMap } from '@rimbu/hashed';
import type {
  FastIterable,
  Stream,
  Streamable,
  StreamSource,
} from '@rimbu/stream';
import { BiMapContext } from '../bimap-custom';

/**
 * A type-invariant immutable bi-directional Map where keys and values have a one-to-one mapping.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * const b1 = BiMap.empty<number, string>()
 * const b2 = BiMap.of([1, 'a'], [2, 'b'])
 */
export interface BiMap<K, V> extends FastIterable<readonly [K, V]> {
  /**
   * Returns the `context` associated to this collection instance.
   */
  readonly context: BiMap.Context<K, V>;
  /**
   * Returns true if the collection is empty.
   * @example
   * BiMap.empty<number, number>().isEmpty   // => true
   * BiMap.of([1, 1], [2, 2]).isEmpty        // => false
   */
  readonly isEmpty: boolean;
  /**
   * Returns the number of entries
   * @example
   * BiMap.of([1, 1], [2, 2]).size       // => 2
   */
  readonly size: number;
  /**
   * Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection
   * as a .NonEmpty type.
   * @example
   * const m: BiMap<number, number> = BiMap.of([1, 1], [2, 2])
   * m.stream().first(0)     // compiler allows fallback value since the Stream may be empty
   * if (m.nonEmpty()) {
   *   m.stream().first(0)   // compiler error: fallback value not allowed since Stream is not empty
   * }
   */
  nonEmpty(): this is BiMap.NonEmpty<K, V>;
  /**
   * Returns the collection as a .NonEmpty type
   * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty
   * @example
   * BiMap.empty<number, number>().assumeNonEmpty()   // => throws
   * const m: BiMap<number, number> = BiMap.of([1, 1], [2, 2])
   * const m2: BiMap.NonEmpty<number, number> = m     // => compiler error
   * const m3: BiMap.NonEmpty<number, number> = m.assumeNonEmpty()
   * @note returns reference to this collection
   */
  assumeNonEmpty(): BiMap.NonEmpty<K, V>;
  /**
   * Returns the Map representation of the key to value mapping.
   * @example
   * BiMap.of([1, 10], [2, 20]).keyValueMap.toArray()
   * // => [[1, 10], [2, 20]]
   */
  readonly keyValueMap: RMap<K, V>;
  /**
   * Returns the Map representation of the key to value mapping.
   * @example
   * BiMap.of([1, 10], [2, 20]).valueKeyMap.toArray()
   * // => [[10, 1], [20, 2]]
   */
  readonly valueKeyMap: RMap<V, K>;
  /**
   * Returns true if the given `key` is present in the collection.
   * @param key - the key to look for
   * @example
   * const m = BiMap.of([1, 'a'], [2, 'b'])
   * m.hasKey(2)    // => true
   * m.hasKey(3)    // => false
   */
  hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
  /**
   * Returns true if the given `value` is present in the collection.
   * @param value - the value to look for
   * @example
   * const m = BiMap.of([1, 'a'], [2, 'b'])
   * m.hasKey('a')    // => true
   * m.hasKey('z')    // => false
   */
  hasValue<UV = V>(key: RelatedTo<V, UV>): boolean;
  /**
   * Returns the value associated with the given `key`, or given `otherwise` value if the key is not in the collection.
   * @param key - the key to look for
   * @param otherwise - (default: undefined) an `OptLazy` fallback value if the key is not in the collection
   * @example
   * const m = BiMap.of([1, 'a'], [2, 'b'])
   * m.getValue(2)          // => 'b'
   * m.getValue(3)          // => undefined
   * m.getValue(2, 'none')  // => 'b'
   * m.getValue(3, 'none')  // => 'none'
   */
  getValue<UK = K>(key: RelatedTo<K, UK>): V | undefined;
  getValue<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
  /**
   * Returns the key associated with the given `value`, or given `otherwise` value if the key is not in the collection.
   * @param value - thevalue to look for
   * @param otherwise - (default: undefined) an `OptLazy` fallback value if the value is not in the collection
   * @example
   * const m = BiMap.of([1, 'a'], [2, 'b'])
   * m.getKey('b')          // => 2
   * m.getKey('z')          // => undefined
   * m.getKey('b', 'none')  // => 2
   * m.getKey('z', 'none')  // => 'none'
   */
  getKey<UV = V>(value: RelatedTo<V, UV>): K | undefined;
  getKey<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;
  /**
   * Returns the collection with the given `key` associated to the given `value`.
   * @param key - the entry key to add
   * @param value - the entry value to add
   * @example
   * BiMap.of([1, 1], [2, 2]).set(1, 2).toArray()
   * // => [[1, 2]]
   * @note if the key and/or value are already associated, the previous value will be 'replaced'
   */
  set: (key: K, value: V) => BiMap.NonEmpty<K, V>;
  /**
   * Returns the collection with given `entry` added.
   * @param entry - a tuple containing a key and value
   * @example
   * BiMap.of([1, 1], [2, 2]).addEntry([1, 2]).toArray()
   * // => [[1, 2]]
   */
  addEntry: (entry: readonly [K, V]) => BiMap.NonEmpty<K, V>;
  /**
   * Returns the collection with the entries from the given `StreamSource` `entries` added.
   * @param entries - a `StreamSource` containing tuples with a key and value
   * @example
   * BiMap.of([1, 1]).addEntries([[2, 2], [1, 3]]).toArray()
   * // => [[1, 3], [2, 2]]
   */
  addEntries: {
    (entries: StreamSource.NonEmpty<readonly [K, V]>): BiMap.NonEmpty<K, V>;
    (entries: StreamSource<readonly [K, V]>): BiMap<K, V>;
  };
  /**
   * Returns the collection where the entry associated with given `key` is removed if it was part of the collection.
   * @param key - the key of the entry to remove
   * @example
   * const m = BiMap.of([1, 1], [2, 2])
   * m.removeKey(2).toArray()   // => [[1, 1]]
   * m.removeKey(3) === m       // true
   * @note guarantees same object reference if the key is not present
   */
  removeKey<UK = K>(key: RelatedTo<K, UK>): BiMap<K, V>;
  /**
   * Returns a tuple containing the collection of which the entry associated with given `key` is removed, and the value that
   * is associated with that key. If the key is not present, it will return undefined instead.
   * @param key - the key of the entry to remove
   * @example
   * const m = BiMap.of([1, 1], [2, 2])
   * const result = m.removeKeyAndGet(2)
   * if (result !== undefined) console.log([result[0].toString(), result[1]])    // => logs [BiMap(1 <=> 1), 2]
   * console.log(m.removeKeyAndGet(3))                                           // => logs undefined
   */
  removeKeyAndGet<UK = K>(key: RelatedTo<K, UK>): [BiMap<K, V>, V] | undefined;
  /**
   * Returns the collection where the entries associated with each key in given `keys` are removed if they were present.
   * @param keys - a `StreamSource` of keys to remove
   * @example
   * const m = BiMap.of([1, 1], [2, 2])
   * m.removeKeys([1, 3]).toArray()     // => [[2, 2]]
   * m.removeKeys([1, 3, 2]).toArray()  // => []
   * m.removeKeys([3, 4, 5]) === m      // => true
   * @note guarantees same object reference if none of the keys are present
   */
  removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): BiMap<K, V>;
  /**
   * Returns the collection where the entry associated with given `value` is removed if it was part of the collection.
   * @param value - the value of the entry to remove
   * @example
   * const m = BiMap.of([1, 1], [2, 2])
   * m.removeValue(2).toArray()   // => [[1, 1]]
   * m.removeValue(3) === m       // true
   * @note guarantees same object reference if the key is not present
   */
  removeValue<UV = V>(value: RelatedTo<V, UV>): BiMap<K, V>;
  /**
   * Returns a tuple containing the collection of which the entry associated with given `value` is removed, and the key that
   * is associated with that value. If the value is not present, it will return undefined instead.
   * @param value - the value of the entry to remove
   * @example
   * const m = BiMap.of([1, 1], [2, 2])
   * const result = m.removeValueAndGet(2)
   * if (result !== undefined) console.log([result[0].toString(), result[1]])    // => logs [BiMap(1 <=> 1), 2]
   * console.log(m.removeValueAndGet(3))                                           // => logs undefined
   */
  removeValueAndGet<UV = V>(
    value: RelatedTo<V, UV>
  ): [BiMap<K, V>, K] | undefined;
  /**
   * Returns the collection where the entries associated with each value in given `values` are removed if they were present.
   * @param values - a `StreamSource` of values to remove
   * @example
   * const m = BiMap.of([1, 1], [2, 2])
   * m.removeValues([1, 3]).toArray()     // => [[2, 2]]
   * m.removeValues([1, 3, 2]).toArray()  // => []
   * m.removeValues([3, 4, 5]) === m      // => true
   * @note guarantees same object reference if none of the keys are present
   */
  removeValues<UV = V>(value: StreamSource<RelatedTo<V, UV>>): BiMap<K, V>;
  /**
   * Returns the collection where the value associated with given `key` is updated with the given `update` value or update function.
   * @param key - the key of the entry to update
   * @param update - a new value or function taking the current value and returning a new value
   * @example
   * const m = BiMap.of([1, 1], [2, 2])
   * m.updateValueAt(3, 3).toArray()
   * // => [[1, 1], [2, 2]]
   * m.updateValueAt(2, 10).toArray()
   * // => [[1, 1], [2, 10]]
   * m.updateValueAt(1, v => v + 1)
   * // => [[1, 2]]
   */
  updateValueAt<UK = K>(key: RelatedTo<K, UK>, update: Update<V>): BiMap<K, V>;
  /**
   * Returns the collection where the key associated with given `value` is updated with the given `update` value or update function.
   * @param value - the value of the entry to update
   * @param update - a new value or function taking the current key and returning a new key
   * @example
   * const m = BiMap.of([1, 1], [2, 2])
   * m.updateKeyAt(3, 3).toArray()
   * // => [[1, 1], [2, 2]]
   * m.updateKeyAt(2, 10).toArray()
   * // => [[1, 1], [10, 2]]
   * m.updateKeyAt(1, v => v + 1)
   * // => [[2, 1]]
   */
  updateKeyAt<UV = V>(value: RelatedTo<V, UV>, update: Update<K>): BiMap<K, V>;
  /**
   * Returns a `Stream` containing all entries of this collection as tuples of key and value.
   * @example
   * BiMap.of([1, 1], [2, 2]).stream().toArray()  // => [[1, 1], [2, 2]]
   */
  stream(): Stream<readonly [K, V]>;
  /**
   * Returns a `Stream` containing all keys of this collection.
   * @example
   * BiMap.of([[1, 'a'], [2, 'b']]).streamKeys().toArray()   // => [1, 2]
   */
  streamKeys(): Stream<K>;
  /**
   * Returns a `Stream` containing all values of this collection.
   * @example
   * BiMap.of([[1, 'a'], [2, 'b']]).streamValues().toArray()   // => ['a', 'b']
   */
  streamValues(): Stream<V>;
  /**
   * Performs given function `f` for each entry of the collection, using given `state` as initial traversal state.
   * @param f - the function to perform for each entry, receiving:
   * * `entry`: the next tuple of a key and value
   * * `index`: the index of the element
   * * `halt`: a function that, if called, ensures that no new elements are passed
   * @param state - (optional) the traverse state
   * @example
   * BiMap.of([1, 'a'], [2, 'b'], [3, 'c']).forEach((entry, i, halt) => {
   *  console.log([entry[1], entry[0]]);
   *  if (i >= 1) halt();
   * })
   * // => logs ['a', 1]  ['b', 2]
   * @note O(N)
   */
  forEach(
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    state?: TraverseState
  ): void;
  /**
   * Returns a collection containing only those entries that satisfy given `pred` predicate.
   * @param pred - a predicate function receiving:
   * * `entry`: the next entry
   * * `index`: the entry index
   * * `halt`: a function that, when called, ensures no next elements are passed
   * @example
   * BiMap.of([1, 'a'], [2, 'b'], [3, 'c']).filter(entry => entry[0] === 2 || entry[1] === 'c').toArray()
   * // => [[2, 'b'], [3, 'c']]
   */
  filter(
    pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean
  ): BiMap<K, V>;
  /**
   * Returns a builder object containing the entries of this collection.
   * @example
   * const builder: BiMap.Builder<number, string> = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
   */
  toBuilder: () => BiMap.Builder<K, V>;
  /**
   * Returns an array containing all entries in this collection.
   * @example
   * BiMap.of([1, 'a'], [2, 'b']).toArray()   // => [[1, 'a'], [2, 'b']]
   * @note O(log(N))
   * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
   */
  toArray(): (readonly [K, V])[];
  /**
   * Returns a string representation of this collection.
   * @example
   * BiMap.of([1, 'a'], [2, 'b']).toString()   // => BiMap(1 <=> 'a', 2 <=> 'b')
   */
  toString(): string;
  /**
   * Returns a JSON representation of this collection.
   * @example
   * BiMap.of([1, 'a'], [2, 'b']).toJSON()   // => { dataType: 'BiMap', value: [[1, 'a'], [2, 'b']] }
   */
  toJSON(): ToJSON<(readonly [K, V])[], this['context']['typeTag']>;
}

export namespace BiMap {
  /**
   * A non-empty type-invariant immutable bi-directional Map where keys and values have a one-to-one mapping.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface NonEmpty<K, V>
    extends BiMap<K, V>,
      Streamable.NonEmpty<readonly [K, V]> {
    /**
     * Returns false since this collection is known to be non-empty.
     * @example
     * BiMap.of([1, 1], [2, 2]).isEmpty   // => false
     */
    readonly isEmpty: false;
    /**
     * Returns true since this collection is known to be non-empty
     * @example
     * BiMap.of([1, 1], [2, 2]).nonEmpty()   // => true
     */
    nonEmpty(): true;
    /**
     * Returns a self reference since this collection is known to be non-empty.
     * @example
     * const m = BiMap.of([1, 1], [2, 2]);
     * m === m.assumeNonEmpty()  // => true
     */
    assumeNonEmpty(): this;
    /**
     * Returns this collection typed as a 'possibly empty' collection.
     * @example
     * BiMap.of([1, 1], [2, 2]).asNormal();  // type: BiMap<number, number>
     */
    asNormal(): BiMap<K, V>;
    /**
     * Returns the non-empty Map representation of the key to value mapping.
     * @example
     * BiMap.of([1, 10], [2, 20]).keyValueMap.toArray()
     * // => [[1, 10], [2, 20]]
     */
    readonly keyValueMap: RMap.NonEmpty<K, V>;
    /**
     * Returns the non-empty Map representation of the key to value mapping.
     * @example
     * BiMap.of([1, 10], [2, 20]).valueKeyMap.toArray()
     * // => [[10, 1], [20, 2]]
     */
    readonly valueKeyMap: RMap.NonEmpty<V, K>;
    /**
     * Returns the collection with the entries from the given `StreamSource` `entries` added.
     * @param entries - a `StreamSource` containing tuples with a key and value
     * @example
     * BiMap.of([1, 1]).addEntries([[2, 2], [1, 3]]).toArray()
     * // => [[1, 2]]
     */
    addEntries: (
      entries: StreamSource<readonly [K, V]>
    ) => BiMap.NonEmpty<K, V>;
    /**
     * Returns the collection where the value associated with given `key` is updated with the given `update` value or update function.
     * @param key - the key of the entry to update
     * @param update - a new value or function taking the current value and returning a new value
     * @example
     * const m = BiMap.of([1, 1], [2, 2])
     * m.updateValueAt(3, 3).toArray()
     * // => [[1, 1], [2, 2]]
     * m.updateValueAt(2, 10).toArray()
     * // => [[1, 1], [2, 10]]
     * m.updateValueAt(1, v => v + 1)
     * // => [[1, 2]]
     */
    updateValueAt<UK = K>(
      key: RelatedTo<K, UK>,
      update: Update<V>
    ): BiMap.NonEmpty<K, V>;
    /**
     * Returns the collection where the key associated with given `value` is updated with the given `update` value or update function.
     * @param value - the value of the entry to update
     * @param update - a new value or function taking the current key and returning a new key
     * @example
     * const m = BiMap.of([1, 1], [2, 2])
     * m.updateKeyAt(3, 3).toArray()
     * // => [[1, 1], [2, 2]]
     * m.updateKeyAt(2, 10).toArray()
     * // => [[1, 1], [10, 2]]
     * m.updateKeyAt(1, v => v + 1)
     * // => [[2, 1]]
     */
    updateKeyAt<UV = V>(
      value: RelatedTo<V, UV>,
      update: Update<K>
    ): BiMap.NonEmpty<K, V>;
    /**
     * Returns a non-empty `Stream` containing all entries of this collection as tuples of key and value.
     * @example
     * BiMap.of([1, 1], [2, 2]).stream().toArray()  // => [[1, 1], [2, 2]]
     */
    stream(): Stream.NonEmpty<readonly [K, V]>;
    /**
     * Returns a non-empty `Stream` containing all keys of this collection.
     * @example
     * BiMap.of([[1, 'a'], [2, 'b']]).streamKeys().toArray()   // => [1, 2]
     */
    streamKeys(): Stream.NonEmpty<K>;
    /**
     * Returns a non-empty `Stream` containing all values of this collection.
     * @example
     * BiMap.of([[1, 'a'], [2, 'b']]).streamValues().toArray()   // => ['a', 'b']
     */
    streamValues(): Stream.NonEmpty<V>;
    /**
     * Returns a non-empty array containing all entries in this collection.
     * @example
     * BiMap.of([1, 'a'], [2, 'b']).toArray()   // => [[1, 'a'], [2, 'b']]
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
  export interface Context<UK, UV, Tp extends BiMap.Types = BiMap.Types> {
    /**
     * A string tag defining the specific collection type
     * @example
     * BiMap.defaultContext().typeTag   // => 'BiMap'
     */
    readonly typeTag: 'BiMap';
    readonly _types: Tp;
    readonly keyValueContext: RMap.Context<UK>;
    readonly valueKeyContext: RMap.Context<UV>;

    /**
     * Returns the (singleton) empty instance of this type and context with given key and value types.
     * @example
     * BiMap.empty<number, string>()    // => BiMap<number, string>
     * BiMap.empty<string, boolean>()   // => BiMap<string, boolean>
     */
    empty: <K extends UK, V extends UV>() => BiMap<K, V>;
    /**
     * Returns an immutable `BiMap`, containing the given `entries`.
     * @param entries - a non-empty array of key-value entries
     * @example
     * BiMap.of([1, 'a'], [2, 'b'])    // => BiMap.NonEmpty<number, string>
     */
    of: <K extends UK, V extends UV>(
      ...entries: ArrayNonEmpty<readonly [K, V]>
    ) => BiMap.NonEmpty<K, V>;
    /**
     * Returns an immutable BiMap, containing the entries in the given `sources` `StreamSource` instances.
     * @param sources - an array of `StreamSource` instances contaning key-value entries
     * @example
     * BiMap.from([[1, 'a'], [2, 'b']])    // => BiMap.NonEmpty<number, string>
     */
    from: {
      <K extends UK, V extends UV>(
        ...sources: ArrayNonEmpty<StreamSource<readonly [K, V]>>
      ): BiMap.NonEmpty<K, V>;
      <K extends UK, V extends UV>(
        ...sources: ArrayNonEmpty<StreamSource.NonEmpty<readonly [K, V]>>
      ): BiMap<K, V>;
    };
    /**
     * Returns an empty `BiMap` builder instance.
     * @example
     * BiMap.builder<number, string>()    // => BiMap.Builder<number, string>
     */
    builder: <K extends UK, V extends UV>() => BiMap.Builder<K, V>;
  }

  export interface Types extends CustomBase.KeyValue {
    normal: BiMap<this['_K'], this['_V']>;
    nonEmpty: BiMap.NonEmpty<this['_K'], this['_V']>;
    limitKey: true;
    limitValue: true;
  }

  /**
   * A mutable `BiMap` builder used to efficiently create new immutable instances.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V> {
    /**
     * Returns the amount of entries in the builder.
     * @example
     * BiMap.of([[1, 'a'], [2, 'b']]).toBuilder().size
     * // => 2
     */
    readonly size: number;
    /**
     * Returns true if there are no entries in the builder.
     * @example
     * BiMap.of([[1, 'a'], [2, 'b']]).toBuilder().isEmpty
     * // => false
     */
    readonly isEmpty: boolean;
    /**
     * Returns the value associated with the given `key`, or given `otherwise` value if the key is not in the collection.
     * @param key - the key to look for
     * @param otherwise - (default: undefined) an `OptLazy` fallback value if the key is not in the collection
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.getValue(2)          // => 'b'
     * m.getValue(3)          // => undefined
     * m.getValue(2, 'none')  // => 'b'
     * m.getValue(3, 'none')  // => 'none'
     */
    getValue<UK = K>(key: RelatedTo<K, UK>): V | undefined;
    getValue<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
    /**
     * Returns the key associated with the given `value`, or given `otherwise` value if the value is not in the collection.
     * @param value - the value to look for
     * @param otherwise - (default: undefined) an `OptLazy` fallback value if the value is not in the collection
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.getKey('b')          // => 2
     * m.getKey('z')          // => undefined
     * m.getKey('b', 'none')  // => 2
     * m.getKey('z', 'none')  // => 'none'
     */
    getKey<UV = V>(value: RelatedTo<V, UV>): K | undefined;
    getKey<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;
    /**
     * Returns true if the given `key` is present in the builder.
     * @param key - the key to look for
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.hasKey(2)    // => true
     * m.hasKey(3)    // => false
     */
    hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
    /**
     * Returns true if the given `value` is present in the builder.
     * @param value - the value to look for
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.hasValue('a')    // => true
     * m.hasValue('z')    // => false
     */
    hasValue<UV = V>(value: RelatedTo<V, UV>): boolean;
    /**
     * Associates given `key` with given `value` in the builder.
     * @param key - the entry key
     * @param value - the entry value
     * @returns true if the data in the builder has changed
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.set(1, 'a')   // => false
     * m.set(1, 'b')   // => true
     */
    set: (key: K, value: V) => boolean;
    /**
     * Adds the given `entry` to the builder, where the entry key is associated with the entry value.
     * @param entry - the entry to add
     * @returns true if the data in the builder has changed
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.addEntry([1, 'a'])   // => false
     * m.addEntry([1, 'b'])   // => true
     */
    addEntry: (entry: readonly [K, V]) => boolean;
    /**
     * Adds given `entries` to the builder.
     * @param entries - a `StreamSource` containing the entries to add
     * @returns true if the data in the builder has changed
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.addEntries([1, 'a'], [3, 'c']])   // => true
     * m.addEntries([])                    // => false
     */
    addEntries: (entries: StreamSource<readonly [K, V]>) => boolean;
    /**
     * Removes the entries related to given `key` from the builder.
     * @param key - the key to remove
     * @param otherwise - (default: undefined) the value to return if the key is not in the builder
     * @returns the value previously associated with given `key`, or the fallback value otherwise
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.removeKey(2)        // => 'b'
     * m.removeKey(3)        // => undefined
     * m.removeKey(3, 'c')   // => 'c'
     */
    removeKey<UK = K>(key: RelatedTo<K, UK>): V | undefined;
    removeKey<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
    /**
     * Removes the entries related to the given `keys` `StreamSource` from the builder.
     * @param keys - the `StreamSource` containing the keys to remove.
     * @returns true if the data in the builder has changed
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.removeKeys([3, 4, 5])  // => false
     * m.removeKeys([1, 10])    // => true
     */
    removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): boolean;
    /**
     * Removes the entries related to given `value` from the builder.
     * @param value - the value to remove
     * @param otherwise - (default: undefined) the key to return if the value is not in the builder
     * @returns the key previously associated with given `value`, or the fallback value otherwise
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.removeValue('b')        // => 2
     * m.removeValue('c')        // => undefined
     * m.removeValue('c', 0)     // => 0
     */
    removeValue<UV = V>(value: RelatedTo<V, UV>): K | undefined;
    removeValue<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;
    /**
     * Removes the entries related to the given `values` `StreamSource` from the builder.
     * @param values - the `StreamSource` containing the values to remove.
     * @returns true if the data in the builder has changed
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.removeValues(['c', 'd', 'e'])  // => false
     * m.removeValues(['a', 'e'])       // => true
     */
    removeValues<UV = V>(values: StreamSource<RelatedTo<V, UV>>): boolean;
    /**
     * Performs given function `f` for each entry of the builder.
     * @param f - the function to perform for each element, receiving:
     * * `entry`: the next key-value entry
     * * `index`: the index of the element
     * * `halt`: a function that, if called, ensures that no new elements are passed
     * @throws RibuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while
     * looping over it
     * @example
     * BiMap.of([1, 'a'], [2, 'b'], [3, 'c']).toBuilder().forEach((entry, i, halt) => {
     *  console.log([entry[1], entry[0]]);
     *  if (i >= 1) halt();
     * })
     * // => logs ['a', 1]  ['b', 2]
     * @note O(N)
     */
    forEach(
      f: (entry: readonly [K, V], index: number, halt: () => void) => void,
      state?: TraverseState
    ): void;
    /**
     * Returns an immutable collection instance containing the entries in this builder.
     * @example
     * const m = BiMap.of([1, 'a'], [2, 'b']).toBuilder()
     * const m2: BiMap<number, string> = m.build()
     */
    build(): BiMap<K, V>;
  }
}

function createContext<UK, UV>(options?: {
  keyValueContext?: RMap.Context<UK>;
  valueKeyContext?: RMap.Context<UV>;
}): BiMap.Context<UK, UV> {
  return new BiMapContext(
    options?.keyValueContext ?? HashMap.defaultContext(),
    options?.valueKeyContext ?? HashMap.defaultContext()
  );
}

const _defaultContext: BiMap.Context<any, any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new BiMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - (optiona) an object containing the following properties:
   * * keyValueContext - (optional) the map context to use for key value mappings
   * * valueKeyContext - (optional) the map context to use for value key mappings
   */
  createContext,
  /**
   * Returns the default context for BiMaps.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   */
  defaultContext<UK, UV>(): BiMap.Context<UK, UV> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  BiMap.Context<any, any>,
  'keyValueContext' | 'typeTag' | 'valueKeyContext' | '_types'
> &
  typeof _contextHelpers;

export const BiMap: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
