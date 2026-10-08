import { expectTypeOf } from 'bun:test';

import type { HashMap } from '@rimbu/hashed/map';
import type { HashSet } from '@rimbu/hashed/set';
import type { SortedMap } from '@rimbu/sorted/map';
import type { SortedSet } from '@rimbu/sorted/set';

import type { ArrowGraphHashed } from '@rimbu/graph/non-valued/arrow/hashed';
import type { ArrowGraphSorted } from '@rimbu/graph/non-valued/arrow/sorted';
import type { EdgeGraphHashed } from '@rimbu/graph/non-valued/edge/hashed';
import type { EdgeGraphSorted } from '@rimbu/graph/non-valued/edge/sorted';
import type { ArrowValuedGraphHashed } from '@rimbu/graph/valued/arrow/hashed';
import type { ArrowValuedGraphSorted } from '@rimbu/graph/valued/arrow/sorted';
import type { EdgeValuedGraphHashed } from '@rimbu/graph/valued/edge/hashed';
import type { EdgeValuedGraphSorted } from '@rimbu/graph/valued/edge/sorted';

/**
 * Per-variant type tests for all eight concrete families.
 *
 * The abstract-family file (`arrowgraph.test-d.ts`) leaves the inner connection
 * family open, so it can only assert `toExtend<SetCollection<number>>`. These
 * files close that gap: every storage-derived member is checked against the
 * *concrete* backing type, which is the whole point of keeping the variant types
 * distinct.
 *
 * Run `bun run typecheck` from the repo root after a build — `expectTypeOf`
 * assertions are checked by `tsc`, not by `bun test`.
 */

declare let arrowHashed: ArrowGraphHashed<number>;
declare let arrowSorted: ArrowGraphSorted<number>;
declare let edgeHashed: EdgeGraphHashed<number>;
declare let edgeSorted: EdgeGraphSorted<number>;

declare let arrowValuedHashed: ArrowValuedGraphHashed<number, string>;
declare let arrowValuedSorted: ArrowValuedGraphSorted<number, string>;
declare let edgeValuedHashed: EdgeValuedGraphHashed<number, string>;
declare let edgeValuedSorted: EdgeValuedGraphSorted<number, string>;

// ---------------------------------------------------------------------------
// Non-valued: `getConnectionsFrom` resolves to the variant's concrete set.
// ---------------------------------------------------------------------------

expectTypeOf(arrowHashed.getConnectionsFrom(1)).toEqualTypeOf<
	HashSet<number>
>();
expectTypeOf(arrowSorted.getConnectionsFrom(1)).toEqualTypeOf<
	SortedSet<number>
>();
expectTypeOf(edgeHashed.getConnectionsFrom(1)).toEqualTypeOf<HashSet<number>>();
expectTypeOf(edgeSorted.getConnectionsFrom(1)).toEqualTypeOf<
	SortedSet<number>
>();

// ---------------------------------------------------------------------------
// Non-valued: `linkMap` resolves to the variant's concrete outer map.
// ---------------------------------------------------------------------------

expectTypeOf(arrowHashed.linkMap).toEqualTypeOf<
	HashMap<number, HashSet<number>>
>();
expectTypeOf(arrowSorted.linkMap).toEqualTypeOf<
	SortedMap<number, SortedSet<number>>
>();
expectTypeOf(edgeHashed.linkMap).toEqualTypeOf<
	HashMap<number, HashSet<number>>
>();
expectTypeOf(edgeSorted.linkMap).toEqualTypeOf<
	SortedMap<number, SortedSet<number>>
>();

// ---------------------------------------------------------------------------
// Valued: the inner connection collection is a map, and `getValue`/`modifyAt`
// are typed in the variant's connection value type.
// ---------------------------------------------------------------------------

expectTypeOf(arrowValuedHashed.getConnectionsFrom(1)).toEqualTypeOf<
	HashMap<number, string>
>();
expectTypeOf(arrowValuedSorted.getConnectionsFrom(1)).toEqualTypeOf<
	SortedMap<number, string>
