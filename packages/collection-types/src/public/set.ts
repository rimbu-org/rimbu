import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { TypesKey } from '@rimbu/collection-types/types';
import type { RelatedTo } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

export type SetCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = SetCollection.Advanced.ExtendFamily<E, F>['_NORMAL'];

export namespace SetCollection {
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
			extends ValuedCollection.Advanced.Api<E, Tp> {}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends ValuedCollection.Advanced.BuilderApi<E, Tp> {}

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends ValuedCollection.Advanced.ContextApi<F> {}

		export interface Family<E> extends ValuedCollection.Advanced.Family<E> {
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}

	export namespace Capability {
		export interface WithAdd<E> extends Advanced.Family<E> {
			_NORMAL: WithAdd.Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithAdd.Api<
				E,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], E>
			>;
			_BUILDER: WithAdd.BuilderApi<
				E,
				Collection.Advanced.Types<this['_FAM'], E>
			>;

			_FAM: WithAdd<E>;
			_NEW_FAMILY: WithAdd<this['_NEW_E']>;
		}

		export namespace WithAdd {
			export interface Api<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<E, Tp> {
				[TypesKey]: Collection.Advanced.InvariantTypes<Tp, E>;

				add(element: E): Tp['_NON_EMPTY'];

				addAll(elements: StreamSource.NonEmpty<E>): Tp['_NON_EMPTY'];
				addAll(elements: StreamSource<E>): Tp['_SELF'];
			}

			export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.BuilderApi<E, Tp> {
				add(element: E): boolean;

				addAll(elements: StreamSource<E>): boolean;
			}
		}

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
				[TypesKey]: Collection.Advanced.InvariantTypes<Tp, E>;

				symmetricDifference(other: StreamSource<E>): Tp['_NORMAL'];

				union(other: StreamSource.NonEmpty<E>): Tp['_NON_EMPTY'];
				union(other: StreamSource<E>): Tp['_SELF'];
			}
		}
	}
}
