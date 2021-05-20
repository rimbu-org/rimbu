# Immutable collections

The `@rimbu/core` package is a convenience package that exports all the available immutable collections. Additionally, it exports the `Create` constructor object that allows quick access to all the collections without needing to use explicit imports.

# Quick start

## Installation

Create or open your TypeScript (4.2+) project, then inside its root folder execute:

> `yarn add @rimbu/core`

or

> `npm install @rimbu/core`

## Recommended tsconfig settings

Rimbu uses advanced and recursive typing, potentially making the TS compiler quite slow. Also it can lead to `infinite type recursion` errors issued by the compiler. It is recommended to set the following values in the `tsconfig.json` file of your project:

```json
{
  //  ...
  "compilerOptions": {
    // ...
    "skipLibCheck": true,
    "noStrictGenericChecks": true
  }
}
```

> While developing the Rimbu libraries, it appeared that the `noStrictGenericChecks` option does not really catch many relevant type errors. Therefore, enabling it does not seem to be a large issue, and will greatly improve compiler performance.

## Usage

You can use the `Create` index object to find out which collections can be created:

```ts
import { Create } from "@rimbu/core";

const stream = Create.Stream.of("a", "b", "c");
// type: Stream.NonEmpty<string>

const list = Create.List.of(1, 2, 3);
// type: List.NonEmpty<number>

const set = Create.Set.Sorted.of(10 4, 3, 9);
// type: SortedSet.NonEmpty<number>

const map = Create.Map.Hashed.of([1, 'a'], [3, 'c']);
// type: HashMap.NonEmpty<number, string>

const table = Create.Table.SortedRow.HashColumn.of([1, 'a', true], [2, 'a', false]);
// type: SortedTableHashColumn.NonEmpty<number, string, boolean>

const graph = Create.Graph.Valued.Hashed.of([1, 2, 'a'], [2, 3, 'b']);
// type: HashValuedGraph.NonEmpty<number, string>
```

Or directly import the types:

```ts
import { Stream, List, SortedSet, HashMap, SortedSet, HashMap, SortedTableHashColumn, HashValuedGraph } from "@rimbu/core";

const stream = Stream.of("a", "b", "c");
// type: Stream.NonEmpty<string>

const list = List.of(1, 2, 3);
// type: List.NonEmpty<number>

const set = SortedSet.of(10 4, 3, 9);
// type: SortedSet.NonEmpty<number>

const map = HashMap.of([1, 'a'], [3, 'c']);
// type: HashMap.NonEmpty<number, string>

const table = SortedTableHashColumn.of([1, 'a', true], [2, 'a', false]);
// type: SortedTableHashColumn.NonEmpty<number, string, boolean>

const graph = HashValuedGraph.of([1, 2, 'a'], [2, 3, 'b']);
// type: HashValuedGraph.NonEmpty<number, string>
```
