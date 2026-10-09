import type { MapCollection } from '@rimbu/collection-types/map';
import type { Op } from '@rimbu/collection-types/types';
import type {
	ArrayNonEmpty,
	IndexRange,
	OptLazy,
	RelatedTo,
} from '@rimbu/common';
import type { OrderedBulkOptions } from '@rimbu/ordered/map';
import type { OrderedSet } from '@rimbu/ordered/set';
import type { SortedMap } from '@rimbu/sorted/map';

import type { OrderedSetContext } from '#ordered/set/context';

import { IndexedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/indexed-base';
import { ValuedCollectionNonEmpty } from '@rimbu/collection-types/advanced/collection/valued-base';
import { CollectionNonEmpty } from '@rimbu/collection-types/advanced/collection-base';
import { SetCollectionNonEmpty } from '@rimbu/collection-types/advanced/set-base';
import { OptLazy as OptLazyValue } from '@rimbu/common/opt-lazy';
import { Stream, type StreamSource } from '@rimbu/stream';

import { Indicator } from '#ordered/common/ordered-indicator';

const NonEmptyBase = SetCollectionNonEmpty.WithMixin(
	IndexedCollectionNonEmpty.WithMixin(
		ValuedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor),
	),
);

/**
 * Concrete non-empty implementation of {@link OrderedSet.NonEmpty}.<br/>
 * <br/>
 * Elements are stored in a key map holding their ordering indicator and a
 * sorted indicator map holding the elements. The sorted map defines the
 * insertion order and is the source of iteration. Adding an element that is
 * already present does not change its position.
 *
 * @typeparam T - the element type
 */
