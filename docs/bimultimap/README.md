# BiMultiMap

A BiMultiMap is a bidirectional MultiMap of keys and values, where each key-value association also has an inverse value-key association. There is a many-to-many mapping between keys and values.

The `@rimbu/core` package exports the following types:

| Name                     | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `BiMultiMap<K, V>`       | a generic BiMultiMap between keys of type K and values of type V |
| `HashBiMultiMap<K, V>`   | a BiMultiMap implementation where keys and values are hashed     |
| `SortedBiMultiMap<K, V>` | a BiMultiMap implementation where keys and values are sorted     |

<img id="inheritance" class="diagram" />

<script src="bimultimap/bimultimap.js"></script>

## Usage

### Creation

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/create.ts ':target blank')

<!-- prettier-ignore-start -->
[Create](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/create.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->

### Query

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/query.ts ':target blank')

<!-- prettier-ignore-start -->
[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/query.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->

### Motivation

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/motivation.ts ':target blank')

<!-- prettier-ignore-start -->
[Motivation](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/motivation.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->

### Builder

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/build.ts ':target blank')

<!-- prettier-ignore-start -->
[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/bimultimap/build.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->
