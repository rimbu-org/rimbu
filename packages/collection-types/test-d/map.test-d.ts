import { expectTypeOf } from 'bun:test';

import type { RMap, VariantMap } from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { FastIterator, Stream } from '@rimbu/stream';

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

expectTypeOf(genEmpty).toExtend<RMap<number, string | number>>();
expectTypeOf(genEmpty).not.toExtend<RMap<number | string, string>>();
expectTypeOf(genEmpty).not.toExtend<RMap<1, string>>();
expectTypeOf(genEmpty).not.toExtend<RMap<number, 'a'>>();

// Variant to Gen mappings
expectTypeOf(varNonEmpty).toExtend<V_Empty>();
expectTypeOf(genEmpty).toExtend<V_Empty>();
expectTypeOf(genNonEmpty).toExtend<V_Empty>();

expectTypeOf(genNonEmpty).toExtend<V_NonEmpty>();
expectTypeOf(varEmpty).not.toExtend<V_NonEmpty>();
expectTypeOf(genEmpty).not.toExtend<V_NonEmpty>();

expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(varEmpty).not.toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();
expectTypeOf(varEmpty).not.toExtend<G_NonEmpty>();

// Test variance
expectTypeOf(varEmpty).toExtend<VE<number | string, string>>();
expectTypeOf(varEmpty).toExtend<VE<number, string | boolean>>();
expectTypeOf(varEmpty).toExtend<VE<number | string, string | boolean>>();
expectTypeOf(varNonEmpty).toExtend<VNE<number | string, string>>();
expectTypeOf(varNonEmpty).toExtend<VNE<number, string | boolean>>();
expectTypeOf(varNonEmpty).toExtend<VNE<number | string, string | boolean>>();

expectTypeOf(genEmpty).toExtend<VE<number | string, string | boolean>>();
expectTypeOf(genNonEmpty).toExtend<VE<number | string, string | boolean>>();
expectTypeOf(genNonEmpty).toExtend<VNE<number | string, string | boolean>>();

expectTypeOf(genEmpty).not.toExtend<GE<number | string, string>>();
expectTypeOf(genEmpty).toExtend<GE<number, string | boolean>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number | string, string>>();
expectTypeOf(genNonEmpty).toExtend<GNE<number, string | boolean>>();

let m!: any;
expectTypeOf(m as VE<number | string, string>).not.toExtend<V_Empty>();
expectTypeOf(m as VE<number | string, string>).not.toExtend<V_Empty>();
expectTypeOf(m as VNE<number | string, string>).not.toExtend<V_NonEmpty>();
expectTypeOf(m as VNE<number | string, string>).not.toExtend<V_NonEmpty>();

expectTypeOf(m as GE<number | string, string>).not.toExtend<G_Empty>();
expectTypeOf(m as GE<number, string | number>).not.toExtend<G_Empty>();
expectTypeOf(m as GNE<number | string, string>).not.toExtend<G_NonEmpty>();
expectTypeOf(m as GNE<number, string | number>).not.toExtend<G_NonEmpty>();

