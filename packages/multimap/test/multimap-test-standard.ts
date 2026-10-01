import { describe, expect, it } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { MultiMap } from '@rimbu/multimap';

import * as Entry from '@rimbu/base/entry';
import { HashMultiMapHashValue } from '@rimbu/multimap/hash-key/hash-value';
import { Stream, type Streamable } from '@rimbu/stream';

function expectEqual<K, V>(map: Streamable<readonly [K, V]>, arr: [K, V][]) {
	expect(new Set(map.stream())).toEqual(new Set(arr));
}

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

const arrDouble = [
	[1, 'a'],
	[2, 'a'],
	[1, 'b'],
	[2, 'b'],
] as ArrayNonEmpty<[number, string]>;

export function runMultiMapTestsWith(
	name: string,
	MM: MultiMap.Context<any, any>,
) {
	describe(`${name} creators`, () => {
		it('empty', () => {
			expect(MM.empty<readonly [number, string]>()).toBe<any>(MM.empty<readonly [boolean, symbol]>());
		});

		it('of', () => {
			expectEqual(MM.of(...arr3), arr3);
			expectEqual(MM.of(...arr6), arr6);
			expectEqual(MM.of(...arrDouble), arrDouble);
		});

		it('from', () => {
			expectEqual(MM.from(arr3), arr3);
			expectEqual(MM.from(arr6), arr6);
			expectEqual(MM.from(arrDouble), arrDouble);

			{
				const m = MM.from(arr3);
				expect(MM.from(m)).toBe(m);
			}
			{
				const c = HashMultiMapHashValue.createContext();
				const m = c.from(arr3);
				expect(MM.from(m)).not.toBe(m);
			}
		});

		it('builder', () => {
			const b = MM.builder<readonly [number, string]>();
			expect(b.size).toBe(0);
			b.addEach(arr6);
			expect(b.size).toBe(6);
		});

		it('reducer', () => {
			const source = Stream.of<[number, string]>([1, 'a'], [2, 'b'], [3, 'a']);
			{
				const result = source.reduce(MM.reducer());
				expectEqual(result, [
					[1, 'a'],
					[2, 'b'],
					[3, 'a'],
				]);
			}

			{
				const result = source.reduce(
					MM.reducer([
						[3, 'b'],
						[5, 'q'],
					]),
				);
				expectEqual(result, [
					[1, 'a'],
					[2, 'b'],
					[3, 'a'],
					[3, 'b'],
					[5, 'q'],
				]);
			}
		});
	});

	describe(`${name} methods`, () => {
		const mapEmpty = MM.empty<readonly [number, string]>();
		const map3_1 = MM.from(arr3);
		const map6_1 = MM.from(arr6);
		const mapDouble = MM.from(arrDouble);

		it('iterator', () => {
			expect(new Set(mapEmpty)).toEqual(new Set());
			expect(new Set(map3_1)).toEqual(new Set(arr3));
			expect(new Set(map6_1)).toEqual(new Set(arr6));
			expect(new Set(mapDouble)).toEqual(new Set(arrDouble));
		});

		it('addTo', () => {
			expectEqual(mapEmpty.addTo(1, 'a'), [[1, 'a']]);
			expectEqual(mapEmpty.addTo(1, 'a').addTo(1, 'b'), [
				[1, 'a'],
				[1, 'b'],
			]);
			expect(new Set(map3_1.addTo(1, 'z').getValues(1))).toEqual(
				new Set(['a', 'z']),
			);
			expect(new Set(mapDouble.addTo(1, 'z').getValues(1))).toEqual(
				new Set(['a', 'b', 'z']),
			);
		});

		it('addEach', () => {
			expect(mapEmpty.addEach(mapEmpty)).toBe(mapEmpty);
			expectEqual(mapEmpty.addEach(arr3), arr3);
			expectEqual(mapEmpty.addEach(arr6), arr6);
			expectEqual(mapEmpty.addEach(arrDouble), arrDouble);

			expect(map3_1.addEach(mapEmpty)).toBe(map3_1);
			expect(map3_1.addEach(arr3)).toBe(map3_1);
			expectEqual(map3_1.addEach(arr6), arr6);

			expect(map6_1.addEach(mapEmpty)).toBe(map6_1);
			expect(map6_1.addEach(arr3)).toBe(map6_1);
			expect(map6_1.addEach(arr6)).toBe(map6_1);
		});

		it('assumeNoneEmpty', () => {
			expect(() => mapEmpty.assumeNonEmpty()).toThrow();
			expect(map3_1.assumeNonEmpty()).toBe(map3_1);
			expect(map6_1.assumeNonEmpty()).toBe(map6_1);
		});

		it('asNormal', () => {
			expect(map3_1.asNormal()).toBe(map3_1);
			expect(map6_1.asNormal()).toBe(map6_1);
			expect(mapDouble.asNormal()).toBe(mapDouble);
		});

		it('context', () => {
			expect(mapEmpty.context).toBe(MM);
			expect(map3_1.context).toBe(MM);
			expect(map6_1.context).toBe(MM);
		});

		it('filter', () => {
			function isEvenKey(entry: readonly [number, string]): boolean {
				return entry[0] % 2 === 0;
			}

			// `filterIndexed` takes `(entry, index)` — it has no `halt`; to stop
			// early, return `false` for everything past the wanted prefix.
			function first2(
				_: readonly [number, string],
				index: number,
			): boolean {
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
		});

		it('recompose', () => {
			expect(
				mapEmpty.recompose((s) =>
					s.map(([k, v]) => [k, v] as [number, string]),
				),
			).toBe(mapEmpty);
			expectEqual(
				map3_1.recompose((s) =>
					s.map(([k, v]) => [k, v.toUpperCase()] as [number, string]),
				),
				[
					[1, 'A'],
					[2, 'B'],
					[3, 'C'],
				],
			);
			expectEqual(
				map6_1.recompose((s) => s.filter(([k]) => k % 2 === 0)),
				[
					[2, 'b'],
					[4, 'd'],
					[6, 'f'],
				],
			);
			expectEqual(
				map3_1.recompose((s) =>
					s.flatMap(
						([k, v]) =>
							[
								[k, v],
								[k, `${v}!`],
							] as [number, string][],
					),
				),
				[
					[1, 'a'],
					[1, 'a!'],
					[2, 'b'],
					[2, 'b!'],
					[3, 'c'],
					[3, 'c!'],
				],
			);
		});

		it('forEach', () => {
			let result = new Set<number>();

			mapEmpty.forEachIndexed((entry) => result.add(entry[0]));
			expect(result).toEqual(new Set());

			result = new Set();
			map3_1.forEachIndexed((entry) => result.add(entry[0]));
			expect(result).toEqual(new Set([1, 2, 3]));

			result = new Set();
			map6_1.forEachIndexed((entry) => result.add(entry[0]));
			expect(result).toEqual(new Set([1, 2, 3, 4, 5, 6]));
		});

		it('getValues', () => {
			expect(mapEmpty.getValues(2).toArray()).toEqual([]);
			expect(map3_1.getValues(2).toArray()).toEqual(['b']);
			expect(map6_1.getValues(2).toArray()).toEqual(['b']);
			expect(mapDouble.getValues(2).toArray()).toEqual(['a', 'b']);
		});

		it('hasEntry', () => {
			expect(mapEmpty.hasEntry(2, 'z')).toBe(false);

			expect(map3_1.hasEntry(2, 'z')).toBe(false);
			expect(map3_1.hasEntry(9, 'b')).toBe(false);
			expect(map3_1.hasEntry(2, 'b')).toBe(true);

			expect(map6_1.hasEntry(2, 'z')).toBe(false);
			expect(map6_1.hasEntry(9, 'b')).toBe(false);
			expect(map6_1.hasEntry(2, 'b')).toBe(true);

			expect(mapDouble.hasEntry(2, 'a')).toBe(true);
			expect(mapDouble.hasEntry(2, 'b')).toBe(true);
			expect(mapDouble.hasEntry(2, 'z')).toBe(false);
			expect(mapDouble.hasEntry(9, 'b')).toBe(false);
		});

		it('has', () => {
			expect(mapEmpty.has(2)).toBe(false);

			expect(map3_1.has(2)).toBe(true);
			expect(map3_1.has(9)).toBe(false);

			expect(map6_1.has(2)).toBe(true);
			expect(map6_1.has(9)).toBe(false);

			expect(mapDouble.has(2)).toBe(true);
			expect(mapDouble.has(9)).toBe(false);
		});

		it('isEmpty', () => {
			expect(mapEmpty.isEmpty).toBe(true);
			expect(map3_1.isEmpty).toBe(false);
			expect(map6_1.isEmpty).toBe(false);
		});

		it('keySize', () => {
			expect(mapEmpty.keySize).toBe(0);
			expect(map3_1.keySize).toBe(3);
			expect(map6_1.keySize).toBe(6);
			expect(mapDouble.keySize).toBe(2);
		});

		it('keyMap', () => {
			// The same object at runtime; the two properties have deliberately
			// different types (see `WithKeyMap`), so compare them as `unknown`.
			expect<unknown>(mapEmpty.keyMap.context).toBe<unknown>(
				mapEmpty.context.keyMapContext,
			);
			expect<unknown>(map3_1.keyMap.context).toBe<unknown>(
				map3_1.context.keyMapContext,
			);
			expect<unknown>(map6_1.keyMap.context).toBe<unknown>(
				map6_1.context.keyMapContext,
			);
		});

		it('nonEmpty', () => {
			expect(mapEmpty.nonEmpty()).toBe(false);
			expect(map3_1.nonEmpty()).toBe(true);
			expect(map6_1.nonEmpty()).toBe(true);
			expect(mapDouble.nonEmpty()).toBe(true);
		});

		it('modifyValuesAt', () => {
			expect(mapEmpty.modifyValuesAt(2, { ifExists: { update: (v) => v } })).toBe(
				mapEmpty,
			);
			expectEqual(mapEmpty.modifyValuesAt(2, { ifNew: { set: ['z'] } }), [[2, 'z']]);
			expectEqual(mapEmpty.modifyValuesAt(2, { ifNew: { create: () => ['z'] } }), [
				[2, 'z'],
			]);

			expect(map3_1.modifyValuesAt(2, { ifNew: { set: ['z'] } })).toBe(map3_1);
			expect(map3_1.modifyValuesAt(5, { ifExists: { update: () => ['z'] } })).toBe(
				map3_1,
			);
			expectEqual(
				map3_1.modifyValuesAt(2, { ifExists: { update: (v) => [...v, 'z'] } }),
				[
					[1, 'a'],
					[2, 'b'],
					[2, 'z'],
					[3, 'c'],
				],
			);
			expectEqual(map3_1.modifyValuesAt(2, { ifExists: { update: () => [] } }), [
				[1, 'a'],
				[3, 'c'],
			]);
			expectEqual(map3_1.modifyValuesAt(5, { ifNew: { set: ['z'] } }), [
				...arr3,
				[5, 'z'],
			]);
		});

		it('removeEntries', () => {
			expect(
				mapEmpty.removeEntries([
					[2, 'z'],
					[2, 'b'],
				]),
			).toBe(mapEmpty);
			expect(
				map3_1.removeEntries([
					[10, 'b'],
					[2, 'z'],
				]),
			).toBe(map3_1);
			expectEqual(
				map3_1.removeEntries([
					[2, 'z'],
					[2, 'b'],
				]),
				[
					[1, 'a'],
					[3, 'c'],
				],
			);
			expect(
				map6_1.removeEntries([
					[10, 'b'],
					[2, 'z'],
				]),
			).toBe(map6_1);
			expectEqual(
				map6_1.removeEntries([
					[2, 'z'],
					[2, 'b'],
				]),
				[
					[1, 'a'],
					[3, 'c'],
					[4, 'd'],
					[5, 'e'],
					[6, 'f'],
				],
			);
			expect(
				mapDouble.removeEntries([
					[10, 'a'],
					[2, 'z'],
				]),
			).toBe(mapDouble);
			expectEqual(
				mapDouble.removeEntries([
					[10, 'a'],
					[2, 'b'],
				]),
				[
					[1, 'a'],
					[1, 'b'],
					[2, 'a'],
				],
			);
		});

		it('removeEntry', () => {
			expect(mapEmpty.removeEntry(2, 'b')).toBe(mapEmpty);

			expect(map3_1.removeEntry(2, 'z')).toBe(map3_1);
			expectEqual(map3_1.removeEntry(2, 'b'), [
				[1, 'a'],
				[3, 'c'],
			]);

			expect(map6_1.removeEntry(2, 'z')).toBe(map6_1);
			expectEqual(map6_1.removeEntry(2, 'b'), [
				[1, 'a'],
				[3, 'c'],
				[4, 'd'],
				[5, 'e'],
				[6, 'f'],
			]);

			expect(mapDouble.removeEntry(2, 'z')).toBe(mapDouble);
			expectEqual(mapDouble.removeEntry(2, 'b'), [
				[1, 'a'],
				[1, 'b'],
				[2, 'a'],
			]);
		});

		it('removeKey', () => {
			expect(mapEmpty.removeKey(2)).toBe(mapEmpty);

			expect(map3_1.removeKey(9)).toBe(map3_1);
			expectEqual(map3_1.removeKey(2), [
				[1, 'a'],
				[3, 'c'],
			]);

			expect(map6_1.removeKey(9)).toBe(map6_1);
			expectEqual(map6_1.removeKey(2), [
				[1, 'a'],
				[3, 'c'],
				[4, 'd'],
				[5, 'e'],
				[6, 'f'],
			]);

			expect(mapDouble.removeKey(9)).toBe(mapDouble);
			expectEqual(mapDouble.removeKey(2), [
				[1, 'a'],
				[1, 'b'],
			]);
		});

		it('removeKeyAndReturn', () => {
			expect(mapEmpty.removeKeyAndReturn(2).hasResult).toBe(false);
			expect(map3_1.removeKeyAndReturn(10).hasResult).toBe(false);
			const r = map3_1.removeKeyAndReturn(2);
			expect(r.hasResult).toBe(true);
			if (!r.hasResult) throw new Error('expected a result');
			expect(r.hasChanged).toBe(true);
			expectEqual(r.collection, [
				[1, 'a'],
				[3, 'c'],
			]);
			expect(r.result.toArray()).toEqual(['b']);
		});

		it('removeKeys', () => {
			expect(mapEmpty.removeKeys([2, 10])).toBe(mapEmpty);

			expect(map3_1.removeKeys([9, 10])).toBe(map3_1);
			expectEqual(map3_1.removeKeys([2, 10]), [
				[1, 'a'],
				[3, 'c'],
			]);

			expect(map6_1.removeKeys([9, 10])).toBe(map6_1);
			expectEqual(map6_1.removeKeys([2, 10]), [
				[1, 'a'],
				[3, 'c'],
				[4, 'd'],
				[5, 'e'],
				[6, 'f'],
			]);

			expect(mapDouble.removeKeys([9, 10])).toBe(mapDouble);
			expectEqual(mapDouble.removeKeys([2]), [
				[1, 'a'],
				[1, 'b'],
			]);
		});

		it('setEachValue', () => {
			expect(mapEmpty.setEachValue(2, [])).toBe(mapEmpty);
			expectEqual(mapEmpty.setEachValue(2, ['b', 'c']), [
				[2, 'b'],
				[2, 'c'],
			]);
			expectEqual(map3_1.setEachValue(2, ['b']), arr3);
			expectEqual(map3_1.setEachValue(2, []), [
				[1, 'a'],
				[3, 'c'],
			]);
			expectEqual(map3_1.setEachValue(4, ['a']), [...arr3, [4, 'a']]);
			expectEqual(mapDouble.setEachValue(1, ['d']), [
				[1, 'd'],
				[2, 'a'],
				[2, 'b'],
			]);
		});

		it('addEachValue', () => {
			expect(mapEmpty.addEachValue(2, [])).toBe(mapEmpty);
			expectEqual(mapEmpty.addEachValue(2, ['b', 'c']), [
				[2, 'b'],
				[2, 'c'],
			]);
			expectEqual(map3_1.addEachValue(2, ['z']), [
				[1, 'a'],
				[2, 'b'],
				[2, 'z'],
				[3, 'c'],
			]);
			expectEqual(mapDouble.addEachValue(1, ['z']), [
				[1, 'a'],
				[1, 'b'],
				[1, 'z'],
				[2, 'a'],
				[2, 'b'],
			]);
		});

		it('count', () => {
			expect(mapEmpty.count(2)).toBe(0);
			expect(map3_1.count(2)).toBe(1);
			expect(map3_1.count(9)).toBe(0);
			expect(mapDouble.count(1)).toBe(2);
			expect(mapDouble.count(2)).toBe(2);
		});

		it('mapValues', () => {
			expectEqual(
				mapEmpty.mapValues((v) => v.toUpperCase()),
				[],
			);
			expectEqual(
				map3_1.mapValues((v) => v.toUpperCase()),
				[
					[1, 'A'],
					[2, 'B'],
					[3, 'C'],
				],
			);
			expectEqual(
				mapDouble.mapValues((v) => v.toUpperCase()),
				[
					[1, 'A'],
					[1, 'B'],
					[2, 'A'],
					[2, 'B'],
				],
			);
		});

		it('flatMapValues', () => {
			expectEqual(
				mapEmpty.flatMapValues((v) => [v, v.toUpperCase()]),
				[],
			);
			expectEqual(
				map3_1.flatMapValues((v) => [v, v.toUpperCase()]),
				[
					[1, 'a'],
					[1, 'A'],
					[2, 'b'],
					[2, 'B'],
					[3, 'c'],
					[3, 'C'],
				],
			);
			expectEqual(
				map3_1.flatMapValues(() => []),
				[],
			);
		});

		it('union', () => {
			expect(mapEmpty.union(mapEmpty)).toBe(mapEmpty);
			expectEqual(map3_1.union(mapEmpty), arr3);
			expectEqual(
				map3_1.union(HashMultiMapHashValue.of([1, 'z'], [3, 'd'], [5, 'e'])),
				[
					[1, 'a'],
					[1, 'z'],
					[2, 'b'],
					[3, 'c'],
					[3, 'd'],
					[5, 'e'],
				],
			);
		});

		it('intersection', () => {
			expect(mapEmpty.intersection(mapEmpty)).toBe(mapEmpty);
			expectEqual(map3_1.intersection(mapEmpty), []);
			expectEqual(
				mapDouble.intersection(HashMultiMapHashValue.of([1, 'a'], [2, 'b'])),
				[
					[1, 'a'],
					[2, 'b'],
				],
			);
		});

		it('difference', () => {
			expect(mapEmpty.difference(mapEmpty)).toBe(mapEmpty);
			expectEqual(map3_1.difference(mapEmpty), arr3);
			expectEqual(
				mapDouble.difference(HashMultiMapHashValue.of([1, 'b'], [2, 'a'])),
				[
					[1, 'a'],
					[2, 'b'],
				],
			);
		});

		it('symmetricDifference', () => {
			expect(mapEmpty.symmetricDifference(mapEmpty)).toBe(mapEmpty);
			expectEqual(map3_1.symmetricDifference(mapEmpty), arr3);
			expectEqual(
				mapDouble.symmetricDifference(
					HashMultiMapHashValue.of([1, 'b'], [2, 'a'], [3, 'z']),
				),
				[
					[1, 'a'],
					[2, 'b'],
					[3, 'z'],
				],
			);
		});

		it('size', () => {
			expect(mapEmpty.size).toBe(0);
			expect(map3_1.size).toBe(3);
			expect(map6_1.size).toBe(6);
			expect(mapDouble.size).toBe(4);
		});

		it('stream', () => {
			expect(mapEmpty.stream()).toBe(Stream.empty());
			expect(new Map(map3_1.stream())).toEqual(new Map(arr3));
			expect(new Map(map6_1.stream())).toEqual(new Map(arr6));
			expect(new Map(mapDouble.stream())).toEqual(new Map(arrDouble));
		});

		it('streamKeys', () => {
			expect(mapEmpty.streamKeys()).toBe(Stream.empty());
			expect(new Set(map3_1.streamKeys())).toEqual(
				new Set(arr3.map(Entry.first)),
			);
			expect(new Set(map6_1.streamKeys())).toEqual(
				new Set(arr6.map(Entry.first)),
			);
			expect(new Set(mapDouble.streamKeys())).toEqual(
				new Set(arrDouble.map(Entry.first)),
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
			expect(new Set(mapDouble.streamValues())).toEqual(
				new Set(arrDouble.map(Entry.second)),
			);
		});

		it('toArray', () => {
			expect(mapEmpty.toArray()).toEqual([]);
			expect(new Map(map3_1.toArray())).toEqual(new Map(arr3));
			expect(new Map(map6_1.toArray())).toEqual(new Map(arr6));
			expect(new Map(mapDouble.toArray())).toEqual(new Map(arrDouble));
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
				expect(b.getValues(2).toArray()).toEqual(['b']);
				expect(b.getValues(10).toArray()).toEqual([]);
			}
			{
				const b = map6_1.toBuilder();
				expect(b.getValues(2).toArray()).toEqual(['b']);
				expect(b.getValues(10).toArray()).toEqual([]);
			}
			{
				const b = mapDouble.toBuilder();
				expect(b.getValues(2).toArray()).toEqual(['a', 'b']);
				expect(b.getValues(10).toArray()).toEqual([]);
			}
		});

		it('toString', () => {
			expect(mapEmpty.toString()).toBe(`${MM.typeTag}()`);
			expect(map3_1.toString()).toBe(
				`${MM.typeTag}(1 -> [a], 2 -> [b], 3 -> [c])`,
			);
			expect(mapDouble.toString()).toBe(
				`${MM.typeTag}(1 -> [a, b], 2 -> [a, b])`,
			);
		});
	});

	describe(`${name}.Buidler`, () => {
		const arr3 = [
			[1, 'a'],
			[2, 'b'],
			[3, 'c'],
		] as ArrayNonEmpty<[number, string]>;

		function forEachBuilder(
			f: (builder: MultiMap.Builder<number, string>) => void,
		) {
			const b1 = MM.from(arr3).toBuilder();
			const b2 = MM.builder<readonly [number, string]>();
			b2.addEach(arr3);

			f(b1);
			f(b2);
		}

		it('addTo', () => {
			const b = MM.builder<readonly [number, string]>();
			expect(b.size).toBe(0);
			expect(b.addTo(1, 'a')).toBe(true);
			expect(b.size).toBe(1);
			expect(b.addTo(2, 'b')).toBe(true);
			expect(b.size).toBe(2);
			expect(b.addTo(2, 'c')).toBe(true);
			expect(b.size).toBe(3);
			expect(b.addTo(2, 'c')).toBe(false);
			expect(b.size).toBe(3);
		});

		it('addEach', () => {
			const b = MM.builder<readonly [number, string]>();
			expect(b.size).toBe(0);
			expect(b.addEach(arr3)).toBe(true);
			expect(b.size).toBe(3);
			expect(b.addEach(arr3)).toBe(false);
			expect(b.size).toBe(3);
		});

		it('build', () => {
			const b = MM.builder<readonly [number, string]>();
			expect(b.build()).toBe(MM.empty());
			b.addEach(arr3);
			expect(b.build().size).toBe(3);
			expect(b.build().getValues(2).toArray()).toEqual(['b']);
		});

		it('forEach', () => {
			const b = MM.builder<readonly [number, string]>();

			const result = new Set<number>();

			b.forEachIndexed((entry) => result.add(entry[0]));
			expect(result).toEqual(new Set());

			forEachBuilder((b) => {
				const result = new Set<number>();

				b.forEachIndexed((entry) => result.add(entry[0]));
				expect(result).toEqual(new Set([1, 2, 3]));
			});
		});

		it('operations throw in forEach when modifying collection', () => {
			forEachBuilder((b) => {
				expect(() => b.forEachIndexed(() => b.addTo(1, 'a'))).toThrow();
				expect(() => b.forEachIndexed(() => b.addEach([[1, 'a']]))).toThrow();
				expect(() => b.forEachIndexed(() => b.removeEntries([[1, 'a']]))).toThrow();
				expect(() => b.forEachIndexed(() => b.removeEntry(1, 'a'))).toThrow();
				expect(() => b.forEachIndexed(() => b.removeKey(1))).toThrow();
				expect(() => b.forEachIndexed(() => b.removeKeys([1]))).toThrow();
				expect(() => b.forEachIndexed(() => b.setEachValue(1, ['a']))).toThrow();
			});
		});

		it('removeEntries', () => {
			forEachBuilder((b) => {
				expect(b.removeEntries([[10, 'z']])).toBe(false);
				expect(b.size).toBe(3);
				expect(
					b.removeEntries([
						[2, 'c'],
						[10, 'z'],
					]),
				).toBe(false);
				expect(b.size).toBe(3);
				expect(
					b.removeEntries([
						[2, 'b'],
						[10, 'z'],
					]),
				).toBe(true);
				expect(b.size).toBe(2);
			});
		});

		it('removeEntry', () => {
			forEachBuilder((b) => {
				expect(b.removeEntry(10, 'z')).toBe(false);
				expect(b.size).toBe(3);
				expect(b.removeEntry(2, 'c')).toBe(false);
				expect(b.size).toBe(3);
				expect(b.removeEntry(2, 'b')).toBe(true);
				expect(b.size).toBe(2);
			});
		});

		it('removeKey', () => {
			forEachBuilder((b) => {
				// `removeKey` hands back the value set that was stored at the key;
				// an empty set means the key was not present.
				expect(b.removeKey(10).isEmpty).toBe(true);
				expect(b.size).toBe(3);
				expect(b.removeKey(2).toArray()).toEqual(['b']);
				expect(b.size).toBe(2);
				expect(b.removeKey(3).toArray()).toEqual(['c']);
				expect(b.size).toBe(1);
			});
		});

		it('removeKeys', () => {
			forEachBuilder((b) => {
				expect(b.removeKeys([10])).toBe(false);
				expect(b.size).toBe(3);
				expect(b.removeKeys([2])).toBe(true);
				expect(b.size).toBe(2);
			});
		});

		it('setEachValue', () => {
			forEachBuilder((b) => {
				expect(b.setEachValue(10, [])).toBe(false);
				expect(b.setEachValue(2, ['b'])).toBe(true);
				expect(b.setEachValue(2, ['b', 'c'])).toBe(true);
				expect(b.size).toBe(4);
				expect(b.setEachValue(2, [])).toBe(true);
				expect(b.size).toBe(2);
				expect(b.setEachValue(10, ['z']));
				expect(b.size).toBe(3);
			});
		});

		it('addEachValue', () => {
			forEachBuilder((b) => {
				expect(b.addEachValue(10, [])).toBe(false);
				expect(b.addEachValue(2, ['b'])).toBe(false);
				expect(b.addEachValue(2, ['z'])).toBe(true);
				expect(b.size).toBe(4);
				expect(b.addEachValue(1, ['x', 'y'])).toBe(true);
				expect(b.size).toBe(6);
			});
		});
	});
}
