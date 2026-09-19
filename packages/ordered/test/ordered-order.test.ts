import { describe, expect, it } from 'bun:test';

import { OrderedMap } from '@rimbu/ordered/map';
import { OrderedSet } from '@rimbu/ordered/set';
import { SortedMap } from '@rimbu/sorted/map';

describe('OrderedMap order semantics', () => {
	it('appends new keys', () => {
		expect(OrderedMap.of([1, 'a'], [2, 'b'], [3, 'c']).toArray()).toEqual([
			[1, 'a'],
			[2, 'b'],
			[3, 'c'],
		]);
	});

	it('keeps position when updating an existing value', () => {
		expect(
			OrderedMap.of([1, 'a'], [2, 'b'], [3, 'c']).set(1, 'z').toArray(),
		).toEqual([
			[1, 'z'],
			[2, 'b'],
			[3, 'c'],
		]);
	});

	it('keeps position when re-setting an equal value', () => {
		expect(OrderedMap.of([1, 'a'], [2, 'b']).set(2, 'b').toArray()).toEqual([
			[1, 'a'],
			[2, 'b'],
		]);
	});

	it('re-appends a key at the end after removal', () => {
		expect(
			OrderedMap.of([1, 'a'], [2, 'b'], [3, 'c']).removeKey(2).set(2, 'B').toArray(),
		).toEqual([
			[1, 'a'],
			[3, 'c'],
			[2, 'B'],
		]);
	});

	it('keeps position with mapValues', () => {
		expect(
			OrderedMap.of([1, 'a'], [2, 'b'])
				.mapValues((value) => value.toUpperCase())
				.toArray(),
		).toEqual([
			[1, 'A'],
			[2, 'B'],
		]);
	});

	it('keeps relative order with filter', () => {
		expect(
			OrderedMap.of([1, 'a'], [2, 'b'], [3, 'c'])
				.filter(([key]) => key !== 2)
				.toArray(),
		).toEqual([
			[1, 'a'],
			[3, 'c'],
		]);
	});

	it('keeps position with modifyAtKey', () => {
		expect(
			OrderedMap.of([1, 'a'], [2, 'b'], [3, 'c']).modifyAtKey(1, {
				ifExists: { set: 'x' },
			}).toArray(),
		).toEqual([
			[1, 'x'],
			[2, 'b'],
			[3, 'c'],
		]);
	});

	it('keeps position with updateAtKey', () => {
		expect(
			OrderedMap.of([1, 'a'], [2, 'b'])
				.updateAtKey(1, (value) => `${value}!`)
				.toArray(),
		).toEqual([
			[1, 'a!'],
			[2, 'b'],
		]);
	});

	it('preserves insertion order with a sorted key map', () => {
		const context = OrderedMap.createContext<number>({
			keyMapContext: SortedMap.createContext<number>({}),
		});
		expect(context.of([3, 'c'], [1, 'a'], [2, 'b']).toArray()).toEqual([
			[3, 'c'],
			[1, 'a'],
			[2, 'b'],
		]);
	});

	it('exposes the configured indicator block size', () => {
		const context = OrderedMap.createContext<number>({
			indicatorBlockSizeBits: 2,
		});
		expect(context.indicatorBlockSizeBits).toBe(2);
	});
});

describe('OrderedSet order semantics', () => {
	it('appends new elements', () => {
		expect(OrderedSet.of(1, 2, 3).toArray()).toEqual([1, 2, 3]);
	});

	it('keeps position when adding an existing element', () => {
		expect(OrderedSet.of(1, 2, 3).add(1).toArray()).toEqual([1, 2, 3]);
	});

	it('re-appends an element at the end after removal', () => {
		expect(OrderedSet.of(1, 2, 3).remove(1).add(1).toArray()).toEqual([2, 3, 1]);
	});

	it('keeps relative order with filter', () => {
		expect(
			OrderedSet.of(1, 2, 3, 4)
				.filter((element) => element % 2 === 0)
				.toArray(),
		).toEqual([2, 4]);
	});

	it('exposes the configured indicator block size', () => {
		const context = OrderedSet.createContext<number>({
			indicatorBlockSizeBits: 3,
		});
		expect(context.indicatorBlockSizeBits).toBe(3);
	});
});
