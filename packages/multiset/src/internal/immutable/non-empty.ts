import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { RelatedTo } from '@rimbu/common';
import type { MultiSet } from '@rimbu/multiset';
import type { StreamSource } from '@rimbu/stream';

import type { MultiSetContext } from '#multiset/context-factory';

import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { Stream } from '@rimbu/stream';

type MultiSetTypesNonEmpty<T> = Collection.Advanced.TypesNonEmpty<
	MultiSet.Advanced.Family<T>,
	T
>;

export class MultiSetNonEmptyBase<
	T,
	Tp extends MultiSetTypesNonEmpty<T> = MultiSetTypesNonEmpty<T>,
> extends CollectionNonEmpty.Base<T, Tp> {
	constructor(
		readonly context: Tp['_CONTEXT'],
		readonly countMap: MapCollection.NonEmpty<T, number>,
		readonly size: number,
	) {
		super();
	}

	get sizeDistinct(): number {
		return this.countMap.size;
	}

	stream(): Tp['_AS_STREAM'] {
		return this.countMap
			.stream()
			.flatMap(([value, count]) => Stream.of(value).repeat(count)) as any;
	}

	streamDistinct(): Tp['_AS_STREAM'] {
		return this.countMap.streamKeys() as any;
	}

	streamWithCounts(): Stream<readonly [T, number]> {
		return this.countMap.stream();
	}

	has<U = T>(value: RelatedTo<T, U>): boolean {
		return this.countMap.has(value as any);
	}

	count<U = T>(value: RelatedTo<T, U>): number {
		return this.countMap.get(value as any, 0) as number;
	}

	add(value: T): Tp['_NON_EMPTY'];
	add<const N extends number>(
		value: T,
		amount: N,
	): 0 extends N ? Tp['_SELF'] : Tp['_NON_EMPTY'];
	add(value: T, amount = 1): Tp['_SELF'] {
		if (amount <= 0) return this as any;

		const countMap = this.countMap
			.modifyAtKey(value, {
				ifNew: { set: amount },
				ifExists: { update: (count: number): number => count + amount },
			})
			.assumeNonEmpty();

		return this.#copy(countMap, this.size + amount) as any;
	}

	addAll(values: StreamSource.NonEmpty<T>): Tp['_NON_EMPTY'];
	addAll(values: StreamSource<T>): Tp['_SELF'];
	addAll(values: StreamSource<T>): Tp['_NORMAL'] {
		if (this === (values as unknown)) return this as any;
		if (Stream.isEmptyStreamSourceInstance(values)) return this as any;

		const builder = this.#copyBuilder();
		builder.addAll(values);
		return builder.build() as any;
	}

	addAllWithCounts(
		valueCounts: StreamSource<readonly [T, number]>,
	): Tp['_SELF'] {
		if (Stream.isEmptyStreamSourceInstance(valueCounts)) return this as any;

		const builder = this.#copyBuilder();
		builder.addAllWithCounts(valueCounts);
		return builder.build() as any;
	}

	setCount<const N extends number>(
		value: T,
		amount: N,
	): 0 extends N ? Tp['_NORMAL'] : Tp['_NON_EMPTY'];
	setCount(value: T, amount: number): Tp['_NORMAL'] | Tp['_NON_EMPTY'] {
		if (amount <= 0) return this.removeAll([value]) as any;

		const current = this.count(value);
		if (current === amount) return this as any;
		const countMap = this.countMap.modifyAtKey(value, {
			ifNew: { set: amount },
			ifExists: { set: amount },
		});

		return this.#copy(countMap, this.size - current + amount) as any;
	}

	modifyCount(
		value: T,
		update: (currentCount: number) => number,
	): Tp['_NORMAL'] {
		return this.setCount(value, update(this.count(value))) as any;
	}

	remove<U = T>(value: RelatedTo<T, U>, amount = 1): Tp['_NORMAL'] {
		if (amount <= 0) return this as any;

		const current = this.count(value);
		if (current <= 0) return this as any;

		const removed = Math.min(current, amount);
		const result = current - removed;

		const countMap =
			result <= 0
				? this.countMap.removeKey(value as any)
				: this.countMap.set(value as any, result);

		return this.#copy(countMap, this.size - removed);
	}

	removeAll<U = T>(values: StreamSource<RelatedTo<T, U>>): Tp['_NORMAL'] {
		if (Stream.isEmptyStreamSourceInstance(values)) return this as any;
		if (this === (values as unknown))
			return this.context.empty() as Tp['_NORMAL'];

		let result = this as unknown as Tp['_NORMAL'];

		Stream.from(values).forEach((value) => {
			result = (result as MultiSet<T>).remove(
				value as any,
				Number.MAX_SAFE_INTEGER,
			) as Tp['_NORMAL'];
		});

		return result;
	}

	union<U extends T>(other: MultiSet.NonEmpty<U>): Tp['_NON_EMPTY'];
	union<U extends T>(other: MultiSet<U>): Tp['_SELF'];
	union<U extends T>(other: MultiSet<U>): Tp['_NORMAL'] | Tp['_NON_EMPTY'] {
		if (other.isEmpty) return this as any;

		const builder = this.#copyBuilder();

		other.streamWithCounts().forEach(([value, count]) => {
			if ((count as number) > builder.count(value as any)) {
				builder.setCount(value as any, count as number);
			}
		});

		return builder.build() as any;
	}

	intersection<U extends T>(other: MultiSet<U>): Tp['_NORMAL'] {
		if (other.isEmpty) return this.context.empty() as Tp['_NORMAL'];

		const builder = this.#copyBuilder();

		this.countMap.stream().forEach(([value, count]) => {
			const otherCount = other.count(value as any);
			const result = Math.min(count, otherCount);

			if (result <= 0) {
				builder.remove(value as any, Number.MAX_SAFE_INTEGER);
			} else {
				builder.setCount(value as any, result);
			}
		});

		return builder.build() as any;
	}

	difference<U extends T>(other: MultiSet<U>): Tp['_NORMAL'] {
		if (other.isEmpty) return this as any;

		const builder = this.#copyBuilder();

		this.countMap.stream().forEach(([value, count]) => {
			const result = count - other.count(value as any);

			if (result <= 0) {
				builder.remove(value as any, Number.MAX_SAFE_INTEGER);
			} else {
				builder.setCount(value as any, result);
			}
		});

		return builder.build() as any;
	}

	symmetricDifference<U extends T>(other: MultiSet<U>): Tp['_NORMAL'] {
		const builder = this.#copyBuilder();

		other.streamWithCounts().forEach(([value, count]) => {
			const result = Math.abs(this.count(value as any) - count);

			if (result <= 0) {
				builder.remove(value as any, Number.MAX_SAFE_INTEGER);
			} else {
				builder.setCount(value as any, result);
			}
		});

		return builder.build() as any;
	}

	filterWithCounts(
		pred: (valueCount: readonly [T, number], index: number) => boolean,
		options?: { negate?: boolean | undefined },
	): Tp['_NORMAL'] {
		const builder = this.context.builder<T>();

		this.countMap
			.stream()
			.filter(pred as any, options)
			.forEach(([value, count]) => {
				builder.setCount(value, count);
			});

		if (builder.size === this.size) return this as any;

		return builder.build() as any;
	}

	filter(
		pred: (value: T) => boolean,
		options: { negate?: boolean | undefined } = {},
	): Tp['_NORMAL'] {
		const builder = this.context.builder<T>();

		this.countMap
			.streamKeys()
			.filter(pred, options)
			.forEach((value) => {
				builder.setCount(value, this.count(value));
			});

		if (builder.size === this.size) return this as any;

		return builder.build() as any;
	}

	forEach(f: (value: T) => void): void {
		this.countMap.stream().forEach(([value, count]) => {
			let i = -1;

			while (++i < count) f(value);
		});
	}

	toArray(): Tp['_AS_ARRAY'] {
		const result: T[] = [];
		this.forEach((value) => result.push(value));
		return result as any;
	}

	toBuilder(): Tp['_BUILDER'] {
		const context = this.context as unknown as MultiSetContext<T>;
		return context.createBuilder(this as any) as any;
	}

	toString(): string {
		return this.stream().join({
			start: `${this.context.typeTag}(`,
			sep: ', ',
			end: ')',
		});
	}

	#copyBuilder(): Tp['_BUILDER'] {
		const builder = this.context.builder<T>();

		this.countMap.stream().forEach(([value, count]) => {
			builder.setCount(value, count);
		});

		return builder;
	}

	#copy(countMap: MapCollection<T, number>, size: number): Tp['_NORMAL'] {
		if (countMap.isEmpty) return this.context.empty() as Tp['_NORMAL'];

		const context = this.context as unknown as MultiSetContext<T>;
		return context.createNonEmpty(
			countMap as MapCollection.NonEmpty<T, number>,
			size,
		) as any;
	}
}
