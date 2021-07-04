import type {
  ArrayNonEmpty,
  RelatedTo,
  ToJSON,
  TraverseState,
} from '../../common/mod.ts';
import { FastIterable, Stream, Streamable, StreamSource } from '../../stream/mod.ts';
import type { Elem, WithElem } from '../custom-base.ts';

export interface VariantSetBase<
  T,
  Tp extends VariantSetBase.Types = VariantSetBase.Types
> extends FastIterable<T> {
  /**
   * Returns the number of values in the collecction.
   */
  readonly size: number;
  /**
   * Returns true if the collection is empty.
   */
  readonly isEmpty: boolean;
  /**
   * Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection
   * as a .NonEmpty type.
   * @example
   * const m: HashSet<number> = HashSet.of(1, 2, 2)
   * m.stream().first(0)     // compiler allows fallback value since the Stream may be empty
   * if (m.nonEmpty()) {
   *   m.stream().first(0)   // compiler error: fallback value not allowed since Stream is not empty
   * }
   */
  nonEmpty(): this is WithElem<Tp, T>['nonEmpty'];
  /**
   * Returns the same collection typed as non-empty.
   * @throws `RimbuError.EmptyCollectionAssumedNonEmptyError` if the collection is empty
   * @example
   * HashSet.empty().assumeNonEmpty()          // => throws RimbuError.EmptyCollectionAssumedNonEmptyError
   * HashSet.from([[0, 1]]).assumeNonEmpty()   // => List.NonEmpty(0, 1, 2)
   */
  assumeNonEmpty(): WithElem<Tp, T>['nonEmpty'];
  /**
   * Returns a Stream containing all elements of this collection.
   * @example
   * HashSet.of(1, 2, 3).stream().toArray()   // => [1, 2, 3]
   */
  stream(): Stream<T>;
  /**
   * Returns true if given `value` is in the collection.
   * @param value - the value to look for
   * @example
   * HashSet.of(1, 2, 3).has(2)  // => true
   * HashSet.of(1, 2, 3).has(10) // => false
   */
  has<U = T>(value: RelatedTo<T, U>): boolean;
  /**
   * Returns the collection with given `value` removed.
   * @param value - the value to remove
   * @example
   * const s = HashSet.of(1, 2, 3)
   * s.remove(2).toArray()   // => [1, 3]
   * s.remove(10).toArray()  // => [1, 2, 3]
   */
  remove<U = T>(value: RelatedTo<T, U>): WithElem<Tp, T>['normal'];
  /**
   * Returns the collection with all values in the given `values` `StreamSource` removed.
   * @param values - a `StreamSource` containing values to remove
   * @example
   * HashSet.of(1, 2, 3).removeAll([1, 3]).toArray()
   * // => [2]
   */
  removeAll<U = T>(
    values: StreamSource<RelatedTo<T, U>>
  ): WithElem<Tp, T>['normal'];
  /**
   * Performs given function `f` for each value of the collection, using given `state` as initial traversal state.
   * @param f - the function to perform for each element, receiving:
   * * `value`: the next element
   * * `index`: the index of the element
   * * `halt`: a function that, if called, ensures that no new elements are passed
   * @param state - (optional) the traverse state
   * @example
   * HashSet.of(1, 2, 3).forEach((value, i, halt) => {
   *  console.log([value, i]);
   *  if (i >= 1) halt();
   * })
   * // => logs [1, 0]  [2, 1]
   * @note O(N)
   */
  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state?: TraverseState
  ): void;
  /**
   * Returns a collection containing only those entries that satisfy given `pred` predicate.
   * @param pred - a predicate function receiving:
   * * `value`: the next value
   * * `index`: the entry index
   * * `halt`: a function that, when called, ensures no next elements are passed
   * @example
   * HashSet.of(1, 2, 3).filter(value < 3).toArray()
   * // => [1, 2]
   */
  filter(
    pred: (value: T, index: number, halt: () => void) => boolean
  ): WithElem<Tp, T>['normal'];
  /**
   * Returns a collection where each value of given `other` `StreamSource` is removed from this collection.
   * @param other - a `StreamSource` containing values
   * @example
   * HashSet.of(1, 2, 3).difference(HashSet.of(1, 3)).toArray()  // => [2]
   */
  difference<U = T>(
    other: StreamSource<RelatedTo<T, U>>
  ): WithElem<Tp, T>['normal'];
  /**
   * Returns a collection containing values that are both in this collection, and in the given `other` `StreamSource`.
   * @param other - a `StreamSource` containing values
   * @example
   * HashSet.of(1, 2, 3).interface(HashSet.of(1, 3)).toArray()   // => [1, 3]
   */
  intersect<U = T>(
    other: StreamSource<RelatedTo<T, U>>
  ): WithElem<Tp, T>['normal'];
  /**
   * Returns an array containing all values in this collection.
   * @example
   * HashSet.of(1, 2, 3).toArray()   // => [1, 2, 3]
   * @note O(log(N))
   * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
   */
  toArray(): T[];
  /**
   * Returns a string representation of this collection.
   * @example
   * HashSet.of(1, 2, 3).toString()   // => HashSet(1, 2, 3)
   */
  toString(): string;
  /**
   * Returns a JSON representation of this collection.
   * @example
   * HashSet.of(1, 2, 3).toJSON()   // => { dataType: 'HashSet', value: [1, 2, 3] }
   */
  toJSON(): ToJSON<T[]>;
}

