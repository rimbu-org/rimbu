import { RimbuError, Token } from '@rimbu/base';
import { CustomBase as CB, RMap } from '@rimbu/collection-types';
import {
  ArrayNonEmpty,
  OptLazy,
  OptLazyOr,
  RelatedTo,
  ToJSON,
  TraverseState,
  Update,
} from '@rimbu/common';
import { Stream, StreamSource } from '@rimbu/stream';
import type { Table } from '../internal';
import type { TableBase } from '../table-custom';

export interface ContextImplTypes extends TableBase.Types {
  context: TableContext<this['_R'], this['_C'], string, this>;
}

export class TableEmpty<R, C, V, Tp extends ContextImplTypes>
  extends CB.EmptyBase
  implements TableBase<R, C, V, Tp>
{
  constructor(readonly context: CB.WithRow<Tp, R, C, V>['context']) {
    super();
  }

  set(row: R, column: C, value: V): CB.WithRow<Tp, R, C, V>['nonEmpty'] {
    const columnMap = this.context.columnContext.of([
      column,
      value,
    ]) as CB.WithRow<Tp, R, C, V>['rowNonEmpty'];
    const rowMap = this.context.rowContext.of([row, columnMap]) as CB.WithRow<
      Tp,
      R,
      C,
      V
    >['rowMapNonEmpty'];

    return this.context.createNonEmpty(rowMap as any, 1);
  }

  get rowMap(): CB.WithRow<Tp, R, C, V>['rowMap'] {
    return this.context.rowContext.empty();
  }

  get amountRows(): 0 {
    return 0;
  }

  streamRows(): Stream<R> {
    return Stream.empty();
  }

  streamValues(): Stream<V> {
    return Stream.empty();
  }

  addEntry(entry: readonly [R, C, V]): CB.WithRow<Tp, R, C, V>['nonEmpty'] {
    return this.set(entry[0], entry[1], entry[2]);
  }

  addEntries(
    entries: StreamSource<readonly [R, C, V]>
  ): CB.WithRow<Tp, R, C, V>['normal'] | any {
    return this.context.from(entries);
  }

  remove(): CB.WithRow<Tp, R, C, V>['normal'] {
    return this as any;
  }

  removeRow(): CB.WithRow<Tp, R, C, V>['normal'] {
    return this as any;
  }

  removeRows(): CB.WithRow<Tp, R, C, V>['normal'] {
    return this as any;
  }

  removeAndGet(): undefined {
    return undefined;
  }

  removeRowAndGet(): undefined {
    return undefined;
  }

  removeEntries(): CB.WithRow<Tp, R, C, V>['normal'] {
    return this as any;
  }

  hasRowKey(): false {
    return false;
  }

  hasValueAt(): false {
    return false;
  }

  get<_, __, O>(row: R, column: C, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  getRow(): CB.WithRow<Tp, R, C, V>['row'] {
    return this.context.columnContext.empty();
  }

  modifyAt(
    row: R,
    column: C,
    options: { ifNew?: OptLazyOr<V, Token> }
  ): CB.WithRow<Tp, R, C, V>['normal'] {
    if (undefined !== options.ifNew) {
      const value = OptLazyOr(options.ifNew, Token);
      if (Token === value) return this as any;

      return this.set(row, column, value) as CB.WithRow<Tp, R, C, V>['normal'];
    }
    return this as any;
  }

  updateAt(): CB.WithRow<Tp, R, C, V>['normal'] {
    return this as any;
  }

  filterRows(): CB.WithRow<Tp, R, C, V>['normal'] {
    return this as any;
  }

  mapValues(): CB.WithRow<Tp, R, C, V>['normal'] {
    return this as any;
  }

  toBuilder(): CB.WithRow<Tp, R, C, V>['builder'] {
    return this.context.builder() as CB.WithRow<Tp, R, C, V>['builder'];
  }

  toString(): string {
    return `${this.context.typeTag}()`;
  }

  toJSON(): ToJSON<[R, [C, V][]][]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }

  extendValues(): any {
    return this;
  }
}

