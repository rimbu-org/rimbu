import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { RelatedTo } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

/**
 * The capability suite that a MultiMap contributes on top of the generic
 * {@link KeyedCollection} surface.
 *
 * A MultiMap is a keyed collection whose element is a `readonly [K, V]` entry,
 * **not** a `MapCollection`: its value slot is a *set* of values, so the shared
 * keyed capabilities that hand back or accept a single `V` (`WithGet`,
 * `WithSet`, `WithUpdateAtKey`, `WithModifyAtKey`) would lie about the shape of
 * what is stored. Those operations are re-declared here against a value set.
 *
 * The one exception is `KeyedCollection.Capability.WithRemoveKey`, which *is*
 * adopted wholesale: its stored-type position reads the `_REMOVED_AT_KEY` family
 * slot, and a MultiMap pins that slot to `SetCollection<V>` where an empty set
 * plays the role `undefined` plays for a map ("this key was not present").
 *
 * `ValuedCollection` capabilities are deliberately **not** used — their
 * `StreamSource<E>` operands and `has(element: E)` do not describe any MultiMap
 * operation.
 *
 * As with the capabilities in `@rimbu/collection-types`, each member below is a
 * named `Api`/`BuilderApi` interface. The element type is re-typed by the
 * adopted keyed capabilities rather than by these, so — exactly as for
 * `MultiSetCollection` and `BiMapCollection` — no `_NORMAL`/`_NON_EMPTY`/`_FAM`
 * slot-pinning family is declared here. Slot-pinning is consolidated into
 * `MultiMap.Advanced.Family`.
 */
export declare namespace MultiMapCollection {
	/**
	 * The abstract MultiMap: any MultiMap over `K`/`V`, resolved through the
	 * given family. Mirrors `MapCollection<K, V, F>` in `@rimbu/collection-types`.
	 *
	 * The family this resolves against is {@link Advanced.Family} — declared here,
	 * not in `public/` — so that the set-algebra capabilities below can name their
	 * operand without importing the concrete `MultiMap` (which would be a cycle:
	 * `public/` imports `advanced/`). `MultiMap.Advanced.Family` in `public/`
	 * extends this one and narrows the four API slots to the concrete types.
	 */
	export type Collection<
		K,
		V,
		F extends KeyedCollection.Advanced.FamilyBase<K, V> = Advanced.FamilyBase<
			K,
			V
		>,
	> = (F & Advanced.Family<K, V>)['_NORMAL'];

	export type CollectionNonEmpty<
		K,
		V,
		F extends KeyedCollection.Advanced.FamilyBase<K, V> = Advanced.FamilyBase<
			K,
			V
		>,
	> = (F & Advanced.Family<K, V>)['_NON_EMPTY'];

	export namespace Advanced {
		/**
		 * The type of the value set stored at a key. A key is only ever present
		 * when it has at least one value, so the stored set is always non-empty;
		 * `getValues` widens to `SetCollection<V>` because an absent key yields
		 * the empty set.
		 *
		 * `keyMap` is likewise **not** narrowed through a `Tp['_IS_NON_EMPTY']`
		 * conditional: `MultiMap.NonEmpty` re-declares it directly (the way `BiMap`
		 * narrows `keyValueMap`), which keeps the concrete family assignable to
		 * this one.
		 */
		export type KeyValuesType<V> = SetCollection<V>;

