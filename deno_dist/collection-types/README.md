<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/collection-types

This package contains the type definitions for the basic generic Rimbu collections.

For complete documentation please visit the [Immutable Collections page](https://rimbu.org/docs/collections) _[Rimbu Docs](https://rimbu.org)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through `@rimbu/core`. It is recommended to use that package. The types in this package are mostly abstract and have no actual implementation.

To install this package only:

### Yarn/NPM

> `yarn add @rimbu/collection-types`

or

> `npm i @rimbu/collection-types`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/collection-types/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/collection-types@x.y.z/mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { VariantMap } from './rimbu.ts';
```

Because Rimbu uses complex types, it's recommended to use the `--no-check` flag (your editor should already have checked your code) and to specify a `tsconfig.json` file with the settings described below.

Running your script then becomes:

> `deno run --no-check --config tsconfig.json <your-script>.ts`

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
