import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { RelatedTo } from '@rimbu/common';
import type { MultiSet } from '@rimbu/multiset';
import type { StreamSource } from '@rimbu/stream';

import type { MultiSetContext } from '#multiset/context-factory';

import { ValuedCollectionEmpty } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { Stream } from '@rimbu/stream';

type MultiSetTypes<T> = Collection.Advanced.Types<
	MultiSet.Advanced.Family<T>,
	T
>;

const MultiSetEmptyBase = ValuedCollectionEmpty.WithMixin(
	CollectionEmpty.Constructor,
);

export class MultiSetEmpty<
	T,
	Tp extends MultiSetTypes<T> = MultiSetTypes<T>,
> extends MultiSetEmptyBase<T, MultiSet.Advanced.Family<T>, Tp> {
	constructor(readonly context: MultiSetContext<T>) {
		super(context);
	}

	get countMap(): MapCollection<T, number> {
		return this.context.countMapContext.empty() as any;
	}

	get sizeDistinct(): 0 {
		return 0;
	}

	streamDistinct(): Stream<T> {
		return Stream.empty();
	}

	streamWithCounts(): Stream<readonly [T, number]> {
		return Stream.empty();
	}

	count(): 0 {
		return 0;
	}

	add(value: T): Tp['_NON_EMPTY'];
	add<const N extends number>(
		value: T,
		amount: N,
	): 0 extends N ? Tp['_SELF'] : Tp['_NON_EMPTY'];
	add(value: T, amount?: number): Tp['_NORMAL'] {
		if (undefined !== amount && amount <= 0) return this as any;

		const addAmount = amount ?? 1;
		const countMap = this.context.countMapContext.of([
			value,
			addAmount,
		]) as unknown as MapCollection.NonEmpty<T, number>;

		return this.context.createNonEmpty(countMap, addAmount) as any;
	}

	addEachWithCounts(
		valueCounts: StreamSource<readonly [T, number]>,
	): Tp['_SELF'] {
		if (Stream.isEmptyStreamSourceInstance(valueCounts)) return this as any;

		const builder = this.toBuilder();
		builder.addEachWithCounts(valueCounts);
		return builder.build() as any;
	}

	setCount<const N extends number>(
		value: T,
		amount: N,
	): 0 extends N ? Tp['_NORMAL'] : Tp['_NON_EMPTY'];
	setCount(value: T, amount: number): Tp['_NORMAL'] {
		return this.add(value, amount) as any;
	}

	modifyCount(
		value: T,
		update: (currentCount: number) => number,
	): Tp['_NORMAL'] {
		return this.add(value, update(0));
	}

	filterWithCounts(): Tp['_NORMAL'] {
		return this as any;
	}

	removeAll<U = T>(_value: RelatedTo<T, U>): Tp['_NORMAL'] {
		return this as any;
	}

	toBuilder(): Tp['_BUILDER'] {
		return this.context.builder<T>();
	}

	toString(): string {
		return `${this.context.typeTag}()`;
	}
}
