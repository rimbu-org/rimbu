# Set

A Set is a collection of values, where the collection does not contain duplicate values. That is, all values are unique.

The `@rimbu/core` package exports the following _abstract_ Set types:

| Name            | Description                        |
| --------------- | ---------------------------------- |
| `VariantSet<T>` | a type-variant set of value type T |
| `RSet<T>`       | a generic set of value type T      |

The `@rimbu/core` package exports the following _concrete_ Set types:

| Name            | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `HashSet<T>`    | a set of value type T where items are hashed with a `Hasher` |
| `SortedSet<T>`  | a set of value type T where items are sorted with a `Comp`   |
| `OrderedSet<T>` | a set of value type T where insertion order is maintained    |

## Inheritance

<img id="inheritance" />

<script src="set/set.js"></script>

## Usage

### Creation

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/set/create.ts ':target blank')

<!-- prettier-ignore-start -->
[Create](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/set/create.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->

### Query

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/set/query.ts ':target blank')

<!-- prettier-ignore-start -->
[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/set/query.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->

### Builder

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/set/build.ts ':target blank')

<!-- prettier-ignore-start -->
[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/set/build.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->
