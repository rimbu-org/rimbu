import { Token } from '@rimbu/base';
import { CollectFun, Eq, OptLazy, Reducer, TraverseState } from '@rimbu/common';

import type { FastIterator, Stream, StreamSource } from '#stream/main';
import type { StreamSourceHelpers } from '#stream/custom';

export const fixedDoneIteratorResult: IteratorResult<any> = Object.freeze({
  done: true,
  value: undefined,
});

export const emptyFastIterator: FastIterator<any> = Object.freeze({
  fastNext<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  },
  next(): IteratorResult<any> {
    return fixedDoneIteratorResult;
  },
});

export function isFastIterator<T>(
  iterator: Iterator<T>
): iterator is FastIterator<T> {
  return `fastNext` in iterator;
}

/**
 * A base class for `FastIterator` instances, that takes implements the default `next`
 * function based on the abstract `fastNext` function.
 */
export abstract class FastIteratorBase<T> implements FastIterator<T> {
  abstract fastNext<O>(otherwise?: OptLazy<O>): T | O;

  next(): IteratorResult<T> {
    const done = Symbol('Done');
    const value = this.fastNext(done);
    if (done === value) return fixedDoneIteratorResult;
    return { value, done: false };
  }
}

export class FlatMapIterator<T, T2> extends FastIteratorBase<T2> {
  iterator: FastIterator<T>;

  constructor(
    readonly source: Stream<T>,
    readonly flatMapFun: (
      value: T,
      index: number,
      halt: () => void
    ) => StreamSource<T2>,
    readonly streamSourceHelpers: StreamSourceHelpers
  ) {
    super();
    this.iterator = this.source[Symbol.iterator]();
  }

  readonly state = TraverseState();

  done = false;
  currentIterator: null | FastIterator<T2> = null;

  fastNext<O>(otherwise?: OptLazy<O>): T2 | O {
    const state = this.state;

    if (state.halted || this.done) return OptLazy(otherwise) as O;

    const done = Symbol('Done');

    let nextValue: T2 | typeof done;

    while (
      null === this.currentIterator ||
      done === (nextValue = this.currentIterator.fastNext(done))
    ) {
      const nextIter = this.iterator.fastNext(done);

      if (done === nextIter) {
        this.done = true;
        return OptLazy(otherwise) as O;
      }

      const nextSource = this.flatMapFun(
        nextIter,
        state.nextIndex(),
        state.halt
      );

      this.currentIterator = this.streamSourceHelpers
        .fromStreamSource(nextSource)
        [Symbol.iterator]();
    }

    return nextValue;
  }
}

export class ConcatIterator<T> extends FastIteratorBase<T> {
  iterator: FastIterator<T>;

  constructor(
    readonly source: Stream<T>,
    readonly otherSources: StreamSource<T>[],
    readonly streamSourceHelpers: StreamSourceHelpers
  ) {
    super();

    this.iterator = source[Symbol.iterator]();
  }

  sourceIndex = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');
    let value: T | typeof done;
    const length = this.otherSources.length;
    const { streamSourceHelpers } = this;

    while (done === (value = this.iterator.fastNext(done))) {
      if (this.sourceIndex >= length) return OptLazy(otherwise) as O;

      let nextSource: StreamSource<T> = this.otherSources[this.sourceIndex++];

      while (streamSourceHelpers.isEmptyStreamSourceInstance(nextSource)) {
        if (this.sourceIndex >= length) return OptLazy(otherwise) as O;
        nextSource = this.otherSources[this.sourceIndex++];
      }

      this.iterator = streamSourceHelpers
        .fromStreamSource(nextSource)
        [Symbol.iterator]();
    }

    return value;
  }
}

export class FilterIterator<T> extends FastIteratorBase<T> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T, index: number, halt: () => void) => boolean,
    readonly invert: boolean
  ) {
    super();
  }

  readonly state = TraverseState();

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const state = this.state;
    if (state.halted) return OptLazy(otherwise) as O;

    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const pred = this.pred;
    const halt = state.halt;

    if (this.invert) {
      while (!state.halted && done !== (value = source.fastNext(done))) {
        if (!pred(value, state.nextIndex(), halt)) return value;
      }
    } else {
      while (!state.halted && done !== (value = source.fastNext(done))) {
        if (pred(value, state.nextIndex(), halt)) return value;
      }
    }

    return OptLazy(otherwise) as O;
  }
}

