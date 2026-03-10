import type { ListContext } from '#list/context';

export abstract class NonLeafBase<T> {
	constructor(
		readonly context: ListContext,
		readonly ops = context.leafChildrenOps,
	) {}

	abstract get itemsLength(): number;
	abstract get(index: number): T;
}
