# BiMap

A BiMap is a bidirectional Map of keys and values, where each key has exactly one value, and each value has exactly one key. Furthermore, both keys and values are unique and there is a one-to-one mapping between keys and values.

This `BiMap` can be useful when you have a domain in which there needs to be a strict one-to-one mapping between two types of entities. For example, say we have a BiMap between persons and seats in a room. A person can have only one seat, and a seat can have only one person. Using a BiMap, this restriction is guaranteed. If we assign seat 1 to person A, and then assign seat 5 to person A, seat 1 will automatically be vacant. In a similar way, if we assign seat 1 to person A, and then seat 1 to person B, person A no longer has a seat.

The BiMap internally uses two 'normal' Maps to maintain this guarantee, and therefore also provides fast look-up times both for keys and values. Insertion time and memory usage are double that of a normal Map.

## Exports

The `@rimbu/core` package exports the following _concrete_ BiMap types:

| Name          | Description                                                   |
| ------------- | ------------------------------------------------------------- |
| `BiMap<K, V>` | a generic `BiMap` between keys of type K and values of type V |

## Usage

### Creation

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/bimap/create.ts ':target=_blank :class=btn')

[Create](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimap/create.ts ':include :type=iframe width=100% height=450px')

### Query

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/bimap/query.ts ':target=_blank :class=btn')

[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimap/query.ts ':include :type=iframe width=100% height=450px')

### Motivation

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/bimap/motivation.ts ':target=_blank :class=btn')

[Motivation](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimap/motivation.ts ':include :type=iframe width=100% height=450px')

### Builder

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/bimap/build.ts ':target=_blank :class=btn')

[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimap/build.ts ':include :type=iframe width=100% height=450px')
