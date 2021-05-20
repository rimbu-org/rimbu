import { Token } from '@rimbu/base';
import {
  ArrayNonEmpty,
  OptLazy,
  OptLazyOr,
  RelatedTo,
  SuperOf,
  TraverseState,
  Update,
} from '@rimbu/common';
import { FastIterable, Stream, Streamable, StreamSource } from '@rimbu/stream';
import { KeyValue, WithKeyValue } from '../custom-base';

export interface VariantMapBase<
  K,
  V,
  Tp extends VariantMapBase.Types = VariantMapBase.Types
> extends FastIterable<readonly [K, V]> {
  /**
   * Returns true if the collection is empty.
   * @example
   * HashMap.empty<number, number>().isEmpty    // => true
   * HashMap.of([1, 1], [2, 2]).isEmpty         // => false
   */
  readonly isEmpty: boolean;
  /**
   * Returns the number of entries
   * @example
   * HashMap.of([1, 1], [2, 2]).size       // => 2
   */
  readonly size: number;
  /**
   * Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection
   * as a .NonEmpty type.
   * @example
   * const m: HashMap<number, number> = HashMap.of([1, 1], [2, 2])
   * m.stream().first(0)     // compiler allows fallback value since the Stream may be empty
   * if (m.nonEmpty()) {
   *   m.stream().first(0)   // compiler error: fallback value not allowed since Stream is not empty
   * }
   */
  nonEmpty(): this is WithKeyValue<Tp, K, V>['nonEmpty'];
  /**
   * Returns the collection as a .NonEmpty type
   * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty
   * @example
   * HashMap.empty<number, number>().assumeNonEmpty()   // => throws
   * const m: HashMap<number, number> = HashMap.of([1, 1], [2, 2])
   * const m2: HashMap.NonEmpty<number, number> = m     // => compiler error
   * const m3: HashMap.NonEmpty<number, number> = m.assumeNonEmpty()
   * @note returns reference to this collection
   */
  assumeNonEmpty(): WithKeyValue<Tp, K, V>['nonEmpty'];
  /**
   * Returns a `Stream` containing all entries of this collection as tuples of key and value.
   * @example
   * HashMap.of([1, 1], [2, 2]).stream().toArray()  // => [[1, 1], [2, 2]]
   */
  stream(): Stream<readonly [K, V]>;
  /**
   * Returns a `Stream` containing all keys of this collection.
   * @example
   * HashMap.of([[1, 'a'], [2, 'b']]).streamKeys().toArray()   // => [1, 2]
   */
  streamKeys(): Stream<K>;
  /**
   * Returns a `Stream` containing all values of this collection.
   * @example
   * HashMap.of([[1, 'a'], [2, 'b']]).streamValues().toArray()   // => ['a', 'b']
   */
  streamValues(): Stream<V>;
  /**
   * Returns the value associated with the given `key`, or given `otherwise` value if the key is not in the collection.
   * @param key - the key to look for
   * @param otherwise - (default: undefined) an `OptLazy` fallback value if the key is not in the collection
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * m.get(2)          // => 'b'
   * m.get(3)          // => undefined
   * m.get(2, 'none')  // => 'b'
   * m.get(3, 'none')  // => 'none'
   */
  get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
  get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
  /**
   * Returns true if the given `key` is present in the collection.
   * @param key - the key to look for
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * m.hasKey(2)    // => true
   * m.hasKey(3)    // => false
   */
  hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
  /**
   * Returns the collection where the entry associated with given `key` is removed if it was part of the collection.
   * @param key - the key of the entry to remove
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * m.removeKey(2).toArray()   // => [[1, 'a']]
   * m.removeKey(3) === m       // true
   * @note guarantees same object reference if the key is not present
   */
  removeKey<UK = K>(key: RelatedTo<K, UK>): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns the collection where the entries associated with each key in given `keys` are removed if they were present.
   * @param keys - a `StreamSource` of keys to remove
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * m.removeKeys([1, 3]).toArray()     // => [[2, 'b']]
   * m.removeKeys([1, 3, 2]).toArray()  // => []
   * m.removeKeys([3, 4, 5]) === m      // => true
   * @note guarantees same object reference if none of the keys are present
   */
  removeKeys<UK = K>(
    keys: StreamSource<RelatedTo<K, UK>>
  ): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns a tuple containing the collection of which the entry associated with given `key` is removed, and the value that
   * is associated with that key. If the key is not present, it will return undefined instead.
   * @param key - the key of the entry to remove
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * const result = m.removeKeyAndGet(2)
   * if (result !== undefined) console.log([result[0].toString(), result[1]])    // => logs [HashMap(1 => 'a'), 'b']
   * console.log(m.removeKeyAndGet(3))                                           // => logs undefined
   */
  removeKeyAndGet<UK = K>(
    key: RelatedTo<K, UK>
  ): [WithKeyValue<Tp, K, V>['normal'], V] | undefined;
  /**
   * Performs given function `f` for each entry of the collection, using given `state` as initial traversal state.
   * @param f - the function to perform for each entry, receiving:
   * * `entry`: the next tuple of a key and value
   * * `index`: the index of the element
   * * `halt`: a function that, if called, ensures that no new elements are passed
   * @param state - (optional) the traverse state
   * @example
   * HashMap.of([1, 'a'], [2, 'b'], [3, 'c']).forEach((entry, i, halt) => {
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
   * Returns a collection with the same keys, but where the given `mapFun` function is applied to each entry value.
   * @param mapFun - a function taking a `value` and a `key`, and returning a new value
   * @example
   * HashMap.of([1, 'a'], [2, 'abc']).mapValues(v => v.length).toArray()
   * // => [[1, 1], [2, 3]]
   */
  mapValues<V2>(
    mapFun: (value: V, key: K) => V2
  ): (Tp & KeyValue<K, V2>)['normal'];
  /**
   * Returns a collection containing only those entries that satisfy given `pred` predicate.
   * @param pred - a predicate function receiving:
   * * `entry`: the next entry
   * * `index`: the entry index
   * * `halt`: a function that, when called, ensures no next elements are passed
   * @example
   * HashMap.of([1, 'a'], [2, 'b'], [3, 'c']).filter(entry => entry[0] === 2 || entry[1] === 'c').toArray()
   * // => [[2, 'b'], [3, 'c']]
   */
  filter(
    pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean
  ): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns an array containing all entries in this collection.
   * @example
   * HashMap.of([1, 'a'], [2, 'b']).toArray()   // => [[1, 'a'], [2, 'b']]
   * @note O(log(N))
   * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
   */
  toArray(): (readonly [K, V])[];
  /**
   * Returns a string representation of this collection.
   * @example
   * HashMap.of([1, 'a'], [2, 'b']).toString()   // => HashMap(1 => 'a', 2 => 'b')
   */
  toString(): string;
}

