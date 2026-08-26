import type { Collection } from '@rimbu/collection-types/collection';
import type { Op } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty, IndexRange, OptLazy } from '@rimbu/common';
import type { Stream, StreamSource } from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

export type IndexedCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = IndexedCollection.Advanced.ExtendFamily<E, F>['_NORMAL'];

export declare namespace IndexedCollection {
	export type NonEmpty<
		E,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Advanced.ExtendFamily<E, F>['_NON_EMPTY'];

	export type Context<
		F extends
			Collection.Advanced.FamilyBase<any> = Collection.Advanced.Family<any>,
	> = Advanced.ExtendFamily<any, F>['_CONTEXT'];

	export type Builder<
		E,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Advanced.ExtendFamily<E, F>['_BUILDER'];

	export namespace Advanced {
		export type ExtendFamily<
			E,
			F extends
				Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
		> = F & Family<E>;

		/**
		 * The signature of `first` and `last`, which yield `E` on a non-empty
		 * collection and `E | undefined` on a possibly empty one.
		 *
		 * Keyed on the `_IS_NON_EMPTY` Kind discriminant rather than declared as
		 * a member-level conditional, so the member type stays a plain interface
		 * reference and remains implementable by classes that are generic over
		 * the family.
		 */
		export interface FirstLast<E, IsNonEmpty extends boolean = boolean> {
			(): IsNonEmpty extends true ? E : E | undefined;
			<O>(otherwise: OptLazy<O>): IsNonEmpty extends true ? E : E | O;
		}

		export interface Api<E, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.Api<E, Tp> {
			streamSlice(
				range: IndexRange,
				options?: { reversed?: boolean | undefined } | undefined,
			): Stream<E>;

			at(index: number): E | undefined;
			at<O>(index: number, otherwise: OptLazy<O>): E | O;

			first: FirstLast<E, Tp['_IS_NON_EMPTY']>;
			last: FirstLast<E, Tp['_IS_NON_EMPTY']>;

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

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends Collection.Advanced.ContextApi<F> {}

		export interface Family<E> extends Collection.Advanced.Family<E> {
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_CONTEXT: ContextApi<this['_FAM']>;

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
			}
		}

		export interface WithInsertAt<E> extends Advanced.Family<E> {}

		export namespace WithInsertAt {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				insertAt(
					index: number,
					elements: StreamSource.NonEmpty<E>,
				): Tp['_NON_EMPTY'];
				insertAt(index: number, elements: StreamSource<E>): Tp['_SELF'];
			}

			export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.BuilderApi<E, Tp> {
				insertAt(index: number, element: E): void;

				insertAllAt(index: number, elements: StreamSource<E>): void;
			}
		}

		export interface WithRemoveAt<E> extends Advanced.Family<E> {
			_NORMAL: WithRemoveAt.Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithRemoveAt.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;
			_BUILDER: WithRemoveAt.BuilderApi<
				E,
				Collection.Advanced.Types<this['_FAM'], E>
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

			export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.BuilderApi<E, Tp> {
				removeAt(index: number): E | undefined;
				removeAt<O>(index: number, otherwise: OptLazy<O>): E | O;

				removeAmountAt(index: number, amount: number): boolean;
				removeAmountAt<R>(
					index: number,
					amount: number,
					collector: Reducer<E, R>,
				): R;

				removeAllAt(indices: StreamSource<number>): boolean;
				removeAllAt<R>(
					indices: StreamSource<number>,
					collector: Reducer<E, R>,
				): R;
			}
		}

		export interface WithUpdateAt<E> extends Advanced.Family<E> {
			_NORMAL: WithUpdateAt.Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithUpdateAt.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;
			_BUILDER: WithUpdateAt.BuilderApi<
				E,
				Collection.Advanced.Types<this['_FAM'], E>
			>;

			_FAM: WithUpdateAt<E>;
			_NEW_FAMILY: WithUpdateAt<this['_NEW_E']>;
		}

		export namespace WithUpdateAt {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
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

			export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.BuilderApi<E, Tp> {
				setAt(index: number, element: E): E | undefined;
				setAt<O>(index: number, element: E, otherwise: OptLazy<O>): E | O;

				updateAt(
					index: number,
					f: (element: E) => E,
				): [previous: E | undefined, current: E | undefined];
				updateAt<O>(
					index: number,
					f: (element: E) => E,
					otherwise: OptLazy<O>,
				): [previous: E | O, current: E | O];
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

		export interface WithUnzip<E> extends Advanced.Family<E> {
			_CONTEXT: WithUnzip.ContextApi<this['_FAM']>;

			_FAM: WithUnzip<E>;
			_NEW_FAMILY: WithUnzip<this['_NEW_E']>;
		}

		export namespace WithUnzip {
			export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
				extends Advanced.ContextApi<F> {
				unzip<
					E extends readonly F['_UPPER_E'][] & { length?: L; size?: L },
					const L extends number,
				>(
					source: StreamSource.NonEmpty<E>,
					options: { length: L },
				): {
					[K in keyof E]: Collection.Advanced.FamToTypes<F, E[K]>['_NON_EMPTY'];
				};

				unzip<
					E extends readonly F['_UPPER_E'][] & { length?: L; size?: L },
					const L extends number,
				>(
					source: StreamSource<E>,
					options: { length: L },
				): {
					[K in keyof E]: Collection.Advanced.FamToTypes<F, E[K]>['_NORMAL'];
				};
			}
		}

		export interface WithFlatten<E> extends Advanced.Family<E> {
			_CONTEXT: WithFlatten.ContextApi<this['_FAM']>;

			_FAM: WithFlatten<E>;
			_NEW_FAMILY: WithFlatten<this['_NEW_E']>;
		}

		export namespace WithFlatten {
			export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
				extends Advanced.ContextApi<F> {
				flatten<E extends F['_UPPER_E']>(
					source: StreamSource.NonEmpty<StreamSource<E>>,
				): Collection.Advanced.FamToTypes<F, E>['_NON_EMPTY'];
				flatten<E extends F['_UPPER_E']>(
					source: StreamSource<StreamSource<E>>,
				): Collection.Advanced.FamToTypes<F, E>['_NORMAL'];
			}
		}
	}
}
