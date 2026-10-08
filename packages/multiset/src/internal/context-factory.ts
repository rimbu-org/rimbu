import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { MultiSet, MultiSetCollection } from '@rimbu/multiset';
import type { StreamSource } from '@rimbu/stream';

import { ContextBaseWithAddEach } from '@rimbu/collection-types/advanced/collection-base';
import { Reducer } from '@rimbu/stream/reducer';

import { MultiSetBuilder } from '#multiset/builder';
import { MultiSetEmpty } from '#multiset/immutable/empty';
import { MultiSetNonEmptyBase } from '#multiset/immutable/non-empty';

export interface MultiSetContext<UT>
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

export class MultiSetContextImpl<UT, FAM extends MultiSet.Advanced.Family<UT>>
	extends ContextBaseWithAddEach<FAM>
	implements MultiSetCollection.Advanced.ContextApi<UT, FAM>
{
	static createDefault<UT, F extends MultiSet.Advanced.Family<UT>>(
		countMapContext: MapCollection.Context<
			MapCollection.Advanced.Family<UT, number>
		>,
	): MultiSetContextImpl<UT, F> {
		const result: MultiSetContextImpl<UT, F> = new MultiSetContextImpl(
			countMapContext,
			() => result,
		);
		Object.freeze(result);

		return result;
	}

	private constructor(
		readonly countMapContext: MapCollection.Context<
			MapCollection.Advanced.Family<UT, number>
		>,
		readonly getDefaultInstance: () => MultiSetContextImpl<UT, FAM>,
	) {
		super();
	}

	/**
	 * Fixed rather than a constructor parameter: the tag describes the
	 * collection, and there is only one collection type.
	 */
	readonly typeTag: 'MultiSet' = 'MultiSet';

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
	): MultiSetContextImpl<UT2, any> => {
		// `UT2` is a *new* upper type limit, so the inherited backing is keyed on
		// `UT` while the supplied one is keyed on `UT2`. The two are unrelated
		// generics by construction, so the merge needs a bridge — the same one
		// `MultiMapContextImpl.createContext` uses.
		const countMapContext = (options?.countMapContext ??
			this.countMapContext) as MapCollection.Context<
			MapCollection.Advanced.Family<UT2, number>
		>;

		const result = new MultiSetContextImpl(
			countMapContext,
			() =>
				this as unknown as MultiSetContextImpl<
					UT2,
					MultiSet.Advanced.Family<UT2>
				>,
		);

		Object.freeze(result);
		return result;
	};
}
