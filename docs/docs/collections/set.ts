export const inheritance = `
interface Streamable<T>;

interface VariantSet<T>;
abstract RSet<T>;
class HashSet<T>;
class SortedSet<T>;

Streamable <|.. VariantSet;
VariantSet <|-- RSet;
RSet <|-- HashSet;
RSet <|-- SortedSet;
`;
