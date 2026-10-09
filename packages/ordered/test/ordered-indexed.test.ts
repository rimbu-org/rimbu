import { describe, expect, it } from 'bun:test';

import { OrderedMap } from '@rimbu/ordered/map';
import { OrderedSet } from '@rimbu/ordered/set';

describe('OrderedMap indexed and order editing', () => {
	const m = OrderedMap.of([1, 'a'], [2, 'b'], [3, 'c']);

	it('positional reads', () => {
		expect(m.at(0)).toEqual([1, 'a']);
		expect(m.at(2)).toEqual([3, 'c']);
		expect(m.at(-1)).toEqual([3, 'c']);
		expect(m.at(9)).toBeUndefined();
		expect(m.at(9, 'fallback')).toBe('fallback');
		expect(m.first()).toEqual([1, 'a']);
		expect(m.last()).toEqual([3, 'c']);
		expect(m.indexOf(2)).toBe(1);
		expect(m.indexOf(99)).toBeUndefined();
		expect(m.indexOf(99, -1)).toBe(-1);
	});

	it('streamSlice / take / drop / slice / splitAt', () => {
		expect(m.streamSlice({ start: 1, amount: 1 }).toArray()).toEqual([
			[2, 'b'],
		]);
		expect(m.take(2).toArray()).toEqual([
			[1, 'a'],
			[2, 'b'],
		]);
		expect(m.take(-1).toArray()).toEqual([[3, 'c']]);
		expect(m.drop(1).toArray()).toEqual([
			[2, 'b'],
			[3, 'c'],
		]);
		expect(m.drop(9).toArray()).toEqual([]);
		expect(m.slice({ start: 1, amount: 2 }).toArray()).toEqual([
			[2, 'b'],
			[3, 'c'],
		]);
		const [left, right] = m.splitAt(1);
		expect(left.toArray()).toEqual([[1, 'a']]);
		expect(right.toArray()).toEqual([
			[2, 'b'],
			[3, 'c'],
		]);
	});

	it('prepend / append insert and move', () => {
		expect(m.prepend([0, 'z']).toArray()).toEqual([
			[0, 'z'],
			[1, 'a'],
			[2, 'b'],
			[3, 'c'],
		]);
		expect(m.append([4, 'd']).toArray()).toEqual([
			[1, 'a'],
			[2, 'b'],
			[3, 'c'],
			[4, 'd'],
		]);
		expect(m.prepend([2, 'B']).toArray()).toEqual([
			[2, 'B'],
			[1, 'a'],
			[3, 'c'],
		]);
		expect(m.append([1, 'A']).toArray()).toEqual([
			[2, 'b'],
			[3, 'c'],
			[1, 'A'],
		]);
	});

	it('placeAt / moveTo', () => {
		expect(m.placeAt(1, [9, 'x']).toArray()).toEqual([
			[1, 'a'],
			[9, 'x'],
			[2, 'b'],
			[3, 'c'],
		]);
		expect(m.placeAt(-1, [1, 'A']).toArray()).toEqual([
			[2, 'b'],
			[3, 'c'],
			[1, 'A'],
		]);
		expect(m.moveTo(0, 3).toArray()).toEqual([
			[3, 'c'],
			[1, 'a'],
			[2, 'b'],
		]);
		expect(m.moveTo(2, 1).toArray()).toEqual([
			[2, 'b'],
			[3, 'c'],
			[1, 'a'],
		]);
		expect(m.moveTo(0, 99)).toBe(m);
		expect(m.moveTo(0, 1)).toBe(m);
	});

	it('removeAt / removeAtAndReturn', () => {
		expect(m.removeAt(1).toArray()).toEqual([
			[1, 'a'],
			[3, 'c'],
		]);
		expect(m.removeAt(0, 2).toArray()).toEqual([[3, 'c']]);
		expect(m.removeAt(5)).toBe(m);
		expect(m.removeAt(-1).toArray()).toEqual([
			[1, 'a'],
			[2, 'b'],
		]);

		const result = m.removeAtAndReturn(1);
		expect(result.hasResult).toBe(true);
		expect(result.result.toArray()).toEqual([[2, 'b']]);
		expect(result.collection.toArray()).toEqual([
			[1, 'a'],
			[3, 'c'],
		]);

		const missing = m.removeAtAndReturn(9);
		expect(missing.hasResult).toBe(false);
		expect(missing.collection).toBe(m);
	});

	it('swapAt / swapAtAndReturn', () => {
		expect(m.swapAt(0, 2).toArray()).toEqual([
			[3, 'c'],
			[2, 'b'],
			[1, 'a'],
		]);
		expect(m.swapAt(0, 0)).toBe(m);
		expect(m.swapAt(0, 9)).toBe(m);

		const result = m.swapAtAndReturn(1, 2);
		expect(result.hasResult).toBe(true);
		expect(result.result).toEqual([
			[2, 'b'],
			[3, 'c'],
		]);
		expect(result.collection.toArray()).toEqual([
			[1, 'a'],
			[3, 'c'],
			[2, 'b'],
		]);
	});

	it('set preserves position', () => {
		expect(m.set(2, 'B').toArray()).toEqual([
			[1, 'a'],
			[2, 'B'],
			[3, 'c'],
		]);
	});

	it('builder mirrors the vocabulary', () => {
		const b = m.toBuilder();
		b.append([4, 'd']);
		b.prepend([0, 'z']);
		expect(b.build().toArray()).toEqual([
			[0, 'z'],
			[1, 'a'],
			[2, 'b'],
			[3, 'c'],
			[4, 'd'],
		]);

		expect(b.indexOf(0)).toBe(0);
		expect(b.at(0)).toEqual([0, 'z']);

		b.placeAt(0, [1, 'A']);
		expect(b.build().toArray()).toEqual([
			[1, 'A'],
			[0, 'z'],
			[2, 'b'],
			[3, 'c'],
			[4, 'd'],
		]);

		b.moveTo(0, 4);
		expect(b.build().toArray()).toEqual([
			[4, 'd'],
			[1, 'A'],
			[0, 'z'],
			[2, 'b'],
			[3, 'c'],
		]);

		b.swapAt(0, 1);
		expect(b.build().toArray()).toEqual([
			[1, 'A'],
			[4, 'd'],
			[0, 'z'],
			[2, 'b'],
			[3, 'c'],
		]);

		expect(b.removeAt(0)).toEqual([1, 'A']);
		expect(b.build().toArray()).toEqual([
			[4, 'd'],
			[0, 'z'],
			[2, 'b'],
			[3, 'c'],
		]);

		expect(b.removeAmountAt(0, 2)).toBe(true);
		expect(b.build().toArray()).toEqual([
			[2, 'b'],
			[3, 'c'],
		]);
	});

	it('empty behaves positionally', () => {
		const e = OrderedMap.empty<number, string>();
		expect(e.at(0)).toBeUndefined();
		expect(e.first()).toBeUndefined();
		expect(e.indexOf(1)).toBeUndefined();
		expect(e.take(2)).toBe(e);
		expect(e.placeAt(0, [1, 'a']).toArray()).toEqual([[1, 'a']]);
		expect(e.moveTo(0, 1)).toBe(e);
	});
});

