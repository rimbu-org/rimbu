import { expect, test } from 'bun:test';

import { List } from '@rimbu/list';

test('repeat produces the requested number of copies', () => {
	const source = List.of(1, 2);

	for (let amount = 0; amount <= 9; amount++) {
		const expected: number[] = [];
		for (let i = 0; i < amount; i++) expected.push(1, 2);

		expect({ amount, values: source.repeat(amount).toArray() }).toEqual({
			amount,
			values: expected,
		});
	}
});

test('repeat of a single element list', () => {
	expect(List.of('a').repeat(5).toArray()).toEqual(['a', 'a', 'a', 'a', 'a']);
});
