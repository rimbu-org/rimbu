# Immutable collections

Here is a brief overview of the basic Rimbu collection types. Many of these types have multiple concrete implementations, see the corresponding links for more information:

## Single-typed base collections

| Name                       | Description                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`Graph<N>`](graph/)       | a collection of nodes of type N that can be connected through edges                                                             |
| [`List<T>`](list/)         | an immutable ordered sequence of elements of type T that can be manipulated and accessed randomly in a relatively efficient way |
| [`MultiSet<T>`](multiset/) | a Set-like structure where each unique element of type T can be added multiple times, and its count is stored                   |
| [`RSet<T>`](set/)          | a Set collection with values of type T, where the collection does not contain duplicate values                                  |
| [`Stream<T>`](stream/)     | an Iterable-like structure that represents a source that can produce values of type T when requested                            |

## Two-typed base collections

| Name                              | Description                                                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`BiMap<K, V>`](bimap/)           | a bidirectional Map of keys of type K and values of type V, where each key has exactly one value, and each value has exactly one key        |
| [`BiMultiMap<K, V>`](bimultimap/) | a bidirectional MultiMap of keys of type K and values of type V, where each key-value association also has an inverse value-key association |
| [`ValuedGraph<N, V>`](graph/)     | a collection of nodes of type N that can be connected through edges with values of type V                                                   |
| [`RMap<K, V>`](map/)              | a Map collection with entries containing keys of type K and values of type V. Each key has exactly one value, and each key is unique        |
| [`MultiMap<K, V>`](multimap/)     | a Map-like structure in which each key of type K has one or more values of type V. For each key, it's associated values are unique          |

## Three-typed base collections

| Name                       | Description                                                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`Table<R, C, V>`](table/) | an immutable 2-dimensional Map, containing row keys of type R and column keys of type C, where a combination of a row and column key can contain one value of type V |
