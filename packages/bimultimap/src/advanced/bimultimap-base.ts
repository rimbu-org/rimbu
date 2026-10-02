import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { RelatedTo } from '@rimbu/common';
import type { MultiMap } from '@rimbu/multimap';
import type { StreamSource } from '@rimbu/stream';

/**
 * The capability suite that a BiMultiMap contributes on top of the generic
 * {@link KeyedCollection} surface.
 *
 * A BiMultiMap is a keyed collection whose element is a `readonly [K, V]` entry,
 * held as two `MultiMap`s in lockstep — `keyValueMultiMap` (key → values) and
 * `valueKeyMultiMap` (value → keys) — which are exact inverses of one another:
 *
 * ```text
 * for all k, v:  v ∈ keyValueMultiMap[k]  ⟺  k ∈ valueKeyMultiMap[v]
 * ```
 *
 * Both directions are *set*-valued, so the shared keyed capabilities that hand
 * back or accept a single `V` (`WithGet`, `WithSet`, `WithUpdateAtKey`,
 * `WithModifyAtKey`) would lie about the shape of what is stored. Those
 * operations are re-declared here against a value set, in both directions.
 *
 * The one exception is `KeyedCollection.Capability.WithRemoveKey`, which *is*
 * adopted wholesale: its stored-type position reads the `_REMOVED_AT_KEY` family
 * slot, and a BiMultiMap pins that slot to `SetCollection<V>` where an empty set
 * plays the role `undefined` plays for a map ("this key was not present").
 *
 * `ValuedCollection` capabilities are deliberately **not** used — their
 * `StreamSource<E>` operands and `has(element: E)` do not describe any BiMultiMap
 * operation.
 *
 * As with the capabilities in `@rimbu/collection-types`, each member below is a
 * named `Api`/`BuilderApi` interface. The element type is re-typed by the
 * adopted keyed capabilities rather than by these, so — exactly as for
 * `MultiMapCollection` and `BiMapCollection` — no `_NORMAL`/`_NON_EMPTY`/`_FAM`
 * slot-pinning family is declared here. Slot-pinning is consolidated into
 * `BiMultiMap.Advanced.Family`.
 */
export declare namespace BiMultiMapCollection {
	export namespace Advanced {
		/**
		 * The type of the value set stored at a key. A key is only ever present
		 * when it has at least one value, so the stored set is always non-empty;
		 * `getValues` widens to `SetCollection<V>` because an absent key yields
		 * the empty set.
		 */
		export type KeyValuesType<V> = SetCollection<V>;

		/**
		 * The options accepted by `modifyValuesAt` and `modifyKeysAt`.
		 *
		 * Deliberately **not** the shared `ModifyOptions<T>` from
		 * `@rimbu/collection-types`: that shape carries a single value plus
		 * `skip`/`remove` sentinels, whereas these operations replace a whole
		 * *set*. Returning an empty `StreamSource` from `create`/`update`
		 * **removes the key** (respectively the value) — an empty result is how a
		 * caller says "leave nothing here", which the sentinels of the shared
		 * shape would only duplicate.
		 */
		export interface ModifySetOptions<T, TS = SetCollection.NonEmpty<T>> {
			ifNew?:
				| { set: StreamSource<T>; create?: never }
				| { set?: never; create: () => StreamSource<T> };
			ifExists?:
				| { set: StreamSource<T>; update?: never }
				| { set?: never; update: (current: TS) => StreamSource<T> };
		}

