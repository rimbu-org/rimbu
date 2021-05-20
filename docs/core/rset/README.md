# RSet

An `RSet<T>` is an immutable Set for values of type T, where each value is unique. It is an abstract type that is implemented in the following packages:

- [`@rimbu/hashed`](../hashed/README.md)
- [`@rimbu/sorted`](../sorted/README.md)
- [`@rimbu/ordered`](../ordered/README.md)

The package also exports the `VariantSet<T>` that can be used when type variance is needed. Variant collections have a limited API, it is not possible to add new values to it, since this would violate type safety.

<img id="inheritance" />

<script src="core/rset/rset.js"></script>
