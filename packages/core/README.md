<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fcore.svg)](https://www.npmjs.com/package/@rimbu/core) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/core

This package exports all the Rimbu collections, plus the contents of the `@rimbu/common` package. Its aim is to provide an easy to use access point for the collections.

For complete documentation please visit the _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu Core API Docs](https://rimbu.org/api/rimbu/core)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

### Compabitity

- [`Node >= 16` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun >= 0.6.0` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Yarn / NPM / Bun

To get started with the immutable collections, which are exported through `@rimbu/core`, you can use the following.

For `yarn`:

> `yarn add @rimbu/core`

For `npm`:

> `npm i @rimbu/core`

For `bun`:

> `bun add @rimbu/core`

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
import { List } from '@rimbu/core/mod.ts';
import { HashMap } from '@rimbu/hashed/mod.ts';
```

Note that for sub-packages, due to conversion limitations it is needed to import the `index.ts` instead of `mod.ts`, like so:

```ts
import { HashMap } from '@rimbu/hashed/map/index.ts';
```

To run your script (let's assume the entry point is in `src/main.ts`):

`deno run --import-map import_map.json src/main.ts`

## Usage

### Direct imports

```ts
import { List, Stream, SortedMap } from '@rimbu/core';

const list = List.of(1, 3, 2, 4, 2);

const stream = Stream.from(list).map((v) => [v, String(v * 2)]);

const map = SortedMap.from(stream);

console.log(map.toArray());
// => [[1, '2'], [2, '4'], [3, '6'], [4, '8']]
```

### Using the creation 'menu'

The same code using the creation 'menu':

```ts
import Rimbu from '@rimbu/core/menu';

const list = Rimbu.List.of(1, 3, 2, 4, 2);

const stream = Rimbu.Stream.from(list).map((v) => [v, String(v * 2)]);

const map = Rimbu.Map.Sorted.from(stream);

console.log(map.toArray());
// => [[1, '2'], [2, '4'], [3, '6'], [4, '8']]
```

## Contents

This package exports everything from the following packages:

| Name                                           | Description                                                                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [@rimbu/bimap](../bimap)                       | a bidirectional map in which keys and values have a one-to-one mapping                                                                       |
| [@rimbu/bimultimap](../bimultimap)             | a bidirectional multimap in which keys and values have a many-to-many mapping                                                                |
| [@rimbu/collection-types](../collection-types) | definitions for many of the generic collection types, used to derive more specific implementations                                           |
| [@rimbu/common](../common)                     | contains public types and functions that are used throughout the whole library                                                               |
| [@rimbu/deep](../deep)                         | offers tools to use handle plain JS objects as immutable objects. library                                                                    |
| [@rimbu/graph](../graph)                       | provides various graph implementations to represent data in forms of nodes and edges                                                         |
| [@rimbu/hashed](../hashed)                     | provides a HashMap and HashSet implementation, using hash functions to efficiently retrieve keys                                             |
| [@rimbu/list](../list)                         | provides the List datastructure containing an ordered sequence of elements that can be manipulated and accessed randomly in an efficient way |
| [@rimbu/multimap](../multimap)                 | provides a map in which keys and values have a one-to-many mapping                                                                           |
| [@rimbu/multiset](../multiset)                 | provides a set in which elements can occur multiple times                                                                                    |
| [@rimbu/ordered](../ordered)                   | provides the OrderedSet and OrderedMap collections, that keep insertion order                                                                |
| [@rimbu/sorted](../sorted)                     | provides a SortedMap and SortedSet implementation, using compare functions to efficiently keep the elements sorted                           |
| [@rimbu/stream](../stream)                     | contains methods to easily manipulate sequences of data                                                                                      |
| [@rimbu/table](../table)                       | provides various Table data structures where a combination of a row key and column key maps to a single value.                               |

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
