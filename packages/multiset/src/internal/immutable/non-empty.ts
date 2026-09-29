import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common';
import type { MultiSet } from '@rimbu/multiset';
import type { StreamSource } from '@rimbu/stream';

import type { MultiSetContext } from '#multiset/context-factory';

import { ValuedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { Stream } from '@rimbu/stream';

type MultiSetTypesNonEmpty<T> = Collection.Advanced.TypesNonEmpty<
	MultiSet.Advanced.Family<T>,
	T
>;

const MultiSetNonEmptyMixin = ValuedCollectionNonEmpty.WithMixin(
	CollectionNonEmpty.Constructor,
);

export class MultiSetNonEmptyBase<
		T,
		Tp extends MultiSetTypesNonEmpty<T> = MultiSetTypesNonEmpty<T>,
	>
	extends MultiSetNonEmptyMixin<T, MultiSet.Advanced.Family<T>, Tp>
	implements MultiSet.NonEmpty<T>
{
	constructor(
		readonly context: MultiSetContext<T>,
		readonly countMap: MapCollection.NonEmpty<T, number>,
		readonly size: number,
	) {
		super(context);
	}

	#copy(
		countMap: MapCollection.NonEmpty<T, number>,
		size: number,
	): MultiSet.NonEmpty<T> {
		if (countMap === this.countMap && size === this.size) {
			return this;
		}

		return this.context.createNonEmpty(countMap, size);
	}

	get sizeDistinct(): number {
		return this.countMap.size;
	}

	stream(): Stream.NonEmpty<T> {
		return this.countMap
			.stream()
			.flatMap(([value, count]) => Stream.of(value).repeat(count));
	}

	streamDistinct(): Stream.NonEmpty<T> {
		return this.countMap.streamKeys();
	}

	streamWithCounts(): Stream.NonEmpty<readonly [T, number]> {
		return this.countMap.stream();
	}

	has = <U = T>(value: RelatedTo<T, U>): boolean => {
		return this.countMap.has(value);
	};

	count = <U = T>(value: RelatedTo<T, U>): number => {
		return this.countMap.get(value, 0);
	};

	add(value: T, amount = 1): MultiSet.NonEmpty<T> {
		if (amount <= 0) return this;

		const countMap = this.countMap
			.modifyAtKey(value, {
				ifNew: { set: amount },
				ifExists: { update: (count: number): number => count + amount },
			})
			.assumeNonEmpty();

		return this.#copy(countMap, this.size + amount);
	}

	addEach(values: StreamSource<T>): MultiSet.NonEmpty<T> {
		if (Stream.isEmptyStreamSourceInstance(values)) return this;

		const builder = this.toBuilder();
		builder.addEach(values);

		return builder.build().assumeNonEmpty();
	}

	addEachWithCounts(
		valueCounts: StreamSource<readonly [T, number]>,
	): MultiSet.NonEmpty<T> {
		if (Stream.isEmptyStreamSourceInstance(valueCounts)) return this;

		const builder = this.toBuilder();
		builder.addEachWithCounts(valueCounts);
		return builder.build().assumeNonEmpty();
	}

	setCount<N extends number>(
		value: T,
		amount: N,
	): 0 extends N ? MultiSet<T> : MultiSet.NonEmpty<T>;
	setCount(value: T, amount: number): MultiSet<T> {
		return this.modifyCount(value, () => amount);
	}

	modifyCount(value: T, update: (currentCount: number) => number): MultiSet<T> {
		let newSize = this.size;

		const newCountMap = this.countMap.modifyAtKey(value, {
			ifNew: {
				create: (skip) => {
					const newCount = update(0);

					if (newCount <= 0) return skip;
					newSize += newCount;
					return newCount;
				},
			},
			ifExists: {
				update: (currentAmount, remove) => {
					const newCount = update(currentAmount);

					if (newCount <= 0) {
						newSize -= currentAmount;
						return remove;
					}
					newSize += newCount - currentAmount;
					return newCount;
				},
			},
		});

		if (newSize === this.size) return this;

		if (newCountMap.nonEmpty()) {
			return this.#copy(newCountMap, newSize);
		}

		return this.context.empty();
	}

	remove<U = T>(value: RelatedTo<T, U>, amount = 1): MultiSet<T> {
		if (amount <= 0 || !this.context.isValidElem(value)) return this;

		return this.modifyCount(value, (value) => value - amount);
	}

	removeEach<U = T>(values: StreamSource<RelatedTo<T, U>>): MultiSet<T> {
		if (Stream.isEmptyStreamSourceInstance(values)) return this;
		if (this === (values as unknown)) return this.context.empty();

		const builder = this.toBuilder();
		builder.removeEach(values);

		if (builder.size === this.size) return this;
		return builder.build();
	}

	removeAll<U = T>(value: RelatedTo<T, U>): MultiSet<T> {
		if (!this.context.isValidElem(value)) return this;

		const removeResult = this.countMap.removeKeyAndReturn(value);

		if (!removeResult.hasResult) return this;

		if (removeResult.collection.nonEmpty()) {
			return this.#copy(
				removeResult.collection,
				this.size - removeResult.result,
			);
		}

		return this.context.empty();
	}

	mapCounts(f: (currentCount: number, value: T) => number): MultiSet<T> {
		let newCount = 0;

		return this.#copy(
			this.countMap.mapValues((currentCount, value) => {
				const result = f(currentCount, value);
				newCount += result;
				return result;
			}),
			newCount,
		);
	}

	union<U extends T>(other: StreamSource<U>): MultiSet.NonEmpty<T> {
		if (other === this) {
			return this.mapCounts((count) => count * 2).assumeNonEmpty();
		}

		const builder = this.toBuilder();
		builder.addEach(other);
		return builder.build().assumeNonEmpty();
	}

	intersection<U extends T>(other: StreamSource<U>): MultiSet<T> {
		if (Stream.isEmptyStreamSourceInstance(other)) return this.context.empty();

		if (other instanceof MultiSetNonEmptyBase) {
			if (other === this) return this;

			const iter = other.streamWithCounts()[Symbol.iterator]();
			let entry: readonly [T, number] | undefined;

			const builder = this.toBuilder();

			while (undefined !== (entry = iter.fastNext())) {
				const [value, amount] = entry;
				builder.modifyCount(value, (currentCount) =>
					Math.min(currentCount, amount),
				);
			}

			this.streamDistinct()
				.filterPure({ pred: other.has, negate: true })
				.forEachPure(builder.removeAll);

			return builder.build();
		}

		const otherMultiSet = this.context.from(other);
		return this.intersection(otherMultiSet);
	}

	difference<U extends T>(other: StreamSource<U>): MultiSet<T> {
		if (Stream.isEmptyStreamSourceInstance(other)) return this;

		const builder = this.toBuilder();

		if (other instanceof MultiSetNonEmptyBase) {
			if (other === this) return this.context.empty();

			const iter = other.streamWithCounts()[Symbol.iterator]();
			let entry: readonly [T, number] | undefined;
			while (undefined !== (entry = iter.fastNext())) {
				const [value, amount] = entry;
				builder.modifyCount(value, (currentCount) => currentCount - amount);
			}
		} else {
			const iter = Stream.from(other)[Symbol.iterator]();
			const done = Symbol();
			let value: T | typeof done;

			while (done !== (value = iter.fastNext(done))) {
				builder.modifyCount(value, (currentCount) => currentCount - 1);
			}
		}

		return builder.build();
	}

	symmetricDifference<U extends T>(other: StreamSource<U>): MultiSet<T> {
		if (Stream.isEmptyStreamSourceInstance(other)) return this;

		if (other === this) return this.context.empty();

		const builder = this.toBuilder();

		if (other instanceof MultiSetNonEmptyBase) {
			const iter = other.streamWithCounts()[Symbol.iterator]();
			let entry: readonly [T, number] | undefined;

			while (undefined !== (entry = iter.fastNext())) {
				const [value, amount] = entry;

				builder.modifyCount(value, (currentCount) =>
					Math.abs(currentCount - amount),
				);
			}
		} else {
			const iter = Stream.from(other)[Symbol.iterator]();
			const done = Symbol();
			let value: T | typeof done;

			while (done !== (value = iter.fastNext(done))) {
				builder.modifyCount(value, (currentCount) =>
					Math.abs(currentCount - 1),
				);
			}
		}

		return builder.build();
	}

	filterWithCounts<TF extends T>(
		pred: (valueCount: readonly [T, number]) => valueCount is [TF, number],
		options: { negate: true },
	): MultiSet<TF extends never ? T : Exclude<T, TF>>;
	filterWithCounts<TF extends T>(
		pred: (valueCount: readonly [T, number]) => valueCount is [TF, number],
		options?: { negate?: false | undefined } | undefined,
	): MultiSet<TF>;
	filterWithCounts(
		pred: (valueCount: readonly [T, number]) => boolean,
		options?: { negate?: boolean | undefined } | undefined,
	): MultiSet<T> {
		const builder = this.context.builder<T>();
		Stream.applyForEach(
			this.streamWithCounts().filterPure({
				pred,
				negate: options?.negate,
			}),
			builder.add,
		);

		if (builder.size === this.size) return this;

		return builder.build();
	}

	filter(
		pred: (value: T) => boolean,
		options: { negate?: boolean | undefined } = {},
	): MultiSet<T> {
		const builder = this.context.builder<T>();

		this.stream()
			.filterPure({ pred, negate: options.negate })
			.forEachPure(builder.add, 1);

		if (builder.size === this.size) return this;

		return builder.build();
	}

	forEach(f: (value: T) => void): void {
		const iter = this.streamWithCounts()[Symbol.iterator]();
		let entry: readonly [T, number] | undefined;

		while (undefined !== (entry = iter.fastNext())) {
			const [value, count] = entry;
			let i = -1;

			while (++i < count) f(value);
		}
	}

	toArray(): ArrayNonEmpty<T> {
		const result = Array<T>(this.size) as ArrayNonEmpty<T>;
		const iter = this.streamWithCounts()[Symbol.iterator]();

		let entry: readonly [T, number] | undefined;
		let index = 0;

		while (undefined !== (entry = iter.fastNext())) {
			const [value, count] = entry;
			result.fill(value, index, index + count);
			index += count;
		}

		return result;
	}

	toBuilder(): MultiSet.Builder<T> {
		return this.context.createBuilder(this);
	}

	toString(): string {
		return this.stream().join({
			start: `${this.context.typeTag}(`,
			sep: ', ',
			end: ')',
		});
	}
}
