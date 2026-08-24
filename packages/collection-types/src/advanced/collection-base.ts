import type { Collection } from '@rimbu/collection-types/collection';
import type { FastIterator } from '@rimbu/stream/stream-types';

import {
	EmptyCollectionAssumedNonEmptyError,
	throwModifiedBuilderWhileLoopingOverItError,
} from '@rimbu/base';
import { type ArrayNonEmpty, TraverseState } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

export abstract class CollectionEmptyBase<
	E,
	FAM extends Collection.Advanced.Family<E> = Collection.Advanced.Family<E>,
	Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
		FAM,
		E
	>,
> implements
		Collection.Advanced.Api<E, Tp>,
		Collection.Capability.WithFlatMap.Api<E, Tp>,
		Collection.Capability.WithMap.Api<E, Tp>,
		Collection.Capability.WithMutate.Api<E, Tp>,
		Collection.Capability.WithRecompose.Api<E, Tp>
{
	abstract readonly context: Collection.Context<FAM>;

	[Symbol.iterator](): FastIterator<E> {
		return Stream.empty<E>()[Symbol.iterator]();
	}

	get isEmpty(): true {
		return true;
	}

	get size(): 0 {
		return 0;
	}

	asNormal(): this {
		return this;
	}

	nonEmpty(): this is FAM['_NON_EMPTY'] {
		return false;
	}

	assumeNonEmpty(): never {
		throw new EmptyCollectionAssumedNonEmptyError();
	}

	flatMap(): this {
		return this;
	}

	flatMapIndexed(): this {
		return this;
	}

	stream(): Stream<E> {
		return Stream.empty<E>();
	}

	forEach(): void {}

	forEachIndexed(): void {}

	filter(): this {
		return this;
	}

	filterIndexed(): this {
		return this;
	}

	recompose<E2 extends FAM['_UPPER_E']>(
		f: (stream: Stream<E>) => StreamSource<E2>,
	): Collection.Advanced.ReTypeFam<FAM, E2>['_NORMAL'] {
		return this.context.from(f(Stream.empty()));
	}

	mutate(f: (builder: FAM['_BUILDER']) => void): FAM['_NORMAL'] {
		const builder = this.context.builder<E>();
		f(builder);
		return builder.build();
	}

	map<E2 extends FAM['_UPPER_E']>(
		_f: (element: E) => E2,
	): Collection.Advanced.ReTyped<
		Tp & Collection.Advanced.NormalKind<E2>,
		E2
	>['_SELF'] {
		return this as any;
	}

	mapIndexed<E2 extends FAM['_UPPER_E']>(
		_f: (element: E, index: number) => E2,
	): Collection.Advanced.ReTyped<Tp, E2>['_SELF'] {
		return this as any;
	}

	toArray(): [] {
		return [];
	}

	toBuilder(): FAM['_BUILDER'] {
		return this.context.builder();
	}
}

export abstract class CollectionNonEmptyBase<
	E,
	FAM extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	Tp extends Collection.Advanced.TypesBase = Collection.Advanced.TypesNonEmpty<
		FAM,
		E
	>,
