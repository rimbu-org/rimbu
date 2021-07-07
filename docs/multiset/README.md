# MultiSet

A Rimbu MultiSet is a Set-like structure where each unique element can be added multiple times. Each element in the MultiSet occurs one or more times. The MultiSet keeps track of the amount of times an element was added.

The MultiSet is useful for use cases that involve some kind of frequency count. For example, for a piece of text, to split it in words and count the amount of times each word occurs. Or, for a set of events, to count the frequencies of those events.

## Exports

The `@rimbu/core` package exports the following _abstract_ MultiSet types:

| Name                 | Description                                     |
| -------------------- | ----------------------------------------------- |
| `VariantMultiSet<T>` | a type-variant MultiSet with elements of type T |
| `MultiSet<T>`        | a generic MultiSet with elements of type T      |

The `@rimbu/core` package exports the following _concrete_ Multiset types:

| Name                | Description                               |
| ------------------- | ----------------------------------------- |
| `HashMultiSet<T>`   | a MultiSet with hashed elements of type T |
| `SortedMultiSet<T>` | a MultiSet with sorted elements of type T |

## Inheritance

<img id="_inheritance" class="diagram" />

<script src="multiset/multiset.js"></script>

## Usage

### Creation

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/multiset/create.ts ':target=_blank :class=btn')

[Create](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/multiset/create.ts ':include :type=iframe width=100% height=450px')

### Query

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/multiset/query.ts ':target=_blank :class=btn')

[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/multiset/query.ts ':include :type=iframe width=100% height=450px')

### Manipulation

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/multiset/manipulation.ts ':target=_blank :class=btn')

[Manipulation](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/multiset/manipulation.ts ':include :type=iframe width=100% height=450px')

### Builder

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/multiset/build.ts ':target=_blank :class=btn')

[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/multiset/build.ts ':include :type=iframe width=100% height=450px')
