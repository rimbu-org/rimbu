import type { Token } from '@rimbu/base';
import type { RMap, VariantMap } from '@rimbu/collection-types/map';
import type { Row, WithRow } from '@rimbu/collection-types/map-custom';
import type {
  ArrayNonEmpty,
  OptLazy,
  OptLazyOr,
  RelatedTo,
  ToJSON,
  TraverseState,
  Update,
} from '@rimbu/common';
import type {
  FastIterable,
  Reducer,
  Stream,
  StreamSource,
  Streamable,
} from '@rimbu/stream';

export interface VariantTableBase<
  R,
  C,
  V,
  Tp extends VariantTableBase.Types = VariantTableBase.Types
> extends FastIterable<[R, C, V]> {
  /**
   * Returns the Map representation of this collection.
   * @example
   * ```ts
   * const m = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * const map: HashMap<number, HashMap.NonEmpty<number, number>> = m.rowMap
   * ```
   */
  readonly rowMap: WithRow<Tp, R, C, V>['rowMap'];
  /**
   * Returns true if the collection is empty.
   * @example
   * ```ts
   * HashTableHashColumn.empty<number, number, number>().isEmpty   // => true
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).isEmpty          // => false
   * ```
   */
  readonly isEmpty: boolean;
  /**
   * Returns the amount of entries in the collection.
   * @example
   * ```ts
   * HashTableHashColumn.empty<number, number, number>().size   // => 0
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).size          // => 2
   * ```
   */
  readonly size: number;
  /**
   * Returns the amount of rows in the collection.
   * @example
   * ```ts
   * HashTableHashColumn.empty<number, number, number>().rowSize   // => 0
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).rowSize          // => 1
   * ```
   */
  readonly amountRows: number;
  /**
   * Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection
   * as a .NonEmpty type.
   * @example
   * ```ts
   * const m: Table<number, number> = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * m.stream().first(0)     // compiler allows fallback value since the Stream may be empty
   * if (m.nonEmpty()) {
   *   m.stream().first(0)   // compiler error: fallback value not allowed since Stream is not empty
   * }
   * ```
   */
  nonEmpty(): this is WithRow<Tp, R, C, V>['nonEmpty'];
  /**
   * Returns the collection as a .NonEmpty type
   * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty
   * @example
   * ```ts
   * HashTableHashColumn.empty<number, number, number>().assumeNonEmpty()   // => throws
   * const m: Table<number, number, number> = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * const m2: Table.NonEmpty<number, number> = m     // => compiler error
   * const m3: Table.NonEmpty<number, number> = m.assumeNonEmpty()
   * ```
   * @note returns reference to this collection
   */
  assumeNonEmpty(): WithRow<Tp, R, C, V>['nonEmpty'];
  /**
   * Returns a Stream containing all entries of this collection as tuples of row key,
   * column key, and value.
   * @example
   * ```ts
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).stream().toArray()
   * // => [[1, 2, 3], [1, 4, 5]]
   * ```
   */
  stream(): Stream<[R, C, V]>;
  /**
   * Returns a Stream containing all row keys of this collection.
   * @example
   * ```ts
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).streamRows().toArray()
   * // => [1]
   * ```
   */
  streamRows(): Stream<R>;
  /**
   * Returns a Stream containing all values of this collection.
   * @example
   * ```ts
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).streamValues().toArray()
   * // => [3, 5]
   * ```
   */
  streamValues(): Stream<V>;
  /**
   * Returns true if given `row` key is in the collection.
   * @param row - the row key to look for
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.hasRowKey(10)    // => false
   * t.hasRowKey(1)     // => true
   * ```
   */
  hasRowKey<UR = R>(row: RelatedTo<R, UR>): boolean;
  /**
   * Returns true if the collection has a value for given `row` and `column` keys.
   * @param row - the row key
   * @param column - the column key
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.hasValueAt(10, 1)    // => false
   * t.hasValueAt(1, 4)     // => true
   * ```
   */
  hasValueAt<UR = R, UC = C>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>
  ): boolean;
  /**
   * Returns the value at given `row` and `column` keys, or the `otherwise` value if no
   * value is present.
   * @param row - the row key
   * @param column - the column key
   * @param otherwise - (default: undefined) the value to return if no value is found
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.get(10, 1)     // => undefined
   * t.get(10, 1, 0)  // => 0
   * t.get(1, 2)      // => 3
   * t.get(1, 2, 0)   // => 3
   * ```
   */
  get<UR = R, UC = C>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>
  ): V | undefined;
  get<UR, UC, O>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>,
    otherwise: OptLazy<O>
  ): V | O;
  /**
   * Returns a map containing the column keys and values in the given `row`.
   * @param row - the row key
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.getRow(10).toArray()    // => []
   * t.getRow(1).toArray()     // => [[2, 3], [4, 5]]
   * ```
   */
  getRow<UR = R>(row: RelatedTo<R, UR>): WithRow<Tp, R, C, V>['row'];
  /**
   * Returns the collection where the value at given `row` and `column` keys is removed.
   * @param row - the row key
   * @param column - the column key
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.remove(10, 11).toArray()   // => [[1, 2, 3], [1, 4, 5]]
   * t.remove(1, 4).toArray()     // => [[1, 2, 3]]
   * ```
   */
  remove<UR = R, UC = C>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>
  ): WithRow<Tp, R, C, V>['normal'];
  /**
   * Returns the collection where all values in given `row` are removed.
   * @param row - the row key
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 2, 3])
   * t.removeRow(10).toArray()   // => [[1, 2, 3], [1, 4, 5], [2, 2, 3]]
   * t.removeRow(1).toArray()    // => [[2, 2, 3]]
   * ```
   */
  removeRow<UR = R>(row: RelatedTo<R, UR>): WithRow<Tp, R, C, V>['normal'];
  /**
   * Returns a tuple containing the collection with the value at given `row` and `column` removed,
   * and the removed value. If no such value is found, it returns undefined.
   * @param row - the row key
   * @param column - the column key
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.removeAndGet(10, 11)  // => undefined
   * t.removeAndGet(1, 2)    // => [HashTableHashColumn([1, 4, 5]), 3]
   * ```
   */
  removeAndGet<UR = R, UC = C>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>
  ): [WithRow<Tp, R, C, V>['normal'], V] | undefined;
  /**
   * Returns a tuple containing the collection with the values at given `row` removed,
   * and a map containing the removed columns and values. If no such row is found, it
   * returns undefined.
   * @param row - the row key
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.removeRowAndGet(10)    // => undefined
   * t.removeRowAndGet(1)     // => [HashTableHashColumn(), HashMap(2 => 3, 4 => 5)]
   * ```
   */
  removeRowAndGet<UR = R>(
    row: RelatedTo<R, UR>
  ):
    | [WithRow<Tp, R, C, V>['normal'], WithRow<Tp, R, C, V>['rowNonEmpty']]
    | undefined;
  /**
   * Returns the collection where the values for each row key in given `rows` are removed.
   * @param rows - a `StreamSource` of row keys
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.removeRows([10, 11]).toArray()   // => [[1, 2, 3], [1, 4, 5]]
   * t.removeRows([1, 10]).toArray()    // => []
   * ```
   */
  removeRows<UR = R>(
    rows: StreamSource<RelatedTo<R, UR>>
  ): WithRow<Tp, R, C, V>['normal'];
  /**
   * Returns the collection where the given `entries` are removed.
   * @param entries - a `StreamSource` of table entries
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.removeEntries([[6, 7, 8], [7, 8, 9]]).toArray()  // => [[1, 2, 3], [1, 4, 5]]
   * t.removeEntries([[6, 7, 8], [1, 2, 3]]).toArray()  // => [[1, 4, 5]]
   * ```
   */
  removeEntries<UR = R, UC = C>(
    entries: StreamSource<[RelatedTo<R, UR>, RelatedTo<C, UC>]>
  ): WithRow<Tp, R, C, V>['normal'];
  /**
   * Performs given function `f` for each entry of the collection, using given `state` as initial traversal state.
   * @param f - the function to perform for each entry, receiving:<br/>
   * - `entry`: the next tuple of a row key, column key, and value<br/>
   * - `index`: the index of the element<br/>
   * - `halt`: a function that, if called, ensures that no new elements are passed
   * @param options - object containing the following<br/>
   * - state: (optional) the traverse state
   * @example
   * ```ts
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5])
   *   .forEach((entry, i, halt) => {
   *     console.log([entry]);
   *     if (i >= 1) halt();
   *   })
   * // => logs [1, 2, 3]  [1, 4, 5]
   * ```
   * @note O(N)
   */
  forEach(
    f: (entry: [R, C, V], index: number, halt: () => void) => void,
    options?: { state?: TraverseState }
  ): void;
  /**
   * Returns a collection containing only those entries that satisfy given `pred` predicate.
   * @param pred - a predicate function receiving:<br/>
   * - `entry`: the next entry<br/>
   * - `index`: the entry index<br/>
   * - `halt`: a function that, when called, ensures no next elements are passed
   * @param options - object containing the following<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5])
   *   .filter(entry => entry[2] === 5).toArray()
   * // => [[1, 4, 5], [2, 3, 5]]
   * ```
   */
  filter(
    pred: (entry: [R, C, V], index: number, halt: () => void) => boolean,
    options?: { negate?: boolean }
  ): WithRow<Tp, R, C, V>['normal'];
  /**
   * Returns a collection containing only those rows that satisfy given `pred` predicate.
   * @param pred - a predicate function receiving:<br/>
   * - `entry`: the next entry of the row key and a collection representing its columns and values<br/>
   * - `index`: the entry index<b/>
   * - `halt`: a function that, when called, ensures no next elements are passed
   * @param options - object containing the following<br/>
   * - negate: (default: false) when true will negate the given predicate
   * @example
   * ```ts
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5])
   *   .filterRows((rowKey, values) => rowKey === 1 && values.hasKey(4)).toArray()
   * // => [[1, 2, 3], [1, 4, 5]]
   * ```
   */
  filterRows(
    pred: (
      entry: readonly [R, WithRow<Tp, R, C, V>['rowNonEmpty']],
      index: number,
      halt: () => void
    ) => boolean,
    options?: { negate?: boolean }
  ): WithRow<Tp, R, C, V>['normal'];
  /**
   * Returns a collection with the same row and column keys, but where the given `mapFun` function is applied to each entry value.
   * @param mapFun - a function taking a `value` and a row and column key, and returning a new value
   * @example
   * ```ts
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5])
   *   .mapValues(value => value * 2)
   * // => [[1, 2, 6], [1, 4, 10], [2, 3, 10]]
   * ```
   */
  mapValues<V2>(
    mapFun: (value: V, row: R, column: C) => V2
  ): (Tp & Row<R, C, V2>)['normal'];
  /**
   * Returns an array containing all entries in this collection.
   * @example
   * ```ts
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toArray()
   * // => [[1, 2, 3], [1, 4, 5]]
   * ```
   * @note O(log(N))
   * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
   */
  toArray(): [R, C, V][];
  /**
   * Returns a string representation of this collection.
   * @example
   * ```ts
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toString()
   * // => HashTableHashColumn([1, 2] -> 3, [1, 4] -> 5)
   * ```
   */
  toString(): string;
  /**
   * Returns a JSON representation of this collection.
   * @example
   * ```ts
   * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toJSON()
   * // => { dataType: 'HashTableHashColumn', value: [1, [ [2, 3], [4, 5] ] ] }
   * ```
   */
  toJSON(): ToJSON<[R, [C, V][]][]>;
}