		/**
		 * The options accepted by {@link Capability.WithModifyValuesAt.Api.modifyValuesAt}.
		 *
		 * Deliberately **not** the shared `ModifyOptions<T>` from
		 * `@rimbu/collection-types`: that shape carries a single value plus
		 * `skip`/`remove` sentinels, whereas a MultiMap replaces a whole *set*
		 * of values. Note the preserved semantic — returning an empty
		 * `StreamSource` from `create`/`update` **removes the key**. An empty
		 * result is how a caller says "leave no values here", which the
		 * sentinels of the shared shape would only duplicate.
		 */
		export interface ModifyValuesOptions<V, VS = SetCollection.NonEmpty<V>> {
			ifNew?:
				| { set: StreamSource<V>; create?: never }
				| { set?: never; create: () => StreamSource<V> };
			ifExists?:
				| { set: StreamSource<V>; update?: never }
				| { set?: never; update: (currentValues: VS) => StreamSource<V> };
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
				// keyed capabilities gained from adopting this style (see the
				// migration plan, Q18)
				KeyedCollection.Capability.WithMap.Api<K, V, Tp>,
				KeyedCollection.Capability.WithMapIndexed.Api<K, V, Tp>,
				KeyedCollection.Capability.WithFlatMap.Api<K, V, Tp>,
				KeyedCollection.Capability.WithFlatMapIndexed.Api<K, V, Tp>,
				Collection.Capability.WithMutate.Api<readonly [K, V], Tp>,
				Collection.Capability.WithAddEach.Api<readonly [K, V], Tp>,
				Collection.Capability.WithToBuilder.Api<readonly [K, V], Tp>,
				// MultiMap-specific
				MultiMapCollection.Capability.WithAddTo.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithGetValues.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithHasEntry.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithKeySize.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithCount.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithKeyMap.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithAddEachValue.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithSetEachValue.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithRemoveEntry.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithRemoveEntries.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithFlatMapValues.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithModifyValuesAt.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithUnion.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithIntersection.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithDifference.Api<K, V, Tp>,
				MultiMapCollection.Capability.WithSymmetricDifference.Api<K, V, Tp> {
			/**
			 * A debug rendering of the form `MultiMap(1 -> [a, c], 2 -> [b])`.
			 *
			 * Not a capability: it needs no builder counterpart and no kind
			 * refinement, so it is declared here next to the other directly
			 * declared members (the same placement `MultiSetCollection` uses for
			 * `countMap`). Implemented concretely on the runtime classes.
			 */
			toString(): string;
		}

		/**
		 * The MultiMap builder API, aggregating the generic builder surface with
		 * the value-set-aware mutations.
		 */
		export interface BuilderApi<
			K,
			V,
			Tp extends Collection.Advanced.Types<FamilyBase<K, V>, readonly [K, V]>,
		> extends Collection.Advanced.BuilderApi<readonly [K, V], Tp>,
				KeyedCollection.Capability.WithHas.BuilderApi<K, V, Tp>,
				KeyedCollection.Capability.WithRemoveKey.BuilderApi<K, V, Tp>,
				KeyedCollection.Capability.WithRemoveKeys.BuilderApi<K, V, Tp>,
				KeyedCollection.Capability.WithMapValues.BuilderApi<K, V, Tp>,
				Collection.Capability.WithAddEach.BuilderApi<readonly [K, V], Tp>,
				MultiMapCollection.Capability.WithAddTo.BuilderApi<K, V, Tp>,
				MultiMapCollection.Capability.WithGetValues.BuilderApi<K, V, Tp>,
				MultiMapCollection.Capability.WithHasEntry.BuilderApi<K, V, Tp>,
				MultiMapCollection.Capability.WithCount.BuilderApi<K, V, Tp>,
				MultiMapCollection.Capability.WithAddEachValue.BuilderApi<K, V, Tp>,
				MultiMapCollection.Capability.WithSetEachValue.BuilderApi<K, V, Tp>,
				MultiMapCollection.Capability.WithRemoveEntry.BuilderApi<K, V, Tp>,
				MultiMapCollection.Capability.WithRemoveEntries.BuilderApi<K, V, Tp> {}

