import { describe, expect, it } from 'bun:test';

import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { Table } from '@rimbu/table';

/**
 * The shared table test suite.
 *
 * Parameterised by context, not by collection type: there is one `Table<R, C, V>`
 * and four contexts that choose the row/column backings. Every assertion below
 * must therefore hold for **all four** — nothing here may depend on iteration
 * order unless the context is known to be sorted.
 */

/** The shape the four exported context constants satisfy. */
export type TableContextLike = Table.Context<any, any>;

type Cell = readonly [number, string, boolean];

/**
 * Structural comparison, never `expect(collection).toEqual(collection)`: that
 * walks internal representation and fails on structurally equal collections.
 */
function expectCells(table: Table<number, string, boolean>, arr: Cell[]): void {
	expect(new Set(table.stream())).toEqual(new Set(arr));
}

function expectRows(table: Table<number, string, boolean>, arr: number[]): void {
	expect(new Set(table.streamRows())).toEqual(new Set(arr));
}

const arr3: ArrayNonEmpty<Cell> = [
	[1, 'a', true],
	[2, 'b', false],
	[3, 'c', true],
];

const arr6: ArrayNonEmpty<Cell> = [
	[1, 'a', true],
	[2, 'b', false],
	[3, 'c', true],
	[4, 'd', false],
	[5, 'e', true],
	[6, 'f', false],
];

/**
 * Runs each builder case against both a builder derived from a collection and a
 * freshly-populated one, so a case cannot pass only because of the source-copy
 * path.
 */
function forEachBuilder(
	context: TableContextLike,
	f: (builder: Table.Builder<number, string, boolean>) => void,
): void {
	const fromSource = context.from(arr3).toBuilder();
	f(fromSource);

	const fresh = context.builder<Cell>();
	fresh.addEach(arr3);
	f(fresh);
}

