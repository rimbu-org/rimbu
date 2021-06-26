# Tuple

A Rimbu `Tuple` is a normal JS Array with fixed length and element types. It's main use is for better type inference in some cases. Also, it contains some utility functions to manipulate tuple contents and create new tuple types by appending or prepending elements in a type-safe way.

The main need for this type is when the TypeScript compiler infers either too strict or too loose types. The example CodeSandbox shows examples of these cases.

## Example

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/deep/tuple.ts ':target blank :class=btn')

[Match](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/deep/tuple.ts ':include :type=iframe width=100% height=450px')
