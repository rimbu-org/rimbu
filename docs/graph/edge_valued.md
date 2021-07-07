# EdgeValuedGraph

An `EdgeValuedGraph` is an undirected `ValuedGraph` where the edges have values. This structure is useful for situations in which elements of the same type can have relations to each other, and those relations have some associated value. The relations are bidirectional, so A -> B also implies that B -> A.

Like all `Graph` implementations, these graphs can contain cycles and isolated nodes are allowed.

The `@rimbu/core` package exports the following EdgeValuedGraph types:

| Name                          | Description                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `EdgeValuedGraph<N, V>`       | a generic undirected valued graph with nodes of type N, and edge values of type V |
| `EdgeValuedGraphHashed<N, V>` | a valued undirected graph with hashed nodes of type N, and edge values of type V  |
| `EdgevaluedGraphSorted<N, V>` | a valued undirected graph with sorted nodes of type N, and edge values of type V  |

## Usage

### Creation

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/edge/valued/create.ts ':target=_blank :class=btn')

[Create List](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/edge/valued/create.ts ':include :type=iframe width=100% height=450px')

### Query

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/edge/valued/query.ts ':target=_blank :class=btn')

[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/edge/valued/query.ts ':include :type=iframe width=100% height=450px')

### Motivation

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/edge/valued/motivation.ts ':target=_blank :class=btn')

[Motivation](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/edge/valued/motivation.ts ':include :type=iframe width=100% height=450px')

### Builder

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/edge/valued/build.ts ':target=_blank :class=btn')

[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/edge/valued/build.ts ':include :type=iframe width=100% height=450px')