export namespace VariantTableBase {
  export interface NonEmpty<
    R,
    C,
    V,
    Tp extends VariantTableBase.Types = VariantTableBase.Types
  > extends VariantTableBase<R, C, V, Tp>,
      Streamable.NonEmpty<[R, C, V]> {
    /**
     * Returns the Map representation of this collection.
     * @example
     * ```ts
     * const m = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
     * const map: HashMap.NonEmpty<number, HashMap.NonEmpty<number, number>> = m.rowMap
     * ```
     */
    readonly rowMap: WithRow<Tp, R, C, V>['rowMapNonEmpty'];
    /**
     * Returns false since this collection is known to be non-empty
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).isEmpty   // => false
     * ```
     */
    readonly isEmpty: false;
    /**
     * Returns a self reference since this collection is known to be non-empty.
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
     * t === t.assumeNonEmpty()  // => true
     * ```
     */
    assumeNonEmpty(): this;
    /**
     * Returns this collection typed as a 'possibly empty' collection.
     * @example
     * ```ts
     * Table.of([1, 1, 1], [2, 2, 2]).asNormal();  // type: Table<number, number, number>
     * ```
     */
    asNormal(): WithRow<Tp, R, C, V>['normal'];
    /**
     * Returns true since this collection is known to be non-empty
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).nonEmpty()   // => true
     * ```
     */
    nonEmpty(): true;
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of row key,
     * column key, and value.
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).stream().toArray()
     * // => [[1, 2, 3], [1, 4, 5]]
     * ```
     */
    stream(): Stream.NonEmpty<[R, C, V]>;
    /**
     * Returns a non-empty Stream containing all row keys of this collection.
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).streamRows().toArray()
     * // => [1]
     * ```
     */
    streamRows(): Stream.NonEmpty<R>;
    /**
     * Returns a non-empty Stream containing all values of this collection.
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).streamValues().toArray()
     * // => [3, 5]
     * ```
     */
    streamValues(): Stream.NonEmpty<V>;
    /**
     * Returns a non-empty collection with the same row and column keys, but where the given `mapFun` function is applied to each entry value.
     * @param mapFun - a function taking a `value` and a row and column key, and returning a new value
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5])
     *   .mapValues(value => value * 2)
     * // => [[1, 2, 6], [1, 4, 10], [2, 3, 10]]
     * ```
     */
    mapValues<V2>(
      mapFun: (value: V, row: R, column: C) => V2
    ): (Tp & Row<R, C, V2>)['nonEmpty'];
    /**
     * Returns a non-empty array containing all entries in this collection.
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toArray()
     * // => [[1, 2, 3], [1, 4, 5]]
     * ```
     * @note O(log(N))
     * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
     */
    toArray(): ArrayNonEmpty<[R, C, V]>;
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends Row {
    readonly normal: VariantTableBase<this['_R'], this['_C'], this['_V']>;
    readonly nonEmpty: VariantTableBase.NonEmpty<
      this['_R'],
      this['_C'],
      this['_V']
    >;
    readonly row: VariantMap<this['_C'], this['_V']>;
    readonly rowNonEmpty: VariantMap.NonEmpty<this['_C'], this['_V']>;
    readonly rowMap: VariantMap<
      this['_R'],
      VariantMap.NonEmpty<this['_C'], this['_V']>
    >;
    readonly rowMapNonEmpty: VariantMap.NonEmpty<
      this['_R'],
      VariantMap.NonEmpty<this['_C'], this['_V']>
    >;
  }
}

