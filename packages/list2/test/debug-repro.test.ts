import { describe, it } from 'bun:test';

import { List } from '@rimbu/list';

function dump(node: any, indent = ''): void {
	if (!node) return;
	const name = node.constructor.name;
	const level = node.level;
	if (node.left && node.right && !node._nrChildren) {
		console.log(`${indent}${name} level=${level} size=${node.size}`);
		dump(node.left, indent + '  [L] ');
		dump(node.middle, indent + '  [M] ');
		dump(node.right, indent + '  [R] ');
	} else if (typeof node._nrChildren === 'number' && typeof node.childAt === 'function') {
		console.log(`${indent}${name} level=${level} size=${node.size} childSizes=[${Array.from({ length: node._nrChildren }, (_, i) => node.childAt(i)?.size ?? -1)}]`);
		for (let i = 0; i < node._nrChildren; i++) {
			dump(node.childAt(i), indent + '  ');
		}
	} else {
		console.log(`${indent}${name} level=${level} size=${node.size}`);
	}
}

describe('debug', () => {
	it('b2 structure dump', () => {
		const blockSizeBits = 2;
		const maxBlockSize = 1 << blockSizeBits;
		const totalElements = maxBlockSize * maxBlockSize * 2;

		const ctx = List.createContext({ blockSizeBits });
		let list: List<number> = ctx.empty<number>();
		for (let i = 0; i < totalElements; i++) list = list.append(i);

		let nextValue = totalElements;
		const insert = (index: number, amount = 1) => {
			const inserted = Array.from({ length: amount }, () => nextValue++);
			list = list.insertAt(index, ctx.from(inserted));
		};

		insert(0, 2);
		insert(1);
		insert(3);
		insert(4);
		insert(5);

		const left = list.take(18);
		const right = list.drop(18);
		const leftTree = left.concat(ctx.from([38]));
		const full = leftTree.concat(right);

		console.log('=== left ===');
		dump(left as any);
		console.log('=== right ===');
		dump(right as any);
		console.log('=== leftTree ===');
		dump(leftTree as any);
		console.log('=== full ===');
		dump(full as any);
	});
});
