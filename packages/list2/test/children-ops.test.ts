import { describe, expect, it } from 'bun:test';

import { ArrayOuterChildrenOps } from '#list/children-ops/array';

const ops = new ArrayOuterChildrenOps();

describe('ArrayOuterChildrenOps', () => {
	it('of creates a children collection', () => {
		const c = ops.of([1, 2, 3]);
		expect(ops.size(c)).toBe(3);
	});

	it('size returns element count', () => {
		expect(ops.size([])).toBe(0);
		expect(ops.size([1, 2, 3])).toBe(3);
	});

	it('at returns element at index', () => {
		const c = ops.of(['a', 'b', 'c']);
		expect(ops.at(c, 0)).toBe('a');
		expect(ops.at(c, 2)).toBe('c');
	});

	it('at returns fallback for out-of-bounds', () => {
		const c = ops.of([1]);
		expect(ops.at(c, 5, 'none')).toBe('none');
		expect(ops.at(c, -2, 'none')).toBe('none');
	});

	it('setAt returns new array with updated value', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.setAt(c, 1, 99);

		expect(ops.at(result, 1)).toBe(99);
		expect(ops.at(c, 1)).toBe(2);
	});

	it('setAt returns same array when value is unchanged', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.setAt(c, 1, 2);
		expect(result).toBe(c);
	});

	it('updateAt applies function to element', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.updateAt(c, 1, (v) => v * 10);

		expect(ops.at(result, 1)).toBe(20);
		expect(ops.at(c, 1)).toBe(2);
	});

	it('updateAt returns same array when value is unchanged', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.updateAt(c, 1, (v) => v);
		expect(result).toBe(c);
	});

	it('prepend adds to beginning', () => {
		const c = ops.of([2, 3]);
		const result = ops.prepend(c, 1);

		expect(ops.size(result)).toBe(3);
		expect(ops.toArray(result)).toEqual([1, 2, 3]);
	});

	it('append adds to end', () => {
		const c = ops.of([1, 2]);
		const result = ops.append(c, 3);

		expect(ops.size(result)).toBe(3);
		expect(ops.toArray(result)).toEqual([1, 2, 3]);
	});

	it('concat combines two collections', () => {
		const a = ops.of([1, 2]);
		const b = ops.of([3, 4]);
		const result = ops.concat(a, b);

		expect(ops.size(result)).toBe(4);
		expect(ops.toArray(result)).toEqual([1, 2, 3, 4]);
	});

	it('concat returns non-empty operand when other is empty', () => {
		const a = ops.of([1, 2]);
		const empty = ops.of([]);

		expect(ops.concat(a, empty)).toBe(a);
		expect(ops.concat(empty, a)).toBe(a);
	});

	it('toSpliced removes elements', () => {
		const c = ops.of([1, 2, 3, 4, 5]);
		const result = ops.toSpliced(c, 1, 2);

		expect(ops.size(result)).toBe(3);
		expect(ops.toArray(result)).toEqual([1, 4, 5]);
	});

	it('toSpliced inserts elements', () => {
		const c = ops.of([1, 4]);
		const result = ops.toSpliced(c, 1, 0, ops.of([2, 3]));

		expect(ops.toArray(result)).toEqual([1, 2, 3, 4]);
	});

	it('toReversed returns reversed copy', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.toReversed(c);

		expect(ops.toArray(result)).toEqual([3, 2, 1]);
	});

	it('toReversed preserves original', () => {
		const c = ops.of([1, 2, 3]);
		ops.toReversed(c);

		expect(ops.toArray(c)).toEqual([1, 2, 3]);
	});

	it('join returns joined string', () => {
		const c = ops.of(['a', 'b', 'c']);
		expect(ops.join(c, ',')).toBe('a,b,c');
	});

	it('join with reversed returns reversed joined string', () => {
		const c = ops.of(['a', 'b', 'c']);
		expect(ops.join(c, ',', true)).toBe('c,b,a');
	});

	it('filter removes non-matching elements', () => {
		const c = ops.of([1, 2, 3, 4, 5]);
		const result = ops.filter(c, (v) => v % 2 === 0);

		expect(ops.toArray(result!)).toEqual([2, 4]);
	});

	it('filter returns undefined when all elements match', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.filter(c, () => true);
		expect(result).toBeUndefined();
	});

	it('reverseFilter removes non-matching elements in reverse order', () => {
		const c = ops.of([1, 2, 3, 4, 5]);
		const result = ops.reverseFilter(c, (v) => v % 2 === 0);

		expect(ops.toArray(result!)).toEqual([4, 2]);
	});

	it('reverseFilter returns undefined when all elements match', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.reverseFilter(c, () => true);
		expect(result).toBeUndefined();
	});

	it('reverseFilter removes all returns empty', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.reverseFilter(c, () => false);
		expect(result!).toEqual([]);
	});

	it('map transforms elements', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.map(c, (v) => v * 10);

		expect(ops.toArray(result)).toEqual([10, 20, 30]);
	});

	it('reverseMap maps in reverse order', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.reverseMap(c, (v) => v * 10);

		expect(ops.toArray(result)).toEqual([30, 20, 10]);
	});

	it('reverseMap preserves length', () => {
		const c = ops.of([1, 2, 3, 4]);
		const result = ops.reverseMap(c, (v) => v);

		expect(ops.size(result)).toBe(4);
		expect(ops.toArray(result)).toEqual([4, 3, 2, 1]);
	});

	it('forEach iterates each element', () => {
		const c = ops.of([1, 2, 3]);
		const result: number[] = [];

		ops.forEach(c, (v) => result.push(v));

		expect(result).toEqual([1, 2, 3]);
	});

	it('forEach respects reversed option', () => {
		const c = ops.of([1, 2, 3]);
		const result: number[] = [];

		ops.forEach(c, (v) => result.push(v), { reversed: true });

		expect(result).toEqual([3, 2, 1]);
	});

	it('toArray returns all elements', () => {
		const c = ops.of([1, 2, 3]);

		expect(ops.toArray(c)).toEqual([1, 2, 3]);
	});

	it('sliceArray with start and end returns slice', () => {
		const c = ops.of([1, 2, 3, 4, 5]);

		expect(ops.sliceArray(c, 1, 4)).toEqual([2, 3, 4]);
	});

	it('sliceArray with reversed returns reversed slice', () => {
		const c = ops.of([1, 2, 3, 4]);

		expect(ops.sliceArray(c, 0, 4, true)).toEqual([4, 3, 2, 1]);
	});

	it('sliceArray returns original array when full range', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.sliceArray(c, 0, 3, false);
		expect(result).toBe(c);
	});
});

