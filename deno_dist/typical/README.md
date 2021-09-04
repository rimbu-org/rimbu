<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

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

Or [Try Me Out](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/typical/num.ts) in CodeSandBox.

## Installation

### Yarn/NPM

This library only contains type definitions. You should therefore install it as a dev dependency:

> `yarn add --dev @rimbu/typical`

or

> `npm i @rimbu/typical --save-dev`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/typical/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/typical@x.y.z/mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { Num } from './rimbu.ts';
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

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](../../CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=vitoke/iternal"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
