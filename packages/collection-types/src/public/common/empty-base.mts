import * as RimbuError from '@rimbu/base/rimbu-error';
import { type FastIterable, type FastIterator, Stream } from '@rimbu/stream';

/**
 * A shared base class for empty collection instances.
 *
 * It implements the common `Collection` API for the empty case and is reused
 * across different collection types.
 * All mutating-style operations return `this`, and all querying operations
 * return the empty value for their respective type.
 *
 * @sealed
 */
export abstract class EmptyBase {
  readonly _NonEmptyType: unknown;

  /**
   * Returns an empty iterator.
   */
  [Symbol.iterator](): FastIterator<any> {
    return Stream.empty()[Symbol.iterator]();
  }

  /**
   * Throws a `RimbuError.EmptyCollectionAssumedNonEmptyError`, since the
   * collection is empty.
   * @throws RimbuError.EmptyCollectionAssumedNonEmptyError
   */
  assumeNonEmpty(): never {
    RimbuError.throwEmptyCollectionAssumedNonEmptyError();
  }

  /**
   * Returns an empty `Stream`.
   */
  stream(): Stream<any> {
    return Stream.empty();
  }

  /**
   * Returns `0` for the size of the collection.
   */
  get size(): 0 {
    return 0;
  }

  /**
   * Returns `0` for the length of the collection.
   */
  get length(): 0 {
    return 0;
  }

  /**
   * Returns `true` since the collection is empty.
   */
  get isEmpty(): true {
    return true;
  }

  /**
   * Returns `false`, keeping the type narrowed to the empty variant.
   */
  nonEmpty(): this is this['_NonEmptyType'] {
    return false;
  }

  /**
   * Performs no action, since there are no elements.
   */
  forEach(): void {
    //
  }

  /**
   * Returns `this`, since filtering an empty collection is still empty.
   */
  filter(): any {
    return this;
  }

  /**
   * Returns `this`, since removing from an empty collection has no effect.
   */
  remove(): any {
    return this;
  }

  /**
   * Returns an empty array.
   */
  toArray(): [] {
    return [];
  }
}

/**
 * A shared base class for non-empty collection instances.
 *
 * It implements the common `Collection.NonEmpty` API and is reused across
 * different non-empty collection types.
 *
 * @typeparam E - the element type
 * @sealed
 */
export abstract class NonEmptyBase<E> implements FastIterable<E> {
  readonly _NonEmptyType: unknown;

  /**
   * Returns a non-empty `Stream` containing all elements of the collection.
   */
  abstract stream(): Stream.NonEmpty<E>;

  /**
   * Returns a fast iterator over the elements of the collection.
   */
  [Symbol.iterator](): FastIterator<E> {
    return (this.stream() as any)[Symbol.iterator]();
  }

  /**
   * Returns `false` since the collection is known to be non-empty.
   */
  get isEmpty(): false {
    return false;
  }

  /**
   * Returns `true` and instructs the compiler to treat the instance as non-empty.
   */
  nonEmpty(): this is this['_NonEmptyType'] {
    return true;
  }

  /**
   * Returns `this`, since the collection is already known to be non-empty.
   */
  assumeNonEmpty(): this {
    return this;
  }

  /**
   * Returns `this` typed as a possibly-empty collection type.
   */
  asNormal(): any {
    return this;
  }
}
