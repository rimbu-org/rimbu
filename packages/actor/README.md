<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/actor

This package offers state management tools to create stateful logic that can be easily integrated in any framework.

This package is still experimental, and therefore does not yet have complete documentation.

For complete documentation please visit the _[Rimbu Docs](https://rimbu.org)_ or the _[Rimbu API Docs](https://rimbu.org/api)_.

## Installation

### Yarn/NPM

> `yarn add @rimbu/actor`

or

> `npm i @rimbu/actor`

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

Because Rimbu uses advanced types, this may slow down the type checking part when running your code. If you're able to rely on your code editor to provide type errors, you can skip the Deno type check using the `--no-check` flag:

`deno run --import-map import_map.json --no-check src/main.ts`

## Usage

```ts
import { Actor, Obs } from '@rimbu/actor';

const obs = Obs.create({ count: 0, changes: 0 });

const actor = Actor.create(obs, {
  increase() {
    obs.patchState({ count: (v) => v + 1, changes: (v) => v + 1 }),
  }
  decrease() {
    obs.patchState({ count: (v) => v - 1, changes: (v) => v + 1 }),
  }
});

console.log(actor.state);
// => { count: 0, changes: 0 }
actor.increase()
actor.increase()
actor.decrease()
console.log(actor.state)
// => { count: 1, changes: 3 }
```

## Author

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](../../CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
