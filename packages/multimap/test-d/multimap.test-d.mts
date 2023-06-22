import type {
  RMap,
  RSet,
  VariantMap,
  VariantSet,
} from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { FastIterator, Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
import type { MultiMap, VariantMultiMap } from '@rimbu/multimap';

type VE<K, V> = VariantMultiMap<K, V>;
type VNE<K, V> = VariantMultiMap.NonEmpty<K, V>;
type GE<K, V> = MultiMap<K, V>;
type GNE<K, V> = MultiMap.NonEmpty<K, V>;

type V_Empty = VE<number, string>;
type V_NonEmpty = VNE<number, string>;
type G_Empty = GE<number, string>;
type G_NonEmpty = GNE<number, string>;

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

// Test variance
expectAssignable<VE<number | string, string>>(varEmpty);
expectAssignable<VE<number, string | boolean>>(varEmpty);
expectAssignable<VE<number | string, string | boolean>>(varEmpty);
expectAssignable<VNE<number | string, string>>(varNonEmpty);
expectAssignable<VNE<number, string | boolean>>(varNonEmpty);
expectAssignable<VNE<number | string, string | boolean>>(varNonEmpty);

expectAssignable<VE<number | string, string | boolean>>(genEmpty);
expectAssignable<VE<number | string, string | boolean>>(genNonEmpty);
expectAssignable<VNE<number | string, string | boolean>>(genNonEmpty);

expectNotAssignable<GE<number | string, string>>(genEmpty);
expectNotAssignable<GE<number, string | boolean>>(genEmpty);
expectNotAssignable<GNE<number | string, string>>(genNonEmpty);
expectNotAssignable<GNE<number, string | boolean>>(genNonEmpty);

let m!: any;
expectNotAssignable<V_Empty>(m as VE<number | string, string>);
expectNotAssignable<V_Empty>(m as VE<number | string, string>);
expectNotAssignable<V_NonEmpty>(m as VNE<number | string, string>);
expectNotAssignable<V_NonEmpty>(m as VNE<number | string, string>);

expectNotAssignable<G_Empty>(m as GE<number | string, string>);
expectNotAssignable<G_Empty>(m as GE<number, string | number>);
expectNotAssignable<G_NonEmpty>(m as GNE<number | string, string>);
expectNotAssignable<G_NonEmpty>(m as GNE<number, string | number>);

// Iterator
expectType<FastIterator<[number, string]>>(varEmpty[Symbol.iterator]());
expectType<FastIterator<[number, string]>>(varNonEmpty[Symbol.iterator]());
expectType<FastIterator<[number, string]>>(genEmpty[Symbol.iterator]());
expectType<FastIterator<[number, string]>>(genNonEmpty[Symbol.iterator]());

// .add(..)
expectType<G_NonEmpty>(genEmpty.add(1, 'a'));
expectType<G_NonEmpty>(genNonEmpty.add(1, 'a'));

// .addEntries(..)
expectType<G_Empty>(genEmpty.addEntries([]));
expectType<G_NonEmpty>(genEmpty.addEntries([[1, 'a']]));
expectType<G_NonEmpty>(genNonEmpty.addEntries([]));
expectType<G_NonEmpty>(genNonEmpty.addEntries([[1, 'a']]));

// .assumeNonEmpty()
expectType<V_NonEmpty>(varEmpty.assumeNonEmpty());
expectType<V_NonEmpty>(varNonEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genNonEmpty.assumeNonEmpty());

// .context
expectType<MultiMap.Context<number, string>>(genEmpty.context);
expectType<MultiMap.Context<number, string>>(genNonEmpty.context);

// .filter(..)
expectType<V_Empty>(varEmpty.filter(() => true));
expectType<V_Empty>(varNonEmpty.filter(() => true));
expectType<G_Empty>(genEmpty.filter(() => true));
expectType<G_Empty>(genNonEmpty.filter(() => true));

// .getValues(..)
expectType<RSet<string>>(genEmpty.getValues(1));
expectType<RSet<string>>(genNonEmpty.getValues(1));

// .isEmpty
expectType<boolean>(varEmpty.isEmpty);
expectType<false>(varNonEmpty.isEmpty);
expectType<boolean>(genEmpty.isEmpty);
expectType<false>(genNonEmpty.isEmpty);

// .keyMap
expectType<VariantMap<number, VariantSet.NonEmpty<string>>>(varEmpty.keyMap);
expectType<VariantMap.NonEmpty<number, VariantSet.NonEmpty<string>>>(
  varNonEmpty.keyMap
);
expectType<RMap<number, RSet.NonEmpty<string>>>(genEmpty.keyMap);
expectAssignable<RMap.NonEmpty<number, RSet.NonEmpty<string>>>(
  genNonEmpty.keyMap
);

// .nonEmpty()
expectType<boolean>(varEmpty.nonEmpty());
expectType<true>(varNonEmpty.nonEmpty());
expectType<boolean>(genEmpty.nonEmpty());
expectType<true>(genNonEmpty.nonEmpty());

// .removeKey(..)
expectType<V_Empty>(varEmpty.removeEntries([[3, 'a']]));
expectType<V_Empty>(varNonEmpty.removeEntries([[3, 'a']]));
expectType<G_Empty>(genEmpty.removeEntries([[3, 'a']]));
expectType<G_Empty>(genNonEmpty.removeEntries([[3, 'a']]));

// .removeEntry(..)
expectType<V_Empty>(varEmpty.removeEntry(3, 'a'));
expectType<V_Empty>(varNonEmpty.removeEntry(3, 'a'));
expectType<G_Empty>(genEmpty.removeEntry(3, 'a'));
expectType<G_Empty>(genNonEmpty.removeEntry(3, 'a'));

// .removeKey(..)
expectType<V_Empty>(varEmpty.removeKey(3));
expectType<V_Empty>(varNonEmpty.removeKey(3));
expectType<G_Empty>(genEmpty.removeKey(3));
expectType<G_Empty>(genNonEmpty.removeKey(3));

// .removeKeyAndGet(..)
expectType<[V_Empty, VariantSet.NonEmpty<string>] | undefined>(
  varEmpty.removeKeyAndGet(3)
);
expectType<[V_Empty, VariantSet.NonEmpty<string>] | undefined>(
  varNonEmpty.removeKeyAndGet(3)
);
expectType<[G_Empty, RSet.NonEmpty<string>] | undefined>(
  genEmpty.removeKeyAndGet(3)
);
expectType<[G_Empty, RSet.NonEmpty<string>] | undefined>(
  genNonEmpty.removeKeyAndGet(3)
);

// .removeKeys(..)
expectType<V_Empty>(varEmpty.removeKeys([3, 4]));
expectType<V_Empty>(varNonEmpty.removeKeys([3, 4]));
expectType<G_Empty>(genEmpty.removeKeys([3, 4]));
expectType<G_Empty>(genNonEmpty.removeKeys([3, 4]));

// .setValues(..)
expectType<G_Empty>(genEmpty.setValues(1, []));
expectType<G_NonEmpty>(genEmpty.setValues(1, ['a']));
expectType<G_Empty>(genNonEmpty.setValues(1, []));
expectType<G_NonEmpty>(genNonEmpty.setValues(1, ['a']));

// .stream()
expectType<Stream<[number, string]>>(varEmpty.stream());
expectType<Stream.NonEmpty<[number, string]>>(varNonEmpty.stream());
expectType<Stream<[number, string]>>(genEmpty.stream());
expectType<Stream.NonEmpty<[number, string]>>(genNonEmpty.stream());

// .streamKeys()
expectType<Stream<number>>(varEmpty.streamKeys());
expectType<Stream.NonEmpty<number>>(varNonEmpty.streamKeys());
expectType<Stream<number>>(genEmpty.streamKeys());
expectType<Stream.NonEmpty<number>>(genNonEmpty.streamKeys());

// .streamValues()
expectType<Stream<string>>(varEmpty.streamValues());
expectType<Stream.NonEmpty<string>>(varNonEmpty.streamValues());
expectType<Stream<string>>(genEmpty.streamValues());
expectType<Stream.NonEmpty<string>>(genNonEmpty.streamValues());

// .toArray()
expectType<[number, string][]>(varEmpty.toArray());
expectType<ArrayNonEmpty<[number, string]>>(varNonEmpty.toArray());
expectType<[number, string][]>(genEmpty.toArray());
expectType<ArrayNonEmpty<[number, string]>>(genNonEmpty.toArray());

// .toBuilder()
expectType<MultiMap.Builder<number, string>>(genEmpty.toBuilder());
expectType<MultiMap.Builder<number, string>>(genNonEmpty.toBuilder());

// From Builder
expectType<G_Empty>(genEmpty.toBuilder().build());
