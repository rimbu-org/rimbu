import type { Collection } from '@rimbu/collection-types/collection2';
import type { Op, TypesKey } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty, IndexRange, OptLazy } from '@rimbu/common';
import type { Stream, StreamSource } from '@rimbu/stream';

export type IndexedCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = Collection.Advanced.Types<
	F & IndexedCollection.Advanced.Family<E>,
	E
>['_NORMAL'];

export declare namespace IndexedCollection {
	export type NonEmpty<
		E,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Collection.Advanced.TypesNonEmpty<F, E>['_NON_EMPTY'];

	export namespace Advanced {
		export interface Api<E, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.Api<E, Tp> {
			streamSlice(
				range: IndexRange,
				options?: { reversed?: boolean | undefined } | undefined,
			): Stream<E>;

			at(index: number): E | undefined;
			at<O>(index: number, otherwise: OptLazy<O>): E | O;

			first: Tp extends Collection.Advanced.NonEmptyKind<any>
				? (otherwise?: never) => E
				: {
						(): E | undefined;
						<O>(otherwise: OptLazy<O>): E | O;
					};
			last: Tp extends Collection.Advanced.NonEmptyKind<any>
				? (otherwise?: never) => E
				: {
						(): E | undefined;
						<O>(otherwise: OptLazy<O>): E | O;
					};

			take<const N extends number>(
				amount: N,
			): 0 extends N ? Tp['_NORMAL'] : Tp['_SELF'];

			drop(amount: number): Tp['_NORMAL'];

			splitAt<const N extends number>(
				amount: N,
			): [0 extends N ? Tp['_NORMAL'] : Tp['_SELF'], Tp['_NORMAL']];
			slice(range: IndexRange): Tp['_NORMAL'];
		}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.BuilderApi<E, Tp> {
			at(index: number): E | undefined;
			at<O>(index: number, otherwise: OptLazy<O>): E | O;

			first(): E | undefined;
			first<O>(otherwise: OptLazy<O>): E | O;
			last(): E | undefined;
			last<O>(otherwise: OptLazy<O>): E | O;
		}

		export interface Family<E> extends Collection.Advanced.Family<E> {
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}

	export namespace Capability {
		export interface WithConcat<E> extends Advanced.Family<E> {
			_NORMAL: WithConcat.Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithConcat.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;

			_FAM: WithConcat<E>;
			_NEW_FAMILY: WithConcat<this['_NEW_E']>;
		}

		export namespace WithConcat {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				concat(
					...sources: ArrayNonEmpty<StreamSource.NonEmpty<E>>
				): Tp['_NON_EMPTY'];
				concat(...sources: ArrayNonEmpty<StreamSource<E>>): Tp['_SELF'];

				repeat<N extends number>(
					amount: N,
				): 0 extends N ? Tp['_NORMAL'] : Tp['_SELF'];
			}
		}

		export interface WithPadTo<E> extends Advanced.Family<E> {
			_NORMAL: WithPadTo.Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithPadTo.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;

			_FAM: WithPadTo<E>;
			_NEW_FAMILY: WithPadTo<this['_NEW_E']>;
		}

		export namespace WithPadTo {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				[TypesKey]: Collection.Advanced.InvariantTypes<Tp, E>;

				padTo(
					size: number,
					fill: E,
					options?: { paddingLeftBias?: number | undefined } | undefined,
				): Tp['_SELF'];
			}
		}

		export interface WithPrependAppend<E> extends Advanced.Family<E> {
			_NORMAL: WithPrependAppend.Api<
				E,
				Collection.Advanced.Types<this['_FAM'], E>
			>;
			_NON_EMPTY: WithPrependAppend.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;
			_BUILDER: WithPrependAppend.BuilderApi<
				E,
				Collection.Advanced.Types<this['_FAM'], E>
			>;

			_FAM: WithPrependAppend<E>;
			_NEW_FAMILY: WithPrependAppend<this['_NEW_E']>;
		}

		export namespace WithPrependAppend {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				[TypesKey]: Collection.Advanced.InvariantTypes<Tp, E>;

				prepend(element: E): Tp['_NON_EMPTY'];
				append(element: E): Tp['_NON_EMPTY'];
			}

