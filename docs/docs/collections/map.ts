export const inheritance = `
interface Streamable<[K, V]>;

interface VariantMap<K, V>;
abstract RMap<K, V>;
class HashMap<K, V>;
class SortedMap<K, V>;

Streamable <|.. VariantMap;
VariantMap <|-- RMap;
RMap <|-- HashMap;
RMap <|-- SortedMap;
`;
