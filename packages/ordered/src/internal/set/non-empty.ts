import type { RMap } from '@rimbu/collection-types';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty, RelatedTo } from '@rimbu/common/types';
import type { OrderedSet } from '@rimbu/ordered/set';
import type { SortedMap } from '@rimbu/sorted';

import type { OrderedSetBase } from '#set/base';
import type { ContextImpl } from '#set/context-factory';

import { NonEmptyBase } from '@rimbu/collection-types/advanced/common/empty-base';
import { Stream, type StreamSource } from '@rimbu/stream';

import { Indicator } from '#ordered/common/ordered-indicator';

export class OrderedSetNonEmpty<T>
	extends NonEmptyBase<T>
	implements OrderedSetBase.NonEmpty<T>
{
	declare _NonEmptyType: OrderedSet.NonEmpty<T>;

	constructor(
		readonly context: ContextImpl<T>,
		readonly keyIndicatorMap: RMap.NonEmpty<T, Indicator>,
		readonly indicatorKeyMap: SortedMap.NonEmpty<Indicator, T>,
	) {
		super();
	}

	get size(): number {
		return this.keyIndicatorMap.size;
	}

	asNormal(): this {
		return this;
	}

	assumeNonEmpty(): this {
		return this;
	}

	copy(
		keyIndicatorMap = this.keyIndicatorMap,
		indicatorKeyMap = this.indicatorKeyMap,
	): OrderedSet.NonEmpty<T> {
		return this.context.createNonEmpty<T>(keyIndicatorMap, indicatorKeyMap);
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		return this.indicatorKeyMap.streamValues(options);
	}

	has<U>(value: RelatedTo<T, U>): boolean {
		return this.keyIndicatorMap.hasKey(value);
	}

	add(value: T): OrderedSet.NonEmpty<T> {
		let lastIndicator: Indicator | undefined;
		let newIndicator: Indicator | undefined;

		const newKeyIndicatorMap = this.keyIndicatorMap.modifyAt(value, {
			ifNew: {
				create: () => {
					lastIndicator = this.indicatorKeyMap.maxKey();
					newIndicator = Indicator.after(lastIndicator);

					return newIndicator;
				},
			},
		});

		if (undefined === lastIndicator || undefined === newIndicator) return this;

		const newIndicatorKeyMap = this.indicatorKeyMap.set(newIndicator, value);

		return this.copy(newKeyIndicatorMap.assumeNonEmpty(), newIndicatorKeyMap);
	}

	addAll(values: StreamSource<T>): OrderedSet.NonEmpty<T> {
		if (Stream.isEmptyStreamSourceInstance(values)) return this;

		const builder = this.toBuilder();
		builder.addAll(values);
		return builder.build().assumeNonEmpty();
	}

	remove<U>(value: RelatedTo<T, U>): OrderedSet<T> {
		const [newKeyIndicatorMap, removedIndicator, wasIndicatorRemoved] =
			this.keyIndicatorMap.removeKeyAndGet(value);

		if (!wasIndicatorRemoved) return this;

		if (!newKeyIndicatorMap.nonEmpty()) {
			return this.context.empty();
		}

		const newIndicatorKeyMap = this.indicatorKeyMap.removeKey(removedIndicator);

		return this.copy(newKeyIndicatorMap, newIndicatorKeyMap.assumeNonEmpty());
	}

	removeAll<U>(values: StreamSource<RelatedTo<T, U>>): OrderedSet<T> {
		if (Stream.isEmptyStreamSourceInstance(values)) return this;

		const builder = this.toBuilder();
		builder.removeAll(values);
		return builder.build();
	}

	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed?: boolean; state?: TraverseState } = {},
	): void {
		this.indicatorKeyMap.forEach(
			([_, value], index, halt) => f(value, index, halt),
			options,
		);
	}

	filter(
		pred: (value: T, index: number, halt: () => void) => boolean,
		options: { negate?: boolean | undefined } = {},
	): any {
		const builder = this.context.builder<T>();

		builder.addAll(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	transform<T2 extends T>(
		transformFun: (stream: Stream.NonEmpty<T>) => StreamSource<T2>,
	): any {
		return this.context.from(transformFun(this.stream()));
	}

	union(other: StreamSource<T>): OrderedSet.NonEmpty<T> {
		if (other === this) return this;
		if (Stream.isEmptyStreamSourceInstance(other)) return this;

		const builder = this.toBuilder();
		builder.addAll(other);
		return builder.build().assumeNonEmpty();
	}

	difference(other: StreamSource<T>): OrderedSet<T> {
		if (other === this) return this.context.empty();
		if (Stream.isEmptyStreamSourceInstance(other)) return this;

		const builder = this.toBuilder();
		builder.removeAll(other);
		return builder.build();
	}

	intersect(other: StreamSource<T>): OrderedSet<T> {
		if (other === this) return this;
		if (Stream.isEmptyStreamSourceInstance(other)) return this.context.empty();

		const builder = this.context.builder<T>();
		const otherIter = Stream.from(other)[Symbol.iterator]();

		const done = Symbol('Done');
		let value: T | typeof done;

		while (done !== (value = otherIter.fastNext(done))) {
			if (this.has(value)) builder.add(value);
		}

		if (builder.size === this.size) return this;

		return builder.build();
	}

	symDifference(other: StreamSource<T>): OrderedSet<T> {
		if (other === this) return this.context.empty();

		if (Stream.isEmptyStreamSourceInstance(other)) return this;

		const builder = this.toBuilder();

		Stream.from(other)
			.filterPure({ pred: builder.remove, negate: true })
			.forEach(builder.add);

		return builder.build();
	}

	toArray(): ArrayNonEmpty<T> {
		return this.stream().toArray();
	}

	toBuilder(): OrderedSet.Builder<T> {
		return this.context.createBuilder(this);
	}

	toString(): string {
		return this.stream().join({ start: 'OrderedSet(', sep: ', ', end: ')' });
	}

	toJSON(): any {}
}