export class FilterPureIterator<
  T,
  A extends readonly unknown[]
> extends FastIteratorBase<T> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T, ...args: A) => boolean,
    readonly args: A,
    readonly invert: boolean
  ) {
    super();
  }

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const pred = this.pred;
    const args = this.args;

    if (this.invert) {
      while (done !== (value = source.fastNext(done))) {
        if (!pred(value, ...args)) return value;
      }
    } else {
      while (done !== (value = source.fastNext(done))) {
        if (pred(value, ...args)) return value;
      }
    }

    return OptLazy(otherwise) as O;
  }
}

export class CollectIterator<T, R> extends FastIteratorBase<R> {
  constructor(
    readonly source: FastIterator<T>,
    readonly collectFun: CollectFun<T, R>
  ) {
    super();
  }

  readonly state = TraverseState();

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    const state = this.state;
    if (state.halted) return OptLazy(otherwise) as O;

    const { halt } = state;

    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const collectFun = this.collectFun;

    while (!state.halted && done !== (value = source.fastNext(done))) {
      const result = collectFun(
        value,
        state.nextIndex(),
        CollectFun.Skip,
        halt
      );
      if (CollectFun.Skip === result) continue;

      return result as R;
    }

    return OptLazy(otherwise as O);
  }
}

export class IndicesWhereIterator<T> extends FastIteratorBase<number> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T) => boolean
  ) {
    super();
  }

  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): number | O {
    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const pred = this.pred;

    while (done !== (value = source.fastNext(done))) {
      if (pred(value)) return this.index++;
      this.index++;
    }

    return OptLazy(otherwise) as O;
  }
}

export class IndicesOfIterator<T> extends FastIteratorBase<number> {
  constructor(
    readonly source: FastIterator<T>,
    readonly searchValue: T,
    readonly eq: Eq<T>
  ) {
    super();
  }

  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): number | O {
    const done = Symbol('Done');
    let value: T | typeof done;
    const source = this.source;
    const searchValue = this.searchValue;
    const eq = this.eq;

    while (done !== (value = source.fastNext(done))) {
      if (eq(searchValue, value)) return this.index++;
      this.index++;
    }

    return OptLazy(otherwise) as O;
  }
}

export class TakeWhileIterator<T> extends FastIteratorBase<T> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T, index: number) => boolean
  ) {
    super();
  }

  isDone = false;
  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');
    if (this.isDone) return OptLazy(otherwise) as O;

    const next = this.source.fastNext(done);

    if (done === next) {
      this.isDone = true;
      return OptLazy(otherwise) as O;
    }

    if (this.pred(next, this.index++)) return next;

    this.isDone = true;
    return OptLazy(otherwise) as O;
  }
}

export class DropWhileIterator<T> extends FastIteratorBase<T> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T, index: number) => boolean
  ) {
    super();
  }

  pass = false;
  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const source = this.source;
    if (this.pass) return source.fastNext(otherwise!);

    const done = Symbol('Done');
    let value: T | typeof done;

    while (done !== (value = source.fastNext(done))) {
      this.pass = !this.pred(value, this.index++);
      if (this.pass) return value;
    }

    return OptLazy(otherwise) as O;
  }
}

export class TakeIterator<T> extends FastIteratorBase<T> {
  constructor(readonly source: FastIterator<T>, readonly amount: number) {
    super();
  }

  i = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    if (this.i++ >= this.amount) return OptLazy(otherwise) as O;

    return this.source.fastNext(otherwise!);
  }
}

export class DropIterator<T> extends FastIteratorBase<T> {
  remain: number;

  constructor(readonly source: FastIterator<T>, readonly amount: number) {
    super();

    this.remain = amount;
  }

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const source = this.source;
    if (this.remain <= 0) return source.fastNext(otherwise!);

    const done = Symbol('Done');
    let value: T | typeof done;

    while (done !== (value = source.fastNext(done))) {
      if (this.remain-- <= 0) return value;
    }

    return OptLazy(otherwise) as O;
  }
}

