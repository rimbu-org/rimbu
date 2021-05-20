import { HashTableSortedColumn } from '../src';
import { runTableTestsWith } from './table-standard-test';

runTableTestsWith(
  'HashTableSortedColumn default',
  HashTableSortedColumn.defaultContext<number, number>()
);
