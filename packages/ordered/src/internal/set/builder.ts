import type { MapCollection } from '@rimbu/collection-types/map';
import type { RelatedTo } from '@rimbu/common';
import type { OrderedSet } from '@rimbu/ordered/set';
import type { SortedMap } from '@rimbu/sorted/map';
import type { StreamSource } from '@rimbu/stream';

import type { OrderedSetContext } from '#ordered/set/context';
import type { OrderedSetNonEmpty } from '#ordered/set/non-empty';

import { CollectionBuilderBase } from '@rimbu/collection-types/advanced/collection-base';
import { Stream } from '@rimbu/stream';

import { Indicator } from '#ordered/common/ordered-indicator';

/**
 * Mutable builder used to efficiently construct new immutable {@link OrderedSet}
 * instances.<br/>
 * <br/>
 * The builder keeps a key map builder holding the element ordering indicator and
 * a sorted indicator map builder holding the elements. `build` wraps the two
 * built maps into an immutable `OrderedSet`.
 *
 * @typeparam T - the element type
 */
export class OrderedSetBuilder<T>
	extends CollectionBuilderBase<T, OrderedSet.Advanced.Family<T>>
	implements OrderedSet.Builder<T>
{
	#source: OrderedSet.NonEmpty<T> | undefined;
	_keyMapBuilder: MapCollection.Builder<T, Indicator> | undefined;
	_indicatorMapBuilder: SortedMap.Builder<Indicator, T> | undefined;

	constructor(
		readonly context: OrderedSetContext<T>,
		source?: OrderedSet.NonEmpty<T>,
	) {
		super();
		this.#source = source;
	}

	#prepareMutate(): void {
		if (
			undefined === this._keyMapBuilder ||
			undefined === this._indicatorMapBuilder
		) {
			if (undefined !== this.#source) {
				const source = this.#source as unknown as OrderedSetNonEmpty<T>;
				this._keyMapBuilder =
					source.keyIndicatorMap.toBuilder() as unknown as MapCollection.Builder<
						T,
						Indicator
					>;
				this._indicatorMapBuilder =
					source.indicatorKeyMap.toBuilder() as unknown as SortedMap.Builder<
						Indicator,
						T
					>;
			} else {
				this._keyMapBuilder = this.context.keyMapContext.keyedContext.builder<
					T,
					Indicator
				>() as unknown as MapCollection.Builder<T, Indicator>;
				this._indicatorMapBuilder =
					this.context.indicatorMapContext.keyedContext.builder<
						Indicator,
						T
					>() as unknown as SortedMap.Builder<Indicator, T>;
			}
		}
	}

	get keyMapBuilder(): MapCollection.Builder<T, Indicator> {
		this.#prepareMutate();
		return this._keyMapBuilder!;
	}

	get indicatorMapBuilder(): SortedMap.Builder<Indicator, T> {
		this.#prepareMutate();
		return this._indicatorMapBuilder!;
	}

	get size(): number {
		if (undefined !== this.#source) return this.#source.size;
		if (undefined === this._keyMapBuilder) return 0;
		return this._keyMapBuilder.size;
	}

	has = <U = T>(value: RelatedTo<T, U>): boolean => {
		if (undefined !== this.#source) return this.#source.has(value);
		return this.keyMapBuilder.has(value);
	};

	#nextIndicator(): Indicator {
		const last = this.indicatorMapBuilder.max();
		if (undefined === last) return Indicator.INIT_INDICATOR;
		return Indicator.after(last[0]);
	}

	add = (value: T): boolean => {
		this.checkLock();

		let appendedIndicator: Indicator | undefined;

		const changed = this.keyMapBuilder.modifyAtKey(value, {
			ifNew: {
				create: () => {
					appendedIndicator = this.#nextIndicator();
					return appendedIndicator;
				},
			},
		});

		if (!changed) return false;

		this.#source = undefined;
		this.indicatorMapBuilder.set(appendedIndicator!, value);

		return true;
	};

	addAll = (elements: StreamSource<T>): boolean => {
		this.checkLock();

		let changed = false;
		const iter = Stream.from(elements)[Symbol.iterator]();
		const done = Symbol();
		let element: T | typeof done;

		while (done !== (element = iter.fastNext(done))) {
			if (this.add(element)) changed = true;
		}

		return changed;
	};

	remove = <U = T>(value: RelatedTo<T, U>): boolean => {
		this.checkLock();

		const indicator = this.keyMapBuilder.get(value as T);
		if (undefined === indicator) return false;

		this.#source = undefined;
		this.keyMapBuilder.removeKey(value as T);
		this.indicatorMapBuilder.removeKey(indicator);

		return true;
	};

	removeAll = <U = T>(elements: StreamSource<RelatedTo<T, U>>): boolean => {
		this.checkLock();

		let changed = false;
		const iter = Stream.from(elements)[Symbol.iterator]();
		const done = Symbol();
		let element: RelatedTo<T, U> | typeof done;

		while (done !== (element = iter.fastNext(done))) {
			if (this.remove(element)) changed = true;
		}

		return changed;
	};

	forEach = (f: (element: T) => void): void => {
		this.startIteration();

		try {
			if (undefined !== this.#source) {
				this.#source.forEach(f);
				return;
			}

			this.indicatorMapBuilder.forEach(([, value]) => {
				f(value);
			});
		} finally {
			this.endIteration();
		}
	};

	build = (): OrderedSet<T> => {
		if (undefined !== this.#source) return this.#source;
		if (this.size === 0) return this.context.empty();

		return this.context.createNonEmpty<T>(
			this.keyMapBuilder.build().assumeNonEmpty(),
			this.indicatorMapBuilder.build().assumeNonEmpty(),
		);
	};

	clear = (): void => {
		this.checkLock();
		this.#source = undefined;
		this._keyMapBuilder = undefined;
		this._indicatorMapBuilder = undefined;
	};
}
