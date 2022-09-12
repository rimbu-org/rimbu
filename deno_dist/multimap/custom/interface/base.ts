import type {
  RMap,
  RSet,
  VariantMap,
  VariantSet,
} from '../../../collection-types/mod.ts';
import type {
  KeyValue,
  WithKeyValue,
} from '../../../collection-types/map-custom/index.ts';
import type {
  ArrayNonEmpty,
  OptLazy,
  Reducer,
  RelatedTo,
  ToJSON,
  TraverseState,
} from '../../../common/mod.ts';
import type {
  FastIterable,
  Stream,
  Streamable,
  StreamSource,
} from '../../../stream/mod.ts';

export interface VariantMultiMapBase<
  K,
  V,
  Tp extends VariantMultiMapBase.Types = VariantMultiMapBase.Types
> extends FastIterable<[K, V]> {
  /**
   * Returns true if the collection is empty.
   * @example
   * ```ts
   * HashMultiMapHashValue.empty<number>().isEmpty      // => true
   * HashMultiMapHashValue.of([1, 1], [2, 2]).isEmpty   // => false
   * ```
   */
  readonly isEmpty: boolean;
  /**
   * Returns the number of keys in the collection.
   * @example
   * ```ts
   * HashMultiMapHashValue.of([1, 1], [2, 2]).keySize      // => 2
   * HashMultiMapHashValue.of([1, 1], [1, 2]).keySize      // => 1
   * ```
   */
  readonly keySize: number;
  /**
   * Returns the number of unique key-value combinations in this collection.
   * @example
   * ```ts
   * HashMultiMapHashValue.of([1, 1], [2, 2]).size       // => 2
   * HashMultiMapHashValue.of([1, 1], [1, 2]).size       // => 2
   * ```
   */
  readonly size: number;
  /**
   * Returns the Map representation of this collection.
   * @example
   * ```ts
   * const m = HashMultiMapHashValue.of([1, 1], [2, 2])
   * const map: HashMap<number, HashSet.NonEmpty<number>> = m.keyMap
   * ```
   */
  readonly keyMap: WithKeyValue<Tp, K, V>['keyMap'];
  /**
   * Returns the collection as a .NonEmpty type
   * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty
   * @example
   * ```ts
   * HashMultiMapHashValue.empty<number, number>().assumeNonEmpty()   // => throws
   * const m: HashMultiMapHashValue<number, number> = HashMultiMapHashValue.of([1, 1], [2, 2])
   * const m2: HashMultiMapHashValue.NonEmpty<number, number> = m     // => compiler error
   * const m3: HashMultiMapHashValue.NonEmpty<number, number> = m.assumeNonEmpty()
   * ```
   * @note returns reference to this collection
   */
  assumeNonEmpty(): WithKeyValue<Tp, K, V>['nonEmpty'];
  /**
   * Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection
   * as a .NonEmpty type.
   * @example
   * ```ts
   * const m: HashMultiMapHashValue<number, number> = HashMap.of([1, 1], [2, 2])
   * m.stream().first(0)     // compiler allows fallback value since the Stream may be empty
   * if (m.nonEmpty()) {
   *   m.stream().first(0)   // compiler error: fallback value not allowed since Stream is not empty
   * }
   * ```
   */
  nonEmpty(): this is WithKeyValue<Tp, K, V>['nonEmpty'];
  /**
   * Returns a Stream containing all entries of this collection as tuples of key and value.
   * @example
   * ```ts
   * HashMultiMapHashValue.of([1, 1], [2, 2]).stream().toArray()  // => [[1, 1], [2, 2]]
   * ```
   */
  stream(): Stream<[K, V]>;
  /**
   * Returns a Stream containing all keys of this collection.
   * @example
   * ```ts
   * HashMultiMapHashValue.of([[1, 'a'], [2, 'b']]).streamKeys().toArray()   // => [1, 2]
   * ```
   */
  streamKeys(): Stream<K>;
  /**
   * Returns a Stream containing all values of this collection.
   * @example
   * ```ts
   * HashMultiMapHashValue.of([[1, 'a'], [2, 'b']]).streamValues().toArray()   // => ['a', 'b']
   * ```
   */
  streamValues(): Stream<V>;
  /**
   * Returns true if the given `key` is present in the collection.
   * @param key - the key to look for
   * @example
   * ```ts
   * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'])
   * m.hasKey(2)    // => true
   * m.hasKey(3)    // => false
   * ```
   */
  hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
  /**
   * Returns true if the given `key` has the given `value` as one of its values in the collection.
   * @param key - the key to look for
   * @param value - the value to look for
   * @example
   * ```ts
   * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'])
   * m.hasEntry(1, 'a')    // => true
   * m.hasEntry(1, 'b')    // => false
   * ```
   */
  hasEntry<UK = K>(key: RelatedTo<K, UK>, value: V): boolean;
  /**
   * Returns the value collection associated to the given `key`.
   * @param key - the key to look for
   * @example
   * ```ts
   * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'])
   * m.getValues(1).toArray()    // => ['a']
   * m.getValues(10).toArray()   // => []
   * ```
   */
  getValues<UK = K>(
    key: RelatedTo<K, UK>
  ): WithKeyValue<Tp, K, V>['keyMapValues'];
  /**
   * Returns the collection where the values associated with given `key` are removed.
   * @param key - the key of the entries to remove
   * @example
   * ```ts
   * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])
   * m.removeKey(2).toArray()   // => [[1, 'a'], [1, 'c']]
   * m.removeKey(3) === m       // true
   * ```
   * @note guarantees same object reference if the key is not present
   */
  removeKey<UK = K>(key: RelatedTo<K, UK>): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns the collection where the values associated with given `keys` are removed.
   * @param keys - a `StreamSource` of keys to remove
   * @example
   * ```ts
   * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])
   * m.removeKeys([2, 10]).toArray()   // => [[1, 'a'], [1, 'c']]
   * m.removeKeys([10, 11]) === m      // true
   * ```
   * @note guarantees same object reference if the key is not present
   */
  removeKeys<UK = K>(
    keys: StreamSource<RelatedTo<K, UK>>
  ): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns the collection where given `value` if removed from the values associated with given `key`.
   * @param key - the key of the entry to remove
   * @param value - the value of the entry to remove
   * @example
   * ```ts
   * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])
   * m.removeEntry(2, 'b').toArray()   // => [[1, 'a'], [1, 'c']]
   * m.removeEntry(2, 'q').toArray()   // => [[1, 'a'], [2, 'b'], [1, 'c']]
   * m.removeEntry(3, 'a') === m       // true
   * ```
   * @note guarantees same object reference if the key is not present
   */
  removeEntry<UK = K, UV = V>(
    key: RelatedTo<K, UK>,
    value: RelatedTo<V, UV>
  ): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns the collection where given `entries` are removed.
   * @param entries - a `StreamSource` containing key-value entries to remove
   * @example
   * ```ts
   * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])
   * m.removeEntries([[2, 'b'], [1, 'd']]).toArray()   // => [[1, 'a'], [1, 'c']]
   * m.removeEntries([2, 'q']).toArray()               // => [[1, 'a'], [2, 'b'], [1, 'c']]
   * m.removeEntries(3) === m              // true
   * ```
   * @note guarantees same object reference if the key is not present
   */
  removeEntries<UK = K, UV = V>(
    entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>
  ): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns a tuple containing the collection of which the given `key` is removed, and the values that
   * are associated with that key. If the key is not present, it will return undefined instead.
   * @param key - the key of the entry to remove
   * @example
   * ```ts
   * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'])
   * const result = m.removeKeyAndGet(2)
   * if (result !== undefined) console.log([result[0].toString(), result[1]])    // => logs [HashMultiMapHashValue(1 => 'a'), HashSet('b')]
   * console.log(m.removeKeyAndGet(3))                                           // => logs undefined
   * ```
   */
  removeKeyAndGet<UK = K>(
    key: RelatedTo<K, UK>
  ):
    | [
        WithKeyValue<Tp, K, V>['normal'],
        WithKeyValue<Tp, K, V>['keyMapValuesNonEmpty']
      ]
    | undefined;
  /**
   * Performs given function `f` for each entry of the collection, using given `state` as initial traversal state.
   * @param f - the function to perform for each element, receiving:<br/>
   * - `entry`: the next tuple of a key and value<br/>
   * - `index`: the index of the element<br/>
   * - `halt`: a function that, if called, ensures that no new elements are passed
   * @param state - (optional) the traverse state
   * @example
   * ```ts
   * HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).forEach((entry, i, halt) => {
   *  console.log([entry[1], entry[0]]);
   *  if (i >= 1) halt();
   * })
   * // => logs ['a', 1]  ['c', 1]  (or other order)
   * ```
   * @note O(N)
   */
  forEach(
    f: (entry: [K, V], index: number, halt: () => void) => void,
    state?: TraverseState
  ): void;
  /**
   * Returns a collection containing only those entries that satisfy given `pred` predicate.
   * @param pred - a predicate function receiving:<br/>
   * - `entry`: the next entry<br/>
   * - `index`: the entry index<br/>
   * - `halt`: a function that, when called, ensures no next entries are passed
   * @example
   * ```ts
   * HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])
   *   .filter(entry => entry[0] === 2 || entry[1] === 'c')
   *   .toArray()
   * // => [[2, 'b'], [1, 'c']]
   * ```
   */
  filter(
    pred: (entry: [K, V], index: number, halt: () => void) => boolean
  ): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns an array containing all entries in this collection.
   * @example
   * ```ts
   * HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toArray()   // => [[1, 'a'], [1, 'c'], [2, 'b']]
   * ```
   * @note O(log(N))
   * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
   */
  toArray(): [K, V][];
  /**
   * Returns a string representation of this collection.
   * @example
   * ```ts
   * HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toString()
   * // => HashMultiMapHashValue(1 => ['a', 'c'], 2 => ['b'])
   * ```
   */
  toString(): string;
  /**
   * Returns a JSON representation of this collection.
   * @example
   * ```ts
   * HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toJSON()
   * // => { dataType: 'HashMultiMapHashValue', value: [[1, ['a', 'c']], [2, ['b']]] }
   * ```
   */
  toJSON(): ToJSON<[K, V[]][]>;
}

