import { runTableTestsWith } from '@rimbu/table/test-utils/table-standard-test';
import { HashTableHashColumn } from '@rimbu/table';

runTableTestsWith(
  'HashTableHashColumn default',
  HashTableHashColumn.defaultContext()
);