describe('ArrayOuterChildrenOps mutating', () => {
	it('mutateSet updates in place', () => {
		const c = ops.of([1, 2, 3]);
		const result = ops.mutateSet(c, 1, 99);

		expect(result).toBe(c);
		expect(c[1]).toBe(99);
	});

	it('mutatePrepend adds to beginning in place', () => {
		const c = ops.of([2, 3]);
		const result = ops.mutatePrepend(c, 1);

		expect(result).toBe(c);
		expect(ops.toArray(c)).toEqual([1, 2, 3]);
	});

	it('mutateAppend adds to end in place', () => {
		const c = ops.of([1, 2]);
		const result = ops.mutateAppend(c, 3);

		expect(result).toBe(c);
		expect(ops.toArray(c)).toEqual([1, 2, 3]);
	});

	it('mutateSplice removes elements in place', () => {
		const c = ops.of([1, 2, 3, 4, 5]);
		const [result, deleted] = ops.mutateSplice(c, 1, 2);

		expect(result).toBe(c);
		expect(ops.toArray(result)).toEqual([1, 4, 5]);
		expect(deleted).toEqual([2, 3]);
	});

	it('mutateDropFirst removes and returns first element', () => {
		const c = ops.of([1, 2, 3]);
		const [result, dropped] = ops.mutateDropFirst(c);

		expect(result).toBe(c);
		expect(dropped).toBe(1);
		expect(ops.toArray(c)).toEqual([2, 3]);
	});

	it('mutateDropLast removes and returns last element', () => {
		const c = ops.of([1, 2, 3]);
		const [result, dropped] = ops.mutateDropLast(c);

		expect(result).toBe(c);
		expect(dropped).toBe(3);
		expect(ops.toArray(c)).toEqual([1, 2]);
	});

	it('guard freezes the array', () => {
		const c = ops.of([1, 2, 3]);
		const guarded = ops.guard(c);

		expect(Object.isFrozen(guarded)).toBe(true);
		expect(ops.toArray(guarded)).toEqual([1, 2, 3]);
	});

	it('safeCopy returns a mutable copy', () => {
		const original = ops.of([1, 2, 3]);
		const copy = ops.safeCopy(original);

		expect(ops.toArray(copy)).toEqual([1, 2, 3]);
		expect(copy).not.toBe(original);
		ops.mutateAppend(copy, 4);
		expect(ops.toArray(original)).toEqual([1, 2, 3]);
	});
});
