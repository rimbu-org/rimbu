import { runTableRandomTestsWith } from './table-test-random';
import { HashTableHashColumn } from '../src';

runTableRandomTestsWith(
  'HashTableHashColumn default',
  HashTableHashColumn.defaultContext<number, number>()
);
