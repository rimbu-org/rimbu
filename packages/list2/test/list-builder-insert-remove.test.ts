import { describe, expect, it } from 'bun:test';

import type { ListContext } from '#list/context';
import type { ListBuilder } from '#list/mutable/builder';
import type { OuterBlockBuilder } from '#list/mutable/outer-block-builder';

import { List } from '@rimbu/list';

/**
 * Builder insert/remove correctness beyond the happy path:
 *
 * 1. Exhaustive enumeration of ALL insert/remove sequences up to a small
 *    length — the only way to get full certainty for small structures.
 * 2. Direct construction of the three `#repairSingleChildMiddle` branches.
 * 3. Randomized sequences deep enough to build level >= 2 trees (the outer
 *    tree's middle as a tree of blocks), which the mixed random test in
 *    `list-verify-builder.test.ts` never reaches (its sizes stay below
 *    maxBlockSize^2).
 */

type Node = List<number>;

function verifyBuilder(b: ListBuilder<number>, label: string): void {
	const errors = b._verifyStructure();
	expect(errors, `${label}: builder structure`).toEqual([]);
}

function verifyBuilt(list: List<number>, label: string): void {
	if (list.isEmpty) return;
	const errors = (
		list as unknown as { _verifyStructure(errors?: string[]): string[] }
	)._verifyStructure();
	expect(errors, `${label}: built structure`).toEqual([]);
}

function expectContent(
	b: ListBuilder<number>,
	expected: number[],
	label: string,
): void {
	expect(b.size, `${label}: size`).toBe(expected.length);
	for (let i = 0; i < expected.length; i++) {
		expect(b.at(i), `${label}: at(${i})`).toBe(expected[i]);
	}
	verifyBuilder(b, label);
	verifyBuilt(b.build(), label);
}

function shapeOf(n: Node): string {
	if (n.isEmpty) return 'E';

	const tree = n as unknown as {
		left?: unknown;
		right?: unknown;
		middle?: unknown;
		childAt?: (i: number) => unknown;
		_nrChildren?: number;
		size: number;
	};

	if (tree.left !== undefined && tree.right !== undefined) {
		return `T(${shapeOf(tree.left as Node)},${
			tree.middle === null || tree.middle === undefined
				? '-'
				: shapeOf(tree.middle as Node)
		},${shapeOf(tree.right as Node)})`;
	}

	if (typeof tree.childAt === 'function') {
		const parts: string[] = [];
		for (let i = 0; i < (tree._nrChildren ?? 0); i++) {
			parts.push(shapeOf(tree.childAt(i) as Node));
		}
		return `I(${parts.join(',')})`;
	}

	return `B(${tree.size})`;
}

function makeRng(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
}

describe('builder exhaustive small sequences', () => {
	// Enumerate every reachable (array, structure) state for all sequences of
	// up to `maxOps` insertAt/removeAt operations at every position, verifying
	// size, content, builder structure and built structure at every step.
	// States are deduplicated on (array, nextValue, structure shape) — two
	// sequences that reach an identical state are equivalent.
	function exhaustive(blockSizeBits: number, maxOps: number): void {
		const ctx = List.createContext({ blockSizeBits });

		type State = { b: ListBuilder<number>; arr: number[]; nv: number };
		let states = new Map<string, State>();
		states.set('[]', {
			b: ctx.builder<number>() as ListBuilder<number>,
			arr: [],
			nv: 0,
		});

		for (let step = 0; step < maxOps; step++) {
			const next = new Map<string, State>();

			for (const state of states.values()) {
				const { arr, nv } = state;
				const label = `bsb=${blockSizeBits} step ${step}`;

				for (let i = 0; i <= arr.length; i++) {
					const nb = state.b.build().toBuilder() as ListBuilder<number>;
					nb.insertAt(i, nv);
					const newArr = [...arr.slice(0, i), nv, ...arr.slice(i)];
					expectContent(nb, newArr, `${label} insert(${i})`);
					const key = `${newArr.join(',')}|${nv + 1}|${shapeOf(nb.build())}`;
					if (!next.has(key)) next.set(key, { b: nb, arr: newArr, nv: nv + 1 });
				}

				for (let i = 0; i < arr.length; i++) {
					const nb = state.b.build().toBuilder() as ListBuilder<number>;
					const removed = nb.removeAt(i, undefined);
					expect(removed, `${label} remove(${i})`).toBe(arr[i]);
					const newArr = [...arr.slice(0, i), ...arr.slice(i + 1)];
					expectContent(nb, newArr, `${label} remove(${i})`);
					const key = `${newArr.join(',')}|${nv}|${shapeOf(nb.build())}`;
					if (!next.has(key)) next.set(key, { b: nb, arr: newArr, nv });
				}
			}

			states = next;
		}
	}

	it('blockSizeBits=2, all sequences of up to 7 ops (sizes up to 7, includes tree formation)', () => {
		exhaustive(2, 7);
	});

	it('blockSizeBits=3, all sequences of up to 8 ops (sizes up to 8, single block)', () => {
		exhaustive(3, 8);
	});
});

