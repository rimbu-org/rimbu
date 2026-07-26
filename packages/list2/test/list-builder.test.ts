import { describe, expect, it } from 'bun:test';

import type { List } from '@rimbu/list';

import { List as ListFactory } from '@rimbu/list';

function ctx(bits = 2) {
	return ListFactory.createContext({ blockSizeBits: bits });
}

function builder<T>(bits = 5): List.Builder<T> {
	return ListFactory.builder<T>();
}

function appendMany<T>(b: List.Builder<T>, values: Iterable<T>): void {
	for (const v of values) {
		b.append(v);
	}
}

describe('ListBuilder.empty', () => {
	it('size is 0', () => {
		expect(builder().size).toBe(0);
	});

	it('isEmpty is true', () => {
		expect(builder().isEmpty).toBe(true);
	});

	it('build returns empty list', () => {
		const b = builder<number>();
		const list = b.build();
		expect(list.isEmpty).toBe(true);
		expect(list.size).toBe(0);
		expect(list.toArray()).toEqual([]);
	});

	it('at returns otherwise', () => {
		const b = builder<number>();
		expect(b.at(0)).toBeUndefined();
		expect(b.at(0, 'fallback')).toBe('fallback');
	});

	it('first returns undefined when empty', () => {
		const b = builder<number>();
		expect(b.first()).toBeUndefined();
	});

	it('last returns undefined when empty', () => {
		const b = builder<number>();
		expect(b.last()).toBeUndefined();
	});

	it('forEach does nothing', () => {
		const b = builder<number>();
		let count = 0;
		b.forEach(() => count++);
		expect(count).toBe(0);
	});
});

describe('ListBuilder.append', () => {
	it('single element', () => {
		const b = builder<number>();
		b.append(1);
		expect(b.size).toBe(1);
		expect(b.isEmpty).toBe(false);
		expect(b.at(0)).toBe(1);
	});

	it('multiple elements in order', () => {
		const b = builder<number>();
		b.append(1);
		b.append(2);
		b.append(3);
		expect(b.size).toBe(3);
		expect(b.at(0)).toBe(1);
		expect(b.at(1)).toBe(2);
		expect(b.at(2)).toBe(3);
	});

	it('build preserves all elements', () => {
		const b = builder<number>();
		appendMany(b, [10, 20, 30]);
		const list = b.build();
		expect(list.size).toBe(3);
		expect(list.toArray()).toEqual([10, 20, 30]);
	});

	it('build returns structurally equal but new instance when not mutated', () => {
		const b = builder<number>();
		appendMany(b, [1, 2, 3]);
		const a = b.build();
		const c = b.build();
		expect(a.toArray()).toEqual(c.toArray());
		expect(a.size).toBe(c.size);
	});

	it('build returns new value after further mutation', () => {
		const b = builder<number>();
		b.append(1);
		const a = b.build();
		b.append(2);
		const c = b.build();
		expect(a.size).toBe(1);
		expect(c.size).toBe(2);
	});

	it('first and last are correct', () => {
		const b = builder<number>();
		appendMany(b, [10, 20, 30]);
		expect(b.first()).toBe(10);
		expect(b.last()).toBe(30);
	});

	it('negative index via at', () => {
		const b = builder<number>();
		appendMany(b, [10, 20, 30, 40]);
		expect(b.at(-1)).toBe(40);
		expect(b.at(-2)).toBe(30);
		expect(b.at(-4)).toBe(10);
	});

	it('at out-of-bounds returns otherwise', () => {
		const b = builder<number>();
		b.append(1);
		expect(b.at(5)).toBeUndefined();
		expect(b.at(-5)).toBeUndefined();
		expect(b.at(10, 'fallback')).toBe('fallback');
	});
});

describe('ListBuilder.prepend', () => {
	it('single prepend', () => {
		const b = builder<number>();
		b.prepend(1);
		expect(b.size).toBe(1);
		expect(b.at(0)).toBe(1);
	});

	it('prepend then append preserves order', () => {
		const b = builder<number>();
		b.prepend(1);
		b.append(3);
		b.prepend(0);
		b.append(4);
		expect(b.build().toArray()).toEqual([0, 1, 3, 4]);
	});

	it('only prepends reverse the order', () => {
		const b = builder<number>();
		b.prepend(3);
		b.prepend(2);
		b.prepend(1);
		expect(b.build().toArray()).toEqual([1, 2, 3]);
	});
});

