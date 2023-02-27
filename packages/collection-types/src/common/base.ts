import { Instances, RimbuError } from '@rimbu/base';
import { FastIterable, FastIterator, Stream } from '@rimbu/stream';

export abstract class EmptyBase {
  get [Instances.instanceTypeTag](): symbol {
    return Instances.immutableInstanceIndicator;
  }

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

  get [Instances.instanceTypeTag](): symbol {
    return Instances.immutableInstanceIndicator;
  }

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
