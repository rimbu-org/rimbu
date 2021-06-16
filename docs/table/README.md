# Table

A Table is an immutable 2-dimensional map, containing row keys and column keys, and a combination of a row and column key can contain one value.

## Types

This package exports the following types:

| Name                               | Description                                                              |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `VariantTable<R, C, V>`            | a generic variant `Table` with row keys R, column keys C, and values V   |
| `Table<R, C, V>`                   | a generic invariant `Table` with row keys R, column keys C, and values V |
| `HashTableHashColumn<R, C, V>`     | a `Table` where the row keys and column keys are hashed                  |
| `HashTableSortedColumn<R, C, V>`   | a `Table` where the row keys are hashed and the column keys are sorted   |
| `SortedTableSortedColumn<R, C, V>` | a `Table` where the row keys and column keys are sorted                  |
| `HashTableSortedColumn<R, C, V>`   | a `Table` where the row keys are sorted and the column keys are hashed   |

<img id="inheritance" />

<script src="table/table.js"></script>

## Usage

```ts
import { HashTableHashColumn } from '@rimbu/core';

const table = HashTableHashColumn.of([1, 'a', true], [2, 'a', false]);
console.log('E.1', table.toString());
console.log('E.2', table.get(1, 'a'));
console.log('E.2', table.get(2, 'b'));
console.log('E.2', table.get(2, 'b'), 'nothing');
```

## Motivation

Tables are useful data structures for data that is 2-dimensional. Spreadsheets have become hugely popular because that's basically what they offer: rows, columns, and cells. In programming, most frameworks do not cover this use case, and leave it up to the programmer to figure out ways to simulate such a structure.

Imagine we have a collection of cats, and a collection of courses, as follows:

```ts
type Cat = Readonly<{ name: string }>;

const alice = { name: 'Alice' };
const bob = { name: 'Bob' };
const carol = { name: 'Carol' };

type Course = Readonly<{ title: string }>;
const machineLearning = { title: 'Machine learning' };
const calculus = { title: 'Calculus' };
```

Now, each cat can take the offered courses and obtain some score. If the cat retakes the same course, the previous score is thrown away.

```ts
import { HashTableHashColumn } from '@rimbu/core';

const catCourseScores = HashTableHashColumn.of(
  [alice, machineLearning, 7.3],
  [bob, calculus, 4.2],
  [bob, machineLearning, 8.2]
);

console.log('E.1', catCourseScores.getValue(alice, machineLearning));
console.log('E.2', catCourseScores.getValue(carol, machineLearning));
console.log('E.3', catCourseScores.getValue(carol, machineLearning, 0.0));
console.log('E.4', catCourseScores.getRow(bob).toArray());
```

We see that each combination of a cat and course has at one or no value. This makes it easy to keep the score each cat received for each course.
