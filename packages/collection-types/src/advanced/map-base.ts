import type {
	AbstractConstructor,
	CollectionNonEmpty,
} from '@rimbu/collection-types/advanced/collection-base';
import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op } from '@rimbu/collection-types/types';
import type { RelatedTo } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';
import type {
	KeyedApiMixin,
	KeyedApiMixinEmpty,
	KeyedApiMixinNonEmpty,
	KeyedCollectionEmpty,
} from './collection/keyed-base';

import {
	defaultFlatMapByAddAll,
	defaultFlatMapIndexed,
	defaultMapIndexed,
} from '@rimbu/collection-types/advanced/collection-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream } from '@rimbu/stream';

export namespace MapCollectionEmpty {
	export interface ApiBase<
		K,
		V,
		Tp extends Collection.Advanced.Types<
			KeyedCollection.Advanced.FamilyBase<K, V>,
			readonly [K, V]
		>,
	> extends MapCollection.Advanced.Api<K, V, Tp>,
			KeyedCollectionEmpty.Base<K, V, Tp>,
			MapCollection.Capability.WithModifyAtKey.Api<K, V, Tp>,
			MapCollection.Capability.WithSet.Api<K, V, Tp>,
			MapCollection.Capability.WithUpdateAtKey.Api<K, V, Tp> {}

	export interface Mixin extends KeyedApiMixinEmpty {
		_API: ApiBase<this['_K'], this['_V'], this['_TP']>;
	}

	export function WithMixin<C extends KeyedApiMixin>(
		Base: KeyedApiMixin.AbstractEmptyConstructor<C>,
	): KeyedApiMixin.AbstractEmptyConstructor<C & Mixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<KeyedCollectionEmpty.Base<K, V, Tp>>,
		K,
		V,
		FAM extends KeyedCollection.Advanced.Family<
			K,
			V
		> = KeyedCollection.Advanced.Family<K, V>,
		Tp extends Collection.Advanced.Types<
			FAM,
			readonly [K, V]
		> = Collection.Advanced.Types<FAM, readonly [K, V]>,
	>(Base: TBase): TBase & AbstractConstructor<ApiBase<K, V, Tp>> {
		abstract class Result extends Base {
			updateAtKey(): Tp['_NORMAL'] {
				return this;
			}

			updateAtKeyAndReturn(): Op.WithResult<
				Tp['_NORMAL'],
				[previous: undefined, current: undefined],
				false
			> {
				return {
					collection: this,
					hasResult: false,
					result: [undefined, undefined],
					hasChanged: false,
				};
			}

			modifyAtKey(
				atKey: K,
				options: {
					ifNew?:
						| { set: V; create?: never }
						| {
								set?: never;
								create: <SKIP extends symbol>(skip: SKIP) => V | typeof skip;
						  };
					ifExists?:
						| { set: V; update?: never }
						| {
								set?: never;
								update: <REMOVE extends symbol>(
									current: V,
									remove: REMOVE,
								) => V | REMOVE;
						  };
				},
			): Tp['_NORMAL'] {
				const { ifNew } = options;
				if (undefined === ifNew) return this;
				const { set, create } = ifNew;
				const token = Symbol();
				const newValue = undefined !== create ? create(token) : set;
				if (token === newValue) return this;
				return this.set(atKey, newValue);
			}

			set(atKey: K, value: V): Tp['_NON_EMPTY'] {
				return this.add([atKey, value]);
			}

			toBuilder(): Tp['_BUILDER'] {
				return this.context.builder();
			}
		}

		return Result;
	}
}

export namespace MapCollectionNonEmpty {
	/**
	 * The part of the map collection non-empty API that {@link WithMixin}
	 * implements itself.
	 *
	 * `MapCollection.Advanced.Api` is deliberately *not* inherited even though it
	 * is the natural supertype: it declares `mapValues` (and, through
	 * `KeyedCollection.Advanced.Api`, `get`), which this mixin requires rather
	 * than provides.
	 */
	export interface Implemented<
		K,
		V,
		Tp extends Collection.Advanced.TypesNonEmpty<
			KeyedCollection.Advanced.FamilyBase<K, V>,
			readonly [K, V]
		>,
	> extends MapCollection.Capability.WithSet.Api<K, V, Tp>,
			MapCollection.Capability.WithUpdateAtKey.Api<K, V, Tp>,
			KeyedCollection.Capability.WithRemoveKey.Api<K, V, Tp>,
			KeyedCollection.Capability.WithRemoveKeys.Api<K, V, Tp>,
			Collection.Capability.WithAddAll.Api<readonly [K, V], Tp>,
			Collection.Capability.WithFilter.Api<readonly [K, V], Tp>,
			KeyedCollection.Capability.WithMap.Api<K, V, Tp>,
			KeyedCollection.Capability.WithMapIndexed.Api<K, V, Tp>,
			KeyedCollection.Capability.WithFlatMap.Api<K, V, Tp>,
			KeyedCollection.Capability.WithFlatMapIndexed.Api<K, V, Tp> {}