		export interface ContextApi<
			UK,
			UV,
			FAM extends MultiMapCollection.Advanced.FamilyBase<UK, UV>,
		> extends Collection.Advanced.ContextApi<FAM>,
				KeyedCollection.Advanced.ContextApi<FAM>,
				KeyedCollection.Capability.WithReducer.KeyedContextApi<FAM> {
			readonly typeTag: 'MultiMap';
			readonly keyMapContext: MapCollection.Context<
				MapCollection.Advanced.Family<UK, SetCollection<UV>>
			>;
			readonly keyMapValuesContext: SetCollection.Context<
				SetCollection.Advanced.Family<UV>
			>;

			// Restated loosely, for the same reason `BiMap` does: the
			// `KeyedCollection.Capability.WithMerge` return types recurse through
			// `_UPPER_V`, and a MultiMap pins `_UPPER_E` to `readonly [K, V]`, so
			// they cannot be structurally satisfied. The members are implemented
			// properly at runtime (see `internal/context-factory.ts`); only the
			// declared types are widened.
			mergeEachWith: (...args: any[]) => any;
			mergeEach: (...args: any[]) => any;
			mergeWith: (...args: any[]) => any;
			merge: (...args: any[]) => any;
		}

		/**
		 * The slot skeleton a MultiMap family is built from.
		 *
		 * Deliberately adds **no** members of its own — in particular it does not
		 * redeclare `_FAM`/`_NEW_FAMILY`, because doing so would make it disagree
		 * with the capability families it has to sit beside in one `extends`
		 * clause (TS2320). Only {@link Family}, the default concrete family, and
		 * `MultiMap.Advanced.Family` in `public/` narrow those to themselves.
		 */
		export interface FamilyBase<K, V>
			extends KeyedCollection.Advanced.FamilyBase<K, V> {}

		/**
		 * The default MultiMap family, and the single place every slot is pinned.
		 *
		 * Only the **non-invariant** keyed capabilities appear in this `extends`
		 * clause. That is a constraint of the capability system, not a stylistic
		 * choice: a capability that makes its collection invariant in the element
		 * type declares `_INVARIANT: (e: readonly [K, V]) => readonly [K, V]`,
		 * while a covariant one does not declare it at all (it inherits
		 * `(e: any) => any`). Two bases in one `extends` clause must agree on
		 * every shared property *identically*, so mixing the two kinds is a
		 * `TS2320`. The invariant capabilities — `KeyedCollection`'s `WithMap`,
		 * `WithMapIndexed`, `WithFlatMap`, `WithFlatMapIndexed` and the
		 * element-level `WithAddEach`/`WithToBuilder`/`WithMutate` — are therefore
		 * claimed through the `Api`/`BuilderApi` aggregates above, which is where
		 * the method surface they contribute is actually typed. See
		 * `multimap/AGENTS.md`.
		 *
		 * `_UPPER_K`/`_UPPER_V` are pinned to `K`/`V` (not widened to `any`) on
		 * purpose: methods that build new values in the *same* context —
		 * `mapValues`, `flatMapValues` — must constrain their result to a subtype
		 * of `V`, so that the guarantee "the result is built by the same context"
		 * stays checkable. Widening would silently permit mapping to an unrelated
		 * value type, which the backing value set cannot represent.
		 */
		export interface Family<K, V>
			extends FamilyBase<K, V>,
				KeyedCollection.Capability.WithStreamKeys<K, V>,
				KeyedCollection.Capability.WithStreamValues<K, V>,
				KeyedCollection.Capability.WithHas<K, V>,
				KeyedCollection.Capability.WithRemoveKey<K, V>,
				KeyedCollection.Capability.WithRemoveKeys<K, V>,
				KeyedCollection.Capability.WithMapValues<K, V>,
				KeyedCollection.Capability.WithRecompose<K, V> {
			_NORMAL: Api<K, V, this['_TYPES']>;
			_NON_EMPTY: Api<K, V, this['_TYPES_NON_EMPTY']>;
			_BUILDER: BuilderApi<K, V, this['_TYPES']>;
			_CONTEXT: ContextApi<K, V, this['_FAM']>;
			_KEYED_CONTEXT: ContextApi<K, V, this['_FAM']>;

			_UPPER_E: readonly [K, V];
			_NEW_E: readonly [unknown, unknown];

			/**
			 * A MultiMap is invariant in `readonly [K, V]`: `addTo`, `mapValues`
			 * and friends all take a `(value: V, key: K) => …` callback, which is
			 * contravariant in `V`.
			 */
			_INVARIANT: (e: readonly [K, V]) => readonly [K, V];

			/**
			 * A MultiMap hands back the whole value set when a key is removed, and
			 * uses the empty set in place of `undefined`: `removeKeyAndReturn`
			 * yields a `SetCollection<V>`, and `Builder.removeKey` yields one too,
			 * where an empty set means "this key was not present".
			 *
			 * This is the single override that lets a MultiMap adopt
			 * `KeyedCollection.Capability.WithRemoveKey` wholesale instead of
			 * shadowing it.
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

		export namespace WithHasEntry {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				hasEntry<UK = K>(key: RelatedTo<K, UK>, value: V): boolean;
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				hasEntry<UK = K>(key: RelatedTo<K, UK>, value: V): boolean;
			}
		}

		export namespace WithKeySize {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				readonly keySize: number;
			}
		}

		export namespace WithCount {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				count<UK = K>(key: RelatedTo<K, UK>): number;
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				count<UK = K>(key: RelatedTo<K, UK>): number;
			}
		}

		export namespace WithKeyMap {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				/**
				 * The backing key map, `K` → non-empty value set.
				 *
				 * `SetCollection.NonEmpty<V>` is exact: a MultiMap never stores a
				 * key without at least one value. Note that `keyMap.context` is
				 * therefore *not* the same **type** as `Context.keyMapContext` (which
				 * is used at the wider `SetCollection<V>`, since the builder has to be
				 * able to produce a possibly-empty set) even though at runtime it is
				 * the same object.
				 */
				readonly keyMap: MapCollection<K, SetCollection.NonEmpty<V>>;
			}
		}

