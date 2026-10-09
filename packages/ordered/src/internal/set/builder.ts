import type { MapCollection } from '@rimbu/collection-types/map';
import type { OptLazy, RelatedTo } from '@rimbu/common';
import type { OrderedBulkOptions } from '@rimbu/ordered/map';
import type { OrderedSet } from '@rimbu/ordered/set';
import type { SortedMap } from '@rimbu/sorted/map';
import type { StreamSource } from '@rimbu/stream';

import type { OrderedSetContext } from '#ordered/set/context';
import type { OrderedSetNonEmpty } from '#ordered/set/non-empty';

import { CollectionBuilderBase } from '@rimbu/collection-types/advanced/collection-base';
import { OptLazy as OptLazyValue } from '@rimbu/common/opt-lazy';
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

	#resetFrom(set: OrderedSet<T>): void {
		this._keyMapBuilder = undefined;
		this._indicatorMapBuilder = undefined;

		this.#source = set.nonEmpty()
			? (set as unknown as OrderedSetNonEmpty<T>)
			: undefined;
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		return this.build().at(index, otherwise as any) as T | O;
	}

	first<O>(otherwise?: OptLazy<O>): T | O {
		return this.at(0, otherwise as any);
	}

	last<O>(otherwise?: OptLazy<O>): T | O {
		return this.at(-1, otherwise as any);
	}

	indexOf<U = T>(element: RelatedTo<T, U>): number | undefined;
	indexOf<U, O>(element: RelatedTo<T, U>, otherwise: OptLazy<O>): number | O;
	indexOf<U, O>(
		element: RelatedTo<T, U>,
		otherwise?: OptLazy<O>,
	): number | O | undefined {
		return this.build().indexOf(element as T, otherwise as any);
	}

	prepend = (element: T): void => {
		this.checkLock();
		this.#resetFrom(this.build().prepend(element));
	};

	append = (element: T): void => {
		this.checkLock();
		this.#resetFrom(this.build().append(element));
	};

	prependEach = (elements: StreamSource<T>): void => {
		this.checkLock();

		const items = Stream.from(elements).toArray();
		if (items.length === 0) return;

		let current = this.build();
		for (let i = items.length - 1; i >= 0; i--) {
			current = current.prepend(items[i]);
		}

		this.#resetFrom(current);
	};

	appendEach = (elements: StreamSource<T>): void => {
		this.checkLock();

		let current = this.build();
		let changed = false;

		for (const element of Stream.from(elements)) {
			current = current.append(element);
			changed = true;
		}

		if (changed) this.#resetFrom(current);
	};

	placeAt = (index: number, element: T): void => {
		this.checkLock();
		this.#resetFrom(this.build().placeAt(index, element));
	};

	moveTo = (index: number, element: T): boolean => {
		this.checkLock();

		const current = this.build();
		const next = current.moveTo(index, element);
		if (next === current) return false;

		this.#resetFrom(next);

		return true;
	};

	swapAt = (index1: number, index2: number): boolean => {
		this.checkLock();

		const current = this.build();
		const next = current.swapAt(index1, index2);
		if (next === current) return false;

		this.#resetFrom(next);

		return true;
	};

	removeAt = (index: number, otherwise?: any): any => {
		this.checkLock();

		const current = this.build();
		if (index < 0) index = current.size + index;
		const element = current.at(index);
		if (undefined === element) return OptLazyValue(otherwise);

		this.#resetFrom(current.removeAt(index));

		return element;
	};

	removeAmountAt = (index: number, amount: number, collector?: any): any => {
		this.checkLock();

		const current = this.build();
		const next = current.removeAt(index, amount);
		if (next === current) {
			return collector === undefined
				? false
				: Stream.empty<T>().reduce(collector);
		}

		if (collector !== undefined) {
			const collected = current
				.slice({ start: index, amount })
				.stream()
				.reduce(collector);
			this.#resetFrom(next);
			return collected;
		}

		this.#resetFrom(next);

		return true;
	};

	removeAllAt = (indices: StreamSource<number>, collector?: any): any => {
		this.checkLock();

		const current = this.build();
		const sorted = Stream.from(indices)
			.toArray()
			.slice()
			.sort((a: number, b: number) => b - a);

		let next = current;
		let changed = false;
		const collected: T[] = [];

		for (const index of sorted) {
			const element = next.at(index);
			if (undefined === element) continue;
			collected.push(element);
			next = next.removeAt(index);
			changed = true;
		}

		if (!changed) {
			return collector === undefined
				? false
				: Stream.empty<T>().reduce(collector);
		}

		this.#resetFrom(next);

		if (collector !== undefined) {
			return Stream.from(collected).reduce(collector);
		}

		return true;
	};

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

	addEach = (
		elements: StreamSource<T>,
		options?: OrderedBulkOptions,
	): boolean => {
		this.checkLock();

		const position = options?.position ?? 'preserve';

		if (position !== 'preserve') {
			const current = this.build();
			const next = current.addEach(elements, options);
			if (next === current) return false;

			this.#resetFrom(next);

			return true;
		}

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

	removeEach = <U = T>(elements: StreamSource<RelatedTo<T, U>>): boolean => {
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
