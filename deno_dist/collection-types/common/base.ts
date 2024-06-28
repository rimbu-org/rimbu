import { RimbuError } from '../../base/mod.ts';
import { type FastIterable, type FastIterator, Stream } from '../../stream/mod.ts';

export abstract class EmptyBase {
  readonly _NonEmptyType: unknown;

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

  nonEmpty(): this is this['_NonEmptyType'] {
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
  readonly _NonEmptyType: unknown;

  abstract stream(): Stream.NonEmpty<E>;

  [Symbol.iterator](): FastIterator<E> {
    return (this.stream() as any)[Symbol.iterator]();
  }

  get isEmpty(): false {
    return false;
  }

  nonEmpty(): this is this['_NonEmptyType'] {
    return true;
  }

  assumeNonEmpty(): this {
    return this;
  }

  asNormal(): any {
    return this;
  }
}