>();
expectTypeOf(edgeValuedHashed.getConnectionsFrom(1)).toEqualTypeOf<
	HashMap<number, string>
>();
expectTypeOf(edgeValuedSorted.getConnectionsFrom(1)).toEqualTypeOf<
	SortedMap<number, string>
>();

expectTypeOf(arrowValuedHashed.linkMap).toEqualTypeOf<
	HashMap<number, HashMap<number, string>>
>();
expectTypeOf(edgeValuedSorted.linkMap).toEqualTypeOf<
	SortedMap<number, SortedMap<number, string>>
>();

// `OptLazy` fallback overload (root `AGENTS.md` §6.3).
expectTypeOf(arrowValuedHashed.getValue(1, 2)).toEqualTypeOf<
	string | undefined
>();
expectTypeOf(arrowValuedHashed.getValue(1, 2, 'none')).toEqualTypeOf<string>();
expectTypeOf(arrowValuedHashed.getValue(1, 2, () => 'lazy')).toEqualTypeOf<
	string
>();
expectTypeOf(edgeValuedSorted.getValue(1, 2, 0)).toEqualTypeOf<string | number>();

// `mapValues` retypes the connection value in place and stays within the
// context's `_UPPER_V`.
expectTypeOf(arrowValuedHashed.mapValues((v) => v.length)).toEqualTypeOf<
	ArrowValuedGraphHashed<number, number>
>();
expectTypeOf(arrowValuedSorted.mapValues((v) => v.length)).toEqualTypeOf<
	ArrowValuedGraphSorted<number, number>
>();
expectTypeOf(edgeValuedHashed.mapValues((v) => v.length)).toEqualTypeOf<
	EdgeValuedGraphHashed<number, number>
>();
expectTypeOf(edgeValuedSorted.mapValues((v) => v.length)).toEqualTypeOf<
	EdgeValuedGraphSorted<number, number>
>();

// The callback receives the value *and both nodes* — this is why graph cannot
// use the 2-arity `KeyedCollection.Capability.WithMapValues`.
expectTypeOf(arrowValuedHashed.mapValues((v, node1, node2) => {
	expectTypeOf(v).toEqualTypeOf<string>();
	expectTypeOf(node1).toEqualTypeOf<number>();
	expectTypeOf(node2).toEqualTypeOf<number>();
	return v;
})).toEqualTypeOf<ArrowValuedGraphHashed<number, string>>();

// ---------------------------------------------------------------------------
// NonEmpty refinement: `linkMap` narrows to the non-empty form, and `stream`
// becomes `Stream.NonEmpty`.
// ---------------------------------------------------------------------------

declare let arrowHashedNonEmpty: ArrowGraphHashed.NonEmpty<number>;
declare let edgeValuedHashedNonEmpty: EdgeValuedGraphHashed.NonEmpty<
	number,
	string
>;

expectTypeOf(arrowHashedNonEmpty.linkMap).toEqualTypeOf<
	HashMap.NonEmpty<number, HashSet<number>>
>();
expectTypeOf(edgeValuedHashedNonEmpty.linkMap).toEqualTypeOf<
	HashMap.NonEmpty<number, HashMap<number, string>>
>();

// ---------------------------------------------------------------------------
// `size` is the node count on every family, and is not `toArray().length`.
// ---------------------------------------------------------------------------

expectTypeOf(arrowHashed.size).toEqualTypeOf<number>();
expectTypeOf(arrowValuedSorted.size).toEqualTypeOf<number>();

// ---------------------------------------------------------------------------
// Builders: `connectIfNodesExist` is builder-only (root `AGENTS.md` §3 of the
// graph plan) — it must not be reachable on the immutable collections.
// ---------------------------------------------------------------------------

declare let arrowHashedBuilder: ArrowGraphHashed.Builder<number>;

expectTypeOf(arrowHashedBuilder.connectIfNodesExist).toEqualTypeOf<
	(node1: number, node2: number) => boolean
>();
// @ts-expect-error -- builder-only; the immutable form would be
// indistinguishable from `connect`.
arrowHashed.connectIfNodesExist;