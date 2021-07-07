# MultiMap

A Rimbu MultiMap is a Map in which each key has one or more values. For each key, it's associated values are unique, that is, the values for each key are kept in a `Set`.

A MultiMap is useful when there is a one to many relation between two types of entities. For example, one planet can have many moons, so if we have a MultiMap from Planet to Moon, we can easily find all the moons that belong to a particular planet. However, if we also easily want to know to which planet a moon belongs, it would be better to use a [`BiMultiMap`](bimultimap/)

The predefined MultiMap implementations do not maintain the insertion order of the values per key. However, it is possible to create a custom context with an `OrderedSet` implementation to achieve this behavior.

## Exports

The `@rimbu/core` package exports the following _abstract_ MultiMap types:

| Name                    | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| `VariantMultiMap<K, V>` | a type-variant multimap between values of type K and values of type V |
| `MultiMap<K, V>`        | a generic multimap between values of type K and values of type V      |

The `@rimbu/core` package exports the following _concrete_ MultiMap types:

| Name                              | Description                                                            |
| --------------------------------- | ---------------------------------------------------------------------- |
| `HashMultiMapHashValue<K, V>`     | a multimap between hashed values of type K and hashed values of type V |
| `HashMultiMapSortedValue<K, V>`   | a multimap between hashed values of type K and sorted values of type V |
| `SortedMultiMapHashValue<K, V>`   | a multimap between sorted values of type K and hashed values of type V |
| `SortedMultiMapSortedValue<K, V>` | a multimap between sorted values of type K and sorted values of type V |

## Inheritance

<img id="_inheritance"  class="diagram" />

<script src="multimap/multimap.js"></script>

## Usage

### Creation

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/multimap/create.ts ':target=_blank :class=btn')

[Create](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/multimap/create.ts ':include :type=iframe width=100% height=450px')

### Query

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/multimap/query.ts ':target=_blank :class=btn')

[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/multimap/query.ts ':include :type=iframe width=100% height=450px')

### Builder

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/multimap/build.ts ':target=_blank :class=btn')

[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/multimap/build.ts ':include :type=iframe width=100% height=450px')
