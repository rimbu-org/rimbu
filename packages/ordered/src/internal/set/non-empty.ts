import type { RSet } from '@rimbu/collection-types';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty, RelatedTo, ToJSON } from '@rimbu/common/types';
import type { List } from '@rimbu/list';
import type { OrderedSet } from '@rimbu/ordered/set';

import type { OrderedSetBase } from '#set/base';
import type { ContextImpl } from '#set/context-factory';

import { NonEmptyBase } from '@rimbu/collection-types/common/empty-base';
import { Stream, type StreamSource } from '@rimbu/stream';

export class OrderedSetNonEmpty<T>
	extends NonEmptyBase<T>
	implements OrderedSetBase.NonEmpty<T>
{
	declare _NonEmptyType: OrderedSet.NonEmpty<T>;

	constructor(
		readonly context: ContextImpl<T>,
		readonly order: List.NonEmpty<T>,
		readonly sourceSet: RSet.NonEmpty<T>,
	) {
		super();
	}

	get size(): number {
		return this.order.length;
	}

	asNormal(): this {
		return this;
	}

	assumeNonEmpty(): this {
		return this;
	}

	copy(order = this.order, sourceSet = this.sourceSet): OrderedSet.NonEmpty<T> {
		return this.context.createNonEmpty<T>(order, sourceSet);
	}

	stream(options: { reversed?: boolean } = {}): Stream.NonEmpty<T> {
		return this.order.stream(options);
	}

	has<U>(value: RelatedTo<T, U>): boolean {
		return this.sourceSet.has(value);
	}

	add(value: T): OrderedSet.NonEmpty<T> {
		if (this.sourceSet.has(value)) return this;
		return this.copy(this.order.append(value), this.sourceSet.add(value));
	}

	addAll(values: StreamSource<T>): OrderedSet.NonEmpty<T> {
		if (Stream.isEmptyStreamSourceInstance(values)) return this;

		const builder = this.toBuilder();
		builder.addAll(values);
		return builder.build().assumeNonEmpty();
	}

	remove<U>(value: RelatedTo<T, U>): OrderedSet<T> {
		if (!this.context.setContext.isValidValue(value)) return this;

		const newSet = this.sourceSet.remove(value);

		if (newSet === this.sourceSet) return this;

		if (newSet.nonEmpty()) {
			const index = this.order.stream().indexOf(value)!;
			return this.copy(this.order.remove(index).assumeNonEmpty(), newSet);
		}

		return this.context.empty();
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
		this.order.forEach(f, options);
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
		return this.order.toArray();
	}

	toBuilder(): OrderedSet.Builder<T> {
		return this.context.createBuilder(this);
	}

	toString(): string {
		return this.stream().join({ start: 'OrderedSet(', sep: ', ', end: ')' });
	}

	toJSON(): ToJSON<T[]> {
		return {
			dataType: this.context.typeTag,
			value: this.sourceSet.toJSON().value,
		};
	}
}
