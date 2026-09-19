import { expectTypeOf } from 'bun:test';

import type { Op } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { ProximityMap } from '@rimbu/proximity';
import type { NearestKeyMatch } from '@rimbu/proximity/key-matching';
import type { FastIterator, Stream } from '@rimbu/stream';

type GE<K, V> = ProximityMap<K, V>;
type GNE<K, V> = ProximityMap.NonEmpty<K, V>;

declare const genEmpty: GE<number, string>;
declare const genNonEmpty: GNE<number, string>;

// NonEmpty refinement
expectTypeOf(genNonEmpty).toExtend<GE<number, string>>();
expectTypeOf(genEmpty).not.toExtend<GNE<number, string>>();

// Exact-key lookup
expectTypeOf(genEmpty.get(1)).toEqualTypeOf<string | undefined>();
expectTypeOf(genNonEmpty.get(1, 'a')).toEqualTypeOf<string>();
expectTypeOf(genEmpty.has(1)).toEqualTypeOf<boolean>();

// Distance-based lookup
expectTypeOf(genEmpty.getNearest(1)).toEqualTypeOf<string | undefined>();
expectTypeOf(genNonEmpty.getNearest(1, 'a')).toEqualTypeOf<string>();
expectTypeOf(genEmpty.getNearest(1, true as boolean)).toEqualTypeOf<
	string | boolean
>();
expectTypeOf(genEmpty.getNearestMatch(1)).toEqualTypeOf<
	NearestKeyMatch<number, string> | undefined
>();
expectTypeOf(genNonEmpty.getNearestMatch(1, 'a')).toEqualTypeOf<
	NearestKeyMatch<number, string> | string
>();

// Add / set
expectTypeOf(genEmpty.add([1, 'a'])).toEqualTypeOf<GNE<number, string>>();
expectTypeOf(genNonEmpty.add([1, 'a'])).toEqualTypeOf<GNE<number, string>>();
expectTypeOf(genEmpty.addAll(genEmpty)).toEqualTypeOf<GE<number, string>>();
expectTypeOf(genEmpty.addAll(genNonEmpty)).toEqualTypeOf<GNE<number, string>>();
expectTypeOf(genNonEmpty.set(1, 'a')).toEqualTypeOf<GNE<number, string>>();

// Remove
expectTypeOf(genEmpty.removeKey(1)).toEqualTypeOf<GE<number, string>>();
expectTypeOf(genNonEmpty.removeKey(1)).toEqualTypeOf<GE<number, string>>();
expectTypeOf(genNonEmpty.removeKeys([1, 2])).toEqualTypeOf<
	GE<number, string>
>();
expectTypeOf(genNonEmpty.removeKeyAndReturn(1)).toEqualTypeOf<
	Op.DynamicResult<GNE<number, string>, undefined, string, GE<number, string>>
>();
expectTypeOf(genNonEmpty.removeKeyAndReturn(1, 'a')).toEqualTypeOf<
	Op.DynamicResult<GNE<number, string>, string, string, GE<number, string>>
>();

// Update / modify
expectTypeOf(genEmpty.updateAtKey(1, (v) => v + '!')).toEqualTypeOf<
	GE<number, string>
>();
expectTypeOf(genNonEmpty.updateAtKey(1, (v) => v + '!')).toEqualTypeOf<
	GNE<number, string>
>();
expectTypeOf(genEmpty.modifyAtKey(1, {})).toEqualTypeOf<GE<number, string>>();
expectTypeOf(genNonEmpty.modifyAtKey(1, {})).toEqualTypeOf<
	GE<number, string>
>();

// Map values / filter
expectTypeOf(genEmpty.mapValues(() => true as boolean)).toEqualTypeOf<
	GE<number, boolean>
>();
expectTypeOf(genNonEmpty.mapValues(() => true as boolean)).toEqualTypeOf<
	GNE<number, boolean>
>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<
	GE<number, string>
>();

// Context / builder
expectTypeOf(genEmpty.context).toEqualTypeOf<ProximityMap.Context<number>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<ProximityMap.Context<number>>();
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<
	ProximityMap.Builder<number, string>
>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<
	ProximityMap.Builder<number, string>
>();

// Builder
declare const builder: ProximityMap.Builder<number, string>;
expectTypeOf(builder.get(1)).toEqualTypeOf<string | undefined>();
expectTypeOf(builder.has(1)).toEqualTypeOf<boolean>();
expectTypeOf(builder.set(1, 'a')).toEqualTypeOf<boolean>();
expectTypeOf(builder.add([1, 'a'])).toEqualTypeOf<boolean>();
expectTypeOf(builder.getNearest(1)).toEqualTypeOf<string | undefined>();
expectTypeOf(builder.getNearestMatch(1, 'a')).toEqualTypeOf<
	NearestKeyMatch<number, string> | string
>();

// Streams / arrays
expectTypeOf(genEmpty.stream()).toEqualTypeOf<
	Stream<readonly [number, string]>
>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<readonly [number, string]>
>();
expectTypeOf(genEmpty.streamKeys()).toExtend<Stream<number>>();
expectTypeOf(genNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(genEmpty.streamValues()).toExtend<Stream<string>>();
expectTypeOf(genNonEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<string>
>();
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<(readonly [number, string])[]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<readonly [number, string]>
>();
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();
