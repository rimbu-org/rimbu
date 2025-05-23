<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Ftypical.svg)](https://www.npmjs.com/package/@rimbu/typical) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/typical

Rimbu Typical is a type-level library offering string and numeric operations on types instead of values. It allows you to prevent the compiler from accepting certain
input values from functions, and to give a specific literal return type for many advanced cases.

Rimby Typical is mainly educational and intended to show the power of TypeScript's type system.

> This library depends heavily on complex and advanced types, some sometimes even what can be called hacks. Behavior may change over newer TypeScript versions. Use with caution in production code.

## Motivation

TypeScript is a language of trade-offs. One of those trade-offs is to say goodbye to type consistency, but to say hello to complex rule-based types. This probably
happened due to the desire to add types to sometimes bizarre JavaScript code that has all kinds of assumptions on the input and output types.

One advantage of this is that we can perform very complex logic based on types. The introduction of template literal types has greatly increased this power, allowing
all kinds of string operations on literal string types.

But why stop there? While there have been requests to also be able to do calculations (e.g. addition) with numeric literals, the TypeScript maintainers have replied
that it is not high on their priorities.

However, since we can manipulate strings, we can create a bijection from numbers to strings, and perform mathematical operations on the string representation of numbers.
You've read that correctly. For example, to add two type-level number literals, we first convert them to base-10 strings (13 becomes '13'), then use string literal
magic to add the two numbers, and finally convert the number back to a string. And it actually works pretty well!

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/typical/num.ts) in CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

This library only contains type definitions. You should therefore install it as a dev dependency:

**Yarn:**

```sh
yarn add --dev @rimbu/typical
```

**npm:**

```sh
npm i @rimbu/typical --save-dev
```

**Bun:**

```sh
bun add --development @rimbu/typical
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

```ts
import { Num, Str, U } from '@rimbu/stream';

declare function add<N1 extends number, N2 extends number>(): Num.Add<N1, N2>;

const r1 = add(1, 3);
// type of r1: 4

declare function divide<N1 extends number, N2 extends number>(): Num.Div<
  N1,
  N2
>;

const r2 = divide(9, 3);
// type of r2: 3

declare function limitedNumber<N extends number>(
  value: N & U.Check<Num.GreaterThan<N, 10>>
): void;

limitedNumber(20); // OK
limitedNumber(5); // compiler error

declare function limitedString<S extends string>(
  value: S & U.Check<Str.Contains<S, 'a', 2>>
): Str.Replace<S, 'a', '-'>;

const r3 = limitedString('abaca');
// type of r3: '-b-c-'
limitedString('abc'); // compiler error
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
