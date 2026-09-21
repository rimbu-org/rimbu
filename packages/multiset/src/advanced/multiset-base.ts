import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { RelatedTo } from '@rimbu/common';
import type { MultiSet } from '@rimbu/multiset';
import type { StreamSource } from '@rimbu/stream';

/**
 * The capability suite that a MultiSet contributes on top of the generic
 * {@link ValuedCollection} surface.
 *
 * Unlike the capabilities in `@rimbu/collection-types`, these are plain
 * `Api`/`BuilderApi` interfaces aggregated into `MultiSetCollection.Advanced.Api`:
 * the element type is not re-typed by the capability, so a full `_NORMAL` /
 * `_NON_EMPTY` / `_FAM` capability family (as used for e.g. `WithAdd`) is not
 * required. This mirrors `BiMapCollection.Capability` in `@rimbu/bimap`.
 */
export declare namespace MultiSetCollection {
	export namespace Advanced {
		/**
		 * A count-map family: any `MapCollection` family keyed by a value of type
		 * `T` and valued by a `number` count.
		 *
		 * This is the type-level "kind of map" that a generic `MultiSet` is
		 * parameterised by. Concrete map packages expose one
		 * (`HashMap.Advanced.Family`, `SortedMap.Advanced.Family`, …), so a new
		 * MultiSet kind is a one-line type alias:
		 *
		 * ```ts
		 * type HashMultiSet<T> = MultiSetBase<T, HashMap.Advanced.Family<T, number>>;
		 * ```
		 */
		export type CountMapFamily<T> = MapCollection.Advanced.Family<T, number>;

		/**
		 * The widest count-map family accepted by {@link FamilyBase}. Retyping
		 * (`map`/`flatMap`) has to be expressible for a generic family parameter,
		 * which TypeScript cannot prove against a keyed-family constraint, so the
		 * faithful `CountMapFamily<T>` constraint is applied at the public
		 * `MultiSetBase` entry point instead.
		 */
		export type AnyFamily = Collection.Advanced.FamilyBase<any>;

		/** The concrete count map for element `T` and count-map family `F`. */
		export type CountMapFrom<T, F> =
			F extends CountMapFamily<T> ? F['_NORMAL'] : MapCollection<T, number>;

		/** The concrete non-empty count map for element `T` and family `F`. */
		export type CountMapNonEmptyFrom<T, F> =
			F extends CountMapFamily<T>
				? F['_NON_EMPTY']
				: MapCollection.NonEmpty<T, number>;

		/** The context of the count map for element `T` and family `F`. */
		export type CountMapContextFrom<T, F> =
			F extends CountMapFamily<T>
				? MapCollection.Context<F>
				: MapCollection.Context<CountMapFamily<T>>;

		export interface Api<
			T,
			Tp extends Collection.Advanced.Types<FamilyBase<T, any>, T>,
		> extends ValuedCollection.Advanced.Api<T, Tp>,
				Collection.Capability.WithAdd.Api<T, Tp>,
				Collection.Capability.WithAddAll.Api<T, Tp>,
				Collection.Capability.WithToBuilder.Api<T, Tp>,
				MultiSetCollection.Capability.WithCount.Api<T, Tp>,
				MultiSetCollection.Capability.WithCountStreams.Api<T, Tp>,
				MultiSetCollection.Capability.WithCountMap.Api<T, Tp>,
				MultiSetCollection.Capability.WithSetCount.Api<T, Tp>,
				MultiSetCollection.Capability.WithAddAllWithCounts.Api<T, Tp>,
				MultiSetCollection.Capability.WithFilterWithCounts.Api<T, Tp>,
				MultiSetCollection.Capability.WithRemove.Api<T, Tp>,
				MultiSetCollection.Capability.WithRemoveAll.Api<T, Tp>,
				MultiSetCollection.Capability.WithUnion.Api<T, Tp>,
				MultiSetCollection.Capability.WithIntersection.Api<T, Tp>,
				MultiSetCollection.Capability.WithDifference.Api<T, Tp>,
				MultiSetCollection.Capability.WithSymmetricDifference.Api<T, Tp> {
			readonly countMap: [Tp['_IS_NON_EMPTY']] extends [true]
				? Tp['_COUNT_MAP_NON_EMPTY']
				: Tp['_COUNT_MAP'];

			add(value: T): Tp['_NON_EMPTY'];
			add<const N extends number>(
				value: T,
				amount: N,
			): 0 extends N ? Tp['_SELF'] : Tp['_NON_EMPTY'];
		}

		/**
		 * The MultiSet builder API, aggregating the generic builder surface with the
		 * amount-carrying MultiSet mutations.
		 */
		export interface BuilderApi<
			T,
			Tp extends Collection.Advanced.Types<FamilyBase<T, any>, T>,
		> extends ValuedCollection.Advanced.BuilderApi<T, Tp>,
				Collection.Capability.WithAdd.BuilderApi<T, Tp>,
				Collection.Capability.WithAddAll.BuilderApi<T, Tp>,
				MultiSetCollection.Capability.WithCount.BuilderApi<T, Tp>,
				MultiSetCollection.Capability.WithSetCount.BuilderApi<T, Tp>,
				MultiSetCollection.Capability.WithAddAllWithCounts.BuilderApi<T, Tp>,
				MultiSetCollection.Capability.WithRemove.BuilderApi<T, Tp>,
				MultiSetCollection.Capability.WithRemoveAll.BuilderApi<T, Tp> {
			add(value: T): boolean;
			add(value: T, amount: number): boolean;
		}

