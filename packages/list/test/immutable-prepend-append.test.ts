import { describe, expect, it } from 'bun:test';

import { List } from '@rimbu/list';

describe('immutable prepend/append', () => {
	it('prepend to small list within block', () => {
		const list = List.of(2, 3, 4);
		const result = list.prepend(1);

		expect(result.size).toBe(4);
		expect(result.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('append to small list within block', () => {
		const list = List.of(1, 2, 3);
		const result = list.append(4);

		expect(result.size).toBe(4);
		expect(result.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('prepend does not mutate original', () => {
		const list = List.of(2, 3, 4);
		list.prepend(1);

		expect(list.toArray()).toEqual([2, 3, 4]);
	});

	it('append does not mutate original', () => {
		const list = List.of(1, 2, 3);
		list.append(4);

		expect(list.toArray()).toEqual([1, 2, 3]);
	});

	it('prepend to full block creates tree', () => {
		const ctx = List.createContext({ blockSizeBits: 2 }); // maxBlockSize = 4
		const list = ctx.of(2, 3, 4, 5);

		const result = list.prepend(1);

		expect(result.size).toBe(5);
		expect(result.toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it('append to full block creates tree', () => {
		const ctx = List.createContext({ blockSizeBits: 2 });
		const list = ctx.of(1, 2, 3, 4);

		const result = list.append(5);

		expect(result.size).toBe(5);
		expect(result.toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it('multiple prepends to tree', () => {
		const ctx = List.createContext({ blockSizeBits: 2 });
		let list = ctx.of(10);

		for (let i = 9; i >= 1; i--) {
			list = list.prepend(i);
		}

		expect(list.size).toBe(10);
		expect(list.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	});

	it('multiple appends to tree', () => {
		const ctx = List.createContext({ blockSizeBits: 2 });
		let list = ctx.of(1);

		for (let i = 2; i <= 10; i++) {
			list = list.append(i);
		}

		expect(list.size).toBe(10);
		expect(list.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
	});

	it('mixed prepend and append', () => {
		const ctx = List.createContext({ blockSizeBits: 2 });
		let list = ctx.of(5);

		list = list.prepend(3);
		list = list.prepend(1);
		list = list.append(7);
		list = list.append(9);
		list = list.prepend(0);
		list = list.append(10);
		list = list.prepend(2); // putting 2 between 1 and 3
		// Actually no, prepend always goes to front

		expect(list.toArray()).toEqual([2, 0, 1, 3, 5, 7, 9, 10]);
	});

	it('forEach on prepended tree', () => {
		const ctx = List.createContext({ blockSizeBits: 2 });
		let list = ctx.of(5);

		for (let i = 4; i >= 1; i--) {
			list = list.prepend(i);
		}

		const result: number[] = [];
		list.forEach((v) => result.push(v));

		expect(result).toEqual([1, 2, 3, 4, 5]);
	});

	it('at on appended tree', () => {
		const ctx = List.createContext({ blockSizeBits: 2 });
		let list = ctx.of(0);

		for (let i = 1; i < 10; i++) {
			list = list.append(i);
		}

		expect(list.at(0)).toBe(0);
		expect(list.at(5)).toBe(5);
		expect(list.at(9)).toBe(9);
		expect(list.at(-1)).toBe(9);
		expect(list.at(-3)).toBe(7);
	});
});
