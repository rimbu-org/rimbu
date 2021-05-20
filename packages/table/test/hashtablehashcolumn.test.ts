import { HashTableHashColumn } from '../src';
import { runTableTestsWith } from './table-standard-test';

runTableTestsWith(
  'HashTableHashColumn default',
  HashTableHashColumn.defaultContext<number, number>()
);
