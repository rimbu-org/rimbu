import type {
	Collection,
	IndexedCollection,
} from '@rimbu/collection-types/capabilities';
import type { ArrayNonEmpty, OptLazy } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

import type { ChildrenOps } from '#advanced/children-ops';

import { ArrayOuterChildrenOps } from '#list/children-ops/array';
import { createListContextModule } from '#list/context';

export type OpWithResult<Col, Result, HasResult extends boolean = boolean> = {
	collection: Col;
	hasResult: HasResult;
	result: Result;
	hasChanged: boolean;
};

export type OpWithChangeResult<
	ColWithoutResult,
	ResultWithoutHasResult,
	ResultWithHasResult = ResultWithoutHasResult,
	ColWithResult = ColWithoutResult,
> =
	| OpWithResult<ColWithoutResult, ResultWithoutHasResult, false>
	| OpWithResult<ColWithResult, ResultWithHasResult, true>;

export interface List<T>
	extends IndexedCollection<T>,
		List.Advanced.Capabilities<T> {
	readonly context: List.Context<T>;
}

export declare namespace List {
	export interface NonEmpty<T> extends List<T>, IndexedCollection.NonEmpty<T> {
		readonly context: List.Context<T, true>;
	}

	export interface Builder<T> extends IndexedCollection.Builder<T> {
		readonly context: List.Context<T>;
		setAt(index: number, element: T): T | undefined;
		setAt<O>(index: number, element: T, otherwise: OptLazy<O>): T | O;
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

	export namespace Capability {
		export interface WithUpdateAt<E> extends IndexedCollection<E> {
			setAt(index: number, element: E): this['context']['__types']['_SELF'];
			setAtAndReturn(
				index: number,
				element: E,
			): OpWithChangeResult<
				this['context']['__types']['_SELF'],
				undefined,
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
				[previous: undefined, current: undefined],
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
	}

	export interface Context<T, IsNonEmpty extends boolean = boolean>
		extends List.Advanced.Factory<
			T,
			IsNonEmpty extends true
				? List.Advanced.TypesNonEmpty<T>
				: List.Advanced.Types<T>
		> {
		readonly blockSizeBits: number;

		__types: IsNonEmpty extends true
			? List.Advanced.TypesNonEmpty<T>
			: List.Advanced.Types<T>;

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

	export namespace Advanced {
		export interface Capabilities<T>
			extends Collection.Capability.WithFilter<T>,
				IndexedCollection.Capability.WithOrderEditable<T>,
				IndexedCollection.Capability.WithMap<T>,
				List.Capability.WithUpdateAt<T>,
				List.Capability.WithConcat<T>,
				List.Capability.WithReversed<T> {
			readonly context: List.Context<T>;
		}

		export interface Factory<
			T = any,
			Tp extends List.Advanced.Types<T> | List.Advanced.TypesNonEmpty<T> =
				| List.Advanced.Types<T>
				| List.Advanced.TypesNonEmpty<T>,
		> {
			createContext(options: { blockSizeBits?: number }): List.Context<T>;

			empty<T extends Tp['_UPPER_E']>(): (Tp & {
				_NEW_E: T;
			})['_NEW_TYPES']['_NORMAL'];

			of<T extends Tp['_UPPER_E']>(
				...elements: ArrayNonEmpty<T>
			): (Tp & { _NEW_E: T })['_NEW_TYPES']['_NON_EMPTY'];

			from<T extends Tp['_UPPER_E']>(
				...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
			): (Tp & { _NEW_E: T })['_NEW_TYPES']['_NON_EMPTY'];
			from<T extends Tp['_UPPER_E']>(
				...sources: ArrayNonEmpty<StreamSource<T>>
			): (Tp & { _NEW_E: T })['_NEW_TYPES']['_NORMAL'];

			builder<T extends Tp['_UPPER_E']>(): (Tp & {
				_NEW_E: T;
			})['_NEW_TYPES']['_BUILDER'];
		}

		export interface Types<T> extends IndexedCollection.Advanced.Types<T> {
			_NORMAL: List<T>;
			_NON_EMPTY: List.NonEmpty<T>;
			_BUILDER: List.Builder<T>;
			_NEW_TYPES: List.Advanced.Types<this['_NEW_E']>;
		}

		export interface TypesNonEmpty<T>
			extends IndexedCollection.Advanced.TypesNonEmpty<T> {
			_NORMAL: List<T>;
			_NON_EMPTY: List.NonEmpty<T>;
			_BUILDER: List.Builder<T>;
			_NEW_TYPES: List.Advanced.TypesNonEmpty<this['_NEW_E']>;
		}
	}
}

export const List: List.Advanced.Factory = createListContextModule({
	blockSizeBits: 5,
	childrenOps: new ArrayOuterChildrenOps() as ChildrenOps,
});
