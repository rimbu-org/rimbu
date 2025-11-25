<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fdeep.svg)](https://www.npmjs.com/package/@rimbu/deep)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/deep`

**Immutable, type-safe utilities for deeply patching, matching, and selecting from plain JavaScript objects.**

`@rimbu/deep` gives you a set of composable tools – `Patch`, `Match`, `Path`, `Selector`, `Protected`, and `Tuple` –
to treat plain objects as if they were immutable, deeply typed data structures. You can:

- **Apply immutable updates** to nested structures using a flexible `Patch` notation.
- **Express rich match conditions** over objects and arrays using `Match`.
- **Access nested properties safely** using type‑checked string `Path`s.
- **Build typed projections** from objects using `Selector` shapes.
- **Protect values at compile time** from accidental mutation using `Protected`.
- **Work ergonomically with tuples** and fixed‑length arrays via `Tuple`.

Use it whenever you want the convenience of plain objects, but with **deep type safety**, **immutable semantics**, and
**refactor‑friendly string paths**.

---

## Table of Contents

1. [Why `@rimbu/deep`?](#why-rimbu-deep)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Deep API Helpers](#deep-api-helpers)
6. [Installation](#installation)
7. [Ecosystem & Further Reading](#ecosystem--further-reading)
8. [Contributing](#contributing)
9. [License](#license)

---

## Why `@rimbu/deep`?

Plain objects are great, but they quickly become painful when:

- You need to **update nested fields immutably** (e.g. in Redux‑style state).
- You want **type‑safe string paths** like `'a.b.c[0]?.d'` instead of ad‑hoc helpers.
- You’d like to **pattern‑match** complex structures without a forest of `if`/`switch` checks.
- You want to **project and reshape data** (e.g. API responses) into well‑typed views.

`@rimbu/deep` focuses on:

- **Type‑driven paths and selectors** – `Path` and `Selector` are derived from your data types.
- **Immutable patching** – `Patch` lets you describe updates declaratively and apply them in one go.
- **Expressive matching** – `Match` supports nested objects, arrays, tuples, and compound predicates.
- **Compile‑time protection** – `Protected<T>` makes entire object graphs appear readonly to TypeScript.

If you find yourself writing a lot of manual cloning, deep property access, or matcher utilities, `@rimbu/deep` is a
drop‑in improvement.

---

## Feature Highlights

- **Deep immutable patching** with `patch` and `patchAt`:
  describe updates using nested objects/arrays and functions instead of manual cloning.
- **Typed string paths** with `Path.Get` and `Path.Set`:
  only valid paths for your data type compile.
- **Structured matching** with `match`:
  supports nested objects, tuple/array traversal, and compound matchers (`every`, `some`, `none`, `single`).
- **Selection & projection** with `select` and `Selector`:
  derive new shapes from existing data using path strings, functions, or nested selector objects.
- **Compile‑time protection** with `Protected` and `protect`:
  make values deeply readonly at the type level while still using the underlying runtime value.
- **Tuple helpers** with `Tuple`:
  ergonomics around fixed‑length tuples (construction, indexing, updates, etc.).

---

## Quick Start

```ts
import { Deep } from '@rimbu/deep';

const input = { a: 1, b: { c: true, d: 'a' } } as const;

// Immutable deep patch
const updated = Deep.patch(input, [{ b: [{ c: (v) => !v }] }]);
// => { a: 1, b: { c: false, d: 'a' } }

// Type-safe nested get
const cValue = Deep.getAt(input, 'b.c'); // boolean

// Pattern matching
if (Deep.match(input, { b: { c: true } })) {
  // ...
}

// Selection / projection
const projected = Deep.select(input, { flag: 'b.c', label: 'b.d' });
// projected: { flag: boolean; label: string }
```

Try Rimbu (including `@rimbu/deep`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Core Concepts & Types

### Exported Types & Namespaces

From `@rimbu/deep`’s main entrypoint you have access to:

| Name                            | Description                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Patch<T, C = T>`               | Type describing allowed patch shapes for a value of type `T`.                                          |
| `Match<T, C = Partial<T>>`      | Type describing allowed matchers for values of type `T`.                                               |
| `Path`                          | Namespace containing `Path.Get<T>`, `Path.Set<T>`, and `Path.Result<T, P>` utilities for string paths. |
| `Selector<T>`                   | Type describing allowed selector shapes for values of type `T`.                                        |
| `Protected<T>`                  | Deeply readonly/“protected” view of `T` for compile‑time mutation safety.                              |
| `Tuple<T extends Tuple.Source>` | Tuple wrapper with helper types and functions under the `Tuple` namespace.                             |
| `Deep`                          | Convenience namespace exposing the main deep utilities (`patch`, `match`, `getAt`, `select`, etc.).    |

See the [Deep overview docs](https://rimbu.org/docs/deep/overview) and
[API reference](https://rimbu.org/api/rimbu/deep) for the full surface.

### Patching with `patch` and `Patch`

```ts
import { Deep, type Patch } from '@rimbu/deep';

type State = {
  count: number;
  user?: { name: string; active: boolean };
};

const state: State = { count: 1, user: { name: 'Ada', active: true } };

const patchItem: Patch<State> = [
  { count: (v) => v + 1 },
  { user: [{ active: false }] },
];

const next = Deep.patch(state, patchItem);
// => { count: 2, user: { name: 'Ada', active: false } }
```

Patches can be:

- Direct replacement values (`T`).
- Functions `(current, parent, root) => newValue`.
- Nested objects / arrays describing which fields or tuple indices to update.

### Matching with `match` and `Match`

```ts
import { Deep, type Match } from '@rimbu/deep';

type Item = { id: number; tags: string[] };

const items: Item[] = [
  { id: 1, tags: ['a', 'b'] },
  { id: 2, tags: ['b'] },
];

const matcher: Match<Item> = {
  tags: { someItem: (tag) => tag === 'a' },
};

const result = items.filter((item) => Deep.match(item, matcher));
// => only items containing tag 'a'
```

`Match` supports:

- Plain object matchers (`{ a: 1, b: { c: true } }`).
- Function matchers `(value, parent, root) => boolean | matcher`.
- Array/tuple matchers and traversal helpers such as `someItem`, `everyItem`, `noneItem`, `singleItem`.
- Compound matchers like `['every', matcher1, matcher2]`.

### Paths with `Path.Get`, `Path.Set` and `getAt` / `patchAt`

```ts
import { Deep, type Path } from '@rimbu/deep';

type Model = { a: { b: { c: number }[] } };
const value: Model = { a: { b: { c: [5, 6] } } as any };

// Typed paths
const path: Path.Get<Model> = 'a.b.c[1]?.d'; // compile-time checked

// Reading
const result = Deep.getAt(value, 'a.b.c[0]'); // number | undefined

// Patching at a path
const updated = Deep.patchAt(value, 'a.b.c', (arr) => [...arr, 7]);
```

`Path.Result<T, P>` gives you the resulting type at a given path `P` in `T`.

### Selection with `Selector` and `select`

```ts
import { Deep, type Selector } from '@rimbu/deep';

type Source = {
  a: { b: number; c: string };
  meta: { createdAt: string };
};

const source: Source = {
  a: { b: 1, c: 'x' },
  meta: { createdAt: '2024-01-01' },
};

const selector: Selector<Source> = {
  value: 'a.b',
  label: 'a.c',
  created: 'meta.createdAt',
};

const view = Deep.select(source, selector);
// view: { value: number; label: string; created: string }
```

Selectors can be:

- String paths.
- Functions `(value: Protected<T>) => any`.
- Arrays or objects composed of other selectors.

### Protection with `Protected` and `protect`

```ts
import { Deep, type Protected } from '@rimbu/deep';

type Data = { a: { b: number[] } };

const data: Data = { a: { b: [1, 2] } };
const protectedData: Protected<Data> = Deep.protect(data);

// protectedData.a.b.push(3); // TypeScript error – `b` is readonly
```

`Protected<T>` is a **type‑level** construct: it does not freeze the value at runtime, but helps prevent
accidental mutations in your code.

---

## Deep API Helpers

All top‑level utilities are also available through the `Deep` namespace:

```ts
import { Deep } from '@rimbu/deep';

// Functional helpers
const incCount = Deep.patchWith<{ count: number }>([{ count: (v) => v + 1 }]);
const onlyActive = Deep.matchWith({ active: true });
const getName = Deep.getAtWith<{ user: { name: string } }>('user.name');

// Typed, curried API with withType
const s = { a: 1, b: { c: 'a', d: true } };
const api = Deep.withType<typeof s>();

const next = api.patchWith([{ b: [{ d: (v) => !v }] }])(s);
// => { a: 1, b: { c: 'a', d: false } }
```

The `Deep` namespace mirrors the main exports:

- `Deep.patch`, `Deep.patchAt`, `Deep.patchWith`, `Deep.patchAtWith`
- `Deep.match`, `Deep.matchAt`, `Deep.matchWith`, `Deep.matchAtWith`
- `Deep.getAt`, `Deep.getAtWith`
- `Deep.select`, `Deep.selectAt`, `Deep.selectWith`, `Deep.selectAtWith`
- `Deep.withType<T>()` for creating a typed, curried API.

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/deep
# or
yarn add @rimbu/deep
# or
bun add @rimbu/deep
# or
deno add npm:@rimbu/deep
```

Then:

```ts
import { Deep } from '@rimbu/deep/mod.ts';
```

### Browser / ESM

`@rimbu/deep` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## Ecosystem & Further Reading

- Part of the broader **Rimbu** ecosystem – interoperates with `@rimbu/core`, `@rimbu/collection-types`,
  and other collection packages.
- Ideal for modelling immutable application state, selectors, and matchers in complex domains.
- Learn more in the [Deep overview docs](https://rimbu.org/docs/deep/overview) and the
  [Deep API reference](https://rimbu.org/api/rimbu/deep).

---

## Contributing

We welcome contributions! See the
[Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md) for details.

<img src="https://contrib.rocks/image?repo=rimbu-org/rimbu" alt="Contributors" />

_Made with [contributors-img](https://contrib.rocks)._

---

## License

MIT © Rimbu contributors. See [LICENSE](./LICENSE) for details.