export namespace VariantMapBase {
  export interface NonEmpty<
    K,
    V,
    Tp extends VariantMapBase.Types = VariantMapBase.Types
  > extends VariantMapBase<K, V, Tp>,
      Streamable.NonEmpty<readonly [K, V]> {
    /**
     * Returns false since this collection is known to be non-empty.
     * @example
     * HashMap.of([1, 1], [2, 2]).isEmpty   // => false
     */
    readonly isEmpty: false;
    /**
     * Returns true since this collection is known to be non-empty
     * @example
     * HashMap.of([1, 1], [2, 2]).nonEmpty()   // => true
     */
    nonEmpty(): true;
    /**
     * Returns a self reference since this collection is known to be non-empty.
     * @example
     * const m = HashMap.of([1, 1], [2, 2]);
     * m === m.assumeNonEmpty()  // => true
     */
    assumeNonEmpty(): this;
    /**
     * Returns this collection typed as a 'possibly empty' collection.
     * @example
     * HashMap.of([1, 1], [2, 2]).asNormal();  // type: HashMap<number, number>
     */
    asNormal(): (Tp & KeyValue<K, V>)['normal'];
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
     * @example
     * HashMap.of([1, 1], [2, 2]).stream().toArray()  // => [[1, 1], [2, 2]]
     */
    stream(): Stream.NonEmpty<readonly [K, V]>;
    /**
     * Returns a non-empty Stream containing all keys of this collection.
     * @example
     * HashMap.of([[1, 'a'], [2, 'b']]).streamKeys().toArray()   // => [1, 2]
     */
    streamKeys(): Stream.NonEmpty<K>;
    /**
     * Returns a non-empty Stream containing all values of this collection.
     * @example
     * HashMap.of([[1, 'a'], [2, 'b']]).streamValues().toArray()   // => ['a', 'b']
     */
    streamValues(): Stream.NonEmpty<V>;
    /**
     * Returns a non-empty collection with the same keys, but where the given `mapFun` function is
     * applied to each entry value.
     * @param mapFun - a function taking a `value` and a `key`, and returning a new value
     * @example
     * HashMap.of([1, 'a'], [2, 'abc']).mapValues(v => v.length).toArray()
     * // => [[1, 1], [2, 3]]
     */
    mapValues<V2>(
      mapFun: (value: V, key: K) => V2
    ): (Tp & KeyValue<K, V2>)['nonEmpty'];
    /**
     * Returns a non-empty array containing all entries in this collection.
     * @example
     * HashMap.of([1, 'a'], [2, 'b']).toArray()   // => [[1, 'a'], [2, 'b']]
     * @note O(log(N))
     * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
     */
    toArray(): ArrayNonEmpty<readonly [K, V]>;
  }

