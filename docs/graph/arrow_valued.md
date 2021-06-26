# ArrowValuedGraph

An `ArrowValuedGraph` is a directed `ValuedGraph` where the edges have values. This structure is useful for situations in which elements of the same type can have relations to each other, and those relations have some associated value. The relations are directed, so A -> B does not imply that B -> A.

Like all `Graph` implementations, these graphs can contain cycles and isolated nodes are allowed.

The `@rimbu/core` package exports the following ArrowValuedGraph types:

| Name                           | Description                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `ArrowValuedGraph<N, V>`       | a generic directed valued graph with nodes of type N, and edge values of type V |
| `ArrowValuedGraphHashed<N, V>` | a valued directed graph with hashed nodes of type N, and edge values of type V  |
| `ArrowvaluedGraphSorted<N, V>` | a valued directed graph with sorted nodes of type N, and edge values of type V  |

## Usage

### Creation

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/arrow/valued/create.ts ':target blank :class=btn')

[Create List](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/arrow/valued/create.ts ':include :type=iframe width=100% height=450px')

### Query

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/arrow/valued/query.ts ':target blank :class=btn')

[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/arrow/valued/query.ts ':include :type=iframe width=100% height=450px')

### Motivation

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/arrow/valued/motivation.ts ':target blank :class=btn')

[Motivation](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/arrow/valued/motivation.ts ':include :type=iframe width=100% height=450px')

### Builder

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/arrow/valued/build.ts ':target blank :class=btn')

[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/arrow/valued/build.ts ':include :type=iframe width=100% height=450px')
