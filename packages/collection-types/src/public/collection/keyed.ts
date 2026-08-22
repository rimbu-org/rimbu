import type { Collection } from '@rimbu/collection-types/collection';
import type { Op, TypesKey } from '@rimbu/collection-types/types';
import type { OptLazy, RelatedTo } from '@rimbu/common';
import type { Stream, StreamSource } from '@rimbu/stream';

export type KeyedCollection<
	K,
	V,
	F extends Collection.Advanced.FamilyBase<
		readonly [K, V]
	> = Collection.Advanced.Family<readonly [K, V]>,
> = Collection.Advanced.Types<
	F & KeyedCollection.Advanced.Family<K, V>,
	readonly [K, V]
>['_NORMAL'];

export namespace KeyedCollection {
	export type NonEmpty<
		K,
		V,
		F extends Collection.Advanced.FamilyBase<
			readonly [K, V]
		> = Collection.Advanced.Family<readonly [K, V]>,
	> = Advanced.ExtendFamily<K, V, F>['_NON_EMPTY'];

	export type Builder<
		K,
		V,
		F extends Collection.Advanced.FamilyBase<
			readonly [K, V]
		> = Collection.Advanced.Family<readonly [K, V]>,
	> = Advanced.ExtendFamily<K, V, F>['_BUILDER'];

	export type Context<
		F extends
			Collection.Advanced.FamilyBase<any> = Collection.Advanced.Family<any>,
	> = Advanced.ExtendFamily<any, any, F>['_CONTEXT'];

	export namespace Advanced {
		export type ExtendFamily<
			K,
			V,
			F extends Collection.Advanced.FamilyBase<
				readonly [K, V]
			> = Collection.Advanced.Family<readonly [K, V]>,
		> = F & Family<K, V>;

		export interface Api<K, V, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.Api<readonly [K, V], Tp> {
			streamKeys(): Tp['_IS_NON_EMPTY'] extends true
				? Stream.NonEmpty<K>
				: Stream<K>;
			streamValues(): Tp['_IS_NON_EMPTY'] extends true
				? Stream.NonEmpty<V>
				: Stream<V>;

			get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
			get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;

			has<UK = K>(key: RelatedTo<K, UK>): boolean;
		}

		export interface BuilderApi<K, V, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.BuilderApi<readonly [K, V], Tp> {
			get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
			get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;

			has<UK = K>(key: RelatedTo<K, UK>): boolean;
		}

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends Collection.Advanced.ContextApi<F> {}

		export interface Family<K, V>
			extends Collection.Advanced.Family<readonly [K, V]> {
			_NORMAL: Api<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;
			_NON_EMPTY: Api<
				K,
				V,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], readonly [K, V]>
			>;
			_BUILDER: BuilderApi<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;
			_CONTEXT: ContextApi<this['_FAM']>;

			_UPPER_K: unknown;
			_UPPER_V: unknown;

			_NEW_K: unknown;
			_NEW_V: unknown;

			_UPPER_E: readonly [this['_UPPER_K'], this['_UPPER_V']];
			_NEW_E: readonly [this['_NEW_K'], this['_NEW_V']];

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}

		export type ReTyped<
			F extends KeyedCollection.Advanced.Family<any, any>,
			K,
			V,
		> = (F & { _NEW_K: K; _NEW_V: V })['_NEW_FAMILY'];
	}

	export namespace Capability {
		export interface WithRemove<K, V> extends Advanced.Family<K, V> {
			_NORMAL: WithRemove.Api<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;
			_NON_EMPTY: WithRemove.Api<
				K,
				V,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], readonly [K, V]>
			>;
			_BUILDER: WithRemove.BuilderApi<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;

			_FAM: WithRemove<K, V>;
			_NEW_FAMILY: WithRemove<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithRemove {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<K, V, Tp> {
				removeKey<UK = K>(key: RelatedTo<K, UK>): Tp['_NORMAL'];

				removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): Tp['_NORMAL'];

				removeKeyAndReturn<UK = K>(
					key: RelatedTo<K, UK>,
				): Op.DynamicResult<Tp['_SELF'], undefined, V, Tp['_NORMAL']>;
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> extends Advanced.BuilderApi<K, V, Tp> {
				removeKey<UK = K>(key: RelatedTo<K, UK>): boolean;

				removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): boolean;
			}
		}

		export interface WithMapValues<K, V> extends Advanced.Family<K, V> {
			_NORMAL: WithMapValues.Api<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;
			_NON_EMPTY: WithMapValues.Api<
				K,
				V,
				Collection.Advanced.TypesNonEmpty<this['_FAM'], readonly [K, V]>
			>;

			_FAM: WithMapValues<K, V>;
			_NEW_FAMILY: WithMapValues<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithMapValues {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<K, V, Tp> {
				[TypesKey]: Collection.Advanced.InvariantTypes<Tp, V>;

				mapValues<V2 extends V>(
					mapFun: (value: V, key: K) => V2,
				): Collection.Advanced.ReTyped<Tp, readonly [K, V2]>['_SELF'];
			}
		}
	}
}
