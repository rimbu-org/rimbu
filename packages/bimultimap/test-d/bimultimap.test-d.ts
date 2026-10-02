import { expectTypeOf } from 'bun:test';

import type { BiMultiMap } from '@rimbu/bimultimap';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { MultiMap } from '@rimbu/multimap';
import type { Stream } from '@rimbu/stream';

/**
 * Name-independent type contract.
 *
 * Nothing here references a method that the migration renames, so this file
 * survives the capability refactor unchanged. Assertions for the renamed and
 * newly added methods are added alongside the migration itself.
 */

type BMM_Empty = BiMultiMap<number, string>;
type BMM_NonEmpty = BiMultiMap.NonEmpty<number, string>;

let bmmEmpty!: BMM_Empty;
let bmmNonEmpty!: BMM_NonEmpty;

// The NonEmpty refinement
expectTypeOf(bmmNonEmpty).toExtend<BMM_Empty>();
expectTypeOf(bmmEmpty).not.toExtend<BMM_NonEmpty>();
expectTypeOf(bmmEmpty.isEmpty).toEqualTypeOf<boolean>();
expectTypeOf(bmmNonEmpty.isEmpty).toEqualTypeOf<false>();
expectTypeOf(bmmEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(bmmNonEmpty.nonEmpty()).toEqualTypeOf<boolean>();
expectTypeOf(bmmEmpty.assumeNonEmpty()).toEqualTypeOf<BMM_NonEmpty>();
expectTypeOf(bmmNonEmpty.assumeNonEmpty()).toEqualTypeOf<BMM_NonEmpty>();
expectTypeOf(bmmNonEmpty.asNormal()).toEqualTypeOf<BMM_Empty>();

// .context
expectTypeOf(bmmEmpty.context).toEqualTypeOf<
	BiMultiMap.Context<number, string>
>();
expectTypeOf(bmmNonEmpty.context).toEqualTypeOf<
	BiMultiMap.Context<number, string>
>();

/**
 * The two internal maps are exact inverses, and a NonEmpty collection forces
 * *both* of them to be non-empty: any entry implies an entry in each direction.
 * This is what makes the bidirectional index sound, and it must not regress
 * when the family is pinned down to concrete slots.
 */
expectTypeOf(bmmEmpty.keyValueMultiMap).toEqualTypeOf<
	MultiMap<number, string>
>();
expectTypeOf(bmmNonEmpty.keyValueMultiMap).toEqualTypeOf<
	MultiMap.NonEmpty<number, string>
>();
expectTypeOf(bmmEmpty.valueKeyMultiMap).toEqualTypeOf<
	MultiMap<string, number>
>();
expectTypeOf(bmmNonEmpty.valueKeyMultiMap).toEqualTypeOf<
	MultiMap.NonEmpty<string, number>
>();

// .size counts associations; .keySize counts distinct keys. Both are numbers,
// and conflating them is the classic bidirectional-map bug.
expectTypeOf(bmmEmpty.size).toEqualTypeOf<number>();
expectTypeOf(bmmNonEmpty.size).toEqualTypeOf<number>();
expectTypeOf(bmmEmpty.keySize).toEqualTypeOf<number>();
expectTypeOf(bmmNonEmpty.keySize).toEqualTypeOf<number>();

// Per-direction lookups return a set, never undefined.
expectTypeOf(bmmEmpty.valuesAt(1)).toEqualTypeOf<SetCollection<string>>();
expectTypeOf(bmmNonEmpty.valuesAt(1)).toEqualTypeOf<SetCollection<string>>();
expectTypeOf(bmmEmpty.keysAt('a')).toEqualTypeOf<SetCollection<number>>();
expectTypeOf(bmmNonEmpty.keysAt('a')).toEqualTypeOf<SetCollection<number>>();

// .streamKeys / .streamValues
expectTypeOf(bmmEmpty.streamKeys()).toEqualTypeOf<Stream<number>>();
expectTypeOf(bmmNonEmpty.streamKeys()).toEqualTypeOf<Stream.NonEmpty<number>>();
expectTypeOf(bmmEmpty.streamValues()).toEqualTypeOf<Stream<string>>();
expectTypeOf(bmmNonEmpty.streamValues()).toEqualTypeOf<
	Stream.NonEmpty<string>
>();

// .toBuilder()
expectTypeOf(bmmEmpty.toBuilder()).toEqualTypeOf<
	BiMultiMap.Builder<number, string>
>();
expectTypeOf(bmmNonEmpty.toBuilder()).toEqualTypeOf<
	BiMultiMap.Builder<number, string>
>();
expectTypeOf(bmmEmpty.toBuilder().build()).toEqualTypeOf<BMM_Empty>();
expectTypeOf(bmmNonEmpty.toBuilder().build()).toEqualTypeOf<BMM_Empty>();

/**
 * Factory overload order: the non-empty-preserving overload must be declared
 * first, or a `StreamSource.NonEmpty` argument is matched by the normal overload
 * and the precise return type is lost (root AGENTS.md §1.1).
 */
declare const context: BiMultiMap.Context<number, string>;
expectTypeOf(context.empty()).toEqualTypeOf<BMM_Empty>();
// `of` infers literal type arguments from the entries it is given.
expectTypeOf(context.of([1, 'a'])).toEqualTypeOf<BiMultiMap.NonEmpty<1, 'a'>>();
expectTypeOf(context.of([1, 'a'], [2, 'b'])).toEqualTypeOf<
	BiMultiMap.NonEmpty<1 | 2, 'a' | 'b'>
>();
expectTypeOf(context.from(bmmNonEmpty)).toEqualTypeOf<BMM_NonEmpty>();
expectTypeOf(context.from(bmmEmpty)).toEqualTypeOf<BMM_Empty>();
expectTypeOf(context.builder()).toEqualTypeOf<
	BiMultiMap.Builder<number, string>
>();

// The context carries the two multimap contexts it was built from.
expectTypeOf(context.keyValueMultiMapContext).toEqualTypeOf<
	MultiMap.Context<number, string>
>();
expectTypeOf(context.valueKeyMultiMapContext).toEqualTypeOf<
	MultiMap.Context<string, number>
>();