describe('ListBuilder.appendAll', () => {
	it('appends array elements', () => {
		const b = builder<number>();
		b.appendAll([1, 2, 3]);
		expect(b.size).toBe(3);
		expect(b.build().toArray()).toEqual([1, 2, 3]);
	});

	it('appends after existing elements', () => {
		const b = builder<number>();
		b.append(1);
		b.appendAll([2, 3, 4]);
		expect(b.build().toArray()).toEqual([1, 2, 3, 4]);
	});

	it('appendAll from empty array does nothing', () => {
		const b = builder<number>();
		b.append(1);
		b.appendAll([]);
		expect(b.size).toBe(1);
	});

	it('appendAll from another list', () => {
		const b = builder<number>();
		const source = ctx().of(10, 20, 30);
		b.append(1);
		b.appendAll(source);
		b.append(99);
		expect(b.build().toArray()).toEqual([1, 10, 20, 30, 99]);
	});

	it('appendAll from a stream', () => {
		const b = builder<number>();
		b.appendAll([1, 2, 3].values());
		expect(b.build().toArray()).toEqual([1, 2, 3]);
	});

	it('chained appendAll calls', () => {
		const b = builder<number>();
		b.appendAll([1, 2]);
		b.appendAll([3, 4, 5]);
		expect(b.build().toArray()).toEqual([1, 2, 3, 4, 5]);
	});
});

describe('ListBuilder.clear', () => {
	it('resets size to 0', () => {
		const b = builder<number>();
		b.append(1);
		b.append(2);
		b.clear();
		expect(b.size).toBe(0);
		expect(b.isEmpty).toBe(true);
	});

	it('build after clear returns empty', () => {
		const b = builder<number>();
		b.append(1);
		b.clear();
		expect(b.build().size).toBe(0);
	});

	it('can append after clear', () => {
		const b = builder<number>();
		b.append(1);
		b.clear();
		b.append(99);
		expect(b.build().toArray()).toEqual([99]);
	});

	it('clear on already-empty builder is safe', () => {
		const b = builder<number>();
		b.clear();
		expect(b.size).toBe(0);
		b.append(1);
		expect(b.size).toBe(1);
	});
});

describe('ListBuilder.forEach', () => {
	it('iterates elements in order', () => {
		const b = builder<number>();
		appendMany(b, [10, 20, 30]);
		const result: number[] = [];
		b.forEach((v) => result.push(v));
		expect(result).toEqual([10, 20, 30]);
	});

	it('works with mixed prepend and append', () => {
		const b = builder<number>();
		b.prepend(0);
		b.append(2);
		b.prepend(-1);
		const result: number[] = [];
		b.forEach((v) => result.push(v));
		expect(result).toEqual([-1, 0, 2]);
	});

	it('forEach on empty builder is safe', () => {
		const b = builder<number>();
		let called = false;
		b.forEach(() => {
			called = true;
		});
		expect(called).toBe(false);
	});

	it('throws when mutating during iteration', () => {
		const b = builder<number>();
		b.append(1);
		b.append(2);
		expect(() => {
			b.forEach(() => {
				b.append(3);
			});
		}).toThrow();
	});

	it('allows read-only access during iteration', () => {
		const b = builder<number>();
		b.append(1);
		b.append(2);
		let sum = 0;
		b.forEach((v) => {
			sum += v;
			expect(b.at(0)).toBe(1); // read-only is ok
		});
		expect(sum).toBe(3);
	});

	it('can call forEach again after previous iteration ends', () => {
		const b = builder<number>();
		b.append(1);
		b.forEach(() => {});
		b.append(2);
		b.forEach(() => {});
		expect(b.size).toBe(2);
	});

	it('forEachIndexed passes correct indices', () => {
		const b = builder<number>();
		appendMany(b, [100, 200, 300]);
		const indices: number[] = [];
		const values: number[] = [];
		(b as any).forEachIndexed((v: number, i: number) => {
			indices.push(i);
			values.push(v);
		});
		expect(indices).toEqual([0, 1, 2]);
		expect(values).toEqual([100, 200, 300]);
	});
});

