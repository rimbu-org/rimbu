import type { HashMap } from '@rimbu/hashed/map';

import { KeyedCollectionContextBase } from '@rimbu/collection-types/advanced/collection/keyed-base';
import { ContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { Eq } from '@rimbu/common';
import { Hasher } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import { Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { HashMapBlock, type MapEntrySet } from '#map/immutable/block';
import { HashMapCollision } from '#map/immutable/collision';
import { HashMapEmpty } from '#map/immutable/empty';
import { HashMapNonEmptyBase } from '#map/immutable/non-empty';
import {
	HashMapBlockBuilder,
	type MapBlockBuilderEntry,
} from '#map/mutable/block-builder';

export class HashMapCollectionContext<UK>
	extends ContextBaseWithAddAll<HashMap.Advanced.Family<UK, any>>
	implements HashMap.Advanced.ContextApi<UK, HashMap.Advanced.Family<UK, any>>
{
	static createDefault<UK>(
		hasher?: Hasher<UK> | undefined,
		eq?: Eq<UK> | undefined,
		blockSizeBits?: number,
		listContext?: List.Context | undefined,
	): HashMapCollectionContext<UK> {
		const result: HashMapCollectionContext<UK> = new HashMapCollectionContext(
			hasher,
			eq,
			blockSizeBits,
			listContext,
			() => result,
		);

		return result;
	}

	constructor(
		readonly _hasher: Hasher<UK> | undefined = undefined,
		readonly _eq: Eq<UK> | undefined = undefined,
		readonly blockSizeBits: number = 5,
		readonly listContext = List.defaultContext,
		readonly getDefaultInstance: () => HashMapCollectionContext<any>,
	) {
		super();

		this.blockCapacity = 1 << blockSizeBits;
		this.blockMask = this.blockCapacity - 1;
		this.maxDepth = Math.ceil(32 / blockSizeBits);
	}

	readonly blockCapacity: number;
	readonly blockMask: number;
	readonly maxDepth: number;

	// get defaultContext(): HashMapCollectionContext<any> {
	// 	return this.getDefaultInstance();
	// }

	#keyedContext: HashMapKeyedContext<UK> | undefined;

	get keyedContext(): HashMapKeyedContext<UK> {
		if (undefined === this.#keyedContext) {
			this.#keyedContext = new HashMapKeyedContext<UK>(this);
		}

		return this.#keyedContext;
	}

	get defaultContext(): HashMap.Context<UK> {
		return this.getDefaultInstance();
	}

	get hasher(): Hasher<UK> {
		return this._hasher ?? Hasher.defaultInstance;
	}

	get eq(): Eq<UK> {
		return this._eq ?? Eq.defaultInstance;
	}

	hash(value: UK): number {
		return this.hasher.hash(value);
	}

	isValidKey(key: unknown): key is UK {
		return this.hasher.isValid(key);
	}

	#emptyBlock: HashMapBlock<UK, any> | undefined;

	emptyBlock<V>(): HashMapBlock<UK, V> {
		if (undefined === this.#emptyBlock) {
			this.#emptyBlock = new HashMapBlock<UK, any>(this, null, null, 0, 0);
		}

		return this.#emptyBlock as HashMapBlock<UK, V>;
	}

	block<K extends UK, V>(
		entries: (readonly [K, V])[] | null,
		entrySets: MapEntrySet<K, V>[] | null,
		size: number,
		level: number,
	): HashMapBlock<K, V> {
		return new HashMapBlock<K, V>(
			this as unknown as HashMapCollectionContext<K>,
			entries,
			entrySets,
			size,
			level,
		);
	}

	collision<K extends UK, V>(
		entries: List.NonEmpty<readonly [K, V]>,
	): HashMapCollision<K, V> {
		return new HashMapCollision<K, V>(
			this as unknown as HashMapCollectionContext<K>,
			entries,
		);
	}

	isHashMapBlock<K, V>(obj: MapEntrySet<K, V>): obj is HashMapBlock<K, V> {
		return obj instanceof HashMapBlock;
	}

	createBuilder<K extends UK, V>(
		source?: HashMap.NonEmpty<K, V>,
	): HashMap.Builder<K, V> {
		return new HashMapBlockBuilder<K, V>(
			this as unknown as HashMapCollectionContext<K>,
			source as unknown as HashMapBlock<K, V>,
		);
	}

	isHashMapBlockBuilder<K, V>(
		obj: MapBlockBuilderEntry<K, V>,
	): obj is HashMapBlockBuilder<K, V> {
		return obj instanceof HashMapBlockBuilder;
	}

	isNonEmptyInstance<E extends readonly [UK, any]>(
		source: unknown,
	): source is HashMap.NonEmpty<E[0], E[1]> {
		return source instanceof HashMapNonEmptyBase;
	}

	getKeyIndex(level: number, hash: number): number {
		const shift = this.blockSizeBits * level;
		return (hash >>> shift) & this.blockMask;
	}

	#empty: HashMap<UK, any> | undefined;

	empty = <E extends readonly [UK, any]>(): HashMap<E[0], E[1]> => {
		if (undefined === this.#empty) {
			this.#empty = new HashMapEmpty<UK, any>(this);
		}

		return this.#empty;
	};

	builder = <E extends readonly [UK, any]>(): HashMap.Builder<E[0], E[1]> => {
		return new HashMapBlockBuilder(this);
	};

	reducer = <E2 extends readonly [UK, any]>(
		source?: StreamSource<E2>,
	): Reducer<E2, HashMap<E2[0], E2[1]>> => {
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
}

export class HashMapKeyedContext<UK>
	extends KeyedCollectionContextBase<UK, any, HashMap.Advanced.Family<any, any>>
	implements
		HashMap.Advanced.KeyedContextApi<UK, HashMap.Advanced.Family<UK, any>>
{
	constructor(readonly context: HashMapCollectionContext<UK>) {
		super(context);
	}

	get defaultContext(): HashMap.Context<any> {
		return this.context.defaultContext;
	}

	createContext = <K>(options: {
		hasher?: Hasher<K> | undefined;
		eq?: Eq<K> | undefined;
		blockSizeBits?: number | undefined;
		listContext?: List.Context | undefined;
	}): HashMap.Context<K> => {
		return new HashMapCollectionContext<K>(
			options.hasher,
			options.eq,
			options.blockSizeBits,
			options.listContext,
			this.context.getDefaultInstance,
		);
	};

	get reducer(): <K, V>(
		source?: StreamSource<readonly [K, V]>,
	) => Reducer<readonly [K, V], HashMap<K, V>> {
		return this.context.reducer as any;
	}

	mergeAllWith = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { fillValue?: any; merge: (key: UK, values: any) => any },
	): HashMap.NonEmpty<UK, any> => {
		const { fillValue = undefined, merge: mergeFun } = options;

		const builder = this.builder<UK, any[]>();

		let i = -1;
		const length = sources.length;

		while (++i < sources.length) {
			let entry: readonly [UK, unknown] | undefined;
			const iter = Stream.from(sources[i])[Symbol.iterator]();

			while (undefined !== (entry = iter.fastNext())) {
				const key = entry[0];
				const value = entry[1];

				const index = i;

				builder.modifyAtKey(key, {
					ifNew: {
						create: (): unknown[] => {
							const row = Array(length).fill(fillValue);
							row[index] = value;
							return row;
						},
					},
					ifExists: {
						update: (row): unknown[] => {
							row[index] = value;
							return row;
						},
					},
				});
			}
		}

		return builder.buildMapValues((values, key) =>
			mergeFun(key, values),
		) as HashMap.NonEmpty<UK, any>;
	};

	mergeAll = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { fillValue?: any } = {},
	): HashMap.NonEmpty<UK, any> => {
		return this.mergeAllWith(sources, {
			fillValue: options.fillValue,
			merge: (_key, values) => values,
		});
	};

	mergeWith = (
		sources: readonly StreamSource<readonly [UK, any]>[],
		options: { merge: (key: UK, values: any) => any },
	): HashMap<UK, any> => {
		if (Stream.from(sources).some(Stream.isEmptyStreamSourceInstance)) {
			return this.empty();
		}

		const { merge: mergeFun } = options;

		const builder = this.builder<UK, unknown[]>();

		let i = -1;
		const length = sources.length;

		while (++i < sources.length) {
			let entry: readonly [UK, unknown] | undefined;
			const iter = Stream.from(sources[i])[Symbol.iterator]();

			while (undefined !== (entry = iter.fastNext())) {
				const key = entry[0];
				const value = entry[1];

				const index = i;

				builder.modifyAtKey(key, {
					ifNew: {
						create: (nothing): unknown[] | typeof nothing => {
							if (index > 0) return nothing;

							const row = [value];
							return row;
						},
					},
					ifExists: {
						update: (row, remove): unknown[] | typeof remove => {
							if (row.length !== index) return remove;
							row.push(value);
							return row;
						},
					},
				});
			}
		}

		// remove all rows that are not full
		const firstSource = sources[0];

		let entry: readonly [UK, unknown] | undefined;
		const iter = Stream.from(firstSource)[Symbol.iterator]();

		while (undefined !== (entry = iter.fastNext())) {
			const key = entry[0];

			builder.modifyAtKey(key, {
				ifExists: {
					update: (row, remove): unknown[] | typeof remove => {
						if (row.length !== length) return remove;
						return row;
					},
				},
			});
		}

		return builder.buildMapValues((row, key) => mergeFun(key, row));
	};

	merge = (
		sources: readonly StreamSource<readonly [UK, any]>[],
	): HashMap<UK, any> => {
		return this.mergeWith(sources, {
			merge: (_key, values) => values,
		});
	};
}
