import type { Collection } from '@rimbu/collection-types/collection';
import type { Op } from '@rimbu/collection-types/types';
import type {
	ArrayNonEmpty,
	IfAllExtend,
	IfAnyExtends,
	OptLazy,
	RelatedTo,
	SubOf,
} from '@rimbu/common';
import type { Stream, StreamSource } from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

export type KeyedCollection<
	K,
	V,
	F extends Collection.Advanced.FamilyBase<
		readonly [K, V]
	> = Collection.Advanced.Family<readonly [K, V]>,
> = KeyedCollection.Advanced.ExtendFamily<K, V, F>['_NORMAL'];

export declare namespace KeyedCollection {
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

		export type ElementStream<
			E,
			IsNonEmpty extends boolean = boolean,
		> = () => IsNonEmpty extends true ? Stream.NonEmpty<E> : Stream<E>;

		export interface Api<K, V, Tp extends Collection.Advanced.TypesBase>
			extends Collection.Advanced.Api<readonly [K, V], Tp> {
			streamKeys: ElementStream<K, Tp['_IS_NON_EMPTY']>;
			streamValues: ElementStream<V, Tp['_IS_NON_EMPTY']>;

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

		export interface ContextApi<
			F extends KeyedCollection.Advanced.Family<any, any>,
		> extends Collection.Advanced.ContextApi<F> {
			readonly keyedContext: F['_KEYED_CONTEXT'];
		}

		export interface KeyedContextApi<F extends Advanced.Family<any, any>> {
			readonly defaultContext: F['_CONTEXT'];

			empty<
				K extends F['_UPPER_K'],
				V extends F['_UPPER_V'],
			>(): Collection.Advanced.FamToTypes<F, readonly [K, V]>['_NORMAL'];
			of<K extends F['_UPPER_K'], V extends F['_UPPER_V']>(
				...elements: ArrayNonEmpty<readonly [K, V]>
			): Collection.Advanced.FamToTypes<F, readonly [K, V]>['_NON_EMPTY'];
			from<K extends F['_UPPER_K'], V extends F['_UPPER_V']>(
				...sources: ArrayNonEmpty<StreamSource.NonEmpty<readonly [K, V]>>
			): Collection.Advanced.FamToTypes<F, readonly [K, V]>['_NON_EMPTY'];
			from<K extends F['_UPPER_K'], V extends F['_UPPER_V']>(
				...sources: ArrayNonEmpty<StreamSource<readonly [K, V]>>
			): Collection.Advanced.FamToTypes<F, readonly [K, V]>['_NORMAL'];
			builder<
				K extends F['_UPPER_K'],
				V extends F['_UPPER_V'],
			>(): Collection.Advanced.FamToTypes<F, readonly [K, V]>['_BUILDER'];
		}

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
			_KEYED_CONTEXT: KeyedContextApi<this['_FAM']>;

			_UPPER_E: readonly [unknown, unknown];
			_NEW_E: readonly [unknown, unknown];

			_UPPER_K: this['_UPPER_E'][0];
			_UPPER_V: this['_UPPER_E'][1];

			_NEW_K: this['_NEW_E'][0];
			_NEW_V: this['_NEW_E'][1];

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}
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
				removeKeyAndReturn<UK, O>(
					key: RelatedTo<K, UK>,
					otherwise: OptLazy<O>,
				): Op.DynamicResult<Tp['_SELF'], O, V, Tp['_NORMAL']>;
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> extends Advanced.BuilderApi<K, V, Tp> {
				removeKey<UK = K>(key: RelatedTo<K, UK>): V | undefined;
				removeKey<UK, O>(key: RelatedTo<K, UK>, otherwise: O): V | O;
				removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): boolean;
				removeKeys<UK, R>(
					keys: StreamSource<RelatedTo<K, UK>>,
					collector: Reducer<[UK, V], R>,
				): R;
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
			_BUILDER: WithMapValues.BuilderApi<
				K,
				V,
				Collection.Advanced.Types<this['_FAM'], readonly [K, V]>
			>;