  export interface Types extends KeyValue {
    normal: VariantMapBase<this['_K'], this['_V']>;
    nonEmpty: VariantMapBase.NonEmpty<this['_K'], this['_V']>;
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
   * HashMap.of([1, 'a']).set(2, 'b').toArray()   // => [[1, 'a'], [2, 'b']]
   * HashMap.of([1, 'a']).set(1, 'b').toArray()   // => [[1, 'b']]
   * @note if the key is already associated, the previous value will be 'replaced'
   */
  set: (key: K, value: V) => WithKeyValue<Tp, K, V>['nonEmpty'];
  /**
   * Returns the collection with given `entry` added.
   * @param entry - a tuple containing a key and value
   * @example
   * HashMap.of([1, 'a']).addEntry([2, 'b']).toArray()   // => [[1, 'a'], [2, 'b']]
   * HashMap.of([1, 'a']).addEntry([1, 'b']).toArray()   // => [[1, 'b']]
   */
  addEntry: (entry: readonly [K, V]) => WithKeyValue<Tp, K, V>['nonEmpty'];
  /**
   * Returns the collection with the entries from the given `StreamSource` `entries` added.
   * @param entries - a `StreamSource` containing tuples with a key and value
   * @example
   * HashMap.of([1, 'a']).addEntries([[2, 'b']]).toArray()   // => [[1, 'a'], [2, 'b']]
   */
  addEntries: {
    (entries: StreamSource.NonEmpty<readonly [K, V]>): WithKeyValue<
      Tp,
      K,
      V
    >['nonEmpty'];
    (entries: StreamSource<readonly [K, V]>): WithKeyValue<Tp, K, V>['normal'];
  };
  /**
   * Returns the collection with the given `atKey` key modified according to given `options`.
   * @param atKey - the key at which to modify the collection
   * @param options - an object containing the following information:
   * * ifNew: (optional) if the given `atKey` is not present in the collection, this value or function will be used
   * to generate a new entry. If a function returning the token argument is given, no new entry is created.
   * * ifExists: (optional) if a value is associated with given `atKey`, this function is called with the given value
   * to return a new value. As a second argument, a `remove` token is given. If the function returns this token, the current
   * entry is removed.
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * m.modifyAt(3, { ifNew: 'c' }).toArray()
   * // => [[1, 'a'], [2, 'b'], [3, 'c']]
   * m.modifyAt(3, { ifNew: (none) => 1 < 2 ? none : 'c' }).toArray()
   * // => [[1, 'a'], [2, 'b']]
   * m.modifyAt(2, { ifExists: 'c' }).toArray()
   * // => [[1, 'a'], [2, 'c']]
   * m.modifyAt(2, { ifExists: v => v + 'z' }).toArray()
   * // => [[1, 'a'], [2, 'bz']]
   * m.modifyAt(2, { ifExists: (v, remove) => v.length > 5 ? v : remove }).toArray()
   * // => [[1, 'a']]
   */
  modifyAt: (
    atKey: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentEntry: V, remove: Token) => V | Token;
    }
  ) => WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns the collection where the value associated with given `key` is updated with the given `update` value or update function.
   * @param key - the key of the entry to update
   * @param update - a new value or function taking the current value and returning a new value
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * m.updateAt(3, 'a').toArray()
   * // => [[1, 'a'], [2, 'b']]
   * m.updateAt(2, 'c').toArray()
   * // => [[1, 'a'], [2, 'c']]
   * m.updateAt(2, v => v + 'z')
   * // => [[1, 'a'], [2, 'cz]]
   */
  updateAt<UK = K>(
    key: RelatedTo<K, UK>,
    update: Update<V>
  ): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns a builder object containing the entries of this collection.
   * @example
   * const builder: HashMap.Builder<number, string> = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
   */
  toBuilder: () => WithKeyValue<Tp, K, V>['builder'];
  /**
   * Returns the same Map with an extended value type.
   * @typeparam V2 - a type that extends V that defines the new value type
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * m.extendValues<number | string>
   * // => type: HashMap.NonEmpty<number, number | string>
   * m.extendValues<boolean>
   * // => type: HashMap.NonEmpty<number, never>
   */
  extendValues: <V2>() => WithKeyValue<Tp, K, SuperOf<V2, V>>['normal'];
  /**
   * Returns a Map containing all keys from this map and all the given `sources` key-value stream sources,
   * and as values tuples of all the corresponding values for each key. If a source doesn't have a key,
   * the tuple will be filled with the given `fillValue`.
   * @typeparam O - the type of the fill value
   * @typeparam I - the array of input source value types
   * @param fillValue - the value to use for the result tuple if a source does not have a certain key
   * @param sources - a non-empty set of StreamSouces containing tuples of keys and values
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * const m2 = m.mergeAll('none', [[2, true]], HashMap.of([3, 15]))
   * // type of m2: HashMap<number, [string, boolean | string, number | string]>
   * console.log(m2.toArray())
   * // => [[1, ['a', 'none', 'none']], [2, ['b', true, 'none']], [3, ['none', 'none', 15]]]
   */
  mergeAll: {
    <O, I extends readonly [unknown, ...unknown[]]>(
      fillValue: O,
      ...sources: {
        [KT in keyof I]: StreamSource.NonEmpty<readonly [K, I[KT]]>;
      }
    ): (Tp &
      KeyValue<K, [V | O, ...{ [KT in keyof I]: I[KT] | O }]>)['nonEmpty'];
    <O, I extends readonly [unknown, ...unknown[]]>(
      fillValue: O,
      ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
    ): (Tp & KeyValue<K, [V | O, ...{ [KT in keyof I]: I[KT] | O }]>)['normal'];
  };
  /**
   * Returns a Map containing all keys from this map and all the given `sources` key-value stream sources,
   * and as values the result of applying the given `mergeFun` to the key and all the corresponding values for each key. If a source doesn't have a key,
   * the given tuple will be filled with the given `fillValue`.
   * @typeparam O - the type of the fill value
   * @typeparam I - the array of input source value types
   * @param fillValue - the value to use for the result tuple if a source does not have a certain key
   * @param sources - a non-empty set of StreamSouces containing tuples of keys and values
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * const m2 = m.mergeAllWith(
   *   'q',
   *   (key, v1, v2, v3) => `${key}${v1}${v2}${v3}`,
   *   [[2, 'c']],
   *   HashMap.of([3, 'd'])
   * )
   * // type of m2: HashMap<number, string>
   * console.log(m2.toArray())
   * // => [[1, '1aqq'], [2, '2bcq'], [3, '3qqd']]
   */
  mergeAllWith: {
    <R, O, I extends readonly [unknown, ...unknown[]]>(
      fillValue: O,
      mergeFun: (
        key: K,
        value: V | O,
        ...values: { [KT in keyof I]: I[KT] | O }
      ) => R,
      ...sources: {
        [KT in keyof I]: StreamSource.NonEmpty<readonly [K, I[KT]]>;
      }
    ): (Tp & KeyValue<K, R>)['nonEmpty'];
    <R, O, I extends readonly [unknown, ...unknown[]]>(
      fillValue: O,
      mergeFun: (
        key: K,
        value: V | O,
        ...values: { [KT in keyof I]: I[KT] | O }
      ) => R,
      ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
    ): (Tp & KeyValue<K, R>)['normal'];
  };
  /**
   * Returns a Map containing the common keys from this map and all the given `sources` key-value stream sources,
   * and as values tuples of all the corresponding values for each common key. If a source doesn't have a key,
   * the key will be skipped.
   * @typeparam I - the array of input source value types
   * @param sources - a non-empty set of StreamSouces containing tuples of keys and values
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * const m2 = m.merge([[2, true]], HashMap.of([2, 15]))
   * // type of m2: HashMap<number, [string, boolean, number]>
   * console.log(m2.toArray())
   * // => [[2, ['b', true, 15]]]
   */
  merge: <I extends readonly [unknown, ...unknown[]]>(
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ) => (Tp & KeyValue<K, [V, ...{ [KT in keyof I]: I[KT] }]>)['normal'];
  /**
   * Returns a Map containing the common keys from this map and all the given `sources` key-value stream sources,
   * and as values the result of applying given `mergeFun` to the key and values of all the corresponding values for each common key.
   * If a source doesn't have a key, the key will be skipped.
   * @typeparam I - the array of input source value types
   * @param mergeFun - a function taking the key and values from this map and all sources corresponding to the key, and
   * returning a value for the resulting Map.
   * @param sources - a non-empty set of StreamSouces containing tuples of keys and values
   * @example
   * const m = HashMap.of([1, 'a'], [2, 'b'])
   * const m2 = m.merge(
   *   (key, v1, v2) => `${key}${v1}${v2}`,
   *   [[2, true]],
   *   HashMap.of([2, 15])
   * )
   * // type of m2: HashMap<number, string>
   * console.log(m2.toArray())
   * // => [[2, '2true15']]
   */
  mergeWith: <R, I extends readonly [unknown, ...unknown[]]>(
    mergeFun: (key: K, ...values: [V, ...I]) => R,
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ) => (Tp & KeyValue<K, R>)['normal'];
}

