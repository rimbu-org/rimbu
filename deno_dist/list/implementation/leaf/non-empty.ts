import { RimbuError } from '../../../base/mod.ts';
import { CustomBase } from '../../../collection-types/mod.ts';
import {
  ArrayNonEmpty,
  CollectFun,
  IndexRange,
  OptLazy,
  ToJSON,
  TraverseState,
  Update,
} from '../../../common/mod.ts';
import { FastIterator, Stream, StreamSource } from '../../../stream/mod.ts';
import type { List } from '../../internal.ts';
import type { CacheMap, ListContext } from '../../list-custom.ts';

const _emptyObject = {};

export abstract class ListNonEmptyBase<T>
  extends CustomBase.NonEmptyBase<T>
  implements List.NonEmpty<T>
{
  abstract get context(): ListContext;
  abstract get length(): number;
  abstract stream(reversed?: boolean): Stream.NonEmpty<T>;
  abstract streamRange(range: IndexRange, reversed?: boolean): Stream<T>;
  abstract forEach(
    f: (value: T, index: number, halt: () => void) => void,
    traverseState?: TraverseState
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
    reversed?: boolean,
    cacheMap?: CacheMap
  ): List.NonEmpty<T2>;
  abstract map<T2>(
    mapFun: (value: T, index: number) => T2,
    reversed?: boolean
  ): List.NonEmpty<T2>;
  abstract reversed(cache?: CacheMap): List.NonEmpty<T>;
  abstract toArray(range?: IndexRange, reversed?: boolean): T[] | any;
  abstract structure(): string;

  [Symbol.iterator](): FastIterator<T> {
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

  asNormal(): this {
    return this;
  }

  first(): T {
    return this.get(0, RimbuError.throwInvalidStateError);
  }

  last(): T {
    return this.get(this.length - 1, RimbuError.throwInvalidStateError);
  }

  slice(range: IndexRange, reversed: boolean): List<T> {
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

  splice({
    index = 0,
    remove = 0,
    insert,
  }: {
    index?: number;
    remove?: number;
    insert?: StreamSource<T>;
  } = _emptyObject): List<T> | any {
    if (index < 0) {
      return this.splice({ index: this.length + index, remove, insert });
    }

    if (undefined === insert) {
      if (remove <= 0) return this;
      return this.take(index).concat(this.drop(index + remove));
    }

    if (remove <= 0 && StreamSource.isEmptyInstance(insert)) return this;

    return this.take(index).concat(insert, this.drop(index + remove));
  }

  insert(index: number, values: StreamSource<T>): List<T> | any {
    return this.splice({ index, insert: values });
  }

  remove(index: number, amount = 1): List<T> {
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

  padTo(length: number, fill: T, positionPercentage = 0): List.NonEmpty<T> {
    if (this.length >= length) return this;

    const diff = length - this.length;
    const frac = Math.max(0, Math.min(100, positionPercentage)) / 100;
    const frontSize = Math.round(diff * frac);
    const pad = this.context.leafBlock([fill]).repeat(diff);
    return pad.splice({ index: frontSize, insert: this }).assumeNonEmpty();
  }

  filter(
    pred: (value: T, index: number, halt: () => void) => boolean,
    range?: IndexRange,
    reversed = false
  ): List<T> {
    const stream =
      undefined === range
        ? this.stream(reversed)
        : this.streamRange(range, reversed);

    const result: List<T> = this.context.from(stream.filter(pred));

    if (result.length !== this.length) return result;
    if (!reversed) return this;
    return this.reversed();
  }

  collect<T2>(
    collectFun: CollectFun<T, T2>,
    range?: IndexRange,
    reversed = false
  ): List<T2> {
    const stream =
      undefined === range
        ? this.stream(reversed)
        : this.streamRange(range, reversed);

    return this.context.from(stream.collect(collectFun));
  }

  flatMap<T2>(
    flatMapFun: (value: T, index: number) => StreamSource<T2>,
    range?: IndexRange,
    reversed = false
  ): List<T2> | any {
    let result = this.context.empty<T2>();

    const stream =
      undefined === range
        ? this.stream(reversed)
        : this.streamRange(range, reversed);
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
