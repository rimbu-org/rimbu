import type { RMap } from '@rimbu/collection-types';
import type { ArrayNonEmpty, RelatedTo, ToJSON } from '@rimbu/common/types';
import type { MultiSet } from '@rimbu/multiset';

import type { ContextImpl } from '#multiset/context-factory';
import type { MultiSetBase } from '#multiset/types';

import * as Arr from '@rimbu/base/arr';
import * as RimbuError from '@rimbu/base/rimbu-error';
import {
	EmptyBase,
	NonEmptyBase,
} from '@rimbu/collection-types/common/empty-base';
import { TraverseState } from '@rimbu/common/traverse-state';
import { type FastIterator, Stream, type StreamSource } from '@rimbu/stream';

export class MultiSetEmpty<T> extends EmptyBase implements MultiSetBase<T> {
	declare _NonEmptyType: MultiSet.NonEmpty<T>;

	constructor(readonly context: ContextImpl<T>) {
		super();
	}

	add(elem: T, amount?: number): any {
		if (undefined !== amount && amount <= 0) return this;

		const addAmount = amount ?? 1;

		const countMap = this.context.countMapContext.of([elem, addAmount]);

		return this.context.createNonEmpty(countMap, addAmount);
	}

	get countMap(): RMap<T, number> {
		return this.context.countMapContext.empty();
	}

	get sizeDistinct(): 0 {
		return 0;
	}

	streamDistinct(): Stream<T> {
		return Stream.empty();
	}

	addAll(values: StreamSource<T>): any {
		if (this.context.isNonEmptyInstance<T>(values) && values.context === this.context) {
			return values;
		}

		return this.context.from(values);
	}

	addAllWithCounts(
		valueCounts: StreamSource<readonly [T, number]>,
	): MultiSet<T> {
		if (Stream.isEmptyStreamSourceInstance(valueCounts)) return this;

		const builder = this.toBuilder();
		builder.addAllWithCounts(valueCounts);
		return builder.build();
	}

	remove(): this {
		return this;
	}

	removeAll(): this {
		return this;
	}

	streamWithCounts(): Stream<readonly [T, number]> {
		return Stream.empty();
	}

	union<U extends T>(other: MultiSet<U>): any {
		return this.addAll(other);
	}

	intersect(): MultiSet<T> {
		return this.context.empty();
	}

	difference(): MultiSet<T> {
		return this.context.empty();
	}

	symDifference<U extends T>(other: MultiSet<U>): MultiSet<T> {
		return this.addAll(other);
	}

	setCount(elem: T, amount: number): MultiSet<T> {
		return this.add(elem, amount);
	}

	modifyCount(value: T, update: (currentCount: number) => number): MultiSet<T> {
		return this.add(value, update(0));
	}

	has(): false {
		return false;
	}

	count(): 0 {
		return 0;
	}

	forEach(): void {
		//
	}

	filterWithCounts(): any {
		return this;
	}

	toBuilder(): MultiSet.Builder<T> {
		return this.context.builder();
	}

	toArray(): [] {
		return [];
	}

	toString(): string {
		return `${this.context.typeTag}()`;
	}

	toJSON(): ToJSON<[any, number][]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}
}

