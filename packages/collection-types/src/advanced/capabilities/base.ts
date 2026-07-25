import type {
	Collection,
	IndexedCollection,
	IndexedKeyedCollection,
	IndexedValuedCollection,
	KeyedCollection,
	ValuedCollection,
} from '@rimbu/collection-types/capabilities';
import type { FastIterator } from '@rimbu/stream/stream-types';

import {
	EmptyCollectionAssumedNonEmptyError,
	throwModifiedBuilderWhileLoopingOverItError,
} from '@rimbu/base';
import {
	type ArrayNonEmpty,
	type IndexRange,
	OptLazy,
	TraverseState,
} from '@rimbu/common';
import { Stream } from '@rimbu/stream';

export abstract class CollectionEmptyBase<T>
	implements Collection<T>, Collection.WithFilter<T>
{
	declare context: {
		__types: Collection.Types<T>;
	};

	[Symbol.iterator](): FastIterator<T> {
		return Stream.empty<T>()[Symbol.iterator]();
	}

	get isEmpty(): true {
		return true;
	}

	get size(): 0 {
		return 0;
	}

	nonEmpty(): this is this['context']['__types']['_NON_EMPTY'] {
		return false;
	}

	assumeNonEmpty(): never {
		throw new EmptyCollectionAssumedNonEmptyError();
	}

	stream(): Stream<T> {
		return Stream.empty<T>();
	}

	forEach(): void {}

	forEachIndexed(): void {}

	filter(): this['context']['__types']['_NORMAL'] {
		return this;
	}

	filterIndexed(): this['context']['__types']['_NORMAL'] {
		return this;
	}

	toArray(): [] {
		return [];
	}
}

export abstract class CollectionNonEmptyBase<T>
	implements Collection.NonEmpty<T>
{
	declare context: {
		__types: Collection.Types.NonEmpty<T>;
	};

	abstract get size(): number;
	abstract stream(): Stream.NonEmpty<T>;
	abstract forEach(f: (value: T) => void): void;
	abstract toArray(): ArrayNonEmpty<T>;

	[Symbol.iterator](): FastIterator<T> {
		return this.stream()[Symbol.iterator]();
	}

	get isEmpty(): false {
		return false;
	}

	nonEmpty(): this is this['context']['__types']['_NON_EMPTY'] {
		return true;
	}

	assumeNonEmpty(): this['context']['__types']['_NON_EMPTY'] {
		return this;
	}

	asNormal(): this['context']['__types']['_NORMAL'] {
		return this;
	}

	forEachIndexed(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		const haltSymbol = Symbol();

		try {
			this.forEach((value) => {
				f(value, state.nextIndex(), state.halt);

				if (state.halted) {
					throw haltSymbol;
				}
			});
		} catch (err) {
			if (haltSymbol !== err) {
				throw err;
			}
		}
	}
}

