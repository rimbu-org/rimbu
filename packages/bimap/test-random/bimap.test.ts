import { describe, expect, it } from 'bun:test';

import { BiMap } from '@rimbu/bimap';

/**
 * Deterministic linear congruential generator. Inlined so the suite has no
 * external dependency and produces the same sequence on every run.
 */
function createRng(seed: number): () => number {
	let state = seed >>> 0;

	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 0x100000000;
	};
}

/**
 * Asserts the 1-to-1 invariant: keys and values are unique, both delegate maps
 * have the same size as the map itself, and they agree with `get`/`getKey`.
 */
function checkInvariant(map: BiMap<number, number>): void {
	expect(map.keyValueMap.size).toBe(map.size);
	expect(map.valueKeyMap.size).toBe(map.size);

	const seenKeys = new Set<number>();
	const seenValues = new Set<number>();

	for (const [key, value] of map) {
		expect(seenKeys.has(key)).toBe(false);
		expect(seenValues.has(value)).toBe(false);

		seenKeys.add(key);
		seenValues.add(value);

		expect(map.get(key)).toBe(value);
		expect(map.getKey(value)).toBe(key);
		expect(map.has(key)).toBe(true);
		expect(map.hasValue(value)).toBe(true);
	}

	expect(seenKeys.size).toBe(map.size);
	expect(seenValues.size).toBe(map.size);

	for (const [key, value] of map.keyValueMap) {
		expect(map.get(key)).toBe(value);
	}

	for (const [value, key] of map.valueKeyMap) {
		expect(map.getKey(value)).toBe(key);
	}
}

describe('BiMap random', () => {
	it('holds the 1-to-1 invariant across random add/remove operations', () => {
		const rng = createRng(0x5eed1234);
		let map: BiMap<number, number> = BiMap.empty<number, number>();

		const keySpace = 8;
		const valueSpace = 8;
		const operations = 3000;

		for (let i = 0; i < operations; i++) {
			const op = Math.floor(rng() * 4);
			const key = Math.floor(rng() * keySpace);
			const value = Math.floor(rng() * valueSpace);

			if (op === 0) {
				map = map.add([key, value]);
			} else if (op === 1) {
				map = map.removeKey(key);
			} else if (op === 2) {
				map = map.removeValue(value);
			} else {
				map = map.removeEntries([[key, value]]);
			}

			checkInvariant(map);
		}
	});

	it('round-trips invert().invert()', () => {
		const rng = createRng(0xc0ffee);
		let map: BiMap<number, number> = BiMap.empty<number, number>();

		for (let i = 0; i < 500; i++) {
			const key = Math.floor(rng() * 12);
			const value = Math.floor(rng() * 12);
			map = map.add([key, value]);
		}

		const doubleInverted = map.invert().invert();

		expect(new Map(doubleInverted)).toEqual(new Map(map));
		checkInvariant(doubleInverted);
	});

	it('keeps keyValueMap/valueKeyMap consistent with get/getKey', () => {
		const rng = createRng(0xabcdef);
		let map: BiMap<number, number> = BiMap.empty<number, number>();

		for (let i = 0; i < 500; i++) {
			const key = Math.floor(rng() * 12);
			const value = Math.floor(rng() * 12);
			map = map.add([key, value]);
		}

		const keyValueMap = map.keyValueMap;
		const valueKeyMap = map.valueKeyMap;

		expect(keyValueMap.size).toBe(valueKeyMap.size);

		for (const [key, value] of keyValueMap) {
			expect(map.get(key)).toBe(value);
			expect(map.getKey(value)).toBe(key);
			expect(valueKeyMap.get(value)).toBe(key);
		}
	});
});
