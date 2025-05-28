<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fstate-transformer.svg)](https://www.npmjs.com/package/@rimbu/state-transformer) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/parser

## Motivation

### Key Benefits

### Why Use `@rimbu/state-transformer`?

### Feedback and Contributions

We encourage you to try out `@rimbu/parser` and provide feedback. If you encounter any issues or have suggestions for improvement, please don't hesitate to create issues on our repository.

## Docs

Full documentation is still to be done. To read more about Rimbu, please visit the _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu State Transformer API Docs](https://rimbu.org/api/rimbu/state-transformer)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Yarn / NPM / Bun

For `yarn`:

> `yarn add @rimbu/state-transformer`

For `npm`:

> `npm i @rimbu/state-transformer`

For `bun`:

> `bun add @rimbu/state-transformer`

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
import { StateTransformer } from '@rimbu/state-transformer/mod.ts';
```

To run your script (let's assume the entry point is in `src/main.ts`):

`deno run --import-map import_map.json src/main.ts`

## Usage

```ts
import { StateTransformer } from '@rimbu/state-transformer';

interface State {
  count: number;
  text: string;
}

const Transformer =
  StateTransformer.createContext<StateTransformer.Types<State>>();

const initState: State = {
  count: 5,
  text: 'hello',
};

// Create a transformer to increment the count
const incrementCount = Transformer.mapState((state) => ({
  ...state,
  count: state.count + 1,
}));

// Apply the transformer
const [newState, output] = incrementCount(initState, null);

console.log(newState); // { count: 6, text: 'hello' }
console.log(output); // null
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
