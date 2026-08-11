import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { TypesKey } from '@rimbu/collection-types/types';
import type { OptLazy } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

import type { ChildrenOps } from '#advanced/children-ops';

import { ArrayOuterChildrenOps } from '#list/children-ops/array';
import { createListContextModule } from '#list/context';

export interface List<T>
	extends IndexedCollection<T, List.Advanced.Types<T>>,
		List.Advanced.Capabilities<T> {
	readonly [TypesKey]: List.Advanced.Types<T>;
	readonly context: List.Context<T>;
}

export declare namespace List {
	export interface NonEmpty<T>
		extends List<T>,
			IndexedCollection.NonEmpty<T, List.Advanced.TypesNonEmpty<T>> {
		readonly [TypesKey]: List.Advanced.TypesNonEmpty<T>;
		readonly context: List.Context<T>;
	}

	export interface Builder<T>
		extends IndexedCollection.Builder<T, List.Advanced.Types<T>>,
			IndexedCollection.Capability.WithPrependAppend.Builder<T> {
		readonly [TypesKey]: List.Advanced.Types<T>;
		readonly context: List.Context<T>;

		setAt(index: number, element: T): T | undefined;
		setAt<O>(index: number, element: T, otherwise: OptLazy<O>): T | O;
		updateAt(
			index: number,
			f: (element: T) => T,
		): [previous: T, current: T] | undefined;
		swapAt(index1: number, index2: number): void;
		prependAll(elements: StreamSource<T>): void;
		appendAll(elements: StreamSource<T>): void;
	}

	export interface Context<T>
		extends List.Advanced.Factory<T, List.Advanced.Types<T>> {
		readonly blockSizeBits: number;
	}

	export namespace Advanced {
		export interface Capabilities<T>
			extends Collection.Capability.WithFilter<T>,
				Collection.Capability.WithCollect<T>,
				Collection.Capability.WithConcat<T>,
				Collection.Capability.WithMap<T>,
				Collection.Capability.WithMutate<T>,
				Collection.Capability.WithRecompose<T>,
				IndexedCollection.Capability.WithCollectIndexed<T>,
				IndexedCollection.Capability.WithFlatMapIndexed<T>,
				IndexedCollection.Capability.WithFilterIndexed<T>,
				IndexedCollection.Capability.WithMapIndexed<T>,
				IndexedCollection.Capability.WithPadTo<T>,
				IndexedCollection.Capability.WithPrependAppend<T>,
				IndexedCollection.Capability.WithRepeat<T>,
				IndexedCollection.Capability.WithReversed<T>,
				IndexedCollection.Capability.WithRotate<T>,
				IndexedCollection.Capability.WithSpliceAt<T>,
				IndexedCollection.Capability.WithSwapAt<T>,
				IndexedCollection.Capability.WithUpdateAt<T> {
			readonly [TypesKey]: List.Advanced.Types<T>;
			readonly context: List.Context<T>;
		}

		export interface Factory<T, Tp extends List.Advanced.Types<T>>
			extends Collection.Advanced.ContextBase<Tp> {
			createContext(options: { blockSizeBits?: number }): List.Context<T>;
		}

		export type DefaultFactory = Factory<any, List.Advanced.Types<any>>;

		/**
		 * The family — *which* collection this is. Declared once; both the
		 * possibly-empty and non-empty type records are derived from it, so
		 * there is no second place that can disagree.
		 */
		export interface Family<T> extends IndexedCollection.Advanced.Family<T> {
			_NORMAL: List<T>;
			_NON_EMPTY: List.NonEmpty<T>;
			_BUILDER: List.Builder<T>;

			_NEW_FAMILY: List.Advanced.Family<this['_NEW_E']>;
		}

		export type Types<T> = List.Advanced.Family<T> &
			IndexedCollection.Advanced.NormalKind<T>;

		export type TypesNonEmpty<T> = List.Advanced.Family<T> &
			IndexedCollection.Advanced.NonEmptyKind<T>;
	}
}

export const List: List.Advanced.DefaultFactory = createListContextModule({
	blockSizeBits: 5,
	childrenOps: new ArrayOuterChildrenOps() as ChildrenOps,
});
