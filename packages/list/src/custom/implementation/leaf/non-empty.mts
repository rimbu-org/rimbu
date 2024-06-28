import { RimbuError } from '@rimbu/base';
import { NonEmptyBase } from '@rimbu/collection-types/set-custom';
import {
  IndexRange,
  type ArrayNonEmpty,
  type CollectFun,
  type Comp,
  type OptLazy,
  type ToJSON,
  type TraverseState,
  type Update,
} from '@rimbu/common';
import type { FastIterator, Stream, StreamSource } from '@rimbu/stream';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';

import type { CacheMap, ListContext } from '@rimbu/list/custom';
import type { List } from '@rimbu/list';

export abstract class ListNonEmptyBase<T>
  extends NonEmptyBase<T>
  implements List.NonEmpty<T>
{
  abstract get context(): ListContext;
  abstract get length(): number;
  abstract stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
  abstract streamRange(
    range: IndexRange,
    options?: {
      reversed?: boolean;
    }
  ): Stream<T>;
  abstract forEach(
    f: (value: T, index: number, halt: () => void) => void,
    options?: { reversed?: boolean; state?: TraverseState }
  ): void;
  abstract get<O>(index: number, otherwise?: OptLazy<O>): T | O;
  abstract prepend(value: T): List.NonEmpty<T>;
  abstract append(value: T): List.NonEmpty<T>;
  abstract take(amount: number): List<T> | any;
  abstract drop(amount: number): List<T>;
  abstract concat<T2 = T>(
    ...sources: ArrayNonEmpty<StreamSource<T2>>
  ): List.NonEmpty<T | T2>;
  abstract updateAt(index: number, update: Update<T>): List.NonEmpty<T>;
  abstract mapPure<T2>(
    mapFun: (value: T) => T2,
    options?: {
      reversed?: boolean;
      cacheMap?: CacheMap;
    }
  ): List.NonEmpty<T2>;
  abstract map<T2>(
    mapFun: (value: T, index: number) => T2,
    options?: { reversed?: boolean }
  ): List.NonEmpty<T2>;
  abstract reversed(cache?: CacheMap): List.NonEmpty<T>;
  abstract toArray(options?: {
    range?: IndexRange | undefined;
    reversed?: boolean;
  }): T[] | any;
  abstract structure(): string;

  [Symbol.iterator](): FastIterator<T> {
    return this.stream()[Symbol.iterator]();
  }

  get isEmpty(): false {
    return false;
  }

  nonEmpty(): this is List.NonEmpty<T> {
    return true;
  }

  assumeNonEmpty(): this {
    return this;
  }

  asNormal(): this {
    return this;
  }

  first(): T {
    return this.get(0, RimbuError.throwInvalidStateError);
  }

  last(): T {
    return this.get(this.length - 1, RimbuError.throwInvalidStateError);
  }

  slice(range: IndexRange, options: { reversed?: boolean } = {}): List<T> {
    const { reversed = false } = options;

    const result = IndexRange.getIndicesFor(range, this.length);

    if (result === 'all') {
      if (reversed) return this.reversed();
      return this;
    }
    if (result === 'empty') return this.context.empty();

    const [start, end] = result;
    const values = this.drop(start).take(end - start + 1);

    if (!reversed) return values;
    return values.reversed();
  }

  sort(comp?: Comp<T>, options: { inverse?: boolean } = {}): List.NonEmpty<T> {
    const { inverse = false } = options;

    const compareFn =
      comp === undefined
        ? undefined
        : inverse
        ? (a: T, b: T): number => comp.compare(b, a)
        : comp.compare;
    const sortedArray = this.toArray().sort(compareFn);

    return this.context.from(sortedArray);
  }

  splice({
    index = 0,
    remove = 0,
    insert,
  }: {
    index?: number;
    remove?: number;
    insert?: StreamSource<T>;
  } = {}): List<T> | any {
    if (index < 0) {
      return this.splice({ index: this.length + index, remove, insert });
    }

    if (undefined === insert) {
      if (remove <= 0) return this;
      return this.take(index).concat(this.drop(index + remove));
    }

    if (remove <= 0 && isEmptyStreamSourceInstance(insert)) return this;

    return this.take(index).concat(insert, this.drop(index + remove));
  }

  insert(index: number, values: StreamSource<T>): List<T> | any {
    return this.splice({ index, insert: values });
  }

  remove(index: number, options: { amount?: number } = {}): List<T> {
    const { amount = 1 } = options;

    return this.splice({ index, remove: amount });
  }

  repeat(amount: number): List.NonEmpty<T> {
    if (amount <= -1) return this.reversed().repeat(-amount);
    if (amount <= 1) return this;

    const doubleTimes = amount >>> 1;
    const doubleResult = this.concat(this).repeat(doubleTimes);

    const remainTimes = amount % 2;
    if (remainTimes === 0) return doubleResult;
    return doubleResult.concat(this);
  }

  rotate(shiftRightAmount: number): List.NonEmpty<T> {
    let normalizedAmount = shiftRightAmount % this.length;

    if (normalizedAmount === 0) return this;

    if (normalizedAmount < 0) normalizedAmount += this.length;

    return this.take(-normalizedAmount)
      .concat(this.drop(-normalizedAmount))
      .assumeNonEmpty();
  }

  padTo(
    length: number,
    fill: T,
    options: { positionPercentage?: number } = {}
  ): List.NonEmpty<T> {
    const { positionPercentage = 0 } = options;

    if (this.length >= length) return this;

    const diff = length - this.length;
    const frac = Math.max(0, Math.min(100, positionPercentage)) / 100;
    const frontSize = Math.round(diff * frac);
    const pad = this.context.leafBlock([fill]).repeat(diff);
    return pad.splice({ index: frontSize, insert: this }).assumeNonEmpty();
  }

  filter(
    pred: (value: T, index: number, halt: () => void) => boolean,
    options: {
      range?: IndexRange | undefined;
      reversed?: boolean | undefined;
      negate?: boolean | undefined;
    } = {}
  ): any {
    const { range, reversed = false, negate = false } = options;

    const stream =
      undefined === range
        ? this.stream({ reversed })
        : this.streamRange(range, { reversed });

    const result: List<T> = this.context.from(stream.filter(pred, { negate }));

    if (result.length !== this.length) {
      return result;
    }

    return this;
  }

  collect<T2>(
    collectFun: CollectFun<T, T2>,
    options: {
      range?: IndexRange;
      reversed?: boolean;
    } = {}
  ): List<T2> {
    const { range, reversed = false } = options;

    const stream =
      undefined === range
        ? this.stream({ reversed })
        : this.streamRange(range, { reversed });

    return this.context.from(stream.collect(collectFun));
  }

  flatMap<T2>(
    flatMapFun: (value: T, index: number) => StreamSource<T2>,
    options: {
      range?: IndexRange | undefined;
      reversed?: boolean;
    } = {}
  ): List<T2> | any {
    const { range, reversed = false } = options;

    let result = this.context.empty<T2>();

    const stream =
      undefined === range
        ? this.stream({ reversed })
        : this.streamRange(range, { reversed });
    const iterator = stream[Symbol.iterator]();

    let index = 0;
    const done = Symbol('Done');
    let value: T | typeof done;

    while (done !== (value = iterator.fastNext(done))) {
      result = result.concat(flatMapFun(value, index++));
    }

    return result;
  }

  toBuilder(): List.Builder<T> {
    return this.context.createBuilder<T>(this);
  }

  toString(): string {
    return this.stream().join({ start: 'List(', sep: ', ', end: ')' });
  }

  toJSON(): ToJSON<T[], this['context']['typeTag']> {
    return {
      dataType: this.context.typeTag,
      value: this.toArray(),
    };
  }
}