		export namespace WithAddEachValue {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				addEachValue(
					key: K,
					values: StreamSource.NonEmpty<V>,
				): Tp['_NON_EMPTY'];
				addEachValue(key: K, values: StreamSource<V>): Tp['_NORMAL'];
			}

			export interface BuilderApi<
				K,
				V,
				Tp extends Collection.Advanced.TypesBase,
			> {
				addEachValue(key: K, values: StreamSource<V>): boolean;
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

		export namespace WithFlatMapValues {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				flatMapValues<V2 extends V>(
					flatMapFun: (value: V, key: K) => StreamSource<V2>,
				): Collection.Advanced.ReTyped<Tp, readonly [K, V2]>['_NORMAL'];
			}
		}

		export namespace WithModifyValuesAt {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				modifyValuesAt(
					atKey: K,
					options: Advanced.ModifyValuesOptions<
						V,
						Tp['_REMOVED_AT_KEY'] & SetCollection.NonEmpty<V>
					>,
				): Tp['_NORMAL'];
			}
		}

		export namespace WithUnion {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				union<U extends V>(
					other: MultiMapCollection.CollectionNonEmpty<K, U>,
				): Tp['_NON_EMPTY'];
				union<U extends V>(
					other: MultiMapCollection.Collection<K, U>,
				): Tp['_NORMAL'];
			}
		}

		export namespace WithIntersection {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				intersection<U extends V>(
					other: MultiMapCollection.Collection<K, U>,
				): Tp['_NORMAL'];
			}
		}

		export namespace WithDifference {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				difference<U extends V>(
					other: MultiMapCollection.Collection<K, U>,
				): Tp['_NORMAL'];
			}
		}

		export namespace WithSymmetricDifference {
			export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> {
				symmetricDifference<U extends V>(
					other: MultiMapCollection.Collection<K, U>,
				): Tp['_NORMAL'];
			}
		}
	}
}