export class TableNonEmpty<
    R,
    C,
    V,
    Tp extends ContextImplTypes,
    TpR extends CB.WithRow<Tp, R, C, V> = CB.WithRow<Tp, R, C, V>
  >
  extends CB.NonEmptyBase<[R, C, V]>
  implements TableBase.NonEmpty<R, C, V, Tp>
{
  constructor(
    readonly context: TpR['context'],
    readonly rowMap: TpR['rowMapNonEmpty'],
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

  copy(rowMap: TpR['rowMapNonEmpty'], size: number): TpR['nonEmpty'] {
    if (rowMap === this.rowMap) return this as any;
    return this.context.createNonEmpty<R, C, V>(rowMap as any, size);
  }

  copyE(rowMap: TpR['rowMap'], size: number): TpR['normal'] {
    if (rowMap.nonEmpty())
      return this.copy(rowMap.assumeNonEmpty(), size) as TpR['normal'];
    return this.context.empty<R, C, V>() as TpR['normal'];
  }

  stream(): Stream.NonEmpty<[R, C, V]> {
    return this.rowMap
      .stream()
      .flatMap(
        ([row, columns]): Stream.NonEmpty<[R, C, V]> =>
          columns
            .stream()
            .map(([column, value]): [R, C, V] => [row, column, value])
      );
  }

  streamRows(): Stream.NonEmpty<R> {
    return this.rowMap.streamKeys();
  }

  streamValues(): Stream.NonEmpty<V> {
    return this.rowMap
      .streamValues()
      .flatMap((columns): Stream.NonEmpty<V> => columns.streamValues());
  }

  get amountRows(): number {
    return this.rowMap.size;
  }

  hasRowKey<UR>(row: RelatedTo<R, UR>): boolean {
    return this.rowMap.hasKey(row);
  }

  hasValueAt<UR, UC>(row: RelatedTo<R, UR>, column: RelatedTo<C, UC>): boolean {
    const token = Symbol();
    return token !== this.get(row, column, token);
  }

  get<UR, UC, O>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>,
    otherwise?: OptLazy<O>
  ): V | O {
    const token = Symbol();
    const result = this.rowMap.get(row, token);
    if (token === result) return OptLazy(otherwise) as O;
    return result.get(column, otherwise!);
  }

  getRow<UR>(row: RelatedTo<R, UR>): TpR['row'] {
    return this.rowMap.get(
      row,
      this.context.columnContext.empty<C, V>()
    ) as TpR['row'];
  }

  set(row: R, column: C, value: V): TpR['nonEmpty'] {
    return this.modifyAt(row, column, {
      ifNew: value,
      ifExists: (): V => value,
    }).assumeNonEmpty();
  }

  addEntry(entry: readonly [R, C, V]): TpR['nonEmpty'] {
    return this.set(entry[0], entry[1], entry[2]);
  }

  addEntries(entries: StreamSource<readonly [R, C, V]>): TpR['nonEmpty'] {
    if (StreamSource.isEmptyInstance(entries)) return this as any;

    const builder: TpR['builder'] = this.toBuilder() as any;

    builder.addEntries(entries);
    return builder.build().assumeNonEmpty();
  }

  modifyAt(
    row: R,
    column: C,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (value: V, remove: Token) => V | Token;
    }
  ): TpR['normal'] {
    let newSize = this.size;

    const { ifNew, ifExists } = options;

    const passOptions: {
      ifNew?: (none: Token) => RMap.NonEmpty<C, V> | Token;
      ifExists?: (
        currentEntry: RMap.NonEmpty<C, V>,
        remove: typeof Token
      ) => typeof Token | RMap.NonEmpty<C, V>;
    } = {};

    if (undefined !== ifNew) {
      passOptions.ifNew = (none): RMap.NonEmpty<C, V> | Token => {
        const value = OptLazyOr(ifNew, Token);

        if (Token === value) return none;

        newSize++;

        return this.context.columnContext.of([column, value]);
      };
    }

    if (undefined !== ifExists) {
      passOptions.ifExists = (
        columns: RMap.NonEmpty<C, V>,
        remove: Token
      ): typeof columns | typeof remove => {
        const newColumns = columns.modifyAt(column, options);

        if (newColumns === columns) return columns;

        if (newColumns.nonEmpty()) {
          newSize += newColumns.size - columns.size;
          return newColumns;
        }

        newSize -= columns.size;
        return remove;
      };
    }

    return this.copyE(this.rowMap.modifyAt(row, passOptions as any), newSize);
  }

  updateAt<UR, UC>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>,
    update: Update<V>
  ): TpR['nonEmpty'] {
    if (!this.context.rowContext.isValidKey(row)) return this as any;
    if (!this.context.columnContext.isValidKey(column)) return this as any;

    return this.modifyAt(row, column, {
      ifExists: (value): V => Update(value, update),
    }).assumeNonEmpty();
  }

  remove<UR, UC>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>
  ): TpR['normal'] {
    const resultOpt = this.removeAndGet(row, column);

    return resultOpt?.[0] ?? (this as any);
  }

  removeRow<UR>(row: RelatedTo<R, UR>): TpR['normal'] {
    const resultOpt = this.removeRowAndGet(row);

    return resultOpt?.[0] ?? (this as any);
  }

  removeRows<UR>(rows: StreamSource<RelatedTo<R, UR>>): TpR['normal'] {
    if (StreamSource.isEmptyInstance(rows)) return this as any;

    const builder = this.toBuilder();

    builder.removeRows(rows);
    return builder.build() as TpR['normal'];
  }

  removeAndGet<UR, UC>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>
  ): [TpR['normal'], V] | undefined {
    if (!this.context.rowContext.isValidKey(row)) return undefined;
    if (!this.context.columnContext.isValidKey(column)) return undefined;

    let newSize = this.size;
    const token = Symbol();
    let removedValue: V | typeof token = token;

    const newRows = this.rowMap.modifyAt(row, {
      ifExists: (columns, remove): typeof columns | typeof remove => {
        const newColumns = columns.modifyAt(column, {
          ifExists: (currentValue, remove): typeof remove => {
            removedValue = currentValue;
            newSize--;
            return remove;
          },
        });

        if (newColumns.nonEmpty()) return newColumns;
        return remove;
      },
    });

    if (token === removedValue) return undefined;

    const newSelf = this.copyE(newRows, newSize);
    return [newSelf, removedValue];
  }

  removeRowAndGet<UR>(
    row: RelatedTo<R, UR>
  ): [TpR['normal'], TpR['rowNonEmpty']] | undefined {
    if (!this.context.rowContext.isValidKey(row)) return undefined;

    let newSize = this.size;
    let removedRow: TpR['rowNonEmpty'] | undefined;

    const newRows = this.rowMap.modifyAt(row, {
      ifExists: (columns, remove): typeof remove => {
        removedRow = columns;
        newSize -= columns.size;
        return remove;
      },
    });

    if (undefined === removedRow) return undefined;

    const newSelf = this.copyE(newRows, newSize);
    return [newSelf, removedRow];
  }

  removeEntries<UR, UC>(
    entries: StreamSource<[RelatedTo<R, UR>, RelatedTo<C, UC>]>
  ): TpR['normal'] {
    if (StreamSource.isEmptyInstance(entries)) return this as any;

    const builder = this.toBuilder();

    builder.removeEntries(entries);
    return builder.build() as TpR['normal'];
  }

  forEach(
    f: (entry: [R, C, V], index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted) return;

    const rowIt = this.rowMap[Symbol.iterator]();
    let rowEntry: readonly [R, TpR['rowNonEmpty']] | undefined;

    const { halt } = state;

    while (!state.halted && undefined !== (rowEntry = rowIt.fastNext())) {
      const columnIt = rowEntry[1][Symbol.iterator]();
      let columnEntry: readonly [C, V] | undefined;

      while (
        !state.halted &&
        undefined !== (columnEntry = columnIt.fastNext())
      ) {
        f(
          [rowEntry[0], columnEntry[0], columnEntry[1]],
          state.nextIndex(),
          halt
        );
      }
    }
  }

  filter(
    pred: (entry: [R, C, V], index: number, halt: () => void) => boolean
  ): TpR['normal'] {
    const builder = this.context.builder<R, C, V>();

    builder.addEntries(this.stream().filter(pred));

    if (builder.size === this.size) return this as any;

    return builder.build() as TpR['normal'];
  }

  filterRows(
    pred: (
      entry: readonly [R, TpR['rowNonEmpty']],
      index: number,
      halt: () => void
    ) => boolean
  ): TpR['normal'] {
    let newSize = 0;
    const newRowMap = this.rowMap.filter((e, i, halt): boolean => {
      const result = pred(e, i, halt);
      if (result) newSize += e[1].size;
      return result;
    });

    return this.copyE(newRowMap, newSize);
  }

  mapValues<V2>(
    mapFun: (value: V, row: R, column: C) => V2
  ): (Tp & CB.Row<R, C, V2>)['nonEmpty'] {
    return this.copy(
      this.rowMap.mapValues(
        (row, r): RMap.NonEmpty<C, V2> =>
          row.mapValues((v, c): V2 => mapFun(v, r, c))
      ) as any,
      this.size
    );
  }

  toArray(): ArrayNonEmpty<[R, C, V]> {
    const result: [R, C, V][] = [];

    const rowIt = this.rowMap.stream()[Symbol.iterator]();
    let rowEntry: readonly [R, TpR['rowNonEmpty']] | undefined;

    while (undefined !== (rowEntry = rowIt.fastNext())) {
      const columnIt = rowEntry[1].stream()[Symbol.iterator]();
      let columnEntry: readonly [C, V] | undefined;

      while (undefined !== (columnEntry = columnIt.fastNext())) {
        result.push([rowEntry[0], columnEntry[0], columnEntry[1]]);
      }
    }

    return result as ArrayNonEmpty<[R, C, V]>;
  }

  toString(): string {
    return this.stream().join({
      start: `${this.context.typeTag}(`,
      sep: `, `,
      end: `)`,
      valueToString: (entry) => `[${entry[0]}, ${entry[1]}] -> ${entry[2]}`,
    });
  }

  toJSON(): ToJSON<[R, [C, V][]][]> {
    return {
      dataType: this.context.typeTag,
      value: this.rowMap
        .stream()
        .map((entry) => [entry[0], entry[1].toJSON().value] as [R, [C, V][]])
        .toArray(),
    };
  }

  toBuilder(): TpR['builder'] {
    return this.context.createBuilder(this as any);
  }

  extendValues(): any {
    return this;
  }
}

