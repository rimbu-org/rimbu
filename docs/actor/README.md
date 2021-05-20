# Actor State Management

This package offers state management tools for immutable data.
Imagine you've set up your complete program using immutable collections and data structures. Cool! But, your program has a UI, fetches external async data, how do we change something with only immutable objects?

One way is to go the pure funcional way of using monads and applicatives and what not. The other way is to offer an escape hatch from the immutabible world: a protected mutable value.

This package provides a number of tools to offer such an escape hatch. Basically, it keeps a single protected mutable reference to an internal immutable state, and offers an API to read and update that value. Furthermore, it implements the Observable pattern so that other programs can listen and react to state changes.

## Installation

`yarn add @rimbu/actor`

or

`npm install @rimbu/actor`

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

## API overview

### SyncState

A `SyncState` is a container that contains a value, or a reference to an object, that can be observed and updated. Updates are guaranteed to be synchronous, such that reading the state after setting is will return the set state.

```ts
const counter = SyncState.create({ count: 0 });
console.log(counter.state);
// { count: 0 }

counter.setState({ count: 1 });
console.log(counter.state);
// { count: 1 }
```

The state is also observable:

```ts
const counter = SyncState.create({ count: 0 });
const unsubscribe = counter.subscribe(() => console.log(counter.state));

counter.setState({ count: 1 });
// logs: { count: 1 }

counter.setState(counter.state);
// nothing happens because the state didn't change

// cancel subscription
unsubscribe();

counter.setState({ count: 2 });
// nothing happens because the subscription was cancelled
```

Observers are also called synchronously. If the observer function is synchronous, it can always read the value that led to the notification. Synchronous subscribers should therefore not perform any blocking operations.

### Actor

The most powerful and convenient tool is the `Actor` type. Here is a quick demonstration:

```ts
const counterActor = Actor.create(
  { count: 0 },
  { derive: (state) => ({ isEven: state.count % 2 === 0 }) },
  (actor) => ({
    increase: () => actor.patch({ count: (v) => v + 1 }),
    reset: () => actor.patch({ count: 0 }),
  })
);

console.log(counterActor.state);
// { count: 0, isEven: true }

counterActor.increase();
console.log(counterActor.state);
// { count: 1, isEven: false }

counterActor.reset();
console.log(counterActor.state);
// { count: 0, isEven: true }

counterActor.patch({ count: 101 });
// { count: 101, isEven: false }
```

Here we see an actor that has a `count` value as its state, and also a derived property that indicates whether the count is even. Furthermore, it defines a number of actions that can modify that state, but state can also be patched directly.
