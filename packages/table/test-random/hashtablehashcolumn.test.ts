import { HashTableHashColumn } from '@rimbu/table/hash-row/hash-column';
import { runTableRandomTestsWith } from './table-test-random';

runTableRandomTestsWith(
	'HashTableHashColumn default',
	HashTableHashColumn.defaultContext(),
);
