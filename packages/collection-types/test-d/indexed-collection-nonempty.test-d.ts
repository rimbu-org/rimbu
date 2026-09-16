import { describe, expectTypeOf, it } from 'bun:test';

import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';

import { IndexedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/indexed-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { Stream } from '@rimbu/stream';

type FAM = IndexedCollection.Advanced.Family<number>;

const NonEmptyBase = IndexedCollectionNonEmpty.WithMixin(
	CollectionNonEmpty.Constructor,
);

/**
 * Implements every requirement of the composed non-empty base except the five
 * that {@link IndexedCollectionNonEmpty.RequiredClass} is meant to own
 * (`streamSlice`, `at`, `take`, `drop`, `toBuilder`). If those obligations
 * survive into the instance type, the concrete subclasses below are rejected,
 * and the `@ts-expect-error` directives stay used.
 */
abstract class AllButIndexedPrimitives extends NonEmptyBase<number, FAM> {
	context = undefined as any;

	get size(): number {
		return 0;
	}

	stream = (() => Stream.empty<number>()) as any;
	forEach = (() => {}) as any;
	filter = (() => this) as any;
	toArray = (() => []) as any;
}

describe('IndexedCollectionNonEmpty mixin', () => {
	it('retains `streamSlice` as an abstract requirement', () => {
		// @ts-expect-error -- `streamSlice` must be implemented by a concrete subclass
		class MissingStreamSlice extends AllButIndexedPrimitives {
			at = (() => undefined) as any;
			take = (() => this) as any;
			drop = (() => this) as any;
			toBuilder = (() => undefined) as any;
		}

		void MissingStreamSlice;
	});

	it('retains `at` as an abstract requirement', () => {
		// @ts-expect-error -- `at` must be implemented by a concrete subclass
		class MissingAt extends AllButIndexedPrimitives {
			streamSlice = (() => Stream.empty<number>()) as any;
			take = (() => this) as any;
			drop = (() => this) as any;
			toBuilder = (() => undefined) as any;
		}

		void MissingAt;
	});

	it('retains `take` as an abstract requirement', () => {
		// @ts-expect-error -- `take` must be implemented by a concrete subclass
		class MissingTake extends AllButIndexedPrimitives {
			streamSlice = (() => Stream.empty<number>()) as any;
			at = (() => undefined) as any;
			drop = (() => this) as any;
			toBuilder = (() => undefined) as any;
		}

		void MissingTake;
	});

	it('retains `drop` as an abstract requirement', () => {
		// @ts-expect-error -- `drop` must be implemented by a concrete subclass
		class MissingDrop extends AllButIndexedPrimitives {
			streamSlice = (() => Stream.empty<number>()) as any;
			at = (() => undefined) as any;
			take = (() => this) as any;
			toBuilder = (() => undefined) as any;
		}

		void MissingDrop;
	});

	it('retains `toBuilder` as an abstract requirement', () => {
		// @ts-expect-error -- `toBuilder` must be implemented by a concrete subclass
		class MissingToBuilder extends AllButIndexedPrimitives {
			streamSlice = (() => Stream.empty<number>()) as any;
			at = (() => undefined) as any;
			take = (() => this) as any;
			drop = (() => this) as any;
		}

		void MissingToBuilder;
	});

	it('is satisfiable once the primitives are implemented', () => {
		class Complete extends AllButIndexedPrimitives {
			streamSlice = (() => Stream.empty<number>()) as any;
			at = (() => undefined) as any;
			take = (() => this) as any;
			drop = (() => this) as any;
			toBuilder = (() => undefined) as any;
		}

		expectTypeOf<InstanceType<typeof Complete>>().toHaveProperty('first');
		expectTypeOf<InstanceType<typeof Complete>>().toHaveProperty('slice');
		expectTypeOf<InstanceType<typeof Complete>>().toHaveProperty('splitAt');
	});
});
