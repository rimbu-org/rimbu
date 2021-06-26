# Graph

A Graph is a data structure consisting of nodes that can be connected through edges. Each node has a unique value or identifier. Edges can be directed, in which case we will call it an Arrow Graph, or undirected, in which case we will call it an Edge Graph. Furthermore, edges and arrows can also have values, in which case we call it a Valued Graph.

## Graph types

Rimbu offers many types of graphs, the main characteristics being valued or non-valued, and directed or undirected:

| Edge property | Non-valued                        | Valued                                            |
| ------------- | --------------------------------- | ------------------------------------------------- |
| Directed      | [`ArrowGraph<N>`](graph/arrow.md) | [`ArrowValuedGraph<N, V>`](graph/arrow_valued.md) |
| Undirected    | [`EdgeGraph<N>`](graph/edge.md)   | [`EdgeValuedGraph<N, V>`](graph/edge_valued.md)   |

### Arrow Graph

Properties of an **Arrow Graph** (directed graph) in Rimbu:

- An Arrow Graph consists of 0 or more nodes, and 0 or more arrows
- Each node in an Arrow Graph has a unique value
- Each arrow has a start node, and an end node
- An arrow can connect a node to itself, but only once
- Two different arrows cannot have the same start node AND end node

Arrow Graphs are useful when instances of one entity type have a directional relation. In an arrow graph, A -> B does not imply B -> A.

Examples of Arrow Graph applications are:

- A site's web pages and links between them
- Public transit stops and connections (some may be one-way)

### Edge Graph

An **Edge graph** (undirected graph) has the following properties:

- An Edge Graph consists of 0 or more nodes, and 0 or more edges
- Each node in an Edge Graph has a unique value
- Each edge has 2 nodes indicating a bi-directional connection without direction
- An edge can connect a node to itself, but only once
- Two different edges cannot have the same 2 nodes even if the nodes are in reverse order

Edge Graphs are useful when instances of one entity type have a bidirectional relation if they are related. In an edge graph, A -> B also implies that B -> A.

Examples of Edge Graph applications are:

- A group of persons where connections indicate that those persons are friends.
- Distances between cities

## Abstract Graph types

To support a large variety of use cases, there are quite a number of abstract graph types available. These cannot be used to construct Graphs, but the can be convenient when writing generic code operating on Graphs.

<img id="_inheritance" class="diagram" />

## Non-valued Graph types

Here is an overview of the available concrete non-valued graph types. The concrete types have constructor methods to create graph instances.

<img id="_inheritance_nonvalued" class="diagram" />

## Valued Graph types

Here is an overview of the available concrete valued graph types. The concrete types have constructor methods to create graph instances.

<img id="_inheritance_valued" class="diagram" />

<script src="graph/graph.js"></script>
