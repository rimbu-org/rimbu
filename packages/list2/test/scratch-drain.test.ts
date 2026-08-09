import { List } from '@rimbu/list';

import type { ListBuilder } from '#list/mutable/builder';

const blockSizeBits = 2;
const maxBlockSize = 1 << blockSizeBits;

const ctx = List.createContext({ blockSizeBits });
const b = ctx.builder<number>() as ListBuilder<number>;
for (let i = 0; i < 32; i++) b.append(i);

const expected: number[] = Array.from({ length: 32 }, (_, i) => i);

function verify(list: List<number>): string[] {
	if (list.isEmpty) return [];
	return (
		list as unknown as { _verifyStructure(errors?: string[]): string[] }
	)._verifyStructure();
}

function dumpInner(node: any, depth: number): void {
	if (undefined === node || null === node) return;
	if (typeof node.nrChildren === 'number') {
		const table = node.cachedSizeTable as
			| { nrChildren: number; cumulativeTable: number[] }
			| undefined;
		console.log(
			'  '.repeat(depth) +
				`${node.constructor.name} nrChildren=${node.nrChildren} table=${table?.nrChildren ?? 'none'} cum=[${table?.cumulativeTable}]`,
		);
	}
	if (undefined !== node.middle) {
		dumpInner(node.left, depth + 1);
		dumpInner(node.middle, depth + 1);
		dumpInner(node.right, depth + 1);
	} else if (undefined !== node.children) {
		for (const c of node.children) dumpInner(c, depth + 1);
	}
}

let step = 0;
while (expected.length > 0) {
	const index = step % 2 === 0 ? 0 : expected.length - 1;
	const removed = b.removeAt(index, undefined);
	const expRemoved = expected[index];
	if (removed !== expRemoved) {
		console.log(`STEP ${step}: index ${index}: removed ${removed} expected ${expRemoved}`);
	}
	expected.splice(index, 1);

	const list = b.build();
	for (let i = 0; i < expected.length; i++) {
		if (b.at(i) !== expected[i]) {
			console.log(`STEP ${step}: builder at(${i}) = ${b.at(i)} expected ${expected[i]}`);
		}
		if (list.at(i) !== expected[i]) {
			console.log(`STEP ${step}: list at(${i}) = ${list.at(i)} expected ${expected[i]}`);
		}
	}

	const errors = verify(list);
	if (errors.length > 0) {
		console.log(`STEP ${step}: index ${index} removed ${removed}: VERIFY ERRORS:`);
		for (const e of errors) console.log('  ', e);
		dumpInner(list as unknown as { left?: unknown }, 0);
		break;
	}
	step++;
}
