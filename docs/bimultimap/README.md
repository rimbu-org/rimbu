# BiMultiMap

A BiMultiMap is a bidirectional MultiMap of keys and values, where each key-value association also has an inverse value-key association. There is a many-to-many mapping between keys and values.

The BiMultiMap is useful when there is a many-to-many relation between to types of entities, and it is desired to query the relation in both directions.

For example, take a relation between persons and their hobbies. The BiMultiMap can efficiently tell you, given a person, what her hobbies are. But it can also efficiently tell you, given a hobby, which persons practice it.

Internally the BiMultiMap uses of two MultiMaps, making lookup operations in both directions fast. Insertion and memory usage are double that of a MultiMap.

## Exports

The `@rimbu/core` package exports the following _abstract_ BiMultiMap types:

| Name               | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `BiMultiMap<K, V>` | a generic BiMultiMap between keys of type K and values of type V |

The `@rimbu/core` package exports the following _concrete_ BiMultiMap types:

| Name                     | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `HashBiMultiMap<K, V>`   | a BiMultiMap implementation where keys and values are hashed |
| `SortedBiMultiMap<K, V>` | a BiMultiMap implementation where keys and values are sorted |

## Inheritance

<img id="_inheritance" class="diagram" />

<script src="bimultimap/bimultimap.js"></script>

<!-- ## Usage

### Creation

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/bimultimap/create.ts ':target=_blank :class=btn')

[Create](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/create.ts ':include :type=iframe width=100% height=450px')

### Query

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/bimultimap/query.ts ':target=_blank :class=btn')

[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/query.ts ':include :type=iframe width=100% height=450px')

### Motivation

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/bimultimap/motivation.ts ':target=_blank :class=btn')

[Motivation](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/motivation.ts ':include :type=iframe width=100% height=450px')

### Builder

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/bimultimap/build.ts ':target=_blank :class=btn')

[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/build.ts ':include :type=iframe width=100% height=450px') -->
