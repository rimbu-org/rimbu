import type { RSet } from '@rimbu/collection-types';
import type { ToJSON } from '@rimbu/common/types';
import type { List } from '@rimbu/list';
import type { OrderedSet } from '@rimbu/ordered/set';
import type { Stream, StreamSource } from '@rimbu/stream';

import type { OrderedSetBase } from '#set/base';
import type { ContextImpl } from '#set/context-factory';

import { EmptyBase } from '@rimbu/collection-types/common/empty-base';

export class OrderedSetEmpty<T>
	extends EmptyBase
	implements OrderedSetBase<T, OrderedSetBase.Types>
{
	declare _NonEmptyType: OrderedSet.NonEmpty<T>;

	constructor(readonly context: ContextImpl<T>) {
		super();
	}

	get order(): List<T> {
		return this.context.listContext.empty();
	}

	get sourceSet(): RSet<T> {
		return this.context.setContext.empty();
	}

	has(): false {
		return false;
	}

	add(value: T): OrderedSet.NonEmpty<T> {
		return this.context.createNonEmpty<T>(
			this.context.listContext.of(value),
			this.context.setContext.of(value),
		);
	}

	addAll(values: StreamSource<T>): any {
		return this.context.from(values);
	}

	remove(): OrderedSet<T> {
		return this;
	}

	removeAll(): OrderedSet<T> {
		return this;
	}

	transform<T2 extends T>(
		transformFun: (stream: Stream<T>) => StreamSource<T2>,
	): any {
		return this.context.from(transformFun(this.stream()));
	}

	union(other: StreamSource<T>): any {
		if (
			this.context.isNonEmptyInstance(other) &&
			(other as any).context === this.context
		) {
			return other;
		}

		return this.context.from(other);
	}

	difference(): OrderedSet<T> {
		return this.context.empty();
	}

	intersect(): OrderedSet<T> {
		return this.context.empty();
	}

	symDifference(other: StreamSource<T>): OrderedSet<T> {
		return this.union(other);
	}

	toBuilder(): OrderedSet.Builder<T> {
		return this.context.builder();
	}

	toString(): string {
		return 'OrderedSet()';
	}

	toJSON(): ToJSON<any[]> {
		return {
			dataType: this.context.typeTag,
			value: [],
		};
	}
}
