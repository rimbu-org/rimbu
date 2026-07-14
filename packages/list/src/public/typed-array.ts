import type { ListBase } from '#list/list-base';

import { TypedArrayListHelpers } from '#list/typed-array-helpers';

export interface TypedArrayList<V extends TypedArrayList.View>
	extends ListBase<number, TypedArrayListHelpers.Types<V>> {}

export namespace TypedArrayList {
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
		extends ListBase.NonEmpty<number, TypedArrayListHelpers.Types<V>>,
			Omit<TypedArrayList<V>, keyof ListBase.NonEmpty<any>> {}

	export interface Builder<V extends TypedArrayList.View>
		extends ListBase.Builder<number, TypedArrayListHelpers.Types<V>> {}

	export interface Context<V extends TypedArrayList.View>
		//  TypedArrayListHelpers.Factory,
		extends ListBase.Context<TypedArrayListHelpers.Types<V>> {}
}

export const TypedArrayList = {
	createContext: TypedArrayListHelpers.createTypedArrayListContext,
};
