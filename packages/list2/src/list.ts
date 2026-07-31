import type {
	Collection,
	IndexedCollection,
} from '@rimbu/collection-types/capabilities';
import type { ArrayNonEmpty, OptLazy } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

import type { ChildrenOps } from '#advanced/children-ops';

import { ArrayOuterChildrenOps } from '#list/children-ops/array';
import { createListContextModule } from '#list/context';

export type OpWithResult<
	Col,
	Res,
	HasKnownResult extends boolean = boolean,
	CollectionChanged extends boolean = boolean,
> = [
	collection: Col,
	hasKnownResult: HasKnownResult,
	result: Res,
	collectionChanged: CollectionChanged,
];

export type OpWithChangeResult<
	Col,
	Res,
	ResKnown extends Res = Res,
	ColChanged = Col,
> = OpWithResult<Col, Res, false> | OpWithResult<ColChanged, ResKnown, true>;

export interface List<T> extends IndexedCollection<T>, List.Capabilities<T> {
	readonly context: List.Context<T>;
}

export declare namespace List {
	export interface NonEmpty<T> extends List<T>, IndexedCollection.NonEmpty<T> {
		readonly context: List.Context<T, true>;
	}

	export interface Builder<T> extends IndexedCollection.Builder<T> {
		readonly context: List.Context<T>;
		setAt(index: number, value: T): T | undefined;
		setAt<O>(index: number, value: T, otherwise: OptLazy<O>): T | O;
		updateAt(
			index: number,
			f: (element: T) => T,
		): [previous: T, current: T] | undefined;
		swapAt(index1: number, index2: number): void;
		prepend(element: T): void;
		prependAll(elements: StreamSource<T>): void;
		append(element: T): void;
		appendAll(elements: StreamSource<T>): void;
	}

	export interface Capabilities<T>
		extends Collection.WithFilter<T>,
			IndexedCollection.WithOrderEditable<T>,
			IndexedCollection.WithMap<T>,
			List.WithSetAt<T>,
			List.WithConcat<T>,
			List.WithReversed<T> {
		readonly context: List.Context<T>;
	}

	export interface WithSetAt<E> extends IndexedCollection<E> {
		setAt(index: number, element: E): this['context']['__types']['_SELF'];
		setAtAndReturn(
			index: number,
			element: E,
		): OpWithChangeResult<
			this['context']['__types']['_SELF'],
			E | undefined,
			E,
			this['context']['__types']['_NON_EMPTY']
		>;
		updateAt(
			index: number,
			f: (element: E) => E,
		): this['context']['__types']['_SELF'];
		updateAtAndReturn(
			index: number,
			f: (element: E) => E,
		): OpWithChangeResult<
			this['context']['__types']['_SELF'],
			[previous: E | undefined, current: E | undefined],
			[previous: E, current: E],
			this['context']['__types']['_NON_EMPTY']
		>;
	}

	export interface WithConcat<E> extends IndexedCollection<E> {
		concat(
			...sources: ArrayNonEmpty<StreamSource.NonEmpty<E>>
		): this['context']['__types']['_NON_EMPTY'];
		concat(
			...sources: ArrayNonEmpty<StreamSource<E>>
		): this['context']['__types']['_SELF'];
	}

	export interface WithReversed<E> extends IndexedCollection<E> {
		reversed(): this['context']['__types']['_SELF'];
	}

	export interface Context<T, IsNonEmpty extends boolean = boolean> {
		readonly blockSizeBits: number;

		__types: IsNonEmpty extends true ? List.Types.NonEmpty<T> : List.Types<T>;

		createContext(options: { blockSizeBits?: number }): List.Context<T>;

		empty<T extends this['__types']['_UPPER_E']>(): (this['__types'] & {
			_NEW_E: T;
		})['_NEW_TYPES']['_NORMAL'];

		of<T extends this['__types']['_UPPER_E']>(
			...elements: ArrayNonEmpty<T>
		): (this['__types'] & { _NEW_E: T })['_NEW_TYPES']['_NON_EMPTY'];

		from<T extends this['__types']['_UPPER_E']>(
			...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
		): (this['__types'] & { _NEW_E: T })['_NEW_TYPES']['_NON_EMPTY'];
		from<T extends this['__types']['_UPPER_E']>(
			...sources: ArrayNonEmpty<StreamSource<T>>
		): (this['__types'] & { _NEW_E: T })['_NEW_TYPES']['_NORMAL'];

		builder<T extends this['__types']['_UPPER_E']>(): (this['__types'] & {
			_NEW_E: T;
		})['_NEW_TYPES']['_BUILDER'];
	}

	export type Factory = Pick<
		List.Context<any>,
		'empty' | 'of' | 'from' | 'builder' | 'createContext'
	>;

	interface Concat<T, LN, LNE, IsNonEmpty extends boolean = boolean> {
		concat(...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>): LNE;
		concat(
			...sources: ArrayNonEmpty<StreamSource<T>>
		): IsNonEmpty extends true ? LNE : LN;
	}

	export interface Types<T> extends IndexedCollection.Types<T> {
		_NORMAL: List<T>;
		_NON_EMPTY: List.NonEmpty<T>;
		_BUILDER: List.Builder<T>;
		_NEW_TYPES: List.Types<this['_NEW_E']>;
	}

	export namespace Types {
		export interface NonEmpty<T> extends IndexedCollection.Types.NonEmpty<T> {
			_NORMAL: List<T>;
			_NON_EMPTY: List.NonEmpty<T>;
			_BUILDER: List.Builder<T>;
			_NEW_TYPES: List.Types.NonEmpty<this['_NEW_E']>;
		}
	}
}

export const List: List.Factory = createListContextModule({
	blockSizeBits: 5,
	childrenOps: new ArrayOuterChildrenOps() as ChildrenOps,
});