export class MultiSetNonEmpty<T>
	extends NonEmptyBase<T>
	implements MultiSetBase.NonEmpty<T>
{
	declare _NonEmptyType: MultiSet.NonEmpty<T>;

	constructor(
		readonly context: ContextImpl<T>,
		readonly countMap: RMap.NonEmpty<T, number>,
		readonly size: number,
	) {
		super();
	}

	assumeNonEmpty(): this {
		return this;
	}

	copy(countMap: RMap.NonEmpty<T, number>, size: number): MultiSet.NonEmpty<T> {
		if (countMap === this.countMap) return this;

		return this.context.createNonEmpty<T>(countMap, size);
	}

	copyE(countMap: RMap<T, number>, size: number): MultiSet<T> {
		if (countMap.nonEmpty()) return this.copy(countMap, size);
		return this.context.empty();
	}

	get sizeDistinct(): number {
		return this.countMap.size;
	}

	stream(): Stream.NonEmpty<T> {
		return this.countMap
			.stream()
			.flatMap(
				([value, count]): Stream.NonEmpty<T> => Stream.of(value).repeat(count),
			);
	}

	streamDistinct(): Stream.NonEmpty<T> {
		return this.countMap.streamKeys();
	}

	has<U>(elem: RelatedTo<T, U>): boolean {
		return this.countMap.hasKey(elem);
	}

	count<U>(elem: RelatedTo<T, U>): number {
		return this.countMap.get(elem, 0);
	}

	add(elem: T, amount = 1): MultiSet.NonEmpty<T> {
		if (amount <= 0) return this;

		return this.copy(
			this.countMap
				.modifyAt(elem, {
					ifNew: { set: amount },
					ifExists: { update: (count): number => count + amount },
				})
				.assumeNonEmpty(),
			this.size + amount,
		);
	}

	addAll(values: StreamSource<T>): MultiSet.NonEmpty<T> {
		if (Stream.isEmptyStreamSourceInstance(values)) return this;

		const builder = this.toBuilder();
		builder.addAll(values);
		return builder.build().assumeNonEmpty();
	}

	addAllWithCounts(
		valueCounts: StreamSource<readonly [T, number]>,
	): MultiSet.NonEmpty<T> {
		if (Stream.isEmptyStreamSourceInstance(valueCounts)) return this;

		const builder = this.toBuilder();
		builder.addAllWithCounts(valueCounts);
		return builder.build().assumeNonEmpty();
	}

	setCount(elem: T, amount: number): MultiSet<T> {
		if (amount <= 0) return this.remove(elem);

		let sizeDelta = amount;

		const newCountMap = this.countMap
			.modifyAt(elem, {
				ifNew: { set: amount },
				ifExists: {
					update: (count): number => {
						sizeDelta -= count;
						return amount;
					},
				},
			})
			.assumeNonEmpty();

		return this.copyE(newCountMap, this.size + sizeDelta);
	}

	modifyCount(value: T, update: (currentCount: number) => number): MultiSet<T> {
		let sizeDelta = 0;

		const newCountMap = this.countMap
			.modifyAt(value, {
				ifNew: {
					create: (skip) => {
						const newAmount = update(0);
						if (newAmount <= 0) return skip;
						sizeDelta += newAmount;
						return newAmount;
					},
				},
				ifExists: {
					update: (amount, remove) => {
						sizeDelta -= amount;
						const newAmount = update(amount);

						if (newAmount <= 0) return remove;

						sizeDelta += newAmount;
						return newAmount;
					},
				},
			})
			.assumeNonEmpty();

		return this.copyE(newCountMap, this.size + sizeDelta);
	}

	remove<U>(
		elem: RelatedTo<T, U>,
		options: { amount?: number | 'ALL' } = {},
	): MultiSet<T> {
		const { amount = 1 } = options;

		if (!this.context.isValidElem(elem)) return this as any;

		let newSize = this.size;

		const newCountMap = this.countMap.modifyAt(elem, {
			ifExists: {
				update: (count, remove): number | typeof remove => {
					if (amount === 'ALL') {
						newSize -= count;
						return remove;
					}

					const result = count - amount;
					if (result <= 0) {
						newSize -= count;
						return remove;
					}

					newSize -= amount;
					return result;
				},
			},
		});

		return this.copyE(newCountMap, newSize);
	}

	removeAll<U>(
		elems: StreamSource<RelatedTo<T, U>>,
		options?: { amount?: number | 'ALL' },
	): MultiSet<T> {
		if (Stream.isEmptyStreamSourceInstance(elems)) return this;

		const builder = this.toBuilder();
		builder.removeAll(elems, options);
		return builder.build();
	}

	streamWithCounts(): Stream.NonEmpty<readonly [T, number]> {
		return this.countMap.stream();
	}

	union<U extends T>(other: MultiSet<U>): MultiSet.NonEmpty<T> {
		const builder = this.toBuilder();
		other.countMap.forEach(([value, count]): void => {
			builder.modifyCount(value, (currentCount): number => (currentCount > count ? currentCount : count));
		});
		return builder.build().assumeNonEmpty();
	}

	intersect<U extends T>(other: MultiSet<U>): MultiSet<T> {
		const builder = this.context.builder();
		this.countMap.forEach(([value, count]): void => {
			const otherCount = other.count(value as U);
			if (otherCount > 0) builder.setCount(value, count < otherCount ? count : otherCount);
		});
		return builder.build();
	}

	difference<U extends T>(other: MultiSet<U>): MultiSet<T> {
		const builder = this.toBuilder();
		other.countMap.forEach(([value, count]): void => {
			if (count <= 0) return;
			const currentCount = builder.count(value);
			const newCount = currentCount - count;
			if (newCount <= 0) builder.remove(value, 'ALL');
			else builder.setCount(value, newCount);
		});
		return builder.build();
	}

	symDifference<U extends T>(other: MultiSet<U>): MultiSet<T> {
		const builder = this.toBuilder();
		other.countMap.forEach(([value, count]): void => {
			const currentCount = builder.count(value);
			const newCount = currentCount > count ? currentCount - count : count - currentCount;
			if (newCount <= 0) builder.remove(value, 'ALL');
			else builder.setCount(value, newCount);
		});
		return builder.build();
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed?: boolean; state?: TraverseState } = {},
	): void {
		const { reversed = false, state = TraverseState() } = options;

		if (state.halted) return;

		const it = (this.countMap.stream as any)({ reversed })[
			Symbol.iterator
		]() as FastIterator<[T, number]>;

		let entry: readonly [T, number] | undefined;
		const { halt } = state;

		while (!state.halted && undefined !== (entry = it.fastNext())) {
			const value = entry[0];
			let amount = entry[1];

			while (!state.halted && --amount >= 0) {
				f(value, state.nextIndex(), halt);
			}
		}
	}

	filterWithCounts(
		pred: (valueCount: readonly [T, number], index: number) => boolean,
		options: { negate?: boolean | undefined } = {},
	): any {
		const builder = this.context.builder();

		Stream.applyForEach(
			this.countMap.stream().filter(pred, options),
			builder.setCount,
		);

		if (builder.size === this.size) return this;

		return builder.build();
	}

	toArray(): ArrayNonEmpty<T> {
		let result: T[] = [];

		const it = this.countMap[Symbol.iterator]();
		let entry: readonly [T, number] | undefined;

		while (undefined !== (entry = it.fastNext())) {
			const amount = entry[1];
			if (amount === 1) result.push(entry[0]);
			else {
				const newArray = new Array<T>(amount);
				newArray.fill(entry[0]);
				result = Arr.concat(result, newArray) as T[];
			}
		}

		return result as ArrayNonEmpty<T>;
	}

	toString(): string {
		return this.stream().join({
			start: `${this.context.typeTag}(`,
			sep: `, `,
			end: `)`,
		});
	}

	toJSON(): ToJSON<(readonly [T, number])[]> {
		return {
			dataType: this.context.typeTag,
			value: this.countMap.toArray(),
		};
	}

	toBuilder(): MultiSet.Builder<T> {
		return new MultiSetBuilder<T>(this.context, this);
	}
}

