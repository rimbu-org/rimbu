import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { MultiSet, MultiSetCollection } from '@rimbu/multiset';
import type { StreamSource } from '@rimbu/stream';

import { ContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { Reducer } from '@rimbu/stream/reducer';

import {
	MultiSetBuilder,
	MultiSetEmpty,
	MultiSetNonEmptyBase,
} from '#multiset/base';

export interface ContextImpl<UT>
	extends MultiSetCollection.Advanced.ContextApi<
		UT,
		MultiSet.Advanced.Family<UT>
	> {
	isNonEmptyInstance<T>(source: any): source is MultiSet.NonEmpty<T>;
	createNonEmpty<T extends UT>(
		countMap: MapCollection.NonEmpty<T, number>,
		size: number,
	): MultiSet.NonEmpty<T>;
	createBuilder<T extends UT>(
		source?: MultiSet.NonEmpty<T>,
	): MultiSet.Builder<T>;
}

export class MultiSetContext<UT, FAM extends MultiSet.Advanced.Family<UT>>
	extends ContextBaseWithAddAll<FAM>
	implements MultiSetCollection.Advanced.ContextApi<UT, FAM>
{
	static createDefault<
		UT,
		F extends MultiSet.Advanced.Family<any> = MultiSet.Advanced.Family<any>,
	>(
		countMapContext: F['_COUNT_MAP_CONTEXT'],
		typeTag: string,
	): MultiSetContext<UT, F> {
		const result: MultiSetContext<UT, F> = new MultiSetContext(
			countMapContext,
			typeTag,
			() => result,
		);

		return result;
	}

	constructor(
		readonly countMapContext: MapCollection.Context<
			MapCollection.Advanced.Family<UT, number>
		>,
		readonly typeTag: string,
		readonly getDefaultInstance: () => MultiSetContext<UT, FAM>,
	) {
		super();
	}

	get defaultContext(): FAM['_CONTEXT'] {
		return this.getDefaultInstance() as any;
	}

	isValidElem(value: unknown): value is UT {
		return this.countMapContext.isValidKey(value);
	}

	isNonEmptyInstance<E extends UT>(
		source: unknown,
	): source is Collection.Advanced.FamToTypes<FAM, E>['_NON_EMPTY'] {
		return source instanceof MultiSetNonEmptyBase;
	}

	#empty: unknown;

	empty = <E extends UT>(): Collection.Advanced.FamToTypes<
		FAM,
		E
	>['_NORMAL'] => {
		if (undefined === this.#empty) {
			this.#empty = Object.freeze(new MultiSetEmpty<E>(this as any));
		}

		return this.#empty as any;
	};

	builder = <E extends UT>(): Collection.Advanced.FamToTypes<
		FAM,
		E
	>['_BUILDER'] => {
		return new MultiSetBuilder<E>(this as any) as any;
	};

	createNonEmpty<T extends UT>(
		countMap: MapCollection.NonEmpty<T, number>,
		size: number,
	): MultiSet.NonEmpty<T> {
		return new MultiSetNonEmptyBase<T>(this as any, countMap, size) as any;
	}

	createBuilder<T extends UT>(
		source?: MultiSet.NonEmpty<T>,
	): MultiSet.Builder<T> {
		return new MultiSetBuilder<T>(this as any, source);
	}

	reducer = <E extends UT>(
		source?: StreamSource<E>,
	): Reducer<E, Collection.Advanced.FamToTypes<FAM, E>['_NORMAL']> => {
		return Reducer.create(
			() =>
				undefined === source
					? this.builder<E>()
					: (this.from(source as any) as any).toBuilder(),
			(builder, value) => {
				builder.add(value);
				return builder;
			},
			(builder) => builder.build(),
		) as any;
	};

	createContext = <UT2>(
		options?:
			| {
					countMapContext?:
						| MapCollection.Context<MapCollection.Advanced.Family<UT2, number>>
						| undefined;
			  }
			| undefined,
	): MultiSetContext<UT2, any> =>
		new MultiSetContext(
			options?.countMapContext ?? this.countMapContext,
			this.typeTag,
			this.getDefaultInstance,
		) as any;
}

// export class MultiSetContext<UT> extends MultiSetContext<
// 	UT,
// 	MultiSet.Advanced.Family<UT>
// > {
// 	static createDefault<UT>(
// 		countMapContext: MapCollection.Context<
// 			MapCollection.Advanced.Family<UT, number>
// 		>,
// 	): MultiSetContext<UT> {
// 		const result: MultiSetContext<UT> = new MultiSetContext<UT>(
// 			countMapContext,
// 			() => result,
// 		);

// 		return result;
// 	}

// 	constructor(
// 		readonly _countMapContext: MapCollection.Context<
// 			MapCollection.Advanced.Family<UT, number>
// 		>,
// 		readonly getDefaultInstance: () => MultiSetContext<any>,
// 	) {
// 		super();
// 	}

// 	readonly typeTag = 'MultiSet';

// 	get countMapContext(): MapCollection.Context<
// 		MapCollection.Advanced.Family<UT, number>
// 	> {
// 		return this._countMapContext;
// 	}

// 	get defaultContext(): MultiSet.Context<UT> {
// 		return this.getDefaultInstance() as unknown as MultiSet.Context<UT>;
// 	}
// }

// export class HashMultiSetContext<UE> extends MultiSetContext<
// 	UE,
// 	HashMultiSet.Advanced.Family<UE>
// > {
// 	static createDefault<UE>(
// 		countMapContext?: MapCollection.Context<
// 			MapCollection.Advanced.Family<UE, number>
// 		>,
// 	): HashMultiSetContext<UE> {
// 		const result: HashMultiSetContext<UE> = new HashMultiSetContext<UE>(
// 			countMapContext,
// 			() => result,
// 		);

// 		return result;
// 	}

// 	constructor(
// 		readonly _countMapContext:
// 			| MapCollection.Context<MapCollection.Advanced.Family<UE, number>>
// 			| undefined,
// 		readonly getDefaultInstance: () => HashMultiSetContext<any>,
// 	) {
// 		super();
// 	}

// 	readonly typeTag = 'HashMultiSet' as const;

// 	#countMapContext:
// 		| MapCollection.Context<MapCollection.Advanced.Family<UE, number>>
// 		| undefined;

// 	get countMapContext(): MapCollection.Context<
// 		MapCollection.Advanced.Family<UE, number>
// 	> {
// 		if (undefined === this._countMapContext) {
// 			if (undefined === this.#countMapContext) {
// 				this.#countMapContext = HashMap.createContext(
// 					{},
// 				) as unknown as MapCollection.Context<
// 					MapCollection.Advanced.Family<UE, number>
// 				>;
// 			}

// 			return this.#countMapContext;
// 		}

// 		return this._countMapContext;
// 	}

// 	get defaultContext(): HashMultiSet.Context<UE> {
// 		return this.getDefaultInstance() as unknown as HashMultiSet.Context<UE>;
// 	}

// 	createContext = <T>(options?: {
// 		countMapContext?:
// 			| MapCollection.Context<MapCollection.Advanced.Family<T, number>>
// 			| undefined;
// 	}): HashMultiSet.Context<T> => {
// 		return new HashMultiSetContext<T>(
// 			options?.countMapContext,
// 			this.getDefaultInstance as any,
// 		) as unknown as HashMultiSet.Context<T>;
// 	};
// }

// export class SortedMultiSetContext<UE> extends MultiSetContext<
// 	UE,
// 	SortedMultiSet.Advanced.Family<UE>
// > {
// 	static createDefault<UE>(
// 		countMapContext?: MapCollection.Context<
// 			MapCollection.Advanced.Family<UE, number>
// 		>,
// 	): SortedMultiSetContext<UE> {
// 		const result: SortedMultiSetContext<UE> = new SortedMultiSetContext<UE>(
// 			countMapContext,
// 			() => result,
// 		);

// 		return result;
// 	}

// 	constructor(
// 		readonly _countMapContext:
// 			| MapCollection.Context<MapCollection.Advanced.Family<UE, number>>
// 			| undefined,
// 		readonly getDefaultInstance: () => SortedMultiSetContext<any>,
// 	) {
// 		super();
// 	}

// 	readonly typeTag = 'SortedMultiSet' as const;

// 	#countMapContext:
// 		| MapCollection.Context<MapCollection.Advanced.Family<UE, number>>
// 		| undefined;

// 	get countMapContext(): MapCollection.Context<
// 		MapCollection.Advanced.Family<UE, number>
// 	> {
// 		if (undefined === this._countMapContext) {
// 			if (undefined === this.#countMapContext) {
// 				this.#countMapContext = SortedMap.createContext(
// 					{},
// 				) as unknown as MapCollection.Context<
// 					MapCollection.Advanced.Family<UE, number>
// 				>;
// 			}

// 			return this.#countMapContext;
// 		}

// 		return this._countMapContext;
// 	}

// 	get defaultContext(): SortedMultiSet.Context<UE> {
// 		return this.getDefaultInstance() as unknown as SortedMultiSet.Context<UE>;
// 	}

// 	createContext = <T>(options?: {
// 		countMapContext?:
// 			| MapCollection.Context<MapCollection.Advanced.Family<T, number>>
// 			| undefined;
// 	}): SortedMultiSet.Context<T> => {
// 		return new SortedMultiSetContext<T>(
// 			options?.countMapContext,
// 			this.getDefaultInstance as any,
// 		) as unknown as SortedMultiSet.Context<T>;
// 	};
// }
