import { expectTypeOf } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { HashMap } from '@rimbu/hashed/map';
import type { FastIterator, Stream } from '@rimbu/stream';

type GE<K, V> = HashMap<K, V>;
type GNE<K, V> = HashMap.NonEmpty<K, V>;

type G_Empty = GE<number, string>;
type G_NonEmpty = GNE<number, string>;

const genEmpty: G_Empty = undefined as any;
const genNonEmpty: G_NonEmpty = undefined as any;

expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();
expectTypeOf(genEmpty).not.toExtend<G_NonEmpty>();

// Gen mappings

// Test variance. A map is **invariant** in its value type: `add(key, value: V)`
// takes `V`, and `mapValues` takes a callback producing one. Widening `V`
// therefore does not yield a subtype. (These assertions said the opposite;
// they were never checked, being under `@ts-nocheck`.)
expectTypeOf(genEmpty).not.toExtend<GE<number | string, string>>();
expectTypeOf(genEmpty).not.toExtend<GE<number, string | boolean>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number | string, string>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number, string | boolean>>();
expectTypeOf(genNonEmpty).not.toExtend<GE<number, string | boolean>>();

let m!: any;

expectTypeOf(m as GE<number | string, string>).not.toExtend<G_Empty>();
expectTypeOf(m as GE<number, string | number>).not.toExtend<G_Empty>();
expectTypeOf(m as GNE<number | string, string>).not.toExtend<G_NonEmpty>();
expectTypeOf(m as GNE<number, string | number>).not.toExtend<G_NonEmpty>();

// Iterator
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();

// .addEach(..)
expectTypeOf(genEmpty.addEach(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addEach(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEach(genEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEach(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();

// .add(..)
expectTypeOf(genEmpty.add([1, 'a'])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.add([1, 'a'])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<HashMap.Context<number>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<HashMap.Context<number>>();

// .filter(..)
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

// .get(..)
expectTypeOf(genEmpty.get(2, 'a')).toEqualTypeOf<string>();
expectTypeOf(genNonEmpty.get(2, 'a')).toEqualTypeOf<string>();

expectTypeOf(genEmpty.get(2, true as boolean)).toEqualTypeOf<string | boolean>();
expectTypeOf(genNonEmpty.get(2, true as boolean)).toEqualTypeOf<
	string | boolean
>();

// .isEmpty
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .mapValues(..)
expectTypeOf(genEmpty.mapValues(() => true as boolean)).toEqualTypeOf<
	GE<number, boolean>
>();
expectTypeOf(genNonEmpty.mapValues(() => true as boolean)).toEqualTypeOf<
	GNE<number, boolean>
>();

// .modifyAtKey(..)
expectTypeOf(genEmpty.modifyAtKey(2, {})).toEqualTypeOf<GE<number, string>>();
expectTypeOf(genNonEmpty.modifyAtKey(2, {})).toEqualTypeOf<GE<number, string>>();

// .nonEmpty()
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .removeKey(..)
expectTypeOf(genEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();

// .removeKeyAndReturn(..)
// TODO(issue 10): assert `Op.DynamicResult<...>` here. Dropped when `WithValueResult`
// was deleted — this file is `@ts-nocheck`ed, so the assertion never ran anyway and
// its stated return type no longer exists. Do not restore it until the suppression
// is lifted and the real `Op.DynamicResult` shape can be checked.

// .removeKeys(..)
expectTypeOf(genEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();

// .set(..)
expectTypeOf(genEmpty.set(1, 'a')).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.set(1, 'a')).toEqualTypeOf<G_NonEmpty>();

// .stream()
expectTypeOf(genEmpty.stream()).toEqualTypeOf<
	Stream<readonly [number, string]>
>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<readonly [number, string]>
>();

// .streamKeys()
expectTypeOf(genEmpty.streamKeys()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamValues()
expectTypeOf(genEmpty.streamValues()).toEqualTypeOf<Stream<string>>();
expectTypeOf(genNonEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<string>
>();

// .toArray()
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<(readonly [number, string])[]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<readonly [number, string]>
>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<
	HashMap.Builder<number, string>
>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<
	HashMap.Builder<number, string>
>();

// .updateAtKey(..)
expectTypeOf(genEmpty.updateAtKey(2, () => 'b')).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.updateAtKey(2, () => 'b')).toEqualTypeOf<G_NonEmpty>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
