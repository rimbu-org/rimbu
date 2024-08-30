<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fspy.svg)](https://www.npmjs.com/package/@rimbu/spy) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/spy

Welcome to `@rimbu/spy`! This package provides utilities for creating spies and mocks for functions, objects, and classes, aimed at enhancing your testing experience. Note that it is currently in the experimental phase.

## Motivation

Testing frameworks like Deno and ES Modules present challenges for module mocking, unlike Jest. Deno [recommends](https://deno.land/manual@v1.25.2/testing/mocking) exposing dependencies in a way that allows replacement without module mocking.

While alternatives like [Vitest](https://vitest.dev/) support ES Modules and may be a viable option for those who prefer module mocking, `@rimbu/spy` focuses on testing without module mocking. This means you cannot replace functions inside other files/modules directly. Instead, dependencies should be encapsulated in an object passed into the dependent code, which can then be spied/mocked.

### Key Benefits

- **Framework Independence**: Using an external spying/mocking framework reduces dependency on a specific testing framework, easing the transition if you decide to switch.
- **Minimal and Simple API**: `@rimbu/spy` offers a straightforward API that is easy to learn and use, ensuring type consistency with original implementations.
- **Alternative to Sinon JS**: While [Sinon JS](https://sinonjs.org/) provides extensive functionality, `@rimbu/spy` offers a simpler, more minimalistic approach.

### Why Use `@rimbu/spy`?

- **No Module Mocking**: Ideal for scenarios where module mocking is not feasible or desired.
- **Consistent Types**: Ensures that types remain consistent with their original implementations.
- **Ease of Use**: Designed to be easy to learn and integrate into your testing workflow.

### Feedback and Contributions

We encourage you to try out `@rimbu/spy` and provide feedback. If you encounter any issues or have suggestions for improvement, please don't hesitate to create issues on our repository.

## Docs

Full documentation is still to be done. To read more about Rimbu, please visit the _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu Spy API Docs](https://rimbu.org/api/rimbu/spy)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
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

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke).

## Contributing

We welcome contributions! Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

_Made with [contributors-img](https://contrib.rocks)._

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) for details.
