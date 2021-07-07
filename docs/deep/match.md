# Match

Sometimes it is useful to have have a complex condition on a (nested) object. This can lead to long `if` statements that are also hard to read.

```ts
type Person = {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
  };
};

function process(person: Person) {
  if (
    person.age < 18 &&
    person.name === 'Bart' &&
    person.address.city === 'Springfield'
  ) {
    console.log('you shall pass');
  }
}
```

The `Match` object offers, in a similar fashion to `Patch`, a way to concisely define the conditions an object should meet:

```ts
import { Match } from '@rimbu/core';

function process(person: Person) {
  if (
    Match.any(person)({
      age: (v) => v < 18,
      name: 'Bart',
      address: {
        city: 'Springfield',
      },
    })
  ) {
    console.log('you shall pass');
  }
}
```

The following CodeSandbox shows in more detail how `Match` can be used for more complex use cases:

[Open with type inference](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/deep/match.ts ':target=_blank :class=btn')

[Match](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/deep/match.ts ':include :type=iframe width=100% height=450px')
