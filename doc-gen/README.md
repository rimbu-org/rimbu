# Rimbu Doc Gen

## About

The Rimbu Doc Gen is a Deno application that takes JSON input files (exported with [Microsoft's API Extractor](https://api-extractor.com/)), and outputs a generated API documentation structure, mostly in the form of `.mdx` files that can be processed by [Docusaurus](https://docusaurus.io/).

See the results at the [Rimbu API Docs](https://rimbu.org/api).

## How to run

1. Ensure you have Deno installed.
2. To get the API Extractor input files, run `yarn extract-api` in the root folder of this monorepo.
3. Go back into this `doc-gen` folder, and verify that the `input` folder has contents.
4. Run the following command:

`deno run --import-map import_map.json --allow-read --allow-write --no-check src/main.ts -i input -o output`

5. Verify that the `output` folder has contents.

## Application

This documentation generator is built specifically for Rimbu and it's style of exporting types. Using it for other projects will likely give unexpected results and errors and is therefore not recommended.

If you would like to adapt it to be more generically usable, feel free to continue development on this project, or share your wish with the authors.

## Author

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
