import { expectTypeOf } from 'bun:test';

import type { SetCollection } from '@rimbu/collection-types/set';
import type { ArrowGraph } from '@rimbu/graph/arrow-graph';
import type { GraphElement, Link } from '@rimbu/graph/link';
import type { FastIterator, Stream } from '@rimbu/stream';

type GE<N> = ArrowGraph<N>;
type GNE<N> = ArrowGraph.NonEmpty<N>;

type G_Empty = GE<number>;
type G_NonEmpty = GNE<number>;

let genEmpty!: G_Empty;
let genNonEmpty!: G_NonEmpty;

// Test variance
expectTypeOf(genNonEmpty).toExtend<G_Empty>();
expectTypeOf(genNonEmpty).toExtend<G_NonEmpty>();

let m!: any;
expectTypeOf(genEmpty).not.toExtend<GE<number | string>>();
expectTypeOf(m as GE<number | string>).not.toExtend<GE<number>>();
expectTypeOf(genNonEmpty).not.toExtend<GNE<number | string>>();
expectTypeOf(m as GNE<number | string>).not.toExtend<GNE<number>>();

// Iterator
expectTypeOf(genEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<GraphElement<number>>
>();
expectTypeOf(genNonEmpty[Symbol.iterator]()).toEqualTypeOf<
	FastIterator<GraphElement<number>>
>();

// .size / .nodeSize / .connectionSize
expectTypeOf(genEmpty.size).toEqualTypeOf<number>();
expectTypeOf(genNonEmpty.size).toEqualTypeOf<number>();
expectTypeOf(genEmpty.nodeSize).toEqualTypeOf<number>();
expectTypeOf(genEmpty.connectionSize).toEqualTypeOf<number>();

// .addNode(..)
expectTypeOf(genEmpty.addNode(1)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addNode(1)).toEqualTypeOf<G_NonEmpty>();

// .addNodes(..)
expectTypeOf(genEmpty.addNodes([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.addNodes([1])).toEqualTypeOf<G_NonEmpty>();

expectTypeOf(genNonEmpty.addNodes([])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.addNodes([1])).toEqualTypeOf<G_NonEmpty>();

// .assumeNonEmpty()
expectTypeOf(genEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.assumeNonEmpty()).toEqualTypeOf<G_NonEmpty>();

// .connect(..)
expectTypeOf(genEmpty.connect(1, 2)).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.connect(1, 2)).toEqualTypeOf<G_NonEmpty>();

// .connectEach(..)
expectTypeOf(genEmpty.connectEach([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.connectEach([[1, 2]])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.connectEach([])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.connectEach([[1, 2]])).toEqualTypeOf<G_NonEmpty>();

// .disconnect(..)
expectTypeOf(genEmpty.disconnect(1, 2)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.disconnect(1, 2)).toEqualTypeOf<G_Empty>();

// .disconnectEach(..)
expectTypeOf(genEmpty.disconnectEach([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.disconnectEach([[1, 2]])).toEqualTypeOf<G_Empty>();

// .getConnectionsFrom(..)
//
// Asserted as `toExtend<SetCollection<number>>` rather than `toEqualTypeOf`:
// this is the abstract `ArrowGraph` family, whose inner connection family is
// left open, so the exact resolved type is a generic set API rather than a
// concrete `HashSet`/`SortedSet`. The per-variant precision is asserted in the
// variant suites.
expectTypeOf(genEmpty.getConnectionsFrom(1)).toExtend<
	SetCollection<number>
>();
expectTypeOf(genNonEmpty.getConnectionsFrom(1)).toExtend<
	SetCollection<number>
>();

// .getConnectionStreamFrom(..)
expectTypeOf(genEmpty.getConnectionStreamFrom(1)).toEqualTypeOf<
	Stream<Link<number>>
>();
expectTypeOf(genNonEmpty.getConnectionStreamFrom(1)).toEqualTypeOf<
	Stream<Link<number>>
>();

// .getConnectionStreamTo(..)
expectTypeOf(genEmpty.getConnectionStreamTo(1)).toEqualTypeOf<
	Stream<Link<number>>
>();
expectTypeOf(genNonEmpty.getConnectionStreamTo(1)).toEqualTypeOf<
	Stream<Link<number>>
>();
