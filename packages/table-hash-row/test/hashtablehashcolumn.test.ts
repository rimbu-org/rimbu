import { runTableTestsWith } from '@rimbu/table/test-utils/table-standard-test';
import { HashTableHashColumn } from '../src';

runTableTestsWith(
  'HashTableHashColumn default',
  HashTableHashColumn.defaultContext()
);
