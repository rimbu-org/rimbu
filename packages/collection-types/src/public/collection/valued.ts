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
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}

	export namespace Capability {
		export interface WithDifferenceAndIntersection<E>
			extends Advanced.Family<E> {
			_NORMAL: WithDifferenceAndIntersection.Api<
				E,
				Collection.Advanced.Types<this['_FAM'], E>
			>;
			_NON_EMPTY: WithDifferenceAndIntersection.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;

			_FAM: WithDifferenceAndIntersection<E>;
			_NEW_FAMILY: WithDifferenceAndIntersection<this['_NEW_E']>;
		}

		export namespace WithDifferenceAndIntersection {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				difference<UE = E>(
					other: StreamSource<RelatedTo<E, UE>>,
				): Tp['_NORMAL'];

				intersection<UE = E>(
					other: StreamSource<RelatedTo<E, UE>>,
				): Tp['_NORMAL'];
			}
		}

		export interface WithRemove<E> extends Advanced.Family<E> {
			_NORMAL: WithRemove.Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithRemove.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;
			_BUILDER: WithRemove.BuilderApi<
				E,
				Collection.Advanced.Types<this['_FAM'], E>
			>;

			_FAM: WithRemove<E>;
			_NEW_FAMILY: WithRemove<this['_NEW_E']>;
		}

		export namespace WithRemove {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				remove<UE = E>(element: RelatedTo<E, UE>): Tp['_NORMAL'];

				removeAll<UE = E>(
					elements: StreamSource<RelatedTo<E, UE>>,
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.BuilderApi<E, Tp> {
				remove<UE = E>(element: RelatedTo<E, UE>): boolean;

				removeAll<UE = E>(elements: StreamSource<RelatedTo<E, UE>>): boolean;
			}
		}

		export interface WithSymmetricDifferenceAndUnion<E>
			extends Advanced.Family<E> {
			_NORMAL: WithSymmetricDifferenceAndUnion.Api<
				E,
				Collection.Advanced.Types<this['_FAM'], E>
			>;
			_NON_EMPTY: WithSymmetricDifferenceAndUnion.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;

			_FAM: WithSymmetricDifferenceAndUnion<E>;
			_NEW_FAMILY: WithSymmetricDifferenceAndUnion<this['_NEW_E']>;
		}

		export namespace WithSymmetricDifferenceAndUnion {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				symmetricDifference(other: StreamSource<E>): Tp['_NORMAL'];

				union(other: StreamSource.NonEmpty<E>): Tp['_NON_EMPTY'];
				union(other: StreamSource<E>): Tp['_SELF'];
			}
		}
	}
}
