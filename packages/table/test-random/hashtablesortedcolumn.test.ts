import { runTableRandomTestsWith } from './table-test-random';
import { HashTableSortedColumn } from '../src';

runTableRandomTestsWith(
  'HashTableSortedColumn default',
  HashTableSortedColumn.defaultContext<number, number>()
);
