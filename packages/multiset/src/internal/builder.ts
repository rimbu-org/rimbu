import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { RelatedTo } from '@rimbu/common';
import type { MultiSet } from '@rimbu/multiset';
import type { StreamSource } from '@rimbu/stream';

import type { MultiSetContext } from '#multiset/context-factory';

import { CollectionBuilderBase } from '@rimbu/collection-types/advanced/collection-base';
import { Stream } from '@rimbu/stream';

type MultiSetTypes<T> = Collection.Advanced.Types<
	MultiSet.Advanced.Family<T>,
	T
>;

export class MultiSetBuilder<T, Tp extends MultiSetTypes<T> = MultiSetTypes<T>>
	extends CollectionBuilderBase<T, Tp['_FAM'], Tp>
	implements MultiSet.Builder<T>
{
	constructor(
		readonly context: MultiSetContext<T>,
		public source?: MultiSet.NonEmpty<T>,
	) {
		super();
		if (undefined !== source) this.#size = source.size;
	}

	#size = 0;
	#countMap: MapCollection.Builder<T, number> | undefined = undefined;

	get countMap(): MapCollection.Builder<T, number> {
		if (undefined === this.#countMap) {
			if (undefined === this.source) {
				this.#countMap =
					this.context.countMapContext.builder<readonly [T, number]>();
			} else {
				this.#countMap = this.source.countMap.toBuilder();
				this.source = undefined;
			}
		}

		return this.#countMap;
	}

	get size(): number {
		return this.#size;
	}

	get sizeDistinct(): number {
		if (undefined !== this.source) return this.source.sizeDistinct;
		return this.countMap.size;
	}

	has<U = T>(value: RelatedTo<T, U>): boolean {
		return this.count(value) > 0;
	}

	count<U = T>(value: RelatedTo<T, U>): number {
		if (undefined !== this.source) return this.source.count(value);
		return this.countMap.get(value, 0);
	}

	add = (value: T, amount = 1): boolean => {
		this.checkLock();

		if (amount <= 0) return false;

		this.countMap.modifyAtKey(value, {
			ifNew: { set: amount },
			ifExists: { update: (count: number): number => count + amount },
		});
		this.#size += amount;

		return true;
	};

	addEach = (values: StreamSource<T>): boolean => {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(values)) return false;

		const size = this.size;

		Stream.from(values).forEachPure(this.add);

		return this.size !== size;
	};

	addEachWithCounts(valueCounts: StreamSource<readonly [T, number]>): boolean {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(valueCounts)) return false;

		const size = this.#size;

		Stream.applyForEach(valueCounts, this.add);

		return this.size !== size;
	}

	remove = <U = T>(value: RelatedTo<T, U>, amount = 1): number => {
		this.checkLock();

		if (amount <= 0 || !this.context.isValidElem(value)) return 0;

		return this.modifyCount(value, (currentCount) => currentCount - amount);
	};

	removeEach = <U = T>(values: StreamSource<RelatedTo<T, U>>): boolean => {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(values)) return false;

		const size = this.size;
		Stream.from(values).forEachPure(this.remove);
		return this.size !== size;
	};

	removeAll = <U = T>(value: RelatedTo<T, U>): boolean => {
		this.checkLock();

		if (!this.context.isValidElem(value)) return false;

		return this.modifyCount(value, () => 0) !== 0;
	};

	setCount(value: T, amount: number): number {
		this.checkLock();

		return this.modifyCount(value, () => amount);
	}

	modifyCount(value: T, update: (currentCount: number) => number): number {
		this.checkLock();

		const size = this.size;

		this.countMap.modifyAtKey(value, {
			ifNew: {
				create: (skip) => {
					const newCount = update(0);

					if (newCount <= 0) return skip;
					this.#size += newCount;
					return newCount;
				},
			},
			ifExists: {
				update: (currentAmount, remove) => {
					const newCount = update(currentAmount);
					if (newCount <= 0) {
						this.#size -= currentAmount;
						return remove;
					}
					this.#size += newCount - currentAmount;
					return newCount;
				},
			},
		});

		return this.size - size;
	}

	clear = (): void => {
		this.checkLock();

		if (this.#size === 0) return;

		this.#countMap = undefined;
		this.#size = 0;
	};

	forEach(f: (value: T) => void): void {
		this.startIteration();

		try {
			if (undefined !== this.source) {
				this.source.forEach(f);
			} else {
				this.countMap.forEach(([value, count]) => {
					let i = -1;

					while (++i < count) f(value);
				});
			}
		} finally {
			this.endIteration();
		}
	}

	build(): Tp['_NORMAL'] {
		if (undefined !== this.source) {
			return this.source;
		}

		if (this.#size <= 0) return this.context.empty();

		return this.context.createNonEmpty(
			this.countMap.build().assumeNonEmpty(),
			this.#size,
		);
	}
}
