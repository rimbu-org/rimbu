# Immutable Object Manipulation

Offers tools to use handle plain JS objects as immutable objects.

## Installation

`yarn add @rimbu/deep`

or

`npm i @rimbu/deep`

### recommended tsconfig.json settings

Rimbu uses advanced and recursive typing, potentially making the TS compiler quite slow. It is recommended to set the following values in the `tsconfig.json` file of your project:

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

## Usage

Here is example of creating and modifying an immutable object:

```ts
import { Immutable, patch } from '@rimbu/deep';

const obj = Immutable({ value: 5, stats: { sum: 1 } });

obj.value = 10;
// => compiler error: value is readonly

const obj2 = patch(obj)({ value: 10 });
console.log(obj2);
// => { value: 10, stats: { sum: 1 } }

const obj3 = patch(obj)({ stats: { sum: 12 } });
console.log(obj3);
// => { value: 5, { sum: 12 } }

const obj4 = patch(obj)({
  value: (v) => v + 1,
  stats: { sum: (v, p) => v + p.value },
});
console.log(obj4);
// => { value: 6, { sum: 6 } }
```

We will explain the various parts in the following sections.

## Motivation

Immutability works best if used all the way from collections into the objects that they contain. The `@rimbu/deep` package focuses on creating, modifying, and querying 'standard' objects in an immutable way. The approach is strictly type-based, meaning there is no actual modification to standard objects in JS, but the TS compiler is used in such a way that it will give errors when directly modifying properties.

## API overview

### Creation

There are 2 ways to convert objects to immutable types. The `Immutable` function takes any object and returns it as an `Immutable` type. The second way is to cast a type to the `Immutable<T>` type:

```ts
import { Immutable } from '@rimbu/deep';

const obj = { a: 1, b: { c: 's' } };

const imm1 = Immutable(obj);
imm1.a = 2;
// compiler error

const imm2 = obj as Immutable<typeof obj>;
imm2.a = 2;
// comiler error

// No protection for original object!
// So be careful not to expose it
obj.a = 2;
// no compiler error
```

### Patch

Using `patch` it is possible to easily create modified copies of a plain JS object. The main way `patch` works is to specify the paths in the nested object to modify, and then to either specify a new value or a function to create a new value.

```ts
import { Immutable, patch } from '@rimbu/deep';

const obj = Immutable({
  value1: 1,
  nest1: {
    value2: 2,
    nest2: {
      value3: 3,
    },
  },
});

// directly update nested values:
const obj2 = patch(obj)({
  value1: 3,
  nest1: {
    nest2: {
      value3: 5,
    },
  },
});

// simple update functions:
const obj3 = patch(obj)({
  value1: (v) => v + 1,
  nest1: {
    nest2: {
      value3: (v) => v * 2,
    },
  },
});

// update functions in nested values receive, next to the current value, their enclosing object, and the root object as paremeters for convenience:
const obj4 = patch(obj)({
  nest1: {
    nest2: {
      value3: (v, parent, root) => v + parent.value2 + root.value1,
    },
  },
});

// multiple updates can be chained, in the following example, first the value is increased and then doubled:
const obj5 = patch(obj)(
  {
    value1: (v) => v + 1,
  },
  {
    value1: (v) => v * 2,
  }
);
```

Don't count on `patch` to copy the object, it will only copy parts of the object if values actually change:

```ts
import { Immutable, patch } from '@rimbu/deep';

const obj1 = Immutable({ a: 1 });

const obj2 = patch(obj1)({ a: 1 });
console.log(obj1 === obj2);
// => true

const obj3 = patch(obj1)({ a: 2 });
console.log(obj1 === obj3);
// => false
```

### Match

Just as `patch` is used to modify objects, `matchAll` and `matchAny` can be used to match nested objects in an easy way.

```ts
import { Immutable, matchAll } from '@rimbu/deep';

const person = Immutable({
  name: 'John',
  age: 25,
  address: {
    city: 'Amsterdam',
  },
});

console.log(
  matchAll(person)({
    address: {
      city: 'Amsterdam',
    },
  })
);
// => true

console.log(
  matchAll(person)({
    age: (v) => v > 20,
    address: {
      city: 'Amsterdam',
    },
  })
);
// => true
```

Similar to `patch`, matchers can also receive parent and root objects when using a match function.

```ts
import { Immutable, matchAll } from '@rimbu/deep';

const obj = Immutable({
  value1: 1,
  nest1: {
    value2: 2,
    nest2: {
      value3: 3,
    },
  },
});

// access enclosing objects from update function
matchAll(obj)({
  nest1: {
    nest2: {
      value3: (v, parent, root) => v > parent.value2 + root.value1,
    },
  },
});
```

And `matchAny` and `matchAll` can also take multiple matchers, where `matchAny` will return true if any of the given matchers returns true, and `matchAll` will return true if all given matchers are true:

```ts
const person = Immutable({
  name: 'John',
  age: 25,
  address: {
    city: 'Amsterdam',
  },
});

console.log(matchAny({ age: 25 }, { address: { city: 'Paris' } }));
// => true

console.log(matchAll({ age: 25 }, { address: { city: 'Paris' } }));
// => false
```

### Path

With immutable objects it's often required to retrieve or update a certain nested property. To avoid having to explicitly specify the location of such a property, the `path` function can be used.

```ts
const person = Immutable({
  name: 'John',
  age: 25,
  address: {
    city: 'Amsterdam',
  },
});

console.log(path(person).get({ address: { city: true } }));
// => 'Amsterdam'

console.log(path(person).patch({ address: { city: true } })('Paris'));
// => { name: 'John', age: 25, address: { city: 'Paris' } }
```

In this way it becomes easy to change nested properties in an immutable object.

## Tuple

Sometimes it is useful to create immutable tuples as data. However, with the TS compiler type inference it is sometimes challenging to get the types right. The `Tuple` constructor helps in this case:

```ts
const obj1 = Immutable({ values: ['John', 25] });
// inferred type (too loose):
// { readonly values: readonly (string | number)[] }

const obj2 = Immutable({ values: ['John', 25] as const });
// inferred type (too strict):
// { readonly values: readonly ['John', 25] }
// we cannot change values

const obj3 = Immutable({ values: Tuple('John', 25) });
// inferred type (correct):
// { readonly values: readonly [number, string] }

// tuples, like arrays, can be adressed by index:
patch(obj3)({ values: { 1: 'b' } });
// => { values: [1, 'b'] }
```