export namespace VariantSetBase {
  export interface NonEmpty<
    T,
    Tp extends VariantSetBase.Types = VariantSetBase.Types
  > extends VariantSetBase<T, Tp>,
      Streamable.NonEmpty<T> {
    /**
     * Returns false since this collection is known to be non-empty
     * @example
     * HashSet.of(1, 2, 3).isEmpty   // => false
     */
    readonly isEmpty: false;
    /**
     * Returns true since this collection is know to be non-empty
     * @example
     * HashSet.of(1, 2, 3).nonEmpty()   // => true
     */
    nonEmpty(): true;
    /**
     * Returns a self reference since this collection is known to be non-empty.
     * @example
     * const m = HashSet.of(1, 2, 3);
     * m === m.assumeNonEmpty()  // => true
     */
    assumeNonEmpty(): this;
    /**
     * Returns this collection typed as a 'possibly empty' collection.
     * @example
     * HashSet.of(1, 2).asNormal();  // type: HashSet<number>
     */
    asNormal(): WithElem<Tp, T>['normal'];
    /**
     * Returns a non-empty Stream containing all values of this collection.
     * @example
     * HashSet.of(1, 2, 3).stream().toArray()   // => [1, 2, 3]
     */
    stream(): Stream.NonEmpty<T>;
    /**
     * Returns a non-empty array containing all values in this collection.
     * @example
     * HashSet.of(1, 2, 3).toArray()   // => [1, 2, 3]
     * @note O(log(N))
     * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
     */
    toArray(): ArrayNonEmpty<T>;
  }

  export interface Types extends Elem {
    normal: VariantSetBase<this['_T']>;
    nonEmpty: VariantSetBase.NonEmpty<this['_T']>;
  }
}

export interface RSetBase<T, Tp extends RSetBase.Types = RSetBase.Types>
  extends VariantSetBase<T, Tp> {
  /**
   * Returns the `context` associated to this collection instance.
   */
  readonly context: WithElem<Tp, T>['context'];
  /**
   * Returns the collection with given `value` added.
   * @param value - the value to add
   * @example
   * HashSet.of(1, 2, 3).add(10).toArray()   // => [1, 2, 3, 10]
   */
  add: (value: T) => WithElem<Tp, T>['nonEmpty'];
  /**
   * Returns the collection with the values in given `values` `StreamSource` added.
   * @param values - a `StreamSource` containing values to add
   * @example
   * HashSet.of(1, 2, 3).addAll(10, 11).toArray()   // => [1, 2, 3, 10, 11]
   */
  addAll: {
    (values: StreamSource.NonEmpty<T>): WithElem<Tp, T>['nonEmpty'];
    (values: StreamSource<T>): WithElem<Tp, T>['normal'];
  };
  /**
   * Returns a collection containing all values from this collection and all values of given
   * `other` `StreamSource`.
   * @param other - a `StreamSource` containing values
   * @example
   * HashSet.of(1, 2, 3).union(HashSet.of(2, 4, 6)).toArray()
   * // => [1, 2, 3, 4, 6]
   */
  union: {
    (other: StreamSource.NonEmpty<T>): WithElem<Tp, T>['nonEmpty'];
    (other: StreamSource<T>): WithElem<Tp, T>['normal'];
  };
  /**
   * Returns a collection of the values that are either in this collection or in the `other` `StreamSource`, but
   * not in both.
   * @param other - a `StreamSource` containing values
   * @example
   * HashSet.of(1, 2, 3).symDifference([2, 4]).toArray()
   * // => [1, 3, 4]
   */
  symDifference: (other: StreamSource<T>) => WithElem<Tp, T>['normal'];
  /**
   * Returns a builder object containing the values of this collection.
   * @example
   * const builder: HashSet.Builder<number> = HashSet.of(1, 2, 3).toBuilder()
   */
  toBuilder: () => WithElem<Tp, T>['builder'];
}

