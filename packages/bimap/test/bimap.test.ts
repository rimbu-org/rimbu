import { describe, expect, it } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';

import * as Entry from '@rimbu/base/entry';
import { BiMap } from '@rimbu/bimap';
import { Stream } from '@rimbu/stream';

function expectEqual(map: BiMap<number, string>, arr: [number, string][]) {
	expect(new Map(map)).toEqual(new Map(arr));
}

describe('BiMap creators', () => {
	const arr3 = [
		[1, 'a'],
		[2, 'b'],
		[3, 'c'],
	] as ArrayNonEmpty<[number, string]>;

	const arr6 = [
		[1, 'a'],
		[2, 'b'],
		[3, 'c'],
		[4, 'd'],
		[5, 'e'],
		[6, 'f'],
	] as ArrayNonEmpty<[number, string]>;

	it('empty', () => {
		expect(BiMap.empty<number, string>()).toBe<any>(
			BiMap.empty<boolean, symbol>(),
		);
	});

	it('of', () => {
		expect(BiMap.of(...arr3).toArray()).toEqual(arr3);
		expectEqual(BiMap.of(...arr6), arr6);
		expect(BiMap.of([1, 'a'], [1, 'b']).toArray()).toEqual([[1, 'b']]);
	});

	it('from', () => {
		expect(BiMap.from(arr3).toArray()).toEqual(arr3);
		expectEqual(BiMap.from(arr6), arr6);
		expect(
			BiMap.from([
				[1, 'a'],
				[1, 'b'],
			]).toArray(),
		).toEqual([[1, 'b']]);
		expect(
			BiMap.from([
				[1, 'a'],
				[1, 'b'],
				[2, 'b'],
			]).toArray(),
		).toEqual([[2, 'b']]);

		expectEqual(BiMap.from([[1, 'a']], [[1, 'b']]), [[1, 'b']]);

		{
			const m = BiMap.from(arr3);
			expect(BiMap.from(m)).toBe(m);
		}
		{
			const c = BiMap.createContext();
			const m = c.of([1, 'a']);
			expect(BiMap.from(c.from(m))).not.toBe(m);
		}
	});

	it('reducer', () => {
		const source = Stream.of<readonly [number, string]>(
			[1, 'a'],
			[2, 'b'],
			[3, 'a'],
		);
		{
			const result = source.reduce(BiMap.reducer());
			expectEqual(result, [
				[2, 'b'],
				[3, 'a'],
			]);
		}

		{
			const result = source.reduce(
				BiMap.reducer([
					[4, 'b'],
					[5, 'q'],
				]),
			);
			expectEqual(result, [
				[2, 'b'],
				[3, 'a'],
				[5, 'q'],
			]);
		}
	});
});

