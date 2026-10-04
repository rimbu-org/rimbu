import { expect, it } from 'bun:test';

import { HashMap } from '@rimbu/hashed/map';
import { SortedMap } from '@rimbu/sorted/map';
import { Stream } from '@rimbu/stream';
import { Table } from '@rimbu/table';
import { HashTableHashColumn } from '@rimbu/table/hash-row/hash-column';
import { HashTableSortedColumn } from '@rimbu/table/hash-row/sorted-column';
import { SortedTableHashColumn } from '@rimbu/table/sorted-row/hash-column';
import { SortedTableSortedColumn } from '@rimbu/table/sorted-row/sorted-column';

const all = [
	['HashTableHashColumn', HashTableHashColumn],
	['HashTableSortedColumn', HashTableSortedColumn],
	['SortedTableHashColumn', SortedTableHashColumn],
	['SortedTableSortedColumn', SortedTableSortedColumn],
] as const;

it('all four contexts behave identically on cell operations', () => {
	for (const [name, context] of all) {
		const empty = context.empty<readonly [number, string, boolean]>();
		expect(empty.isEmpty, name).toBe(true);
		expect(empty.size, name).toBe(0);
		expect(empty.amountRows, name).toBe(0);
		expect(empty.toString(), name).toBe('Table()');

		const t = context.of<readonly [number, string, boolean]>([1, 'a', true]);
		expect(t.isEmpty, name).toBe(false);
		expect(t.size, name).toBe(1);
		expect(t.amountRows, name).toBe(1);
		expect(t.get(1, 'a'), name).toBe(true);
		expect(t.get(1, 'b'), name).toBe(undefined);
		expect(t.get(1, 'b', 'fallback'), name).toBe('fallback');
		expect(t.has(1, 'a'), name).toBe(true);
		expect(t.has(1, 'b'), name).toBe(false);
		expect(t.hasRow(1), name).toBe(true);
		expect(t.hasRow(2), name).toBe(false);
		expect(t.toArray(), name).toEqual([[1, 'a', true]]);
		expect(t.streamRows().toArray(), name).toEqual([1]);
		expect(t.streamValues().toArray(), name).toEqual([true]);
		expect(t.getRow(1).size, name).toBe(1);
		expect(t.rowMap.size, name).toBe(1);
	}
});

it('add/addEach accumulate cells and keep size exact', () => {
	for (const [name, context] of all) {
		let t = context.empty<readonly [number, string, number]>();
		t = t.add([1, 'a', 10]);
		t = t.add([1, 'b', 20]);
		t = t.add([2, 'a', 30]);
		expect(t.size, name).toBe(3);
		expect(t.amountRows, name).toBe(2);
		expect(t.get(1, 'a'), name).toBe(10);

		const added = t.addEach([[3, 'c', 40]]);
		expect(added.size, name).toBe(4);
		expect(added.get(3, 'c'), name).toBe(40);

		// Adding to the empty table yields a NonEmpty.
		const fromEmpty = context
			.empty<readonly [number, string, number]>()
			.addEach([[1, 'a', 1]]);
		expect(fromEmpty.isEmpty, name).toBe(false);
		expect(fromEmpty.size, name).toBe(1);

		// An empty source is an identity.
		const stillEmpty = context.empty<readonly [number, string, number]>().addEach([]);
		expect(stillEmpty.isEmpty, name).toBe(true);
	}
});

it('set / update / modify', () => {
	for (const [name, context] of all) {
		const t = context.of<readonly [number, string, number]>([1, 'a', 10]);
		expect(t.set(1, 'a', 99).get(1, 'a'), name).toBe(99);
		expect(t.set(2, 'z', 5).amountRows, name).toBe(2);

		expect(t.update(1, 'a', (v) => v + 1).get(1, 'a'), name).toBe(11);
		// No-op update of a missing cell.
		expect(t.update(9, 'q', (v) => v + 1).size, name).toBe(1);

		expect(
			t.modify(1, 'a', { ifExists: { update: (v) => v * 2 } }).get(1, 'a'),
			name,
		).toBe(20);
		expect(t.modify(9, 'q', { ifNew: { set: 7 } }).get(9, 'q'), name).toBe(7);
		// Both branches absent => identity.
		const noop = t.modify(1, 'a', {});
		expect(noop.size, name).toBe(1);
	}
});

it('remove prunes the row when its last cell goes (row-pruning invariant)', () => {
	for (const [name, context] of all) {
		const t = context.of<readonly [number, string, number]>([1, 'a', 1], [1, 'b', 2]);

		const oneLeft = t.remove(1, 'a');
		expect(oneLeft.size, name).toBe(1);
		expect(oneLeft.amountRows, name).toBe(1);
		// The inner map must be non-empty even though it now has one entry.
		expect(oneLeft.rowMap.get(1)!.size, name).toBe(1);

		const noneLeft = oneLeft.remove(1, 'b');
		expect(noneLeft.size, name).toBe(0);
		expect(noneLeft.isEmpty, name).toBe(true);
		expect(noneLeft.amountRows, name).toBe(0);
		// The row itself must be gone, not present-but-empty.
		expect(noneLeft.rowMap.has(1), name).toBe(false);

		// Removing a missing cell is an identity.
		expect(noneLeft.remove(5, 'x').isEmpty, name).toBe(true);
	}
});

