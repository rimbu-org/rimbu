import type { Collection } from '@rimbu/collection-types/collection';
import type { OptLazy, RelatedTo } from '@rimbu/common';

export type SortedCollection<
	E,
	S,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = SortedCollection.Advanced.ExtendFamily<E, S, F>['_NORMAL'];

export namespace SortedCollection {
	export type NonEmpty<
		E,
		S,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Advanced.ExtendFamily<E, S, F>['_NON_EMPTY'];

	export type Context<
		F extends
			Collection.Advanced.FamilyBase<any> = Collection.Advanced.Family<any>,
	> = Advanced.ExtendFamily<any, any, F>['_CONTEXT'];

	export type Builder<
		E,
		S,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Advanced.ExtendFamily<E, S, F>['_BUILDER'];

	export namespace Advanced {
		export type ExtendFamily<
			E,
			S,
			F extends
				Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
		> = F & Family<E, S>;

		export interface MinMax<E, IsNonEmpty extends boolean = boolean> {
			(): IsNonEmpty extends true ? E : E | undefined;
			<O>(otherwise: IsNonEmpty extends true ? never : OptLazy<O>): E | O;
		}

		export interface Api<E, S, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.Api<E, Tp> {
			min: MinMax<E, Tp['_IS_NON_EMPTY']>;
			max: MinMax<E, Tp['_IS_NON_EMPTY']>;

			previous<US = S>(
				search: RelatedTo<S, US>,
				options?:
					| { inclusive?: boolean | undefined; otherwise?: undefined }
					| undefined,
			): E | undefined;
			previous<US, O>(
				search: RelatedTo<S, US>,
				options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
			): E | O;

			next<US = S>(
				search: RelatedTo<S, US>,
				options?:
					| { inclusive?: boolean | undefined; otherwise?: undefined }
					| undefined,
			): E | undefined;
			next<US, O>(
				search: RelatedTo<S, US>,
				options: { inclusive?: boolean | undefined; otherwise: OptLazy<O> },
			): E | O;
		}

		export interface BuilderApi<E, S, Tp extends Collection.Advanced.TypesBase>
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

		export interface Family<E, S> extends Collection.Advanced.Family<E> {
			_NORMAL: Api<E, S, this['_TYPES']>;
			_NON_EMPTY: Api<E, S, this['_TYPES_NON_EMPTY']>;
			_BUILDER: BuilderApi<E, S, this['_TYPES']>;

			_NEW_E_TO_S: unknown;

			_FAM: Family<E, S>;
			_NEW_FAMILY: Family<this['_NEW_E'], this['_NEW_E_TO_S']>;
		}
	}
}
