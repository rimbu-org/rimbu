import { expectTypeOf } from 'bun:test';

import type { BiMap } from '@rimbu/bimap';
import type { RMap } from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { FastIterator, Stream } from '@rimbu/stream';

type B_Empty = BiMap<number, string>;
type B_NonEmpty = BiMap.NonEmpty<number, string>;

let bEmpty!: B_Empty;
let bNonEmpty!: B_NonEmpty;

expectTypeOf(bNonEmpty).toExtend<B_Empty>();

expectTypeOf(bEmpty).not.toExtend<B_NonEmpty>();

// Iterator
expectTypeOf(bEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();
expectTypeOf(bNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();

// .addEntries(..)
expectTypeOf(bEmpty.addEntries(bEmpty)).toEqualTypeOf<B_Empty>();
expectTypeOf(bEmpty.addEntries(bNonEmpty)).toEqualTypeOf<B_NonEmpty>();
expectTypeOf(bNonEmpty.addEntries(bEmpty)).toEqualTypeOf<B_NonEmpty>();
expectTypeOf(bNonEmpty.addEntries(bNonEmpty)).toEqualTypeOf<B_NonEmpty>();

// .addEntry(..)
expectTypeOf(bEmpty.addEntry([1, 'a'])).toEqualTypeOf<B_NonEmpty>();
expectTypeOf(bNonEmpty.addEntry([1, 'a'])).toEqualTypeOf<B_NonEmpty>();

// .asNormal()
expectTypeOf(bNonEmpty.asNormal()).toEqualTypeOf<B_Empty>();

// .assumeNonEmpty()
expectTypeOf(bEmpty.assumeNonEmpty()).toEqualTypeOf<B_NonEmpty>();
expectTypeOf(bNonEmpty.assumeNonEmpty()).toEqualTypeOf<B_NonEmpty>();

// .context
expectTypeOf(bEmpty.context).toEqualTypeOf<BiMap.Context<number, string>>();
expectTypeOf(bNonEmpty.context).toEqualTypeOf<BiMap.Context<number, string>>();

// .filter(..)
expectTypeOf(bEmpty.filter(() => true)).toEqualTypeOf<B_Empty>();
expectTypeOf(bNonEmpty.filter(() => true)).toEqualTypeOf<B_Empty>();

// .getKey(..)
expectTypeOf(bEmpty.atValue('a', 2)).toEqualTypeOf<number>();
expectTypeOf(bNonEmpty.atValue('a', 2)).toEqualTypeOf<number>();
expectTypeOf(bEmpty.atValue('a', true as boolean)).toEqualTypeOf<
	number | boolean
>();
expectTypeOf(bNonEmpty.atValue('a', true as boolean)).toEqualTypeOf<
	number | boolean
>();

// .getValue(..)
expectTypeOf(bEmpty.at(2, 'a')).toEqualTypeOf<string>();
expectTypeOf(bNonEmpty.at(2, 'a')).toEqualTypeOf<string>();
expectTypeOf(bEmpty.at(2, true as boolean)).toEqualTypeOf<string | boolean>();
expectTypeOf(bNonEmpty.at(2, true as boolean)).toEqualTypeOf<
	string | boolean
>();

// .isEmpty
expectTypeOf(bEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(bNonEmpty.isEmpty).toEqualTypeOf<false>();

// .keyValueMap
expectTypeOf(bEmpty.keyValueMap).toEqualTypeOf<RMap<number, string>>();
expectTypeOf(bNonEmpty.keyValueMap).toEqualTypeOf<
	RMap.NonEmpty<number, string>
>();

// .nonEmpty()
expectTypeOf(bEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(bNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .removeKey(..)
expectTypeOf(bEmpty.removeKey(3)).toEqualTypeOf<B_Empty>();
expectTypeOf(bNonEmpty.removeKey(3)).toEqualTypeOf<B_Empty>();

// .removeKeys(..)
expectTypeOf(bEmpty.removeKeys([3, 4])).toEqualTypeOf<B_Empty>();
expectTypeOf(bNonEmpty.removeKeys([3, 4])).toEqualTypeOf<B_Empty>();

// .removeValue(..)
expectTypeOf(bEmpty.removeValue('a')).toEqualTypeOf<B_Empty>();
expectTypeOf(bNonEmpty.removeValue('a')).toEqualTypeOf<B_Empty>();

// .removeValues(..)
expectTypeOf(bEmpty.removeValues(['a', 'b'])).toEqualTypeOf<B_Empty>();
expectTypeOf(bNonEmpty.removeValues(['a', 'b'])).toEqualTypeOf<B_Empty>();

// .set(..)
expectTypeOf(bEmpty.set(1, 'a')).toEqualTypeOf<B_NonEmpty>();
expectTypeOf(bNonEmpty.set(1, 'a')).toEqualTypeOf<B_NonEmpty>();

// .stream()
expectTypeOf(bEmpty.stream()).toEqualTypeOf<
	Stream<readonly [number, string]>
>();
expectTypeOf(bNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<readonly [number, string]>
>();

// .streamKeys()
expectTypeOf(bEmpty.streamKeys()).toEqualTypeOf<Stream<number>>();
expectTypeOf(bNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamValues()
expectTypeOf(bEmpty.streamValues()).toEqualTypeOf<Stream<string>>();
expectTypeOf(bNonEmpty.streamValues()).toEqualTypeOf<Stream.NonEmpty<string>>();

// .toArray()
expectTypeOf(bEmpty.toArray()).toEqualTypeOf<(readonly [number, string])[]>();
expectTypeOf(bNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<readonly [number, string]>
>();

// .toBuilder()
expectTypeOf(bEmpty.toBuilder()).toEqualTypeOf<BiMap.Builder<number, string>>();
expectTypeOf(bNonEmpty.toBuilder()).toEqualTypeOf<
	BiMap.Builder<number, string>
>();

// .updateKeyAtValue(..)
expectTypeOf(bEmpty.updateKeyAtValue(() => 2, 'b')).toEqualTypeOf<B_Empty>();
expectTypeOf(
	bNonEmpty.updateKeyAtValue(() => 2, 'b'),
).toEqualTypeOf<B_NonEmpty>();

// .updateValueAtKey(..)
expectTypeOf(bEmpty.updateValueAtKey(2, () => 'b')).toEqualTypeOf<B_Empty>();
expectTypeOf(
	bNonEmpty.updateValueAtKey(2, () => 'b'),
).toEqualTypeOf<B_NonEmpty>();

// From Builder
expectTypeOf(bEmpty.toBuilder().build()).toEqualTypeOf<B_Empty>();