export namespace RMapBase {
  type NonEmptyBase<K, V, Tp extends RMapBase.Types> = VariantMapBase.NonEmpty<
    K,
    V,
    Tp
  > &
    RMapBase<K, V, Tp>;

  export interface NonEmpty<K, V, Tp extends RMapBase.Types = RMapBase.Types>
    extends NonEmptyBase<K, V, Tp>,
      Streamable.NonEmpty<readonly [K, V]> {
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
     * @example
     * HashMap.of([1, 1], [2, 2]).stream().toArray()  // => [[1, 1], [2, 2]]
     */
    stream(): Stream.NonEmpty<readonly [K, V]>;
    /**
     * Returns the collection with the entries from the given `StreamSource` `entries` added.
     * @param entries - a `StreamSource` containing tuples with a key and value
     * @example
     * HashMap.of([1, 'a']).addEntries([[2, 'b']]).toArray()   // => [[1, 'a'], [2, 'b']]
     */
    addEntries: {
      (entries: StreamSource<readonly [K, V]>): WithKeyValue<
        Tp,
        K,
        V
      >['nonEmpty'];
    };
    /**
     * Returns the collection where the value associated with given `key` is updated with the given `update` value or update function.
     * @param key - the key of the entry to update
     * @param update - a new value or function taking the current value and returning a new value
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b'])
     * m.updateAt(3, 'a').toArray()
     * // => [[1, 'a'], [2, 'b']]
     * m.updateAt(2, 'c').toArray()
     * // => [[1, 'a'], [2, 'c']]
     * m.updateAt(2, v => v + 'z')
     * // => [[1, 'a'], [2, 'cz]]
     */
    updateAt<UK = K>(
      key: RelatedTo<K, UK>,
      update: Update<V>
    ): WithKeyValue<Tp, K, V>['nonEmpty'];
    /**
     * Returns the same Map with an extended value type.
     * @typeparam V2 - a type that extends V that defines the new value type
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b'])
     * m.extendValues<number | string>
     * // => type: HashMap.NonEmpty<number, number | string>
     * m.extendValues<boolean>
     * // => type: HashMap.NonEmpty<number, never>
     */
    extendValues: <V2>() => WithKeyValue<Tp, K, SuperOf<V2, V>>['nonEmpty'];
    /**
     * Returns a Map containing all keys from this map and all the given `sources` key-value stream sources,
     * and as values tuples of all the corresponding values for each key. If a source doesn't have a key,
     * the tuple will be filled with the given `fillValue`.
     * @typeparam O - the type of the fill value
     * @typeparam I - the array of input source value types
     * @param fillValue - the value to use for the result tuple if a source does not have a certain key
     * @param sources - a non-empty set of StreamSouces containing tuples of keys and values
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b'])
     * const m2 = m.mergeAll('none', [[2, true]], HashMap.of([3, 15]))
     * // type of m2: HashMap<number, [string, boolean | string, number | string]>
     * console.log(m2.toArray())
     * // => [[1, ['a', 'none', 'none']], [2, ['b', true, 'none']], [3, ['none', 'none', 15]]]
     */
    mergeAll: <O, I extends readonly [unknown, ...unknown[]]>(
      fillValue: O,
      ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
    ) => (Tp &
      KeyValue<K, [V | O, ...{ [KT in keyof I]: I[KT] | O }]>)['nonEmpty'];
    /**
     * Returns a Map containing all keys from this map and all the given `sources` key-value stream sources,
     * and as values the result of applying the given `mergeFun` to the key and all the corresponding values for each key. If a source doesn't have a key,
     * the given tuple will be filled with the given `fillValue`.
     * @typeparam O - the type of the fill value
     * @typeparam I - the array of input source value types
     * @param fillValue - the value to use for the result tuple if a source does not have a certain key
     * @param sources - a non-empty set of StreamSouces containing tuples of keys and values
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b'])
     * const m2 = m.mergeAllWith(
     *   'q',
     *   (key, v1, v2, v3) => `${key}${v1}${v2}${v3}`,
     *   [[2, 'c']],
     *   HashMap.of([3, 'd'])
     * )
     * // type of m2: HashMap<number, string>
     * console.log(m2.toArray())
     * // => [[1, '1aqq'], [2, '2bcq'], [3, '3qqd']]
     */
    mergeAllWith: <R, O, I extends readonly [unknown, ...unknown[]]>(
      fillValue: O,
      mergeFun: (
        key: K,
        value: V | O,
        ...values: { [KT in keyof I]: I[KT] | O }
      ) => R,
      ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
    ) => (Tp & KeyValue<K, R>)['nonEmpty'];
    /**
     * Returns a Map containing the common keys from this map and all the given `sources` key-value stream sources,
     * and as values tuples of all the corresponding values for each common key. If a source doesn't have a key,
     * the key will be skipped.
     * @typeparam I - the array of input source value types
     * @param sources - a non-empty set of StreamSouces containing tuples of keys and values
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b'])
     * const m2 = m.merge([[2, true]], HashMap.of([2, 15]))
     * // type of m2: HashMap<number, [string, boolean, number]>
     * console.log(m2.toArray())
     * // => [[2, ['b', true, 15]]]
     */
    merge: {
      <I extends readonly [unknown, ...unknown[]]>(
        ...sources: {
          [KT in keyof I]: StreamSource.NonEmpty<readonly [K, I[KT]]>;
        }
      ): (Tp & KeyValue<K, [V, ...{ [KT in keyof I]: I[KT] }]>)['nonEmpty'];
      <I extends readonly [unknown, ...unknown[]]>(
        ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
      ): (Tp & KeyValue<K, [V, ...{ [KT in keyof I]: I[KT] }]>)['normal'];
    };
    /**
     * Returns a Map containing the common keys from this map and all the given `sources` key-value stream sources,
     * and as values the result of applying given `mergeFun` to the key and values of all the corresponding values for each common key.
     * If a source doesn't have a key, the key will be skipped.
     * @typeparam I - the array of input source value types
     * @param mergeFun - a function taking the key and values from this map and all sources corresponding to the key, and
     * returning a value for the resulting Map.
     * @param sources - a non-empty set of StreamSouces containing tuples of keys and values
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b'])
     * const m2 = m.merge(
     *   (key, v1, v2) => `${key}${v1}${v2}`,
     *   [[2, true]],
     *   HashMap.of([2, 15])
     * )
     * // type of m2: HashMap<number, string>
     * console.log(m2.toArray())
     * // => [[2, '2true15']]
     */
    mergeWith: {
      <R, I extends readonly [unknown, ...unknown[]]>(
        mergeFun: (key: K, ...values: [V, ...I]) => R,
        ...sources: {
          [KT in keyof I]: StreamSource.NonEmpty<readonly [K, I[KT]]>;
        }
      ): (Tp & KeyValue<K, R>)['nonEmpty'];
      <R, I extends readonly [unknown, ...unknown[]]>(
        mergeFun: (key: K, ...values: [V, ...I]) => R,
        ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
      ): (Tp & KeyValue<K, R>)['normal'];
    };
  }

