import { describe, expectTypeOf, it } from 'bun:test';

import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';

import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { KeyedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { Stream } from '@rimbu/stream';

type FAM = KeyedCollection.Advanced.Family<number, string>;

const NonEmptyBase = KeyedCollectionNonEmpty.WithMixin(
	CollectionNonEmpty.Constructor,
);

/**
 * Implements every requirement of the composed non-empty base except the two
 * that {@link KeyedCollectionNonEmpty.RequiredClass} is meant to own. If those
 * obligations survive into the instance type, the concrete subclasses below are
 * rejected, and the `@ts-expect-error` directives stay used.
 */
abstract class AllButGetAndToBuilder extends NonEmptyBase<number, string, FAM> {
	context = undefined as any;

	get size(): number {
		return 0;
	}

	stream = (() => Stream.empty<readonly [number, string]>()) as any;
	forEach = (() => {}) as any;
	filter = (() => this) as any;
	toArray = (() => []) as any;
}

describe('KeyedCollectionNonEmpty mixin', () => {
	it('retains `get` as an abstract requirement', () => {
		// @ts-expect-error -- `get` must be implemented by a concrete subclass
		class MissingGet extends AllButGetAndToBuilder {
			toBuilder = (() => undefined) as any;
		}

		void MissingGet;
	});

	it('retains `toBuilder` as an abstract requirement', () => {
		// @ts-expect-error -- `toBuilder` must be implemented by a concrete subclass
		class MissingToBuilder extends AllButGetAndToBuilder {
			get = (() => undefined) as any;
		}

		void MissingToBuilder;
	});

	it('is satisfiable once both requirements are implemented', () => {
		class Complete extends AllButGetAndToBuilder {
			get = (() => undefined) as any;
			toBuilder = (() => undefined) as any;
		}

		expectTypeOf<InstanceType<typeof Complete>>().toHaveProperty('get');
		expectTypeOf<InstanceType<typeof Complete>>().toHaveProperty('toBuilder');
	});
});
