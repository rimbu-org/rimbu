import { ArrayNonEmpty } from '@rimbu/common';
import { HashSet } from '@rimbu/hashed';
import { SortedMap } from '@rimbu/sorted';
import { FastIterator, Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
import { SortedMultiMapHashValue } from '../src';

type GE<K, V> = SortedMultiMapHashValue<K, V>;
type GNE<K, V> = SortedMultiMapHashValue.NonEmpty<K, V>;

type G_Empty = GE<number, string>;
type G_NonEmpty = GNE<number, string>;

type Iter = FastIterator<[number, string]>;
type Context = SortedMultiMapHashValue.Context<number, string>;

type Values = HashSet<string>;
type Values_NE = HashSet.NonEmpty<string>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectAssignable<G_Empty>(genNonEmpty);
expectAssignable<G_NonEmpty>(genNonEmpty);

// Test variance
expectNotAssignable<GE<number | string, string>>(genEmpty);
expectNotAssignable<GE<number, string | boolean>>(genEmpty);
expectNotAssignable<GNE<number | string, string>>(genNonEmpty);
expectNotAssignable<GNE<number, string | boolean>>(genNonEmpty);

let m!: any;
expectNotAssignable<G_Empty>(m as GE<number | string, string>);
expectNotAssignable<G_Empty>(m as GE<number, string | number>);
expectNotAssignable<G_NonEmpty>(m as GNE<number | string, string>);
expectNotAssignable<G_NonEmpty>(m as GNE<number, string | number>);

// Iterator
expectType<Iter>(genEmpty[Symbol.iterator]());
expectType<Iter>(genNonEmpty[Symbol.iterator]());

// .add(..)
expectType<G_NonEmpty>(genEmpty.add(1, 'a'));
expectType<G_NonEmpty>(genNonEmpty.add(1, 'a'));

// .addEntries(..)
expectType<G_Empty>(genEmpty.addEntries([]));
expectType<G_NonEmpty>(genEmpty.addEntries([[1, 'a']]));
expectType<G_NonEmpty>(genNonEmpty.addEntries([]));
expectType<G_NonEmpty>(genNonEmpty.addEntries([[1, 'a']]));

// .assumeNonEmpty()
expectType<G_NonEmpty>(genEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genNonEmpty.assumeNonEmpty());

// .context
expectType<Context>(genEmpty.context);
expectType<Context>(genNonEmpty.context);

// .filter(..)
expectType<G_Empty>(genEmpty.filter(() => true));
expectType<G_Empty>(genNonEmpty.filter(() => true));

// .getValues(..)
expectType<Values>(genEmpty.getValues(1));
expectType<Values>(genNonEmpty.getValues(1));

// .isEmpty
expectType<boolean>(genEmpty.isEmpty);
expectType<false>(genNonEmpty.isEmpty);

// .keyMap
expectAssignable<SortedMap<number, HashSet.NonEmpty<string>>>(genEmpty.keyMap);
expectAssignable<SortedMap.NonEmpty<number, HashSet.NonEmpty<string>>>(
  genNonEmpty.keyMap
);

// .nonEmpty()
expectType<boolean>(genEmpty.nonEmpty());
expectType<true>(genNonEmpty.nonEmpty());

// .removeKey(..)
expectType<G_Empty>(genEmpty.removeEntries([[3, 'a']]));
expectType<G_Empty>(genNonEmpty.removeEntries([[3, 'a']]));

// .removeEntry(..)
expectType<G_Empty>(genEmpty.removeEntry(3, 'a'));
expectType<G_Empty>(genNonEmpty.removeEntry(3, 'a'));

// .removeKey(..)
expectType<G_Empty>(genEmpty.removeKey(3));
expectType<G_Empty>(genNonEmpty.removeKey(3));

// .removeKeyAndGet(..)
expectType<[G_Empty, Values_NE] | undefined>(genEmpty.removeKeyAndGet(3));
expectType<[G_Empty, Values_NE] | undefined>(genNonEmpty.removeKeyAndGet(3));

// .removeKeys(..)
expectType<G_Empty>(genEmpty.removeKeys([3, 4]));
expectType<G_Empty>(genNonEmpty.removeKeys([3, 4]));

// .setValues(..)
expectType<G_Empty>(genEmpty.setValues(1, []));
expectType<G_NonEmpty>(genEmpty.setValues(1, ['a']));
expectType<G_Empty>(genNonEmpty.setValues(1, []));
expectType<G_NonEmpty>(genNonEmpty.setValues(1, ['a']));

// .stream()
expectType<Stream<[number, string]>>(genEmpty.stream());
expectType<Stream.NonEmpty<[number, string]>>(genNonEmpty.stream());

// .streamKeys()
expectType<Stream<number>>(genEmpty.streamKeys());
expectType<Stream.NonEmpty<number>>(genNonEmpty.streamKeys());

// .streamValues()
expectType<Stream<string>>(genEmpty.streamValues());
expectType<Stream.NonEmpty<string>>(genNonEmpty.streamValues());

// .toArray()
expectType<[number, string][]>(genEmpty.toArray());
expectType<ArrayNonEmpty<[number, string]>>(genNonEmpty.toArray());

// .toBuilder()
expectType<SortedMultiMapHashValue.Builder<number, string>>(
  genEmpty.toBuilder()
);
expectType<SortedMultiMapHashValue.Builder<number, string>>(
  genNonEmpty.toBuilder()
);

// From Builder
expectType<G_Empty>(genEmpty.toBuilder().build());
