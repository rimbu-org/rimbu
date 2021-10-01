export const inheritance = `
interface Streamable<GraphElement<N, V>>;

abstract VariantGraph<N>;
abstract Graph<N>;
abstract ArrowGraph<N>;
abstract EdgeGraph<N>;

abstract VariantValuedGraph<N, V>;
abstract ValuedGraph<N, V>;
abstract ArrowValuedGraph<N, V>;
abstract EdgeValuedGraph<N, V>;

Streamable <|.. VariantGraph;

VariantGraph <|-- Graph;
Graph <|-- ArrowGraph;
Graph <|-- EdgeGraph;

VariantGraph <|-- VariantValuedGraph;
VariantValuedGraph <|-- ValuedGraph;
ValuedGraph <|-- ArrowValuedGraph;
ValuedGraph <|-- EdgeValuedGraph;
`;

export const inheritanceNonValued = `
interface Streamable<GraphElement<N>>;

abstract VariantGraph<N>;
abstract Graph<N>;
abstract ArrowGraph<N>;
class ArrowGraphHashed<N>;
class ArrowGraphSorted<N>;
abstract EdgeGraph<N>;
class EdgeGraphHashed<N>;
class EdgeGraphSorted<N>;

Streamable <|.. VariantGraph;

VariantGraph <|-- Graph;
Graph <|-- ArrowGraph;
ArrowGraph <|-- ArrowGraphHashed;
ArrowGraph <|-- ArrowGraphSorted;
Graph <|-- EdgeGraph;
EdgeGraph <|-- EdgeGraphHashed;
EdgeGraph <|-- EdgeGraphSorted;
`;

export const inheritanceValued = `
interface Streamable<GraphElement<N, V>>;

abstract VariantGraph<N>;

abstract VariantValuedGraph<N, V>;
abstract ValuedGraph<N, V>;
abstract ArrowValuedGraph<N, V>;
class ArrowValuedGraphHashed<N, V>;
class ArrowValuedGraphSorted<N, V>;
abstract EdgeValuedGraph<N, V>;
class EdgeValuedGraphHashed<N, V>;
class EdgeValuedGraphSorted<N, V>;

Streamable <|.. VariantGraph;

VariantGraph <|-- VariantValuedGraph;
VariantValuedGraph <|-- ValuedGraph;
ValuedGraph <|-- ArrowValuedGraph;
ArrowValuedGraph <|-- ArrowValuedGraphHashed;
ArrowValuedGraph <|-- ArrowValuedGraphSorted;
ValuedGraph <|-- EdgeValuedGraph;
EdgeValuedGraph <|-- EdgeValuedGraphHashed;
EdgeValuedGraph <|-- EdgeValuedGraphSorted;
`;