describe('single-child middle repair branches', () => {
	// Directly construct outer trees whose middle is a single block with one
	// child at minBlockSize, then remove from the middle so the child drops
	// below minBlockSize. `#repairSingleChildMiddle` must run one of its
	// three branches; assert the exact resulting structure and content.
	const blockSizeBitsValues = [2, 3, 4, 5] as const;

	function makeTree(
		blockSizeBits: number,
		leftCount: number,
		middleCount: number,
		rightCount: number,
	): ListBuilder<number> {
		const ctx = List.createContext({
			blockSizeBits,
		}) as unknown as ListContext<number>;
		const ops = ctx.childrenOps;

		const left = ctx.outerBlockBuilder<number>(
			ops.of(Array.from({ length: leftCount }, (_, i): number => i)),
		);
		const middleChild = ctx.outerBlockBuilder<number>(
			ops.of(
				Array.from({ length: middleCount }, (_, i): number => leftCount + i),
			),
		);
		const middle = ctx.innerBlockBuilder<number, OuterBlockBuilder<number>>(
			[middleChild],
			middleCount,
			1,
		);
		const right = ctx.outerBlockBuilder<number>(
			ops.of(
				Array.from(
					{ length: rightCount },
					(_, i): number => leftCount + middleCount + i,
				),
			),
		);

		const tree = ctx.outerTreeBuilder(
			left,
			right,
			middle,
			leftCount + middleCount + rightCount,
		);

		return ctx.builderFrom(tree) as ListBuilder<number>;
	}

	for (const blockSizeBits of blockSizeBitsValues) {
		const maxBlockSize = 1 << blockSizeBits;
		const minBlockSize = maxBlockSize >>> 1;
		// the child has `minBlockSize` elements; removing one drops it to
		// `minBlockSize - 1`, triggering the repair
		const m = minBlockSize;

		it(`blockSizeBits=${blockSizeBits}: merges the child into the left block when it fits`, () => {
			// left + child <= maxBlockSize
			const l = maxBlockSize - minBlockSize + 1;
			const r = maxBlockSize - 2;
			const b = makeTree(blockSizeBits, l, m, r);

			const removedIndex = l + 1;
			const expected = Array.from({ length: l + m + r }, (_, i) => i);
			const removed = expected.splice(removedIndex, 1)[0];
			expect(b.removeAt(removedIndex, undefined)).toBe(removed);

			expectContent(b, expected, 'merge into left');
			expect(shapeOf(b.build())).toBe(`T(B(${l + m - 1}),-,B(${r}))`);
		});

		it(`blockSizeBits=${blockSizeBits}: merges the child into the right block when it fits`, () => {
			// left + child > maxBlockSize, right + child <= maxBlockSize
			const l = maxBlockSize - minBlockSize + 2;
			const r = maxBlockSize - minBlockSize + 1;
			const b = makeTree(blockSizeBits, l, m, r);

			const removedIndex = l + 1;
			const expected = Array.from({ length: l + m + r }, (_, i) => i);
			const removed = expected.splice(removedIndex, 1)[0];
			expect(b.removeAt(removedIndex, undefined)).toBe(removed);

			expectContent(b, expected, 'merge into right');
			expect(shapeOf(b.build())).toBe(`T(B(${l}),-,B(${r + m - 1}))`);
		});

		it(`blockSizeBits=${blockSizeBits}: tops the child up from the left block when neither merge fits`, () => {
			// left + child > maxBlockSize and right + child > maxBlockSize
			const l = maxBlockSize - minBlockSize + 2;
			const r = maxBlockSize - minBlockSize + 2;
			const b = makeTree(blockSizeBits, l, m, r);

			const removedIndex = l + 1;
			const expected = Array.from({ length: l + m + r }, (_, i) => i);
			const removed = expected.splice(removedIndex, 1)[0];
			expect(b.removeAt(removedIndex, undefined)).toBe(removed);

			expectContent(b, expected, 'top up');

			const total = l + m + r - 1;
			if (total > 2 * maxBlockSize) {
				// the tree stays a tree: the middle child is topped up to
				// exactly minBlockSize
				expect(shapeOf(b.build())).toBe(`T(B(${l - 1}),I(B(${m})),B(${r}))`);
			} else {
				// the outer normalized() collapses the whole tree into a
				// single block and splits it in half, subsuming the repair
				const split = Math.floor(total / 2);
				expect(shapeOf(b.build())).toBe(`T(B(${split}),-,B(${total - split}))`);
			}
		});
	}
});

