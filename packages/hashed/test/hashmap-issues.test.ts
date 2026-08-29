import { describe, expect, it } from 'bun:test';

import { HashMap } from '@rimbu/hashed/map';

describe('HashMap issues fixed by PRs', () => {
	it('issue #186: HashMap "forgets" about colliding keys, unlike HashSet', () => {
		const hm = HashMap.from([
			[[6, 29], 'a'],
			[[2, 91], 'b'],
		]);
		expect(hm.has([6, 29])).toBe(true);
		expect(hm.has([2, 91])).toBe(true);
		expect(hm.get([6, 29])).toBe('a');
		expect(
			hm.modifyAtKey([6, 29], { ifExists: { set: 'g' } }).get([6, 29]),
		).toBe('g');
		expect(hm.removeKey([6, 29]).size).toBe(1);

		const hm2 = HashMap.from([
			[[6, 30], 'a'],
			[[2, 91], 'b'],
		]);
		expect(hm2.has([6, 30])).toBe(true);
		expect(hm2.has([2, 91])).toBe(true);
		expect(hm2.get([6, 30])).toBe('a');
		expect(
			hm2.modifyAtKey([6, 30], { ifExists: { set: 'g' } }).get([6, 30]),
		).toBe('g');
		expect(hm2.removeKey([6, 30]).size).toBe(1);

		const hm3 = HashMap.from([
			[[6, 29], 'c'],
			[[2, 91], 'd'],
		]);
		expect(hm3.has([6, 29])).toBe(true);
		expect(hm3.has([2, 91])).toBe(true);
		expect(hm3.get([6, 29])).toBe('c');
		expect(
			hm3.modifyAtKey([6, 29], { ifExists: { set: 'g' } }).get([6, 29]),
		).toBe('g');
		expect(hm3.removeKey([6, 29]).size).toBe(1);
	});

	it('issue #186 for builder: HashMap "forgets" about colliding keys, unlike HashSet', () => {
		const hm = HashMap.builder<[number, number], string>();
		hm.addAll([
			[[6, 29], 'a'],
			[[2, 91], 'b'],
		]);
		expect(hm.has([6, 29])).toBe(true);
		expect(hm.has([2, 91])).toBe(true);
		expect(hm.get([6, 29])).toBe('a');

		hm.modifyAtKey([6, 29], { ifExists: { set: 'g' } });
		expect(hm.get([6, 29])).toBe('g');
		hm.removeKey([6, 29]);

		expect(hm.size).toBe(1);
	});
});
