import { expectTypeOf } from 'bun:test';

import type { BiMap } from '@rimbu/bimap';
import type { MapCollection } from '@rimbu/collection-types/map';
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

// .addAll(..)
expectTypeOf(bEmpty.addAll(bEmpty)).toEqualTypeOf<B_Empty>();
expectTypeOf(bEmpty.addAll(bNonEmpty)).toEqualTypeOf<B_NonEmpty>();
expectTypeOf(bNonEmpty.addAll(bEmpty)).toEqualTypeOf<B_NonEmpty>();
expectTypeOf(bNonEmpty.addAll(bNonEmpty)).toEqualTypeOf<B_NonEmpty>();

// .add(..)
expectTypeOf(bEmpty.add([1, 'a'])).toEqualTypeOf<B_NonEmpty>();
expectTypeOf(bNonEmpty.add([1, 'a'])).toEqualTypeOf<B_NonEmpty>();

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
expectTypeOf(bEmpty.getKey('a', 2)).toEqualTypeOf<number>();
expectTypeOf(bNonEmpty.getKey('a', 2)).toEqualTypeOf<number>();
expectTypeOf(bEmpty.getKey('a', true)).toEqualTypeOf<number | boolean>();
expectTypeOf(bNonEmpty.getKey('a', true)).toEqualTypeOf<number | boolean>();

// .get(..)
expectTypeOf(bEmpty.get(2, 'a')).toEqualTypeOf<string>();
expectTypeOf(bNonEmpty.get(2, 'a')).toEqualTypeOf<string>();
expectTypeOf(bEmpty.get(2, true)).toEqualTypeOf<string | boolean>();
expectTypeOf(bNonEmpty.get(2, true)).toEqualTypeOf<string | boolean>();

// .has(..)
expectTypeOf(bEmpty.has(2)).toEqualTypeOf<boolean>();
expectTypeOf(bNonEmpty.has(2)).toEqualTypeOf<boolean>();

// .hasValue(..)
expectTypeOf(bEmpty.hasValue('a')).toEqualTypeOf<boolean>();
expectTypeOf(bNonEmpty.hasValue('a')).toEqualTypeOf<boolean>();

// .invert()
expectTypeOf(bEmpty.invert()).toEqualTypeOf<BiMap<string, number>>();
expectTypeOf(bNonEmpty.invert()).toEqualTypeOf<
	BiMap.NonEmpty<string, number>
>();

// .isEmpty
expectTypeOf(bEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(bNonEmpty.isEmpty).toEqualTypeOf<false>();

// .keyValueMap / .valueKeyMap
expectTypeOf(bEmpty.keyValueMap).toEqualTypeOf<MapCollection<number, string>>();
expectTypeOf(bNonEmpty.keyValueMap).toEqualTypeOf<
	MapCollection.NonEmpty<number, string>
>();
expectTypeOf(bEmpty.valueKeyMap).toEqualTypeOf<MapCollection<string, number>>();
expectTypeOf(bNonEmpty.valueKeyMap).toEqualTypeOf<
	MapCollection.NonEmpty<string, number>
>();

// .mapValues(..)
expectTypeOf(bEmpty.mapValues((v) => v)).toEqualTypeOf<B_Empty>();
expectTypeOf(bNonEmpty.mapValues((v) => v)).toEqualTypeOf<B_NonEmpty>();
const toA = (_v: string): 'a' => 'a';
expectTypeOf(bEmpty.mapValues(toA)).toEqualTypeOf<BiMap<number, 'a'>>();

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
expectTypeOf(bEmpty.streamKeys()).toEqualTypeOf<
	Stream.NonEmpty<number> | Stream<number>
>();
expectTypeOf(bNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamValues()
expectTypeOf(bEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<string> | Stream<string>
>();
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

// .updateAtValue(..)
expectTypeOf(bEmpty.updateAtValue(() => 2, 'b')).toEqualTypeOf<B_Empty>();
expectTypeOf(bNonEmpty.updateAtValue(() => 2, 'b')).toEqualTypeOf<B_NonEmpty>();

// .updateAtKey(..)
expectTypeOf(bEmpty.updateAtKey(2, () => 'b')).toEqualTypeOf<B_Empty>();
expectTypeOf(bNonEmpty.updateAtKey(2, () => 'b')).toEqualTypeOf<B_NonEmpty>();

// From Builder
expectTypeOf(bEmpty.toBuilder().build()).toEqualTypeOf<B_Empty>();
