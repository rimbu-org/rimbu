setUmlGraph(
  'inheritance',
  `
interface Streamable<[R, C, V]>;
interface VariantTable<R, C, V>;
abstract Table<R, C, V>;
class HashTableHashColumn<R, C, V>;
class HashTableSortedColumn<R, C, V>;
class SortedTableHashColumn<R, C, V>;
class SortedTableSortedColumn<R, C, V>;

Streamable <|.. VariantTable;
VariantTable <|-- Table;
Table <|-- HashTableHashColumn;
Table <|-- HashTableSortedColumn;
Table <|-- SortedTableHashColumn;
Table <|-- SortedTableSortedColumn;
`
);
