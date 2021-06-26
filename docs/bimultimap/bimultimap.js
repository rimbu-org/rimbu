setUmlGraph(
  '_inheritance',
  `
interface Streamable<[K, V]>;
abstract BiMultiMap<K, V>;
class HashBiMultiMap<K, V>;
class SortedBiMultiMap<K, V>;

Streamable <|.. BiMultiMap;
BiMultiMap <|-- HashBiMultiMap;
BiMultiMap <|-- SortedBiMultiMap;
`
);
