import { Arr, RimbuError } from '@rimbu/base';
import type { RMap } from '@rimbu/collection-types/map';
import {
  type Elem,
  EmptyBase,
  NonEmptyBase,
  type WithElem,
} from '@rimbu/collection-types/map-custom';
import { Stream, type StreamSource } from '@rimbu/stream';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';

import {
  type ArrayNonEmpty,
  Reducer,
  type RelatedTo,
  type ToJSON,
  TraverseState,
} from '@rimbu/common';
import type { MultiSetBase } from '#multiset/custom';

export interface ContextImplTypes extends MultiSetBase.Types {
  readonly context: MultiSetContext<this['_T'], string>;
}

export class MultiSetEmpty<T, Tp extends ContextImplTypes>
  extends EmptyBase
  implements MultiSetBase<T, Tp>
{
  constructor(readonly context: WithElem<Tp, T>['context']) {
    super();
  }

  add(elem: T, amount?: number): WithElem<Tp, T>['nonEmpty'] {
    if (undefined !== amount && amount <= 0) return this as any;

    const addAmount = amount ?? 1;

    const countMap = this.context.countMapContext.of([
      elem,
      addAmount,
    ]) as WithElem<Tp, T>['countMapNonEmpty'];

    return this.context.createNonEmpty(countMap, addAmount);
  }

  get countMap(): WithElem<Tp, T>['countMap'] {
    return this.context.countMapContext.empty();
  }

  get sizeDistinct(): 0 {
    return 0;
  }

  streamDistinct(): Stream<T> {
    return Stream.empty();
  }

  addAll(values: StreamSource<T>): WithElem<Tp, T>['nonEmpty'] {
    return this.context.from(values) as any;
  }

  addEntries(
    entries: StreamSource<readonly [T, number]>
  ): WithElem<Tp, T>['normal'] {
    if (isEmptyStreamSourceInstance(entries)) return this as any;

    const builder = this.toBuilder();
    builder.addEntries(entries);
    return builder.build();
  }

  remove(): WithElem<Tp, T>['normal'] {
    return this as any;
  }

  removeAllSingle(): WithElem<Tp, T>['normal'] {
    return this as any;
  }

  removeAllEvery(): WithElem<Tp, T>['normal'] {
    return this as any;
  }

  setCount(elem: T, amount: number): WithElem<Tp, T>['normal'] {
    return this.add(elem, amount);
  }

  modifyCount(
    value: T,
    update: (currentCount: number) => number
  ): WithElem<Tp, T>['normal'] {
    return this.add(value, update(0));
  }

  has(): false {
    return false;
  }

  count(): 0 {
    return 0;
  }

  forEach(): void {
    //
  }

  filterEntries(): WithElem<Tp, T>['normal'] {
    return this as any;
  }

  toBuilder(): WithElem<Tp, T>['builder'] {
    return this.context.builder();
  }

  toArray(): [] {
    return [];
  }

  toString(): string {
    return `${this.context.typeTag}()`;
  }

  toJSON(): ToJSON<[any, number][]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }
}

