import { describe, expectTypeOf, it } from 'bun:test';

import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { KeyedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { MapCollectionNonEmpty } from '@rimbu/collection-types/advanced/map-base';
import type { MapCollection } from '@rimbu/collection-types/map';
import { Stream } from '@rimbu/stream';

const Base = MapCollectionNonEmpty.WithMixin(
	KeyedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
);

/**
 * Implements every requirement of the composed map non-empty base except the
 * three primitives that {@link MapCollectionNonEmpty.RequiredClass} is meant to
 * own (`add`, `modifyAtKey`, `mapValues`). If those obligations survive, the
 * concrete subclasses below are rejected and the `@ts-expect-error` directives
 * stay used.
 */
abstract class AllButMapPrimitives<K, V> extends Base<
	K,
	V,
	MapCollection.Advanced.Family<K, V>
> {
	context = undefined as any;

	get size(): number {
		return 0;
	}

	stream = (() => Stream.empty()) as any;
	forEach = (() => {}) as any;
	toArray = (() => []) as any;

	get = (() => undefined) as any;
	toBuilder = (() => undefined) as any;
}

describe('MapCollectionNonEmpty mixin', () => {
	it('retains `add` as an abstract requirement', () => {
		// @ts-expect-error -- `add` must be implemented by a concrete subclass
		class MissingAdd<K, V> extends AllButMapPrimitives<K, V> {
			modifyAtKey = (() => this) as any;
			mapValues = (() => this) as any;
		}

		void MissingAdd;
	});

	it('retains `modifyAtKey` as an abstract requirement', () => {
		// @ts-expect-error -- `modifyAtKey` must be implemented by a concrete subclass
		class MissingModifyAtKey<K, V> extends AllButMapPrimitives<K, V> {
			add = (() => this) as any;
			mapValues = (() => this) as any;
		}

		void MissingModifyAtKey;
	});

	it('retains `mapValues` as an abstract requirement', () => {
		// @ts-expect-error -- `mapValues` must be implemented by a concrete subclass
		class MissingMapValues<K, V> extends AllButMapPrimitives<K, V> {
			add = (() => this) as any;
			modifyAtKey = (() => this) as any;
		}

		void MissingMapValues;
	});

	it('is satisfiable once the primitives are implemented', () => {
		class Complete<K, V> extends AllButMapPrimitives<K, V> {
			add = (() => this) as any;
			modifyAtKey = (() => this) as any;
			mapValues = (() => this) as any;
		}

		expectTypeOf<
			InstanceType<typeof Complete<number, string>>
		>().toHaveProperty('set');
		expectTypeOf<
			InstanceType<typeof Complete<number, string>>
		>().toHaveProperty('get');
	});
});
