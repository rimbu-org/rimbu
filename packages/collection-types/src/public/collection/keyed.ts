import type { Collection } from '@rimbu/collection-types/collection';
import type { Op } from '@rimbu/collection-types/types';
import type {
	ArrayNonEmpty,
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

		export interface ContextApi<F extends Family<any, any>>
			extends Collection.Advanced.ContextApi<F> {
			readonly keyedContext: F['_KEYED_CONTEXT'];
		}

		export interface KeyedContextApi<F extends Advanced.Family<any, any>> {
			readonly collectionContext: F['_CONTEXT'];

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

		export interface FamilyBase<K, V>
			extends Collection.Advanced.FamilyBase<readonly [K, V]> {
			_UPPER_E: readonly [unknown, unknown];
			_NEW_E: readonly [unknown, unknown];

			_UPPER_K: this['_UPPER_E'][0];
			_UPPER_V: this['_UPPER_E'][1];

			_NEW_K: this['_NEW_E'][0];
			_NEW_V: this['_NEW_E'][1];

			_FAM: FamilyBase<K, V>;
			_NEW_FAMILY: FamilyBase<this['_NEW_K'], this['_NEW_V']>;
		}

		export interface Family<K, V>
			extends FamilyBase<K, V>,
				Collection.Advanced.Family<readonly [K, V]> {
			_NORMAL: Api<K, V, this['_TYPES']>;
			_NON_EMPTY: Api<K, V, this['_TYPES_NON_EMPTY']>;
			_BUILDER: BuilderApi<K, V, this['_TYPES']>;
			_CONTEXT: ContextApi<this['_FAM']>;
			_KEYED_CONTEXT: KeyedContextApi<this['_FAM']>;

			_UPPER_E: readonly [unknown, unknown];
			_NEW_E: readonly [unknown, unknown];

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}
	}

	export namespace Capability {
		export interface WithRemoveKey<K, V> extends Advanced.FamilyBase<K, V> {
			_NORMAL: WithRemoveKey.Api<K, V, this['_TYPES']>;
			_NON_EMPTY: WithRemoveKey.Api<K, V, this['_TYPES_NON_EMPTY']>;
			_BUILDER: WithRemoveKey.BuilderApi<K, V, this['_TYPES']>;

			_FAM: WithRemoveKey<K, V>;
			_NEW_FAMILY: WithRemoveKey<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithRemoveKey {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				removeKey<UK = K>(key: RelatedTo<K, UK>): Tp['_NORMAL'];

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
			> {
				removeKey<UK = K>(key: RelatedTo<K, UK>): V | undefined;
				removeKey<UK, O>(key: RelatedTo<K, UK>, otherwise: O): V | O;
			}
		}

		export interface WithRemoveKeys<K, V> extends Advanced.FamilyBase<K, V> {
			_NORMAL: WithRemoveKeys.Api<K, V, this['_TYPES']>;
			_NON_EMPTY: WithRemoveKeys.Api<K, V, this['_TYPES_NON_EMPTY']>;
			_BUILDER: WithRemoveKeys.BuilderApi<K, V, this['_TYPES']>;

			_FAM: WithRemoveKeys<K, V>;
			_NEW_FAMILY: WithRemoveKeys<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithRemoveKeys {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				removeKeys<UK = K>(keys: StreamSource<RelatedTo<K, UK>>): boolean;
				removeKeys<UK, R>(
					keys: StreamSource<RelatedTo<K, UK>>,
					collector: Reducer<[UK, V], R>,
				): R;
			}
		}

		export interface WithMapValues<K, V> extends Advanced.FamilyBase<K, V> {
			_NORMAL: WithMapValues.Api<K, V, this['_TYPES']>;
			_NON_EMPTY: WithMapValues.Api<K, V, this['_TYPES_NON_EMPTY']>;
			_BUILDER: WithMapValues.BuilderApi<K, V, this['_TYPES']>;

			_FAM: WithMapValues<K, V>;
			_NEW_FAMILY: WithMapValues<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithMapValues {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				mapValues<V2 extends V>(
					mapFun: (value: V, key: K) => V2,
				): Collection.Advanced.ReTyped<Tp, readonly [K, V2]>['_SELF'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				buildMapValues<V2 extends V>(
					mapFun: (value: V, key: K) => V2,
				): Collection.Advanced.ReTyped<Tp, readonly [K, V2]>['_NORMAL'];
			}
		}

		export interface WithMerge<K, V> extends Advanced.FamilyBase<K, V> {
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

			export interface KeyedContextApi<
				F extends Advanced.FamilyBase<any, any>,
			> {
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
				>['_NORMAL'];

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
				>['_NORMAL'];
			}
		}

		export interface WithReducer<K, V> extends Advanced.FamilyBase<K, V> {
			_KEYED_CONTEXT: WithReducer.KeyedContextApi<this['_FAM']>;

			_FAM: WithReducer<K, V>;
			_NEW_FAMILY: WithReducer<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithReducer {
			export interface KeyedContextApi<
				F extends Advanced.FamilyBase<any, any>,
			> {
				reducer<K extends F['_UPPER_K'], V extends F['_UPPER_V']>(
					source?: StreamSource<readonly [K, V]> | undefined,
				): Reducer<
					readonly [K, V],
					Collection.Advanced.FamToTypes<F, readonly [K, V]>['_NORMAL']
				>;
			}
		}

		export interface WithRecompose<K, V> extends Advanced.FamilyBase<K, V> {
			_NORMAL: WithRecompose.Api<K, V, this['_TYPES']>;
			_NON_EMPTY: WithRecompose.Api<K, V, this['_TYPES_NON_EMPTY']>;

			_FAM: WithRecompose<K, V>;
			_NEW_FAMILY: WithRecompose<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithRecompose {
			export interface Api<
				K,
				V,
				Tp extends Collection.Advanced.Types<
					Advanced.FamilyBase<K, V>,
					readonly [K, V]
				>,
			> {
				recompose<K2 extends Tp['_UPPER_K'], V2 extends Tp['_UPPER_V']>(
					f: (
						stream: Tp['_AS_STREAM'],
					) => StreamSource.NonEmpty<readonly [K2, V2]>,
				): Collection.Advanced.ReTyped<Tp, readonly [K2, V2]>['_SELF'];
				recompose<K2 extends Tp['_UPPER_K'], V2 extends Tp['_UPPER_V']>(
					f: (stream: Tp['_AS_STREAM']) => StreamSource<readonly [K2, V2]>,
				): Collection.Advanced.ReTyped<Tp, readonly [K2, V2]>['_NORMAL'];
			}
		}

		export interface WithMap<K, V> extends Advanced.FamilyBase<K, V> {
			_NORMAL: WithMap.Api<K, V, this['_TYPES']>;
			_NON_EMPTY: WithMap.Api<K, V, this['_TYPES_NON_EMPTY']>;

			_INVARIANT: (e: readonly [K, V]) => readonly [K, V];

			_FAM: WithMap<K, V>;
			_NEW_FAMILY: WithMap<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithMap {
			export interface Api<
				K,
				V,
				Tp extends Collection.Advanced.Types<
					Advanced.FamilyBase<K, V>,
					readonly [K, V]
				>,
			> {
				map<K2 extends Tp['_UPPER_K'], V2 extends Tp['_UPPER_V']>(
					f: (element: readonly [K, V]) => readonly [K2, V2],
				): Collection.Advanced.ReTyped<Tp, readonly [K2, V2]>['_SELF'];
			}
		}

		export interface WithMapIndexed<K, V> extends Advanced.FamilyBase<K, V> {
			_NORMAL: WithMapIndexed.Api<K, V, this['_TYPES']>;
			_NON_EMPTY: WithMapIndexed.Api<K, V, this['_TYPES_NON_EMPTY']>;

			_INVARIANT: (e: readonly [K, V]) => readonly [K, V];

			_FAM: WithMapIndexed<K, V>;
			_NEW_FAMILY: WithMapIndexed<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithMapIndexed {
			export interface Api<
				K,
				V,
				Tp extends Collection.Advanced.Types<
					Advanced.FamilyBase<K, V>,
					readonly [K, V]
				>,
			> {
				mapIndexed<K2 extends Tp['_UPPER_K'], V2 extends Tp['_UPPER_V']>(
					f: (element: readonly [K, V], index: number) => readonly [K2, V2],
				): Collection.Advanced.ReTyped<Tp, readonly [K2, V2]>['_SELF'];
			}
		}

		export interface WithFlatMap<K, V> extends Advanced.FamilyBase<K, V> {
			_NORMAL: WithFlatMap.Api<K, V, this['_TYPES']>;
			_NON_EMPTY: WithFlatMap.Api<K, V, this['_TYPES_NON_EMPTY']>;

			_INVARIANT: (e: readonly [K, V]) => readonly [K, V];

			_FAM: WithFlatMap<K, V>;
			_NEW_FAMILY: WithFlatMap<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithFlatMap {
			export interface Api<
				K,
				V,
				Tp extends Collection.Advanced.Types<
					Advanced.FamilyBase<K, V>,
					readonly [K, V]
				>,
			> {
				flatMap<K2 extends Tp['_UPPER_K'], V2 extends Tp['_UPPER_V']>(
					f: (
						entry: readonly [K, V],
					) => StreamSource.NonEmpty<readonly [K2, V]>,
				): Collection.Advanced.ReTyped<Tp, readonly [K, V]>['_SELF'];
				flatMap<K2 extends Tp['_UPPER_K'], V2 extends Tp['_UPPER_V']>(
					f: (entry: readonly [K, V]) => StreamSource<readonly [K, V]>,
				): Collection.Advanced.ReTyped<Tp, readonly [K, V]>['_NORMAL'];
			}
		}

		export interface WithFlatMapIndexed<K, V>
			extends Advanced.FamilyBase<K, V> {
			_NORMAL: WithFlatMapIndexed.Api<K, V, this['_TYPES']>;
			_NON_EMPTY: WithFlatMapIndexed.Api<K, V, this['_TYPES_NON_EMPTY']>;

			_INVARIANT: (e: readonly [K, V]) => readonly [K, V];

			_FAM: WithFlatMapIndexed<K, V>;
			_NEW_FAMILY: WithFlatMapIndexed<this['_NEW_K'], this['_NEW_V']>;
		}

		export namespace WithFlatMapIndexed {
			export interface Api<
				K,
				V,
				Tp extends Collection.Advanced.Types<
					Advanced.FamilyBase<K, V>,
					readonly [K, V]
				>,
			> {
				flatMapIndexed<K2 extends Tp['_UPPER_K'], V2 extends Tp['_UPPER_V']>(
					f: (
						entry: readonly [K, V],
						index: number,
					) => StreamSource.NonEmpty<readonly [K, V]>,
					options: { indexOffset?: number | undefined } | undefined,
				): Collection.Advanced.ReTyped<Tp, readonly [K, V]>['_SELF'];
				flatMapIndexed<K2 extends Tp['_UPPER_K'], V2 extends Tp['_UPPER_V']>(
					f: (
						entry: readonly [K, V],
						index: number,
					) => StreamSource<readonly [K, V]>,
					options: { indexOffset?: number | undefined } | undefined,
				): Collection.Advanced.ReTyped<Tp, readonly [K, V]>['_NORMAL'];
			}
		}
	}
}
