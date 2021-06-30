# Actor State Management

The `@rimbu/actor` package offers state management tools for immutable data.

Imagine you've set up your complete program using immutable collections and data structures. Cool! But, your program has a UI, fetches external async data, how do we change something with only immutable objects?

One way is to go the pure funcional way of using monads and applicatives and what not. The other way is to offer an escape hatch from the immutabible world: a protected mutable value.

This package provides a number of tools to offer such an escape hatch. Basically, it keeps a single protected mutable reference to an internal immutable state, and offers an API to read and update that value. Furthermore, it implements the Observable pattern so that other programs can listen and react to state changes.

## Installation

> `yarn add @rimbu/actor`

or

> `npm install @rimbu/actor`

### recommended tsconfig.json settings

Rimbu uses advanced and recursive typing, potentially making the TS compiler quite slow. It is recommended to set the following values in the `tsconfig.json` file of your project:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noStrictGenericChecks": true
  }
}
```

TODO
