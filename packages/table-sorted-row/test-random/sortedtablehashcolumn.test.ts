import { runTableRandomTestsWith } from '@rimbu/table/test-random/table-test-random';
import { SortedTableHashColumn } from '../src';

runTableRandomTestsWith(
  'SortedTableHashColumn default',
  SortedTableHashColumn.defaultContext<number, number>()
);
