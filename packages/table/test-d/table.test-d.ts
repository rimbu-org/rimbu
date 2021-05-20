import { RMap, VariantMap } from '@rimbu/collection-types';
import { ArrayNonEmpty } from '@rimbu/common';
import { FastIterator, Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
import { Table, VariantTable } from '../src';

type VE<R, C, V> = VariantTable<R, C, V>;
type VNE<R, C, V> = VariantTable.NonEmpty<R, C, V>;
type GE<R, C, V> = Table<R, C, V>;
type GNE<R, C, V> = Table.NonEmpty<R, C, V>;

type V_Empty = VE<number, string, boolean>;
type V_NonEmpty = VNE<number, string, boolean>;
type G_Empty = GE<number, string, boolean>;
type G_NonEmpty = GNE<number, string, boolean>;

const varEmpty: V_Empty = undefined as any;
const varNonEmpty: V_NonEmpty = undefined as any;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectAssignable<V_Empty>(varNonEmpty);
expectAssignable<V_Empty>(genEmpty);
expectAssignable<V_Empty>(genNonEmpty);

expectAssignable<V_NonEmpty>(genNonEmpty);
expectNotAssignable<V_NonEmpty>(varEmpty);
expectNotAssignable<V_NonEmpty>(genEmpty);

expectAssignable<G_Empty>(genNonEmpty);
expectNotAssignable<G_Empty>(varEmpty);
expectAssignable<G_NonEmpty>(genNonEmpty);
expectNotAssignable<G_NonEmpty>(varEmpty);
expectNotAssignable<G_NonEmpty>(genEmpty);

// Test variance
expectAssignable<VE<number | string, string, boolean>>(varEmpty);
expectAssignable<VE<number, string | boolean, boolean>>(varEmpty);
expectAssignable<VE<number | string, string, boolean | number>>(varEmpty);
expectAssignable<VE<number | string, string | boolean, boolean | number>>(
  varEmpty
);
expectAssignable<VNE<number | string, string, boolean>>(varNonEmpty);
expectAssignable<VNE<number, string | boolean, boolean>>(varNonEmpty);
expectAssignable<VNE<number | string, string | boolean, boolean>>(varNonEmpty);

expectAssignable<VE<number | string, string | boolean, boolean>>(genEmpty);
expectAssignable<VE<number | string, string | boolean, boolean>>(genNonEmpty);
expectAssignable<VNE<number | string, string | boolean, boolean>>(genNonEmpty);

expectNotAssignable<GE<number | string, string, boolean>>(genEmpty);
expectNotAssignable<GE<number, string | boolean, boolean>>(genEmpty);
expectNotAssignable<GE<number, string, boolean | number>>(genEmpty);
expectNotAssignable<GNE<number | string, string, boolean>>(genNonEmpty);
expectNotAssignable<GNE<number, string | boolean, boolean>>(genNonEmpty);
expectNotAssignable<GNE<number, string, boolean | number>>(genNonEmpty);

let m!: any;
expectNotAssignable<V_Empty>(m as VE<number | string, string, boolean>);
expectNotAssignable<V_Empty>(m as VE<number, string | number, boolean>);
expectNotAssignable<V_Empty>(m as VE<number, string, boolean | number>);
expectNotAssignable<V_NonEmpty>(m as VNE<number | string, string, boolean>);
expectNotAssignable<V_NonEmpty>(m as VNE<number, string | number, boolean>);
expectNotAssignable<V_NonEmpty>(m as VNE<number, string, boolean | number>);

expectNotAssignable<G_Empty>(m as GE<number | string, string, boolean>);
expectNotAssignable<G_Empty>(m as GE<number, string | number, boolean>);
expectNotAssignable<G_Empty>(m as GE<number, string, boolean | number>);
expectNotAssignable<G_NonEmpty>(m as GNE<number | string, string, boolean>);
expectNotAssignable<G_NonEmpty>(m as GNE<number, string | number, boolean>);
expectNotAssignable<G_NonEmpty>(m as GNE<number, string, boolean | number>);

// Iterator
expectType<FastIterator<[number, string, boolean]>>(
  varEmpty[Symbol.iterator]()
);
expectType<FastIterator<[number, string, boolean]>>(
  varNonEmpty[Symbol.iterator]()
);
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
expectType<Table.Context<number, string>>(genEmpty.context);
expectType<Table.Context<number, string>>(genNonEmpty.context);

// .filter(..)
expectType<V_Empty>(varEmpty.filter(() => true));
expectType<V_Empty>(varNonEmpty.filter(() => true));
expectType<G_Empty>(genEmpty.filter(() => true));
expectType<G_Empty>(genNonEmpty.filter(() => true));

// .filterRows(..)
expectType<V_Empty>(varEmpty.filterRows(() => true));
expectType<V_Empty>(varNonEmpty.filterRows(() => true));
expectType<G_Empty>(genEmpty.filterRows(() => true));
expectType<G_Empty>(genNonEmpty.filterRows(() => true));

// .get(..)
expectType<boolean | undefined>(varEmpty.get(2, 'a'));
expectType<boolean | undefined>(varNonEmpty.get(2, 'a'));
expectType<boolean>(varEmpty.get(2, 'a', false));
expectType<boolean>(varNonEmpty.get(2, 'a', false));
expectType<boolean | undefined>(genEmpty.get(2, 'a'));
expectType<boolean | undefined>(genNonEmpty.get(2, 'a'));
expectType<boolean>(genEmpty.get(2, 'a', false));
expectType<boolean>(genNonEmpty.get(2, 'a', false));

expectType<boolean | string>(varEmpty.get(2, 'a', 'b' as string));
expectType<boolean | string>(varNonEmpty.get(2, 'a', 'b' as string));
expectType<boolean | string>(genEmpty.get(2, 'a', 'b' as string));
expectType<boolean | string>(genNonEmpty.get(2, 'a', 'b' as string));

// .getRow(..)
expectType<VariantMap<string, boolean>>(varEmpty.getRow(2));
expectType<VariantMap<string, boolean>>(varNonEmpty.getRow(2));
expectType<RMap<string, boolean>>(genEmpty.getRow(2));
expectType<RMap<string, boolean>>(genNonEmpty.getRow(2));

// .isEmpty
expectType<boolean>(varEmpty.isEmpty);
expectType<false>(varNonEmpty.isEmpty);
expectType<boolean>(genEmpty.isEmpty);
expectType<false>(genNonEmpty.isEmpty);

// .mapValues(..)
expectType<VariantTable<number, string, number>>(varEmpty.mapValues(() => 10));
expectType<VariantTable.NonEmpty<number, string, number>>(
  varNonEmpty.mapValues(() => 10)
);
expectType<Table<number, string, number>>(genEmpty.mapValues(() => 10));
expectType<Table.NonEmpty<number, string, number>>(
  genNonEmpty.mapValues(() => 10)
);

// .modifyAt(..)
expectType<G_Empty>(genEmpty.modifyAt(2, 'a', {}));
expectType<G_Empty>(genNonEmpty.modifyAt(2, 'a', {}));

// .nonEmpty()
expectType<boolean>(varEmpty.nonEmpty());
expectType<true>(varNonEmpty.nonEmpty());
expectType<boolean>(genEmpty.nonEmpty());
expectType<true>(genNonEmpty.nonEmpty());

// .remove(..)
expectType<V_Empty>(varEmpty.remove(3, 'a'));
expectType<V_Empty>(varNonEmpty.remove(3, 'a'));
expectType<G_Empty>(genEmpty.remove(3, 'a'));
expectType<G_Empty>(genNonEmpty.remove(3, 'a'));

// .removeAndGet(..)
expectType<[V_Empty, boolean] | undefined>(varEmpty.removeAndGet(3, 'a'));
expectType<[V_Empty, boolean] | undefined>(varNonEmpty.removeAndGet(3, 'a'));
expectType<[G_Empty, boolean] | undefined>(genEmpty.removeAndGet(3, 'a'));
expectType<[G_Empty, boolean] | undefined>(genNonEmpty.removeAndGet(3, 'a'));

// .removeEntries(..)
expectType<V_Empty>(varEmpty.removeEntries([[3, 'a']]));
expectType<V_Empty>(varNonEmpty.removeEntries([[3, 'a']]));
expectType<G_Empty>(genEmpty.removeEntries([[3, 'a']]));
expectType<G_Empty>(genNonEmpty.removeEntries([[3, 'a']]));

// .removeRow(..)
expectType<V_Empty>(varEmpty.removeRow(3));
expectType<V_Empty>(varNonEmpty.removeRow(3));
expectType<G_Empty>(genEmpty.removeRow(3));
expectType<G_Empty>(genNonEmpty.removeRow(3));

// .removeRowAndGet(..)
expectType<[V_Empty, VariantMap.NonEmpty<string, boolean>] | undefined>(
  varEmpty.removeRowAndGet(3)
);
expectType<[V_Empty, VariantMap.NonEmpty<string, boolean>] | undefined>(
  varNonEmpty.removeRowAndGet(3)
);
expectType<[G_Empty, RMap.NonEmpty<string, boolean>] | undefined>(
  genEmpty.removeRowAndGet(3)
);
expectType<[G_Empty, RMap.NonEmpty<string, boolean>] | undefined>(
  genNonEmpty.removeRowAndGet(3)
);

// .removeRows(..)
expectType<V_Empty>(varEmpty.removeRows([3]));
expectType<V_Empty>(varNonEmpty.removeRows([3]));
expectType<G_Empty>(genEmpty.removeRows([3]));
expectType<G_Empty>(genNonEmpty.removeRows([3]));

// .rowMap
expectType<RMap<number, RMap.NonEmpty<string, boolean>>>(genEmpty.rowMap);
expectAssignable<RMap.NonEmpty<number, RMap.NonEmpty<string, boolean>>>(
  genNonEmpty.rowMap
);

// .set(..)
expectType<G_NonEmpty>(genEmpty.set(1, 'a', true));
expectType<G_NonEmpty>(genNonEmpty.set(1, 'a', true));

// .stream()
expectType<Stream<[number, string, boolean]>>(varEmpty.stream());
expectType<Stream.NonEmpty<[number, string, boolean]>>(varNonEmpty.stream());
expectType<Stream<[number, string, boolean]>>(genEmpty.stream());
expectType<Stream.NonEmpty<[number, string, boolean]>>(genNonEmpty.stream());

// .streamRows()
expectType<Stream<number>>(varEmpty.streamRows());
expectType<Stream.NonEmpty<number>>(varNonEmpty.streamRows());
expectType<Stream<number>>(genEmpty.streamRows());
expectType<Stream.NonEmpty<number>>(genNonEmpty.streamRows());

// .streamValues()
expectType<Stream<boolean>>(varEmpty.streamValues());
expectType<Stream.NonEmpty<boolean>>(varNonEmpty.streamValues());
expectType<Stream<boolean>>(genEmpty.streamValues());
expectType<Stream.NonEmpty<boolean>>(genNonEmpty.streamValues());

// .toArray()
expectType<[number, string, boolean][]>(varEmpty.toArray());
expectType<ArrayNonEmpty<[number, string, boolean]>>(varNonEmpty.toArray());
expectType<[number, string, boolean][]>(genEmpty.toArray());
expectType<ArrayNonEmpty<[number, string, boolean]>>(genNonEmpty.toArray());

// .toBuilder()
expectType<Table.Builder<number, string, boolean>>(genEmpty.toBuilder());
expectType<Table.Builder<number, string, boolean>>(genNonEmpty.toBuilder());

// .updateAt(..)
expectType<G_Empty>(genEmpty.updateAt(2, 'b', true));
expectType<G_NonEmpty>(genNonEmpty.updateAt(2, 'b', true));

// From Builder
expectType<G_Empty>(genEmpty.toBuilder().build());
