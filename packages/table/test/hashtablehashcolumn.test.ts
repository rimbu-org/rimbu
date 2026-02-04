import { HashTableHashColumn } from '@rimbu/table/hash-row/hash-column';
import { runTableTestsWith } from '../test-utils/table-standard-test';

runTableTestsWith(
	'HashTableHashColumn default',
	HashTableHashColumn.defaultContext(),
);
