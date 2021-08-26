<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/graph-edge-valued

This package contains the implementations for the EdgeValuedGraph type. It was mainly split off to a seperate package from the `@rimbu/graph` package to descrease build time and memory usage.

This package exports the following types:

| Name                          | Description                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `EdgeValuedGraph<N, V>`       | a generic undirected valued graph with nodes of type N, and edge values of type V |
| `EdgeValuedGraphHashed<N, V>` | a valued undirected graph with hashed nodes of type N, and edge values of type V  |
| `EdgevaluedGraphSorted<N, V>` | a valued undirected graph with sorted nodes of type N, and edge values of type V  |

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

Or [Try Me Out](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use that package.

To install separately:

### Yarn/NPM

> `yarn add @rimbu/graph-edge-valued`

or

> `npm i @rimbu/graph-edge-valued`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/graph-edge-valued/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/graph-edge-valued@x.y.z./mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { EdgeValuedGraphHashed } from './rimbu.ts';
```

Because Rimbu uses complex types, it's recommended to use the `--no-check` flag (your editor should already have checked your code) and to specify a `tsconfig.json` file with the settings described below.

Running your script then becomes:

> `deno run --no-check --config tsconfig.json <your-script>.ts`

## Recommended `tsconfig.json` settings

Rimbu uses advanced and recursive typing, potentially making the TypeScript compiler quite slow in some cases, or causing infinite recursion. It is recommended to set the following values in the `tsconfig.json` file of your project:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noStrictGenericChecks": true
  }
}
```

## Usage

## Author

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](../../CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=vitoke/iternal"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
