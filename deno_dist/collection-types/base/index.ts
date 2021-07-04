import { RimbuError } from '../../base/mod.ts';
import { FastIterable, FastIterator, Stream } from '../../stream/mod.ts';

/**
 * A utility type providing access to the element type T.
 */
export interface Elem<T = unknown> {
  readonly _T: T;
}

/**
 * A utility type to set the element type to given type T.
 */
export type WithElem<Tp, T> = Elem<T> & Tp;

/**
 * A utility type providing access to a key type K and value type V.
 */
export interface KeyValue<K = unknown, V = unknown> {
  readonly _K: K;
  readonly _V: V;
}

/**
 * A utility type to set the key type to given type K, and the value type to given type V.
 */
export type WithKeyValue<Tp, K, V> = Tp & KeyValue<K, V>;

/**
 * A utility type providing access to a row type R, a column type C, and a value type V.
 */
export interface Row<R = unknown, C = unknown, V = unknown> {
  readonly _R: R;
  readonly _C: C;
  readonly _V: V;
}

/**
 * A utility type to set the row type to given type R, the column type to given type C,
 * and the value type to given type V.
 */
export type WithRow<Tp, R, C, V> = Tp & Row<R, C, V>;

export abstract class EmptyBase {
  [Symbol.iterator](): FastIterator<any> {
    return Stream.empty()[Symbol.iterator]();
  }

  assumeNonEmpty(): never {
    RimbuError.throwEmptyCollectionAssumedNonEmptyError();
  }

  stream(): Stream<any> {
    return Stream.empty();
  }

  get size(): 0 {
    return 0;
  }

  get length(): 0 {
    return 0;
  }

  get isEmpty(): true {
    return true;
  }

  nonEmpty(): false {
    return false;
  }

  forEach(): void {
    //
  }

  filter(): any {
    return this;
  }

  remove(): any {
    return this;
  }

  toArray(): [] {
    return [];
  }
}

export abstract class NonEmptyBase<E> implements FastIterable<E> {
  abstract stream(): Stream.NonEmpty<E>;

  [Symbol.iterator](): FastIterator<E> {
    return this.stream()[Symbol.iterator]();
  }

  get isEmpty(): false {
    return false;
  }

  nonEmpty(): true {
    return true;
  }

  assumeNonEmpty(): this {
    return this;
  }

  asNormal(): any {
    return this;
  }
}