export class MultiSetNonEmpty<
    T,
    Tp extends ContextImplTypes,
    TpG extends WithElem<Tp, T> = WithElem<Tp, T>
  >
  extends NonEmptyBase<T>
  implements MultiSetBase.NonEmpty<T, Tp>
{
  constructor(
    readonly context: TpG['context'],
    readonly countMap: TpG['countMapNonEmpty'],
    readonly size: number
  ) {
    super();
  }

  assumeNonEmpty(): any {
    return this;
  }

  asNormal(): any {
    return this;
  }

  copy(countMap: TpG['countMapNonEmpty'], size: number): TpG['nonEmpty'] {
    if (countMap === this.countMap) return this as any;

    return this.context.createNonEmpty<T>(countMap as any, size);
  }

  copyE(countMap: TpG['countMap'], size: number): TpG['normal'] {
    if (countMap.nonEmpty()) return this.copy(countMap, size) as TpG['normal'];
    return this.context.empty();
  }

  get sizeDistinct(): number {
    return this.countMap.size;
  }

  stream(): Stream.NonEmpty<T> {
    return this.countMap
      .stream()
      .flatMap(
        ([value, count]): Stream.NonEmpty<T> => Stream.of(value).repeat(count)
      );
  }

  streamDistinct(): Stream.NonEmpty<T> {
    return this.countMap.streamKeys();
  }

  has<U>(elem: RelatedTo<T, U>): boolean {
    return this.countMap.hasKey(elem);
  }

  count<U>(elem: RelatedTo<T, U>): number {
    return this.countMap.get(elem, 0);
  }

  add(elem: T, amount = 1): WithElem<Tp, T>['nonEmpty'] {
    if (amount <= 0) return this as any;

    return this.copy(
      this.countMap
        .modifyAt(elem, {
          ifNew: amount,
          ifExists: (count): number => count + amount,
        })
        .assumeNonEmpty(),
      this.size + amount
    );
  }

  addAll(values: StreamSource<T>): TpG['nonEmpty'] {
    if (isEmptyStreamSourceInstance(values)) return this as any;

    const builder = this.toBuilder();
    builder.addAll(values);
    return builder.build().assumeNonEmpty();
  }

  addEntries(entries: StreamSource<readonly [T, number]>): TpG['nonEmpty'] {
    if (isEmptyStreamSourceInstance(entries)) return this as any;

    const builder = this.toBuilder();
    builder.addEntries(entries);
    return builder.build().assumeNonEmpty();
  }

  setCount(elem: T, amount: number): TpG['normal'] {
    if (amount <= 0) return this.remove(elem);

    let sizeDelta = amount;

    const newCountMap = this.countMap
      .modifyAt(elem, {
        ifNew: amount,
        ifExists: (count): number => {
          sizeDelta -= count;
          return amount;
        },
      })
      .assumeNonEmpty();

    return this.copyE(newCountMap, this.size + sizeDelta);
  }

  modifyCount(
    value: T,
    update: (currentCount: number) => number
  ): TpG['normal'] {
    let sizeDelta = 0;

    const newCountMap = this.countMap
      .modifyAt(value, {
        ifNew: (none) => {
          const newAmount = update(0);
          if (newAmount <= 0) return none;
          sizeDelta += newAmount;
          return newAmount;
        },
        ifExists: (amount, remove) => {
          sizeDelta -= amount;
          const newAmount = update(amount);

          if (newAmount <= 0) return remove;

          sizeDelta += newAmount;
          return newAmount;
        },
      })
      .assumeNonEmpty();

    return this.copyE(newCountMap, this.size + sizeDelta);
  }

  remove<U>(elem: RelatedTo<T, U>, amount: number | 'ALL' = 1): TpG['normal'] {
    if (!this.context.isValidElem(elem)) return this as any;

    let newSize = this.size;

    const newCountMap = this.countMap.modifyAt(elem, {
      ifExists: (count, remove): number | typeof remove => {
        if (amount === 'ALL') {
          newSize -= count;
          return remove;
        }

        const result = count - amount;
        if (result <= 0) {
          newSize -= count;
          return remove;
        }

        newSize -= amount;
        return result;
      },
    });

    return this.copyE(newCountMap, newSize);
  }

  removeAllSingle<U>(elems: StreamSource<RelatedTo<T, U>>): TpG['normal'] {
    if (isEmptyStreamSourceInstance(elems)) return this as any;

    const builder = this.toBuilder();
    builder.removeAllSingle(elems);
    return builder.build();
  }

  removeAllEvery<U>(elems: StreamSource<RelatedTo<T, U>>): TpG['normal'] {
    if (isEmptyStreamSourceInstance(elems)) return this as any;

    const builder = this.toBuilder();
    builder.removeAllEvery(elems);
    return builder.build();
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted) return;

    const it = this.countMap.stream()[Symbol.iterator]();
    let entry: readonly [T, number] | undefined;
    const { halt } = state;

    while (!state.halted && undefined !== (entry = it.fastNext())) {
      const value = entry[0];
      let amount = entry[1];

      while (!state.halted && --amount >= 0) {
        f(value, state.nextIndex(), halt);
      }
    }
  }

  filterEntries(
    pred: (entry: readonly [T, number], index: number) => boolean
  ): TpG['normal'] {
    const builder = this.context.builder();

    Stream.applyForEach(this.countMap.stream().filter(pred), builder.setCount);

    if (builder.size === this.size) return this as any;

    return builder.build();
  }

  toArray(): ArrayNonEmpty<T> {
    let result: T[] = [];

    const it = this.countMap[Symbol.iterator]();
    let entry: readonly [T, number] | undefined;

    while (undefined !== (entry = it.fastNext())) {
      const amount = entry[1];
      if (amount === 1) result.push(entry[0]);
      else {
        const newArray = new Array<T>(amount);
        newArray.fill(entry[0]);
        result = Arr.concat(result, newArray) as T[];
      }
    }

    return result as ArrayNonEmpty<T>;
  }

  toString(): string {
    return this.stream().join({
      start: `${this.context.typeTag}(`,
      sep: `, `,
      end: `)`,
    });
  }

  toJSON(): ToJSON<(readonly [T, number])[]> {
    return {
      dataType: this.context.typeTag,
      value: this.countMap.toArray(),
    };
  }

  toBuilder(): TpG['builder'] {
    return new MultiSetBuilder<T, Tp>(
      this.context,
      this as any
    ) as TpG['builder'];
  }
}