export namespace RSetBase {
  type NonEmptyBase<T, Tp extends RSetBase.Types> = VariantSetBase.NonEmpty<
    T,
    Tp
  > &
    RSetBase<T, Tp>;

  export interface NonEmpty<T, Tp extends RSetBase.Types = RSetBase.Types>
    extends NonEmptyBase<T, Tp>,
      Streamable.NonEmpty<T> {
    /**
     * Returns a non-empty Stream containing all values of this collection.
     * @example
     * HashSet.of(1, 2, 3).stream().toArray()   // => [1, 2, 3]
     */
    stream(): Stream.NonEmpty<T>;
    /**
     * Returns the collection with given `value` added.
     * @param value - the value to add
     * @example
     * HashSet.of(1, 2, 3).add(10).toArray()   // => [1, 2, 3, 10]
     */
    add: (value: T) => WithElem<Tp, T>['nonEmpty'];
    /**
     * Returns the collection with the values in given `values` `StreamSource` added.
     * @param values - a `StreamSource` containing values to add
     * @example
     * HashSet.of(1, 2, 3).addAll(10, 11).toArray()   // => [1, 2, 3, 10, 11]
     */
    addAll: (values: StreamSource<T>) => WithElem<Tp, T>['nonEmpty'];
    /**
     * Returns a collection containing all values from this collection and all values of given
     * `other` `StreamSource`.
     * @param other - a `StreamSource` containing values
     * @example
     * HashSet.of(1, 2, 3).union(HashSet.of(2, 4, 6)).toArray()
     * // => [1, 2, 3, 4, 6]
     */
    union: (other: StreamSource<T>) => WithElem<Tp, T>['nonEmpty'];
  }

  export interface Context<UT, Tp extends RSetBase.Types = RSetBase.Types> {
    /**
     * A string tag defining the specific collection type
     * @example
     * HahsSet.defaultContext().typeTag   // => 'HashSet'
     */
    readonly typeTag: string;

    readonly _types: Tp;

    /**
     * Returns true if given `value` could be a valid value in this Context.
     * @param value - the object to check
     * @example
     * HashSet.defaultContext().isValidValue(1)   // => true
     */
    isValidValue: (value: any) => value is UT;
    /**
     * Returns the (singleton) empty instance of this type and context with given value type.
     * @example
     * HashSet.empty<number>()    // => HashSet<number>
     * HashSet.empty<string>()    // => HashSet<string>
     */
    empty: <T extends UT>() => WithElem<Tp, T>['normal'];
    /**
     * Returns an immutable set of this type and context, containing the given `values`.
     * @param values - a non-empty array of values
     * @example
     * HashSet.of(1, 2, 3).toArray()   // => [1, 2, 3]
     */
    of: <T extends UT>(
      ...values: ArrayNonEmpty<T>
    ) => WithElem<Tp, T>['nonEmpty'];
    /**
     * Returns an immutable set of this collection type and context, containing the given values in `source`.
     * @param sources - an array of `StreamSource` instances containing values
     * @example
     * HashSet.from([1, 2, 3], [4, 5])   // => HashSet.NonEmpty<number>
     */
    from: {
      <T extends UT>(
        ...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
      ): WithElem<Tp, T>['nonEmpty'];
      <T extends UT>(...sources: ArrayNonEmpty<StreamSource<T>>): WithElem<
        Tp,
        T
      >['normal'];
    };
    /**
     * Returns an empty builder instance for this type of collection and context.
     * @example
     * HashSet.builder<number>()     // => HashSet.Builder<number>
     */
    builder: <T extends UT>() => WithElem<Tp, T>['builder'];
  }