		export type CountMapType<T, IsNonEmpty extends boolean = boolean> = [
			IsNonEmpty,
		] extends [true]
			? MapCollection.NonEmpty<T, number>
			: MapCollection<T, number>;

		export interface ContextApi<
			UT,
			FAM extends MultiSetCollection.Advanced.FamilyBase<UT, any>,
		> extends ValuedCollection.Advanced.ContextApi<FAM>,
				Collection.Capability.WithReducer.ContextApi<FAM> {
			readonly typeTag: string;
			readonly countMapContext: MapCollection.Context<FAM['_COUNT_MAP_FAMILY']>;
			isValidElem(value: unknown): value is UT;
		}

		export interface FamilyBase<
			T,
			F extends MultiSetCollection.Advanced.AnyFamily = CountMapFamily<T>,
		> extends Collection.Advanced.FamilyBase<T> {
			/** the count-map family this MultiSet kind is backed by */
			_COUNT_MAP_FAMILY: F;
			/** the concrete count map (non-empty variant on non-empty instances) */
			_COUNT_MAP: CountMapFrom<T, F>;
			_COUNT_MAP_NON_EMPTY: CountMapNonEmptyFrom<T, F>;
			/** the context used to build count maps */
			_COUNT_MAP_CONTEXT: CountMapContextFrom<T, F>;

			_FAM: FamilyBase<T, F>;
			_NEW_FAMILY: FamilyBase<
				this['_NEW_E'],
				Collection.Advanced.ReTypeFam<F, readonly [this['_NEW_E'], number]>
			>;
		}
	}

	export namespace Capability {
		export namespace WithCount {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				/** the number of distinct values in the collection */
				readonly sizeDistinct: number;
				/** the amount of occurrences of `value` in the collection */
				count<U = T>(value: RelatedTo<T, U>): number;
			}

			export interface BuilderApi<T, Tp extends Collection.Advanced.TypesBase> {
				readonly sizeDistinct: number;
				count<U = T>(value: RelatedTo<T, U>): number;
			}
		}

		export namespace WithCountStreams {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				/** a stream of each distinct value once */
				streamDistinct(): Tp['_AS_STREAM'];
				/** a stream of each distinct `[value, count]` pair */
				streamWithCounts(): Collection.Advanced.ReTyped<
					Tp,
					readonly [T, number]
				>['_AS_STREAM'];
			}
		}

		export namespace WithCountMap {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				/** a map from each distinct value to its count */
				readonly countMap: MapCollection<T, number>;
			}
		}

		export namespace WithSetCount {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				setCount<const N extends number>(
					value: T,
					amount: N,
				): 0 extends N ? Tp['_NORMAL'] : Tp['_NON_EMPTY'];
				modifyCount(
					value: T,
					update: (currentCount: number) => number,
				): Tp['_NORMAL'];
			}

			export interface BuilderApi<T, Tp extends Collection.Advanced.TypesBase> {
				setCount(value: T, amount: number): boolean;
				modifyCount(
					value: T,
					update: (currentCount: number) => number,
				): boolean;
			}
		}

		export namespace WithAddAllWithCounts {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				addAllWithCounts(
					valueCounts: StreamSource<readonly [T, number]>,
				): Tp['_SELF'];
			}

			export interface BuilderApi<T, Tp extends Collection.Advanced.TypesBase> {
				addAllWithCounts(
					valueCounts: StreamSource<readonly [T, number]>,
				): boolean;
			}
		}

		export namespace WithFilterWithCounts {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				filterWithCounts<TF extends T>(
					pred: (
						valueCount: readonly [T, number],
						index: number,
					) => valueCount is [TF, number],
					options?: { negate?: false | undefined },
				): Collection.Advanced.FamToTypes<Tp['_FAM'], TF>['_NORMAL'];
				filterWithCounts<TF extends T>(
					pred: (
						valueCount: readonly [T, number],
						index: number,
					) => valueCount is [TF, number],
					options: { negate: true },
				): Collection.Advanced.FamToTypes<
					Tp['_FAM'],
					Exclude<T, TF>
				>['_NORMAL'];
				filterWithCounts(
					pred: (valueCount: readonly [T, number], index: number) => boolean,
					options?: { negate?: boolean | undefined },
				): Tp['_NORMAL'];
			}
		}

		export namespace WithRemove {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				remove<U = T>(value: RelatedTo<T, U>, amount?: number): Tp['_NORMAL'];
			}

			export interface BuilderApi<T, Tp extends Collection.Advanced.TypesBase> {
				remove<U = T>(value: RelatedTo<T, U>, amount?: number): number;
			}
		}

		export namespace WithRemoveAll {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				removeAll<U = T>(values: StreamSource<RelatedTo<T, U>>): Tp['_NORMAL'];
			}

			export interface BuilderApi<T, Tp extends Collection.Advanced.TypesBase> {
				removeAll<U = T>(values: StreamSource<RelatedTo<T, U>>): boolean;
			}
		}

		export namespace WithUnion {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				union<U extends T>(other: MultiSet.NonEmpty<U>): Tp['_NON_EMPTY'];
				union<U extends T>(other: MultiSet<U>): Tp['_SELF'];
			}
		}

		export namespace WithIntersection {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				intersection<U extends T>(other: MultiSet<U>): Tp['_NORMAL'];
			}
		}

		export namespace WithDifference {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				difference<U extends T>(other: MultiSet<U>): Tp['_NORMAL'];
			}
		}

		export namespace WithSymmetricDifference {
			export interface Api<T, Tp extends Collection.Advanced.TypesBase> {
				symmetricDifference<U extends T>(other: MultiSet<U>): Tp['_NORMAL'];
			}
		}
	}
}
