# Introduction

Rimbu is a TypeScript library focused on _immutable, performant, and type-safe collections_ and other tools. Its main aim is to allow programmers to create safe and performant programs without getting in the way. It is inspired by various other collection libraries, mainly Java's Guava library, the Java 8 Collection library, and Scala's collection library plus various ideas from the Scala community.

## Library contents

Rimbu's main package is the `@rimbu/core` package that contains many commonly used collection types (`List`, `HashMap`, `SortedSet`, etc.), and some less commonly used types (`BiMultiMap`, `MultiSet`, `Table`, `Graph`, etc.). Furthermore, it has tools like `Match`, `Patch`, and `Path` to handle common JS objects as immutable objects.

All collections are designed to efficiently support data sets from small to really large (as long as it fits in memory). Persistence is maximally used to ensure that memory load is kept to a mimimum. This means that, when changing a collection instance, maximum effort is made to keep references to elements that did not change equal.

Next to the core package, the `@rimbu/actor` package contains a library to easily create and update immutable state. For convenience there is also a library to allow for easy integration with state management in React `@rimbu/reactor`.

## Quick overview of features and benefits

- Extensive set of collection types to cover many problems that would otherwise require more coding to solve.
- Advanced typing uses the TS compiler to offer strict type inference without much explicit typing, and to prove collection non-emptiness.
- Avoid 'monad' style programming / chaining (e.g. using types like Option) by offering flexible fallback options for simple methods that can 'fail'.
- No external dependencies.
- Provides sane defaults but allows extensive customization and configuration.
- A novel and efficient immutable random-access List implementation.

<!-- prettier-ignore-start -->
<!-- [Test](https://codesandbox.io/embed/typescript-lib-test-cf92r?previewwindow=console&view=split&editorsize=60&moduleview=1&module=/src/demo1.ts ':include :type=iframe width=100% height=400px') -->
<!-- [filename](core/bimap.md ':include') -->
<!-- prettier-ignore-end -->
