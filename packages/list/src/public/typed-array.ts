import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { List } from '@rimbu/list';

import type { ChildrenOps } from '#advanced/children-ops';

import { TypedArrayOuterChildrenOps } from '#list/children-ops/typed-array';
import { ListContext } from '#list/context';

export interface TypedArrayList<V extends TypedArrayList.View>
	extends TypedArrayList.Advanced.Api<
		Collection.Advanced.Types<TypedArrayList.Advanced.Family<V>, number>
	> {}

export declare namespace TypedArrayList {
	export type View =
		| Int8Array
		| Uint8Array
		| Int16Array
		| Uint16Array
		| Int32Array
		| Uint32Array
		| Float32Array
		| Float64Array;

	export interface NonEmpty<V extends TypedArrayList.View>
		extends TypedArrayList.Advanced.Api<
			Collection.Advanced.TypesNonEmpty<
				TypedArrayList.Advanced.Family<V>,
				number
			>
		> {}

	export interface Builder<V extends TypedArrayList.View>
		extends TypedArrayList.Advanced.BuilderApi<
			Collection.Advanced.Types<TypedArrayList.Advanced.Family<V>, number>
		> {}

	export interface Context<V extends TypedArrayList.View>
		extends TypedArrayList.Advanced.ContextApi<
			TypedArrayList.Advanced.Family<V>
		> {}

	export namespace Advanced {
		export type Api<Tp extends Collection.Advanced.TypesBase> =
			List.Advanced.Api<number, Tp>;

		export type BuilderApi<Tp extends Collection.Advanced.TypesBase> =
			List.Advanced.BuilderApi<number, Tp>;

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends List.Advanced.ContextApi<F> {}

		export interface Family<V extends View>
			extends IndexedCollection.Advanced.Family<number> {
			_NORMAL: TypedArrayList<V>;
			_NON_EMPTY: TypedArrayList.NonEmpty<V>;
			_BUILDER: TypedArrayList.Builder<V>;
			_CONTEXT: TypedArrayList.Context<V>;

			_UPPER_E: number;
			_INVARIANT: (element: number) => boolean;

			_FAM: Family<V>;
			_NEW_FAMILY: Family<V>;
		}
	}

	export interface Factory {
		createContext<V extends View>(options: {
			ViewConstructor: {
				readonly BYTES_PER_ELEMENT: number;
				new (buffer: ArrayBuffer): V;
			};
			blockSizeBits?: number;
		}): TypedArrayList.Context<V>;
	}
}

export const TypedArrayList: TypedArrayList.Factory = {
	createContext<V extends TypedArrayList.View>(options: {
		ViewConstructor: {
			readonly BYTES_PER_ELEMENT: number;
			new (buffer: ArrayBuffer): V;
		};
		blockSizeBits?: number;
	}): TypedArrayList.Context<V> {
		const { ViewConstructor, blockSizeBits = 5 } = options;
		return ListContext.createDefault(
			blockSizeBits,
			(bits) =>
				new TypedArrayOuterChildrenOps<V>(
					ViewConstructor as unknown as never,
					bits,
				) as unknown as ChildrenOps,
		) as unknown as TypedArrayList.Context<V>;
	},
};
