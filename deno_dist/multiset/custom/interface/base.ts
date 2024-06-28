import type { RMap, VariantMap } from '../../../collection-types/map/index.ts';
import type { Elem, WithElem } from '../../../collection-types/map-custom/index.ts';
import type {
  ArrayNonEmpty,
  RelatedTo,
  ToJSON,
  TraverseState,
} from '../../../common/mod.ts';
import type {
  FastIterable,
  Reducer,
  Stream,
  StreamSource,
  Streamable,
} from '../../../stream/mod.ts';

export interface VariantMultiSetBase<
  T,
  Tp extends VariantMultiSetBase.Types = VariantMultiSetBase.Types
> extends FastIterable<T> {
  /**
   * Returns true if the collection is empty.
   * @example
   * ```ts
   * HashMultiSet.empty<number>().isEmpty     // => true
   * HashMultiSet.of(1, 2, 2).isEmpty         // => false
   * ```
   */
  readonly isEmpty: boolean;
  /**
   * Returns the number of values in the collection.
   * @example
   * ```ts
   * HashMultiSet.of(1, 2).size         // => 2
   * HashMultiSet.of(1, 2, 2).size      // => 3
   * ```
   */
  readonly size: number;
  /**
   * Returns the number of distinct values in the collection.
   * @example
   * ```ts
   * HashMultiSet.of(1, 2).sizeDistinct       // => 2
   * HashMultiSet.of(1, 2, 2).sizeDistinct    // => 2
   * ```
   */
  readonly sizeDistinct: number;
  /**
   * Returns the Map representation of this collection.
   * @example
   * ```ts
   * const m = HashMultiSet.of(1, 2, 2)
   * const map: HashMap.NonEmpty<number, number> = m.countMap
   * ```
   */
  readonly countMap: WithElem<Tp, T>['countMap'];
  /**
   * Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection
   * as a .NonEmpty type.
   * @example
   * ```ts
   * const m: HashMultiSet<number> = HashMultiSet.of(1, 2, 2)
   * m.stream().first(0)     // compiler allows fallback value since the Stream may be empty
   * if (m.nonEmpty()) {
   *   m.stream().first(0)   // compiler error: fallback value not allowed since Stream is not empty
   * }
   * ```
   */
  nonEmpty(): this is WithElem<Tp, T>['nonEmpty'];
  /**
   * Returns the collection as a .NonEmpty type
   * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty
   * @example
   * ```ts
   * HashMultiSet.empty<number>().assumeNonEmpty()   // => throws
   * const m: HashMultiSet<number> = HashMultiSet.of(1, 2)
   * const m2: HashMultiSet.NonEmpty<number> = m     // => compiler error
   * const m3: HashMultiSet.NonEmpty<number> = m.assumeNonEmpty()
   * ```
   * @note returns reference to this collection
   */
  assumeNonEmpty(): WithElem<Tp, T>['nonEmpty'];
  /**
   * Returns a Stream containing all values of this collection.
   * @example
   * ```ts
   * HashMultiSet.of(1, 2, 2).stream().toArray()  // => [1, 2, 2]
   * ```
   */
  stream(): Stream<T>;
  /**
   * Returns a Stream containing all distinct values of this collection.
   * @example
   * ```ts
   * HashMultiSet.of(1, 2, 2).stream().toArray()  // => [1, 2]
   * ```
   */
  streamDistinct(): Stream<T>;
  /**
   * Returns the collection where the given `amount` (default: 'ALL') of the given `value`
   * are removed.
   * @param value - the value to remove
   * @param options - (optional) an object containing the following properties:<br/>
   * - amount: (default: 'ALL') the amount of values to remove, or 'ALL' to remove all values.
   * @example
   * ```ts
   * const m = HashMultiSet.of(1, 2, 2)
   * m.remove(5).toArray()     // => [1, 2, 2]
   * m.remove(2).toArray()     // => [1]
   * m.remove(2, 1).toArray()  // => [1, 2]
   * ```
   */
  remove<U = T>(
    value: RelatedTo<T, U>,
    options?: { amount?: number | 'ALL' }
  ): WithElem<Tp, T>['normal'];
  /**
   * Returns the collection where every single value from given `values` `StreamSource` is
   * removed.
   * @param values - a `StreamSource` containing values to remove.
   * @example
   * ```ts
   * const m = HashMultiSet.of(1, 2, 2)
   * m.removeAllSingle([5, 6]).toArray()    // => [1, 2, 2]
   * m.removeAllSingle([2, 3]).toArray()    // => [1, 2]
   * m.removeAllSingle([2, 3, 2]).toArray() // => [1]
   * ```
   */
  removeAllSingle<U = T>(
    values: StreamSource<RelatedTo<T, U>>
  ): WithElem<Tp, T>['normal'];
  /**
   * Returns the collection where for every value from given `values` `StreamSource`,
   * all values in the collection are removed.
   * @param values - a `StreamSource` containing values to remove.
   * @example
   * ```ts
   * const m = HashMultiSet.of(1, 2, 2)
   * m.removeAllEvery([5, 6]).toArray()    // => [1, 2, 2]
   * m.removeAllEvery([2, 3]).toArray()    // => [1]
   * ```
   */
  removeAllEvery<U = T>(
    values: StreamSource<RelatedTo<T, U>>
  ): WithElem<Tp, T>['normal'];
  /**
   * Returns true if the given `value` exists in the collection.
   * @param value - the value to look for
   * @example
   * ```ts
   * const m = HashMultiSet.of(1, 2, 2)
   * m.has(5)   // => false
   * m.has(2)   // => true
   * ```
   */
  has<U = T>(value: RelatedTo<T, U>): boolean;
  /**
   * Returns the amount of occurrances of the given `value` in the collection.
   * @param value - the value to look for
   * @example
   * ```ts
   * const m = HashMultiSet.of(1, 2, 2)
   * m.count(5)   // => 0
   * m.count(2)   // => 2
   * ```
   */
  count<U = T>(value: RelatedTo<T, U>): number;
  /**
   * Performs given function `f` for each value of the collection, using given `state` as initial traversal state.
   * @param f - the function to perform for each value, receiving:<br/>
   * - `value`: the next value<br/>
   * - `index`: the index of the value<br/>
   * - `halt`: a function that, if called, ensures that no new values are passed
   * @param options - (optional) an object containing the following properties:<br/>
   * - state: (optional) the traversal state
   * @example
   * ```ts
   * HashMultiSet.of(1, 2, 2, 3).forEach((entry, i, halt) => {
   *   console.log(entry)
   *   if (i >= 1) halt()
   * })
   * // => logs [1, 1]  [2, 2]
   * ```
   */
  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    options?: { state?: TraverseState }
  ): void;
  /**
   * Returns the collection containing only those values for which the given `pred` function returns true.
   * @param pred - a predicate function receiving:<br/>
   * - `entry`: the next entry consisting of the value and its count<br/>
   * - `index`: the entry index<br/>
   * - `halt`: a function that, when called, ensures no next entries are passed
   * @param options - (optional) an object containing the following properties:<br/>
   * - negate: (default: false) when true will negate the predicate
   * @note if the predicate is a type guard, the return type is automatically inferred
   * @example
   * ```ts
   * HashMultiSet.of(1, 2, 2, 3)
   *   .filterEntries(entry => entry[1] > 1)
   *   .toArray()
   * // => [[2, 2]]
   * ```
   */
  filterEntries<TF extends T>(
    pred: (entry: readonly [T, number], index: number) => entry is [TF, number],
    options?: { negate?: false | undefined }
  ): WithElem<Tp, TF>['normal'];
  filterEntries<TF extends T>(
    pred: (entry: readonly [T, number], index: number) => entry is [TF, number],
    options: { negate: true }
  ): WithElem<Tp, Exclude<T, TF>>['normal'];
  filterEntries(
    pred: (entry: readonly [T, number], index: number) => boolean,
    options?: { negate?: boolean }
  ): WithElem<Tp, T>['normal'];
  /**
   * Returns an array containing all values in this collection.
   * @example
   * ```ts
   * HashMultiSet.of(1, 2, 2).toArray()  // => [1, 2, 2]
   * ```
   * @note O(log(N))
   * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
   */
  toArray(): T[];
  /**
   * Returns a string representation of this collection.
   * @example
   * ```ts
   * HashMultiSet.of(1, 2, 2).toString()  // => HashMultiSet(1, 2, 2)
   * ```
   */
  toString(): string;
  /**
   * Returns a JSON representation of this collection.
   * @example
   * ```ts
   * HashMultiSet.of(1, 2, 2).toJSON()   // => { dataType: 'HashMultiSet', value: [[1, 1], [2, 2]] }
   * ```
   */
  toJSON(): ToJSON<(readonly [T, number])[]>;
}