export class OrderedSetNonEmpty<T>
	extends NonEmptyBase<T, OrderedSet.Advanced.Family<T>>
	implements OrderedSet.NonEmpty<T>
{
	constructor(
		readonly context: OrderedSetContext<T>,
		readonly keyIndicatorMap: MapCollection.NonEmpty<T, Indicator>,
		readonly indicatorKeyMap: SortedMap.NonEmpty<Indicator, T>,
	) {
		super(context);
	}

	copy(
		keyIndicatorMap = this.keyIndicatorMap,
		indicatorKeyMap = this.indicatorKeyMap,
	): OrderedSet.NonEmpty<T> {
		if (
			keyIndicatorMap === this.keyIndicatorMap &&
			indicatorKeyMap === this.indicatorKeyMap
		) {
			return this;
		}

		return this.context.createNonEmpty<T>(keyIndicatorMap, indicatorKeyMap);
	}

	get size(): number {
		return this.keyIndicatorMap.size;
	}

	#nextIndicator(): Indicator {
		return Indicator.after(this.indicatorKeyMap.max()[0]);
	}

	stream(): Stream.NonEmpty<T> {
		return this.indicatorKeyMap.streamValues();
	}

	has = <U = T>(value: RelatedTo<T, U>): boolean => {
		return this.keyIndicatorMap.has(value);
	};

	add(value: T): OrderedSet.NonEmpty<T> {
		let appendedIndicator: Indicator | undefined;

		const newKeyIndicatorMap = this.keyIndicatorMap.modifyAtKey(value, {
			ifNew: {
				create: () => {
					appendedIndicator = this.#nextIndicator();
					return appendedIndicator;
				},
			},
		});

		if (undefined === appendedIndicator) return this;

		const newIndicatorKeyMap = this.indicatorKeyMap.set(
			appendedIndicator,
			value,
		);

		return this.copy(newKeyIndicatorMap.assumeNonEmpty(), newIndicatorKeyMap);
	}

	addEach(
		elements: StreamSource.NonEmpty<T>,
		options?: OrderedBulkOptions,
	): OrderedSet.NonEmpty<T>;
	addEach(
		elements: StreamSource<T>,
		options?: OrderedBulkOptions,
	): OrderedSet<T>;
	addEach(
		elements: StreamSource<T>,
		options?: OrderedBulkOptions,
	): OrderedSet<T> {
		const position = options?.position ?? 'preserve';
		const list = Stream.from(elements).toArray();
		if (list.length === 0) return this;

		if (position === 'preserve') {
			return super.addEach(list) as OrderedSet<T>;
		}

		const dedupe = this.context.keyMapContext.keyedContext.builder<
			T,
			boolean
		>();
		const token = Symbol();
		const order: T[] = [];

		for (const element of list) {
			if (token === dedupe.get(element, token)) order.push(element);
			dedupe.set(element, true);
		}

		const rest = this.toArray().filter((element) => !dedupe.has(element));
		const final =
			position === 'append' ? [...rest, ...order] : [...order, ...rest];

		if (this.#sameEntries(this.toArray(), final)) return this;

		return this.#rebuild(final) as OrderedSet<T>;
	}

	remove<U = T>(value: RelatedTo<T, U>): OrderedSet<T> {
		const result = this.keyIndicatorMap.removeKeyAndReturn(value);

		if (!result.hasResult) return this;

		const removedIndicator = result.result;
		const newKeyIndicatorMap = result.collection;

		if (!newKeyIndicatorMap.nonEmpty()) return this.context.empty();

		const newIndicatorKeyMap = this.indicatorKeyMap
			.removeKey(removedIndicator)
			.assumeNonEmpty();

		return this.copy(newKeyIndicatorMap, newIndicatorKeyMap);
	}

	filter(
		pred: (element: T) => boolean,
		options: { negate?: boolean | undefined } = {},
	): OrderedSet<T> {
		const builder = this.context.builder<T>();

		builder.addEach(this.stream().filter(pred, options));

		if (builder.size === this.size) return this;

		return builder.build();
	}

	map<E2 extends T>(f: (element: T) => E2): OrderedSet.NonEmpty<E2> {
		const builder = this.context.builder<E2>();

		this.forEach((element) => {
			builder.add(f(element));
		});

		return builder.build().assumeNonEmpty();
	}

	#fromIndicatorMap(indicatorKeyMap: SortedMap<Indicator, T>): OrderedSet<T> {
		if (indicatorKeyMap.isEmpty) return this.context.empty<T>();

		const keyIndicatorMap = this.context.keyMapContext.from(
			indicatorKeyMap
				.stream()
				.map(([indicator, element]) => [element, indicator] as const),
		);

		return this.context.createNonEmpty(
			keyIndicatorMap.assumeNonEmpty() as MapCollection.NonEmpty<T, Indicator>,
			indicatorKeyMap.assumeNonEmpty(),
		);
	}

	#indexOfElement(element: T): number {
		const indicator = this.keyIndicatorMap.get(element);
		if (undefined === indicator) return -1;

		return this.indicatorKeyMap.indexOf(indicator) ?? -1;
	}

	#rebuild(entries: readonly T[]): OrderedSet<T> {
		if (entries.length === 0) return this.context.empty<T>();

		return this.context.from(
			entries as ArrayNonEmpty<T>,
		) as unknown as OrderedSet<T>;
	}

	#sameEntries(one: readonly T[], other: readonly T[]): boolean {
		if (one.length !== other.length) return false;

		for (let i = 0; i < one.length; i++) {
			if (!Object.is(one[i], other[i])) return false;
		}

		return true;
	}

	#normalizeIndex(index: number, finalSize: number): number {
		let dest = Math.trunc(index);
		if (dest < 0) dest = finalSize + dest;
		if (dest < 0) dest = 0;
		if (dest > finalSize - 1) dest = finalSize - 1;

		return dest;
	}

	indexOf<U = T>(element: RelatedTo<T, U>): number | undefined;
	indexOf<U, O>(element: RelatedTo<T, U>, otherwise: OptLazy<O>): number | O;
	indexOf<U, O>(
		element: RelatedTo<T, U>,
		otherwise?: OptLazy<O>,
	): number | O | undefined {
		const indicator = this.keyIndicatorMap.get(element as T);
		if (undefined === indicator) return OptLazyValue(otherwise) as O;

		return (
			this.indicatorKeyMap.indexOf(indicator) ?? (OptLazyValue(otherwise) as O)
		);
	}

	at<O>(index: number, otherwise?: OptLazy<O>): T | O {
		const entry = this.indicatorKeyMap.at(index);

		return undefined === entry ? (OptLazyValue(otherwise) as O) : entry[1];
	}

	streamSlice(
		range: IndexRange,
		options?: { reversed?: boolean | undefined },
	): Stream<T> {
		return this.indicatorKeyMap
			.streamSlice(range, options)
			.map(([, element]) => element);
	}

	take(amount: number): OrderedSet<T> | any {
		return this.#fromIndicatorMap(this.indicatorKeyMap.take(amount));
	}

	drop(amount: number): OrderedSet<T> {
		return this.#fromIndicatorMap(this.indicatorKeyMap.drop(amount));
	}

	slice(range: IndexRange): OrderedSet<T> {
		return this.#fromIndicatorMap(this.indicatorKeyMap.slice(range));
	}

	splitAt(amount: number): any {
		return [this.take(amount), this.drop(amount)];
	}

	prepend(element: T): OrderedSet.NonEmpty<T> {
		return this.placeAt(0, element);
	}

	append(element: T): OrderedSet.NonEmpty<T> {
		return this.placeAt(-1, element);
	}

	placeAt(index: number, element: T): OrderedSet.NonEmpty<T> {
		const entries = this.toArray().slice() as T[];
		const existing = this.#indexOfElement(element);
		if (existing >= 0) entries.splice(existing, 1);

		const finalSize = entries.length + 1;
		entries.splice(this.#normalizeIndex(index, finalSize), 0, element);

		if (this.#sameEntries(this.toArray(), entries)) return this;

		return this.#rebuild(entries).assumeNonEmpty();
	}

	moveTo(index: number, element: T): OrderedSet.NonEmpty<T> {
		const existing = this.#indexOfElement(element);
		if (existing < 0) return this;

		const entries = this.toArray().slice() as T[];
		const [removed] = entries.splice(existing, 1);
		const finalSize = entries.length + 1;
		entries.splice(this.#normalizeIndex(index, finalSize), 0, removed);

		if (this.#sameEntries(this.toArray(), entries)) return this;

		return this.#rebuild(entries).assumeNonEmpty();
	}

	removeAt(index: number, amount?: number | undefined): OrderedSet<T> {
		const size = this.size;
		let at = Math.trunc(index);
		if (at < 0) at = size + at;
		if (at < 0 || at >= size) return this;

		const amt = amount === undefined ? 1 : Math.trunc(amount);
		if (amt <= 0) return this;

		const count = Math.min(amt, size - at);
		const removedIndicators: Indicator[] = [];
		const removedElements: T[] = [];

		for (let i = 0; i < count; i++) {
			const entry = this.indicatorKeyMap.at(at + i);
			if (undefined === entry) break;
			removedIndicators.push(entry[0]);
			removedElements.push(entry[1]);
		}

		if (removedIndicators.length === 0) return this;

		const indicatorKeyMap = this.indicatorKeyMap.removeKeys(removedIndicators);
		if (!indicatorKeyMap.nonEmpty()) return this.context.empty();

		const keyIndicatorMap = this.keyIndicatorMap.removeKeys(removedElements);

		return this.context.createNonEmpty(
			keyIndicatorMap.assumeNonEmpty(),
			indicatorKeyMap.assumeNonEmpty(),
		);
	}

	removeAtAndReturn(
		index: number,
		amount?: number | undefined,
	): Op.DynamicResult<
		OrderedSet.NonEmpty<T>,
		OrderedSet<T>,
		OrderedSet.NonEmpty<T>,
		OrderedSet<T>
	> {
		const removed = this.slice({ start: index, amount: amount ?? 1 });

		if (!removed.nonEmpty()) {
			return {
				collection: this,
				hasResult: false,
				result: removed,
				hasChanged: false,
			};
		}

		const next = this.removeAt(index, amount);

		return {
			collection: next,
			hasResult: true,
			result: removed.assumeNonEmpty(),
			hasChanged: next !== this,
		};
	}

	swapAt(index1: number, index2: number): OrderedSet.NonEmpty<T> {
		const size = this.size;
		let one = Math.trunc(index1);
		let other = Math.trunc(index2);
		if (one < 0) one = size + one;
		if (other < 0) other = size + other;
		if (one < 0 || one >= size || other < 0 || other >= size) return this;
		if (one === other) return this;

		const entries = this.toArray().slice() as T[];
		[entries[one], entries[other]] = [entries[other], entries[one]];

		return this.#rebuild(entries).assumeNonEmpty();
	}

	swapAtAndReturn(
		index1: number,
		index2: number,
	): Op.DynamicResult<
		OrderedSet.NonEmpty<T>,
		[previous1: undefined, previous2: undefined],
		[previous1: T, previous2: T],
		OrderedSet.NonEmpty<T>
	> {
		const size = this.size;
		let one = Math.trunc(index1);
		let other = Math.trunc(index2);
		if (one < 0) one = size + one;
		if (other < 0) other = size + other;

		if (one < 0 || one >= size || other < 0 || other >= size) {
			return {
				collection: this,
				hasResult: false,
				result: [undefined, undefined],
				hasChanged: false,
			};
		}

		const first = this.indicatorKeyMap.at(one)?.[1];
		const second = this.indicatorKeyMap.at(other)?.[1];
		if (first === undefined || second === undefined) {
			return {
				collection: this,
				hasResult: false,
				result: [undefined, undefined],
				hasChanged: false,
			};
		}

		const collection = this.swapAt(index1, index2);

		return {
			collection,
			hasResult: true,
			result: [first, second],
			hasChanged: collection !== this,
		};
	}

	forEach(f: (element: T) => void): void {
		this.indicatorKeyMap.forEach(([, value]) => {
			f(value);
		});
	}

	toArray(): ArrayNonEmpty<T> {
		return this.stream().toArray();
	}

	toBuilder(): OrderedSet.Builder<T> {
		return this.context.createBuilder<T>(this);
	}

	toString(): string {
		return this.stream().join({ start: 'OrderedSet(', sep: ', ', end: ')' });
	}
}
