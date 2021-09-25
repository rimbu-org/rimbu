export const inheritance = `
interface Streamable<[K, V]>;

interface VariantMultiMap<K, V>;
abstract MultiMap<K, V>;
class HashMultiMapHashValue<k, V>;
class HashMultiMapSortedValue<k, V>;
class SortedMultiMapHashValue<k, V>;
class SortedMultiMapSortedValue<k, V>;

Streamable <|.. VariantMultiMap;
VariantMultiMap <|-- MultiMap;
MultiMap <|-- HashMultiMapHashValue;
MultiMap <|-- HashMultiMapSortedValue;
MultiMap <|-- SortedMultiMapHashValue;
MultiMap <|-- SortedMultiMapSortedValue;
`;
