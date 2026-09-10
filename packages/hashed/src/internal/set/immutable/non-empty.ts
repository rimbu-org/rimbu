import type { HashSet } from '@rimbu/hashed/set';

import type { HashSetContext } from '#set/context';

import { WithValuedCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionNonEmptyConstructor } from '@rimbu/collection-types/advanced/collection-base';
import { WithSetCollectionNonEmptyBase } from '@rimbu/collection-types/advanced/set-base';

const NonEmptyBase = WithSetCollectionNonEmptyBase(
	WithValuedCollectionNonEmptyBase(CollectionNonEmptyConstructor),
);

export abstract class HashSetNonEmptyBase<T>
	extends NonEmptyBase<T, HashSet.Advanced.Family<T>>
	implements HashSet.NonEmpty<T>
{
	constructor(readonly context: HashSetContext<T>) {
		super(context);
	}

	readonly isOrdered = false;

	abstract hasInternal(element: T, hash: number): boolean;
	abstract add(element: T): HashSet.NonEmpty<T>;
	abstract remove(element: T): HashSet<T>;
	abstract map<T2>(f: (element: T) => T2): HashSet.NonEmpty<T2>;

	has = (value: T, inHash?: number): boolean => {
		if (!this.context.hasher.isValid(value)) return false;

		const hash = inHash ?? this.context.hash(value);

		return this.hasInternal(value, hash);
	};

	toBuilder(): HashSet.Builder<T> {
		return this.context.createBuilder(this);
	}

	toString(): string {
		return this.stream().join({ start: 'HashSet(', sep: ', ', end: ')' });
	}
}