export class RepeatIterator<T> extends FastIteratorBase<T> {
  iterator: FastIterator<T>;
  remain: number | undefined;

  constructor(readonly source: Stream<T>, readonly amount?: number) {
    super();

    this.iterator = source[Symbol.iterator]();
    this.remain = amount;
  }

  isEmpty = true;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');
    let value = this.iterator.fastNext(done);

    if (done !== value) {
      this.isEmpty = false;
      return value;
    }

    if (this.isEmpty) return OptLazy(otherwise) as O;

    if (undefined !== this.remain) {
      this.remain--;

      if (this.remain <= 0) return OptLazy(otherwise) as O;
    }

    this.iterator = this.source[Symbol.iterator]();
    value = this.iterator.fastNext(done);
    if (done === value) return OptLazy(otherwise) as O;

    return value;
  }
}

export class IntersperseIterator<T> extends FastIteratorBase<T> {
  constructor(readonly source: FastIterator<T>, readonly sepStream: Stream<T>) {
    super();
  }

  sepIterator: FastIterator<T> | undefined;
  nextValue!: T;
  isInitialized = false;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');

    if (undefined !== this.sepIterator) {
      const sepNext = this.sepIterator.fastNext(done);
      if (done !== sepNext) return sepNext;
      this.sepIterator = undefined;
    }

    if (this.isInitialized) {
      const newNextValue = this.source.fastNext(done);
      if (done === newNextValue) {
        this.isInitialized = false;
        return this.nextValue;
      }
      const currentNextValue = this.nextValue;
      this.nextValue = newNextValue;
      this.sepIterator = this.sepStream[Symbol.iterator]();
      return currentNextValue;
    }

    const nextValue = this.source.fastNext(done);
    if (done === nextValue) return OptLazy(otherwise) as O;

    const newNextValue = this.source.fastNext(done);
    if (done === newNextValue) return nextValue;

    this.nextValue = newNextValue;
    this.isInitialized = true;
    this.sepIterator = this.sepStream[Symbol.iterator]();
    return nextValue;
  }
}

export class SplitWhereIterator<T> extends FastIteratorBase<T[]> {
  constructor(
    readonly source: FastIterator<T>,
    readonly pred: (value: T, index: number) => boolean
  ) {
    super();
  }

  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T[] | O {
    const result: T[] = [];

    const source = this.source;
    const done = Symbol('Done');
    let value: T | typeof done;
    const pred = this.pred;

    const startIndex = this.index;

    while (done !== (value = source.fastNext(done))) {
      if (pred(value, this.index++)) return result;
      result.push(value);
    }

    if (startIndex === this.index) return OptLazy(otherwise) as O;

    return result;
  }
}

export class SplitOnIterator<T> extends FastIteratorBase<T[]> {
  constructor(
    readonly source: FastIterator<T>,
    readonly sepElem: T,
    readonly eq: Eq<T>
  ) {
    super();
  }

  fastNext<O>(otherwise?: OptLazy<O>): T[] | O {
    const result: T[] = [];

    const source = this.source;
    const done = Symbol('Done');
    let value: T | typeof done;
    let processed = false;
    const eq = this.eq;
    const sepElem = this.sepElem;

    while (done !== (value = source.fastNext(done))) {
      processed = true;
      if (eq(value, sepElem)) return result;
      result.push(value);
    }

    if (!processed) return OptLazy(otherwise) as O;

    return result;
  }
}

export class ReduceIterator<I, R> extends FastIteratorBase<R> {
  state: unknown;

  constructor(
    readonly source: FastIterator<I>,
    readonly reducer: Reducer<I, R>
  ) {
    super();

    this.state = OptLazy(reducer.init);
  }

  halted = false;
  index = 0;

  halt = (): void => {
    this.halted = true;
  };

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    if (this.halted) return OptLazy(otherwise) as O;
    const done = Symbol('Done');
    const value = this.source.fastNext(done);

    if (done === value) return OptLazy(otherwise) as O;

    const reducer = this.reducer;
    this.state = reducer.next(this.state, value, this.index++, this.halt);

    return reducer.stateToResult(this.state);
  }
}

