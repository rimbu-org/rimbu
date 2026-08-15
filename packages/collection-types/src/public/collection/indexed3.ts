import type { IndexRange, OptLazy } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';
import type { Collection } from '../collection2';

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
}