export class MultiSetBuilder<
  T,
  Tp extends ContextImplTypes,
  TpG extends WithElem<Tp, T> = WithElem<Tp, T>
> implements MultiSetBase.Builder<T, Tp>
{
  _lock = 0;
  _size = 0;

  constructor(
    readonly context: TpG['context'],
    public source?: TpG['nonEmpty']
  ) {
    if (undefined !== source) this._size = source.size;
  }

  _countMap?: RMap.Builder<T, number>;

  get countMap(): RMap.Builder<T, number> {
    if (undefined === this._countMap) {
      if (undefined === this.source) {
        this._countMap = this.context.countMapContext.builder();
      } else {
        this._countMap = this.source.countMap.toBuilder();
      }
    }

    return this._countMap;
  }

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  get size(): number {
    return this._size;
  }

  get sizeDistinct(): number {
    return this.source?.sizeDistinct ?? this.countMap.size;
  }

  get isEmpty(): boolean {
    return 0 === this.size;
  }

  // prettier-ignore
  has = <U,>(value: RelatedTo<T, U>): boolean => {
    return this.source?.has(value) ?? this.countMap.hasKey(value);
  };

  add = (value: T, amount = 1): boolean => {
    this.checkLock();

    if (amount <= 0) return false;
    this._size += amount;
    this.countMap.modifyAt(value, {
      ifNew: amount,
      ifExists: (count): number => count + amount,
    });
    this.source = undefined;
    return true;
  };

  addAll = (source: StreamSource<T>): boolean => {
    this.checkLock();

    return Stream.from(source).filterPure(this.add, 1).count() > 0;
  };

  addEntries = (entries: StreamSource<readonly [T, number]>): boolean => {
    this.checkLock();

    return Stream.applyFilter(entries, this.add).count() > 0;
  };

  // prettier-ignore
  remove = <U,>(value: RelatedTo<T, U>, amount: number | 'ALL' = 1): number => {
    this.checkLock();

    if (typeof amount === 'number' && amount <= 0) return 0;
    if (!this.context.isValidElem(value)) return 0;

    let removed = 0;

    this.countMap.modifyAt(value, {
      ifExists: (count, remove): number | typeof remove => {
        if (amount === 'ALL') {
          removed = count;
          return remove;
        }

        const result = count - amount;

        if (result <= 0) {
          removed = count;
          return remove;
        }

        removed = amount;
        return result;
      },
    });

    this._size -= removed;

    if (removed > 0) this.source = undefined;

    return removed;
  };

  setCount = (value: T, amount: number): boolean => {
    this.checkLock();

    if (amount <= 0) {
      return this.remove(value, 'ALL') > 0;
    }

    this._size += amount;

    const changed = this.countMap.modifyAt(value, {
      ifNew: amount,
      ifExists: (count): number => {
        this._size -= count;
        return amount;
      },
    });

    if (changed) this.source = undefined;

    return changed;
  };

  modifyCount = (
    value: T,
    update: (currentCount: number) => number
  ): boolean => {
    this.checkLock();

    const changed = this.countMap.modifyAt(value, {
      ifNew: (none) => {
        const newAmount = update(0);
        if (newAmount <= 0) return none;

        this._size += newAmount;
        return newAmount;
      },
      ifExists: (currentCount, remove) => {
        this._size -= currentCount;
        const newCount = update(currentCount);

        if (newCount <= 0) return remove;

        this._size += newCount;
        return newCount;
      },
    });

    if (changed) this.source = undefined;

    return changed;
  };

  // prettier-ignore
  count = <U,>(value: RelatedTo<T, U>): number => {
    return this.source?.count(value) ?? this.countMap.get(value, 0);
  };

  // prettier-ignore
  removeAll = <U,>(
    values: StreamSource<RelatedTo<T, U>>,
    mode: 'SINGLE' | 'ALL'
  ): boolean => {
    this.checkLock();

    if (isEmptyStreamSourceInstance(values)) return false;

    return (
      Stream.from(values)
        .mapPure(this.remove, mode === 'SINGLE' ? 1 : 'ALL')
        .countNotElement(0) > 0
    );
  };

  // prettier-ignore
  removeAllSingle = <U,>(values: StreamSource<RelatedTo<T, U>>): boolean => {
    return this.removeAll(values, 'SINGLE');
  };

  // prettier-ignore
  removeAllEvery = <U,>(values: StreamSource<RelatedTo<T, U>>): boolean => {
    return this.removeAll(values, 'ALL');
  };

  forEach = (
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void => {
    if (state.halted) return;

    this._lock++;

    const { halt } = state;

    this.countMap.forEach(([value, amount], _, builderHalt): void => {
      let time = 0;

      while (!state.halted && time++ < amount) {
        f(value, state.nextIndex(), halt);
      }

      if (state.halted) builderHalt();
    });

    this._lock--;
  };

  build = (): TpG['normal'] => {
    if (undefined !== this.source) return this.source as TpG['normal'];

    if (this.isEmpty) return this.context.empty();

    const newCountMap = this.countMap
      .build()
      .assumeNonEmpty() as TpG['countMapNonEmpty'];

    return new MultiSetNonEmpty<T, Tp>(
      this.context,
      newCountMap,
      this.size
    ) as any;
  };
}

export class MultiSetContext<
  UT,
  N extends string,
  Tp extends ContextImplTypes = ContextImplTypes
> implements MultiSetBase.Context<UT, Tp>
{
  constructor(
    readonly typeTag: N,
    readonly countMapContext: (Tp & Elem<UT>)['countMapContext']
  ) {}

  get _types(): Tp {
    return undefined as any;
  }

  isValidElem(elem: any): elem is UT {
    return this.countMapContext.isValidKey(elem);
  }

  readonly _empty: WithElem<Tp, UT>['normal'] = Object.freeze(
    new MultiSetEmpty<UT, Tp>(this as any)
  ) as any;

  isNonEmptyInstance<T>(source: any): source is WithElem<Tp, T>['nonEmpty'] {
    return source instanceof MultiSetNonEmpty;
  }

  createNonEmpty<T extends UT>(
    countMap: WithElem<Tp, T>['countMapNonEmpty'],
    size: number
  ): WithElem<Tp, T>['nonEmpty'] {
    return new MultiSetNonEmpty<T, Tp>(this as any, countMap, size) as any;
  }

  readonly empty = <T extends UT>(): WithElem<Tp, T>['normal'] => {
    return this._empty;
  };

  readonly from: any = <T extends UT>(
    ...sources: ArrayNonEmpty<StreamSource<T>>
  ): WithElem<Tp, T>['normal'] => {
    let builder = this.builder<T>();

    let i = -1;
    const length = sources.length;

    while (++i < length) {
      const source = sources[i];

      if (isEmptyStreamSourceInstance(source)) continue;
      if (
        builder.isEmpty &&
        this.isNonEmptyInstance<T>(source) &&
        source.context === (this as any)
      ) {
        if (i === length - 1) return source;
        builder = source.toBuilder();
        continue;
      }

      builder.addAll(source);
    }

    return builder.build();
  };

  // prettier-ignore
  readonly of = <T,>(
    ...values: ArrayNonEmpty<T>
  ): T extends UT ? WithElem<Tp, T>['nonEmpty'] : never => {
    return this.from(values);
  };

  readonly builder = <T extends UT>(): WithElem<Tp, T>['builder'] => {
    return new MultiSetBuilder<T, Tp>(this as any) as WithElem<
      Tp,
      T
    >['builder'];
  };

  readonly reducer = <T extends UT>(
    source?: StreamSource<T>
  ): Reducer<T, WithElem<Tp, T>['normal']> => {
    return Reducer.create(
      () =>
        undefined === source
          ? this.builder<T>()
          : (this.from(source) as WithElem<Tp, T>['normal']).toBuilder(),
      (builder, value) => {
        builder.add(value);
        return builder;
      },
      (builder) => builder.build()
    );
  };

  createBuilder<T extends UT>(
    source?: WithElem<Tp, T>['nonEmpty']
  ): WithElem<Tp, T>['builder'] {
    return new MultiSetBuilder<T, Tp>(this as any, source) as WithElem<
      Tp,
      T
    >['builder'];
  }
}
