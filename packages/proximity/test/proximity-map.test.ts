import { describe, expect, it } from 'bun:test';

import type { DistanceFunction } from '@rimbu/proximity/distance-function';

import { ProximityMap } from '@rimbu/proximity';

const numericDistance: DistanceFunction<number> = (one, another) =>
	Math.abs(one - another);

const numericContext = ProximityMap.createContext<number>({
	distanceFunction: numericDistance,
});

const numericMap = numericContext.keyedContext.of<number, string>(
	[10, 'low'],
	[20, 'medium'],
	[30, 'high'],
);

describe('ProximityMap exact vs nearest lookup', () => {
	it('get and has are exact-key', () => {
		expect(numericMap.get(20)).toBe('medium');
		expect(numericMap.get(15)).toBeUndefined();
		expect(numericMap.get(15, 'none')).toBe('none');
		expect(numericMap.has(20)).toBe(true);
		expect(numericMap.has(15)).toBe(false);
	});

	it('getNearest returns the closest value', () => {
		expect(numericMap.getNearest(18)).toBe('medium');
		expect(numericMap.getNearest(27)).toBe('high');
		expect(numericMap.getNearest(10)).toBe('low');
	});

	it('getNearest falls back when no finite distance exists', () => {
		const exactMap = ProximityMap.of<number, string>([1, 'a']);

		expect(exactMap.getNearest(2)).toBeUndefined();
		expect(exactMap.getNearest(2, 'none')).toBe('none');
	});

	it('getNearestMatch exposes the matched key, value and distance', () => {
		expect(numericMap.getNearestMatch(18)).toEqual({
			key: 20,
			value: 'medium',
			distance: 2,
		});
		expect(numericMap.getNearestMatch(10)).toEqual({
			key: 10,
			value: 'low',
			distance: 0,
		});
	});

	it('getNearestMatch falls back when no finite distance exists', () => {
		const exactMap = ProximityMap.of<number, string>([1, 'a']);

		expect(exactMap.getNearestMatch(2)).toBeUndefined();
		expect(exactMap.getNearestMatch(2, 'none')).toBe('none');
	});

	it('mutations remain exact-key', () => {
		const removed = numericMap.removeKey(20);

		expect(removed.has(20)).toBe(false);
		expect(removed.getNearest(18)).toBe('low');
		expect(numericMap.has(20)).toBe(true);
	});
});

describe('ProximityMap builder lookup consistency', () => {
	it('builder get is exact and getNearest scans its contents', () => {
		const builder = numericMap.toBuilder();

		expect(builder.get(15)).toBeUndefined();
		expect(builder.getNearest(18)).toBe('medium');
		expect(builder.getNearestMatch(18)).toEqual({
			key: 20,
			value: 'medium',
			distance: 2,
		});
	});

	it('builder nearest reflects mutations', () => {
		const builder = numericMap.toBuilder();
		builder.removeKey(20);

		expect(builder.getNearest(18)).toBe('low');
		expect(builder.getNearestMatch(18)).toEqual({
			key: 10,
			value: 'low',
			distance: 8,
		});
	});

	it('builder built from a source and mutated stays consistent', () => {
		const builder = numericMap.toBuilder();
		builder.set(5, 'very-low');

		expect(builder.getNearest(6)).toBe('very-low');
		expect(builder.build().getNearest(6)).toBe('very-low');
	});
});
