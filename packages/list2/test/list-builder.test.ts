import { describe, expect, it } from 'bun:test';

import { List } from '@rimbu/list';

describe('List.builder().append', () => {
	it('append to empty builder increases size', () => {
		const builder = List.builder<number>();

		builder.append(1);

		expect(builder.size).toBe(1);
	});

	it('append multiple elements increases size correctly', () => {
		const builder = List.builder<number>();

		builder.append(1);
		builder.append(2);
		builder.append(3);

		expect(builder.size).toBe(3);
	});

	it('forEach iterates in insertion order', () => {
		const builder = List.builder<number>();

		builder.append(10);
		builder.append(20);
		builder.append(30);

		const result: number[] = [];
		builder.forEach((v) => result.push(v));

		expect(result).toEqual([10, 20, 30]);
	});

	it('at returns correct values', () => {
		const builder = List.builder<string>();

		builder.append('a');
		builder.append('b');
		builder.append('c');

		expect(builder.at(0)).toBe('a');
		expect(builder.at(1)).toBe('b');
		expect(builder.at(2)).toBe('c');
	});

	it('at returns undefined for out-of-bounds index', () => {
		const builder = List.builder<number>();

		builder.append(1);

		expect(builder.at(5)).toBeUndefined();
	});

	it('at with fallback returns fallback for out-of-bounds', () => {
		const builder = List.builder<number>();

		expect(builder.at(0, 'none')).toBe('none');
	});

	it('first and last return correct values', () => {
		const builder = List.builder<number>();

		builder.append(1);
		builder.append(2);
		builder.append(3);

		expect(builder.first()).toBe(1);
		expect(builder.last()).toBe(3);
	});

	it('isEmpty returns true for empty builder', () => {
		const builder = List.builder<number>();

		expect(builder.isEmpty).toBe(true);
	});

	it('isEmpty returns false after append', () => {
		const builder = List.builder<number>();

		builder.append(42);

		expect(builder.isEmpty).toBe(false);
	});

	it('build returns list with correct elements', () => {
		const builder = List.builder<number>();

		builder.append(1);
		builder.append(2);
		builder.append(3);

		const list = builder.build();

		expect(list.size).toBe(3);
		expect(list.toArray()).toEqual([1, 2, 3]);
	});

	it('build returns empty list for empty builder', () => {
		const builder = List.builder<number>();

		const list = builder.build();

		expect(list.isEmpty).toBe(true);
		expect(list.toArray()).toEqual([]);
	});

	it('clear resets builder to empty', () => {
		const builder = List.builder<number>();

		builder.append(1);
		builder.append(2);
		builder.clear();

		expect(builder.isEmpty).toBe(true);
		expect(builder.size).toBe(0);

		builder.append(3);
		expect(builder.size).toBe(1);
		expect(builder.at(0)).toBe(3);
	});

	it('append after clear works', () => {
		const builder = List.builder<number>();

		builder.append(1);
		builder.clear();
		builder.append(99);

		expect(builder.size).toBe(1);
		expect(builder.at(0)).toBe(99);
	});
});

describe('List.builder().append with small block size', () => {
	function context(blockSizeBits = 2) {
		return List.createContext({ blockSizeBits });
	}

	it('stays a single block within maxBlockSize', () => {
		const ctx = context(2); // maxBlockSize = 4
		const builder = ctx.builder<number>();

		builder.append(1);
		builder.append(2);
		builder.append(3);
		builder.append(4);

		expect(builder.size).toBe(4);

		const list = builder.build();
		expect(list.toArray()).toEqual([1, 2, 3, 4]);
	});

	it('build returns correct elements after multiple appends within block', () => {
		const ctx = context(2);
		const builder = ctx.builder<string>();

		const values = ['a', 'b', 'c'];
		for (const v of values) {
			builder.append(v);
		}

		const list = builder.build();
		expect(list.size).toBe(3);
		expect(list.toArray()).toEqual(values);
	});

	it('at works with negative indices', () => {
		const ctx = context(2);
		const builder = ctx.builder<number>();

		builder.append(10);
		builder.append(20);
		builder.append(30);
		builder.append(40);

		expect(builder.at(-1)).toBe(40);
		expect(builder.at(-2)).toBe(30);
		expect(builder.at(-4)).toBe(10);
	});
});

