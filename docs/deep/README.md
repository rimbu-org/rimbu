# Immutable Object Manipulation

Next to collections, Rimbu also offers tools to handle plain JS/TypeScript objects as immutable objects. These tools do not actually add functionality or change those plain objects, but use the compiler's type checking to offer protection against modifying data in objects.

## Immutable

The `Immutable` function and type convert a plain JS object to an object that, according to its type, cannot be changed.

See [Immutable](deep/immutable.md) for more information.

## Patch

With immutable objects its often desirable to create copies where some properties are modified. The `patch` function offers a convenient way to do this.

See [Patch](deep/patch.md) for more information.

## Match

In a similar fashion to `patch`, the `Match` object offers methods to easily check if data in an object satisfies a number of characteristics.

See [Match](deep/match.md) for more information.

## Path

Sometimes it is convenient to use a string to identify a path within a nested object where a property can be found. The `Path` object offers methods to both patch and get a value from an object using a string path, and accurately type the result.

See [Path](deep/path.md) for more information.

## Tuple

Sometimes it is useful to create immutable tuples as data. However, with the TS compiler type inference it is sometimes challenging to get the types right. The `Tuple` constructor helps in this case.

See [Tuple](deep/tuple.md) for more information.