  /**
   * The map's Context instance that serves as a factory for all related immutable instances and builders.
   */
  export interface Context<UK, Tp extends RMapBase.Types = RMapBase.Types> {
    /**
     * A string tag defining the specific collection type
     * @example
     * HashMap.defaultContext().typeTag   // => 'HashMap'
     */
    readonly typeTag: string;

    readonly _types: Tp;

    /**
     * Returns true if given `obj` could be a valid key in this Context.
     * @param obj - the object to check
     * @example
     * HashMap.defaultContext().isValidKey(1)   // => true
     */
    isValidKey: (obj: any) => obj is UK;
    /**
     * Returns the (singleton) empty instance of this type and context with given key and value types.
     * @example
     * HashMap.empty<number, string>()    // => HashMap<number, string>
     * HashMap.empty<string, boolean>()   // => HashMap<string, boolean>
     */
    empty: <K extends UK, V>() => WithKeyValue<Tp, K, V>['normal'];
    /**
     * Returns an immutable map of this collection type and context, containing the given `entries`.
     * @param entries - a non-empty array of key-value entries
     * @example
     * HashMap.of([1, 'a'], [2, 'b'])    // => HashMap.NonEmpty<number, string>
     */
    of: <K extends UK, V>(
      ...entries: ArrayNonEmpty<readonly [K, V]>
    ) => WithKeyValue<Tp, K, V>['nonEmpty'];
    /**
     * Returns an immutable map of this type and context, containing the entries in the given `sources` `StreamSource` instances.
     * @param sources - an array of `StreamSource` instances containing key-value entries
     * @example
     * HashMap.from([[1, 'a'], [2, 'b']])    // => HashMap.NonEmpty<number, string>
     */
    from: {
      <K extends UK, V>(
        ...sources: ArrayNonEmpty<StreamSource.NonEmpty<readonly [K, V]>>
      ): WithKeyValue<Tp, K, V>['nonEmpty'];
      <K, V>(
        ...sources: ArrayNonEmpty<StreamSource<readonly [K, V]>>
      ): WithKeyValue<Tp, K, V>['normal'];
    };
    /**
     * Returns an empty builder instance for this type of collection and context.
     * @example
     * HashMap.builder<number, string>()    // => HashMap.Builder<number, string>
     */
    builder: <K extends UK, V>() => WithKeyValue<Tp, K, V>['builder'];
  }