  export interface Builder<T, Tp extends RSetBase.Types = RSetBase.Types> {
    /**
     * Returns the amount of values in the builder.
     * @example
     * HashSet.of(1, 2, 3).toBuilder().size
     * // => 3
     */
    readonly size: number;
    /**
     * Returns true if there are no values in the builder.
     * @example
     * HashSet.of(1, 2, 3).toBuilder().isEmpty
     * // => false
     */
    readonly isEmpty: boolean;
    /**
     * Returns true if the given `value` is present in the builder.
     * @param value - the value to look for
     * @example
     * const s = HashSet.of(1, 2, 3).toBuilder()
     * s.has(2)   // => true
     * s.has(10)  // => false
     */
    has<U = T>(value: RelatedTo<T, U>): boolean;
    /**
     * Adds given `value` to the builder.
     * @param value - the value to add
     * @returns true if the data in the builder has changed
     * @example
     * const s = HashSet.of(1, 2, 3).toBuilder()
     * s.add(2)   // => false
     * s.add(10)  // => true
     */
    add: (value: T) => boolean;
    /**
     * Adds the values in given `values` `StreamSource` to the builder.
     * @param values - the values to add
     * @returns true if the data in the builder has changed
     * @example
     * const s = HashSet.of(1, 2, 3).toBuilder()
     * s.addAll([1, 3])   // => false
     * s.addAll([2, 10])  // => true
     */
    addAll: (values: StreamSource<T>) => boolean;
    /**
     * Remove the given `value` from the builder.
     * @param value - the value to remove
     * @returns true if the data in the builder has changed
     * @example
     * const s = HashSet.of(1, 2, 3).toBuilder()
     * s.remove(10)  // => false
     * s.remove(2)   // => true
     */
    remove<U = T>(value: RelatedTo<T, U>): boolean;
    /**
     * Removes the values in given `values` `StreamSource` from this builder.
     * @param values - a `StreamSource` of values
     * const s = HashSet.of(1, 2, 3).toBuilder()
     * s.removeAll([1, 3])   // => false
     * s.removeAll([2, 10])  // => true
     */
    removeAll<U = T>(values: StreamSource<RelatedTo<T, U>>): boolean;
    /**
     * Performs given function `f` for each value of the builder.
     * @param f - the function to perform for each element, receiving:
     * * `value`: the next element
     * * `index`: the index of the element
     * * `halt`: a function that, if called, ensures that no new elements are passed
     * @throws RibuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while
     * looping over it
     * @example
     * HashSet.of(1, 2, 3).toBuilder.forEach((value, i, halt) => {
     *  console.log([value, i]);
     *  if (i >= 1) halt();
     * })
     * // => logs [1, 0]  [2, 1]
     * @note O(N)
     */
    forEach(
      f: (value: T, index: number, halt: () => void) => void,
      state?: TraverseState
    ): void;
    /**
     * Returns an immutable instance containing the values in this builder.
     * @example
     * const s = HashSet.of(1, 2, 3).toBuilder()
     * const s2: HashSet<number> = m.build()
     */
    build: () => WithElem<Tp, T>['normal'];
  }

  export interface Types extends VariantSetBase.Types {
    normal: RSetBase<this['_T']>;
    nonEmpty: RSetBase.NonEmpty<this['_T']>;
    context: RSetBase.Context<this['_T']>;
    builder: RSetBase.Builder<this['_T']>;
    limitElem: true;
  }

  export abstract class ContextBase<
    UT,
    Tp extends RSetBase.Types = RSetBase.Types
  > implements RSetBase.Context<UT, Tp>
  {
    abstract readonly typeTag: string;
    abstract readonly _empty: (Tp & Elem<any>)['normal'];

    abstract isValidValue(value: any): value is UT;
    abstract isNonEmptyInstance<T>(
      source: any
    ): source is WithElem<Tp, T>['nonEmpty'];
    abstract builder<T extends UT>(): WithElem<Tp, T>['builder'];

    get _types(): Tp {
      return undefined as any;
    }

    empty = <T extends UT>(): WithElem<Tp, T>['normal'] => {
      return this._empty;
    };

    from: any = <T extends UT>(
      ...sources: ArrayNonEmpty<StreamSource<T>>
    ): WithElem<Tp, T>['normal'] => {
      let builder = this.builder<T>();

      let i = -1;
      const length = sources.length;

      while (++i < length) {
        const source = sources[i];

        if (StreamSource.isEmptyInstance(source)) continue;

        if (
          builder.isEmpty &&
          this.isNonEmptyInstance<T>(source) &&
          source.context === this
        ) {
          if (i === length - 1) return source;
          builder = source.toBuilder();
          continue;
        }

        builder.addAll(source);
      }

      return builder.build();
    };

    of = <T>(
      ...values: ArrayNonEmpty<T>
    ): T extends UT ? WithElem<Tp, T>['nonEmpty'] : never => {
      return this.from(values);
    };
  }
}