export interface TableBase<
  R,
  C,
  V,
  Tp extends TableBase.Types = TableBase.Types
> extends VariantTableBase<R, C, V, Tp> {
  /**
   * Returns the `context` associated to this collection instance.
   */
  readonly context: WithRow<Tp, R, C, V>['context'];
  /**
   * Returns the collection where the given `value` is associated with the given `row` and
   * `column` keys.
   * @param row - the row key
   * @param column - the column key
   * @param value - the value to add
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.set(1, 2, 10).toArray()    // => [[1, 2, 10], [1, 4, 5]]
   * t.set(2, 6, 8).toArray()     // => [[1, 2, 3], [1, 4, 5], [2, 6, 8]]
   * ```
   */
  set(row: R, column: C, value: V): WithRow<Tp, R, C, V>['nonEmpty'];
  /**
   * Returns the collection with the given `entry` added.
   * @param entry - the entry to add
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.addEntry([2, 6, 8]).toArray()   // => [[1, 2, 3], [1, 4, 5], [2, 6, 8]]
   * ```
   */
  addEntry(entry: readonly [R, C, V]): WithRow<Tp, R, C, V>['nonEmpty'];
  /**
   * Returns the collection with the given `entries` added.
   * @param entries - a `StreamSource containing entries to add
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3])
   * t.addEntries([[1, 4, 5], [2, 6, 8]]).toArray()
   * // => [[1, 2, 3], [1, 4, 5], [2, 6, 8]]
   * ```
   */
  addEntries(
    entries: StreamSource.NonEmpty<readonly [R, C, V]>
  ): WithRow<Tp, R, C, V>['nonEmpty'];
  addEntries(
    entries: StreamSource<readonly [R, C, V]>
  ): WithRow<Tp, R, C, V>['normal'];
  /**
   * Returns the collection with the value at given `row` and `column` keys modified according to given `options`.
   * @param row - the row key
   * @param column - the column key
   * @param options - an object containing the following information:<br/>
   * - ifNew: (optional) if the given row-column combination has no value in the collection, this value or function will be used
   * to generate new values. If a function returning the token argument is given, no new entry is created.<br/>
   * - ifExists: (optional) if the row-column combination has a value, this function is called with the current value to
   * return a new value. As a second argument, a `remove` token is given. If the function returns this token, the current
   * entry is removed.
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.modifyAt(2, 5, { ifNew: 8 }).toArray()
   * // => [[1, 2, 3], [1, 4, 5], [2, 5, 8]]
   * t.modifyAt(2, 5, { ifNew: (none) => 1 < 2 ? none : 8 }).toArray()
   * // => [[1, 2, 3], [1, 4, 5]]
   * t.modifyAt(1, 2, { ifExists: (v) => v * 2 }).toArray()
   * // => [[1, 2, 6], [1, 4, 5]]
   * t.modifyAt(1, 2, { ifExists: (v, remove) => remove }).toArray()
   * // => [[1, 4, 5]]
   * ```
   */
  modifyAt(
    row: R,
    column: C,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: ((value: V, remove: Token) => V | Token) | V;
    }
  ): WithRow<Tp, R, C, V>['normal'];
  /**
   * Returns the collection with the value at given `row` and `column` keys updated according
   * to the given `update` function.
   * @param row - the row key
   * @param column - the column key
   * @param update - a function taking the current value and returning a new value
   * @example
   * ```ts
   * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
   * t.updateAt(1, 2, v => v * 2).toArray()
   * // => [[1, 2, 6], [1, 4, 5]]
   * t.updateAt(3, 4, v => v * 2)
   * // => [[1, 2, 3], [1, 4, 5]]
   * ```
   */
  updateAt<UR = R, UC = C>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>,
    update: Update<V>
  ): WithRow<Tp, R, C, V>['normal'];
  /**
   * Returns a builder object containing the entries of this collection.
   * @example
   * ```ts
   * const builder: HashTableHashColumn.Builder<number, number, number>
   *   = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
   * ```
   */
  toBuilder(): WithRow<Tp, R, C, V>['builder'];
}

