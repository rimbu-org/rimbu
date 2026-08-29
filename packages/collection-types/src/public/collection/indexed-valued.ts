import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { OptLazy, RelatedTo } from '@rimbu/common';

export type IndexedValuedCollection<
	E,
	F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
> = IndexedValuedCollection.Advanced.ExtendFamily<E, F>['_NORMAL'];

export namespace IndexedValuedCollection {
	export type NonEmpty<
		E,
		F extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	> = Advanced.ExtendFamily<E, F>['_NON_EMPTY'];

	export namespace Advanced {
		export type ExtendFamily<
			E,
			F extends
				Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
		> = F & Family<E>;

		export interface Api<E, Tp extends Collection.Advanced.TypesBase>
			extends IndexedCollection.Advanced.Api<E, Tp>,
				ValuedCollection.Advanced.Api<E, Tp> {
			indexOf<UE = E>(key: RelatedTo<E, UE>): number | undefined;
			indexOf<UE, O>(key: RelatedTo<E, UE>, otherwise: OptLazy<O>): number | O;
		}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends IndexedCollection.Advanced.BuilderApi<E, Tp>,
				ValuedCollection.Advanced.BuilderApi<E, Tp> {
			indexOf<UE = E>(key: RelatedTo<E, UE>): number | undefined;
			indexOf<UE, O>(key: RelatedTo<E, UE>, otherwise: OptLazy<O>): number | O;
		}

		export interface ContextApi<
			F extends IndexedCollection.Advanced.Family<any> &
				ValuedCollection.Advanced.Family<any>,
		> extends IndexedCollection.Advanced.ContextApi<F>,
				ValuedCollection.Advanced.ContextApi<F> {}

		export interface Family<E>
			extends IndexedCollection.Advanced.Family<E>,
				ValuedCollection.Advanced.Family<E> {
			_NORMAL: Api<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_NON_EMPTY: Api<E, Collection.Advanced.TypesNonEmpty<this['_FAM'], E>>;
			_BUILDER: BuilderApi<E, Collection.Advanced.Types<this['_FAM'], E>>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}
}
