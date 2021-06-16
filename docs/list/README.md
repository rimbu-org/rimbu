# List

The List is an immutable ordered sequence of elements that can be manipulated and accessed randomly in a relatively efficient way. It can handle data sizes from small to very large since it is block-based. This means that, for larger data sets, the data is cut into chunks. When updating one element in a large collection, this will only require copying of one chunk of data, and updating the element in the copy (and then updating the List administration). The rest of the chunks remain the same.

## Usage

### Creation

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/list/create.ts ':target blank')

<!-- prettier-ignore-start -->
[Create](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/list/create.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->

### Query

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/list/query.ts ':target blank')

<!-- prettier-ignore-start -->
[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/list/query.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->

### Manipulation

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/list/manipulation.ts ':target blank')

<!-- prettier-ignore-start -->
[Manipulation](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/list/manipulation.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->

### Builder

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/list/build.ts ':target blank')

<!-- prettier-ignore-start -->
[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/list/build.ts ':include :type=iframe width=100% height=450px')
<!-- prettier-ignore-end -->