export namespace TableBase {
  export interface NonEmpty<
    R,
    C,
    V,
    Tp extends TableBase.Types = TableBase.Types
  > extends VariantTableBase.NonEmpty<R, C, V, Tp>,
      Omit<
        TableBase<R, C, V, Tp>,
        keyof VariantTableBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<[R, C, V]> {
    /**
     * Returns a non-empty Stream containing all entries of this collection as tuples of row key,
     * column key, and value.
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).stream().toArray()
     * // => [[1, 2, 3], [1, 4, 5]]
     * ```
     */
    stream(): Stream.NonEmpty<[R, C, V]>;
    /**
     * Returns the collection with the given `entries` added.
     * @param entries - a `StreamSource containing entries to add
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3])
     * t.addEntries([[1, 4, 5], [2, 6, 8]]).toArray()
     * // => [[1, 2, 3], [1, 4, 5], [2, 6, 8]]
     * ```
     */
    addEntries(
      entries: StreamSource<readonly [R, C, V]>
    ): WithRow<Tp, R, C, V>['nonEmpty'];
    /**
     * Returns the collection with the value at given `row` and `column` keys updated according
     * to the given `update` function.
     * @param row - the row key
     * @param column - the column key
     * @param update - a function taking the current value and returning a new value
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
     * t.updateAt(1, 2, v => v * 2).toArray()
     * // => [[1, 2, 6], [1, 4, 5]]
     * t.updateAt(3, 4, v => v * 2)
     * // => [[1, 2, 3], [1, 4, 5]]
     * ```
     */
    updateAt<UR = R, UC = C>(
      row: RelatedTo<R, UR>,
      column: RelatedTo<C, UC>,
      update: Update<V>
    ): WithRow<Tp, R, C, V>['nonEmpty'];
  }

