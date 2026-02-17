import { expectTypeOf } from 'bun:test';

import type { RSet } from '@rimbu/collection-types';
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

// .connectAll(..)
expectTypeOf(genEmpty.connectAll([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genEmpty.connectAll([[1, 2]])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.connectAll([])).toEqualTypeOf<G_NonEmpty>();
expectTypeOf(genNonEmpty.connectAll([[1, 2]])).toEqualTypeOf<G_NonEmpty>();

// .connectIfNodesExist(..)
// expectType<G_Empty>(genEmpty.connectIfNodesExist(1, 2));
// expectType<G_NonEmpty>(genNonEmpty.connectIfNodesExist(1, 2));

// .connectionSource
// expectAssignable<RMap<number, RSet<number>>>(genEmpty.sourceMap);
// expectAssignable<RMap.NonEmpty<number, RSet<number>>>(
//   genNonEmpty.sourceMap
// );

// .disconnect
expectTypeOf(genEmpty.disconnect(1, 2)).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.disconnect(1, 2)).toEqualTypeOf<G_Empty>();

// .disconnectAll
expectTypeOf(genEmpty.disconnectAll([])).toEqualTypeOf<G_Empty>();
expectTypeOf(genNonEmpty.disconnectAll([[1, 2]])).toEqualTypeOf<G_Empty>();

// .getConnectionSetFrom(..)
expectTypeOf(genEmpty.getConnectionsFrom(1)).toEqualTypeOf<RSet<number>>();
expectTypeOf(genNonEmpty.getConnectionsFrom(1)).toEqualTypeOf<RSet<number>>();

// .getConnectionStreamFrom(..)
expectTypeOf<Stream<Link<number>>>(genEmpty.getConnectionStreamFrom(1));
expectTypeOf<Stream<Link<number>>>(genNonEmpty.getConnectionStreamFrom(1));

// .getConnectionStreamTo(..)
expectTypeOf<Stream<Link<number>>>(genEmpty.getConnectionStreamTo(1));
expectTypeOf<Stream<Link<number>>>(genNonEmpty.getConnectionStreamTo(1));

// genNonEmpty.
// expectTypeOf<ArrowGraph<number>>(ArrowGraph.empty<number>());
// expectType<ArrowGraph.NonEmpty<number>>(ArrowGraph.of([1, 2]));
