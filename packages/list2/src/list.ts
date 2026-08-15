import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed3';
import type { Collection } from '@rimbu/collection-types/collection2';

export interface List<T>
	extends List.Advanced.Api<
		T,
		Collection.Advanced.Types<List.Advanced.Family<T>, T> &
			Collection.Advanced.Types<List.Advanced.Family<T>, T>
	> {}

export declare namespace List {
	export interface NonEmpty<T>
		extends List.Advanced.Api<
			T,
			Collection.Advanced.TypesNonEmpty<List.Advanced.Family<T>, T>
		> {}

	export interface Builder<T>
		extends IndexedCollection.Advanced.BuilderApi<
			T,
			Collection.Advanced.Types<List.Advanced.Family<T>, T>
		> {}

	export interface Context<T>
		extends Collection.Context<
			Collection.Advanced.Types<List.Advanced.Family<T>, T>
		> {
		readonly blockSizeBits: number;
	}

	export namespace Advanced {
		export type Api<
			T,
			Tp extends Collection.Advanced.TypesBase,
		> = IndexedCollection.Advanced.Api<T, Tp> &
			Collection.Capability.WithMap.Api<T, Tp>;

		// export interface Factory<T, Tp extends List.Advanced.Types<T>>
		// 	extends Collection.Advanced.ContextBase<Tp> {
		// 	createContext(options: { blockSizeBits?: number }): List.Context<T>;
		// }

		// export type DefaultFactory = Factory<any, List.Advanced.Types<any>>;

		export interface Family<T> extends IndexedCollection.Advanced.Family<T> {
			_NORMAL: List<T>;
			_NON_EMPTY: List.NonEmpty<T>;
			_BUILDER: List.Builder<T>;
			_CONTEXT: List.Context<T>;

			// _UPPER_E: any;

			_FAM: Family<T>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}
}
const l: List<number> = 0 as any;
const c = l.context;
c.of(1, 2, 3);