	/**
	 * The members that {@link WithMixin} leaves abstract, and that an extending
	 * class must therefore implement.
	 *
	 * A requirement must be declared abstract *exactly once* across the exposed
	 * composition. TypeScript drops the obligation when the same member is
	 * declared abstract by two different constituents of an intersection, so this
	 * class states only the requirements this mixin *introduces*. `get` is owned
	 * by {@link KeyedCollectionNonEmpty.RequiredClass} and must not be repeated
	 * here.
	 *
	 * `mapValues` is required rather than implemented because concrete maps can
	 * map values in place without re-hashing.
	 */
	declare abstract class RequiredClass<
		K,
		V,
		Tp extends Collection.Advanced.TypesNonEmpty<
			KeyedCollection.Advanced.FamilyBase<K, V>,
			readonly [K, V]
		>,
	> implements
			Collection.Capability.WithAdd.Api<readonly [K, V], Tp>,
			MapCollection.Capability.WithModifyAtKey.Api<K, V, Tp>,
			KeyedCollection.Capability.WithMapValues.Api<K, V, Tp>
	{
		abstract add(element: readonly [K, V]): Tp['_NON_EMPTY'];
		abstract modifyAtKey(atKey: K, options: ModifyOptions<V>): Tp['_NORMAL'];
		abstract mapValues<V2 extends V>(
			mapFun: (value: V, key: K) => V2,
		): Collection.Advanced.ReTyped<Tp, readonly [K, V2]>['_SELF'];
	}

	export type Required<
		K,
		V,
		Tp extends Collection.Advanced.TypesNonEmpty<
			KeyedCollection.Advanced.FamilyBase<K, V>,
			readonly [K, V]
		>,
	> = RequiredClass<K, V, Tp>;

	export interface ApiBase<
		K,
		V,
		Tp extends Collection.Advanced.TypesNonEmpty<
			KeyedCollection.Advanced.FamilyBase<K, V>,
			readonly [K, V]
		>,
	> extends Implemented<K, V, Tp>,
			RequiredClass<K, V, Tp> {}

	export interface Mixin extends KeyedApiMixinNonEmpty {
		_API: ApiBase<this['_K'], this['_V'], this['_TP']>;
	}

