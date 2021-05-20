setUmlGraph(
  'inheritance',
  `
interface Streamable<T>;

interface VariantMultiSet<T>;
abstract MultiSet<T>;
class HashMultiSet<T>;
class SortedMultiSet<T>;

Streamable <|.. VariantMultiSet;
VariantMultiSet <|-- MultiSet;
MultiSet <|-- HashMultiSet;
MultiSet <|-- SortedMultiSet;
`
);