it('removeRow / removeRows / removeEach', () => {
	for (const [name, context] of all) {
		const t = context.of<readonly [number, string, number]>([1, 'a', 1], [2, 'a', 2], [3, 'a', 3]);

		expect(t.removeRow(1).amountRows, name).toBe(2);
		expect(t.removeRows([1, 2]).amountRows, name).toBe(1);

		// Removing two of the three cells leaves row 2's cell behind.
		expect(t.removeEach([[1, 'a'], [3, 'a']]).size, name).toBe(1);
		expect(t.removeEach([[1, 'a'], [3, 'a']]).amountRows, name).toBe(1);

		// Removing the last cell empties the table.
		expect(t.removeEach([[1, 'a'], [2, 'a'], [3, 'a']]).isEmpty, name).toBe(true);

		// Identity on an empty source.
		expect(t.removeEach([]).size, name).toBe(3);
	}
});

it('filter / filterIndexed / filterRows', () => {
	for (const [name, context] of all) {
		const t = context.of<readonly [number, string, number]>([1, 'a', 1], [1, 'b', 2], [2, 'a', 3]);

		const byCell = t.filter((cell) => cell[2] > 1);
		expect(byCell.size, name).toBe(2);
		expect(byCell.amountRows, name).toBe(2);

		// A filter that removes nothing must be identity.
		const noop = t.filter(() => true);
		expect(noop.size, name).toBe(3);

		const byIndex = t.filterIndexed((_cell, index) => index > 0);
		expect(byIndex.size, name).toBe(2);

		const rows = t.filterRows((row) => row === 1);
		expect(rows.amountRows, name).toBe(1);
		expect(rows.size, name).toBe(2);
	}
});

it('mapValues refines V and keeps R, C', () => {
	for (const [name, context] of all) {
		const t = context.of<readonly [number, string, number]>([1, 'a', 1]);
		const asString = t.mapValues((value) => `${value}`);
		expect(asString.get(1, 'a'), name).toBe('1');
		expect(asString.amountRows, name).toBe(1);
	}
});

it('builder: set/add/modify/update/remove and row pruning', () => {
	for (const [name, context] of all) {
		const b = context.builder<readonly [number, string, number]>();
		expect(b.isEmpty, name).toBe(true);

		expect(b.set(1, 'a', 10), name).toBe(true);
		// Re-setting an identical value is a no-op.
		expect(b.set(1, 'a', 10), name).toBe(false);
		expect(b.size, name).toBe(1);

		expect(b.add([1, 'b', 20]), name).toBe(true);
		expect(b.size, name).toBe(2);

		expect(b.update(1, 'a', (v) => v + 1), name).toBe(10);
		expect(b.modify(1, 'a', { ifExists: { set: 5 } }), name).toBe(true);

		const built = b.build();
		expect(built.get(1, 'a'), name).toBe(5);
		expect(built.get(1, 'b'), name).toBe(20);

		// Builder row pruning.
		const p = context.builder<readonly [number, string, number]>();
		p.set(1, 'a', 1);
		p.remove(1, 'a');
		expect(p.size, name).toBe(0);
		expect(p.isEmpty, name).toBe(true);

		// clear() is new from the shared builder API.
		const c = context.builder<readonly [number, string, number]>();
		c.set(1, 'a', 1);
		c.set(2, 'b', 2);
		expect(c.size, name).toBe(2);
		c.clear();
		expect(c.size, name).toBe(0);
		expect(c.build().isEmpty, name).toBe(true);
	}
});

it('builder: mutate from a collection is free (WithMutate)', () => {
	for (const [name, context] of all) {
		const t = context.of<readonly [number, string, number]>([1, 'a', 1]);
		const mutated = t.mutate((b) => {
			b.set(2, 'b', 2);
		});
		expect(mutated.size, name).toBe(2);
	}
});

it('builder: mutating during traversal throws, and the lock does not leak', () => {
	for (const [name, context] of all) {
		const b = context.builder<readonly [number, string, number]>();
		b.set(1, 'a', 1);

		expect(() => {
			b.forEach(() => {
				b.set(9, 'z', 9);
			});
		}, name).toThrow();

		// Post-condition: the lock must have been released.
		expect(b.set(2, 'b', 2), name).toBe(true);
	}
});

