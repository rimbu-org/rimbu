import type { TypesKey } from '@rimbu/collection-types/types';
import type { HashSet } from '@rimbu/hashed/set';
import type { StreamSource } from '@rimbu/stream';

import type { HashSetContext } from '#set/context';

import { WithValuedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/collection/valued-base';
import {
	CollectionNonEmptyConstructor,
	defaultFlatMapIndexed,
	defaultMapIndexed,
} from '@rimbu/collection-types/advanced/collection-base';
import {
	defaultDifferenceByRemove,
	defaultFlatMapByUnion,
	defaultIntersectByAdd,
	defaultSymDifferenceByRemove,
	defaultUnionByAdd,
} from '@rimbu/collection-types/advanced/set-base';

const NonEmptyBase = WithValuedCollectionNonEmptyBase(
	CollectionNonEmptyConstructor,
);

export abstract class HashSetNonEmptyBase<T>
	extends NonEmptyBase<T, HashSet.Advanced.Family<T>>
	implements HashSet.NonEmpty<T>
{
	declare readonly [TypesKey]: HashSet.Advanced.Family<T>;

	constructor(readonly context: HashSetContext<T>) {
		super(context);
	}

	abstract hasInternal(element: T, hash: number): boolean;
	abstract add(element: T): HashSet.NonEmpty<T>;
	abstract remove(element: T): HashSet<T>;

	has = (value: T, inHash?: number): boolean => {
		if (!this.context.hasher.isValid(value)) return false;

		const hash = inHash ?? this.context.hash(value);

		return this.hasInternal(value, hash);
	};

	map<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (element: T) => T2,
	): HashSet.NonEmpty<T2> {
		return this.context.from(this.stream().mapPure(f)) as HashSet.NonEmpty<T2>;
	}

	mapIndexed<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (element: T, index: number) => T2,
		options?: { indexOffset?: number },
	): HashSet.NonEmpty<T2> {
		return defaultMapIndexed<
			T,
			T2,
			HashSet.NonEmpty<T>,
			HashSet.Advanced.Family<T>
		>(this, f, options);
	}

	removeAll(elements: StreamSource<T>): HashSet<T> {
		const builder = this.toBuilder();
		builder.removeAll(elements);
		if (builder.size === this.size) return this;
		return builder.build();
	}

	flatMap<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (element: T) => StreamSource<T2>,
	): HashSet.NonEmpty<T2> {
		return defaultFlatMapByUnion<
			T,
			T2,
			HashSet.NonEmpty<T>,
			HashSet.Advanced.Family<T>
		>(this, f) as HashSet.NonEmpty<T2>;
	}

	flatMapIndexed<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (element: T, index: number) => StreamSource<T2>,
		options: { indexOffset?: number | undefined } | undefined,
	): HashSet.NonEmpty<T2> {
		return defaultFlatMapIndexed<
			T,
			T2,
			HashSet.NonEmpty<T>,
			HashSet.Advanced.Family<T>
		>(this, f, options) as HashSet.NonEmpty<T2>;
	}

	union(other: StreamSource<T>): HashSet.NonEmpty<T> {
		return defaultUnionByAdd<
			T,
			HashSet.NonEmpty<T>,
			HashSet.Advanced.Family<T>
		>(this, other) as HashSet.NonEmpty<T>;
	}

	difference(other: StreamSource<T>): HashSet<T> {
		return defaultDifferenceByRemove<
			T,
			HashSet.NonEmpty<T>,
			HashSet.Advanced.Family<T>
		>(this, other);
	}

	intersection(other: StreamSource<T>): HashSet<T> {
		return defaultIntersectByAdd<
			T,
			HashSet.NonEmpty<T>,
			HashSet.Advanced.Family<T>
		>(this, other);
	}

	symmetricDifference(other: StreamSource<T>): HashSet<T> {
		return defaultSymDifferenceByRemove<
			T,
			HashSet.NonEmpty<T>,
			HashSet.Advanced.Family<T>
		>(this, other);
	}

	addAll(values: StreamSource<T>): HashSet.NonEmpty<T> {
		const builder = this.toBuilder();
		builder.addAll(values);
		return builder.build() as HashSet.NonEmpty<T>;
	}

	toBuilder(): HashSet.Builder<T> {
		return this.context.createBuilder(this);
	}

	toString(): string {
		return this.stream().join({ start: 'HashSet(', sep: ', ', end: ')' });
	}
}