export class ReduceAllIterator<I, R> extends FastIteratorBase<R> {
  readonly state: unknown[];
  readonly done: ((() => void) | null)[];

  constructor(
    readonly source: FastIterator<I>,
    readonly reducers: Reducer<I, any>[]
  ) {
    super();

    this.state = reducers.map((d: any): unknown => OptLazy(d.init));
    this.done = this.state.map((_: any, i: any): (() => void) => (): void => {
      this.done[i] = null;
    });
  }

  halted = false;
  index = 0;
  isDone = false;

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    if (this.halted || this.isDone) return OptLazy(otherwise) as O;

    const done = Symbol('Done');
    const value = this.source.fastNext(done);

    if (done === value) return OptLazy(otherwise) as O;

    const reducers = this.reducers;
    const length = reducers.length;
    let i = -1;
    let anyNotDone = false;

    while (++i < length) {
      const halt = this.done[i];
      if (null !== halt) {
        anyNotDone = true;
        const reducer = reducers[i];
        this.state[i] = reducer.next(this.state[i], value, this.index, halt);
      }
    }
    this.isDone = !anyNotDone;
    if (!anyNotDone) return OptLazy(otherwise) as O;
    this.index++;

    return this.state.map((s, i) =>
      reducers[i].stateToResult(s)
    ) as unknown as O;
  }
}

export class ArrayIterator<T> extends FastIteratorBase<T> {
  i: number;

  constructor(
    readonly array: readonly T[],
    readonly startIndex: number,
    readonly endIndex: number
  ) {
    super();
    this.i = startIndex;
  }

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    if (this.i > this.endIndex) return OptLazy(otherwise) as O;
    return this.array[this.i++];
  }
}

export class ArrayReverseIterator<T> extends FastIteratorBase<T> {
  i: number;

  constructor(
    readonly array: readonly T[],
    readonly startIndex: number,
    endIndex: number
  ) {
    super();
    this.i = endIndex;
  }

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    if (this.i < this.startIndex) return OptLazy(otherwise) as O;
    return this.array[this.i--];
  }
}

export class AlwaysIterator<T> extends FastIteratorBase<T> {
  constructor(readonly value: T) {
    super();
  }

  fastNext(): T {
    return this.value;
  }
}

export class MapApplyIterator<
  T extends readonly unknown[],
  A extends readonly unknown[],
  R
> extends FastIteratorBase<R> {
  constructor(
    source: StreamSource<T>,
    readonly f: (...args: [...T, ...A]) => R,
    readonly args: A,
    streamSourceHelpers: StreamSourceHelpers
  ) {
    super();
    this.iter = streamSourceHelpers.fromStreamSource(source)[Symbol.iterator]();
  }

  iter: FastIterator<T>;

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    const done = Symbol();
    const next = this.iter.fastNext(done);
    const args = this.args;

    if (done === next) return OptLazy(otherwise)!;
    return this.f(...next, ...args);
  }
}

export class FilterApplyIterator<
  T extends readonly unknown[],
  A extends readonly unknown[]
> extends FastIteratorBase<T> {
  constructor(
    source: StreamSource<T>,
    readonly pred: (...args: [...T, ...A]) => boolean,
    readonly args: A,
    readonly invert: boolean,
    streamSourceHelpers: StreamSourceHelpers
  ) {
    super();
    this.iter = streamSourceHelpers.fromStreamSource(source)[Symbol.iterator]();
  }

  iter: FastIterator<T>;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol();
    let next: T | typeof done;

    const pred = this.pred;
    const iter = this.iter;
    const args = this.args;

    if (this.invert) {
      while (done !== (next = iter.fastNext(done))) {
        if (!pred(...next, ...args)) return next;
      }
    } else {
      while (done !== (next = iter.fastNext(done))) {
        if (pred(...next, ...args)) return next;
      }
    }

    return OptLazy(otherwise)!;
  }
}

export class RangeUpIterator extends FastIteratorBase<number> {
  state: number;

  constructor(
    readonly start = 0,
    readonly end: number | undefined,
    readonly delta: number
  ) {
    super();

    this.state = start;
  }

  fastNext<O>(otherwise?: OptLazy<O>): number | O {
    if (undefined !== this.end) {
      if (this.state > this.end) {
        return OptLazy(otherwise) as O;
      }
    }
    const currentState = this.state;
    this.state += this.delta;
    return currentState;
  }
}

