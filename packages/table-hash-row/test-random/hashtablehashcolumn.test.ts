import { runTableRandomTestsWith } from '@rimbu/table/test-random/table-test-random';
import { HashTableHashColumn } from '../src';

runTableRandomTestsWith(
  'HashTableHashColumn default',
  HashTableHashColumn.defaultContext<number, number>()
);
