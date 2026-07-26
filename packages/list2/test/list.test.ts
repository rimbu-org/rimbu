import { describe, expect, it } from 'bun:test';

import { List } from '@rimbu/list';

describe('List creators', () => {
	it('empty', () => {
		expect(List.empty<number>()).toBe<any>(List.empty<string>());
	});

	it('of', () => {
		expect(List.of(1, 2, 3).toArray()).toEqual([1, 2, 3]);
	});

	it('builder', () => {
		const builder = List.builder<number>();
		builder.append(1);
		builder.append(2);
		builder.append(3);
		expect(builder.build().toArray()).toEqual([1, 2, 3]);
	});
});
