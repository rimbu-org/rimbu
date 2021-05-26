import { runTableRandomTestsWith } from './table-test-random';
import { SortedTableHashColumn } from '../src';

runTableRandomTestsWith(
  'SortedTableHashColumn default',
  SortedTableHashColumn.defaultContext<number, number>()
);
