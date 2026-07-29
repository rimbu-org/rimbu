import type { Int } from '@rimbu/base';

export class SizeTable {
	private constructor(
		readonly cumulativeTable: number[],
		readonly offset: number,
		readonly totalSize: number,
		readonly maxChildSize: number,
		readonly knownIsRegular?: boolean | undefined,
	) {
		this.#_isRegular = knownIsRegular;
	}

	#copy(cumulativeTable: number[], offset: number, totalSize: number) {
		return new SizeTable(cumulativeTable, offset, totalSize, this.maxChildSize);
	}

	#_isRegular: boolean | undefined;

	get nrChildren(): number {
		return this.cumulativeTable.length;
	}

	get isRegular(): boolean {
		if (undefined === this.#_isRegular) {
			const lastChildSize = this.sizeChildAt(-1);
			const soizeWithoutLast = this.totalSize - lastChildSize;

			this.#_isRegular =
				soizeWithoutLast / this.maxChildSize === this.nrChildren - 1;
		}

		return this.#_isRegular;
	}

	sizeChildAt(childIndex: number): number {
		if (childIndex < 0) {
			childIndex = this.nrChildren + childIndex;
		}

		if (this.#_isRegular === true && childIndex !== this.nrChildren - 1) {
			return this.maxChildSize;
		}

		const childCumulative = this.cumulativeTable.at(childIndex)!;
		const previousCumulative =
			childIndex === 0 ? this.offset : this.cumulativeTable.at(childIndex - 1)!;

		return childCumulative - previousCumulative;
	}

	prependChildSize(childSize: number): SizeTable {
		const newOffset = this.offset - childSize;

		return this.#copy(
			[this.offset, ...this.cumulativeTable],
			newOffset,
			this.totalSize + childSize,
		);
	}

	appendChildSize(childSize: number): SizeTable {
		const lastValue = this.cumulativeTable.at(-1)!;

		return this.#copy(
			[...this.cumulativeTable, lastValue + childSize],
			this.offset,
			this.totalSize + childSize,
		);
	}

	getCoordinates(
		index: number,
		options: { forTake?: boolean; noEmptyLast?: boolean } = {},
	): [childIndex: Int.Natural, positionWithinChild: Int.Natural] {
		const { forTake = false, noEmptyLast = false } = options;

		const forTakeOffset = forTake ? 1 : 0;

		const indexWithForTake = index - forTakeOffset;

		if (indexWithForTake >= this.totalSize) {
			const nrChildren = this.nrChildren;

			if (noEmptyLast) {
				const lastChildSize = this.sizeChildAt(-1);

				return [
					(nrChildren - 1) as Int.Natural,
					(lastChildSize - 1) as Int.Natural,
				];
			}
			return [nrChildren as Int.Natural, 0 as Int.Natural];
		}

		if (this.isRegular) {
			const childIndex = Math.floor(indexWithForTake / this.maxChildSize);
			const inChildIndex =
				(indexWithForTake & (this.maxChildSize - 1)) + forTakeOffset;

			return [childIndex as Int.Natural, inChildIndex as Int.Natural];
		}

		let lowChildIndex = Math.floor(indexWithForTake / this.maxChildSize);
		let highChildIndex = this.nrChildren - 1;

		const searchIndex = indexWithForTake + this.offset;

		while (lowChildIndex < highChildIndex) {
			const middleChildIndex = (lowChildIndex + highChildIndex) >>> 1;

			if (this.cumulativeTable[middleChildIndex] <= searchIndex) {
				lowChildIndex = middleChildIndex + 1;
			} else {
				highChildIndex = middleChildIndex;
			}
		}

		const childIndex = lowChildIndex;
		const prevCumulative =
			childIndex === 0 ? this.offset : this.cumulativeTable[childIndex - 1];
		const inChildIndex = searchIndex - prevCumulative;
		return [childIndex as Int.Natural, inChildIndex as Int.Natural];
	}

	static fromSizes(
		sizes: readonly number[],
		maxChildSize: number,
		totalSize?: number,
	): SizeTable {
		const lastChildSize = sizes.at(-1) ?? 0;
		const nrChildren = sizes.length;
		const table = new Array<number>(nrChildren);

		if (
			undefined !== totalSize &&
			totalSize - lastChildSize === maxChildSize * (nrChildren - 1)
		) {
			let cumulative = 0;

			for (let i = 0; i < nrChildren - 1; i++) {
				cumulative += maxChildSize;
				table[i] = cumulative;
			}

			table[nrChildren - 1] = cumulative + lastChildSize;

			return new SizeTable(table, 0, totalSize, maxChildSize, true);
		}

		let previousCumulative = 0;
		let isRegular = true;

		for (let i = 0; i < nrChildren; i++) {
			const childSize = sizes[i];

			if (isRegular && i !== nrChildren - 1) {
				isRegular = childSize === maxChildSize;
			}

			const nextCumulative = previousCumulative + childSize;
			table[i] = nextCumulative;
			previousCumulative = nextCumulative;
		}

		return new SizeTable(table, 0, previousCumulative, maxChildSize, isRegular);
	}

	static fromChildren(
		children: readonly { readonly size: number }[],
		maxChildSize: number,
		totalSize?: number,
	) {
		const lastChildSize = children.at(-1)?.size ?? 0;
		const nrChildren = children.length;
		const table = new Array<number>(nrChildren);

		if (
			undefined !== totalSize &&
			totalSize - lastChildSize === maxChildSize * (nrChildren - 1)
		) {
			let cumulative = 0;

			for (let i = 0; i < nrChildren - 1; i++) {
				cumulative += maxChildSize;
				table[i] = cumulative;
			}

			table[nrChildren - 1] = cumulative + lastChildSize;

			return new SizeTable(table, 0, totalSize, maxChildSize, true);
		}

		let previousCumulative = 0;
		let isRegular = true;

		for (let i = 0; i < nrChildren; i++) {
			const childSize = children[i].size;

			if (isRegular && i !== nrChildren - 1) {
				isRegular = childSize === maxChildSize;
			}

			const nextCumulative = previousCumulative + childSize;
			table[i] = nextCumulative;
			previousCumulative = nextCumulative;
		}

		return new SizeTable(table, 0, previousCumulative, maxChildSize, isRegular);
	}
}
