import { runTableRandomTestsWith } from '@rimbu/table/test-random/table-test-random';
import { SortedTableHashColumn } from '@rimbu/table';

runTableRandomTestsWith(
  'SortedTableHashColumn default',
  SortedTableHashColumn.defaultContext<number, number>()
);
