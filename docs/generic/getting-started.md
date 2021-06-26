# Getting started

## CodeSandbox

This documentation site makes a lot of use of CodeSandbox examples, where you can use the Rimbu library live in a browser environment. Try it out to quickly browse through many examples:

[Open Rimbu Sandbox](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts ':target blank :class=btn')

## Installation

To install the library in your own project:

> `npm install @rimbu/core`

or

> `yarn add @rimbu/core`

## Settings

We recommend adding the following settings to your `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noStrictGenericChecks": true
  }
}
```

## Ready to use

Import into and use in your code:

```ts
import { List, Stream } from '@rimbu/core';

const list = List.from(Stream.range({ start: 2, amount: 64 }));
console.log(list.toString());
```