export class RangeDownIterator extends FastIteratorBase<number> {
  state: number;

  constructor(
    readonly start = 0,
    readonly end: number | undefined,
    readonly delta: number
  ) {
    super();

    this.state = start;
  }

  fastNext<O>(otherwise?: OptLazy<O>): number | O {
    if (undefined !== this.end) {
      if (this.state < this.end) {
        return OptLazy(otherwise) as O;
      }
    }
    const currentState = this.state;
    this.state += this.delta;
    return currentState;
  }
}

export class RandomIterator extends FastIteratorBase<number> {
  fastNext(): number {
    return Math.random();
  }
}

export class RandomIntIterator extends FastIteratorBase<number> {
  readonly width: number;

  constructor(readonly min: number, readonly max: number) {
    super();

    this.width = max - min;
  }

  fastNext(): number {
    return this.min + Math.round(Math.random() * this.width);
  }
}

export class UnfoldIterator<T> extends FastIteratorBase<T> {
  constructor(
    init: T,
    readonly getNext: (current: T, index: number, stop: Token) => T | Token
  ) {
    super();
    this.current = init;
  }

  current: T | Token;
  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const current = this.current;

    if (Token === current) return OptLazy(otherwise) as O;

    if (this.index === 0) {
      this.index++;
      return current;
    }

    const next = this.getNext(current, this.index++, Token);
    this.current = next;

    if (Token === next) return OptLazy(otherwise) as O;

    return next;
  }
}

export class ZipWithIterator<
  I extends readonly unknown[],
  R
> extends FastIteratorBase<R> {
  constructor(
    readonly iterables: { [K in keyof I]: StreamSource<I[K]> },
    readonly zipFun: (...values: I) => R,
    streamSourceHelpers: StreamSourceHelpers
  ) {
    super();

    this.sources = iterables.map(
      (source): FastIterator<any> =>
        streamSourceHelpers.fromStreamSource(source)[Symbol.iterator]()
    );
  }

  readonly sources: FastIterator<any>[];

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    const result = [];

    let sourceIndex = -1;
    const sources = this.sources;

    const done = Symbol('Done');

    while (++sourceIndex < sources.length) {
      const value = sources[sourceIndex].fastNext(done);

      if (done === value) return OptLazy(otherwise) as O;

      result.push(value);
    }

    return (this.zipFun as any)(...result);
  }
}

export class ZipAllWithItererator<
  I extends readonly unknown[],
  F,
  R
> extends FastIteratorBase<R> {
  constructor(
    readonly fillValue: OptLazy<F>,
    readonly iters: { [K in keyof I]: StreamSource<I[K]> },
    readonly zipFun: (...values: { [K in keyof I]: I[K] | F }) => R,
    streamSourceHelpers: StreamSourceHelpers
  ) {
    super();

    this.sources = iters.map(
      (o): FastIterator<any> =>
        streamSourceHelpers.fromStreamSource(o)[Symbol.iterator]()
    );
  }

  readonly sources: FastIterator<any>[];
  allDone = false;

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    if (this.allDone) return OptLazy(otherwise) as O;

    const result = [];

    let sourceIndex = -1;
    const sources = this.sources;

    const done = Symbol('Done');
    let anyNotDone = false;
    const fillValue = this.fillValue;

    while (++sourceIndex < sources.length) {
      const value = sources[sourceIndex].fastNext(done);

      if (done === value) {
        result.push(OptLazy(fillValue));
      } else {
        anyNotDone = true;
        result.push(value);
      }
    }

    if (!anyNotDone) {
      this.allDone = true;
      return OptLazy(otherwise) as O;
    }

    return (this.zipFun as any)(...result);
  }
}

export class PrependIterator<T> extends FastIteratorBase<T> {
  constructor(readonly source: FastIterator<T>, readonly item: OptLazy<T>) {
    super();
  }

  prependDone = false;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    if (this.prependDone) return this.source.fastNext(otherwise!);
    this.prependDone = true;
    return OptLazy(this.item);
  }
}