export class MultiSetBuilder<T> implements MultiSetBase.Builder<T> {
	_lock = 0;
	_size = 0;

	constructor(
		readonly context: ContextImpl<T>,
		public source?: MultiSet.NonEmpty<T>,
	) {
		if (undefined !== source) this._size = source.size;
	}

	_countMap?: RMap.Builder<T, number>;

	get countMap(): RMap.Builder<T, number> {
		if (undefined === this._countMap) {
			if (undefined === this.source) {
				this._countMap = this.context.countMapContext.builder();
			} else {
				this._countMap = this.source.countMap.toBuilder();
			}
		}

		return this._countMap;
	}

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	get size(): number {
		return this._size;
	}

	get sizeDistinct(): number {
		return this.source?.sizeDistinct ?? this.countMap.size;
	}

	get isEmpty(): boolean {
		return 0 === this.size;
	}

	has = <U>(value: RelatedTo<T, U>): boolean => {
		return this.source?.has(value) ?? this.countMap.hasKey(value);
	};

	add = (value: T, amount = 1): boolean => {
		this.checkLock();

		if (amount <= 0) return false;
		this._size += amount;
		this.countMap.modifyAt(value, {
			ifNew: { set: amount },
			ifExists: { update: (count): number => count + amount },
		});
		this.source = undefined;
		return true;
	};