	export function WithMixin<C extends KeyedApiMixin>(
		Base: KeyedApiMixin.AbstractNonEmptyConstructor<C>,
	): KeyedApiMixin.AbstractNonEmptyConstructor<C & Mixin>;
	export function WithMixin<
		TBase extends AbstractConstructor<
			CollectionNonEmpty.Base<readonly [K, V], Tp>
		>,
		K,
		V,
		FAM extends MapCollection.Advanced.Family<
			K,
			V
		> = MapCollection.Advanced.Family<K, V>,
		Tp extends Collection.Advanced.TypesNonEmpty<
			FAM,
			readonly [K, V]
		> = Collection.Advanced.TypesNonEmpty<FAM, readonly [K, V]>,
	>(Base: TBase): TBase & AbstractConstructor<ApiBase<K, V, Tp>> {
		// the members below are declared abstract here only so that this mixin can
		// use them; the type that extenders see is derived from RequiredClass,
		// which is what makes them a visible obligation
		abstract class Result extends Base {
			abstract add(element: readonly [K, V]): Tp['_NON_EMPTY'];
			abstract modifyAtKey(atKey: K, options: ModifyOptions<V>): Tp['_NORMAL'];
			abstract mapValues<V2 extends V>(
				mapFun: (value: V, key: K) => V2,
			): Collection.Advanced.ReTyped<Tp, readonly [K, V2]>['_SELF'];
			abstract toBuilder(): Tp['_BUILDER'];

			set(key: K, value: V): Tp['_NON_EMPTY'] {
				return this.add([key, value]);
			}

			addAll(entries: StreamSource<readonly [K, V]>): Tp['_NON_EMPTY'] {
				if (Stream.isEmptyStreamSourceInstance(entries)) return this as any;

				const builder = this.toBuilder();
				builder.addAll(entries);
				return builder.build().assumeNonEmpty();
			}

			removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): Tp['_NORMAL'] {
				if (Stream.isEmptyStreamSourceInstance(keys)) return this as any;

				const builder = this.toBuilder();
				builder.removeKeys(keys);
				return builder.build();
			}

			updateAtKey<UK>(
				key: RelatedTo<K, UK>,
				update: (value: V) => V,
			): Tp['_SELF'] {
				if (!this.context.isValidKey(key)) return this as any;
				return this.modifyAtKey(key as K, {
					ifExists: { update },
				}).assumeNonEmpty();
			}

			updateAtKeyAndReturn<UK>(
				key: RelatedTo<K, UK>,
				update: (value: V) => V,
			): Op.DynamicResult<
				Tp['_SELF'],
				[previous: undefined, current: undefined],
				[previous: V, current: V],
				Tp['_NON_EMPTY']
			> {
				const token = Symbol();
				let oldValue: V | typeof token = token;
				let newValue: V | undefined;

				const newMap = this.modifyAtKey(key as K, {
					ifExists: {
						update: (value: V, _remove) => {
							oldValue = value;
							newValue = update(value);
							return newValue;
						},
					},
				});

				if (token === oldValue) {
					return {
						collection: this as any,
						hasResult: false,
						result: [undefined, undefined],
						hasChanged: false,
					};
				}

				// modifyAtKey may have returned this if no change
				const hasChanged = newMap !== (this as any);
				return {
					collection: newMap as Tp['_NON_EMPTY'],
					hasResult: true,
					result: [oldValue as V, newValue as V],
					hasChanged,
				};
			}

			removeKey<UK>(key: RelatedTo<K, UK>): Tp['_NORMAL'] {
				if (!this.context.isValidKey(key)) return this as any;
				return this.modifyAtKey(key as K, {
					ifExists: { update: (_, remove) => remove },
				});
			}

			removeKeyAndReturn<UK>(
				key: RelatedTo<K, UK>,
			): Op.DynamicResult<Tp['_SELF'], undefined, V, Tp['_NORMAL']>;
			removeKeyAndReturn<UK, O>(
				key: RelatedTo<K, UK>,
				otherwise: OptLazy<O>,
			): Op.DynamicResult<Tp['_SELF'], O, V, Tp['_NORMAL']>;
			removeKeyAndReturn<UK, O>(
				key: RelatedTo<K, UK>,
				otherwise?: OptLazy<O>,
			): Op.DynamicResult<Tp['_SELF'], O | undefined, V, Tp['_NORMAL']> {
				if (!this.context.isValidKey(key)) {
					return {
						collection: this as any,
						hasResult: false,
						result: OptLazy(otherwise) as O,
						hasChanged: false,
					};
				}

				const token = Symbol();
				let currentValue: V | typeof token = token;

				const newMap = this.modifyAtKey(key as K, {
					ifExists: {
						update: (value, remove) => {
							currentValue = value;
							return remove;
						},
					},
				});

				if (token === currentValue) {
					return {
						collection: this as any,
						hasResult: false,
						result: OptLazy(otherwise) as O,
						hasChanged: false,
					};
				}

				return {
					collection: newMap as Tp['_NORMAL'],
					hasResult: true,
					result: currentValue as V,
					hasChanged: true,
				};
			}

			filter(
				pred: (entry: readonly [K, V]) => boolean,
				options: { negate?: boolean | undefined } = {},
			): Tp['_NORMAL'] {
				const builder = this.context.builder<readonly [K, V]>();

				builder.addAll(this.stream().filter(pred, options));

				if (builder.size === this.size) return this as any;

				return builder.build();
			}

			map<K2 extends Tp['_UPPER_K'], V2 extends Tp['_UPPER_V']>(
				f: (entry: readonly [K, V]) => readonly [K2, V2],
			): Collection.Advanced.ReTyped<Tp, readonly [K2, V2]>['_SELF'] {
				return this.context.from(this.stream().map(f)) as any;
			}

			mapIndexed<K2 extends Tp['_UPPER_K'], V2 extends Tp['_UPPER_V']>(
				f: (entry: readonly [K, V], index: number) => readonly [K2, V2],
				options?: { indexOffset?: number | undefined } | undefined,
			): Collection.Advanced.ReTyped<Tp, readonly [K2, V2]>['_SELF'] {
				return defaultMapIndexed<readonly [K, V], readonly [K2, V2], any, any>(
					this,
					f,
					options,
				) as any;
			}

			flatMap<E2 extends readonly [K, V]>(
				f: (entry: readonly [K, V]) => StreamSource<E2>,
			): Collection.Advanced.ReTyped<Tp, E2>['_SELF'] {
				return defaultFlatMapByAddAll<readonly [K, V], E2, any, any>(
					this,
					f,
				) as any;
			}

			flatMapIndexed<E2 extends readonly [K, V]>(
				f: (entry: readonly [K, V], index: number) => StreamSource<E2>,
				options?: { indexOffset?: number | undefined } | undefined,
			): Collection.Advanced.ReTyped<Tp, E2>['_SELF'] {
				return defaultFlatMapIndexed<readonly [K, V], E2, any, any>(
					this,
					f,
					options,
				) as any;
			}
		}

		return Result;
	}
}