		export interface Api<
			K,
			V,
			Tp extends Collection.Advanced.Types<FamilyBase<K, V>, readonly [K, V]>,
		> extends Collection.Advanced.Api<readonly [K, V], Tp>,
				// keyed capabilities that describe the entry shape correctly
				KeyedCollection.Capability.WithStreamKeys.Api<K, V, Tp>,
				KeyedCollection.Capability.WithStreamValues.Api<K, V, Tp>,
				KeyedCollection.Capability.WithHas.Api<K, V, Tp>,
				KeyedCollection.Capability.WithRemoveKey.Api<K, V, Tp>,
				KeyedCollection.Capability.WithRemoveKeys.Api<K, V, Tp>,
				KeyedCollection.Capability.WithMapValues.Api<K, V, Tp>,
				KeyedCollection.Capability.WithRecompose.Api<K, V, Tp>,
				// keyed capabilities gained from adopting this style
				KeyedCollection.Capability.WithMap.Api<K, V, Tp>,
				KeyedCollection.Capability.WithMapIndexed.Api<K, V, Tp>,
				KeyedCollection.Capability.WithFlatMap.Api<K, V, Tp>,
				KeyedCollection.Capability.WithFlatMapIndexed.Api<K, V, Tp>,
				Collection.Capability.WithMutate.Api<readonly [K, V], Tp>,
				Collection.Capability.WithAddEach.Api<readonly [K, V], Tp>,
				Collection.Capability.WithToBuilder.Api<readonly [K, V], Tp>,
				// key direction
				BiMultiMapCollection.Capability.WithAddTo.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithGetValues.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithHasEntry.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithKeySize.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithKeyValueMaps.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithSetEachValue.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithRemoveEntry.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithRemoveEntries.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithModifyValuesAt.Api<K, V, Tp>,
				// value direction
				BiMultiMapCollection.Capability.WithGetKeys.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithHasValue.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithSetEachKey.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithRemoveValue.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithRemoveValues.Api<K, V, Tp>,
				BiMultiMapCollection.Capability.WithModifyKeysAt.Api<K, V, Tp>,
				// shared
				BiMultiMapCollection.Capability.WithInvert.Api<K, V, Tp> {
			/**
			 * A debug rendering of the form `BiMultiMap(1 -> [a, c], 2 -> [b])`.
			 *
			 * Not a capability: it needs no builder counterpart and no kind
			 * refinement, so it is declared here next to the other directly
			 * declared members.
			 */
			toString(): string;
		}

		/**
		 * The BiMultiMap builder API, aggregating the generic builder surface with
		 * the bidirectional, set-aware mutations.
		 *
		 * Note `KeyedCollection.Capability.WithMapValues.BuilderApi` is deliberately
		 * **not** adopted, though its `Api` counterpart is: that capability's
		 * `buildMapValues` returns a `MapCollection<K, V2>`, and a BiMultiMap
		 * context carries two `MultiMap` contexts rather than a `MapCollection`
		 * context, so there is nothing to build the map with. Adopting it would
		 * require new context surface. The immutable `mapValues` has no such
		 * problem — it rebuilds a BiMultiMap — so `WithMapValues.Api` is kept.
		 */
		export interface BuilderApi<
			K,
			V,
			Tp extends Collection.Advanced.Types<FamilyBase<K, V>, readonly [K, V]>,
		> extends Collection.Advanced.BuilderApi<readonly [K, V], Tp>,
				KeyedCollection.Capability.WithHas.BuilderApi<K, V, Tp>,
				KeyedCollection.Capability.WithRemoveKey.BuilderApi<K, V, Tp>,
				KeyedCollection.Capability.WithRemoveKeys.BuilderApi<K, V, Tp>,
				Collection.Capability.WithAddEach.BuilderApi<readonly [K, V], Tp>,
				BiMultiMapCollection.Capability.WithAddTo.BuilderApi<K, V, Tp>,
				BiMultiMapCollection.Capability.WithGetValues.BuilderApi<K, V, Tp>,
				BiMultiMapCollection.Capability.WithGetKeys.BuilderApi<K, V, Tp>,
				BiMultiMapCollection.Capability.WithHasEntry.BuilderApi<K, V, Tp>,
				BiMultiMapCollection.Capability.WithHasValue.BuilderApi<K, V, Tp>,
				BiMultiMapCollection.Capability.WithSetEachValue.BuilderApi<K, V, Tp>,
				BiMultiMapCollection.Capability.WithSetEachKey.BuilderApi<K, V, Tp>,
				BiMultiMapCollection.Capability.WithRemoveEntry.BuilderApi<K, V, Tp>,
				BiMultiMapCollection.Capability.WithRemoveEntries.BuilderApi<K, V, Tp>,
				BiMultiMapCollection.Capability.WithRemoveValue.BuilderApi<K, V, Tp>,
				BiMultiMapCollection.Capability.WithRemoveValues.BuilderApi<K, V, Tp>,
				BiMultiMapCollection.Capability.WithInvert.BuilderApi<K, V, Tp> {}

