<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fspy.svg)](https://www.npmjs.com/package/@rimbu/spy) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/spy

This package supports testing through utilities that can create spies and mocks for functions, objects, classes. It is still in experimental phase.

## Motivation

With frameworks like Deno and ES Modules it becomes much harder/impossible to mock modules like for example Jest does. Deno [recommends](https://deno.land/manual@v1.25.2/testing/mocking) to use specific ways to expose dependencies so that they can be replaced without mocking modules.

Alternatives like [vitest](https://vitest.dev/) do offer support for ES Modules, so if you like (to keep) this way of testing, that may be a viable option.

It is important to note that `@rimbu/spy` is aimed at testing without module mocking. This means that it is not possible to replace functions inside of other files/modules. The only way is to ensure the dependencies are in an object that is passed into the code that depends on it. This object can then be spied/mocked and passed into the code.

One motivation to use an external spying/mocking framework is to be independent of a specific testing framework, so that the pain of switching becomes much less if one decides to switch.

A popular external spying/mocking framework is [Sinon JS](https://sinonjs.org/), which offers probably most of the functionality available in this package. Like `@rimbu/spy` it is also aimed at spying/mocking without module mocking.

The `@rimbu/spy` package however offers a more simple and minimal API that is easy to learn and use. It also takes care that types are consistent with their original implementations.

It depends on preference and also use case coverage whether this package offers a full alternative. Please feel free to try it out and provide feedback, and don't forget to create issues if you find anything that is not working correctly.

## Docs

Full documentation is still to be done. To read more about Rimbu, please visit the _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu Spy API Docs](https://rimbu.org/api/rimbu/spy)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

### Compabitity

- [`Node >= 16` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun >= 0.6.0` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Yarn / NPM / Bun

For `yarn`:

> `yarn add @rimbu/spy`

For `npm`:

> `npm i @rimbu/spy`

For `bun`:

> `bun add @rimbu/spy`

### Deno

For Deno, the following approach is recommended:

In the root folder of your project, create or edit a file called `import_map.json` with the following contents (where you should replace `x.y.z` with the desired version of Rimbu):

```json
{
  "imports": {
    "@rimbu/": "https://deno.land/x/rimbu@x.y.z/"
  }
}
```

**Note: The trailing slashes are important!**

In this way you can use relative imports from Rimbu in your code, like so:

```ts
import { Spy } from '@rimbu/spy/mod.ts';
```

To run your script (let's assume the entry point is in `src/main.ts`):

`deno run --import-map import_map.json src/main.ts`

## Usage

```ts
import { Spy } from '@rimbu/spy';

const spyConsole = Spy.obj(console, {
  log: () => console.log('mocked'),
});
spyConsole.warn("warning");
// => behaves as normal, logs "warning"
spyConsole.log("hello", "world);
// => logs "mocked"
spyConsole[Spy.META].nrCalls; // => 2
spyConsole.log.nrCalls;       // => 1
spyConsole.warn.calls[0];     // => ["warning"]
spyConsole[Spy.META].callSequence;
// => [["warn", "warning"], ["log", "hello", "world"]]
```

## Author

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
