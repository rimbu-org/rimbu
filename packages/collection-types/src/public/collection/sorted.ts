import type { Collection } from '@rimbu/collection-types/collection';
import type { Comp, OptLazy } from '@rimbu/common';

export type SortedCollection<
	S,
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = SortedCollection.Advanced.ExtendFamily<S, E, F>['_NORMAL'];

export namespace SortedCollection {
	export type NonEmpty<
		S,
		E,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Advanced.ExtendFamily<S, E, F>['_NON_EMPTY'];

	export type Builder<
		S,
		E,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Advanced.ExtendFamily<S, E, F>['_BUILDER'];

	export namespace Advanced {
		export type ExtendFamily<
			S,
			E,
			F extends
				Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
		> = F & Family<S, E>;

		export interface MinMax<E, IsNonEmpty extends boolean = boolean> {
			(): IsNonEmpty extends true ? E : E | undefined;
			<O>(otherwise: IsNonEmpty extends true ? never : OptLazy<O>): E | O;
		}

		export interface Api<S, E, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.Api<E, Tp> {
			min: MinMax<E, Tp['_IS_NON_EMPTY']>;
			max: MinMax<E, Tp['_IS_NON_EMPTY']>;

			previous<O>(
				search: S,
				options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
			): E | O;
			previous(
				search: S,
				options?:
					| { inclusive?: boolean | undefined; otherwise?: undefined }
					| undefined,
			): E | undefined;

			next<O>(
				search: S,
				options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
			): E | O;
			next(
				search: S,
				options?:
					| { inclusive?: boolean | undefined; otherwise?: undefined }
					| undefined,
			): E | undefined;
		}

		export interface BuilderApi<S, E, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.BuilderApi<E, Tp> {
			min(): E | undefined;
			min<O>(otherwise: OptLazy<O>): E | O;
			max(): E | undefined;
			max<O>(otherwise: OptLazy<O>): E | O;

			previous(
				search: S,
				options?:
					| { inclusive?: boolean | undefined; otherwise?: undefined }
					| undefined,
			): E | undefined;
			previous<O>(
				search: S,
				options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
			): E | O;

			next(
				search: S,
				options?:
					| { inclusive?: boolean | undefined; otherwise?: undefined }
					| undefined,
			): E | undefined;
			next<O>(
				search: S,
				options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
			): E | O;
		}

		export interface ContextApi<F extends Family<any, any>>
			extends Collection.Advanced.ContextApi<F> {
			readonly comp: Comp<F['_UPPER_S']>;
		}

		export interface Family<S, E> extends Collection.Advanced.Family<E> {
			_NORMAL: Api<S, E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<S, E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<S, E, Collection.Advanced.Types<this['_FAM'], E>>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_UPPER_S: unknown;
			_NEW_S: unknown;

			_FAM: Family<S, E>;
			_NEW_FAMILY: Family<this['_NEW_S'], this['_NEW_E']>;
		}
	}
}