export class TableBuilder<
  R,
  C,
  V,
  Tp extends ContextImplTypes,
  TpR extends Tp & CB.Row<R, C, V> = Tp & CB.Row<R, C, V>
> implements TableBase.Builder<R, C, V>
{
  _lock = 0;
  _size = 0;

  constructor(
    readonly context: TpR['context'],
    public source?: Table.NonEmpty<R, C, V>
  ) {
    if (undefined !== source) this._size = source.size;
  }

  _rowMap?: RMap.Builder<R, RMap.Builder<C, V>>;

  get rowMap(): RMap.Builder<R, RMap.Builder<C, V>> {
    if (undefined === this._rowMap) {
      if (undefined === this.source) {
        this._rowMap = this.context.rowContext.builder();
      } else {
        this._rowMap = this.source.rowMap
          .mapValues((v) => v.toBuilder())
          .toBuilder();
      }
    }

    return this._rowMap;
  }

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  get amountRows(): number {
    return this.source?.amountRows ?? this.rowMap.size;
  }

  get = <UR, UC, O>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>,
    otherwise?: OptLazy<O>
  ): V | O => {
    if (undefined !== this.source) {
      return this.source.get(row, column, otherwise!);
    }

    const token = Symbol();
    const result = this.rowMap.get(row, token);
    if (token === result) return OptLazy(otherwise) as O;
    return result.get<UC, O>(column, otherwise!);
  };

  getRow = <UR>(row: RelatedTo<R, UR>): any => {
    if (undefined !== this.source) return this.source.getRow(row);

    const token = Symbol();
    const result = this.rowMap.get(row, token);
    if (token === result) return this.context.columnContext.empty();
    return result.build();
  };

  hasValueAt = <UR, UC>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>
  ): boolean => {
    if (undefined !== this.source) return this.source.hasValueAt(row, column);

    const token = Symbol();
    return token !== this.get(row, column, token);
  };

  hasRowKey = <UR>(row: RelatedTo<R, UR>): boolean => {
    return this.source?.hasRowKey(row) ?? this.rowMap.hasKey(row);
  };

  set = (row: R, column: C, value: V): boolean => {
    this.checkLock();

    let columnBuilder: RMap.Builder<C, V> = undefined as any;

    this.rowMap.modifyAt(row, {
      ifNew: (): RMap.Builder<C, V> => {
        columnBuilder = this.context.columnContext.builder();
        return columnBuilder;
      },
      ifExists: (b): RMap.Builder<C, V> => {
        columnBuilder = b;
        return b;
      },
    });

    let changed = true;

    columnBuilder.modifyAt(column, {
      ifNew: (): V => {
        this._size++;
        return value;
      },
      ifExists: (currentValue): V => {
        if (Object.is(currentValue, value)) changed = false;
        return value;
      },
    });

    if (changed) this.source = undefined;

    return changed;
  };

  addEntry = (entry: readonly [R, C, V]): boolean => {
    return this.set(entry[0], entry[1], entry[2]);
  };

  addEntries = (source: StreamSource<readonly [R, C, V]>): boolean => {
    this.checkLock();

    return Stream.applyFilter(source, this.set).count() > 0;
  };

  remove = <UR, UC, O>(
    row: RelatedTo<R, UR>,
    column: RelatedTo<C, UC>,
    otherwise?: OptLazy<O>
  ): V | O => {
    this.checkLock();

    const columnMap = this.rowMap.get(row);
    if (undefined === columnMap) return OptLazy(otherwise) as O;

    if (!this.context.columnContext.isValidKey(column)) {
      return OptLazy(otherwise) as O;
    }

    let removedValue: V | Token = Token;

    columnMap.modifyAt(column, {
      ifExists: (currentValue, remove): typeof remove => {
        removedValue = currentValue;
        this._size--;
        return remove;
      },
    });

    if (columnMap.isEmpty) this.rowMap.removeKey(row);

    if (Token === removedValue) return OptLazy(otherwise) as O;

    this.source = undefined;

    return removedValue;
  };

  removeRow = <UR>(row: RelatedTo<R, UR>): boolean => {
    this.checkLock();

    if (!this.context.rowContext.isValidKey(row)) return false;

    return this.rowMap.modifyAt(row, {
      ifExists: (row, remove): typeof remove => {
        this.source = undefined;
        this._size -= row.size;
        return remove;
      },
    });
  };

  removeRows = <UR>(rows: StreamSource<RelatedTo<R, UR>>): boolean => {
    this.checkLock();

    return Stream.from(rows).filterPure(this.removeRow).count() > 0;
  };

  removeEntries = <UR = R, UC = C>(
    entries: StreamSource<[RelatedTo<R, UR>, RelatedTo<C, UC>]>
  ): boolean => {
    this.checkLock();

    const notFound = Symbol();

    return (
      Stream.applyMap(entries, this.remove, notFound).countNotElement(
        notFound
      ) > 0
    );
  };

  modifyAt = (
    row: R,
    column: C,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentValue: V, remove: Token) => V | Token;
    }
  ): boolean => {
    this.checkLock();

    let changed = false;

    const { ifNew, ifExists } = options;

    const passOptions: {
      ifNew?: (none: Token) => RMap.Builder<C, V> | Token;
      ifExists?: (
        currentValue: RMap.Builder<C, V>,
        remove: typeof Token
      ) => typeof Token | RMap.Builder<C, V>;
    } = {};

    if (undefined !== ifNew) {
      passOptions.ifNew = (none): RMap.Builder<C, V> | Token => {
        const columnBuilder = this.context.columnContext.builder<C, V>();
        changed = columnBuilder.modifyAt(column, options);

        if (!changed) return none;

        return columnBuilder;
      };
    }

    if (undefined !== ifExists) {
      passOptions.ifExists = (
        columnBuilder,
        remove
      ): RMap.Builder<C, V> | typeof remove => {
        changed = columnBuilder.modifyAt(column, options);
        if (columnBuilder.isEmpty) return remove;
        return columnBuilder;
      };
    }

    this.rowMap.modifyAt(row, passOptions);

    if (changed) this.source = undefined;

    return changed;
  };

  updateAt = <O>(
    row: R,
    column: C,
    update: Update<V>,
    otherwise?: OptLazy<O>
  ): V | O => {
    this.checkLock();

    let oldValue: V;
    let found = false;

    this.modifyAt(row, column, {
      ifExists: (value): V => {
        oldValue = value;
        found = true;
        return Update(value, update);
      },
    });

    if (!found) return OptLazy(otherwise) as O;

    this.source = undefined;

    return oldValue!;
  };

  forEach = (
    f: (entry: [R, C, V], index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void => {
    if (state.halted) return;

    this._lock++;

    if (undefined !== this.source) {
      this.source.forEach(f, state);
    } else {
      const { halt } = state;

      this.rowMap.forEach(([rowKey, column], _, rowHalt): void => {
        column.forEach(([columnKey, value], _, columnHalt): void => {
          f([rowKey, columnKey, value], state.nextIndex(), halt);
          if (state.halted) {
            rowHalt();
            columnHalt();
          }
        });
      });
    }

    this._lock--;
  };

  build = (): TableBase<R, C, V, TableBase.Types> => {
    if (undefined !== this.source) return this.source;

    if (this.isEmpty) return this.context.empty() as any;

    return this.context.createNonEmpty<R, C, V>(
      this.rowMap
        .buildMapValues((row) => row.build().assumeNonEmpty())
        .assumeNonEmpty(),
      this.size
    ) as any;
  };

  buildMapValues = <V2>(
    mapFun: (value: V, row: R, column: C) => V2
  ): TableBase<R, C, V2, TableBase.Types> => {
    if (undefined !== this.source) return this.source.mapValues<V2>(mapFun);

    if (this.isEmpty) return this.context.empty() as any;

    const newRowMap = this.rowMap
      .buildMapValues((row, rowKey) =>
        row
          .buildMapValues((value, columnKey) =>
            mapFun(value, rowKey, columnKey)
          )
          .assumeNonEmpty()
      )
      .assumeNonEmpty();

    return this.context.createNonEmpty<R, C, V2>(
      newRowMap as any,
      this.size
    ) as any;
  };
}

export class TableContext<UR, UC, N extends string, Tp extends ContextImplTypes>
  implements TableBase.Context<UR, UC, Tp>
{
  constructor(
    readonly typeTag: N,
    readonly rowContext: CB.WithRow<Tp, UR, UC, any>['rowContext'],
    readonly columnContext: CB.WithRow<Tp, UR, UC, any>['columnContext']
  ) {}

  get _types(): Tp {
    return undefined as any;
  }

  readonly _empty = new TableEmpty<UR, UC, any, Tp>(this) as CB.WithRow<
    Tp,
    UR,
    UC,
    any
  >['normal'];

  isNonEmptyInstance<R, C, V>(
    source: any
  ): source is CB.WithRow<Tp, R, C, V>['nonEmpty'] {
    return source instanceof TableNonEmpty;
  }

  createNonEmpty<R extends UR, C extends UC, V>(
    rowMap: CB.WithRow<Tp, R, C, V>['rowMapNonEmpty'],
    size: number
  ): CB.WithRow<Tp, R, C, V>['nonEmpty'] {
    return new TableNonEmpty<R, C, V, Tp>(this, rowMap, size) as (Tp &
      CB.Row<R, C, V>)['nonEmpty'];
  }

  empty = <R extends UR, C extends UC, V>(): CB.WithRow<
    Tp,
    R,
    C,
    V
  >['normal'] => {
    return this._empty;
  };

  from: any = <R extends UR, C extends UC, V>(
    ...sources: ArrayNonEmpty<StreamSource<readonly [R, C, V]>>
  ): CB.WithRow<Tp, R, C, V>['normal'] => {
    let builder = this.builder<R, C, V>();

    let i = -1;
    const length = sources.length;

    while (++i < length) {
      const source = sources[i];

      if (StreamSource.isEmptyInstance(source)) continue;
      if (
        builder.isEmpty &&
        this.isNonEmptyInstance<R, C, V>(source) &&
        source.context === (this as any)
      ) {
        if (i === length - 1) return source;
        builder = source.toBuilder();
        continue;
      }

      builder.addEntries(source);
    }

    return builder.build();
  };

  of: any = <R extends UR, C extends UC, V>(
    ...entries: ArrayNonEmpty<readonly [R, C, V]>
  ): [R, C] extends [UR, UC] ? CB.WithRow<Tp, R, C, V>['nonEmpty'] : never => {
    return this.from(entries);
  };

  builder = <R extends UR, C extends UC, V>(): CB.WithRow<
    Tp,
    R,
    C,
    V
  >['builder'] => {
    return new TableBuilder<R, C, V, Tp>(this) as CB.WithRow<
      Tp,
      R,
      C,
      V
    >['builder'];
  };

  createBuilder<R extends UR, C extends UC, V>(
    source?: Table.NonEmpty<R, C, V>
  ): CB.WithRow<Tp, R, C, V>['builder'] {
    return new TableBuilder<R, C, V, Tp>(this, source) as CB.WithRow<
      Tp,
      R,
      C,
      V
    >['builder'];
  }
}
