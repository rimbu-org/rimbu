import type { ModifyOptions } from '@rimbu/collection-types/advanced/common';
import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op } from '@rimbu/collection-types/types';
import type { OptLazy, RelatedTo } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

export namespace BiMapCollection {
	export namespace Capability {
		export namespace WithGetKey {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				getKey<UV = V>(value: RelatedTo<V, UV>): K | undefined;
				getKey<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				getKey<UV = V>(value: RelatedTo<V, UV>): K | undefined;
				getKey<UV, O>(value: RelatedTo<V, UV>, otherwise: OptLazy<O>): K | O;
			}
		}

		export namespace WithHasValue {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				hasValue<UV = V>(value: RelatedTo<V, UV>): boolean;
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				hasValue<UV = V>(value: RelatedTo<V, UV>): boolean;
			}
		}

		export namespace WithRemoveValue {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				removeValue<UV = V>(value: RelatedTo<V, UV>): Tp['_NORMAL'];
				removeValues<UV = V>(
					values: StreamSource<RelatedTo<V, UV>>,
				): Tp['_NORMAL'];
				removeValueAndReturn<UV = V>(
					value: RelatedTo<V, UV>,
				): Op.DynamicResult<Tp['_SELF'], undefined, K, Tp['_NORMAL']>;
				removeValueAndReturn<UV, O>(
					value: RelatedTo<V, UV>,
					otherwise: OptLazy<O>,
				): Op.DynamicResult<Tp['_SELF'], O, K, Tp['_NORMAL']>;
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				removeValue<UV = V>(value: RelatedTo<V, UV>): K | undefined;
				removeValue<UV, O>(
					value: RelatedTo<V, UV>,
					otherwise: OptLazy<O>,
				): K | O;
				removeValues<UV = V>(values: StreamSource<RelatedTo<V, UV>>): boolean;
			}
		}

		export namespace WithRemoveEntries {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				removeEntry(entry: readonly [K, V]): Tp['_NORMAL'];
				removeEntries(entries: StreamSource<readonly [K, V]>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				removeEntry(entry: readonly [K, V]): boolean;
				removeEntries(entries: StreamSource<readonly [K, V]>): boolean;
			}
		}

		export namespace WithUpdateAtValue {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				updateAtValue<UV = V>(
					keyUpdate: (key: K) => K,
					value: RelatedTo<V, UV>,
				): Tp['_SELF'];
				updateAtValueAndReturn<UV = V>(
					keyUpdate: (key: K) => K,
					value: RelatedTo<V, UV>,
				): Op.DynamicResult<
					Tp['_SELF'],
					[previous: undefined, current: undefined],
					[previous: K, current: K],
					Tp['_NON_EMPTY']
				>;
			}
		}

		export namespace WithModifyAtValue {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				modifyAtValue(atValue: V, options: ModifyOptions<K>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				modifyAtValue(atValue: V, options: ModifyOptions<K>): boolean;
			}
		}

		export namespace WithInvert {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				invert(): Collection.Advanced.FamToTypes<
					Tp['_FAM'],
					readonly [V, K]
				>['_NORMAL'];
			}
		}

		export namespace WithKeyValueMap {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				readonly keyValueMap: MapCollection<K, V>;
			}
		}

		export namespace WithValueKeyMap {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				readonly valueKeyMap: MapCollection<V, K>;
			}
		}

		export namespace WithAndReturn {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				setAndReturn(
					key: K,
					value: V,
				): Op.DynamicResult<
					Tp['_NON_EMPTY'],
					undefined,
					readonly [K, V],
					Tp['_NON_EMPTY']
				>;
				addAndReturn(
					entry: readonly [K, V],
				): Op.DynamicResult<
					Tp['_NON_EMPTY'],
					undefined,
					readonly [K, V],
					Tp['_NON_EMPTY']
				>;
			}
		}
	}
}

export interface BiMapBase<
	K,
	V,
	Tp extends Collection.Advanced.Types<
		KeyedCollection.Advanced.FamilyBase<K, V>,
		readonly [K, V]
	>,
> extends MapCollection.Advanced.Api<K, V, Tp>,
		BiMapCollection.Capability.WithGetKey.Api<K, V, Tp>,
		BiMapCollection.Capability.WithHasValue.Api<K, V, Tp>,
		BiMapCollection.Capability.WithRemoveValue.Api<K, V, Tp>,
		BiMapCollection.Capability.WithRemoveEntries.Api<K, V, Tp>,
		BiMapCollection.Capability.WithUpdateAtValue.Api<K, V, Tp>,
		BiMapCollection.Capability.WithModifyAtValue.Api<K, V, Tp>,
		BiMapCollection.Capability.WithInvert.Api<K, V, Tp>,
		BiMapCollection.Capability.WithKeyValueMap.Api<K, V, Tp>,
		BiMapCollection.Capability.WithValueKeyMap.Api<K, V, Tp>,
		BiMapCollection.Capability.WithAndReturn.Api<K, V, Tp> {}

export interface BiMapBuilderBase<
	K,
	V,
	Tp extends Collection.Advanced.Types<
		KeyedCollection.Advanced.FamilyBase<K, V>,
		readonly [K, V]
	>,
> extends MapCollection.Advanced.BuilderApi<K, V, Tp>,
		BiMapCollection.Capability.WithGetKey.BuilderApi<K, V, Tp>,
		BiMapCollection.Capability.WithHasValue.BuilderApi<K, V, Tp>,
		BiMapCollection.Capability.WithRemoveValue.BuilderApi<K, V, Tp>,
		BiMapCollection.Capability.WithRemoveEntries.BuilderApi<K, V, Tp>,
		BiMapCollection.Capability.WithModifyAtValue.BuilderApi<K, V, Tp> {}
