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
	static createDefault<UT, F extends MultiSet.Advanced.Family<UT>>(
		countMapContext: MapCollection.Context<
			MapCollection.Advanced.Family<UT, number>
		>,
		typeTag: string,
	): MultiSetContext<UT, F> {
		const result: MultiSetContext<UT, F> = new MultiSetContext(
			countMapContext,
			typeTag,
			() => result,
		);
		Object.freeze(result);

		return result;
	}

	private constructor(
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
	): MultiSetContext<UT2, any> => {
		const result = new MultiSetContext(
			options?.countMapContext ?? this.countMapContext,
			this.typeTag,
			this.getDefaultInstance,
		);

		Object.freeze(result);
		return result;
	};
}
