# Stream

A Stream is an Iterable-like structure that represents a source that can stream values when requested. The source is unspecified, it may be a materialized object (e.g. an Array), or a calculated sequence (e.g. the fibonacci numbers). However, unlike an Iterable, a Stream offers many methods to change the values produced by the Stream, before it is consumed, without the need to `materialize` intermediate instances.

Streams are reusable, and in general, they should always return the same values in the same order (exceptions are randomized streams). This makes them excellent to use as glue between various collection instances.

Except for intentionally random sources, a `Stream` should satisfy the following contract:

- An iterator produced by the Stream should return the same values in the same order.

## Plumbing

The `Stream` should be seen as the way to transfer values from one form to the other. All Rimbu collections can be both converted to a `Stream`, and created from a `Stream`. Creating a `Stream` is always an O(1) operation.

Because a `Stream` has many methods to manipulate its values without materializing into a new collection, it can be used in many ways.

A `Stream` is also `Iterable` so it also blends in well with 'traditional' methods and uses. Internally, a lot of effort is put into making it as efficient as possible using all kinds of optimizations.

## Usage

### Creation

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/stream/create.ts ':target=_blank :class=btn')

[Create](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/stream/create.ts ':include :type=iframe width=100% height=450px')

### Query

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/stream/query.ts ':target=_blank :class=btn')

[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/stream/query.ts ':include :type=iframe width=100% height=450px')

### Conversions

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/stream/conversions.ts ':target=_blank :class=btn')

[Conversion](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/stream/conversions.ts ':include :type=iframe width=100% height=450px')

### Reduce

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/stream/reduce.ts ':target=_blank :class=btn')

[Reduce](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/stream/reduce.ts ':include :type=iframe width=100% height=450px')
