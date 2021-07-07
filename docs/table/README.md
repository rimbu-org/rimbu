# Table

A `Table` is an immutable 2-dimensional Map, containing row keys and column keys, where a combination of a row and column key can contain one value.

The Table structure is useful in cases where there are two properties that in combination have some value. For example, a school with students needs to store a grade for each class the student takes. The school is only interested in the last grade. In this case, a Table with the student as row key, the class as column key, and the grade as value would allow easy access to all the grades.

## Exports

The `@rimbu/core` package exports the following _abstract_ Table types:

| Name                    | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `VariantTable<R, C, V>` | a type-variant `Table` with row keys R, column keys C, and values V |
| `Table<R, C, V>`        | a generic `Table` with row keys R, column keys C, and values V      |

The `@rimbu/core` package exports the following _concrete_ Table types:

| Name                               | Description                                                            |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `HashTableHashColumn<R, C, V>`     | a `Table` where the row keys and column keys are hashed                |
| `HashTableSortedColumn<R, C, V>`   | a `Table` where the row keys are hashed and the column keys are sorted |
| `SortedTableHashColumn<R, C, V>`   | a `Table` where the row keys are sorted and the column keys are hashed |
| `SortedTableSortedColumn<R, C, V>` | a `Table` where the row keys and column keys are sorted                |

## Inheritance

<img id="_inheritance"  class="diagram"/>

<script src="table/table.js"></script>

## Usage

### Creation

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/table/create.ts ':target=_blank :class=btn')

[Create](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/table/create.ts ':include :type=iframe width=100% height=450px')

### Query

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/table/query.ts ':target=_blank :class=btn')

[Query](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/table/query.ts ':include :type=iframe width=100% height=450px')

### Builder

[Open with type interence](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/table/build.ts ':target=_blank :class=btn')

[Build](https://codesandbox.io/embed/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&codemirror=1&moduleview=1&module=/src/table/build.ts ':include :type=iframe width=100% height=450px')
