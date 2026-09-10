import type { Collection } from '@rimbu/collection-types/collection';
import type { RelatedTo } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

export type ValuedCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = ValuedCollection.Advanced.ExtendFamily<E, F>['_NORMAL'];

export declare namespace ValuedCollection {
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

		export interface Api<E, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.Api<E, Tp> {
			has<UE = E>(value: RelatedTo<E, UE>): boolean;
		}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.BuilderApi<E, Tp> {
			has<UE = E>(value: RelatedTo<E, UE>): boolean;
		}

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends Collection.Advanced.ContextApi<F> {}

		export interface Family<E> extends Collection.Advanced.Family<E> {
			_NORMAL: Api<E, this['_TYPES']>;
			_NON_EMPTY: Api<E, this['_TYPES_NON_EMPTY']>;
			_BUILDER: BuilderApi<E, this['_TYPES']>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}

	export namespace Capability {
		export interface WithDifference<E>
			extends Collection.Advanced.FamilyBase<E> {
			_NORMAL: WithDifference.Api<E, this['_TYPES']>;
			_NON_EMPTY: WithDifference.Api<E, this['_TYPES_NON_EMPTY']>;

			_FAM: WithDifference<E>;
			_NEW_FAMILY: WithDifference<this['_NEW_E']>;
		}

		export namespace WithDifference {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase> {
				difference<UE = E>(
					other: StreamSource<RelatedTo<E, UE>>,
				): Tp['_NORMAL'];
			}
		}

		export interface WithIntersection<E>
			extends Collection.Advanced.FamilyBase<E> {
			_NORMAL: WithIntersection.Api<E, this['_TYPES']>;
			_NON_EMPTY: WithIntersection.Api<E, this['_TYPES_NON_EMPTY']>;

			_FAM: WithIntersection<E>;
			_NEW_FAMILY: WithIntersection<this['_NEW_E']>;
		}

		export namespace WithIntersection {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase> {
				intersection<UE = E>(
					other: StreamSource<RelatedTo<E, UE>>,
				): Tp['_NORMAL'];
			}
		}

		export interface WithRemove<E> extends Collection.Advanced.FamilyBase<E> {
			_NORMAL: WithRemove.Api<E, this['_TYPES']>;
			_NON_EMPTY: WithRemove.Api<E, this['_TYPES_NON_EMPTY']>;
			_BUILDER: WithRemove.BuilderApi<E, this['_TYPES']>;

			_FAM: WithRemove<E>;
			_NEW_FAMILY: WithRemove<this['_NEW_E']>;
		}

		export namespace WithRemove {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase> {
				remove<UE = E>(element: RelatedTo<E, UE>): Tp['_NORMAL'];
			}

			export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase> {
				remove<UE = E>(element: RelatedTo<E, UE>): boolean;
			}
		}

		export interface WithRemoveAll<E>
			extends Collection.Advanced.FamilyBase<E> {
			_NORMAL: WithRemoveAll.Api<E, this['_TYPES']>;
			_NON_EMPTY: WithRemoveAll.Api<E, this['_TYPES_NON_EMPTY']>;
			_BUILDER: WithRemoveAll.BuilderApi<E, this['_TYPES']>;

			_FAM: WithRemoveAll<E>;
			_NEW_FAMILY: WithRemoveAll<this['_NEW_E']>;
		}

		export namespace WithRemoveAll {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase> {
				removeAll<UE = E>(
					elements: StreamSource<RelatedTo<E, UE>>,
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase> {
				removeAll<UE = E>(elements: StreamSource<RelatedTo<E, UE>>): boolean;
			}
		}

		export interface WithSymmetricDifference<E>
			extends Collection.Advanced.FamilyBase<E> {
			_NORMAL: WithSymmetricDifference.Api<E, this['_TYPES']>;
			_NON_EMPTY: WithSymmetricDifference.Api<E, this['_TYPES_NON_EMPTY']>;

			_FAM: WithSymmetricDifference<E>;
			_NEW_FAMILY: WithSymmetricDifference<this['_NEW_E']>;
		}

		export namespace WithSymmetricDifference {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase> {
				symmetricDifference(other: StreamSource<E>): Tp['_NORMAL'];
			}
		}

		export interface WithUnion<E> extends Collection.Advanced.FamilyBase<E> {
			_NORMAL: WithUnion.Api<E, this['_TYPES']>;
			_NON_EMPTY: WithUnion.Api<E, this['_TYPES_NON_EMPTY']>;

			_FAM: WithUnion<E>;
			_NEW_FAMILY: WithUnion<this['_NEW_E']>;
		}

		export namespace WithUnion {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase> {
				union(other: StreamSource.NonEmpty<E>): Tp['_NON_EMPTY'];
				union(other: StreamSource<E>): Tp['_SELF'];
			}
		}
	}
}