describe('List.builder().append compared to prepend', () => {
	it('append adds to end, prepend adds to beginning', () => {
		const builder = List.builder<number>();

		builder.append(1);
		builder.prepend(0);
		builder.append(2);

		expect(builder.size).toBe(3);

		const list = builder.build();
		expect(list.toArray()).toEqual([0, 1, 2]);
	});

	it('prepend then append preserves start', () => {
		const builder = List.builder<string>();

		builder.prepend('first');
		builder.append('second');
		builder.append('third');

		const list = builder.build();
		expect(list.first()).toBe('first');
		expect(list.last()).toBe('third');
	});
});

describe('List.builder().appendMany', () => {
	it('appendAll adds all elements from array', () => {
		const builder = List.builder<number>();

		builder.append(1);
		builder.appendAll([2, 3, 4]);

		expect(builder.size).toBe(4);
		expect(builder.build().toArray()).toEqual([1, 2, 3, 4]);
	});

	it('appendAll from empty array does nothing', () => {
		const builder = List.builder<number>();

		builder.append(1);
		builder.appendAll([]);

		expect(builder.size).toBe(1);
	});
});

describe('List.builder().append forEach iteration lock', () => {
	it('throws when modifying during forEach', () => {
		const builder = List.builder<number>();

		builder.append(1);
		builder.append(2);

		expect(() => {
			builder.forEach(() => {
				builder.append(3);
			});
		}).toThrow();
	});
});

describe('List.builder().append beyond single block', () => {
	function context(blockSizeBits = 2) {
		return List.createContext({ blockSizeBits });
	}

	it('splits into tree when exceeding maxBlockSize', () => {
		const ctx = context(2); // maxBlockSize = 4
		const builder = ctx.builder<number>();

		for (let i = 0; i < 10; i++) {
			builder.append(i);
		}

		expect(builder.size).toBe(10);
		expect(builder.isEmpty).toBe(false);
	});

	it('build preserves all elements after tree split', () => {
		const ctx = context(2);
		const builder = ctx.builder<number>();

		for (let i = 0; i < 10; i++) {
			builder.append(i);
		}

		const list = builder.build();
		expect(list.size).toBe(10);
		expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	it('at works after tree split', () => {
		const ctx = context(2);
		const builder = ctx.builder<number>();

		for (let i = 0; i < 10; i++) {
			builder.append(i);
		}

		expect(builder.at(0)).toBe(0);
		expect(builder.at(5)).toBe(5);
		expect(builder.at(9)).toBe(9);
		expect(builder.at(-1)).toBe(9);
		expect(builder.at(-3)).toBe(7);
	});

	it('forEach iterates all elements after tree split', () => {
		const ctx = context(2);
		const builder = ctx.builder<number>();

		for (let i = 0; i < 10; i++) {
			builder.append(i);
		}

		const result: number[] = [];
		builder.forEach((v) => result.push(v));

		expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	it('first and last correct after tree split', () => {
		const ctx = context(2);
		const builder = ctx.builder<number>();

		for (let i = 0; i < 20; i++) {
			builder.append(i);
		}

		expect(builder.first()).toBe(0);
		expect(builder.last()).toBe(19);
	});

	it('can append after tree split', () => {
		const ctx = context(2);
		const builder = ctx.builder<number>();

		for (let i = 0; i < 5; i++) {
			builder.append(i);
		}

		builder.append(99);
		builder.append(100);

		const list = builder.build();
		expect(list.size).toBe(7);
		expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 99, 100]);
	});
});
