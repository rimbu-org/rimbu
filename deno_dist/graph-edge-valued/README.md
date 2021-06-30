<p align="center">
    <img src="../../assets/rimbu_logo.svg" />
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

All types are exported through [`@rimbu/core`](../core). It is recommended to use this package.

To install separately:

> `yarn add @rimbu/graph`

or

> `npm i @rimbu/graph`

### recommended tsconfig settings

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