export namespace VariantMultiSetBase {
  export interface NonEmpty<
    T,
    Tp extends VariantMultiSetBase.Types = VariantMultiSetBase.Types
  > extends VariantMultiSetBase<T, Tp>,
      Streamable.NonEmpty<T> {
    /**
     * Returns false since this collection is known to be non-empty
     * @example
     * ```ts
     * HashMultiSet.of(1, 2, 2).isEmpty         // => false
     * ```
     */
    readonly isEmpty: false;
    /**
     * Returns the Map representation of this collection.
     * @example
     * ```ts
     * const m = HashMultiMapHashValue.of([1, 1], [2, 2])
     * const map: HashMap.NonEmpty<number, HashSet.NonEmpty<number>> = m.countMap
     * ```
     */
    readonly countMap: WithElem<Tp, T>['countMapNonEmpty'];
    /**
     * Returns true since this collection is known to be non-empty
     * @example
     * ```ts
     * HashMultiSet.of(1, 2, 2).nonEmpty()   // => true
     * ```
     */
    nonEmpty(): this is WithElem<Tp, T>['nonEmpty'];
    /**
     * Returns this collection typed as a 'possibly empty' collection.
     * @example
     * ```ts
     * HashMultiSet.of(1, 2).asNormal();  // type: HashMultiSet<number>
     * ```
     */
    asNormal(): WithElem<Tp, T>['normal'];
    /**
     * Returns a non-empty Stream containing all values of this collection.
     * @example
     * ```ts
     * HashMultiSet.of(1, 2, 2).stream().toArray()  // => [1, 2, 2]
     * ```
     */
    stream(): Stream.NonEmpty<T>;
    /**
     * Returns a non-empty Stream containing all distinct values of this collection.
     * @example
     * ```ts
     * HashMultiSet.of(1, 2, 2).stream().toArray()  // => [1, 2]
     * ```
     */
    streamDistinct(): Stream.NonEmpty<T>;
    /**
     * Returns a non-empty array containing all values in this collection.
     * @example
     * ```ts
     * HashMultiSet.of(1, 2, 2).toArray()  // => [1, 2, 2]
     * ```
     * @note O(log(N))
     * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
     */
    toArray(): ArrayNonEmpty<T>;
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends Elem {
    readonly normal: VariantMultiSetBase<this['_T']>;
    readonly nonEmpty: VariantMultiSetBase.NonEmpty<this['_T']>;
    readonly countMap: VariantMap<this['_T'], number>;
    readonly countMapNonEmpty: VariantMap.NonEmpty<this['_T'], number>;
  }
}

export interface MultiSetBase<
  T,
  Tp extends MultiSetBase.Types = MultiSetBase.Types
> extends VariantMultiSetBase<T, Tp> {
  /**
   * Returns the `context` associated to this collection instance.
   */
  readonly context: WithElem<Tp, T>['context'];
  /**
   * Returns the collection with the given `value` added `amount` times.
   * @param value - the value to add
   * @param amount - (default: 1) the amount of values to add
   * @example
   * ```ts
   * HashMultiSet.of(1, 2).add(2).toArray()      // => [1, 2, 2]
   * HashMultiSet.of(1, 2).add(3, 2).toArray()   // => [1, 2, 3, 3]
   * ```
   * @note amount < 0 will be normalized to 0
   */
  add(value: T): WithElem<Tp, T>['nonEmpty'];
  add(value: T, amount: number): WithElem<Tp, T>['normal'];
  /**
   * Returns the collection with the values in `values` added.
   * @param values - a `StreamSource` containing values to add
   * @example
   * ```ts
   * HashMultiSet.of(1, 2).addAll([2, 3]).toArray()   // => [1, 2, 2, 3]
   * ```
   */
  addAll(values: StreamSource.NonEmpty<T>): WithElem<Tp, T>['nonEmpty'];
  addAll(values: StreamSource<T>): WithElem<Tp, T>['normal'];
  /**
   * Returns the collection where for every entry in `entries` consisting of a tuple
   * of a value and an amount, that value is added `amount` times.
   * @param entries - a `StreamSource` containing tuples that contain a value and an amount
   * @example
   * ```ts
   * HashMultiSet.of(1, 2).addEntries([[2, 2], [3, 2]]).toArray()
   * // => [1, 2, 2, 2, 3, 3]
   * ```
   */
  addEntries(
    entries: StreamSource<readonly [T, number]>
  ): WithElem<Tp, T>['normal'];
  /**
   * Returns the collection where the amount of values of `value` if set to `amount`.
   * @param value - the value of which to set the amount
   * @param amount - the new amount of values
   *
   * @note if amount <= 0, the value will be removed
   * @example
   * ```ts
   * const m = HashMultiSet.of(1, 2, 2)
   * m.setCount(1, 2).toArray()    // => [1, 1, 2, 2]
   * m.setCount(2, 0).toArray()    // => [1]
   * ```
   */
  setCount(value: T, amount: number): WithElem<Tp, T>['normal'];
  /**
   * Returns the collection where the count of the given `value` is modified according to
   * the given `update` function.
   * @param value - the value of which to modify the count
   * @param update - a function taking the current count and returning a new count.
   *
   * @note if the given `value` does not exists, the `update` function is called with 0.
   * @note if the result of `update` is <= 0, the value will be removed (or not added)
   * @example
   * ```ts
   * const m = HashMultiSet.of(1, 2, 2)
   * m.modifyCount(1, v => v + 1).toArray()   // => [1, 1, 2, 2]
   * m.modifyCount(3, v => v + 1).toArray()   // => [1, 2, 2, 3]
   * ```
   */
  modifyCount(
    value: T,
    update: (currentCount: number) => number
  ): WithElem<Tp, T>['normal'];
  /**
   * Returns a builder object containing the entries of this collection.
   * @example
   * ```ts
   * const builder: HashMultiSet.Builder<number>
   *   = HashMultiSet.of(1, 2, 2).toBuilder()
   * ```
   */
  toBuilder(): WithElem<Tp, T>['builder'];
}

export namespace MultiSetBase {
  export interface NonEmpty<
    T,
    Tp extends MultiSetBase.Types = MultiSetBase.Types
  > extends VariantMultiSetBase.NonEmpty<T, Tp>,
      Omit<MultiSetBase<T, Tp>, keyof VariantMultiSetBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<T> {
    /**
     * Returns a non-empty Stream containing all values of this collection.
     * @example
     * ```ts
     * HashMultiSet.of(1, 2, 2).stream().toArray()  // => [1, 2, 2]
     * ```
     */
    stream(): Stream.NonEmpty<T>;
    /**
     * Returns the collection with the given `value` added `amount` times.
     * @param value - the value to add
     * @param amount - (default: 1) the amount of values to add
     * @example
     * ```ts
     * HashMultiSet.of(1, 2).add(2).toArray()      // => [1, 2, 2]
     * HashMultiSet.of(1, 2).add(3, 2).toArray()   // => [1, 2, 3, 3]
     * ```
     * @note amount < 0 will be normalized to 0
     */
    add(value: T, amount?: number): WithElem<Tp, T>['nonEmpty'];
    /**
     * Returns the collection with the values in `values` added.
     * @param values - a `StreamSource` containing values to add
     * @example
     * ```ts
     * HashMultiSet.of(1, 2).addAll([2, 3]).toArray()   // => [1, 2, 2, 3]
     * ```
     */
    addAll(values: StreamSource<T>): WithElem<Tp, T>['nonEmpty'];
    /**
     * Returns the collection where for every entry in `entries` consisting of a tuple
     * of a value and an amount, that value is added `amount` times.
     * @param entries - a `StreamSource` containing tuples that contain a value and an amount
     * @example
     * ```ts
     * HashMultiSet.of(1, 2).addEntries([[2, 2], [3, 2]]).toArray()
     * // => [1, 2, 2, 2, 3, 3]
     * ```
     */
    addEntries(
      entries: StreamSource<readonly [T, number]>
    ): WithElem<Tp, T>['nonEmpty'];
  }

