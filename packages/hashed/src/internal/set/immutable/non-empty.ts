import type { HashSet } from '@rimbu/hashed/set';

import type { HashSetContext } from '#set/context';

import { ValuedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { SetCollectionNonEmpty } from '@rimbu/collection-types/advanced/set-base';

const NonEmptyBase = SetCollectionNonEmpty.WithMixin(
	ValuedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
);

export abstract class HashSetNonEmptyBase<T>
	extends NonEmptyBase<T, HashSet.Advanced.Family<T>>
	implements HashSet.NonEmpty<T>
{
	constructor(readonly context: HashSetContext<T>) {
		super(context);
	}

	abstract hasInternal(element: T, hash: number): boolean;

	has = (value: T, inHash?: number): boolean => {
		if (!this.context.hasher.isValid(value)) return false;

		const hash = inHash ?? this.context.hash(value);

		return this.hasInternal(value, hash);
	};

	filter(
		pred: (element: T) => boolean,
		options: { negate?: boolean | undefined } = {},
	): HashSet<T> {
		const builder = this.context.builder<T>();

		builder.addAll(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	toBuilder(): HashSet.Builder<T> {
		return this.context.createBuilder(this);
	}

	toString(): string {
		return this.stream().join({ start: 'HashSet(', sep: ', ', end: ')' });
	}
}