  export interface Builder<K, V, Tp extends RMapBase.Types = RMapBase.Types> {
    /**
     * Returns the `context` associated to this collection instance.
     */
    readonly context: WithKeyValue<Tp, K, V>['context'];
    /**
     * Returns the amount of entries in the builder.
     * @example
     * HashMap.of([[1, 'a'], [2, 'b']]).toBuilder().size
     * // => 2
     */
    readonly size: number;
    /**
     * Returns true if there are no entries in the builder.
     * @example
     * HashMap.of([[1, 'a'], [2, 'b']]).toBuilder().isEmpty
     * // => false
     */
    readonly isEmpty: boolean;
    /**
     * Returns the value associated with the given `key`, or given `otherwise` value if the key is not in the collection.
     * @param key - the key to look for
     * @param otherwise - (default: undefined) an `OptLazy` fallback value if the key is not in the collection
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.get(2)          // => 'b'
     * m.get(3)          // => undefined
     * m.get(2, 'none')  // => 'b'
     * m.get(3, 'none')  // => 'none'
     */
    get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
    get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
    /**
     * Returns true if the given `key` is present in the builder.
     * @param key - the key to look for
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.hasKey(2)    // => true
     * m.hasKey(3)    // => false
     */
    hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
    /**
     * Performs given function `f` for each entry of the builder.
     * @param f - the function to perform for each element, receiving:
     * * `entry`: the next key-value entry
     * * `index`: the index of the element
     * * `halt`: a function that, if called, ensures that no new elements are passed
     * @throws RibuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while
     * looping over it
     * @example
     * HashMap.of([1, 'a'], [2, 'b'], [3, 'c']).toBuilder().forEach((entry, i, halt) => {
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
     * Adds given `entry` to the builder.
     * @param entry - the entry to add
     * @returns true if the data in the builder has changed
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.addEntry([3, 'c'])   // => true
     * m.addEntry([1, 'a'])   // => false
     */
    addEntry: (entry: readonly [K, V]) => boolean;
    /**
     * Adds given `entries` to the builder.
     * @param entries - a `StreamSource` containing the entries to add
     * @returns true if the data in the builder has changed
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.addEntries([1, 'a'], [3, 'c']])   // => true
     * m.addEntries([])                    // => false
     */
    addEntries: (entries: StreamSource<readonly [K, V]>) => boolean;
    /**
     * Associates given `key` with given `value` in the builder.
     * @param key - the entry key
     * @param value - the entry value
     * @returns true if the data in the builder has changed
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.set(3, 'c')   // => true
     * m.set(1, 'a')   // => false
     */
    set: (key: K, value: V) => boolean;
    /**
     * Removes the entry with given `key` from the builder.
     * @param key - the key of the entry to remove
     * @param otherwise - (default: undefined) the value to return if the key is not in the builder
     * @returns the value previously associated with given `key`, or the fallback value otherwise
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.removeKey(2)        // => 'b'
     * m.removeKey(3)        // => undefined
     * m.removeKey(3, 'c')   // => 'c'
     */
    removeKey<UK = K>(key: RelatedTo<K, UK>): V | undefined;
    removeKey<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
    /**
     * Removes the entries in the given `keys` `StreamSource` from the builder.
     * @param source - the `StreamSource` containing the keys to remove.
     * @returns true if the data in the builder has changed
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.removeKeys([3, 4, 5])  // => false
     * m.removeKeys([1, 10])    // => true
     */
    removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): boolean;
    /**
     * Modifies or creates the builder entry with given `atKey` as its key according to given `options`.
     * @param atKey - the key at which to modify the collection
     * @param options - an object containing the following information:
     * * ifNew: (optional) if the given `atKey` is not present in the collection, this value or function will be used
     * to generate a new entry. If a function returning the token argument if given, no new entry is created.
     * * ifExists: (optional) if a value is associated with given `atKey`, this function is called with the given value.
     * As a second argument, a `remove` token is given. If the function returns this token, the current entry is removed.
     * @returns true if the data in the builder has changed
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.modifyAt(1, { ifNew: 'd' })
     * // => false
     * m.modifyAt(3, { ifNew: 'c' })
     * // => true
     * m.modifyAt(3, { ifNew: (none) => 1 < 2 ? none : 'c' })
     * // => false
     * m.modifyAt(2, { ifExists: 'c' })
     * // => true
     * m.modifyAt(1, { ifExists: v => v + 'z' })
     * // => true
     * m.modifyAt(2, { ifExists: (v, remove) => v.length > 5 ? v : remove })
     * // => true
     */
    modifyAt: (
      key: K,
      options: {
        ifNew?: OptLazyOr<V, Token>;
        ifExists?: (currentValue: V, remove: Token) => V | Token;
      }
    ) => boolean;
    /**
     * Updates the value in the builder associated with given `key` according to given `update` value or function.
     * @param key - the key of the entry to update
     * @param update - a new value or function taking the previous value and returning a new value
     * @param otherwise - (default: undefined) a fallback value to return if the key is not in the builder
     * @returns the previous value associated with given key, of the fallback value otherwise.
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
     * m.updateAt(1, 'a')           // => 'a'
     * m.updateAt(1, 'b')           // => 'b'
     * m.updateAt(2, v => v + 'z')  // => 'b'
     */
    updateAt(key: K, update: Update<V>): V | undefined;
    updateAt<O>(key: K, update: Update<V>, otherwise: OptLazy<O>): V | O;
    /**
     * Returns an immutable collection instance containing the entries in this builder.
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
     * const m2: HashMap<number, string> = m.build()
     */
    build: () => WithKeyValue<Tp, K, V>['normal'];
    /**
     * Returns an immutable instance of the entries in this builder, with given `mapValues` function applied
     * to all the values in the entries.
     * @param mapFun - a function that takes an entry value and its key, and returns a new value
     * @example
     * const m = HashMap.of([1, 'a'], [2, 'b']).toBuilder()
     * const m2: HashMap<number, number> = m.buildMapValues(value => value.length)
     */
    buildMapValues: <V2>(
      mapFun: (value: V, key: K) => V2
    ) => (Tp & KeyValue<K, V2>)['normal'];
  }

  export interface Types extends VariantMapBase.Types {
    normal: RMapBase<this['_K'], this['_V']>;
    nonEmpty: RMapBase.NonEmpty<this['_K'], this['_V']>;
    context: RMapBase.Context<this['_K']>;
    builder: RMapBase.Builder<this['_K'], this['_V']>;
    limitKey: boolean;
    limitValue: false;
  }

  export abstract class ContextBase<
    UK,
    Tp extends RMapBase.Types = RMapBase.Types
  > implements RMapBase.Context<UK, Tp> {
    abstract readonly typeTag: string;
    abstract readonly _empty: (Tp & KeyValue<any, any>)['normal'];

    abstract isValidKey(key: any): key is UK;
    abstract isNonEmptyInstance<K, V>(
      source: any
    ): source is WithKeyValue<Tp, K, V>['nonEmpty'];
    abstract builder: <K extends UK, V>() => WithKeyValue<Tp, K, V>['builder'];

    readonly _types!: Tp;

    empty = <K extends UK, V>(): WithKeyValue<Tp, K, V>['normal'] => {
      return this._empty;
    };

    from: any = <K extends UK, V>(
      ...sources: ArrayNonEmpty<StreamSource<readonly [K, V]>>
    ): WithKeyValue<Tp, K, V>['normal'] => {
      let builder = this.builder<K, V>();

      let i = -1;
      const length = sources.length;

      while (++i < length) {
        const source = sources[i];

        if (StreamSource.isEmptyInstance(source)) continue;

        if (
          builder.isEmpty &&
          this.isNonEmptyInstance<K, V>(source) &&
          source.context === this
        ) {
          if (i === length - 1) return source;
          builder = source.toBuilder();
          continue;
        }

        builder.addEntries(source);
      }

      return builder.build();
    };

    of = <K, V>(
      ...values: ArrayNonEmpty<readonly [K, V]>
    ): K extends UK ? WithKeyValue<Tp, K, V>['nonEmpty'] : never => {
      return this.from(values);
    };

    mergeAllWith<R, K, O, I extends readonly [unknown, unknown, ...unknown[]]>(
      fillValue: O,
      mergeFun: (key: K, ...values: { [KT in keyof I]: I[KT] | O }) => R,
      ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
    ): any {
      const builder = (this.builder() as unknown) as RMapBase.Builder<
        K,
        unknown[]
      >;

      let i = -1;
      const length = sources.length;

      while (++i < sources.length) {
        let entry: readonly [K, unknown] | undefined;
        const iter = Stream.from(sources[i])[Symbol.iterator]();

        while (undefined !== (entry = iter.fastNext())) {
          const key = entry[0];
          const value = entry[1];

          const index = i;

          builder.modifyAt(key, {
            ifNew(): unknown[] {
              const row = Array(length).fill(fillValue);
              row[index] = value;
              return row;
            },
            ifExists(row): unknown[] {
              row[index] = value;
              return row;
            },
          });
        }
      }

      return builder.buildMapValues((row, key) =>
        mergeFun(key, ...(row as any))
      );
    }

    mergeAll<O, K, I extends readonly [unknown, unknown, ...unknown[]]>(
      fillValue: O,
      ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
    ): any {
      return this.mergeAllWith(
        fillValue,
        (key: any, ...values: unknown[]): I => (values as any) as I,
        ...((sources as any) as [any, any, ...any[]])
      );
    }

    mergeWith<R, K, I extends readonly [unknown, ...unknown[]]>(
      mergeFun: (key: K, ...values: I) => R,
      ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
    ): any {
      if (Stream.from(sources).some(StreamSource.isEmptyInstance)) {
        return this.empty();
      }

      const builder = (this.builder() as unknown) as RMapBase.Builder<
        K,
        unknown[]
      >;

      let i = -1;
      const length = sources.length;

      while (++i < sources.length) {
        let entry: readonly [K, unknown] | undefined;
        const iter = Stream.from(sources[i])[Symbol.iterator]();

        while (undefined !== (entry = iter.fastNext())) {
          const key = entry[0];
          const value = entry[1];

          const index = i;

          builder.modifyAt(key, {
            ifNew(nothing): unknown[] | typeof nothing {
              if (index > 0) return nothing;

              const row = [value];
              return row;
            },
            ifExists(row, remove): unknown[] | typeof remove {
              if (row.length !== index) return remove;
              row.push(value);
              return row;
            },
          });
        }
      }

      // remove all rows that are not full
      const firstSource = sources[0];

      let entry: readonly [K, unknown] | undefined;
      const iter = Stream.from(firstSource)[Symbol.iterator]();

      while (undefined !== (entry = iter.fastNext())) {
        const key = entry[0];

        builder.modifyAt(key, {
          ifExists(row, remove): unknown[] | typeof remove {
            if (row.length !== length) return remove;
            return row;
          },
        });
      }

      return builder.buildMapValues((row, key) =>
        mergeFun(key, ...(row as any))
      );
    }

    merge<K, I extends readonly [unknown, ...unknown[]]>(
      ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
    ): any {
      return this.mergeWith(
        (key: any, ...values: unknown[]): I => (values as any) as I,
        ...((sources as any) as [any, any, ...any[]])
      );
    }
  }
}