export class AppendIterator<T> extends FastIteratorBase<T> {
  constructor(readonly source: FastIterator<T>, readonly item: OptLazy<T>) {
    super();
  }

  appendDone = false;

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    if (this.appendDone) return OptLazy(otherwise) as O;

    const done = Symbol('Done');

    const value = this.source.fastNext(done);

    if (done !== value) return value;

    this.appendDone = true;
    return OptLazy(this.item);
  }
}

export class IndexedIterator<T> extends FastIteratorBase<[number, T]> {
  index: number;

  constructor(readonly source: FastIterator<T>, readonly startIndex = 0) {
    super();
    this.index = startIndex;
  }

  fastNext<O>(otherwise?: OptLazy<O>): [number, T] | O {
    const done = Symbol('Done');
    const value = this.source.fastNext(done);

    if (done === value) return OptLazy(otherwise) as O;

    return [this.index++, value];
  }
}

export class MapIterator<T, T2> extends FastIteratorBase<T2> {
  constructor(
    readonly source: FastIterator<T>,
    readonly mapFun: (value: T, index: number) => T2
  ) {
    super();
  }

  readonly state = TraverseState();

  fastNext<O>(otherwise?: OptLazy<O>): T2 | O {
    const state = this.state;

    if (state.halted) return OptLazy(otherwise) as O;

    const done = Symbol('Done');
    const next = this.source.fastNext(done);

    if (done === next) return OptLazy(otherwise) as O;

    return this.mapFun(next, state.nextIndex());
  }
}

export class MapPureIterator<
  T,
  A extends readonly unknown[],
  T2
> extends FastIteratorBase<T2> {
  constructor(
    readonly source: FastIterator<T>,
    readonly mapFun: (value: T, ...args: A) => T2,
    readonly args: A
  ) {
    super();
  }

  fastNext<O>(otherwise?: OptLazy<O>): T2 | O {
    const done = Symbol('Done');
    const next = this.source.fastNext(done);

    if (done === next) return OptLazy(otherwise) as O;

    return this.mapFun(next, ...this.args);
  }
}

export class DistinctPreviousIterator<T> extends FastIteratorBase<T> {
  constructor(readonly source: FastIterator<T>, readonly eq: Eq<T>) {
    super();
  }

  readonly previous = [] as T[];

  fastNext<O>(otherwise?: OptLazy<O>): T | O {
    const done = Symbol('Done');

    let next: T | typeof done;
    const source = this.source;
    const previous = this.previous;

    while (done !== (next = source.fastNext(done))) {
      previous.push(next);

      if (previous.length === 1) {
        return next;
      }

      const prev = previous.shift()!;

      if (!this.eq(prev, next)) {
        return next;
      }
    }

    return OptLazy(otherwise!);
  }
}

export class WindowIterator<T, R> extends FastIteratorBase<R> {
  constructor(
    readonly source: FastIterator<T>,
    readonly windowSize: number,
    readonly skipAmount: number,
    readonly collector: Reducer<T, R>
  ) {
    super();
  }

  state = new Set<{
    result: unknown;
    size: number;
    halted: boolean;
    halt: () => void;
  }>();
  index = 0;

  fastNext<O>(otherwise?: OptLazy<O>): R | O {
    const source = this.source;
    const collector = this.collector;
    const windowSize = this.windowSize;
    const skipAmount = this.skipAmount;
    const done = Symbol('Done');
    const state = this.state;

    let next: T | typeof done;
    let result: R | typeof done = done;

    while (done !== (next = source.fastNext(done))) {
      for (const current of state) {
        current.result = collector.next(
          current.result,
          next,
          current.size,
          current.halt
        );
        current.size++;

        if (current.size >= windowSize || current.halted) {
          result = collector.stateToResult(current.result);
          state.delete(current);
        }
      }

      if (this.index % skipAmount === 0) {
        const newState = {
          result: OptLazy(collector.init),
          size: 1,
          halted: false,
          halt(): void {
            this.halted = true;
          },
        };

        newState.result = collector.next(
          OptLazy(collector.init),
          next,
          0,
          newState.halt
        );

        state.add(newState);
      }

      this.index++;

      if (done !== result) {
        return result;
      }
    }

    return OptLazy(otherwise!);
  }
}
