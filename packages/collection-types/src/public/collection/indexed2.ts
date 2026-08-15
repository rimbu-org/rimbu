import type { IndexRange, OptLazy } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';
import type { Collection } from '../collection2';

export type IndexedCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = IndexedCollection.Advanced.Types<
	F & IndexedCollection.Advanced.Family<E>,
	E
>['_NORMAL'];

export declare namespace IndexedCollection {
	export type NonEmpty<
		E,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Collection.Advanced.TypesNonEmpty<F, E>['_NON_EMPTY'] & {};

	export namespace Advanced {
		export type Types<F extends Collection.Advanced.FamilyBase<any>, E> = F & {
			_FAM: F;
		} & NormalKind<E>;

		export type TypesNonEmpty<
			F extends Collection.Advanced.FamilyBase<any>,
			E,
		> = F & {
			_FAM: F;
		} & NonEmptyKind<E>;

		export interface FamilyBase<E> extends Collection.Advanced.FamilyBase<E> {
			_firstLast: unknown;
			_take: unknown;
			_splitAt: unknown;

			_NEW_FAMILY: FamilyBase<this['_NEW_E']>;
		}

		export interface TypesBase extends FamilyBase<any> {
			_NEW_TYPES: TypesBase;
		}

		export interface NormalKind<E> extends Collection.Advanced.NormalKind<E> {
			_firstLast: {
				(): E | undefined;
				<O>(otherwise: OptLazy<O>): E | O;
			};
			_take: (amount: number) => this['_NORMAL'];
			_splitAt: (index: number) => [this['_NORMAL'], this['_NORMAL']];

			_NEW_TYPES: Types<this['_NEW_FAMILY'], this['_NEW_E']>;
		}

		export interface NonEmptyKind<E>
			extends Collection.Advanced.NonEmptyKind<E> {
			_firstLast: () => E | undefined;
			_take: {
				<const N extends number>(
					amount: N,
				): 0 extends N
					? NonEmptyKind<E>['_NORMAL']
					: NonEmptyKind<E>['_NON_EMPTY'];
				(amount: number): NonEmptyKind<E>['_NORMAL'];
			};
			_splitAt: {
				<const N extends number>(
					amount: N,
				): [
					0 extends N
						? NonEmptyKind<E>['_NORMAL']
						: NonEmptyKind<E>['_NON_EMPTY'],
					NonEmptyKind<E>['_NORMAL'],
				];
				(
					amount: number,
				): [NonEmptyKind<E>['_NORMAL'], NonEmptyKind<E>['_NORMAL']];
			};

			_NEW_TYPES: TypesNonEmpty<this['_NEW_FAMILY'], this['_NEW_E']>;
		}

		export interface Api<E, Tp extends TypesBase> {
			streamSlice(
				range: IndexRange,
				options?: { reversed?: boolean | undefined } | undefined,
			): Stream<E>;

			at(index: number): E | undefined;
			at<O>(index: number, otherwise: OptLazy<O>): E | O;

			first: Tp['_firstLast'];
			last: Tp['_firstLast'];

			take: Tp['_take'];
			drop(amount: number): Tp['_NORMAL'];
			splitAt: Tp['_splitAt'];
			slice(range: IndexRange): Tp['_NORMAL'];
		}

		export interface BuilderApi<E, Tp extends TypesBase> {
			at(index: number): E | undefined;
			at<O>(index: number, otherwise: OptLazy<O>): E | O;

			first: Tp['_firstLast'];
			last: Tp['_firstLast'];
		}

		export interface Family<E> extends FamilyBase<E> {
			_NORMAL: Api<E, Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Types<this['_FAM'], E>>;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}
}
