import type { RMap } from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { FastIterator, Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
import type { OrderedMap } from '@rimbu/ordered';

type GE<K, V> = OrderedMap<K, V>;
type GNE<K, V> = OrderedMap.NonEmpty<K, V>;

type G_Empty = GE<number, string>;
type G_NonEmpty = GNE<number, string>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectAssignable<G_Empty>(genNonEmpty);
expectAssignable<G_NonEmpty>(genNonEmpty);
expectNotAssignable<G_NonEmpty>(genEmpty);

// Gen mappings
expectAssignable<RMap<number, string>>(genEmpty);
expectNotAssignable<RMap.NonEmpty<number, string>>(genEmpty);
expectAssignable<RMap<number, string>>(genNonEmpty);
expectAssignable<RMap.NonEmpty<number, string>>(genNonEmpty);

// Test variance
expectNotAssignable<GE<number | string, string>>(genEmpty);
expectAssignable<GE<number, string | boolean>>(genEmpty);
expectNotAssignable<GNE<number | string, string>>(genNonEmpty);
expectAssignable<GNE<number, string | boolean>>(genNonEmpty);

let m!: any;

expectNotAssignable<G_Empty>(m as GE<number | string, string>);
expectNotAssignable<G_Empty>(m as GE<number, string | number>);
expectNotAssignable<G_NonEmpty>(m as GNE<number | string, string>);
expectNotAssignable<G_NonEmpty>(m as GNE<number, string | number>);

// Iterator
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
expectType<G_NonEmpty>(genEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genNonEmpty.assumeNonEmpty());

// .context
expectType<OrderedMap.Context<number>>(genEmpty.context);
expectType<OrderedMap.Context<number>>(genNonEmpty.context);

// .filter(..)
expectType<G_Empty>(genEmpty.filter(() => true));
expectType<G_Empty>(genNonEmpty.filter(() => true));

// .get(..)
expectType<string>(genEmpty.get(2, 'a'));
expectType<string>(genNonEmpty.get(2, 'a'));

expectType<string | boolean>(genEmpty.get(2, true as boolean));
expectType<string | boolean>(genNonEmpty.get(2, true as boolean));

// .isEmpty
expectType<boolean>(genEmpty.isEmpty);
expectType<false>(genNonEmpty.isEmpty);

// .mapValues(..)
expectType<GE<number, boolean>>(genEmpty.mapValues(() => true as boolean));
expectType<GNE<number, boolean>>(genNonEmpty.mapValues(() => true as boolean));

// .modifyAt(..)
expectType<GE<number, string>>(genEmpty.modifyAt(2, {}));
expectType<GE<number, string>>(genNonEmpty.modifyAt(2, {}));

// .nonEmpty()
expectType<boolean>(genEmpty.nonEmpty());
expectType<boolean>(genNonEmpty.nonEmpty());

// .removeKey(..)
expectType<G_Empty>(genEmpty.removeKey(3));
expectType<G_Empty>(genNonEmpty.removeKey(3));

// .removeKeyAndGet(..)
expectType<[G_Empty, string] | undefined>(genEmpty.removeKeyAndGet(3));
expectType<[G_Empty, string] | undefined>(genNonEmpty.removeKeyAndGet(3));

// .removeKeys(..)
expectType<G_Empty>(genEmpty.removeKeys([3, 4]));
expectType<G_Empty>(genNonEmpty.removeKeys([3, 4]));

// .set(..)
expectType<G_NonEmpty>(genEmpty.set(1, 'a'));
expectType<G_NonEmpty>(genNonEmpty.set(1, 'a'));

// .stream()
expectType<Stream<readonly [number, string]>>(genEmpty.stream());
expectType<Stream.NonEmpty<readonly [number, string]>>(genNonEmpty.stream());

// .streamKeys()
expectType<Stream<number>>(genEmpty.streamKeys());
expectType<Stream.NonEmpty<number>>(genNonEmpty.streamKeys());

// .streamValues()
expectType<Stream<string>>(genEmpty.streamValues());
expectType<Stream.NonEmpty<string>>(genNonEmpty.streamValues());

// .toArray()
expectType<(readonly [number, string])[]>(genEmpty.toArray());
expectType<ArrayNonEmpty<readonly [number, string]>>(genNonEmpty.toArray());

// .toBuilder()
expectType<OrderedMap.Builder<number, string>>(genEmpty.toBuilder());
expectType<OrderedMap.Builder<number, string>>(genNonEmpty.toBuilder());

// .updateAt(..)
expectType<G_Empty>(genEmpty.updateAt(2, 'b'));
expectType<G_NonEmpty>(genNonEmpty.updateAt(2, 'b'));

// From Builder
expectType<G_Empty>(genEmpty.toBuilder().build());