  export interface Factory<Tp extends MultiSetBase.Types, UT = unknown> {
    /**
     * Returns the (singleton) empty instance of this type and context with given key and value types.
     * @example
     * ```ts
     * HashMultiSet.empty<number>()    // => HashMultiSet<number>
     * HashMultiSet.empty<string>()    // => HashMultiSet<string>
     * ```
     */
    empty<T extends UT>(): WithElem<Tp, T>['normal'];
    /**
     * Returns an immutable multimap of this collection type and context, containing the given `values`.
     * @param values - a non-empty array of vslues
     * @example
     * ```ts
     * HashMultiSet.of(1, 2, 2)    // => HashMultiSet.NonEmpty<number>
     * ```
     */
    of<T extends UT>(...values: ArrayNonEmpty<T>): WithElem<Tp, T>['nonEmpty'];
    /**
     * Returns an immutable multimap of this type and context, containing the values in the given `sources`
     * `StreamSource`.
     * @param sources - a non-empty array of `StreamSource` instances containing values to add
     * @example
     * ```ts
     * HashMultiSet.from([1, 2], [2, 3, 4]).toArray()    // => [1, 2, 2, 3, 4]
     * ```
     */
    from<T extends UT>(
      ...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
    ): WithElem<Tp, T>['nonEmpty'];
    from<T extends UT>(
      ...sources: ArrayNonEmpty<StreamSource<T>>
    ): WithElem<Tp, T>['normal'];
    /**
     * Returns an empty builder instance for this type of collection and context.
     * @example
     * ```ts
     * HashMultiSet.builder<number>()    // => HashMultiSet.Builder<number>
     * ```
     */
    builder<T extends UT>(): WithElem<Tp, T>['builder'];
    /**
     * Returns a `Reducer` that appends received items to a MultiSet and returns the MultiSet as a result. When a `source` is given,
     * the reducer will first create a MultiSet from the source, and then add elements to it.
     * @param source - (optional) an initial source of elements to add to
     * @example
     * ```ts
     * const someList = [1, 2, 3];
     * const result = Stream.range({ start: 20, amount: 5 }).reduce(SortedMultiSet.reducer(someList))
     * result.toArray()   // => [1, 2, 3, 20, 21, 22, 23, 24]
     * ```
     * @note uses a MultiSet builder under the hood. If the given `source` is a MultiSet in the same context, it will directly call `.toBuilder()`.
     */
    reducer<T extends UT>(
      source?: StreamSource<T>
    ): Reducer<T, WithElem<Tp, T>['normal']>;
  }

