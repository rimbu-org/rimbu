import { List } from '@rimbu/list';

import type { ListBuilder } from '#list/mutable/builder';

function makeRng(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state * 1664525 + 1013904223) % 4294967296;
		return state / 4294967296;
	};
}

function normalizeInsertIndex(index: number, size: number): number {
	if (size === 0 || index >= size) return size;
	if (index <= -size) return 0;
	return index < 0 ? size + index : index;
}

function normalizeRemoveIndex(index: number, size: number): number {
	if (size === 0 || index >= size || index < -size) return -1;
	return index < 0 ? size + index : index;
}

const blockSizeBits = 5;
const maxBlockSize = 1 << blockSizeBits;

const ctx = List.createContext({ blockSizeBits });
const b = ctx.builder<number>() as ListBuilder<number>;
const expected: number[] = [];

const rng = makeRng(blockSizeBits * 1337 + 42);

const seedCount = maxBlockSize * 2 + 3;
for (let i = 0; i < seedCount; i++) {
	b.append(i);
	expected.push(i);
}
let nextValue = seedCount;

const nextIndex = () =>
	rng() < 0.2
		? -(Math.floor(rng() * expected.length) + 1)
		: Math.floor(rng() * (expected.length + 1));

for (let op = 0; op < 30; op++) {
	const index = nextIndex();

	if (expected.length === 0 || rng() < 0.55) {
		const value = nextValue++;
		b.insertAt(index, value);
		expected.splice(normalizeInsertIndex(index, expected.length), 0, value);
	} else {
		const normalized = normalizeRemoveIndex(index, expected.length);
		const removed = b.removeAt(index, undefined);
		if (normalized >= 0) {
			if (removed !== expected[normalized]) {
				console.log(`op ${op}: index ${index} removed ${removed} expected ${expected[normalized]}`);
			}
			expected.splice(normalized, 1);
		} else if (undefined !== removed) {
			console.log(`op ${op}: index ${index}: expected no removal but got ${removed}`);
		}
	}

	const list = b.build();
	const errors = (
		list as unknown as { _verifyStructure(errors?: string[]): string[] }
	)._verifyStructure();
	if (errors.length > 0) {
		console.log(`op ${op}: index ${index}: ERRORS: ${errors.join('; ')}`);
		console.log('expected:', expected.join(','));
		console.log('list:', list.toArray().join(','));

		const walk = (node: any, depth: number): void => {
			if (undefined === node || null === node) return;
			const name = node.constructor.name;
			if (name.startsWith('InnerBlock') || name.startsWith('OuterBlock')) {
				const nr = (node as { _nrChildren?: number })._nrChildren;
				console.log('  '.repeat(depth) + `${name} size=${node.size} _nrChildren=${nr}`);
				for (const c of (node as { children?: unknown[] }).children ?? []) {
					walk(c, depth + 1);
				}
			} else if (name.startsWith('InnerTree') || name.startsWith('OuterTree')) {
				console.log('  '.repeat(depth) + `${name} size=${node.size}`);
				walk(node.left, depth + 1);
				walk(node.middle, depth + 1);
				walk(node.right, depth + 1);
			}
		};
		walk(list as unknown as { left?: unknown }, 0);
		break;
	}
}