  export interface Factory<
    Tp extends TableBase.Types,
    UR = unknown,
    UC = unknown
  > {
    /**
     * Returns the (singleton) empty instance of this type and context with given key and value types.
     * @example
     * ```ts
     * HashTableHashColumn.empty<number, string, boolean>()    // => HashTableHashColumn<number, string, boolean>
     * HashTableHashColumn.empty<string, boolean, number>()    // => HashTableHashColumn<string, boolean, number>
     * ```
     */
    empty<R extends UR, C extends UC, V>(): WithRow<Tp, R, C, V>['normal'];
    /**
     * Returns an immutable multimap of this collection type and context, containing the given `entries`.
     * @param entries - a non-empty array of row-column-value entries
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5])    // => HashTableHashColumn.NonEmpty<number, number, number>
     * ```
     */
    of<R extends UR, C extends UC, V>(
      ...entries: ArrayNonEmpty<readonly [R, C, V]>
    ): WithRow<Tp, R, C, V>['nonEmpty'];
    /**
     * Returns an immutable table of this type and context, containing the entries in the given `sources` `StreamSource` instances.
     * @param sources - an array of `StreamSource` instances containing row-column-value entries
     * @example
     * ```ts
     * HashTableHashColumn.from([[1, 2, 3], [1, 4, 5]])    // => HashTableHashColumn.NonEmpty<number, number, number>
     * ```
     */
    from<R extends UR, C extends UC, V>(
      ...sources: ArrayNonEmpty<StreamSource.NonEmpty<readonly [R, C, V]>>
    ): WithRow<Tp, R, C, V>['nonEmpty'];
    from<R extends UR, C extends UC, V>(
      ...sources: ArrayNonEmpty<StreamSource<readonly [R, C, V]>>
    ): WithRow<Tp, R, C, V>['normal'];
    /**
     * Returns an empty builder instance for this type of collection and context.
     * @example
     * ```ts
     * HashTableHashColumn.builder<number, string, boolean>()    // => HashTableHashColumn.Builder<number, string, boolean>
     * ```
     */
    builder<R extends UR, C extends UC, V>(): WithRow<Tp, R, C, V>['builder'];
    /**
     * Returns a `Reducer` that adds received tuples to a Table and returns the Table as a result. When a `source` is given,
     * the reducer will first create a Table from the source, and then add tuples to it.
     * @param source - (optional) an initial source of tuples to add to
     * @example
     * ```ts
     * const someSource = Table.of([1, 'a', true], [2, 'b', false]);
     * const result = Stream.of([1, 'c', true], [3, 'a', false]).reduce(Table.reducer(someSource))
     * result.toArray()   // => [[1, 'c'], [2, 'b'], [3, 'a']]
     * ```
     * @note uses a builder under the hood. If the given `source` is a Table in the same context, it will directly call `.toBuilder()`.
     */
    reducer<R extends UR, C extends UC, V>(
      source?: StreamSource<readonly [R, C, V]>
    ): Reducer<readonly [R, C, V], WithRow<Tp, R, C, V>['normal']>;
  }

