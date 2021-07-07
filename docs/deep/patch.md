# Patch

The `Immutable` function and type allow easy creation of plain objects that cannot be modified. However, it is quite useful to create immutable copies of these objects that change some of its properties.

The main example is Redux state management, which requires any changes to object data to copy the entire object. However, copying deeply nested objects is a lot of work:

```ts
// update a deeply nested prop without tools
const state = {
  a: 1,
  b: {
    c: 'text',
    d: true,
  },
};

const newState = {
  ...state,
  a: state.a + 1,
  b: {
    ...state.b,
    c: 'newText',
  },
};

// newState => { a: 2, b: { c: 'newText', d: true } }
```

There are libraries that solve this problem in various ways, for example, the [Immer](https://github.com/immerjs/immer) library allows you to write mutable code that will in the end result in a new object containing those changes.

Rimbu offers the `patch` function, which has a kind of 'contract' to specify how a specific object should be updated. The contract uses a quite concise but powerful notation, making it quite handy or many use cases. It also only copies those parts that have changes, and maintains references to the original parts that didn't change.

## Usage

The `patch` function takes the plain object to update, and one or more `Update` objects or functions specifying how the object should be updated. It then returns an updated object:

```ts
import { patch } from '@rimbu/core';

const state = {
  a: 1,
  b: {
    c: 'text',
    d: true,
  },
};

const newState = patch(state)({
  a: (v) => v + 1,
  b: { c: 'newText' },
});

// newState => { a: 2, b: { c: 'newText', d: true } }
```

The following CodeSandbox shows more example of how to use `patch`:

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/deep/patch.ts ':target=_blank :class=btn')

[Patch](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/deep/patch.ts ':include :type=iframe width=100% height=450px')
