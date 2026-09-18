import type { BiMap } from '@rimbu/bimap/bimap';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { StreamSource } from '@rimbu/stream';

import { KeyedCollectionContextBase } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { ContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { HashMap } from '@rimbu/hashed/map';
import { Reducer } from '@rimbu/stream/reducer';

import { BiMapBuilder } from '#bimap/builder';
import { BiMapEmpty, BiMapImpl, BiMapNonEmptyBase } from '#bimap/immutable';

export class BiMapCollectionContext<UK, UV>
	extends ContextBaseWithAddAll<BiMap.Advanced.Family<UK, UV>>
	implements BiMap.Advanced.ContextApi<UK, UV, BiMap.Advanced.Family<UK, UV>>
{
	static createDefault<UK, UV>(options?: {
		keyValueContext?:
			| MapCollection.Context<MapCollection.Advanced.Family<UK, any>>
			| undefined;
		valueKeyContext?:
			| MapCollection.Context<MapCollection.Advanced.Family<UV, any>>
			| undefined;
	}): BiMapCollectionContext<UK, UV> {
		const result: BiMapCollectionContext<UK, UV> = new BiMapCollectionContext<
			UK,
			UV
		>(options?.keyValueContext, options?.valueKeyContext, () => result);

		return result;
	}

	#keyValueContext:
		| MapCollection.Context<MapCollection.Advanced.Family<UK, any>>
		| undefined;
	#valueKeyContext:
		| MapCollection.Context<MapCollection.Advanced.Family<UV, any>>
		| undefined;

	constructor(
		keyValueContext:
			| MapCollection.Context<MapCollection.Advanced.Family<UK, any>>
			| undefined,
		valueKeyContext:
			| MapCollection.Context<MapCollection.Advanced.Family<UV, any>>
			| undefined,
		readonly getDefaultInstance: () => BiMapCollectionContext<any, any>,
	) {
		super();
		this.#keyValueContext = keyValueContext;
		this.#valueKeyContext = valueKeyContext;
	}

	readonly typeTag = 'BiMap' as const;

	get keyValueContext(): MapCollection.Context<
		MapCollection.Advanced.Family<UK, any>
	> {
		if (undefined === this.#keyValueContext) {
			this.#keyValueContext = HashMap.createContext(
				{},
			) as unknown as MapCollection.Context<
				MapCollection.Advanced.Family<UK, any>
			>;
		}

		return this.#keyValueContext;
	}

	get valueKeyContext(): MapCollection.Context<
		MapCollection.Advanced.Family<UV, any>
	> {
		if (undefined === this.#valueKeyContext) {
			this.#valueKeyContext = HashMap.createContext(
				{},
			) as unknown as MapCollection.Context<
				MapCollection.Advanced.Family<UV, any>
			>;
		}

		return this.#valueKeyContext;
	}

	isValidKey(key: unknown): boolean {
		return this.keyValueContext.isValidKey(key);
	}

	isValidValue(value: unknown): boolean {
		return this.valueKeyContext.isValidKey(value);
	}

	#keyedContext: BiMapKeyedContext<UK, UV> | undefined;

	get keyedContext(): BiMapKeyedContext<UK, UV> {
		if (undefined === this.#keyedContext) {
			this.#keyedContext = new BiMapKeyedContext<UK, UV>(this);
		}

		return this.#keyedContext;
	}

	get defaultContext(): BiMap.Context<UK, UV> {
		return this.getDefaultInstance() as unknown as BiMap.Context<UK, UV>;
	}

	#empty: BiMap<UK, any> | undefined;

	empty = <E extends readonly [UK, UV]>(): BiMap<E[0], E[1]> => {
		if (undefined === this.#empty) {
			this.#empty = new BiMapEmpty<UK, any>(
				this as unknown as BiMapCollectionContext<UK, any>,
			);
		}

		return this.#empty as unknown as BiMap<E[0], E[1]>;
	};

	builder = <E extends readonly [UK, UV]>(): BiMap.Builder<E[0], E[1]> => {
		return new BiMapBuilder(
			this as unknown as BiMapCollectionContext<E[0], E[1]>,
		);
	};

	reducer = <E2 extends readonly [UK, UV]>(
		source?: StreamSource<E2>,
	): Reducer<E2, BiMap<E2[0], E2[1]>> => {
		return Reducer.create(
			() =>
				undefined === source
					? this.builder<E2>()
					: this.from(source).toBuilder(),
			(builder, entry) => {
				builder.add(entry);
				return builder;
			},
			(builder) => builder.build(),
		);
	};

	isNonEmptyInstance<E extends readonly [UK, any]>(
		source: unknown,
	): source is BiMap.NonEmpty<E[0], E[1]> {
		return source instanceof BiMapNonEmptyBase;
	}

	createNonEmptyImpl<K extends UK, V extends UV>(
		keyValueMap: MapCollection.NonEmpty<K, V>,
		valueKeyMap: MapCollection.NonEmpty<V, K>,
	): BiMapImpl<K, V> {
		return new BiMapImpl(
			this as unknown as BiMapCollectionContext<K, V>,
			keyValueMap,
			valueKeyMap,
		);
	}

	createBuilder<K extends UK, V extends UV>(
		source?: BiMap.NonEmpty<K, V>,
	): BiMap.Builder<K, V> {
		return new BiMapBuilder(
			this as unknown as BiMapCollectionContext<K, V>,
			source as unknown as BiMapImpl<K, V>,
		);
	}

	invertContext(): BiMapCollectionContext<UV, UK> {
		return new BiMapCollectionContext<UV, UK>(
			this.valueKeyContext,
			this.keyValueContext,
			this.getDefaultInstance,
		);
	}
}

export class BiMapKeyedContext<UK, UV>
	extends KeyedCollectionContextBase<UK, UV, BiMap.Advanced.Family<any, any>>
	implements
		BiMap.Advanced.KeyedContextApi<UK, UV, BiMap.Advanced.Family<UK, UV>>
{
	constructor(readonly context: BiMapCollectionContext<UK, UV>) {
		super(context);
	}

	get defaultContext(): BiMap.Context<UK, UV> {
		return this.context.defaultContext;
	}

	createContext = <K, V>(options?: {
		keyValueContext?:
			| MapCollection.Context<MapCollection.Advanced.Family<K, any>>
			| undefined;
		valueKeyContext?:
			| MapCollection.Context<MapCollection.Advanced.Family<V, any>>
			| undefined;
	}): BiMap.Context<K, V> => {
		return new BiMapCollectionContext<K, V>(
			options?.keyValueContext,
			options?.valueKeyContext,
			this.context.getDefaultInstance,
		) as unknown as BiMap.Context<K, V>;
	};

	get reducer(): <K, V>(
		source?: StreamSource<readonly [K, V]>,
	) => Reducer<readonly [K, V], BiMap<K, V>> {
		return this.context.reducer as any;
	}

	mergeAllWith = (...args: any[]): any => {
		const sources = args[0] as readonly StreamSource<readonly [UK, any]>[];

		const builder = this.builder<UK, any>();

		for (const source of sources) {
			builder.addAll(source);
		}

		return builder.build().assumeNonEmpty();
	};

	mergeAll = (...args: any[]): any => {
		return this.mergeAllWith(args[0]);
	};

	mergeWith = (...args: any[]): any => {
		const sources = args[0] as readonly StreamSource<readonly [UK, any]>[];

		const builder = this.builder<UK, any>();

		for (const source of sources) {
			builder.addAll(source);
		}

		return builder.build();
	};

	merge = (...args: any[]): any => {
		return this.mergeWith(args[0]);
	};
}