		export interface ContextApi<
			UK,
			UV,
			FAM extends BiMultiMapCollection.Advanced.FamilyBase<UK, UV>,
		> extends Collection.Advanced.ContextApi<FAM>,
				KeyedCollection.Advanced.ContextApi<FAM>,
				KeyedCollection.Capability.WithReducer.KeyedContextApi<FAM> {
			readonly typeTag: 'BiMultiMap';
			readonly keyValueMultiMapContext: MultiMap.Context<UK, UV>;
			readonly valueKeyMultiMapContext: MultiMap.Context<UV, UK>;
		}

		/**
		 * The slot skeleton a BiMultiMap family is built from.
		 *
		 * Deliberately adds **no** members of its own — in particular it does not
		 * redeclare `_FAM`/`_NEW_FAMILY`, because doing so would make it disagree
		 * with the capability families it has to sit beside in one `extends`
		 * clause (TS2320). Only {@link Family}, the default concrete family, and
		 * `BiMultiMap.Advanced.Family` in `public/` narrow those to themselves.
		 */
		export interface FamilyBase<K, V>
			extends KeyedCollection.Advanced.FamilyBase<K, V> {}

		/**
		 * The default BiMultiMap family, and the single place every slot is pinned.
		 *
		 * Only the **non-invariant** capabilities appear in this `extends` clause.
		 * That is a constraint of the capability system, not a stylistic choice: a
		 * capability that makes its collection invariant in the element type
		 * declares `_INVARIANT: (e: readonly [K, V]) => readonly [K, V]`, while a
		 * covariant one does not declare it at all (it inherits `(e: any) => any`).
		 * Two bases in one `extends` clause must agree on every shared property
		 * *identically*, so mixing the two kinds is a `TS2320`. The invariant
		 * capabilities — `KeyedCollection`'s `WithMap`, `WithMapIndexed`,
		 * `WithFlatMap`, `WithFlatMapIndexed` and the element-level
		 * `WithAddEach`/`WithToBuilder`/`WithMutate` — are therefore claimed
		 * through the `Api`/`BuilderApi` aggregates above, which is where the
		 * method surface they contribute is actually typed. See
		 * `bimultimap/AGENTS.md`.
		 *
		 * `_UPPER_K`/`_UPPER_V` are pinned to `K`/`V` (not widened to `any`) on
		 * purpose, for the same reason `MultiMapCollection.Advanced.Family` does
		 * it: methods that build new values in the *same* context — `mapValues`,
		 * `setEachValue` — must constrain their result to a subtype of `V`.
		 */
		export interface Family<K, V>
			extends FamilyBase<K, V>,
				KeyedCollection.Capability.WithStreamKeys<K, V>,
				KeyedCollection.Capability.WithStreamValues<K, V>,
				KeyedCollection.Capability.WithHas<K, V>,
				KeyedCollection.Capability.WithRemoveKey<K, V>,
				KeyedCollection.Capability.WithRemoveKeys<K, V>,
				KeyedCollection.Capability.WithRecompose<K, V> {
			_NORMAL: Api<K, V, this['_TYPES']>;
			_NON_EMPTY: Api<K, V, this['_TYPES_NON_EMPTY']>;
			_BUILDER: BuilderApi<K, V, this['_TYPES']>;
			_CONTEXT: ContextApi<K, V, this['_FAM']>;
			_KEYED_CONTEXT: ContextApi<K, V, this['_FAM']>;

			_UPPER_E: readonly [K, V];
			_NEW_E: readonly [unknown, unknown];

			/**
			 * A BiMultiMap is invariant in `readonly [K, V]`: `addTo`, `mapValues`
			 * and friends all take a `(value: V, key: K) => …` callback, which is
			 * contravariant in `V`.
			 */
			_INVARIANT: (e: readonly [K, V]) => readonly [K, V];

			/**
			 * A BiMultiMap hands back the whole value set when a key is removed, and
			 * uses the empty set in place of `undefined`: `removeKeyAndReturn`
			 * yields a `SetCollection<V>`, and `Builder.removeKey` yields one too,
			 * where an empty set means "this key was not present".
			 *
			 * This is the single override that lets a BiMultiMap adopt
			 * `KeyedCollection.Capability.WithRemoveKey` wholesale instead of
			 * shadowing it. The value direction has no shared capability to adopt,
			 * so `WithRemoveValue` states `SetCollection<K>` directly.
			 */
			_REMOVED_AT_KEY: SetCollection<V>;
			_FOUND_AT_KEY: SetCollection<V>;

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}
	}

	export namespace Capability {
		export namespace WithAddTo {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				addTo(key: K, value: V): Tp['_NON_EMPTY'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				addTo(key: K, value: V): boolean;
			}
		}

