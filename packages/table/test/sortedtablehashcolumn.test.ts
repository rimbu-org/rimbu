import { SortedTableHashColumn } from '../src';
import { runTableTestsWith } from './table-standard-test';

runTableTestsWith(
  'SortedTableHashColumn default',
  SortedTableHashColumn.defaultContext<number, number>()
);
