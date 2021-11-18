import type { ArrayNonEmpty } from '@rimbu/common';
import type { FastIterator, Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
import type { RMap, VariantMap } from '../src';

type VE<K, V> = VariantMap<K, V>;
type VNE<K, V> = VariantMap.NonEmpty<K, V>;
type GE<K, V> = RMap<K, V>;
type GNE<K, V> = RMap.NonEmpty<K, V>;

type V_Empty = VE<number, string>;
type V_NonEmpty = VNE<number, string>;
type G_Empty = GE<number, string>;
type G_NonEmpty = GNE<number, string>;

let varEmpty!: V_Empty;
let varNonEmpty!: V_NonEmpty;

let genEmpty!: G_Empty;
let genNonEmpty!: G_NonEmpty;

expectAssignable<RMap<number, string | number>>(genEmpty);
expectNotAssignable<RMap<number | string, string>>(genEmpty);
expectNotAssignable<RMap<1, string>>(genEmpty);
expectNotAssignable<RMap<number, 'a'>>(genEmpty);

// Variant to Gen mappings
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
expectAssignable<GE<number, string | boolean>>(genEmpty);
expectNotAssignable<GNE<number | string, string>>(genNonEmpty);
expectAssignable<GNE<number, string | boolean>>(genNonEmpty);

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
expectType<FastIterator<readonly [number, string]>>(
  varEmpty[Symbol.iterator]()
);
expectType<FastIterator<readonly [number, string]>>(
  varNonEmpty[Symbol.iterator]()
);
expectType<FastIterator<readonly [number, string]>>(
  genEmpty[Symbol.iterator]()
);
expectType<FastIterator<readonly [number, string]>>(
  genNonEmpty[Symbol.iterator]()
);

// .addEntries(..)
expectType<G_Empty>(genEmpty.addEntries(genEmpty));
expectType<G_NonEmpty>(genEmpty.addEntries(genNonEmpty));
expectType<G_NonEmpty>(genNonEmpty.addEntries(genEmpty));
expectType<G_NonEmpty>(genNonEmpty.addEntries(genNonEmpty));

// .addEntry(..)
expectType<G_NonEmpty>(genEmpty.addEntry([1, 'a']));
expectType<G_NonEmpty>(genNonEmpty.addEntry([1, 'a']));

// .assumeNonEmpty()
expectType<V_NonEmpty>(varEmpty.assumeNonEmpty());
expectType<V_NonEmpty>(varNonEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genNonEmpty.assumeNonEmpty());

// .context
expectType<RMap.Context<number>>(genEmpty.context);
expectType<RMap.Context<number>>(genNonEmpty.context);

// .filter(..)
expectType<V_Empty>(varEmpty.filter(() => true));
expectType<V_Empty>(varNonEmpty.filter(() => true));
expectType<G_Empty>(genEmpty.filter(() => true));
expectType<G_Empty>(genNonEmpty.filter(() => true));

// .get(..)
expectType<string>(varEmpty.get(2, 'a'));
expectType<string>(varNonEmpty.get(2, 'a'));
expectType<string>(genEmpty.get(2, 'a'));
expectType<string>(genNonEmpty.get(2, 'a'));

expectType<string | boolean>(varEmpty.get(2, true as boolean));
expectType<string | boolean>(varNonEmpty.get(2, true as boolean));
expectType<string | boolean>(genEmpty.get(2, true as boolean));
expectType<string | boolean>(genNonEmpty.get(2, true as boolean));

// .isEmpty
expectType<boolean>(varEmpty.isEmpty);
expectType<false>(varNonEmpty.isEmpty);
expectType<boolean>(genEmpty.isEmpty);
expectType<false>(genNonEmpty.isEmpty);

// .mapValues(..)
expectType<VE<number, boolean>>(varEmpty.mapValues(() => true as boolean));
expectType<VNE<number, boolean>>(varNonEmpty.mapValues(() => true as boolean));
expectType<GE<number, boolean>>(genEmpty.mapValues(() => true as boolean));
expectType<GNE<number, boolean>>(genNonEmpty.mapValues(() => true as boolean));

// .modifyAt(..)
expectType<GE<number, string>>(genEmpty.modifyAt(2, {}));
expectType<GE<number, string>>(genNonEmpty.modifyAt(2, {}));

// .nonEmpty()
expectType<boolean>(varEmpty.nonEmpty());
expectType<true>(varNonEmpty.nonEmpty());
expectType<boolean>(genEmpty.nonEmpty());
expectType<true>(genNonEmpty.nonEmpty());

// .removeKey(..)
expectType<V_Empty>(varEmpty.removeKey(3));
expectType<V_Empty>(varNonEmpty.removeKey(3));
expectType<G_Empty>(genEmpty.removeKey(3));
expectType<G_Empty>(genNonEmpty.removeKey(3));

// .removeKeyAndGet(..)
expectType<[V_Empty, string] | undefined>(varEmpty.removeKeyAndGet(3));
expectType<[V_Empty, string] | undefined>(varNonEmpty.removeKeyAndGet(3));
expectType<[G_Empty, string] | undefined>(genEmpty.removeKeyAndGet(3));
expectType<[G_Empty, string] | undefined>(genNonEmpty.removeKeyAndGet(3));

// .removeKeys(..)
expectType<V_Empty>(varEmpty.removeKeys([3, 4]));
expectType<V_Empty>(varNonEmpty.removeKeys([3, 4]));
expectType<G_Empty>(genEmpty.removeKeys([3, 4]));
expectType<G_Empty>(genNonEmpty.removeKeys([3, 4]));

// .set(..)
expectType<G_NonEmpty>(genEmpty.set(1, 'a'));
expectType<G_NonEmpty>(genNonEmpty.set(1, 'a'));

// .stream()
expectType<Stream<readonly [number, string]>>(varEmpty.stream());
expectType<Stream.NonEmpty<readonly [number, string]>>(varNonEmpty.stream());
expectType<Stream<readonly [number, string]>>(genEmpty.stream());
expectType<Stream.NonEmpty<readonly [number, string]>>(genNonEmpty.stream());

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
expectType<(readonly [number, string])[]>(varEmpty.toArray());
expectType<ArrayNonEmpty<readonly [number, string]>>(varNonEmpty.toArray());
expectType<(readonly [number, string])[]>(genEmpty.toArray());
expectType<ArrayNonEmpty<readonly [number, string]>>(genNonEmpty.toArray());

// .toBuilder()
expectType<RMap.Builder<number, string>>(genEmpty.toBuilder());
expectType<RMap.Builder<number, string>>(genNonEmpty.toBuilder());

// .updateAt(..)
expectType<G_Empty>(genEmpty.updateAt(2, 'b'));
expectType<G_NonEmpty>(genNonEmpty.updateAt(2, 'b'));

// From Builder
expectType<G_Empty>(genEmpty.toBuilder().build());