it('builder: halt() during traversal releases the lock', () => {
	for (const [name, context] of all) {
		const b = context.builder<readonly [number, string, number]>();
		b.set(1, 'a', 1);
		b.set(1, 'b', 2);
		b.set(2, 'a', 3);

		const seen: number[] = [];
		b.forEachIndexed((_cell, index, halt) => {
			seen.push(index);
			if (index === 0) halt();
		});
		expect(seen.length, name).toBe(1);

		// The lock must be released after a legal halt().
		expect(b.set(3, 'c', 4), name).toBe(true);
	}
});

it('context: of / from / builder / reducer / defaultContext', () => {
	for (const [name, context] of all) {
		const fromArray = context.from([[1, 'a', true]]);
		expect(fromArray.size, name).toBe(1);

		const fromMany = context.from([[1, 'a', true]], [[2, 'b', false]]);
		expect(fromMany.size, name).toBe(2);

		expect(context.builder<readonly [number, string, boolean]>().build().isEmpty, name).toBe(
			true,
		);

		const cells: readonly [number, string, boolean][] = [
			[1, 'a', true],
			[1, 'b', false],
		];

		const reduced = Stream.from(cells).reduce(context.reducer());
		expect(reduced.size, name).toBe(2);
		expect(reduced.get(1, 'b'), name).toBe(false);

		// Seeding the reducer with a source folds that source in.
		const more: readonly [number, string, boolean][] = [[1, 'b', false]];
		const seeded = Stream.from(more).reduce(context.reducer(cells));
		expect(seeded.size, name).toBe(2);
		expect(seeded.get(1, 'a'), name).toBe(true);

		// defaultContext on a variant context is itself.
		expect(context.defaultContext, name).toBe(context);
	}
});

it('sorted contexts order rows and columns; hashed contexts do not promise order', () => {
	const sorted = SortedTableSortedColumn.of<readonly [number, string, number]>([2, 'b', 2], [1, 'a', 1]);
	expect(sorted.streamRows().toArray()).toEqual([1, 2]);
	expect([...sorted.getRow(1).streamKeys()]).toEqual(['a']);

	const rowSorted = SortedTableHashColumn.of<readonly [number, string, number]>([2, 'b', 2], [1, 'a', 1]);
	expect(rowSorted.streamRows().toArray()).toEqual([1, 2]);

	// The hashed row context must still hold every row, whatever the order.
	const rowHashed = HashTableHashColumn.of<readonly [number, string, number]>([2, 'b', 2], [1, 'a', 1]);
	expect(rowHashed.streamRows().toArray().sort()).toEqual([1, 2]);
});

it('Table.createContext derives a sibling context', () => {
	const context = Table.createContext({
		rowContext: HashMap.collectionContext,
		columnContext: SortedMap.collectionContext,
	});

	const t = context.of<readonly [number, string, boolean]>([1, 'a', true]);
	expect(t.get(1, 'a')).toBe(true);
	expect(t.toString()).toBe('Table([1, a] -> true)');

	// Deriving again keeps the same shape.
	const again = context.createContext({
		rowContext: HashMap.collectionContext,
		columnContext: SortedMap.collectionContext,
	});
	expect(again.of<readonly [number, string, boolean]>([1, 'a', true]).get(1, 'a')).toBe(true);
});

it('toString renders the uniform Table tag', () => {
	const t = HashTableHashColumn.of<readonly [number, string, number]>([1, 'a', 7]);
	expect(t.toString()).toBe('Table([1, a] -> 7)');
	expect(HashTableHashColumn.empty().toString()).toBe('Table()');
});

it('no-op operations return the identical instance', () => {
	const t = HashTableHashColumn.of<readonly [number, string, number]>([1, 'a', 1]);

	expect(t.remove(9, 'z')).toBe(t);
	expect(t.removeRow(9)).toBe(t);
	expect(t.filter(() => true)).toBe(t);
	expect(t.filterRows(() => true)).toBe(t);
	expect(t.modify(1, 'a', {})).toBe(t);
	expect(t.update(9, 'z', (v) => v)).toBe(t);
	expect(t.addEach([])).toBe(t);
	expect(t.removeRows([])).toBe(t);
});

it('builder built from a source keeps source identity until mutated', () => {
	const t = HashTableHashColumn.of<readonly [number, string, number]>([1, 'a', 1]);

	const untouched = t.toBuilder();
	expect(untouched.build()).toBe(t);

	const mutated = t.toBuilder();
	mutated.set(2, 'b', 2);
	expect(mutated.build()).not.toBe(t);
	expect(mutated.build().size).toBe(2);
});

it('NaN row keys are rejected like any other map', () => {
	const t = HashTableHashColumn.of<readonly [number, string, number]>([1, 'a', 1]);
	expect(t.update(Number.NaN, 'a', (v) => v + 1).size).toBe(1);
	expect(t.remove(Number.NaN, 'a').size).toBe(1);
});