import { runTableRandomTestsWith } from '@rimbu/table/test-random/table-test-random';
import { HashTableHashColumn } from '@rimbu/table';

runTableRandomTestsWith(
  'HashTableHashColumn default',
  HashTableHashColumn.defaultContext()
);
