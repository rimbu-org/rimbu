import { describe, expectTypeOf, it } from 'bun:test';

import type { IndexedSortedCollection } from '@rimbu/collection-types/collection/indexed-sorted';

import { IndexedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/indexed-base';
import { IndexedSortedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/indexed-sorted-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { Stream } from '@rimbu/stream';

type FAM = IndexedSortedCollection.Advanced.Family<number, string>;

const Base = IndexedSortedCollectionNonEmpty.WithMixin(
	IndexedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
);

/**
 * Implements every requirement of the composed non-empty base except the five
 * that {@link IndexedSortedCollectionNonEmpty.RequiredClass} is meant to own
 * (`previous`, `next`, `indexOf`, `lowerBound`, `upperBound`), plus the indexed
 * requirements inherited through the nested mixin. If those obligations survive
 * into the instance type, the concrete subclasses below are rejected, and the
 * `@ts-expect-error` directives stay used.
 */
abstract class AllButSortedPrimitives extends Base<number, string, FAM> {
	context = undefined as any;

	get size(): number {
		return 0;
	}

	stream = (() => Stream.empty<number>()) as any;
	forEach = (() => {}) as any;
	filter = (() => this) as any;
	toArray = (() => []) as any;

	streamSlice = (() => Stream.empty<number>()) as any;
	at = (() => undefined) as any;
	take = (() => this) as any;
	drop = (() => this) as any;
	toBuilder = (() => undefined) as any;
}

describe('IndexedSortedCollectionNonEmpty mixin', () => {
	it('retains `previous` as an abstract requirement', () => {
		// @ts-expect-error -- `previous` must be implemented by a concrete subclass
		class MissingPrevious extends AllButSortedPrimitives {
			next = (() => undefined) as any;
			indexOf = (() => 0) as any;
			lowerBound = (() => 0) as any;
			upperBound = (() => 0) as any;
		}

		void MissingPrevious;
	});

	it('retains `next` as an abstract requirement', () => {
		// @ts-expect-error -- `next` must be implemented by a concrete subclass
		class MissingNext extends AllButSortedPrimitives {
			previous = (() => undefined) as any;
			indexOf = (() => 0) as any;
			lowerBound = (() => 0) as any;
			upperBound = (() => 0) as any;
		}

		void MissingNext;
	});

	it('retains `indexOf` as an abstract requirement', () => {
		// @ts-expect-error -- `indexOf` must be implemented by a concrete subclass
		class MissingIndexOf extends AllButSortedPrimitives {
			previous = (() => undefined) as any;
			next = (() => undefined) as any;
			lowerBound = (() => 0) as any;
			upperBound = (() => 0) as any;
		}

		void MissingIndexOf;
	});

	it('retains `lowerBound` as an abstract requirement', () => {
		// @ts-expect-error -- `lowerBound` must be implemented by a concrete subclass
		class MissingLowerBound extends AllButSortedPrimitives {
			previous = (() => undefined) as any;
			next = (() => undefined) as any;
			indexOf = (() => 0) as any;
			upperBound = (() => 0) as any;
		}

		void MissingLowerBound;
	});

	it('retains `upperBound` as an abstract requirement', () => {
		// @ts-expect-error -- `upperBound` must be implemented by a concrete subclass
		class MissingUpperBound extends AllButSortedPrimitives {
			previous = (() => undefined) as any;
			next = (() => undefined) as any;
			indexOf = (() => 0) as any;
			lowerBound = (() => 0) as any;
		}

		void MissingUpperBound;
	});

	it('is satisfiable once the primitives are implemented', () => {
		class Complete extends AllButSortedPrimitives {
			previous = (() => undefined) as any;
			next = (() => undefined) as any;
			indexOf = (() => 0) as any;
			lowerBound = (() => 0) as any;
			upperBound = (() => 0) as any;
		}

		expectTypeOf<InstanceType<typeof Complete>>().toHaveProperty('min');
		expectTypeOf<InstanceType<typeof Complete>>().toHaveProperty('max');
		expectTypeOf<InstanceType<typeof Complete>>().toHaveProperty('previous');
		expectTypeOf<InstanceType<typeof Complete>>().toHaveProperty('indexOf');
	});
});