export namespace VariantMultiMapBase {
  export interface NonEmpty<
    K,
    V,
    Tp extends VariantMultiMapBase.Types = VariantMultiMapBase.Types
  > extends VariantMultiMapBase<K, V, Tp>,
      Streamable.NonEmpty<[K, V]> {
    /**
     * Returns false since this collection is known to be non-empty
     * @example
     * ```ts
     * HashMultiMapHashValue.of([1, 1], [2, 2]).isEmpty   // => false
     * ```
     */
    readonly isEmpty: false;
    /**
     * Returns the non-empty Map representation of this collection.
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 1], [2, 2])
     * const map: HashMap.NonEmpty<number, HashSet.NonEmpty<number>> = m.keyMap
     * ```
     */
    readonly keyMap: WithKeyValue<Tp, K, V>['keyMapNonEmpty'];
    /**
     * Returns a self reference since this collection is known to be non-empty.
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 1], [2, 2]);
     * m === m.assumeNonEmpty()  // => true
     * ```
     */
    assumeNonEmpty(): this;
    /**
     * Returns this collection typed as a 'possibly empty' collection.
     * @example
     * ```ts
     * HashMultiMapHashValue.of([1, 1], [2, 2]).asNormal();  // type: HashMultiMapHashValue<number, number>
     * ```
     */
    asNormal(): WithKeyValue<Tp, K, V>['normal'];
    /**
     * Returns true since this collection is known to be non-empty
     * @example
     * ```ts
     * HashMultiMapHashValue.of([1, 1], [2, 2]).nonEmpty()   // => true
     * ```
     */
    nonEmpty(): true;
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of key and value.
     * @example
     * ```ts
     * HashMultiMapHashValue.of([1, 1], [2, 2]).stream().toArray()  // => [[1, 1], [2, 2]]
     * ```
     */
    stream(): Stream.NonEmpty<[K, V]>;
    /**
     * Returns a non-empty Stream containing all keys of this collection.
     * @example
     * ```ts
     * HashMultiMapHashValue.of([[1, 'a'], [2, 'b']]).streamKeys().toArray()   // => [1, 2]
     * ```
     */
    streamKeys(): Stream.NonEmpty<K>;
    /**
     * Returns a non-empty Stream containing all values of this collection.
     * @example
     * ```ts
     * HashMultiMapHashValue.of([[1, 'a'], [2, 'b']]).streamValues().toArray()   // => ['a', 'b']
     * ```
     */
    streamValues(): Stream.NonEmpty<V>;
    /**
     * Returns a non-empty array containing all entries in this collection.
     * @example
     * ```ts
     * HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toArray()   // => [[1, 'a'], [1, 'c'], [2, 'b']]
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
  Tp extends MultiMapBase.Types = MultiMapBase.Types
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
   * HashMultiMapHashValue.of([1, 'a']).add(2, 'b').toArray()   // => [[1, 'a'], [2, 'b']]
   * HashMultiMapHashValue.of([1, 'a']).add(1, 'b').toArray()   // => [[1, 'a'], [1, 'b']]
   * ```
   */
  add(key: K, value: V): WithKeyValue<Tp, K, V>['nonEmpty'];
  /**
   * Returns the collection with the given `entries` added.
   * @param entries - a `StreamSource` containing entries to add
   * @example
   * ```ts
   * HashMultiMapHashValue.of([1, 'a']).addEntries([[2, 'b'], [1, 'c']).toArray()
   * // => [[1, 'a'], [1, 'c'], [2, 'b']]
   * ```
   */
  addEntries(
    entries: StreamSource.NonEmpty<readonly [K, V]>
  ): WithKeyValue<Tp, K, V>['nonEmpty'];
  addEntries(
    entries: StreamSource<readonly [K, V]>
  ): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns the collection where given `key` has the given `values` associated with it.
   * @param key - the key for which to set the values
   * @param values - the values to set for the key
   * @example
   * ```ts
   * HashMultiMapHashValue.of([1, 'a'], [2, 'b']).setValues(1, ['d', 'e']).toArray()
   * // => [[1, 'd'], [1, 'e'], [2, 'b']]
   * ```
   */
  setValues(
    key: K,
    values: StreamSource.NonEmpty<V>
  ): WithKeyValue<Tp, K, V>['nonEmpty'];
  setValues(key: K, values: StreamSource<V>): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns the collection with the given `atKey` key modified according to given `options`.
   * @param atKey - the key at which to modify the collection
   * @param options - an object containing the following information:<br/>
   * - ifNew: (optional) if the given `atKey` is not present in the collection, this value or function will be used
   * to generate new values. If a function returning the token argument is given, no new entry is created.<br/>
   * - ifExists: (optional) if given `atKey` exists in the collection, this function is called with the current values to
   * return new values. As a second argument, a `remove` token is given. If the function returns this token, the current
   * entry is removed.
   * @example
   * ```ts
   * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'])
   * m.modifyAt(3, { ifNew: ['c', 'd'] }).toArray()
   * // => [[1, 'a'], [2, 'b'], [3, 'c'], [3, 'd']]
   * m.modifyAt(3, { ifNew: () => 1 < 2 ? [] : ['c'] }).toArray()
   * // => [[1, 'a'], [2, 'b']]
   * m.modifyAt(2, { ifExists: () => ['c'] }).toArray()
   * // => [[1, 'a'], [2, 'c']]
   * m.modifyAt(2, { ifExists: (v) => v.add('d') }).toArray()
   * // => [[1, 'a'], [2, 'c'], [2, 'd']]
   * m.modifyAt(2, { ifExists: (v) => v.has('a') ? v : [] }).toArray()
   * // => [[1, 'a']]
   * ```
   */
  modifyAt(
    atKey: K,
    options: {
      ifNew?: OptLazy<StreamSource<V>>;
      ifExists?: (
        currentValues: WithKeyValue<Tp, K, V>['keyMapValuesNonEmpty']
      ) => StreamSource<V>;
    }
  ): WithKeyValue<Tp, K, V>['normal'];
  /**
   * Returns a builder object containing the entries of this collection.
   * @example
   * ```ts
   * const builder: HashMultiMapHashValue.Builder<number, string>
   *   = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [2, 'c']).toBuilder()
   * ```
   */
  toBuilder(): WithKeyValue<Tp, K, V>['builder'];
}

export namespace MultiMapBase {
  export interface NonEmpty<
    K,
    V,
    Tp extends MultiMapBase.Types = MultiMapBase.Types
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
     * HashMultiMapHashValue.of([1, 1], [2, 2]).stream().toArray()  // => [[1, 1], [2, 2]]
     * ```
     */
    stream(): Stream.NonEmpty<[K, V]>;
    /**
     * Returns the collection with the given `entries` added.
     * @param entries - a `StreamSource` containing entries to add
     * @example
     * ```ts
     * HashMultiMapHashValue.of([1, 'a']).addEntries([[2, 'b'], [1, 'c']).toArray()
     * // => [[1, 'a'], [1, 'c'], [2, 'b']]
     * ```
     */
    addEntries(
      entries: StreamSource<readonly [K, V]>
    ): WithKeyValue<Tp, K, V>['nonEmpty'];
  }

  export interface Factory<
    Tp extends MultiMapBase.Types,
    UK = unknown,
    UV = unknown
  > {
    /**
     * Returns the (singleton) empty instance of this type and context with given key and value types.
     * @example
     * ```ts
     * HashMultiMapHashValue.empty<number, string>()    // => HashMultiMapHashValue<number, string>
     * HashMultiMapHashValue.empty<string, boolean>()   // => HashMultiMapHashValue<string, boolean>
     * ```
     */
    empty<K extends UK, V extends UV>(): WithKeyValue<Tp, K, V>['normal'];
    /**
     * Returns an immutable multimap of this collection type and context, containing the given `entries`.
     * @param entries - a non-empty array of key-value entries
     * @example
     * ```ts
     * HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c'])    // => HashMap.NonEmpty<number, string>
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
     * HashMultiMapHashValue.from([[1, 'a'], [2, 'b']])    // => HashMultiMapHashValue.NonEmpty<number, string>
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
     * HashMultiMapHashValue.builder<number, string>()    // => HashMultiMapHashValue.Builder<number, string>
     * ```
     */
    builder<K extends UK, V extends UV>(): WithKeyValue<Tp, K, V>['builder'];
    /**
     * Returns a `Reducer` that adds received tuples to a MultiMap and returns the MultiMap as a result. When a `source` is given,
     * the reducer will first create a MultiMap from the source, and then add tuples to it.
     * @param source - (optional) an initial source of tuples to add to
     * @example
     * ```ts
     * const someSource: [number, string][] = [1, 'a'], [2, 'b'];
     * const result = Stream.of([1, 'c'], [3, 'a']).reduce(SortedMultiMap.reducer(someSource))
     * result.toArray()   // => [[1, 'a'], [1, 'c'], [2, 'b'], [3, 'a']]
     * ```
     * @note uses a builder under the hood. If the given `source` is a BiMap in the same context, it will directly call `.toBuilder()`.
     */
    reducer<K extends UK, V extends UV>(
      source?: StreamSource<readonly [K, V]>
    ): Reducer<[K, V], WithKeyValue<Tp, K, V>['normal']>;
  }

  /**
   * The multimap's Context instance that serves as a factory for all related immutable instances and builders.
   */
  export interface Context<
    UK,
    UV,
    Tp extends MultiMapBase.Types = MultiMapBase.Types
  > extends MultiMapBase.Factory<Tp, UK, UV> {
    /**
     * A string tag defining the specific collection type
     * @example
     * ```ts
     * HashMultiMapHashValue.defaultContext().typeTag   // => 'HashMultiMapHashValue'
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
    Tp extends MultiMapBase.Types = MultiMapBase.Types
  > {
    /**
     * Returns the amount of entries in the builder.
     * @example
     * ```ts
     * HashMultiMapHashValue.of([[1, 'a'], [2, 'b'], [1, 'c']]).toBuilder().size
     * // => 3
     * ```
     */
    readonly size: number;
    /**
     * Returns true if there are no entries in the builder.
     * @example
     * ```ts
     * HashMultiMapHashValue.of([[1, 'a'], [2, 'b']]).toBuilder().isEmpty
     * // => false
     * ```
     */
    readonly isEmpty: boolean;
    /**
     * Returns a built immutable collection of the values asssociated with given `key`
     * @param key - the key for which to get the associated values
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([[1, 'a'], [2, 'b'], [1, 'c']]).toBuilder()
     * m.getValues(1).toArray()   // => ['a', 'c']
     * m.getValues(10).toArray()  // => []
     * ```
     */
    getValues<UK = K>(
      key: RelatedTo<K, UK>
    ): WithKeyValue<Tp, K, V>['keyMapValues'];
    /**
     * Assigns given `values` `StreamSource` to the given `key`, replacing potential existing
     * values, and removing the key if `values` is empty.
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
     * m.setValues(1, ['a'])      // => false
     * m.setValues(2, ['c', 'd']) // => true
     * ```
     */
    setValues(key: K, values: StreamSource<V>): boolean;
    /**
     * Returns true if the given `key` is present in the builder.
     * @param key - the key to look for
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
     * m.hasKey(2)    // => true
     * m.hasKey(3)    // => false
     * ```
     */
    hasKey<UK = K>(key: RelatedTo<K, UK>): boolean;
    /**
     * Returns true if the given `value` is associated with given `key` in the builder.
     * @param key - the key to look for
     * @param value - the value to look for
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
     * m.hasEntry(2, 'b')    // => true
     * m.hasEntry(2, 'c')    // => false
     * m.hasEntry(3, 'a')    // => false
     * ```
     */
    hasEntry<UK = K>(key: RelatedTo<K, UK>, value: V): boolean;
    /**
     * Adds an entry with given `key` and `value` to the builder.
     * @param key - the entry key
     * @param value - the entry value
     * @returns true if the data in the builder has changed
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
     * m.add(1, 'a')   // => false
     * m.add(1, 'b')   // => true
     * ```
     */
    add(key: K, value: V): boolean;
    /**
     * Adds given `entries` to the builder.
     * @param entries - a `StreamSource` containig entries to add
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
     * m.addEntries([1, 'a'], [2, 'b']])   // => false
     * m.addEntries([1, 'b'], [2, 'd']])   // => true
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
     * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toBuilder()
     * m.removeEntry(3, 'a')   // => false
     * m.removeEntry(1, 'a')   // => true
     * ```
     */
    removeEntry<UK = K, UV = V>(
      key: RelatedTo<K, UK>,
      value: RelatedTo<V, UV>
    ): boolean;
    /**
     * Removes the given `entries` from the builder.
     * @param entries - a `StreamSource` containing entries to remove
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
     * m.removeEntries([[3, 'a'], [3, 'b']])  // => false
     * m.removeEntries([[1, 'a'], [3, 'b']])  // => true
     * ```
     */
    removeEntries<UK = K, UV = V>(
      entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>
    ): boolean;
    /**
     * Removes the values associated with given `key` from the builder.
     * @param key - the key of which to remove all values
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toBuilder()
     * m.removeKey(3)   // => false
     * m.removeKey(1)   // => true
     * ```
     */
    removeKey<UK = K>(key: RelatedTo<K, UK>): boolean;
    /**
     * Removes the values associated with each key of the given `keys`
     * @param keys - a `StreamSource` of keys for which to remove all values
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toBuilder()
     * m.removeKeys([10, 11])   // => false
     * m.removeKeys([1])        // => true
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
     * @throws RibuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while
     * looping over it
     * @example
     * ```ts
     * HashMultiMapHashValue.of([1, 'a'], [2, 'b'], [1, 'c']).toBuilder().forEach((entry, i, halt) => {
     *  console.log([entry[1], entry[0]]);
     *  if (i >= 1) halt();
     * })
     * // => logs ['a', 1]  ['c', 1]  (or other order)
     * ```
     * @note O(N)
     */
    forEach(
      f: (entry: [K, V], index: number, value: () => void) => void,
      state?: TraverseState
    ): void;
    /**
     * Returns an immutable collection instance containing the entries in this builder.
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 'a'], [2, 'b']).toBuilder()
     * const m2: HashMultiMapHashValue<number, string> = m.build()
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
