# Set

A Set is a collection of values, where the collection does not contain duplicate values. That is, all values are unique. The way this uniqueness is determined can vary through the specific Set implementation that is chosen.

Sets are useful when you only need to know if some element is present or not in a set. Adding an element for a second time to the same set has no effect. The Set can tell you, in an efficient way, whether some element is present.

Imagine we want to censor some words from pieces of text. We can create a Set containing all the words we want to censor. Then, we need to split up the text into words, and for each word query whether our set contains that word. If it does, we replace it with some other characters.

## HashSet

The `HashSet` is a Set that uses a `Hasher` instance to convert elements to numbers. These number are used to efficiently verify equality between values, because elements with different hash numbers are guaranteed to be unequal.

## SortedSet

The `SortedSet` is a Set that uses a `Comp` instance that can compare elements and tell whether they are equal or which one is 'larger'. In this way, the Set is kept sorted, and iterating over its elements will produce them in sorted order.

## OrderedSet

The `OrderedSet` is a Set with internally an extra `List` that maintains the insertion order. In this way, iterating over the Set returns the values in the same order as they were inserted.

## Exports

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

<img id="_inheritance" class="diagram" />

<script src="set/set.js"></script>

## Usage

### Creation

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/set/create.ts ':target=_blank :class=btn')

[Create](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/set/create.ts ':include :type=iframe width=100% height=450px')

### Query

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/set/query.ts ':target=_blank :class=btn')

[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/set/query.ts ':include :type=iframe width=100% height=450px')

### Builder

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/set/build.ts ':target=_blank :class=btn')

[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/set/build.ts ':include :type=iframe width=100% height=450px')