describe('OrderedSet indexed and order editing', () => {
	const s = OrderedSet.of(1, 2, 3);

	it('positional reads', () => {
		expect(s.at(0)).toBe(1);
		expect(s.at(-1)).toBe(3);
		expect(s.at(9)).toBeUndefined();
		expect(s.first()).toBe(1);
		expect(s.last()).toBe(3);
		expect(s.indexOf(2)).toBe(1);
		expect(s.indexOf(99)).toBeUndefined();
		expect(s.indexOf(99, -1)).toBe(-1);
	});

	it('streamSlice / take / drop / slice / splitAt', () => {
		expect(s.streamSlice({ start: 1, amount: 1 }).toArray()).toEqual([2]);
		expect(s.take(2).toArray()).toEqual([1, 2]);
		expect(s.drop(1).toArray()).toEqual([2, 3]);
		expect(s.slice({ start: 1, amount: 2 }).toArray()).toEqual([2, 3]);
		const [left, right] = s.splitAt(1);
		expect(left.toArray()).toEqual([1]);
		expect(right.toArray()).toEqual([2, 3]);
	});

	it('prepend / append / placeAt / moveTo', () => {
		expect(s.prepend(0).toArray()).toEqual([0, 1, 2, 3]);
		expect(s.append(4).toArray()).toEqual([1, 2, 3, 4]);
		expect(s.prepend(2).toArray()).toEqual([2, 1, 3]);
		expect(s.append(1).toArray()).toEqual([2, 3, 1]);
		expect(s.placeAt(1, 9).toArray()).toEqual([1, 9, 2, 3]);
		expect(s.moveTo(0, 3).toArray()).toEqual([3, 1, 2]);
		expect(s.moveTo(0, 99)).toBe(s);
		expect(s.add(2)).toBe(s);
	});

	it('removeAt / swapAt', () => {
		expect(s.removeAt(1).toArray()).toEqual([1, 3]);
		expect(s.removeAt(0, 2).toArray()).toEqual([3]);
		expect(s.removeAt(9)).toBe(s);
		expect(s.swapAt(0, 2).toArray()).toEqual([3, 2, 1]);
		expect(s.swapAt(0, 0)).toBe(s);

		const removed = s.removeAtAndReturn(0);
		expect(removed.hasResult).toBe(true);
		expect(removed.result.toArray()).toEqual([1]);
		expect(removed.collection.toArray()).toEqual([2, 3]);
	});

	it('builder mirrors the vocabulary', () => {
		const b = s.toBuilder();
		b.append(4);
		b.prepend(0);
		expect(b.build().toArray()).toEqual([0, 1, 2, 3, 4]);
		expect(b.indexOf(3)).toBe(3);
		b.placeAt(0, 2);
		expect(b.build().toArray()).toEqual([2, 0, 1, 3, 4]);
		b.moveTo(0, 4);
		expect(b.build().toArray()).toEqual([4, 2, 0, 1, 3]);
		b.swapAt(0, 1);
		expect(b.build().toArray()).toEqual([2, 4, 0, 1, 3]);
		expect(b.removeAt(0)).toBe(2);
		expect(b.removeAmountAt(0, 2)).toBe(true);
		expect(b.build().toArray()).toEqual([1, 3]);
	});

	it('empty behaves positionally', () => {
		const e = OrderedSet.empty<number>();
		expect(e.at(0)).toBeUndefined();
		expect(e.first()).toBeUndefined();
		expect(e.indexOf(1)).toBeUndefined();
		expect(e.take(2)).toBe(e);
		expect(e.placeAt(0, 1).toArray()).toEqual([1]);
		expect(e.moveTo(0, 1)).toBe(e);
	});
});