// Iterator
expectTypeOf(varEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();
expectTypeOf(varNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<readonly [number, string]>
>();

// .addEntries(..)
expectTypeOf(genEmpty.addEntries(genEmpty)).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addEntries(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries(genEmpty)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntries(genNonEmpty)).toEqualTypeOf<G_NonEmpty>();

// .addEntry(..)
expectTypeOf(genEmpty.addEntry([1, 'a'])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addEntry([1, 'a'])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(varEmpty.assumeNonEmpty()).toEqualTypeOf<V_NonEmpty>();
expectTypeOf(varNonEmpty.assumeNonEmpty()).toEqualTypeOf<V_NonEmpty>();
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .context
expectTypeOf(genEmpty.context).toEqualTypeOf<RMap.Context<number>>();
expectTypeOf(genNonEmpty.context).toEqualTypeOf<RMap.Context<number>>();

// .filter(..)
expectTypeOf(varEmpty.filter(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.filter(() => true)).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.filter(() => true)).toEqualTypeOf<G_Empty>();

// .get(..)
expectTypeOf(varEmpty.get(2, 'a')).toEqualTypeOf<string>();
expectTypeOf(varNonEmpty.get(2, 'a')).toEqualTypeOf<string>();
expectTypeOf(genEmpty.get(2, 'a')).toEqualTypeOf<string>();
expectTypeOf(genNonEmpty.get(2, 'a')).toEqualTypeOf<string>();

expectTypeOf(varEmpty.get(2, true as boolean)).toEqualTypeOf<
	string | boolean
>();
expectTypeOf(varNonEmpty.get(2, true as boolean)).toEqualTypeOf<
	string | boolean
>();
expectTypeOf(genEmpty.get(2, true as boolean)).toEqualTypeOf<
	string | boolean
>();
expectTypeOf(genNonEmpty.get(2, true as boolean)).toEqualTypeOf<
	string | boolean
>();

// .isEmpty
expectTypeOf(varEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(varNonEmpty.isEmpty).toEqualTypeOf<false>();
expectTypeOf(genEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.isEmpty).toEqualTypeOf<false>();

// .mapValues(..)
expectTypeOf(varEmpty.mapValues(() => true as boolean)).toEqualTypeOf<
	VE<number, boolean>
>();
expectTypeOf(varNonEmpty.mapValues(() => true as boolean)).toEqualTypeOf<
	VNE<number, boolean>
>();
expectTypeOf(genEmpty.mapValues(() => true as boolean)).toEqualTypeOf<
	GE<number, boolean>
>();
expectTypeOf(genNonEmpty.mapValues(() => true as boolean)).toEqualTypeOf<
	GNE<number, boolean>
>();

// .modifyAt(..)
expectTypeOf(genEmpty.modifyAt(2, {})).toEqualTypeOf<GE<number, string>>();
expectTypeOf(genNonEmpty.modifyAt(2, {})).toEqualTypeOf<GE<number, string>>();

// .nonEmpty()
expectTypeOf(varEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(varNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(genNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();

// .removeKey(..)
expectTypeOf(varEmpty.removeKey(3)).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.removeKey(3)).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKey(3)).toEqualTypeOf<G_Empty>();

// .removeKeyAndGet(..)
expectTypeOf(varEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	[V_Empty, string] | undefined
>();
expectTypeOf(varNonEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	[V_Empty, string] | undefined
>();
expectTypeOf(genEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	[G_Empty, string] | undefined
>();
expectTypeOf(genNonEmpty.removeKeyAndGet(3)).toEqualTypeOf<
	[G_Empty, string] | undefined
>();

// .removeKeys(..)
expectTypeOf(varEmpty.removeKeys([3, 4])).toEqualTypeOf<V_Empty>();
expectTypeOf(varNonEmpty.removeKeys([3, 4])).toEqualTypeOf<V_Empty>();
expectTypeOf(genEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.removeKeys([3, 4])).toEqualTypeOf<G_Empty>();

// .set(..)
expectTypeOf(genEmpty.set(1, 'a')).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.set(1, 'a')).toEqualTypeOf<G_NonEmpty>();

// .stream()
expectTypeOf(varEmpty.stream()).toEqualTypeOf<
	Stream<readonly [number, string]>
>();
expectTypeOf(varNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<readonly [number, string]>
>();
expectTypeOf(genEmpty.stream()).toEqualTypeOf<
	Stream<readonly [number, string]>
>();
expectTypeOf(genNonEmpty.stream()).toEqualTypeOf<
	Stream.NonEmpty<readonly [number, string]>
>();

// .streamKeys()
expectTypeOf(varEmpty.streamKeys()).toEqualTypeOf<Stream<number>>();
expectTypeOf(varNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(genEmpty.streamKeys()).toEqualTypeOf<Stream<number>>();
expectTypeOf(genNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();

// .streamValues()
expectTypeOf(varEmpty.streamValues()).toEqualTypeOf<Stream<string>>();
expectTypeOf(varNonEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<string>
>();
expectTypeOf(genEmpty.streamValues()).toEqualTypeOf<Stream<string>>();
expectTypeOf(genNonEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<string>
>();

// .toArray()
expectTypeOf(varEmpty.toArray()).toEqualTypeOf<(readonly [number, string])[]>();
expectTypeOf(varNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<readonly [number, string]>
>();
expectTypeOf(genEmpty.toArray()).toEqualTypeOf<(readonly [number, string])[]>();
expectTypeOf(genNonEmpty.toArray()).toEqualTypeOf<
	ArrayNonEmpty<readonly [number, string]>
>();

// .toBuilder()
expectTypeOf(genEmpty.toBuilder()).toEqualTypeOf<
	RMap.Builder<number, string>
>();
expectTypeOf(genNonEmpty.toBuilder()).toEqualTypeOf<
	RMap.Builder<number, string>
>();

// .updateAt(..)
expectTypeOf(genEmpty.updateAt(2, 'b')).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.updateAt(2, 'b')).toEqualTypeOf<G_NonEmpty>();

// From Builder
expectTypeOf(genEmpty.toBuilder().build()).toEqualTypeOf<G_Empty>();
