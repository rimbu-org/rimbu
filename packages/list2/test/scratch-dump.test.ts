import { List } from '@rimbu/list';

const ctx = List.createContext({ blockSizeBits: 2 });

function walk(node: any, depth: number): void {
	if (undefined === node || null === node) return;
	const name = node.constructor.name;
	const nrChildren = (node as { _nrChildren?: number })._nrChildren;

	if (name === 'InnerBlock' || name === 'InnerBlockLeftRight' || name === 'InnerBlockRightLeft') {
		const table = (node as { cachedSizeTable?: { nrChildren: number; cumulativeTable: number[] } })
			.cachedSizeTable;
		console.log(
			'  '.repeat(depth) +
				`${name} _nrChildren=${nrChildren} size=${node.size} table=${table?.nrChildren ?? 'none'} cum=[${table?.cumulativeTable}]`,
		);
		for (const c of (node as { children: unknown[] }).children ?? []) walk(c, depth + 1);
	} else if (name.startsWith('InnerTree') || name.startsWith('OuterTree')) {
		console.log('  '.repeat(depth) + `${name} size=${node.size} left/middle/right:`);
		walk(node.left, depth + 1);
		walk(node.middle, depth + 1);
		walk(node.right, depth + 1);
	} else {
		console.log('  '.repeat(depth) + `${name} size=${node.size}`);
	}
}

function drain(): void {
	let b = ctx.builder<number>();
	for (let i = 0; i < 32; i++) b.append(i);
	const expected: number[] = Array.from({ length: 32 }, (_, i) => i);

	let step = 0;
	while (expected.length > 0) {
		const index = step % 2 === 0 ? 0 : expected.length - 1;
		b.removeAt(index, undefined);
		expected.splice(index, 1);
		for (let i = 0; i < expected.length; i++) b.at(i);
		const list = b.build();
		const errors = (
			list as unknown as { _verifyStructure(errors?: string[]): string[] }
		)._verifyStructure();
		if (errors.length > 0) {
			console.log(`FAIL at step ${step} (index ${index}): ${errors.join('; ')}`);
			walk(list as unknown as { left?: unknown }, 0);
			return;
		}
		step++;
	}
}

drain();