			_FAM: WithMapValues<K, V>;
			_NEW_FAMILY: WithMapValues<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithMapValues {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase>
				extends Advanced.Api<K, V, Tp> {
				mapValues<V2 extends V>(
					mapFun: (value: V, key: K) => V2,
				): Collection.Advanced.ReTyped<Tp, readonly [K, V2]>['_SELF'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> extends Advanced.BuilderApi<K, V, Tp> {
				buildMapValues<V2 extends V>(
					mapFun: (value: V, key: K) => V2,
				): Collection.Advanced.ReTyped<Tp, readonly [K, V2]>['_NORMAL'];
			}
		}

		export interface WithMerge<K, V> extends Advanced.Family<K, V> {
			_KEYED_CONTEXT: WithMerge.KeyedContextApi<this['_FAM']>;

			_FAM: WithMerge<K, V>;
			_NEW_FAMILY: WithMerge<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithMerge {
			export type StreamSourceArrayElement<
				S extends readonly StreamSource<any>[],
			> = S extends readonly StreamSource<infer E>[] ? E : never;
			export type StreamSourceElement<S extends StreamSource<any>> =
				S extends StreamSource<infer E> ? E : never;

			export interface KeyedContextApi<F extends Advanced.Family<any, any>>
				extends Advanced.KeyedContextApi<F> {
				mergeAllWith<
					const S extends readonly StreamSource<
						readonly [F['_UPPER_K'], any]
					>[],
					R,
					O = undefined,
				>(
					sources: S,
					options: {
						fillValue?: O;
						merge: (
							key: StreamSourceArrayElement<S>[0],
							values: {
								[KI in keyof S]:
									| (StreamSourceElement<S[KI]> & [unknown, unknown])[1]
									| O;
							},
						) => R;
					},
				): Collection.Advanced.ReTypeFam<
					F,
					readonly [StreamSourceArrayElement<S>[0], SubOf<R, F['_UPPER_V']>]
				>[IfAnyExtends<S, StreamSource.NonEmpty<any>, '_NON_EMPTY', '_NORMAL'>];

				mergeAll<
					const S extends readonly StreamSource<
						readonly [F['_UPPER_K'], any]
					>[],
					O = undefined,
				>(
					sources: S,
					options?:
						| {
								fillValue?: O;
						  }
						| undefined,
				): Collection.Advanced.ReTypeFam<
					F,
					readonly [
						StreamSourceArrayElement<S>[0],
						SubOf<
							{
								[KI in keyof S]:
									| (StreamSourceElement<S[KI]> & [unknown, unknown])[1]
									| O;
							},
							F['_UPPER_V']
						>,
					]
				>[IfAnyExtends<S, StreamSource.NonEmpty<any>, '_NON_EMPTY', '_NORMAL'>];

				mergeWith<
					const S extends StreamSource<readonly [F['_UPPER_K'], any]>[],
					R,
				>(
					sources: S,
					options: {
						merge: (
							key: StreamSourceArrayElement<S>[0],
							values: {
								[KI in keyof S]: (StreamSourceElement<S[KI]> &
									[unknown, unknown])[1];
							},
						) => R;
					},
				): Collection.Advanced.ReTypeFam<
					F,
					readonly [
						StreamSourceArrayElement<S>[0],
						SubOf<
							{
								[KI in keyof S]: (StreamSourceElement<S[KI]> &
									[unknown, unknown])[1];
							},
							F['_UPPER_V']
						>,
					]
				>[IfAllExtend<S, StreamSource.NonEmpty<any>, '_NON_EMPTY', '_NORMAL'>];

				merge<const S extends StreamSource<readonly [F['_UPPER_K'], any]>[]>(
					sources: S,
				): Collection.Advanced.ReTypeFam<
					F,
					readonly [
						StreamSourceArrayElement<S>[0],
						SubOf<
							{
								[KI in keyof S]: (StreamSourceElement<S[KI]> &
									[unknown, unknown])[1];
							},
							F['_UPPER_V']
						>,
					]
				>[IfAllExtend<S, StreamSource.NonEmpty<any>, '_NON_EMPTY', '_NORMAL'>];
			}
		}

		export interface WithReducer<K, V>
			extends Advanced.ExtendFamily<
				K,
				V,
				Collection.Capability.WithReducer<readonly [K, V]>
			> {
			_KEYED_CONTEXT: WithReducer.KeyedContextApi<this['_FAM']>;

			_FAM: WithReducer<K, V>;
			_NEW_FAMILY: WithReducer<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithReducer {
			export interface KeyedContextApi<
				F extends Advanced.ExtendFamily<
					any,
					any,
					Collection.Advanced.Family<any>
				>,
			> extends Advanced.KeyedContextApi<F> {
				reducer<K extends F['_UPPER_K'], V extends F['_UPPER_V']>(
					source?: StreamSource<readonly [K, V]> | undefined,
				): Reducer<
					readonly [K, V],
					Collection.Advanced.FamToTypes<F, readonly [K, V]>['_NORMAL']
				>;
			}
		}
	}
}
