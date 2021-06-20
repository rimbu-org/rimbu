# Map

A Map is a collection of entries, where each entry has a key and a value. Each key has exactly one value, and each key is unique.

Rimbu provides one unordered Map implementation, being `HashMap`, and two ordered maps, being `SortedM` and `OrderedMap`

The `@rimbu/core` package exports the following _abstract_ Map types:

| Name               | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| `VariantMap<K, V>` | a type-variant map with entries of key type K and value type V |
| `RMap<K, V>`       | a generic map with entries of key type K and value type V      |

The `@rimbu/core` package exports the following _concrete_ Map types:

| Name               | Description                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `HashMap<K, V>`    | a map with entries of key type K and value type V, where keys are hashed with a `Hasher`   |
| `SortedMap<K, V>`  | a map with entries of key type K and value type V, where keys are sorted with a `Comp`     |
| `OrderedMap<K, V>` | a map with entries of key type K and value type V, where key insertion order is maintained |

## Inheritance

<img id="inheritance" />

<script src="map/map.js"></script>

## Usage

### Creation

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/map/create.ts ':target blank')

<!-- prettier-ignore-start -->
[Create](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/map/create.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->

### Query

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/map/query.ts ':target blank')

<!-- prettier-ignore-start -->
[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/map/query.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->

### Builder

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/map/build.ts ':target blank')

<!-- prettier-ignore-start -->
[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/map/build.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->