		export namespace WithGetValues {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				getValues<UK = K>(key: RelatedTo<K, UK>): Advanced.KeyValuesType<V>;
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				getValues<UK = K>(key: RelatedTo<K, UK>): Advanced.KeyValuesType<V>;
			}
		}

		export namespace WithGetKeys {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				getKeys<UV = V>(value: RelatedTo<V, UV>): SetCollection<K>;
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				getKeys<UV = V>(value: RelatedTo<V, UV>): SetCollection<K>;
			}
		}

		export namespace WithHasEntry {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				hasEntry<UK = K, UV = V>(
					key: RelatedTo<K, UK>,
					value: RelatedTo<V, UV>,
				): boolean;
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				hasEntry<UK = K, UV = V>(
					key: RelatedTo<K, UK>,
					value: RelatedTo<V, UV>,
				): boolean;
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

		export namespace WithKeySize {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				readonly keySize: number;
			}
		}

		export namespace WithKeyValueMaps {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				/**
				 * The backing forward map, `K` → set of values.
				 */
				readonly keyValueMultiMap: MultiMap<K, V>;

				/**
				 * The backing reverse map, `V` → set of keys. At runtime this is an
				 * exact inverse of {@link keyValueMultiMap}.
				 */
				readonly valueKeyMultiMap: MultiMap<V, K>;
			}
		}

		export namespace WithSetEachValue {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				setEachValue(
					key: K,
					values: StreamSource.NonEmpty<V>,
				): Tp['_NON_EMPTY'];
				setEachValue(key: K, values: StreamSource<V>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				setEachValue(key: K, values: StreamSource<V>): boolean;
			}
		}

		export namespace WithSetEachKey {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				setEachKey(value: V, keys: StreamSource.NonEmpty<K>): Tp['_NON_EMPTY'];
				setEachKey(value: V, keys: StreamSource<K>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				setEachKey(value: V, keys: StreamSource<K>): boolean;
			}
		}

		export namespace WithRemoveEntry {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				removeEntry<UK = K, UV = V>(
					key: RelatedTo<K, UK>,
					value: RelatedTo<V, UV>,
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				removeEntry<UK = K, UV = V>(
					key: RelatedTo<K, UK>,
					value: RelatedTo<V, UV>,
				): boolean;
			}
		}

		export namespace WithRemoveEntries {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				removeEntries<UK = K, UV = V>(
					entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>,
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				removeEntries<UK = K, UV = V>(
					entries: StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>,
				): boolean;
			}
		}

		export namespace WithRemoveValue {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				/**
				 * Removes `value` from every key that holds it. Returns the normal
				 * type: the collection may become empty.
				 */
				removeValue<UV = V>(value: RelatedTo<V, UV>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				/**
				 * Returns the set of keys that referenced `value`; an **empty** set
				 * means the value was not present. This is the value-direction
				 * counterpart of `Builder.removeKey`, which returns
				 * `SetCollection<V>` by way of the `_REMOVED_AT_KEY` slot.
				 */
				removeValue<UV = V>(value: RelatedTo<V, UV>): SetCollection<K>;
			}
		}

		export namespace WithRemoveValues {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				removeValues<UV = V>(
					values: StreamSource<RelatedTo<V, UV>>,
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				removeValues<UV = V>(values: StreamSource<RelatedTo<V, UV>>): boolean;
			}
		}

		export namespace WithModifyValuesAt {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				modifyValuesAt(
					atKey: K,
					options: Advanced.ModifySetOptions<V, SetCollection.NonEmpty<V>>,
				): Tp['_NORMAL'];
			}
		}

		export namespace WithModifyKeysAt {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				modifyKeysAt(
					atValue: V,
					options: Advanced.ModifySetOptions<K, SetCollection.NonEmpty<K>>,
				): Tp['_NORMAL'];
			}
		}

		export namespace WithInvert {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				/**
				 * Swaps the two directions, yielding a `BiMultiMap<V, K>`.
				 *
				 * Free at runtime: the data is already stored in both directions, so
				 * this is a swap of the two backing maps plus a retype, with no
				 * traversal and no rebuild.
				 */
				invert(): Collection.Advanced.ReTyped<Tp, readonly [V, K]>['_SELF'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				invert(): Collection.Advanced.ReTyped<Tp, readonly [V, K]>['_BUILDER'];
			}
		}
	}
}
