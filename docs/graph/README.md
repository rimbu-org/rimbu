# @rimbu/graph

A Graph is a data structure consisting of nodes that can be connected through edges. Each node has a unique value or identifier. Edges can be directed, in which case we will call it an Arrow Graph, or undirected, in which case we will call it an Edge Graph. Furthermore, edges and arrows can also have values, in which case we call it a Valued Graph.

Properties of an Arrow Graph in Rimbu:

- An Arrow Graph consists of 0 or more nodes, and 0 or more arrows
- Each node in an Arrow Graph has a unique value
- Each arrow has a start node, and an end node
- An arrow can connect a node to itself, but only once
- Two different arrows cannot have the same start node AND end node

For Edge graphs, we have the following properties:

- An Edge Graph consists of 0 or more nodes, and 0 or more edges
- Each node in an Edge Graph has a unique value
- Each edge has 2 nodes indicating a bi-directional connection without direction
- An edge can connect a node to itself, but only once
- Two different edges cannot have the same 2 nodes even if the nodes are in reverse order

Overview of basic graph types:

| Edge property | Non-valued      | Valued                   |
| ------------- | --------------- | ------------------------ |
| Directed      | `ArrowGraph<N>` | `ArrowValuedGraph<N, V>` |
| Undirected    | `EdgeGraph<N>`  | `EdgeValuedGraph<N, V>`  |

## Abstract Graph types

To support a large variety of use cases, there are quite a number of abstract graph types available. These cannot be used to construct Graphs, but the can be convenient when writing generic code operating on Graphs.

<img id="inheritance" class="diagram" />

## Non-valued Graph types

Here is an overview of the available concrete non-valued graph types. The concrete types have constructor methods to create graph instances.

<img id="inheritance_nonvalued" class="diagram" />

## Valued Graph types

Here is an overview of the available concrete valued graph types. The concrete types have constructor methods to create graph instances.

<img id="inheritance_valued" class="diagram" />

<script src="core/graph.js"></script>

## Usage

```ts
import { ArrowGraphSorted, EdgeGraphSorted } from '@rimbu/core';

const graph1 = EdgeGraphSorted.of([3, 5], [5, 6], [6, 3], [1]);
console.log(graph1.toString());
// =>
// EdgeGraphSorted(
//   1 <-> [],
//   3 <-> [5, 6],
//   5 <-> [3, 6],
//   6 <-> [3, 5]
// )

const graph2 = ArrowGraphSorted.of([3, 5], [5, 6], [3, 6], [1]);
console.log(graph2.toString());
// =>
// ArrowGraphSorted(
//   1 -> [],
//   3 -> [5, 6],
//   5 -> [6],
//   6 -> []
// )
```

## Motivation

Graphs are useful structures for network-like topologies. Imagine we are building a social network of users, and each user can befriend other users.

```ts
import { EdgeGraphHashed } from '@rimbu/core';

const alice = 'Alice';
const bob = 'Bob';
const carl = 'Carl';

const users = EdgeGraphHashed.of([alice], [bob], [carl]);
// a graph only with users and no friends

// connect alice and bob
const friends = users.connect(alice, bob);
console.log(friends.toString());
// =>
// EdgeGraphHashed(
//   Bob <-> [Alice],
//   Alice <-> [Bob],
//   Carl <-> []
// )
```

We see that Alice has befriended Bob, and as a consequence (and assuming Bob accepted the request), Bob also has Alice listed as a friend.

Now imagine that users can also rate each other for some service they provide. In such a case, a Valued Graph comes in handy. The rating only goes in one direction, so this is a nice use for an Arrow Graph.

```ts
import { ArrowValuedGraphHashed, Reducer } from '@rimbu/core';

const alice = 'Alice';
const bob = 'Bob';
const carl = 'Carl';

// A graph containing 3 users, and where Alice and Bob rate Carl
const ratings = ArrowValuedGraphHashed.of([alice, carl, 5], [bob, carl, 4]);

// create a Stream with Carls' rating connections
const carlsRatingsStream = ratings.getConnectionStreamTo(carl);
// select only the rating values from the connections
const carlsRatingValuesStream = carlsRatingsStream.map((conn) => conn[2]);

// Reduce the stream to the desired values
// in this case we want the average rating, and the amount of ratings
const [averageRating, amountOfRatings] = carlsRatingValuesStream.reduceAll(
  Reducer.average,
  Reducer.count()
);

console.log({ averageRating, amountOfRatings });
// => { averageRating: 4.5, amountOfRatings: 2 }
```
