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
		readonly context: Tp['_CONTEXT'],
		public source?: Tp['_NON_EMPTY'],
	) {
		super();
		if (undefined !== source) this.#size = source.size;
	}

	#size = 0;
	#changed = false;
	#countMap: MapCollection.Builder<T, number> | undefined = undefined;

	get countMap(): MapCollection.Builder<T, number> {
		if (undefined === this.#countMap) {
			if (undefined === this.source) {
				this.#countMap =
					this.context.countMapContext.builder<readonly [T, number]>();
			} else {
				this.#countMap = this.source.countMap.toBuilder();
			}
		}

		return this.#countMap as MapCollection.Builder<T, number>;
	}

	get size(): number {
		return this.#size;
	}

	get sizeDistinct(): number {
		return this.countMap.size;
	}

	has<U = T>(value: RelatedTo<T, U>): boolean {
		return this.count(value) > 0;
	}

	count<U = T>(value: RelatedTo<T, U>): number {
		return this.countMap.get(value as any, 0) as number;
	}

	add = (value: T, amount = 1): boolean => {
		this.checkLock();

		if (amount <= 0) return false;

		this.countMap.modifyAtKey(value, {
			ifNew: { set: amount },
			ifExists: { update: (count: number): number => count + amount },
		});
		this.#size += amount;
		this.#changed = true;
		return true;
	};

	addAll = (values: StreamSource<T>): boolean => {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(values)) return false;

		const size = this.size;

		Stream.from(values).forEachPure(this.add);

		return this.size !== size;
	};

	addAllWithCounts(valueCounts: StreamSource<readonly [T, number]>): boolean {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(valueCounts)) return false;

		const size = this.#size;

		Stream.applyForEach(valueCounts, this.add);

		return this.size !== size;
	}

	remove = <U = T>(value: RelatedTo<T, U>, amount = 1): number => {
		this.checkLock();

		if (amount <= 0 || !this.context.isValidElem(value)) return 0;

		let amountRemoved = 0;

		this.countMap.modifyAtKey(value, {
			ifExists: {
				update: (currentAmount, removeToken) => {
					const newAmount = Math.max(0, currentAmount - amount);
					amountRemoved = currentAmount - newAmount;
					return newAmount > 0 ? newAmount : removeToken;
				},
			},
		});

		this.#size -= amountRemoved;
		return amountRemoved;
	};

	removeAll = <U = T>(values: StreamSource<RelatedTo<T, U>>): boolean => {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(values)) return false;

		const size = this.size;

		Stream.from(values).forEachPure(this.remove);

		return this.size !== size;
	};

	setCount(value: T, amount: number): boolean {
		this.checkLock();

		const current = this.count(value);

		if (amount <= 0) {
			if (current <= 0) return false;
			this.countMap.removeKey(value);
			this.#size -= current;
			this.#changed = true;
			return true;
		}

		if (amount === current) return false;

		this.countMap.set(value, amount);
		this.#size += amount - current;
		this.#changed = true;
		return true;
	}

	modifyCount(value: T, update: (currentCount: number) => number): boolean {
		this.checkLock();

		return this.setCount(value, update(this.count(value)));
	}

	clear = (): void => {
		this.checkLock();

		this.countMap.clear();
		this.#size = 0;
		this.#changed = true;
	};

	forEach(f: (value: T) => void): void {
		this.startIteration();

		try {
			this.countMap.forEach(([value, count]) => {
				let i = -1;

				while (++i < count) f(value);
			});
		} finally {
			this.endIteration();
		}
	}

	build(): Tp['_NORMAL'] {
		if (!this.#changed && undefined !== this.source) {
			return this.source as unknown as Tp['_NORMAL'];
		}

		if (this.#size <= 0) return this.context.empty() as Tp['_NORMAL'];

		const context = this.context as unknown as MultiSetContext<T>;
		return context.createNonEmpty(
			this.countMap.build() as any,
			this.#size,
		) as any;
	}
}
