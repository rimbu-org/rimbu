import { describe, expect, it } from 'bun:test';

import { List } from '@rimbu/list';

describe('List creators', () => {
	it('empty', () => {
		expect(List.empty<number>()).toBe<any>(List.empty<string>());
	});

	it('of', () => {
		expect(List.of(1, 2, 3).toArray()).toEqual([1, 2, 3]);
	});
});