export abstract class CollectionBuilderBase<T>
	implements Collection.Builder<T>
{
	declare context: {
		__types: Collection.Types<T>;
	};

	abstract get size(): number;
	abstract clear(): void;
	abstract forEach(f: (value: T) => void): void;
	abstract build(): this['context']['__types']['_NORMAL'];

	#iterationDepth = 0;

	checkLock(): void {
		if (this.#iterationDepth) {
			throwModifiedBuilderWhileLoopingOverItError();
		}
	}

	startIteration(): void {
		this.#iterationDepth++;
	}

	endIteration(): void {
		this.#iterationDepth--;
	}

	get isEmpty(): boolean {
		return 0 === this.size;
	}

	forEachIndexed(
		f: (value: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		const haltSymbol = Symbol();

		try {
			this.forEach((value) => {
				f(value, state.nextIndex(), state.halt);

				if (state.halted) {
					throw haltSymbol;
				}
			});
		} catch (err) {
			if (haltSymbol !== err) {
				throw err;
			}
		}
	}
}

export abstract class IndexedCollectionEmptyBase<T>
	extends CollectionEmptyBase<T>
	implements
		IndexedCollection<T>,
		IndexedCollection.WithMap<T>,
		IndexedCollection.WithMoveTo<unknown, T>,
		IndexedCollection.WithRemoveAt<T>,
		IndexedCollection.WithSwapAt<T>
{
	declare context: { __types: IndexedCollection.Types<T> };

	streamSlice(): Stream<T> {
		return Stream.empty<T>();
	}

	at<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	first<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	last<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	take(): this['context']['__types']['_NORMAL'] {
		return this;
	}

	drop(): this['context']['__types']['_NORMAL'] {
		return this;
	}

	slice(): this['context']['__types']['_NORMAL'] {
		return this;
	}

	map<T2>(): (this['context']['__types'] & {
		_NEW_E: T2;
	})['_NEW_TYPES']['_NORMAL'] {
		return this;
	}

	mapIndexed<T2>(): (this['context']['__types'] & {
		_NEW_E: T2;
	})['_NEW_TYPES']['_NORMAL'] {
		return this;
	}

	moveTo(): this['context']['__types']['_NORMAL'] {
		return this;
	}

	removeAt(): this['context']['__types']['_NORMAL'] {
		return this;
	}

	swapAt(): this['context']['__types']['_NORMAL'] {
		return this;
	}
}

export abstract class IndexedCollectionNonEmptyBase<T>
	extends CollectionNonEmptyBase<T>
	implements IndexedCollection.NonEmpty<T>
{
	declare context: { __types: IndexedCollection.Types.NonEmpty<T> };

	abstract streamSlice(
		range: IndexRange,
		options?: { reversed?: boolean },
	): Stream<T>;
	abstract at<O>(index: number, otherwise?: OptLazy<O>): T | O;
	abstract first<O>(otherwise?: OptLazy<O>): T | O;
	abstract last<O>(otherwise?: OptLazy<O>): T | O;

	abstract take(count: number): this['context']['__types']['_NORMAL'];
	abstract drop(count: number): this['context']['__types']['_NORMAL'];
	abstract slice(range: IndexRange): this['context']['__types']['_NORMAL'];
}

export abstract class ValuedCollectionEmptyBase<T>
	extends CollectionEmptyBase<T>
	implements ValuedCollection<T>
{
	declare context: { __types: ValuedCollection.Types<T> };

	has(): false {
		return false;
	}
}

export abstract class ValuedCollectionNonEmptyBase<T>
	extends CollectionNonEmptyBase<T>
	implements ValuedCollection.NonEmpty<T>
{
	declare context: { __types: ValuedCollection.Types.NonEmpty<T> };

	abstract has(value: T): boolean;
}

export abstract class KeyedCollectionEmptyBase<K, V>
	extends CollectionEmptyBase<readonly [K, V]>
	implements KeyedCollection<K, V>, KeyedCollection.WithMap<K, V>
{
	declare context: { __types: KeyedCollection.Types<K, V> };

	get<O>(_: K, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	has(): false {
		return false;
	}

	streamKeys(): Stream<K> {
		return Stream.empty<K>();
	}

	streamValues(): Stream<V> {
		return Stream.empty<V>();
	}

	map<T2>(): (this['context']['__types'] & { _NEW_E: T2 })['_NORMAL'] {
		return this;
	}

	mapIndexed<T2>(): (this['context']['__types'] & { _NEW_E: T2 })['_NORMAL'] {
		return this;
	}
}

function first<T>(tuple: readonly [T, unknown]): T {
	return tuple[0];
}

function second<T>(tuple: readonly [unknown, T]): T {
	return tuple[1];
}

export abstract class KeyedCollectionNonEmptyBase<K, V>
	extends CollectionNonEmptyBase<readonly [K, V]>
	implements KeyedCollection.NonEmpty<K, V>
{
	declare context: { __types: KeyedCollection.Types.NonEmpty<K, V> };

	abstract get<UK, O>(key: UK, otherwise?: OptLazy<O>): O | V;

	has(key: K): boolean {
		const none = Symbol();
		return none !== this.get(key, none);
	}

	streamKeys(): Stream.NonEmpty<K> {
		return this.stream().map(first);
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.stream().map(second);
	}
}

export abstract class IndexedValuedCollectionEmptyBase<T>
	extends IndexedCollectionEmptyBase<T>
	implements IndexedValuedCollection<T>
{
	declare context: { __types: IndexedValuedCollection.Types<T> };

	has(): false {
		return false;
	}

	indexOf<O>(_: T, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}
}

export abstract class IndexedValuedCollectionNonEmptyBase<T>
	extends IndexedCollectionNonEmptyBase<T>
	implements IndexedValuedCollection.NonEmpty<T>
{
	declare context: { __types: IndexedValuedCollection.Types.NonEmpty<T> };

	abstract has(value: T): boolean;
	abstract indexOf<O>(value: T, otherwise?: OptLazy<O>): number | O;
}

export abstract class IndexedKeyedCollectionEmptyBase<K, V>
	extends IndexedCollectionEmptyBase<readonly [K, V]>
	implements IndexedKeyedCollection<K, V>
{
	declare context: { __types: IndexedKeyedCollection.Types<K, V> };

	get<O>(_: K, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	has(): false {
		return false;
	}

	indexOf<O>(_: K, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	streamKeys(): Stream<K> {
		return Stream.empty<K>();
	}

	streamValues(): Stream<V> {
		return Stream.empty<V>();
	}
}

export abstract class IndexedKeyedCollectionNonEmptyBase<K, V>
	extends IndexedCollectionNonEmptyBase<readonly [K, V]>
	implements IndexedKeyedCollection.NonEmpty<K, V>
{
	declare context: { __types: IndexedKeyedCollection.Types.NonEmpty<K, V> };

	abstract get<UK, O>(key: UK, otherwise?: OptLazy<O>): O | V;

	has(key: K): boolean {
		const none = Symbol();
		return none !== this.get(key, none);
	}

	abstract indexOf<UK, O>(key: UK, otherwise?: OptLazy<O>): number | O;

	streamKeys(): Stream.NonEmpty<K> {
		return this.stream().map(first);
	}

	streamValues(): Stream.NonEmpty<V> {
		return this.stream().map(second);
	}
}