			export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.BuilderApi<E, Tp> {
				prepend(element: E): void;
				append(element: E): void;

				prependAll(source: StreamSource<E>): void;
				appendAll(source: StreamSource<E>): void;
			}
		}

		export interface WithSpliceAt<E> extends Advanced.Family<E> {
			_NORMAL: WithSpliceAt.Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithSpliceAt.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;

			_FAM: WithSpliceAt<E>;
			_NEW_FAMILY: WithSpliceAt<this['_NEW_E']>;
		}

		export namespace WithSpliceAt {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				[TypesKey]: Collection.Advanced.InvariantTypes<Tp, E>;

				spliceAt(
					index: number,
					options: {
						removeAmount?: number | undefined;
						insert: StreamSource.NonEmpty<E>;
					},
				): Tp['_NON_EMPTY'];
				spliceAt(
					index: number,
					options?:
						| {
								removeAmount?: number | undefined;
								insert?: StreamSource<E> | undefined;
						  }
						| undefined,
				): Tp['_NORMAL'];
				spliceAtAndReturn(
					index: number,
					options: {
						removeAmount?: number | undefined;
						insert: StreamSource.NonEmpty<E>;
					},
				): Op.WithResult<
					Tp['_NON_EMPTY'],
					[removed: Tp['_NORMAL'], inserted: Tp['_NON_EMPTY']],
					true
				>;
				spliceAtAndReturn(
					index: number,
					options?:
						| {
								removeAmount?: number | undefined;
								insert?: StreamSource<E> | undefined;
						  }
						| undefined,
				): Op.DynamicResult<
					Tp['_SELF'],
					[removed: Tp['_NORMAL'], inserted: Tp['_NORMAL']],
					[removed: Tp['_NORMAL'], inserted: Tp['_NORMAL']],
					Tp['_NORMAL']
				>;

				insertAt(
					index: number,
					values: StreamSource.NonEmpty<E>,
				): Tp['_NON_EMPTY'];
				insertAt(index: number, values: StreamSource<E>): Tp['_SELF'];
			}
		}

		export interface WithRemoveAt<E> extends Advanced.Family<E> {
			_NORMAL: WithRemoveAt.Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithRemoveAt.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;

			_FAM: WithRemoveAt<E>;
			_NEW_FAMILY: WithRemoveAt<this['_NEW_E']>;
		}

		export namespace WithRemoveAt {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				removeAt(index: number, amount?: number | undefined): Tp['_NORMAL'];

				removeAtAndReturn(
					index: number,
					amount?: number | undefined,
				): Op.DynamicResult<
					Tp['_SELF'],
					Tp['_NORMAL'],
					Tp['_NON_EMPTY'],
					Tp['_NORMAL']
				>;
			}
		}

		export interface WithUpdateAt<E> extends Advanced.Family<E> {
			_NORMAL: WithUpdateAt.Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithUpdateAt.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;

			_FAM: WithUpdateAt<E>;
			_NEW_FAMILY: WithUpdateAt<this['_NEW_E']>;
		}

		export namespace WithUpdateAt {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				[TypesKey]: Collection.Advanced.InvariantTypes<Tp, E>;

				setAt(index: number, element: E): Tp['_SELF'];
				setAtAndReturn(
					index: number,
					element: E,
				): Op.DynamicResult<Tp['_SELF'], undefined, E, Tp['_NON_EMPTY']>;

				updateAt(index: number, f: (element: E) => E): Tp['_SELF'];
				updateAtAndReturn(
					index: number,
					f: (element: E) => E,
				): Op.DynamicResult<
					Tp['_SELF'],
					[previous: undefined, current: undefined],
					[previous: E, current: E],
					Tp['_NON_EMPTY']
				>;
			}
		}

		export interface WithSwapAt<E> extends Advanced.Family<E> {
			_NORMAL: WithSwapAt.Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithSwapAt.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;

			_FAM: WithSwapAt<E>;
			_NEW_FAMILY: WithSwapAt<this['_NEW_E']>;
		}

		export namespace WithSwapAt {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				swapAt(index1: number, index2: number): Tp['_SELF'];
				swapAtAndReturn(
					index1: number,
					index2: number,
				): Op.DynamicResult<
					Tp['_SELF'],
					[previous1: undefined, previous2: undefined],
					[previous1: E, previous2: E],
					Tp['_NON_EMPTY']
				>;
			}
		}
	}
}