  export interface Context<UR, UC, Tp extends TableBase.Types = TableBase.Types>
    extends TableBase.Factory<Tp, UR, UC> {
    readonly _fixedKeys: readonly [UR, UC];
    /**
     * A string tag defining the specific collection type
     * @example
     * ```ts
     * HashTableHashColumn.defaultContext().typeTag   // => 'HashTableHashColumn'
     * ```
     */
    readonly typeTag: string;

    readonly _types: Tp;

    /**
     * The context used for the internal row map instances.
     */
    readonly rowContext: (Tp & Row<UR, UC, any>)['rowContext'];
    /**
     * The context used for the internal column map instances.
     */
    readonly columnContext: (Tp & Row<UR, UC, any>)['columnContext'];
  }

  export interface Builder<
    R,
    C,
    V,
    Tp extends TableBase.Types = TableBase.Types
  > {
    /**
     * Returns the amount of entries in the builder.
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5])
     *   .toBuilder()
     *   .size
     * // => 3
     * ```
     */
    readonly size: number;
    /**
     * Returns true if there are no entries in the builder.
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5])
     *   .toBuilder()
     *   .isEmpty
     * // => false
     * ```
     */
    readonly isEmpty: boolean;
    /**
     * Returns the amount of rows in the builder.
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5])
     *   .toBuilder()
     *   .amountRows
     * // => 2
     * ```
     */
    readonly amountRows: number;
    /**
     * Returns the value at given `row` and `column` keys, or the `otherwise` value if no
     * value is present.
     * @param row - the row key
     * @param column - the column key
     * @param otherwise - (default: undefined) the value to return if no value is found
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
     * t.get(10, 1)     // => undefined
     * t.get(10, 1, 0)  // => 0
     * t.get(1, 2)      // => 3
     * t.get(1, 2, 0)   // => 3
     * ```
     */
    get<UR = R, UC = C>(
      row: RelatedTo<R, UR>,
      column: RelatedTo<C, UC>
    ): V | undefined;
    get<UR, UC, O>(
      row: RelatedTo<R, UR>,
      column: RelatedTo<C, UC>,
      otherwise: OptLazy<O>
    ): V | O;
    /**
     * Returns a map containing the column keys and values in the given `row`.
     * @param row - the row key
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
     * t.getRow(10).toArray()    // => []
     * t.getRow(1).toArray()     // => [[2, 3], [4, 5]]
     * ```
     */
    getRow<UR = R>(row: RelatedTo<R, UR>): WithRow<Tp, R, C, V>['row'];
    /**
     * Returns true if the builder has a value for given `row` and `column` keys.
     * @param row - the row key
     * @param column - the column key
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
     * t.hasValueAt(10, 1)    // => false
     * t.hasValueAt(1, 4)     // => true
     * ```
     */
    hasValueAt<UR = R, UC = C>(
      row: RelatedTo<R, UR>,
      column: RelatedTo<C, UC>
    ): boolean;
    /**
     * Returns true if given `row` key is in the builder.
     * @param row - the row key to look for
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
     * t.hasRowKey(10)    // => false
     * t.hasRowKey(1)     // => true
     * ```
     */
    hasRowKey<UR = R>(row: RelatedTo<R, UR>): boolean;
    /**
     * Sets the given `value` for the given `row` and `column` keys in the builder.
     * @param row - the row key
     * @param column - the column key
     * @param value - the value to set
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
     * t.set(1, 2, 3)   // => false
     * t.set(1, 3, 8)   // => true
     * ```
     */
    set(row: R, column: C, value: V): boolean;
    /**
     * Adds the given `entry` to the builder.
     * @param entry - the entry to add
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
     * t.addEntry([1, 2, 3])   // => false
     * t.addEntry([1, 3, 8])   // => true
     * ```
     */
    addEntry(entry: readonly [R, C, V]): boolean;
    /**
     * Adds the given `entries` to the builder.
     * @param entries - a `StreamSource` containing entries to add.
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
     * t.addEntries([[1, 2, 3], [1, 2, 3]])  // => false
     * t.addEntries([[1, 2, 3], [2, 3, 4]])  // => true
     * ```
     */
    addEntries(entries: StreamSource<readonly [R, C, V]>): boolean;
    /**
     * Remove the value at given `row` and `column` keys in the builder.
     * @param row - the row key
     * @param column - the column key
     * @param otherwise - (default: undefined) the value to return if no value was found
     * @returns the value previously assigned at given row and column, or the otherwise value
     * if no such value was found
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
     * t.remove(5, 6)        // => undefined
     * t.remove(5, 6, 'a')   // => 'a'
     * t.remove(1, 2)        // => 3
     * t.remove(1, 4, 'a')   // => 5
     * ```
     */
    remove<UR = R, UC = C>(
      row: RelatedTo<R, UR>,
      column: RelatedTo<C, UC>
    ): V | undefined;
    remove<UR, UC, O>(
      row: RelatedTo<R, UR>,
      column: RelatedTo<C, UC>,
      otherwise: OptLazy<O>
    ): V | O;
    /**
     * Removes all values in the given `row` from the builder.
     * @param row - the row key
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5]).toBuilder()
     * t.removeRow(5)   // => false
     * t.removeRow(1)   // => true
     * ```
     */
    removeRow<UR = R>(row: RelatedTo<R, UR>): boolean;
    /**
     * Removes all given `rows` from the builder.
     * @param rows - a `StreamSource` containing row keys to remove
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5]).toBuilder()
     * t.removeRows([10, 11])  // => false
     * t.removeRows([1, 10])   // => true
     * ```
     */
    removeRows<UR = R>(rows: StreamSource<RelatedTo<R, UR>>): boolean;
    /**
     * Removes all given `entries` from the builder.
     * @param entries - a `StreamSource` containing entries to remove.
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5]).toBuilder()
     * t.removeEntries([[7, 8, 9], [9, 8, 7]])  // => false
     * t.removeEntries([[7, 8, 9], [1, 2, 3]])  // => true
     * ```
     */
    removeEntries<UR = R, UC = C>(
      entries: StreamSource<[RelatedTo<R, UR>, RelatedTo<C, UC>]>
    ): boolean;
    /**
     * Performs given function `f` for each entry of the collection, using given `state` as initial traversal state.
     * @param f - the function to perform for each entry, receiving:<br/>
     * - `entry`: the next tuple of a row key, column key, and value<br/>
     * - `index`: the index of the element<br/>
     * - `halt`: a function that, if called, ensures that no new elements are passed
     * @param options - object containing the following<br/>
     * - state: (optional) the traverse state
     * @example
     * ```ts
     * HashTableHashColumn.of([1, 2, 3], [1, 4, 5], [2, 3, 5])
     *   .toBuilder()
     *   .forEach((entry, i, halt) => {
     *     console.log([entry]);
     *     if (i >= 1) halt();
     *   })
     * // => logs [1, 2, 3]  [1, 4, 5]
     * ```
     * @note O(N)
     */
    forEach(
      f: (entry: [R, C, V], index: number, halt: () => void) => void,
      options?: { state?: TraverseState }
    ): void;
    /**
     * Modifies the value at given `row` and `column` keys according to given `options`.
     * @param row - the row key
     * @param column - the column key
     * @param options - an object containing the following information:<br/>
     * - ifNew: (optional) if the given row-column combination has no value in the collection, this value or function will be used
     * to generate new values. If a function returning the token argument is given, no new entry is created.<br/>
     * - ifExists: (optional) if the row-column combination has a value, this function is called with the current value to
     * return a new value. As a second argument, a `remove` token is given. If the function returns this token, the current
     * entry is removed.
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
     * t.modifyAt(2, 5, { ifNew: 8 })
     * // => true
     * t.modifyAt(2, 6, { ifNew: (none) => 1 < 2 ? none : 8 })
     * // => false
     * t.modifyAt(1, 2, { ifExists: (v) => v * 2 })
     * // => true
     * t.modifyAt(1, 2, { ifExists: (v, remove) => remove })
     * // => true
     * ```
     */
    modifyAt(
      row: R,
      column: C,
      options: {
        ifNew?: OptLazyOr<V, Token>;
        ifExists?: (currentValue: V, remove: Token) => V | Token | V;
      }
    ): boolean;
    /**
     * Updates the value at given `row` and `column` keys according to the given `update`
     * function.
     * @param row - the row key
     * @param column - the column key
     * @param update - a function taking the current value and returning a new value
     * @param otherwise - (default: undefined) the value to return if no value was found
     * @returns the old value at given `row` and `column` keys, or the `otherwise` value if
     * no value was found.
     * @example
     * ```ts
     * const t = HashTableHashColumn.of([1, 2, 3], [1, 4, 5])
     * t.updateAt(3, 4, v => v * 2)        // => undefined
     * t.updateAt(3, 4, v => v * 2, 'a')   // => 'a'
     * t.updateAt(1, 2, v => v * 2)        // => true
     * t.updateAt(1, 2, v => v * 2, 'a')   // => true
     * ```
     */
    updateAt(row: R, column: C, update: Update<V>): V | undefined;
    updateAt<O>(
      row: R,
      column: C,
      update: Update<V>,
      otherwise: OptLazy<O>
    ): V | O;
    /**
     * Returns an immutable collection instance containing the entries in this builder.
     * @example
     * ```ts
     * const m = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
     * const m2: HashTableHashColumn<number, number, number> = m.build()
     * ```
     */
    build(): WithRow<Tp, R, C, V>['normal'];
    /**
     * Returns an immutable collection instance containing the entries in this builder.
     * @param mapFun - a function receiving the `value`, `row` and `column`, and returning a new value
     * @example
     * ```ts
     * const m = HashTableHashColumn.of([1, 2, 3], [1, 4, 5]).toBuilder()
     * const m2: HashTableHashColumn<number, number, boolean> = m.buildMapValues(v => v > 3)
     * ```
     */
    buildMapValues<V2>(
      mapFun: (value: V, row: R, column: C) => V2
    ): (Tp & Row<R, C, V2>)['normal'];
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends VariantTableBase.Types {
    readonly normal: TableBase<this['_R'], this['_C'], this['_V']>;
    readonly nonEmpty: TableBase.NonEmpty<this['_R'], this['_C'], this['_V']>;
    readonly row: RMap<this['_C'], this['_V']>;
    readonly rowNonEmpty: RMap.NonEmpty<this['_C'], this['_V']>;
    readonly rowMap: RMap<this['_R'], RMap.NonEmpty<this['_C'], this['_V']>>;
    readonly rowMapNonEmpty: RMap.NonEmpty<
      this['_R'],
      RMap.NonEmpty<this['_C'], this['_V']>
    >;
    readonly context: TableBase.Context<this['_R'], this['_C']>;
    readonly builder: TableBase.Builder<this['_R'], this['_C'], this['_V']>;
    readonly rowContext: RMap.Context<this['_R']>;
    readonly columnContext: RMap.Context<this['_C']>;
  }
}