> implements Collection.Advanced.Api<E, Tp>
{
	abstract readonly context: Collection.Advanced.ContextApi<FAM>;

	abstract get size(): number;
	abstract stream(): Stream.NonEmpty<E>;
	abstract forEach(f: (value: E) => void): void;
	abstract filter(pred: (element: E) => boolean): FAM['_NORMAL'];
	abstract toArray(): ArrayNonEmpty<E>;

	[Symbol.iterator](): FastIterator<E> {
		return this.stream()[Symbol.iterator]();
	}

	get isEmpty(): false {
		return false;
	}

	nonEmpty(): this is FAM['_NON_EMPTY'] {
		return true;
	}

	assumeNonEmpty(): FAM['_NON_EMPTY'] {
		return this;
	}

	asNormal(): FAM['_NORMAL'] {
		return this;
	}

	forEachIndexed(
		f: (value: E, index: number, halt: () => void) => void,
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

	filterIndexed(
		pred: (element: E, index: number) => boolean,
		options: {
			negate?: boolean | undefined;
			indexOffset?: number | undefined;
		} = {},
	): FAM['_NORMAL'] {
		const { negate = false, indexOffset = 0 } = options;
		let index = indexOffset;
		return negate
			? this.filter((element) => !pred(element, index++))
			: this.filter((element) => pred(element, index++));
	}

	recompose<E2 extends FAM['_UPPER_E']>(
		f: (stream: Stream.NonEmpty<E>) => StreamSource.NonEmpty<E2>,
	): Collection.Advanced.ReTypeFam<FAM, E2>['_NON_EMPTY'];
	recompose<E2 extends FAM['_UPPER_E']>(
		f: (stream: Stream.NonEmpty<E>) => StreamSource<E2>,
	): Collection.Advanced.ReTypeFam<FAM, E2>['_NON_EMPTY'] {
		return this.context.from(f(this.stream())) as any;
	}
}

export abstract class CollectionBuilderBase<
	E,
	FAM extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	Tp extends Collection.Advanced.TypesBase = Collection.Advanced.Types<FAM, E>,
> implements Collection.Advanced.BuilderApi<E, Tp>
{
	abstract get size(): number;
	abstract clear(): void;
	abstract forEach(f: (value: E) => void): void;
	abstract build(): FAM['_NORMAL'];

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
		f: (value: E, index: number, halt: () => void) => void,
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

export abstract class CollectionContextBaseWithAddAll<
	FAM extends Collection.Advanced.FamilyBase<any> &
		Collection.Capability.WithToBuilder<any> &
		Collection.Capability.WithAdd<any>,
> implements Collection.Advanced.ContextApi<FAM>
{
	abstract isNonEmptyInstance<E extends FAM['_UPPER_E']>(
		source: unknown,
	): source is Collection.Advanced.FamToTypes<FAM, E>['_NON_EMPTY'];
	abstract empty<E extends FAM['_UPPER_E']>(): Collection.Advanced.FamToTypes<
		FAM,
		E
	>['_NORMAL'];
	abstract builder<E extends FAM['_UPPER_E']>(): Collection.Advanced.FamToTypes<
		FAM,
		E
	>['_BUILDER'];

	of = <E extends FAM['_UPPER_E']>(
		...elements: ArrayNonEmpty<E>
	): Collection.Advanced.FamToTypes<FAM, E>['_NON_EMPTY'] => {
		return this.from(elements);
	};

	from = <E extends FAM['_UPPER_E']>(
		...sources: ArrayNonEmpty<StreamSource<E>>
	): Collection.Advanced.FamToTypes<FAM, E>['_NON_EMPTY'] => {
		let builder = this.builder<E>();
		let i = -1;
		const length = sources.length;
		while (++i < length) {
			const source = sources[i];
			if (Stream.isEmptyStreamSourceInstance(source)) continue;
			if (
				builder.isEmpty &&
				this.isNonEmptyInstance<E>(source) &&
				source.context === this
			) {
				if (i === length - 1) return source;
				builder = source.toBuilder();
				continue;
			}
			builder.addAll(source);
		}

		return builder.build() as any;
	};
}

export function defaultMapIndexed<
	E,
	E2 extends FAM['_UPPER_E'],
	C extends Collection.NonEmpty<E, FAM>,
	FAM extends Collection.Capability.WithMap<E>,
>(
	col: C,
	mapFun: (element: E, index: number) => E2,
	options: { indexOffset?: number | undefined } = {},
): Collection.Advanced.FamToTypes<FAM, E2>['_NON_EMPTY'] {
	const { indexOffset = 0 } = options;
	let index = indexOffset;

	return col.map((element) => mapFun(element, index++));
}

export function defaultFlatMapByAddAll<
	E,
	E2,
	C extends Collection.NonEmpty<E, FAM>,
	FAM extends Collection.Capability.WithAdd<E>,
>(
	col: C,
	f: (element: E) => StreamSource<E2>,
): Collection.Advanced.FamToTypes<FAM, E2>['_NORMAL'] {
	const token = Symbol();
	const iterator = col[Symbol.iterator]();

	let result = col.context.empty<E2>();
	let element: E | typeof token;

	while (token !== (element = iterator.fastNext(token))) {
		result = result.addAll(f(element));
	}

	return result;
}

export function defaultFlatMapIndexed<
	E,
	E2 extends FAM['_UPPER_E'],
	C extends Collection.NonEmpty<E, FAM>,
	FAM extends Collection.Capability.WithFlatMap<E>,
>(
	col: C,
	f: (element: E, index: number) => StreamSource<E2>,
	options: { indexOffset?: number | undefined } = {},
): Collection.Advanced.ReTypeFam<FAM, E2>['_NORMAL'] {
	const { indexOffset = 0 } = options;
	let index = indexOffset;

	return col.flatMap((element) => f(element, index++));
}