describe('BiMap methods', () => {
	const arr3 = [
		[1, 'a'],
		[2, 'b'],
		[3, 'c'],
	] as ArrayNonEmpty<[number, string]>;

	const arr6 = [
		[1, 'a'],
		[2, 'b'],
		[3, 'c'],
		[4, 'd'],
		[5, 'e'],
		[6, 'f'],
	] as ArrayNonEmpty<[number, string]>;

	const mapEmpty = BiMap.empty<number, string>();
	const map3_1 = BiMap.from(arr3);
	const map6_1 = BiMap.from(arr6);

	it('iterator', () => {
		expect(new Map(mapEmpty)).toEqual(new Map());
		expect(new Map(map3_1)).toEqual(new Map(arr3));
		expect(new Map(map6_1)).toEqual(new Map(arr6));
	});

	it('addAll', () => {
		expect(mapEmpty.addAll(mapEmpty)).toBe(mapEmpty);
		expectEqual(mapEmpty.addAll(arr3), arr3);
		expectEqual(mapEmpty.addAll(arr6), arr6);

		expect(map3_1.addAll(mapEmpty)).toBe(map3_1);
		expectEqual(map3_1.addAll(arr3), arr3);
		expectEqual(map3_1.addAll(arr6), arr6);

		expect(map6_1.addAll(mapEmpty)).toBe(map6_1);
		expectEqual(map6_1.addAll(arr3), arr6);
		expectEqual(map6_1.addAll(arr6), arr6);
	});

	it('add', () => {
		expect(mapEmpty.add([1, 'a']).toArray()).toEqual([[1, 'a']]);
		expect(mapEmpty.add([1, 'a']).add([1, 'b']).toArray()).toEqual([[1, 'b']]);

		expect(map3_1.add([10, 'z']).get(10)).toBe('z');
		expect(map3_1.add([10, 'z']).size).toBe(4);

		expect(map6_1.add([10, 'z']).get(10)).toBe('z');
		expect(map6_1.add([10, 'z']).size).toBe(7);
	});

	it('asNormal', () => {
		expect(map3_1.asNormal()).toBe(map3_1);
		expect(map6_1.asNormal()).toBe(map6_1);
	});

	it('assumeNonEmpty', () => {
		expect(() => mapEmpty.assumeNonEmpty()).toThrow();
		expect(map3_1.assumeNonEmpty()).toBe(map3_1);
		expect(map6_1.assumeNonEmpty()).toBe(map6_1);
	});

	it('context', () => {
		const context = mapEmpty.context;

		expect(context.defaultContext).toBe(context);
		expect(map3_1.context).toBe(context);
		expect(map6_1.context).toBe(context);
	});

	it('filter', () => {
		function isEvenKey(entry: readonly [number, string]): boolean {
			return entry[0] % 2 === 0;
		}

		function first2(_entry: readonly [number, string], index: number): boolean {
			return index < 2;
		}

		expect(mapEmpty.filter(isEvenKey)).toBe(mapEmpty);
		expectEqual(map3_1.filter(isEvenKey), [[2, 'b']]);
		expectEqual(map3_1.filterIndexed(first2), [
			[1, 'a'],
			[2, 'b'],
		]);

		expectEqual(map6_1.filter(isEvenKey), [
			[2, 'b'],
			[4, 'd'],
			[6, 'f'],
		]);
		expect(map6_1.filterIndexed(first2).size).toBe(2);

		expect(mapEmpty.filter(isEvenKey, { negate: true })).toBe(mapEmpty);
		expectEqual(map3_1.filter(isEvenKey, { negate: true }), [
			[1, 'a'],
			[3, 'c'],
		]);
		expectEqual(map3_1.filterIndexed(first2, { negate: true }), [[3, 'c']]);

		expectEqual(map6_1.filter(isEvenKey, { negate: true }), [
			[1, 'a'],
			[3, 'c'],
			[5, 'e'],
		]);
		expect(map6_1.filterIndexed(first2, { negate: true }).size).toBe(4);
	});

	it('forEach', () => {
		let result = new Set<number>();

		mapEmpty.forEach((entry) => result.add(entry[0]));
		expect(result).toEqual(new Set());

		result = new Set();
		map3_1.forEach((entry) => result.add(entry[0]));
		expect(result).toEqual(new Set([1, 2, 3]));

		result = new Set();
		map6_1.forEach((entry) => result.add(entry[0]));
		expect(result).toEqual(new Set([1, 2, 3, 4, 5, 6]));
	});

	it('getKey', () => {
		expect(mapEmpty.getKey('b')).toBe(undefined);
		expect(mapEmpty.getKey('b', 'z')).toBe('z');
		expect(mapEmpty.getKey('b', () => 'z')).toBe('z');

		expect(map3_1.getKey('b')).toBe(2);
		expect(map3_1.getKey('b', 'z')).toBe(2);
		expect(map3_1.getKey('z')).toBe(undefined);
		expect(map3_1.getKey('z', 'o')).toBe('o');

		expect(map6_1.getKey('b')).toBe(2);
		expect(map6_1.getKey('b', 'z')).toBe(2);
		expect(map6_1.getKey('z')).toBe(undefined);
		expect(map6_1.getKey('z', 'o')).toBe('o');
	});

	it('get', () => {
		expect(mapEmpty.get(2)).toBe(undefined);
		expect(mapEmpty.get(2, 'z')).toBe('z');
		expect(mapEmpty.get(2, () => 'z')).toBe('z');

		expect(map3_1.get(2)).toBe('b');
		expect(map3_1.get(2, 'z')).toBe('b');
		expect(map3_1.get(10)).toBe(undefined);
		expect(map3_1.get(10, 'z')).toBe('z');

		expect(map6_1.get(2)).toBe('b');
		expect(map6_1.get(2, 'z')).toBe('b');
		expect(map6_1.get(10)).toBe(undefined);
		expect(map6_1.get(10, 'z')).toBe('z');
	});

	it('has', () => {
		expect(mapEmpty.has(2)).toBe(false);

		expect(map3_1.has(2)).toBe(true);
		expect(map3_1.has(10)).toBe(false);

		expect(map6_1.has(2)).toBe(true);
		expect(map6_1.has(10)).toBe(false);
	});

	it('hasValue', () => {
		expect(mapEmpty.hasValue('b')).toBe(false);

		expect(map3_1.hasValue('b')).toBe(true);
		expect(map3_1.hasValue('z')).toBe(false);

		expect(map6_1.hasValue('b')).toBe(true);
		expect(map6_1.hasValue('z')).toBe(false);
	});

	it('invert', () => {
		expect(mapEmpty.invert().size).toBe(0);

		const inv = map3_1.invert();
		expect(inv.size).toBe(3);
		expect(inv.get('b')).toBe(2);
		expect(inv.getKey(2)).toBe('b');
		expect(new Map(inv)).toEqual(
			new Map(arr3.map(([key, value]) => [value, key])),
		);
	});

	it('isEmpty', () => {
		expect(mapEmpty.isEmpty).toBe(true);
		expect(map3_1.isEmpty).toBe(false);
		expect(map6_1.isEmpty).toBe(false);
	});

	it('keyValueMap', () => {
		expect(mapEmpty.keyValueMap).toBe(mapEmpty.context.keyValueContext.empty());
		expect(map3_1.keyValueMap.size).toBe(3);
		expect(map6_1.keyValueMap.size).toBe(6);
	});

	it('nonEmpty', () => {
		expect(mapEmpty.nonEmpty()).toBe(false);
		expect(map3_1.nonEmpty()).toBe(true);
		expect(map6_1.nonEmpty()).toBe(true);
	});

	it('removeKey', () => {
		expect(mapEmpty.removeKey(2)).toBe(mapEmpty);
		expect(map3_1.removeKey(2).get(2)).toBe(undefined);
		expect(map3_1.removeKey(10)).toBe(map3_1);
		expect(map6_1.removeKey(2).get(2)).toBe(undefined);
		expect(map6_1.removeKey(10)).toBe(map6_1);
	});

	it('removeKeyAndReturn', () => {
		const emptyResult = mapEmpty.removeKeyAndReturn(2);
		expect(emptyResult.hasResult).toBe(false);
		expect(emptyResult.collection).toBe(mapEmpty);

		const r1 = map3_1.removeKeyAndReturn(2);
		expect(r1.hasResult).toBe(true);
		expect(r1.collection.size).toBe(2);
		expect(r1.result).toBe('b');

		const r1Absent = map3_1.removeKeyAndReturn(10);
		expect(r1Absent.hasResult).toBe(false);
		expect(r1Absent.collection).toBe(map3_1);

		const r2 = map6_1.removeKeyAndReturn(2);
		expect(r2.hasResult).toBe(true);
		expect(r2.collection.size).toBe(5);
		expect(r2.result).toBe('b');

		const r2Absent = map6_1.removeKeyAndReturn(10);
		expect(r2Absent.hasResult).toBe(false);
		expect(r2Absent.collection).toBe(map6_1);
	});

	it('removeKeys', () => {
		expect(mapEmpty.removeKeys([10, 11])).toBe(mapEmpty);

		expect(map3_1.removeKeys([10])).toBe(map3_1);
		expect(map3_1.removeKeys([1, 3, 10]).size).toBe(1);
		expect(map3_1.removeKeys([1, 3, 10]).get(2)).toBe('b');
		expect(map3_1.removeKeys([1, 3, 10]).get(1)).toBe(undefined);

		expect(map6_1.removeKeys([10])).toBe(map6_1);
		expect(map6_1.removeKeys([1, 3, 10]).size).toBe(4);
		expect(map6_1.removeKeys([1, 3, 10]).get(2)).toBe('b');
		expect(map6_1.removeKeys([1, 3, 10]).get(1)).toBe(undefined);
	});

	it('removeValue', () => {
		expect(mapEmpty.removeValue('b')).toBe(mapEmpty);
		expect(map3_1.removeValue('b').get(2)).toBe(undefined);
		expect(map3_1.removeValue('z')).toBe(map3_1);
		expect(map6_1.removeValue('b').get(2)).toBe(undefined);
		expect(map6_1.removeValue('z')).toBe(map6_1);
	});

	it('removeValueAndReturn', () => {
		const emptyResult = mapEmpty.removeValueAndReturn('b');
		expect(emptyResult.hasResult).toBe(false);
		expect(emptyResult.collection).toBe(mapEmpty);

		const r1 = map3_1.removeValueAndReturn('b');
		expect(r1.hasResult).toBe(true);
		expect(r1.collection.size).toBe(2);
		expect(r1.result).toBe(2);

		const r1Absent = map3_1.removeValueAndReturn('z');
		expect(r1Absent.hasResult).toBe(false);
		expect(r1Absent.collection).toBe(map3_1);

		const r2 = map6_1.removeValueAndReturn('b');
		expect(r2.hasResult).toBe(true);
		expect(r2.collection.size).toBe(5);
		expect(r2.result).toBe(2);

		const r2Absent = map6_1.removeValueAndReturn('z');
		expect(r2Absent.hasResult).toBe(false);
		expect(r2Absent.collection).toBe(map6_1);
	});

	it('updateAtKeyAndReturn', () => {
		const absent = map3_1.updateAtKeyAndReturn(10, (v) => v + '!');
		expect(absent.hasResult).toBe(false);
		expect(absent.collection).toBe(map3_1);

		const r = map3_1.updateAtKeyAndReturn(2, (v) => v + '!');
		expect(r.hasResult).toBe(true);
		expect(r.collection.get(2)).toBe('b!');
		expect(r.result).toEqual(['b', 'b!']);

		const noop = map3_1.updateAtKeyAndReturn(2, (v) => v);
		expect(noop.hasResult).toBe(true);
		expect(noop.result).toEqual(['b', 'b']);
		expect(noop.collection).toBe(map3_1);
	});

	it('updateAtValueAndReturn', () => {
		const absent = map3_1.updateAtValueAndReturn((k) => k + 1, 'z');
		expect(absent.hasResult).toBe(false);
		expect(absent.collection).toBe(map3_1);

		const r = map3_1.updateAtValueAndReturn((k) => k + 10, 'b');
		expect(r.hasResult).toBe(true);
		expect(r.collection.getKey('b')).toBe(12);
		expect(r.result).toEqual([2, 12]);

		const noop = map3_1.updateAtValueAndReturn((k) => k, 'b');
		expect(noop.hasResult).toBe(true);
		expect(noop.result).toEqual([2, 2]);
		expect(noop.collection).toBe(map3_1);
	});

	it('removeValues', () => {
		expect(mapEmpty.removeValues(['y', 'z'])).toBe(mapEmpty);

		expect(map3_1.removeValues(['z'])).toBe(map3_1);
		expect(map3_1.removeValues(['a', 'c', 'z']).size).toBe(1);
		expect(map3_1.removeValues(['a', 'c', 'z']).get(2)).toBe('b');
		expect(map3_1.removeValues(['a', 'c', 'z']).get(1)).toBe(undefined);

		expect(map6_1.removeValues(['z'])).toBe(map6_1);
		expect(map6_1.removeValues(['a', 'c', 'z']).size).toBe(4);
		expect(map6_1.removeValues(['a', 'c', 'z']).get(2)).toBe('b');
		expect(map6_1.removeValues(['a', 'c', 'z']).get(1)).toBe(undefined);
	});

	it('mapValues', () => {
		expect(mapEmpty.mapValues((v) => v).size).toBe(0);

		expectEqual(
			map3_1.mapValues((v) => v.toUpperCase()),
			[
				[1, 'A'],
				[2, 'B'],
				[3, 'C'],
			],
		);
	});

	it('set', () => {
		expect(mapEmpty.set(1, 'a').get(1)).toBe('a');

		expect(map3_1.set(10, 'z').get(10)).toBe('z');
		expect(map3_1.set(2, 'z').get(2)).toBe('z');

		expect(map6_1.set(10, 'z').get(10)).toBe('z');
		expect(map6_1.set(2, 'z').get(2)).toBe('z');
	});

	it('setAndReturn', () => {
		expect(mapEmpty.setAndReturn(1, 'a').collection.get(1)).toBe('a');
		expect(mapEmpty.setAndReturn(1, 'a').result).toBe(undefined);

		// key present, value absent -> previous entry at key is displaced
		const r1 = map3_1.setAndReturn(2, 'z');
		expect(r1.collection.get(2)).toBe('z');
		expect(r1.result).toEqual([2, 'b']);

		// key absent, value present -> previous entry bound to value is displaced
		const r2 = map3_1.setAndReturn(10, 'b');
		expect(r2.collection.get(10)).toBe('b');
		expect(r2.result).toEqual([2, 'b']);

		// key and value both present, mapped to different entries -> previous entry at key displaced
		const r3 = map3_1.setAndReturn(1, 'b');
		expect(r3.collection.get(1)).toBe('b');
		expect(r3.result).toEqual([1, 'a']);
		expect(r3.collection.getKey('b')).toBe(1);
		expect(r3.collection.has(2)).toBe(false);

		// no-op when identical entry: entry is present, collection unchanged
		const r4 = map3_1.setAndReturn(2, 'b');
		expect(r4.collection).toBe(map3_1);
		expect(r4.hasResult).toBe(true);
		expect(r4.result).toEqual([2, 'b']);
	});

	it('addAndReturn', () => {
		expect(mapEmpty.addAndReturn([1, 'a']).collection.toArray()).toEqual([
			[1, 'a'],
		]);
		expect(mapEmpty.addAndReturn([1, 'a']).result).toBe(undefined);

		const r1 = map3_1.addAndReturn([2, 'z']);
		expect(r1.collection.get(2)).toBe('z');
		expect(r1.result).toEqual([2, 'b']);

		const r2 = map3_1.addAndReturn([10, 'b']);
		expect(r2.collection.get(10)).toBe('b');
		expect(r2.result).toEqual([2, 'b']);

		const r3 = map3_1.addAndReturn([2, 'b']);
		expect(r3.collection).toBe(map3_1);
		expect(r3.hasResult).toBe(true);
		expect(r3.result).toEqual([2, 'b']);
	});

	it('removeEntries', () => {
		expect(mapEmpty.removeEntries([[1, 'a']])).toBe(mapEmpty);

		// single-entry removal matches the key and the value
		expect(map3_1.removeEntries([[2, 'b']]).toArray()).toEqual([
			[1, 'a'],
			[3, 'c'],
		]);
		expect(map3_1.removeEntries([[2, 'b']]).getKey('b')).toBe(undefined);
		// key present but value does not match -> unchanged
		expect(map3_1.removeEntries([[2, 'c']])).toBe(map3_1);
		// key not present -> unchanged
		expect(map3_1.removeEntries([[10, 'b']])).toBe(map3_1);

		// multiple entries
		expect(
			map6_1.removeEntries([
				[2, 'b'],
				[4, 'd'],
			]).size,
		).toBe(4);
	});

	it('removeEntry', () => {
		expect(mapEmpty.removeEntry([1, 'a'])).toBe(mapEmpty);

		expect(map3_1.removeEntry([2, 'b']).toArray()).toEqual([
			[1, 'a'],
			[3, 'c'],
		]);
		// key present but value does not match -> unchanged
		expect(map3_1.removeEntry([2, 'c'])).toBe(map3_1);
		// key not present -> unchanged
		expect(map3_1.removeEntry([10, 'b'])).toBe(map3_1);
	});

	it('size', () => {
		expect(mapEmpty.size).toBe(0);
		expect(map3_1.size).toBe(3);
		expect(map6_1.size).toBe(6);
	});

	it('stream', () => {
		expect(mapEmpty.stream()).toBe(Stream.empty());
		expect(new Map(map3_1.stream())).toEqual(new Map(arr3));
		expect(new Map(map6_1.stream())).toEqual(new Map(arr6));
	});

	it('streamKeys', () => {
		expect(mapEmpty.streamKeys()).toBe(Stream.empty());
		expect(new Set(map3_1.streamKeys())).toEqual(
			new Set(arr3.map(Entry.first)),
		);
		expect(new Set(map6_1.streamKeys())).toEqual(
			new Set(arr6.map(Entry.first)),
		);
	});

	it('streamValues', () => {
		expect(mapEmpty.streamValues()).toBe(Stream.empty());
		expect(new Set(map3_1.streamValues())).toEqual(
			new Set(arr3.map(Entry.second)),
		);
		expect(new Set(map6_1.streamValues())).toEqual(
			new Set(arr6.map(Entry.second)),
		);
	});

	it('toArray', () => {
		expect(mapEmpty.toArray()).toEqual([]);
		expect(new Map(map3_1.toArray())).toEqual(new Map(arr3));
		expect(new Map(map6_1.toArray())).toEqual(new Map(arr6));
	});

	it('toBuilder', () => {
		expect(mapEmpty.toBuilder().build()).toBe(mapEmpty);
		expect(map3_1.toBuilder().build()).toBe(map3_1);
		expect(map6_1.toBuilder().build()).toBe(map6_1);

		{
			const b = mapEmpty.toBuilder();
			expect(b.isEmpty).toBe(true);
		}
		{
			const b = map3_1.toBuilder();
			expect(b.get(2)).toBe('b');
			expect(b.get(10)).toBe(undefined);
		}
		{
			const b = map6_1.toBuilder();
			expect(b.get(2)).toBe('b');
			expect(b.get(10)).toBe(undefined);
		}
	});

	it('toString', () => {
		expect(mapEmpty.toString()).toBe(`BiMap()`);
		expect(map3_1.toString()).toBe(`BiMap(1 <-> a, 2 <-> b, 3 <-> c)`);
	});

	it('updateAtValue', () => {
		expect(mapEmpty.updateAtValue(() => 10, 'b')).toBe(mapEmpty);
		expect(mapEmpty.updateAtValue((v) => v + v, 'b')).toBe(mapEmpty);

		expect(map3_1.updateAtValue(() => 10, 'b').getKey('b')).toBe(10);
		expect(map3_1.updateAtValue((v) => v + v, 'b').getKey('b')).toBe(4);
		expect(map3_1.updateAtValue(() => 10, 'z')).toBe(map3_1);

		expect(map6_1.updateAtValue(() => 10, 'b').getKey('b')).toBe(10);
		expect(map6_1.updateAtValue((v) => v + v, 'b').getKey('b')).toBe(4);
		expect(map6_1.updateAtValue(() => 10, 'z')).toBe(map6_1);
	});

	it('updateAtKey', () => {
		expect(mapEmpty.updateAtKey(2, () => 'z')).toBe(mapEmpty);
		expect(mapEmpty.updateAtKey(2, (v) => v + v)).toBe(mapEmpty);

		expect(map3_1.updateAtKey(2, () => 'z').get(2)).toBe('z');
		expect(map3_1.updateAtKey(2, (v) => v + v).get(2)).toBe('bb');
		expect(map3_1.updateAtKey(10, () => 'z')).toBe(map3_1);

		expect(map6_1.updateAtKey(2, () => 'z').get(2)).toBe('z');
		expect(map6_1.updateAtKey(2, (v) => v + v).get(2)).toBe('bb');
		expect(map6_1.updateAtKey(10, () => 'z')).toBe(map6_1);
	});
});

