# EdgeGraph

An `EdgeGraph` is an undirected `Graph` where the edges have no values. This structure is useful for situations in which elements of the same type can have relations to each other. The relation is either there or not there. The relation is bidirectional, so A -> B also implies that B -> A.

Like all `Graph` implementations, these graphs can contain cycles and isolated nodes are allowed.

The `@rimbu/core` package exports the following ArrowGraph types:

| Name                 | Description                                     |
| -------------------- | ----------------------------------------------- |
| `EdgeGraph<N>`       | a generic undirected graph with nodes of type N |
| `EdgeGraphHashed<N>` | an undirected graph with hashed nodes of type N |
| `EdgeGraphSorted<N>` | an undirected graph with sorted nodes of type N |

## Usage

### Creation

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/edge/non-valued/create.ts ':target blank :class=btn')

[Create List](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/edge/non-valued/create.ts ':include :type=iframe width=100% height=450px')

### Query

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/edge/non-valued/query.ts ':target blank :class=btn')

[Query List](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/edge/non-valued/query.ts ':include :type=iframe width=100% height=450px')

### Motivation

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/edge/non-valued/motivation.ts ':target blank :class=btn')

[Manipulate List](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/edge/non-valued/motivation.ts ':include :type=iframe width=100% height=450px')

### Builder

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/graph/edge/non-valued/build.ts ':target blank :class=btn')

[Build List](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/graph/edge/non-valued/build.ts ':include :type=iframe width=100% height=450px')