describe('builder deep tree random (level >= 2)', () => {
	/**
	 * KNOWN ISSUE: removing from deep trees (outer middle that is itself a
	 * tree, i.e. level >= 2 structures) can crash or leave underfull blocks:
	 *
	 * - crash: `InvalidStateError` from `SizeTable.takeChildren` reached via
	 *   `InnerBlockBuilder.dropLastChild` during the right-region rebalance
	 *   of `TreeBuilderBase.remove` (triggered by a middle-region remove at
	 *   level >= 1).
	 * - underflow: `OuterBlockBuilder has fewer children than allowed` — a
	 *   leaf block below minBlockSize inside a level >= 2 structure.
	 *
	 * The mixed random test in `list-verify-builder.test.ts` never reaches
	 * these sizes (it stays below maxBlockSize^2 elements), which is why the
	 * issues went unnoticed. Deterministic seeds below reproduce both.
	 */
	const combos: { blockSizeBits: number; level: number; seeds: number[] }[] = [
		// failing today (see comment above):
		{ blockSizeBits: 2, level: 2, seeds: [77, 4242] },
		{ blockSizeBits: 2, level: 3, seeds: [77] },
		{ blockSizeBits: 2, level: 4, seeds: [5] },
		{ blockSizeBits: 3, level: 2, seeds: [77] },
		// passing today — guards the level >= 2 insert/remove paths against
		// regressions:
		{ blockSizeBits: 4, level: 2, seeds: [5] },
		{ blockSizeBits: 5, level: 2, seeds: [5] },
	];

	for (const { blockSizeBits, level, seeds } of combos) {
		for (const seed of seeds) {
			it(`blockSizeBits=${blockSizeBits} level=${level} seed=${seed} maintains valid structure`, () => {
				const maxBlockSize = 1 << blockSizeBits;
				const target = maxBlockSize ** level + maxBlockSize * 2;
				const rng = makeRng(seed);

				const ctx = List.createContext({ blockSizeBits });
				const b = ctx.builder<number>() as ListBuilder<number>;
				const expected: number[] = [];

				for (let i = 0; i < target; i++) {
					b.append(i);
					expected.push(i);
				}
				let nextValue = target;

				const opCount = 2000;
				for (let op = 0; op < opCount; op++) {
					const insert = rng() < 0.5;
					const index = insert
						? Math.floor(rng() * (expected.length + 1))
						: Math.floor(rng() * expected.length);

					if (insert) {
						b.insertAt(index, nextValue);
						expected.splice(index, 0, nextValue);
						nextValue++;
					} else {
						const removed = b.removeAt(index, undefined);
						expect(removed, `op ${op}: removeAt(${index})`).toBe(
							expected[index],
						);
						expected.splice(index, 1);
					}

					expect(b.size, `op ${op}: size`).toBe(expected.length);
					expectContent(b, expected, `op ${op}`);
				}
			});
		}
	}

	it('minimized crash repro: 24 appends then a 15-op sequence at blockSizeBits=2', () => {
		const ctx = List.createContext({ blockSizeBits: 2 });
		const b = ctx.builder<number>() as ListBuilder<number>;
		const expected: number[] = [];

		for (let i = 0; i < 24; i++) {
			b.append(i);
			expected.push(i);
		}
		let nextValue = 24;

		// minimized (greedy single-op removal) from the seed-77 level-2 run:
		// crashes with `InvalidStateError` in SizeTable.takeChildren via
		// InnerBlockBuilder.dropLastChild. Indices are clamped exactly like
		// the minimizer did (out-of-range indices become no-ops / edge ops).
		const ops: [kind: 'insert' | 'remove', index: number][] = [
			['insert', 4],
			['insert', 4],
			['insert', 6],
			['insert', 46],
			['insert', 25],
			['insert', 18],
			['remove', 29],
			['remove', 61],
			['remove', 27],
			['remove', 42],
			['remove', 9],
			['insert', 15],
			['remove', 35],
			['remove', 28],
			['remove', 47],
		];

		for (const [kind, rawIndex] of ops) {
			if (kind === 'insert') {
				const index = Math.min(rawIndex, expected.length);
				b.insertAt(index, nextValue);
				expected.splice(index, 0, nextValue);
				nextValue++;
			} else {
				const index = Math.min(rawIndex, expected.length - 1);
				const removed = b.removeAt(index, undefined);
				expect(removed, `remove(${rawIndex})`).toBe(expected[index]);
				expected.splice(index, 1);
			}
			verifyBuilder(b, `${kind}(${rawIndex})`);
			expect(b.size, `${kind}(${rawIndex}): size`).toBe(expected.length);
		}
	});
});
