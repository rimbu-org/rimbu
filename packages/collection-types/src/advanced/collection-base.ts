import type { Collection } from '@rimbu/collection-types/collection2';
import type { TypesKey } from '@rimbu/collection-types/types';
import type { FastIterator } from '@rimbu/stream/stream-types';

import { EmptyCollectionAssumedNonEmptyError } from '@rimbu/base';
import { type ArrayNonEmpty } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

type Capabilities<E> = Collection.Capability.WithToBuilder<E> &
	Collection.Capability.WithMap<E> &
	Collection.Capability.WithMutate<E> &
	Collection.Capability.WithRecompose<E>;

export abstract class CollectionEmptyBase<E>
	implements Collection<E, Capabilities<E>>
{
	declare readonly [TypesKey]: Collection.Advanced.InvariantTypes<
		Collection.Advanced.Types<Capabilities<E>, E>,
		E
	>;

	abstract readonly context: Collection.Context<
		Collection.Advanced.Types<Capabilities<E>, E>
	>;

	[Symbol.iterator](): FastIterator<E> {
		return Stream.empty<E>()[Symbol.iterator]();
	}

	get isEmpty(): true {
		return true;
	}

	get size(): 0 {
		return 0;
	}

	asNormal(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	nonEmpty(): this is this[TypesKey]['_NON_EMPTY'] {
		return false;
	}

	assumeNonEmpty(): never {
		throw new EmptyCollectionAssumedNonEmptyError();
	}

	concat(
		...sources: ArrayNonEmpty<StreamSource.NonEmpty<E>>
	): this[TypesKey]['_NON_EMPTY'];
	concat(
		...sources: ArrayNonEmpty<StreamSource<E>>
	): this[TypesKey]['_NORMAL'] {
		return this.context.from(...sources) as this[TypesKey]['_NON_EMPTY'];
	}

	flatMap(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	flatMapIndexed(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	stream(): Stream<E> {
		return Stream.empty<E>();
	}

	forEach(): void {}

	forEachIndexed(): void {}

	filter(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	filterIndexed(): this[TypesKey]['_NORMAL'] {
		return this;
	}

	recompose<E2 extends this[TypesKey]['_UPPER_E']>(
		f: (stream: Stream<E>) => StreamSource<E2>,
	): Collection.Advanced.ReTyped<this[TypesKey], E2>['_NORMAL'] {
		return this.context.from(f(Stream.empty()));
	}

	mutate(
		f: (builder: this[TypesKey]['_BUILDER']) => void,
	): this[TypesKey]['_NORMAL'] {
		const builder = this.context.builder<E>();
		f(builder);
		return builder.build();
	}

	map<E2 extends this[TypesKey]['_UPPER_E']>(
		_f: (element: E) => E2,
	): Collection.Advanced.ReTyped<this[TypesKey], E2>['_SELF'] {
		return this.context.empty<E2>();
	}

	mapIndexed(): this {
		return this;
	}

	toArray(): [] {
		return [];
	}

	toBuilder(): this[TypesKey]['_BUILDER'] {
		return this.context.builder();
	}
}

// export abstract class CollectionNonEmptyBase<E>
// 	implements
// 		Collection.NonEmpty<E>,
// 		Collection.Capability.WithMutate.API<E>,
// 		Collection.Capability.WithRecompose.API<E>
// {
// 	declare readonly [TypesKey]: Collection.Advanced.TypesNonEmpty<E>;

// 	abstract readonly context: Collection.Advanced.ContextBase<
// 		Collection.Advanced.TypesNonEmpty<E>
// 	>;

// 	abstract get size(): number;
// 	abstract stream(): Stream.NonEmpty<E>;
// 	abstract forEach(f: (value: E) => void): void;
// 	abstract filter(pred: (element: E) => boolean): this[TypesKey]['_NORMAL'];
// 	abstract toArray(): ArrayNonEmpty<E>;
// 	abstract toBuilder(): this[TypesKey]['_BUILDER'];

// 	[Symbol.iterator](): FastIterator<E> {
// 		return this.stream()[Symbol.iterator]();
// 	}

// 	get isEmpty(): false {
// 		return false;
// 	}

// 	nonEmpty(): this is this[TypesKey]['_NON_EMPTY'] {
// 		return true;
// 	}

// 	assumeNonEmpty(): this[TypesKey]['_NON_EMPTY'] {
// 		return this;
// 	}

// 	asNormal(): this[TypesKey]['_NORMAL'] {
// 		return this;
// 	}

// 	forEachIndexed(
// 		f: (value: E, index: number, halt: () => void) => void,
// 		options: { state?: TraverseState } = {},
// 	): void {
// 		const { state = TraverseState() } = options;

// 		if (state.halted) return;

// 		const haltSymbol = Symbol();

// 		try {
// 			this.forEach((value) => {
// 				f(value, state.nextIndex(), state.halt);

// 				if (state.halted) {
// 					throw haltSymbol;
// 				}
// 			});
// 		} catch (err) {
// 			if (haltSymbol !== err) {
// 				throw err;
// 			}
// 		}
// 	}

// 	filterIndexed(
// 		pred: (element: E, index: number) => boolean,
// 		options: {
// 			negate?: boolean | undefined;
// 			indexOffset?: number | undefined;
// 		} = {},
// 	): this[TypesKey]['_NORMAL'] {
// 		const { negate = false, indexOffset = 0 } = options;
// 		let index = indexOffset;
// 		return negate
// 			? this.filter((element) => !pred(element, index++))
// 			: this.filter((element) => pred(element, index++));
// 	}

// 	recompose<E2 extends this[TypesKey]['_UPPER_E']>(
// 		f: (stream: Stream.NonEmpty<E>) => StreamSource.NonEmpty<E2>,
// 	): Collection.Advanced.Retyped<this[TypesKey], E2>['_NON_EMPTY'];
// 	recompose<E2 extends this[TypesKey]['_UPPER_E']>(
// 		f: (stream: Stream.NonEmpty<E>) => StreamSource<E2>,
// 	): Collection.Advanced.Retyped<this[TypesKey], E2>['_NON_EMPTY'] {
// 		return this.context.from(f(this.stream())) as any;
// 	}

// 	mutate(
// 		f: (builder: this[TypesKey]['_BUILDER']) => void,
// 	): this[TypesKey]['_NORMAL'] {
// 		const builder = this.toBuilder();
// 		f(builder);
// 		return builder.build();
// 	}
// }

// export abstract class CollectionBuilderBase<E>
// 	implements Collection.Builder<E>
// {
// 	declare readonly [TypesKey]: Collection.Advanced.Types<E>;

// 	abstract readonly context: Collection.Advanced.ContextBase<
// 		Collection.Advanced.Types<E>
// 	>;

// 	abstract get size(): number;
// 	abstract clear(): void;
// 	abstract forEach(f: (value: E) => void): void;
// 	abstract build(): this[TypesKey]['_NORMAL'];

// 	#iterationDepth = 0;

// 	checkLock(): void {
// 		if (this.#iterationDepth) {
// 			throwModifiedBuilderWhileLoopingOverItError();
// 		}
// 	}

// 	startIteration(): void {
// 		this.#iterationDepth++;
// 	}

// 	endIteration(): void {
// 		this.#iterationDepth--;
// 	}

// 	get isEmpty(): boolean {
// 		return 0 === this.size;
// 	}

// 	forEachIndexed(
// 		f: (value: E, index: number, halt: () => void) => void,
// 		options: { state?: TraverseState } = {},
// 	): void {
// 		const { state = TraverseState() } = options;

// 		if (state.halted) return;

// 		const haltSymbol = Symbol();

// 		try {
// 			this.forEach((value) => {
// 				f(value, state.nextIndex(), state.halt);

// 				if (state.halted) {
// 					throw haltSymbol;
// 				}
// 			});
// 		} catch (err) {
// 			if (haltSymbol !== err) {
// 				throw err;
// 			}
// 		}
// 	}
// }

// export function defaultMapIndexed<
// 	E,
// 	E2 extends C[TypesKey]['_UPPER_E'],
// 	C extends Collection<E, Collection.Capability.WithMap<E>>,
// >(
// 	col: C,
// 	mapFun: (element: E, index: number) => E2,
// 	options: { indexOffset?: number | undefined } = {},
// ): Collection.Advanced.ReTyped<C[TypesKey], E2>['_SELF'] {
// 	const { indexOffset = 0 } = options;
// 	let index = indexOffset;

// 	return col.map((element) => mapFun(element, index++));
// }