	addAll = (source: StreamSource<T>): boolean => {
		this.checkLock();

		return Stream.from(source).filterPure({ pred: this.add }, 1).count() > 0;
	};

	addAllWithCounts = (
		valueCounts: StreamSource<readonly [T, number]>,
	): boolean => {
		this.checkLock();

		return Stream.applyFilter(valueCounts, { pred: this.add }).count() > 0;
	};

	remove = <U>(value: RelatedTo<T, U>, amount: number | 'ALL' = 1): number => {
		this.checkLock();

		if (typeof amount === 'number' && amount <= 0) return 0;
		if (!this.context.isValidElem(value)) return 0;

		let removed = 0;

		this.countMap.modifyAt(value, {
			ifExists: {
				update: (count, remove): number | typeof remove => {
					if (amount === 'ALL') {
						removed = count;
						return remove;
					}

					const result = count - amount;

					if (result <= 0) {
						removed = count;
						return remove;
					}

					removed = amount;
					return result;
				},
			},
		});

		this._size -= removed;

		if (removed > 0) this.source = undefined;

		return removed;
	};

	setCount = (value: T, amount: number): boolean => {
		this.checkLock();

		if (amount <= 0) {
			return this.remove(value, 'ALL') > 0;
		}

		this._size += amount;

		const changed = this.countMap.modifyAt(value, {
			ifNew: { set: amount },
			ifExists: {
				update: (count): number => {
					this._size -= count;
					return amount;
				},
			},
		});

		if (changed) this.source = undefined;

		return changed;
	};

	modifyCount = (
		value: T,
		update: (currentCount: number) => number,
	): boolean => {
		this.checkLock();

		const changed = this.countMap.modifyAt(value, {
			ifNew: {
				create: (skip) => {
					const newAmount = update(0);
					if (newAmount <= 0) return skip;

					this._size += newAmount;
					return newAmount;
				},
			},
			ifExists: {
				update: (currentCount, remove) => {
					this._size -= currentCount;
					const newCount = update(currentCount);

					if (newCount <= 0) return remove;

					this._size += newCount;
					return newCount;
				},
			},
		});

		if (changed) this.source = undefined;

		return changed;
	};

	count = <U>(value: RelatedTo<T, U>): number => {
		return this.source?.count(value) ?? this.countMap.get(value, 0);
	};

	removeAll = <U>(
		values: StreamSource<RelatedTo<T, U>>,
		options?: { amount?: number | 'ALL' },
	): boolean => {
		this.checkLock();

		if (Stream.isEmptyStreamSourceInstance(values)) return false;

		const amount = options?.amount ?? 'ALL';

		return (
			Stream.from(values)
				.mapPure(this.remove, amount)
				.countElement(0, { negate: true }) > 0
		);
	};

	forEach = (
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void => {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		this._lock++;

		const { halt } = state;

		this.countMap.forEach(([value, amount], _, builderHalt): void => {
			let time = 0;

			while (!state.halted && time++ < amount) {
				f(value, state.nextIndex(), halt);
			}

			if (state.halted) builderHalt();
		});

		this._lock--;
	};

	build = (): MultiSet<T> => {
		if (undefined !== this.source) return this.source;

		if (this.isEmpty) return this.context.empty();

		const newCountMap = this.countMap.build().assumeNonEmpty();

		return new MultiSetNonEmpty<T>(this.context, newCountMap, this.size);
	};
}
