import type { Collection } from '@rimbu/collection-types/collection';
import type { TypesKey } from '@rimbu/collection-types/types';
import type { FastIterator } from '@rimbu/stream/stream-types';

import {
	EmptyCollectionAssumedNonEmptyError,
	Int,
	throwModifiedBuilderWhileLoopingOverItError,
} from '@rimbu/base';
import { type ArrayNonEmpty, TraverseState } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

export abstract class CollectionEmptyBase<T>
	implements
		Collection<T>,
		Collection.Capability.WithCollect.API<T>,
		Collection.Capability.WithConcat.API<T>,
		Collection.Capability.WithFilter.API<T>,
		Collection.Capability.WithMap.API<T>,
		Collection.Capability.WithMutate.API<T>,
		Collection.Capability.WithRecompose.API<T>
{
	declare readonly [TypesKey]: Collection.Advanced.Types<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		Collection.Advanced.Types<T>
	>;

	[Symbol.iterator](): FastIterator<T> {
		return Stream.empty<T>()[Symbol.iterator]();
	}

	get isEmpty(): true {
		return true;
	}

	get size(): 0 {
		return 0;
	}

	nonEmpty(): this is this[TypesKey]['_NON_EMPTY'] {
		return false;
	}

	assumeNonEmpty(): never {
		throw new EmptyCollectionAssumedNonEmptyError();
	}

	concat(
		...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
	): this[TypesKey]['_NON_EMPTY'];
	concat(
		...sources: ArrayNonEmpty<StreamSource<T>>
	): this[TypesKey]['_NORMAL'] {
		return this.context.from(...sources) as this[TypesKey]['_NON_EMPTY'];
	}

	flatMap(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	stream(): Stream<T> {
		return Stream.empty<T>();
	}

	forEach(): void {}

	forEachIndexed(): void {}

	filter(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	collect<E2>(): (this[TypesKey] & {
		_NEW_E: E2;
	})['_NEW_TYPES']['_NORMAL'] {
		return this;
	}

	recompose<E2>(
		f: (stream: Stream<T>) => StreamSource<E2>,
	): Collection.Advanced.Retyped<this[TypesKey], E2>['_NORMAL'] {
		return this.context.from(f(Stream.empty()));
	}

	mutate(
		f: (builder: this[TypesKey]['_BUILDER']) => void,
	): this[TypesKey]['_NORMAL'] {
		const builder = this.context.builder<T>();
		f(builder);
		return builder.build();
	}

	map<T2>(): (this[TypesKey] & {
		_NEW_E: T2;
	})['_NEW_TYPES']['_NORMAL'] {
		return this;
	}

	toArray(): [] {
		return [];
	}

	toBuilder(): this[TypesKey]['_BUILDER'] {
		return this.context.builder();
	}
}

export abstract class CollectionNonEmptyBase<T>
	implements
		Collection.NonEmpty<T>,
		Collection.Capability.WithMutate.API<T>,
		Collection.Capability.WithRecompose.API<T>
{
	declare readonly [TypesKey]: Collection.Advanced.TypesNonEmpty<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		Collection.Advanced.TypesNonEmpty<T>
	>;

	abstract get size(): number;
	abstract stream(): Stream.NonEmpty<T>;
	abstract forEach(f: (value: T) => void): void;
	abstract toArray(): ArrayNonEmpty<T>;
	abstract toBuilder(): this[TypesKey]['_BUILDER'];

	[Symbol.iterator](): FastIterator<T> {
		return this.stream()[Symbol.iterator]();
	}

	get isEmpty(): false {
		return false;
	}

	nonEmpty(): this is this[TypesKey]['_NON_EMPTY'] {
		return true;
	}

	assumeNonEmpty(): this[TypesKey]['_NON_EMPTY'] {
		return this;
	}

	asNormal(): this[TypesKey]['_NORMAL'] {
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

	recompose<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (stream: Stream.NonEmpty<T>) => StreamSource.NonEmpty<T2>,
	): Collection.Advanced.Retyped<this[TypesKey], T2>['_NON_EMPTY'];
	recompose<T2 extends this[TypesKey]['_UPPER_E']>(
		f: (stream: Stream.NonEmpty<T>) => StreamSource<T2>,
	): Collection.Advanced.Retyped<this[TypesKey], T2>['_NON_EMPTY'] {
		return this.context.from(f(this.stream())) as any;
	}

	mutate(
		f: (builder: this[TypesKey]['_BUILDER']) => void,
	): this[TypesKey]['_NORMAL'] {
		const builder = this.toBuilder();
		f(builder);
		return builder.build();
	}
}

export abstract class CollectionBuilderBase<T>
	implements Collection.Builder<T>
{
	declare readonly [TypesKey]: Collection.Advanced.Types<T>;

	abstract readonly context: Collection.Advanced.ContextBase<
		Collection.Advanced.Types<T>
	>;

	abstract get size(): number;
	abstract clear(): void;
	abstract forEach(f: (value: T) => void): void;
	abstract build(): this[TypesKey]['_NORMAL'];

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

/**
 * A collection whose *whole family* carries the `concat` capability: both the
 * possibly-empty and non-empty kinds, and every re-typed result.
 *
 * A capability bundle is structurally just another package — it declares one
 * family and derives both type records from it. Because `_NORMAL`,
 * `_NON_EMPTY` and `_NEW_FAMILY` all point back at this bundle, `concat`
 * self-propagates: the result of `concat` can be concatenated again, and so
 * can the result of re-typing via `map`/`collect`/`context.empty<E2>()`. That
 * is what lets the `default*` helpers below be written without an F-bounded
 * `{ [TypesKey]: { _SELF: C } }` constraint and without casts.
 *
 * ## Writing a `default*` method
 *
 * This is the recipe used by every `default*` helper in this package, and the
 * one end users should adopt for their own default methods:
 *
 * 1. **Constraint** — use `Collection.Advanced.WithCapabilities` with the base collection
 *    type (or its `.NonEmpty` variant) whose methods you need and the capability
 *    interfaces whose methods are called:
 *
 *    ```ts
 *    C extends Collection.Advanced.WithCapabilities<
 *        E,
 *        IndexedCollection.NonEmpty<E>,
 *        IndexedCollection.Capability.WithSpliceAt.NonEmpty<E> &
 *            Collection.Capability.WithConcat<E>
 *    >
 *    ```
 *
 *    The utility makes `col.context` one `ContextBase` over the merged record,
 *    so `context.of` / `from` / `empty` / `builder` resolve through all
 *    capabilities at once.
 * 3. **Return type** — express it purely through slots of `C[TypesKey]`:
 *    `_NORMAL` (may be empty), `_NON_EMPTY` (guaranteed non-empty), `_SELF`
 *    (preserves the emptiness kind), and for element-changing operations
 *    `Collection.Advanced.Retyped<C[TypesKey], E2>[...]`. At the call site the
 *    caller's concrete type substitutes for `C`, so the result is the
 *    caller's own collection type.
 * 4. **No casts** — if the body needs a cast, the constraint is wrong. The
 *    only exceptions are methods that need *builder* capabilities, which the
 *    collection bundles do not narrow; those must add a constraint-only
 *    record over the `_BUILDER` slot (see
 *    `IndexedCollection.Capability.WithBuilderWithAppendPrepend`), and
 *    capabilities without their own `Types` record (e.g.
 *    `KeyedCollection.Capability.WithMapValues`) cannot be used as
 *    constraints at all.
 */

export function defaultFlatMap<
	E,
	E2,
	C extends Collection.Advanced.WithCapabilities<
		Collection<E>,
		Collection.Capability.WithConcat<E>
	>,
>(
	col: C,
	f: (element: E) => StreamSource<E2>,
): Collection.Advanced.Retyped<C[TypesKey], E2>['_NORMAL'] {
	const token = Symbol();
	const iterator = col[Symbol.iterator]();

	let result = col.context.empty<E2>();
	let element: E | typeof token;

	while (token !== (element = iterator.fastNext(token))) {
		result = result.concat(f(element));
	}

	return result;
}

export function defaultRepeat<
	E,
	C extends Collection.Advanced.WithCapabilities<
		Collection<E>,
		Collection.Capability.WithConcat<E>
	>,
>(col: C, amount: number): C[TypesKey]['_NORMAL'] {
	Int.checkAtLeastZero(amount);

	if (amount === 0) {
		return col.context.empty();
	}
	if (amount === 1) {
		return col;
	}

	// repeat by doubling: `half` holds 2 * (amount >>> 1) copies
	const half = defaultRepeat(col.concat(col), amount >>> 1);

	return amount % 2 === 0 ? half : col.concat(half);
}