  export interface Context<
    UT,
    Tp extends MultiSetBase.Types = MultiSetBase.Types
  > extends MultiSetBase.Factory<Tp, UT> {
    /**
     * A string tag defining the specific collection type
     * @example
     * ```ts
     * HashMultiSet.defaultContext().typeTag   // => 'HashMultiSet'
     * ```
     */
    readonly typeTag: string;

    readonly _types: Tp;
    /**
     * The context used for the internal countMap instances.
     */
    readonly countMapContext: WithElem<Tp, UT>['countMapContext'];

    /**
     * Returns true if given `obj` could be a valid key in this Context.
     * @param obj - the object to check
     * @example
     * ```ts
     * HashMultiSet.defaultContext().isValidKey(1)   // => true
     * ```
     */
    isValidElem(key: any): key is UT;
  }

  export interface Builder<
    T,
    Tp extends MultiSetBase.Types = MultiSetBase.Types
  > {
    /**
     * Returns the amount of values in the builder.
     * @example
     * ```ts
     * HashMultiSet.of(1, 2, 2).toBuilder().size
     * // => 3
     * ```
     */
    readonly size: number;
    /**
     * Returns the amount of distinct values in the builder.
     * @example
     * ```ts
     * HashMultiSet.of(1, 2, 2).toBuilder().sizeDistinct
     * // => 2
     * ```
     */
    readonly sizeDistinct: number;
    /**
     * Returns true if there are no values in the builder.
     * @example
     * ```ts
     * HashMultiSet.of(1, 2, 2).toBuilder().isEmpty
     * // => false
     * ```
     */
    readonly isEmpty: boolean;
    /**
     * Returns true if the given `value` is present in the builder.
     * @param value - the value to look for
     * @example
     * ```ts
     * const s = HashMultiSet.of(1, 2, 2).toBuilder()
     * s.has(2)   // => true
     * s.has(10)  // => false
     * ```
     */
    has<U = T>(value: RelatedTo<T, U>): boolean;
    /**
     * Adds given `value` to the builder.
     * @param value - the value to add
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const s = HashMultiSet.of(1, 2, 2).toBuilder()
     * s.add(2)     // => true
     * s.add(3, 5)  // => true
     * s.add(3, 0)  // => false
     * ```
     */
    add(value: T, amount?: number): boolean;
    /**
     * Adds the values in given `values` `StreamSource` to the builder.
     * @param values - the values to add
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const s = HashMultiSet.of(1, 2, 2).toBuilder()
     * s.addAll(1, 3)   // => false
     * s.addAll(2, 10)  // => true
     * ```
     */
    addAll(values: StreamSource<T>): boolean;
    /**
     * Adds for each tuple of a value and amount in the given `entries`, the amount of values
     * to the builder.
     * @param entries - a `StreamSource` containing tuples of a value and amount
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const s = HashMultiSet.of(1, 2, 2).toBuilder()
     * s.addEntries([[1, 2], [2, 3]])   // => true
     * s.addEntries([[1, 0], [3, 0]])   // => false
     * ```
     */
    addEntries(entries: StreamSource<readonly [T, number]>): boolean;
    /**
     * Removes given `amount` or all of given `value` from the builder.
     * @param value - the value to remove
     * @param amount - (default: 'ALL') the amount of values to remove
     * @returns the amount of elements that are removed
     * @example
     * ```ts
     * const s = HashMultiSet.of(1, 2, 2).toBuilder()
     * s.remove(10)    // => 0
     * s.remove(1, 2)  // => 1
     * s.remove(2, 2)  // => 2
     * ```
     */
    remove<U = T>(value: RelatedTo<T, U>, amount?: number | 'ALL'): number;
    /**
     * Removes every single value in given `values` from the builder.
     * @param values - a `StreamSource` of values to remove.
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const s = HashMultiSet.of(1, 2, 2).toBuilder()
     * s.removeAllSingle([10, 11])   // => false
     * s.removeAllSingle([1, 11])    // => true
     * ```
     */
    removeAllSingle<U = T>(values: StreamSource<RelatedTo<T, U>>): boolean;
    /**
     * Removes every instance of the given `values` from the builder.
     * @param values - a `StreamSource` of values to remove.
     * @returns true if the data in the builder has changed
     * @example
     * ```ts
     * const s = HashMultiSet.of(1, 2, 2).toBuilder()
     * s.removeAllEvery([10, 11])   // => false
     * s.removeAllEvery([1, 11])    // => true
     * ```
     */
    removeAllEvery<U = T>(values: StreamSource<RelatedTo<T, U>>): boolean;
    /**
     * Sets the amount of given `value` in the collection to `amount`.
     * @param value - the value for which to set the amount
     * @param amount - the amount of values
     * @returns true if the data in the builder has changed
     * @note if amount <= 0, the value will be removed
     * @example
     * ```ts
     * const s = HashMultiSet.of(1, 2, 2).toBuilder()
     * s.setCount(1, 1)    // => false
     * s.setCount(1, 3)    // => true
     * ```
     */
    setCount(value: T, amount: number): boolean;
    /**
     * Changes the amount of given `value` in the builder according to the result of given `update`
     * function.
     * @param value - the value of which to update the amount
     * @param update - a function taking the current count and returning a new count.
     * @returns true if the data in the builder has changed
     *
     * @note if the given `value` does not exists, the `update` function is called with 0.
     * @note if the result of `update` is <= 0, the value will be removed (or not added)
     * @example
     * ```ts
     * const s = HashMultiSet.of(1, 2, 2).toBuilder()
     * s.modifyCount(3, v => v)      // => false
     * s.modifyCount(3, v => v + 1)  // => true
     * s.modifyCount(2, v => v + 1)  // => true
     * ```
     */
    modifyCount(value: T, update: (currentCount: number) => number): boolean;
    /**
     * Returns the amount of given `value` in the builder.
     * @param value - the value to look for
     * @example
     * ```ts
     * const s = HashMultiSet.of(1, 2, 2).toBuilder()
     * s.count(10)    // => 0
     * s.count(2)     // => 2
     * ```
     */
    count<U = T>(value: RelatedTo<T, U>): number;
    /**
     * Performs given function `f` for each value of the collection, using given `state` as initial traversal state.
     * @param f - the function to perform for each value, receiving:<br/>
     * - `value`: the next value<br/>
     * - `index`: the index of the value<br/>
     * - `halt`: a function that, if called, ensures that no new values are passed
     * @param options - (optional) an object containing the following properties:<br/>
     * - state: (optional) the traversal state
     * @throws RibuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while
     * looping over it
     * @example
     * ```ts
     * HashMultiSet.of(1, 2, 2, 3).toBuilder().forEach((entry, i, halt) => {
     *   console.log(entry)
     *   if (i >= 1) halt()
     * })
     * // => logs [1, 1]  [2, 2]
     * ```
     */
    forEach(
      f: (value: T, index: number, halt: () => void) => void,
      options?: { state?: TraverseState }
    ): void;
    /**
     * Returns an immutable instance containing the values in this builder.
     * @example
     * ```ts
     * const s = HashMultiSet.of(1, 2, 2).toBuilder()
     * const s2: HashMultiSet<number> = m.build()
     * ```
     */
    build(): WithElem<Tp, T>['normal'];
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends VariantMultiSetBase.Types {
    readonly normal: MultiSetBase<this['_T']>;
    readonly nonEmpty: MultiSetBase.NonEmpty<this['_T']>;
    readonly context: MultiSetBase.Context<this['_T']>;
    readonly builder: MultiSetBase.Builder<this['_T']>;
    readonly countMap: RMap<this['_T'], number>;
    readonly countMapNonEmpty: RMap.NonEmpty<this['_T'], number>;
    readonly countMapContext: RMap.Context<this['_T']>;
  }
}
