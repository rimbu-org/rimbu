import type { RMap } from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { FastIterator, Stream } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
import type { BiMap } from '../src';

type B_Empty = BiMap<number, string>;
type B_NonEmpty = BiMap.NonEmpty<number, string>;

let bEmpty!: B_Empty;
let bNonEmpty!: B_NonEmpty;

expectAssignable<B_Empty>(bNonEmpty);

expectNotAssignable<B_NonEmpty>(bEmpty);

// Iterator
expectType<FastIterator<readonly [number, string]>>(bEmpty[Symbol.iterator]());
expectType<FastIterator<readonly [number, string]>>(
  bNonEmpty[Symbol.iterator]()
);

// .addEntries(..)
expectType<B_Empty>(bEmpty.addEntries(bEmpty));
expectType<B_NonEmpty>(bEmpty.addEntries(bNonEmpty));
expectType<B_NonEmpty>(bNonEmpty.addEntries(bEmpty));
expectType<B_NonEmpty>(bNonEmpty.addEntries(bNonEmpty));

// .addEntry(..)
expectType<B_NonEmpty>(bEmpty.addEntry([1, 'a']));
expectType<B_NonEmpty>(bNonEmpty.addEntry([1, 'a']));

// .asNormal()
expectType<B_Empty>(bNonEmpty.asNormal());

// .assumeNonEmpty()
expectType<B_NonEmpty>(bEmpty.assumeNonEmpty());
expectType<B_NonEmpty>(bNonEmpty.assumeNonEmpty());

// .context
expectType<BiMap.Context<number, string>>(bEmpty.context);
expectType<BiMap.Context<number, string>>(bNonEmpty.context);

// .filter(..)
expectType<B_Empty>(bEmpty.filter(() => true));
expectType<B_Empty>(bNonEmpty.filter(() => true));

// .getKey(..)
expectType<number>(bEmpty.getKey('a', 2));
expectType<number>(bNonEmpty.getKey('a', 2));
expectType<number | boolean>(bEmpty.getKey('a', true as boolean));
expectType<number | boolean>(bNonEmpty.getKey('a', true as boolean));

// .getValue(..)
expectType<string>(bEmpty.getValue(2, 'a'));
expectType<string>(bNonEmpty.getValue(2, 'a'));
expectType<string | boolean>(bEmpty.getValue(2, true as boolean));
expectType<string | boolean>(bNonEmpty.getValue(2, true as boolean));

// .isEmpty
expectType<boolean>(bEmpty.isEmpty);
expectType<false>(bNonEmpty.isEmpty);

// .keyValueMap
expectType<RMap<number, string>>(bEmpty.keyValueMap);
expectType<RMap.NonEmpty<number, string>>(bNonEmpty.keyValueMap);

// .nonEmpty()
expectType<boolean>(bEmpty.nonEmpty());
expectType<true>(bNonEmpty.nonEmpty());

// .removeKey(..)
expectType<B_Empty>(bEmpty.removeKey(3));
expectType<B_Empty>(bNonEmpty.removeKey(3));

// .removeKeys(..)
expectType<B_Empty>(bEmpty.removeKeys([3, 4]));
expectType<B_Empty>(bNonEmpty.removeKeys([3, 4]));

// .removeValue(..)
expectType<B_Empty>(bEmpty.removeValue('a'));
expectType<B_Empty>(bNonEmpty.removeValue('a'));

// .removeValues(..)
expectType<B_Empty>(bEmpty.removeValues(['a', 'b']));
expectType<B_Empty>(bNonEmpty.removeValues(['a', 'b']));

// .set(..)
expectType<B_NonEmpty>(bEmpty.set(1, 'a'));
expectType<B_NonEmpty>(bNonEmpty.set(1, 'a'));

// .stream()
expectType<Stream<readonly [number, string]>>(bEmpty.stream());
expectType<Stream.NonEmpty<readonly [number, string]>>(bNonEmpty.stream());

// .streamKeys()
expectType<Stream<number>>(bEmpty.streamKeys());
expectType<Stream.NonEmpty<number>>(bNonEmpty.streamKeys());

// .streamValues()
expectType<Stream<string>>(bEmpty.streamValues());
expectType<Stream.NonEmpty<string>>(bNonEmpty.streamValues());

// .toArray()
expectType<(readonly [number, string])[]>(bEmpty.toArray());
expectType<ArrayNonEmpty<readonly [number, string]>>(bNonEmpty.toArray());

// .toBuilder()
expectType<BiMap.Builder<number, string>>(bEmpty.toBuilder());
expectType<BiMap.Builder<number, string>>(bNonEmpty.toBuilder());

// .updateKeyAt(..)
expectType<B_Empty>(bEmpty.updateKeyAt('b', 2));
expectType<B_NonEmpty>(bNonEmpty.updateKeyAt('b', 2));

// .updateValueAt(..)
expectType<B_Empty>(bEmpty.updateValueAt(2, 'b'));
expectType<B_NonEmpty>(bNonEmpty.updateValueAt(2, 'b'));

// From Builder
expectType<B_Empty>(bEmpty.toBuilder().build());