describe('ListBuilder.tree-overflow', () => {
	const bits = 2; // maxBlockSize = 4

	it('stays as single block within max', () => {
		const b = ctx(bits).builder<number>();
		appendMany(b, [1, 2, 3, 4]);
		expect(b.size).toBe(4);
		expect(b.build().toArray()).toEqual([1, 2, 3, 4]);
	});

	it('splits into tree when exceeding maxBlockSize', () => {
		const b = ctx(bits).builder<number>();
		appendMany(b, [1, 2, 3, 4, 5]);
		expect(b.size).toBe(5);
		expect(b.build().toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it('at works across tree boundary', () => {
		const b = ctx(bits).builder<number>();
		for (let i = 0; i < 10; i++) {
			b.append(i);
		}
		expect(b.at(0)).toBe(0);
		expect(b.at(4)).toBe(4);
		expect(b.at(9)).toBe(9);
	});

	it('negative at across tree boundary', () => {
		const b = ctx(bits).builder<number>();
		for (let i = 0; i < 10; i++) {
			b.append(i);
		}
		expect(b.at(-1)).toBe(9);
		expect(b.at(-3)).toBe(7);
		expect(b.at(-10)).toBe(0);
	});

	it('forEach after tree split visits all elements', () => {
		const b = ctx(bits).builder<number>();
		for (let i = 0; i < 10; i++) {
			b.append(i);
		}
		const result: number[] = [];
		b.forEach((v) => result.push(v));
		expect(result).toEqual(Array.from({ length: 10 }, (_, i) => i));
	});

	it('first and last after tree split', () => {
		const b = ctx(bits).builder<number>();
		for (let i = 0; i < 20; i++) {
			b.append(i);
		}
		expect(b.first()).toBe(0);
		expect(b.last()).toBe(19);
	});

	it('prepend into tree', () => {
		const b = ctx(bits).builder<number>();
		for (let i = 5; i >= 1; i--) {
			b.prepend(i);
		}
		expect(b.build().toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it('deep tree (100 elements mixed prepend/append) builds correctly', () => {
		const b = ctx(bits).builder<number>();
		for (let i = 0; i < 100; i++) {
			if (i % 2 === 0) {
				b.prepend(-i - 1);
			} else {
				b.append(i);
			}
		}
		expect(b.size).toBe(100);

		const list = b.build();
		expect(list.size).toBe(100);

		// prepend values run: -1,-3,-5,...,-99 (last prepend = -99 at index 0)
		expect(list.at(0)).toBe(-99);
		expect(list.at(1)).toBe(-97);
	});

	it('multiple builds return structurally equal results', () => {
		const b = ctx(bits).builder<number>();
		for (let i = 0; i < 10; i++) {
			b.append(i);
		}
		const a = b.build();
		const c = b.build();
		expect(a.toArray()).toEqual(c.toArray());
	});
});

describe('ListBuilder.edge-cases', () => {
	describe('null / undefined elements', () => {
		it('null elements', () => {
			const b = ListFactory.builder<number | null>();
			b.append(1);
			b.append(null);
			b.append(3);
			expect(b.at(0)).toBe(1);
			expect(b.at(1)).toBeNull();
			expect(b.at(2)).toBe(3);
			expect(b.build().toArray()).toEqual([1, null, 3]);
		});

		it('undefined elements', () => {
			const b = ListFactory.builder<number | undefined>();
			b.append(1);
			b.append(undefined);
			b.append(3);
			expect(b.at(0)).toBe(1);
			expect(b.at(1)).toBeUndefined();
			expect(b.at(2)).toBe(3);
		});

		it('at fallback with null values', () => {
			const b = ListFactory.builder<null>();
			b.append(null);
			expect(b.at(0)).toBeNull();
			expect(b.at(1, 'fallback')).toBe('fallback');
		});
	});

	describe('string elements', () => {
		it('preserves string values', () => {
			const b = ListFactory.builder<string>();
			b.append('a');
			b.append('b');
			expect(b.first()).toBe('a');
			expect(b.build().toArray()).toEqual(['a', 'b']);
		});
	});

	describe('alternating prepend/append patterns', () => {
		it('builds palindrome-like pattern', () => {
			const b = builder<number>(2);
			b.append(1);
			b.prepend(0);
			b.append(2);
			b.prepend(-1);
			b.append(3);
			expect(b.build().toArray()).toEqual([-1, 0, 1, 2, 3]);
		});
	});

	describe('large single-run append', () => {
		it('500 elements with default block size', () => {
			const b = builder<number>();
			for (let i = 0; i < 500; i++) {
				b.append(i);
			}
			expect(b.size).toBe(500);
		const list = b.build();
		expect(list.at(0)).toBe(0);
		expect(list.at(250)).toBe(250);
		expect(list.at(499)).toBe(499);
		});
	});

	describe('OptLazy semantics', () => {
		it('at lazy otherwise is not called when element exists', () => {
			const b = builder<number>();
			b.append(1);
			let called = false;
			expect(
				b.at(0, () => {
					called = true;
					return 999;
				}),
			).toBe(1);
			expect(called).toBe(false);
		});

		it('at lazy otherwise is called on empty builder', () => {
			const b = builder<number>();
			expect(
				b.at(0, () => 42),
			).toBe(42);
		});

		it('at with eager otherwise on empty', () => {
			const b = builder<number>();
			expect(b.at(0, 'fallback')).toBe('fallback');
		});
	});
});