describe('BiMap.Builder', () => {
	const arr3 = [
		[1, 'a'],
		[2, 'b'],
		[3, 'c'],
	] as ArrayNonEmpty<[number, string]>;

	function forEachBuilder(f: (builder: BiMap.Builder<number, string>) => void) {
		const b1 = BiMap.from(arr3).toBuilder();
		const b2 = BiMap.builder<number, string>();
		b2.addAll(arr3);

		f(b1);
		f(b2);
	}

	it('addAll', () => {
		const b = BiMap.builder<number, string>();
		expect(b.size).toBe(0);
		expect(b.addAll(arr3)).toBe(true);
		expect(b.size).toBe(3);
		expect(b.addAll(arr3)).toBe(false);
		expect(b.size).toBe(3);
	});

	it('add', () => {
		const b = BiMap.builder<number, string>();
		expect(b.size).toBe(0);
		expect(b.add([1, 'a'])).toBe(true);
		expect(b.size).toBe(1);
		expect(b.add([2, 'b'])).toBe(true);
		expect(b.size).toBe(2);
		expect(b.add([2, 'c'])).toBe(true);
		expect(b.size).toBe(2);
		expect(b.add([2, 'c'])).toBe(false);
		expect(b.size).toBe(2);
	});

	it('build', () => {
		const b = BiMap.builder<number, string>();
		expect(b.build()).toBe(BiMap.empty());
		b.addAll(arr3);
		expect(b.build().size).toBe(3);
		expect(b.build().get(2)).toBe('b');
	});

	it('removeEntries', () => {
		const b = BiMap.builder<number, string>();
		expect(b.removeEntries([[1, 'a']])).toBe(false);
		b.addAll(arr3);
		expect(b.removeEntries([[2, 'b']])).toBe(true);
		expect(b.build().get(2)).toBe(undefined);
		expect(b.removeEntries([[1, 'c']])).toBe(false);
		expect(b.removeEntries([[10, 'a']])).toBe(false);
		expect(b.build().size).toBe(2);
	});

	it('removeEntry', () => {
		const b = BiMap.builder<number, string>();
		expect(b.removeEntry([1, 'a'])).toBe(false);
		b.addAll(arr3);
		expect(b.removeEntry([2, 'b'])).toBe(true);
		expect(b.build().get(2)).toBe(undefined);
		expect(b.removeEntry([1, 'c'])).toBe(false);
		expect(b.removeEntry([10, 'a'])).toBe(false);
		expect(b.build().size).toBe(2);
	});

	it('forEach', () => {
		{
			const b = BiMap.builder<number, string>();

			const result = new Set<number>();

			b.forEach((entry) => result.add(entry[0]));
			expect(result).toEqual(new Set());
		}

		forEachBuilder((b) => {
			const result = new Set<number>();

			b.forEach((entry) => result.add(entry[0]));
			expect(result).toEqual(new Set([1, 2, 3]));
		});
	});

	it('operations throw in forEach when modifying collection', () => {
		forEachBuilder((b) => {
			expect(() => b.forEach(() => b.addAll([[1, 'a']]))).toThrow();
			expect(() => b.forEach(() => b.add([1, 'a']))).toThrow();
			expect(() => b.forEach(() => b.removeKey(1))).toThrow();
			expect(() => b.forEach(() => b.removeKeys([1]))).toThrow();
			expect(() => b.forEach(() => b.set(1, 'a'))).toThrow();
		});
	});

	it('getKey', () => {
		forEachBuilder((b) => {
			expect(b.getKey('b')).toBe(2);
			expect(b.getKey('b', 'z')).toBe(2);
			expect(b.getKey('z')).toBe(undefined);
			expect(b.getKey('z', 'y')).toBe('y');
			expect(b.getKey('z', () => 'y')).toBe('y');
		});
	});

	it('get', () => {
		forEachBuilder((b) => {
			expect(b.get(2)).toBe('b');
			expect(b.get(2, 'z')).toBe('b');
			expect(b.get(10)).toBe(undefined);
			expect(b.get(10, 'z')).toBe('z');
			expect(b.get(10, () => 'z')).toBe('z');
		});
	});

	it('has', () => {
		forEachBuilder((b) => {
			expect(b.has(2)).toBe(true);
			expect(b.has(10)).toBe(false);
		});
	});

	it('hasValue', () => {
		forEachBuilder((b) => {
			expect(b.hasValue('b')).toBe(true);
			expect(b.hasValue('z')).toBe(false);
		});
	});

	it('isEmpty', () => {
		const b = BiMap.builder<number, string>();

		expect(b.isEmpty).toBe(true);
		b.set(1, 'a');
		expect(b.isEmpty).toBe(false);
	});

	it('removeKey', () => {
		forEachBuilder((b) => {
			expect(b.removeKey(10)).toBe(undefined);
			expect(b.removeKey(10, 'z')).toBe('z');
			expect(b.removeKey(2)).toBe('b');
			expect(b.removeKey(3, 'z')).toBe('c');
			expect(b.size).toBe(1);
		});
	});

	it('removeKeys', () => {
		forEachBuilder((b) => {
			expect(b.removeKeys([10])).toBe(false);
			expect(b.removeKeys([2])).toBe(true);
			expect(b.size).toBe(2);
		});
	});

	it('removeValue', () => {
		forEachBuilder((b) => {
			expect(b.removeValue('z')).toBe(undefined);
			expect(b.removeValue('z', 'y')).toBe('y');
			expect(b.removeValue('b')).toBe(2);
			expect(b.removeValue('c', 'y')).toBe(3);
			expect(b.size).toBe(1);
		});
	});

	it('removeValues', () => {
		forEachBuilder((b) => {
			expect(b.removeValues(['z'])).toBe(false);
			expect(b.removeValues(['b'])).toBe(true);
			expect(b.size).toBe(2);
		});
	});

	it('set', () => {
		forEachBuilder((b) => {
			expect(b.set(2, 'a')).toBe(true);
			expect(b.set(2, 'a')).toBe(false);
			expect(b.set(10, 'a')).toBe(true);
			expect(b.size).toBe(2);
		});
	});

	it('size', () => {
		forEachBuilder((b) => {
			expect(b.size).toBe(3);
		});
	});
});
