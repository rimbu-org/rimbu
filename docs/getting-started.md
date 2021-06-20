## Getting started

This documentation site makes a lot of use of CodeSandbox, where you can use the library live in a browser environment.

[Open full sandbox with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts ':target blank')

### Installation

> `npm install @rimbu/core`

or

> `yarn add @rimbu/core`

### Settings

We recommend adding the following settings to your `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noStrictGenericChecks": true
  }
}
```

### Ready to use

Import into and use in your code:

```ts
import { List, Stream } from '@rimbu/core';

const list = List.from(Stream.range({ start: 2, amount: 64 }));
console.log(list.toString());
```
