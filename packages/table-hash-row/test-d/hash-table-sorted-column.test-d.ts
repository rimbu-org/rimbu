import type { ArrayNonEmpty } from '@rimbu/common';
import type { HashMap } from '@rimbu/hashed';
import type { SortedMap } from '@rimbu/sorted';
import type { FastIterator, Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
import type { HashTableSortedColumn } from '../src';

type GE<R, C, V> = HashTableSortedColumn<R, C, V>;
type GNE<R, C, V> = HashTableSortedColumn.NonEmpty<R, C, V>;

type G_Empty = GE<number, string, boolean>;
type G_NonEmpty = GNE<number, string, boolean>;

type Context = HashTableSortedColumn.Context<number, string>;
type RowType = SortedMap<string, boolean>;
type RowType_NE = SortedMap.NonEmpty<string, boolean>;
type Builder = HashTableSortedColumn.Builder<number, string, boolean>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectAssignable<G_Empty>(genNonEmpty);
expectAssignable<G_NonEmpty>(genNonEmpty);
expectNotAssignable<G_NonEmpty>(genEmpty);

// Test variance
expectNotAssignable<GE<number | string, string, boolean>>(genEmpty);
expectNotAssignable<GE<number, string | boolean, boolean>>(genEmpty);
expectNotAssignable<GNE<number | string, string, boolean>>(genNonEmpty);
expectNotAssignable<GNE<number, string | boolean, boolean>>(genNonEmpty);

let m!: any;
expectNotAssignable<G_Empty>(m as GE<number | string, string, boolean>);
expectNotAssignable<G_Empty>(m as GE<number, string | number, boolean>);
expectNotAssignable<G_Empty>(m as GE<number, string, boolean | number>);
expectNotAssignable<G_NonEmpty>(m as GNE<number | string, string, boolean>);
expectNotAssignable<G_NonEmpty>(m as GNE<number, string | number, boolean>);
expectNotAssignable<G_NonEmpty>(m as GNE<number, string, boolean | number>);

// Iterator
expectType<FastIterator<[number, string, boolean]>>(
  genEmpty[Symbol.iterator]()
);
expectType<FastIterator<[number, string, boolean]>>(
  genNonEmpty[Symbol.iterator]()
);

// .addEntries(..)
expectType<G_Empty>(genEmpty.addEntries(genEmpty));
expectType<G_NonEmpty>(genEmpty.addEntries(genNonEmpty));
expectType<G_NonEmpty>(genNonEmpty.addEntries(genEmpty));
expectType<G_NonEmpty>(genNonEmpty.addEntries(genNonEmpty));

// .addEntry(..)
expectType<G_NonEmpty>(genEmpty.addEntry([1, 'a', true]));
expectType<G_NonEmpty>(genNonEmpty.addEntry([1, 'a', true]));

// .context
expectType<Context>(genEmpty.context);
expectType<Context>(genNonEmpty.context);

// .filter(..)
expectType<G_Empty>(genEmpty.filter(() => true));
expectType<G_Empty>(genNonEmpty.filter(() => true));

// .filterRows(..)
expectType<G_Empty>(genEmpty.filterRows(() => true));
expectType<G_Empty>(genNonEmpty.filterRows(() => true));

// .get(..)
expectType<boolean | undefined>(genEmpty.get(2, 'a'));
expectType<boolean | undefined>(genNonEmpty.get(2, 'a'));
expectType<boolean>(genEmpty.get(2, 'a', false));
expectType<boolean>(genNonEmpty.get(2, 'a', false));

expectType<boolean | string>(genEmpty.get(2, 'a', 'b' as string));
expectType<boolean | string>(genNonEmpty.get(2, 'a', 'b' as string));

// .getRow(..)
expectType<RowType>(genEmpty.getRow(2));
expectType<RowType>(genNonEmpty.getRow(2));

// .isEmpty
expectType<boolean>(genEmpty.isEmpty);
expectType<false>(genNonEmpty.isEmpty);

// .mapValues(..)
expectType<GE<number, string, number>>(genEmpty.mapValues(() => 10));
expectType<GNE<number, string, number>>(genNonEmpty.mapValues(() => 10));

// .modifyAt(..)
expectType<G_Empty>(genEmpty.modifyAt(2, 'a', {}));
expectType<G_Empty>(genNonEmpty.modifyAt(2, 'a', {}));

// .nonEmpty()
expectType<boolean>(genEmpty.nonEmpty());
expectType<true>(genNonEmpty.nonEmpty());

// .remove(..)
expectType<G_Empty>(genEmpty.remove(3, 'a'));
expectType<G_Empty>(genNonEmpty.remove(3, 'a'));

// .removeAndGet(..)
expectType<[G_Empty, boolean] | undefined>(genEmpty.removeAndGet(3, 'a'));
expectType<[G_Empty, boolean] | undefined>(genNonEmpty.removeAndGet(3, 'a'));

// .removeEntries(..)
expectType<G_Empty>(genEmpty.removeEntries([[3, 'a']]));
expectType<G_Empty>(genNonEmpty.removeEntries([[3, 'a']]));

// .removeRow(..)
expectType<G_Empty>(genEmpty.removeRow(3));
expectType<G_Empty>(genNonEmpty.removeRow(3));

// .removeRowAndGet(..)
expectType<[G_Empty, RowType_NE] | undefined>(genEmpty.removeRowAndGet(3));
expectType<[G_Empty, RowType_NE] | undefined>(genNonEmpty.removeRowAndGet(3));

// .removeRows(..)
expectType<G_Empty>(genEmpty.removeRows([3]));
expectType<G_Empty>(genNonEmpty.removeRows([3]));

// .rowMap
expectAssignable<HashMap<number, RowType_NE>>(genEmpty.rowMap);
expectAssignable<HashMap.NonEmpty<number, RowType_NE>>(genNonEmpty.rowMap);

// .set(..)
expectType<G_NonEmpty>(genEmpty.set(1, 'a', true));
expectType<G_NonEmpty>(genNonEmpty.set(1, 'a', true));

// .stream()
expectType<Stream<[number, string, boolean]>>(genEmpty.stream());
expectType<Stream.NonEmpty<[number, string, boolean]>>(genNonEmpty.stream());

// .streamRows()
expectType<Stream<number>>(genEmpty.streamRows());
expectType<Stream.NonEmpty<number>>(genNonEmpty.streamRows());

// .streamValues()
expectType<Stream<boolean>>(genEmpty.streamValues());
expectType<Stream.NonEmpty<boolean>>(genNonEmpty.streamValues());

// .toArray()
expectType<[number, string, boolean][]>(genEmpty.toArray());
expectType<ArrayNonEmpty<[number, string, boolean]>>(genNonEmpty.toArray());

// .toBuilder()
expectType<Builder>(genEmpty.toBuilder());
expectType<Builder>(genNonEmpty.toBuilder());

// .updateAt(..)
expectType<G_Empty>(genEmpty.updateAt(2, 'b', true));
expectType<G_NonEmpty>(genNonEmpty.updateAt(2, 'b', true));

// From Builder
expectType<G_Empty>(genEmpty.toBuilder().build());
