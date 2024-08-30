<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fcore.svg)](https://www.npmjs.com/package/@rimbu/core) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/core

Welcome to `@rimbu/core`! This package is your all-in-one access point to the powerful Rimbu collections, along with the essential utilities from the `@rimbu/common` package. It is designed to provide a seamless and efficient experience for managing collections in your applications.

### Key Features:

- **Comprehensive Collections**: Access all Rimbu collections in one place.
- **Utility Integration**: Includes all the utilities from `@rimbu/common` for enhanced functionality.
- **Ease of Use**: Simplifies the process of working with collections and utilities.

### Documentation

For complete documentation, please visit the [Rimbu Docs](https://rimbu.org), or directly explore the [Rimbu Core API Docs](https://rimbu.org/api/rimbu/core).

### Try It Out

Experience the power of `@rimbu/core` in action! [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) on CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/core
```

**npm:**

```sh
npm install @rimbu/core
```

**Bun:**

```sh
bun add @rimbu/core
```

### Deno Setup

Create or edit `import_map.json` in your project root:

```json
{
  "imports": {
    "@rimbu/": "https://deno.land/x/rimbu@x.y.z/"
  }
}
```

_Replace `x.y.z` with the desired version._

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

This package exports everything from the following sub-packages, each designed to provide specialized data structures and utilities:

| Package                                        | Description                                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [@rimbu/bimap](../bimap)                       | A bidirectional map where each key maps to a unique value and vice versa.                            |
| [@rimbu/bimultimap](../bimultimap)             | A bidirectional multimap allowing many-to-many mappings between keys and values.                     |
| [@rimbu/collection-types](../collection-types) | Definitions for generic collection types, serving as the foundation for specific implementations.    |
| [@rimbu/common](../common)                     | Public types and functions used throughout the entire library.                                       |
| [@rimbu/deep](../deep)                         | Tools for handling plain JavaScript objects as immutable objects.                                    |
| [@rimbu/graph](../graph)                       | Various graph implementations to represent data as nodes and edges.                                  |
| [@rimbu/hashed](../hashed)                     | HashMap and HashSet implementations using hash functions for efficient key retrieval.                |
| [@rimbu/list](../list)                         | List data structure for ordered sequences of elements with efficient random access and manipulation. |
| [@rimbu/multimap](../multimap)                 | A map where each key can map to multiple values.                                                     |
| [@rimbu/multiset](../multiset)                 | A set where elements can occur multiple times.                                                       |
| [@rimbu/ordered](../ordered)                   | OrderedSet and OrderedMap collections that maintain insertion order.                                 |
| [@rimbu/proximity](../proximity)               | ProximityMap for retrieving values based on key proximity.                                           |
| [@rimbu/sorted](../sorted)                     | SortedMap and SortedSet implementations using compare functions to keep elements sorted.             |
| [@rimbu/stream](../stream)                     | Methods for manipulating sequences of data.                                                          |
| [@rimbu/table](../table)                       | Table data structures where a combination of row and column keys maps to a single value.             |

## Author

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke).

## Contributing

We welcome contributions! Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

_Made with [contributors-img](https://contrib.rocks)._

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) for details.