export function runTableTestsWith(
	name: string,
	context: TableContextLike,
): void {
	describe(`${name} creators`, () => {
		it('empty', () => {
			const t1 = context.empty<Cell>();
			const t2 = context.empty<Cell>();
			expect(t1.isEmpty).toBe(true);
			expect(t1.size).toBe(0);
			expect(t1.amountRows).toBe(0);
			expect(t1.toString()).toBe('Table()');
			// The empty table is a per-context singleton.
			expect(t2).toBe(t1);
		});

		it('of', () => {
			const t1 = context.of<Cell>(arr3[0]);
			expect(t1.isEmpty).toBe(false);
			expect(t1.size).toBe(1);

			const t3 = context.of<Cell>(...arr3);
			expect(t3.size).toBe(3);
			expect(t3.amountRows).toBe(3);
		});

		it('from', () => {
			expect(context.from<Cell>(arr3).size).toBe(3);
			expect(context.from<Cell>(arr3, arr6).size).toBe(6);
			// Passing the same context's own table through `from` is an identity.
			const source = context.from<Cell>(arr3);
			expect(context.from(source)).toBe(source);
			// An empty source contributes nothing.
			expect(context.from<Cell>(arr3, []).size).toBe(3);
		});

		it('builder', () => {
			const b = context.builder<Cell>();
			expect(b.isEmpty).toBe(true);
			b.addEach(arr3);
			expect(b.size).toBe(3);
			expect(b.build().size).toBe(3);
		});

		it('reducer', () => {
			const t = context.from<Cell>(arr3).toBuilder().build();
			expect(t.size).toBe(3);
		});

		it('defaultContext is the context itself', () => {
			expect(context.defaultContext).toBe(context);
		});
	});

	describe(`${name} methods`, () => {
		const t1 = context.of<Cell>(arr3[0]);
		const t3 = context.of<Cell>(...arr3);
		const t6 = context.of<Cell>(...arr6);

		it('iterator', () => {
			expect(new Set(t3.toArray())).toEqual(new Set(arr3));
			// The iterator is a `FastIterator`: drive it with `fastNext`, not spread.
			const iter = t3[Symbol.iterator]();
			expect(iter.fastNext()).toBeDefined();
			expect(iter.fastNext()).toBeDefined();
			expect(iter.fastNext()).toBeDefined();
			expect(iter.fastNext()).toBe(undefined);
		});

		it('size', () => {
			expect(context.empty<Cell>().size).toBe(0);
			expect(t1.size).toBe(1);
			expect(t3.size).toBe(3);
			expect(t6.size).toBe(6);
		});

		it('amountRows', () => {
			expect(context.empty<Cell>().amountRows).toBe(0);
			expect(t3.amountRows).toBe(3);
			// Two cells in one row: one row, two cells.
			expect(context.of([1, 'a', true], [1, 'b', false]).amountRows).toBe(1);
			expect(context.of([1, 'a', true], [1, 'b', false]).size).toBe(2);
		});

		it('isEmpty', () => {
			expect(context.empty<Cell>().isEmpty).toBe(true);
			expect(t3.isEmpty).toBe(false);
		});

		it('nonEmpty', () => {
			expect(context.empty<Cell>().nonEmpty()).toBe(false);
			expect(t3.nonEmpty()).toBe(true);
		});

		it('assumeNonEmpty', () => {
			expect(() => context.empty<Cell>().assumeNonEmpty()).toThrow();
			expect(t3.assumeNonEmpty().size).toBe(3);
		});

		it('asNormal', () => {
			expect(t3.assumeNonEmpty().asNormal().size).toBe(3);
		});

		it('context', () => {
			expect(t3.context).toBe(context);
		});

		it('stream', () => {
			expectCells(t3, arr3);
			expectCells(t6, arr6);
			expect(context.empty<Cell>().stream().count()).toBe(0);
		});

		it('streamRows', () => {
			expectRows(t3, [1, 2, 3]);
			expect(context.empty<Cell>().streamRows().count()).toBe(0);
		});

		it('streamValues', () => {
			// A stream, not a set: `true` occurs twice in arr3.
			expect(t3.streamValues().toArray().sort()).toEqual([false, true, true]);
			expect(context.empty<Cell>().streamValues().count()).toBe(0);
		});

		it('forEach', () => {
			const result: Cell[] = [];
			t3.forEach((cell) => result.push(cell as Cell));
			expect(new Set(result)).toEqual(new Set(arr3));
		});

		it('forEachIndexed', () => {
			const result: number[] = [];
			t3.forEachIndexed((_cell, index) => result.push(index));
			expect(result).toEqual([0, 1, 2]);
		});

		it('forEachIndexed halt', () => {
			const seen: number[] = [];
			t3.forEachIndexed((_cell, index, halt) => {
				seen.push(index);
				if (index === 0) halt();
			});
			expect(seen).toEqual([0]);
		});

		it('toArray', () => {
			expect(new Set(t3.toArray())).toEqual(new Set(arr3));
			expect(context.empty<Cell>().toArray()).toEqual([]);
		});

		it('toString', () => {
			expect(context.empty<Cell>().toString()).toBe('Table()');
			expect(t1.toString()).toBe('Table([1, a] -> true)');
		});

		it('get', () => {
			expect(t3.get(1, 'a')).toBe(true);
			expect(t3.get(2, 'b')).toBe(false);
			expect(t3.get(1, 'z')).toBe(undefined);
			expect(t3.get(1, 'z', 'fallback')).toBe('fallback');
			expect(t3.get(1, 'z', () => 'lazy')).toBe('lazy');
			expect(context.empty<Cell>().get(1, 'a')).toBe(undefined);
			expect(context.empty<Cell>().get(1, 'a', true)).toBe(true);
		});

		it('has', () => {
			expect(t3.has(1, 'a')).toBe(true);
			expect(t3.has(1, 'z')).toBe(false);
			expect(t3.has(9, 'a')).toBe(false);
			expect(context.empty<Cell>().has(1, 'a')).toBe(false);
		});

		it('hasRow', () => {
			expect(t3.hasRow(1)).toBe(true);
			expect(t3.hasRow(9)).toBe(false);
			expect(context.empty<Cell>().hasRow(1)).toBe(false);
		});

		it('getRow', () => {
			expect(t3.getRow(1).size).toBe(1);
			expect(t3.getRow(1).get('a')).toBe(true);
			expect(t3.getRow(9).isEmpty).toBe(true);

			const twoColumns = context.of([1, 'a', true], [1, 'b', false]);
			expect(twoColumns.getRow(1).size).toBe(2);
			expect(twoColumns.getRow(1).get('b')).toBe(false);
		});

		it('rowMap', () => {
			expect(t3.rowMap.size).toBe(3);
			expect(t3.rowMap.get(1)!.size).toBe(1);
			expect(context.empty<Cell>().rowMap.isEmpty).toBe(true);

			// The row-pruning invariant: an emptied row is removed, not left empty.
			const pruned = context
				.of([1, 'a', true], [1, 'b', false])
				.remove(1, 'a')
				.remove(1, 'b');
			expect(pruned.isEmpty).toBe(true);
			expect(pruned.rowMap.has(1)).toBe(false);
		});

		it('add', () => {
			const t = context.empty<Cell>().add([1, 'a', true]);
			expect(t.size).toBe(1);
			expect(t.get(1, 'a')).toBe(true);
			expect(t.add([1, 'b', false]).size).toBe(2);
		});

		it('addEach', () => {
			expect(t3.addEach(arr6).size).toBe(6);
			// An empty source is an identity.
			expect(t3.addEach([])).toBe(t3);
			// Adding to empty yields a non-empty.
			expect(context.empty<Cell>().addEach(arr3).isEmpty).toBe(false);
		});

		it('set', () => {
			expect(t3.set(1, 'a', false).get(1, 'a')).toBe(false);
			expect(t3.set(1, 'a', false).size).toBe(3);
			expect(t3.set(9, 'z', true).size).toBe(4);
			expect(context.empty<Cell>().set(1, 'a', true).size).toBe(1);
		});

		it('update', () => {
			expect(t3.update(1, 'a', () => false).get(1, 'a')).toBe(false);
			// A missing cell is not created.
			expect(t3.update(9, 'z', (v) => !v).size).toBe(3);
			expect(context.empty<Cell>().update(1, 'a', (v) => !v).size).toBe(0);
		});

		it('modify', () => {
			expect(
				t3.modify(1, 'a', { ifExists: { update: () => false } }).get(1, 'a'),
			).toBe(false);
			expect(t3.modify(9, 'z', { ifNew: { set: true } }).size).toBe(4);
			expect(t3.modify(9, 'z', { ifExists: { update: () => false } }).size).toBe(
				3,
			);
			// Both branches absent is an identity.
			expect(t3.modify(1, 'a', {})).toBe(t3);
			expect(context.empty<Cell>().modify(1, 'a', {})).toBe(
				context.empty<Cell>(),
			);
		});

		it('remove', () => {
			expect(t3.remove(1, 'a').size).toBe(2);
			expect(t3.remove(1, 'a').get(1, 'a')).toBe(undefined);
			expect(t3.remove(1, 'a').amountRows).toBe(2);
			// A missing cell is an identity.
			expect(t3.remove(9, 'z')).toBe(t3);
			// Removing the only cell empties the table.
			expect(t1.remove(1, 'a').isEmpty).toBe(true);
		});

		it('removeRow', () => {
			expect(t3.removeRow(1).size).toBe(2);
			expect(t3.removeRow(1).amountRows).toBe(2);
			expect(t3.removeRow(9)).toBe(t3);
			expect(context.empty<Cell>().removeRow(1).isEmpty).toBe(true);
		});

		it('removeRows', () => {
			expect(t6.removeRows([1, 2]).size).toBe(4);
			expect(t6.removeRows([1, 2]).amountRows).toBe(4);
			expect(t6.removeRows([])).toBe(t6);
			expect(t6.removeRows([9])).toBe(t6);
		});

		it('removeEach', () => {
			expect(t6.removeEach([[1, 'a'], [2, 'b']]).size).toBe(4);
			expect(t6.removeEach([[1, 'a'], [2, 'b']]).amountRows).toBe(4);
			expect(t6.removeEach([])).toBe(t6);
			expect(t6.removeEach([[9, 'z']])).toBe(t6);
		});

		it('filter', () => {
			expectCells(t6.filter((cell) => cell[2]), [
				[1, 'a', true],
				[3, 'c', true],
				[5, 'e', true],
			]);
			expectCells(
				t6.filter((cell) => cell[2], { negate: true }),
				arr6.filter((cell) => !cell[2]),
			);
			// A filter that removes nothing is an identity.
			expect(t6.filter(() => true)).toBe(t6);
			expect(context.empty<Cell>().filter(() => true).isEmpty).toBe(true);
		});

		it('filterIndexed', () => {
			expect(t6.filterIndexed((_cell, index) => index > 0).size).toBe(5);
			expect(t6.filterIndexed((_cell, index) => index === 0).size).toBe(1);
		});

		it('filterRows', () => {
			expect(t6.filterRows((row) => row > 3).amountRows).toBe(3);
			expect(t6.filterRows(() => false).isEmpty).toBe(true);
			// A filter that removes nothing is an identity.
			expect(t6.filterRows(() => true)).toBe(t6);

			// The predicate sees the whole row.
			const twoColumns = context.of([1, 'a', true], [1, 'b', false], [2, 'a', true]);
			const wide = twoColumns.filterRows((_row, rowMap) => rowMap.size > 1);
			expect(wide.amountRows).toBe(1);
			expect(wide.size).toBe(2);
		});

		it('mapValues', () => {
			const t = context.of<readonly [number, string, number]>([1, 'a', 1]);
			const mapped = t.mapValues((value) => `${value}`);
			expect(mapped.get(1, 'a')).toBe('1');
			expect(mapped.amountRows).toBe(1);
			// The callback receives both coordinates.
			const labelled = context
				.of<readonly [number, string, number]>([1, 'a', 5])
				.mapValues((value, row, column) => `${row}${column}${value}`);
			expect(labelled.get(1, 'a')).toBe('1a5');
			expect(context.empty<Cell>().mapValues(() => 1).isEmpty).toBe(true);
		});

		it('toBuilder', () => {
			expect(t3.toBuilder().size).toBe(3);
			expect(context.empty<Cell>().toBuilder().size).toBe(0);
		});

		it('mutate', () => {
			const mutated = t3.mutate((builder) => {
				builder.set(9, 'z', true);
			});
			expect(mutated.size).toBe(4);
			expect(t3.size).toBe(3);
		});

		it('recompose-free: stream round-trips through the context', () => {
			expect(context.from<Cell>(t3.stream()).size).toBe(3);
		});
	});

	describe(`${name}.Builder`, () => {
		it('size', () => {
			forEachBuilder(context, (b) => {
				expect(b.size).toBe(3);
			});
		});

		it('isEmpty', () => {
			expect(context.builder<Cell>().isEmpty).toBe(true);
			forEachBuilder(context, (b) => {
				expect(b.isEmpty).toBe(false);
			});
		});

		it('context', () => {
			forEachBuilder(context, (b) => {
				expect(b.context).toBe(context);
			});
		});

		it('build', () => {
			forEachBuilder(context, (b) => {
				expectCells(b.build(), arr3);
			});
			expect(context.builder<Cell>().build().isEmpty).toBe(true);
		});

		it('build preserves source identity when untouched', () => {
			const source = context.from<Cell>(arr3);
			expect(source.toBuilder().build()).toBe(source);

			const mutated = source.toBuilder();
			mutated.set(9, 'z', false);
			expect(mutated.build()).not.toBe(source);
			expect(mutated.build().size).toBe(4);
		});

		it('get', () => {
			forEachBuilder(context, (b) => {
				expect(b.get(1, 'a')).toBe(true);
				expect(b.get(9, 'z')).toBe(undefined);
				expect(b.get(9, 'z', 'fallback')).toBe('fallback');
			});
		});

		it('has / hasRow', () => {
			forEachBuilder(context, (b) => {
				expect(b.has(1, 'a')).toBe(true);
				expect(b.has(1, 'z')).toBe(false);
				expect(b.hasRow(1)).toBe(true);
				expect(b.hasRow(9)).toBe(false);
			});
		});

		it('getRow / amountRows', () => {
			forEachBuilder(context, (b) => {
				expect(b.getRow(1).size).toBe(1);
				expect(b.getRow(9).isEmpty).toBe(true);
				expect(b.amountRows).toBe(3);
			});
		});

		it('set', () => {
			forEachBuilder(context, (b) => {
				expect(b.set(1, 'a', false)).toBe(true);
				expect(b.get(1, 'a')).toBe(false);
				// Re-setting an identical value reports no change.
				expect(b.set(1, 'a', false)).toBe(false);
				expect(b.set(9, 'z', true)).toBe(true);
			});
		});

		it('add', () => {
			forEachBuilder(context, (b) => {
				// Overwriting an existing cell with a different value is a change.
				expect(b.add([1, 'a', false])).toBe(true);
				expect(b.get(1, 'a')).toBe(false);
				// Re-adding the identical cell reports no change.
				expect(b.add([1, 'a', false])).toBe(false);
				expect(b.add([4, 'd', true])).toBe(true);
				expect(b.size).toBe(4);
			});
		});

		it('addEach', () => {
			forEachBuilder(context, (b) => {
				expect(b.addEach([[4, 'd', true], [5, 'e', false]])).toBe(true);
				expect(b.size).toBe(5);
				expect(b.addEach([])).toBe(false);
			});
		});

		it('update', () => {
			forEachBuilder(context, (b) => {
				expect(b.update(1, 'a', () => false)).toBe(true);
				expect(b.get(1, 'a')).toBe(false);
				expect(b.update(9, 'z', () => true)).toBe(undefined);
				expect(b.update(9, 'z', () => true, 'fallback')).toBe('fallback');
			});
		});

		it('modify', () => {
			forEachBuilder(context, (b) => {
				expect(b.modify(1, 'a', { ifExists: { set: false } })).toBe(true);
				expect(b.get(1, 'a')).toBe(false);
				expect(b.modify(9, 'z', { ifNew: { set: true } })).toBe(true);
				expect(b.modify(1, 'a', {})).toBe(false);
			});
		});

		it('remove', () => {
			forEachBuilder(context, (b) => {
				expect(b.remove(1, 'a')).toBe(true);
				expect(b.size).toBe(2);
				expect(b.remove(9, 'z')).toBe(undefined);
				expect(b.remove(9, 'z', 'fallback')).toBe('fallback');
			});
		});

		it('remove prunes an emptied row', () => {
			const b = context.builder<Cell>();
			b.set(1, 'a', true);
			b.set(1, 'b', false);
			b.remove(1, 'a');
			expect(b.size).toBe(1);
			b.remove(1, 'b');
			expect(b.size).toBe(0);
			expect(b.isEmpty).toBe(true);
			expect(b.build().rowMap.has(1)).toBe(false);
		});

		it('removeRow', () => {
			forEachBuilder(context, (b) => {
				expect(b.removeRow(1)).toBe(true);
				expect(b.size).toBe(2);
				expect(b.removeRow(9)).toBe(false);
			});
		});

		it('removeRows', () => {
			forEachBuilder(context, (b) => {
				expect(b.removeRows([1, 2])).toBe(true);
				expect(b.size).toBe(1);
				expect(b.removeRows([])).toBe(false);
			});
		});

		it('removeEach', () => {
			forEachBuilder(context, (b) => {
				expect(b.removeEach([[1, 'a'], [2, 'b']])).toBe(true);
				expect(b.size).toBe(1);
				expect(b.removeEach([])).toBe(false);
			});
		});

		it('buildMapValues', () => {
			forEachBuilder(context, (b) => {
				const mapped = b.buildMapValues((value, row, column) =>
					`${row}${column}${value}`,
				);
				expect(mapped.get(1, 'a')).toBe('1atrue');
			});
		});

		it('clear', () => {
			forEachBuilder(context, (b) => {
				b.clear();
				expect(b.size).toBe(0);
				expect(b.isEmpty).toBe(true);
				expect(b.build().isEmpty).toBe(true);
			});
		});

		it('forEach', () => {
			forEachBuilder(context, (b) => {
				const result: Cell[] = [];
				b.forEach((cell) => result.push(cell as Cell));
				expect(new Set(result)).toEqual(new Set(arr3));
			});
		});

		it('forEachIndexed', () => {
			forEachBuilder(context, (b) => {
				const result: number[] = [];
				b.forEachIndexed((_cell, index) => result.push(index));
				expect(result).toEqual([0, 1, 2]);
			});
		});

		it('forEachIndexed halt', () => {
			forEachBuilder(context, (b) => {
				const seen: number[] = [];
				b.forEachIndexed((_cell, index, halt) => {
					seen.push(index);
					if (index === 0) halt();
				});
				expect(seen).toEqual([0]);
			});
		});

		/**
		 * Mutating during a traversal must throw.
		 *
		 * A **fresh builder per assertion**: once one assertion leaks the traversal
		 * lock, every later one throws for the wrong reason, so a shared builder
		 * would make all of these pass without testing anything. Each case is
		 * followed by a post-condition proving the lock was released.
		 */
		it('operations throw while traversing', () => {
			const mutations: ((b: Table.Builder<number, string, boolean>) => void)[] = [
				(b) => b.add([1, 'a', false]),
				(b) => b.addEach([[1, 'a', false]]),
				(b) => b.set(1, 'a', false),
				(b) => b.modify(1, 'a', {}),
				(b) => b.update(1, 'a', () => false),
				(b) => b.remove(1, 'a'),
				(b) => b.removeRow(1),
				(b) => b.removeRows([1]),
				(b) => b.removeEach([[1, 'a']]),
				(b) => b.clear(),
			];

			for (const mutate of mutations) {
				const b = context.builder<Cell>();
				b.addEach(arr3);

				expect(() =>
					b.forEach(() => {
						mutate(b);
					}),
				).toThrow();

				// Post-condition: the lock must not have leaked.
				expect(b.set(9, 'z', true)).toBe(true);
			}
		});

		/**
		 * `halt()` is implemented by throwing a sentinel that the traversal then
		 * swallows. Without a `finally` around the lock, a legal `halt()` would
		 * leave the builder permanently rejecting every mutation.
		 */
		it('halt() releases the traversal lock', () => {
			for (const traverse of [
				(b: Table.Builder<number, string, boolean>) =>
					b.forEachIndexed((_cell, _index, halt) => halt()),
				(b: Table.Builder<number, string, boolean>) =>
					b.forEach(() => {
						throw new Error('user code threw');
					}) as unknown,
			]) {
				const b = context.builder<Cell>();
				b.addEach(arr3);

				try {
					traverse(b);
				} catch {
					// A user-thrown error is fine; only the lock matters here.
				}

				expect(b.set(9, 'z', true)).toBe(true);
			}
		});
	});
}