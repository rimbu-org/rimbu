# Path

`Path` is a function to easily retrieve and update a possibly nested property in an object. As shown in the `Patch` documentation, it can be quite hard to update an immutable object without helpers. That `Path` object allows you to specify the location of a nested property using a string:

```ts
import { Path } from '@rimbu/core';

type Person = {
  name: string;
  address: {
    street: string;
    number: number;
  };
};

function updateAddressNumber(person: Person, value: number): Person {
  return Path.patchValue(peron, 'address.number', value);
}

function getPersonStreet(person: Person): string {
  return Path.getValue(person, 'address.number');
}
```

The following CodeSandbox shows more examples of how to use the `Path` object:

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/deep/path.ts ':target blank :class=btn')

[Match](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/deep/path.ts ':include :type=iframe width=100% height=450px')
