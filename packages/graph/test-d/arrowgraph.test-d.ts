import { RSet } from '@rimbu/collection-types';
import { FastIterator } from '@rimbu/stream';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';
import { ArrowGraph, GraphElement } from '../src';

type GE<N> = ArrowGraph<N>;
type GNE<N> = ArrowGraph.NonEmpty<N>;

type G_Empty = GE<number>;
type G_NonEmpty = GNE<number>;

let genEmpty!: G_Empty;
let genNonEmpty!: G_NonEmpty;

// Test variance
expectAssignable<G_Empty>(genNonEmpty);
expectAssignable<G_NonEmpty>(genNonEmpty);

let m!: any;
expectNotAssignable<GE<number | string>>(genEmpty);
expectNotAssignable<GE<number>>(m as GE<number | string>);
expectNotAssignable<GNE<number | string>>(genNonEmpty);
expectNotAssignable<GNE<number>>(m as GNE<number | string>);

// Iterator
expectType<FastIterator<GraphElement<number>>>(genEmpty[Symbol.iterator]());
expectType<FastIterator<GraphElement<number>>>(genNonEmpty[Symbol.iterator]());

// .addNode(..)
expectType<G_NonEmpty>(genEmpty.addNode(1));
expectType<G_NonEmpty>(genNonEmpty.addNode(1));

// .addNodes(..)
expectType<G_Empty>(genEmpty.addNodes([]));
expectType<G_NonEmpty>(genEmpty.addNodes([1]));

expectType<G_NonEmpty>(genNonEmpty.addNodes([]));
expectType<G_NonEmpty>(genNonEmpty.addNodes([1]));

// .assumeNonEmpty()
expectType<G_NonEmpty>(genEmpty.assumeNonEmpty());
expectType<G_NonEmpty>(genNonEmpty.assumeNonEmpty());

// .connect(..)
expectType<G_NonEmpty>(genEmpty.connect(1, 2));
expectType<G_NonEmpty>(genNonEmpty.connect(1, 2));

// .connectAll(..)
expectType<G_Empty>(genEmpty.connectAll([]));
expectType<G_NonEmpty>(genEmpty.connectAll([[1, 2]]));
expectType<G_NonEmpty>(genNonEmpty.connectAll([]));
expectType<G_NonEmpty>(genNonEmpty.connectAll([[1, 2]]));

// .connectIfNodesExist(..)
// expectType<G_Empty>(genEmpty.connectIfNodesExist(1, 2));
// expectType<G_NonEmpty>(genNonEmpty.connectIfNodesExist(1, 2));

// .connectionSource
// expectAssignable<RMap<number, RSet<number>>>(genEmpty.sourceMap);
// expectAssignable<RMap.NonEmpty<number, RSet<number>>>(
//   genNonEmpty.sourceMap
// );

// .disconnect
expectType<G_Empty>(genEmpty.disconnect(1, 2));
expectType<G_Empty>(genNonEmpty.disconnect(1, 2));

// .disconnectAll
expectType<G_Empty>(genEmpty.disconnectAll([]));
expectType<G_Empty>(genNonEmpty.disconnectAll([[1, 2]]));

// .getConnectionSetFrom(..)
expectType<RSet<number>>(genEmpty.getConnectionsFrom(1));
expectType<RSet<number>>(genNonEmpty.getConnectionsFrom(1));

// .getConnectionStreamFrom(..)
// expectType<Stream<number>>(genEmpty.getConnectionStreamFrom(1));
// expectType<Stream<number>>(genNonEmpty.getConnectionStreamFrom(1));

// .getConnectionStreamTo(..)
// expectType<Stream<number>>(genEmpty.getConnectionStreamTo(1));
// expectType<Stream<number>>(genNonEmpty.getConnectionStreamTo(1));

// genNonEmpty.
// expectType<ArrowGraph<number>>(ArrowGraph.empty<number>());
// expectType<ArrowGraph.NonEmpty<number>>(ArrowGraph.of([1, 2]));
