import type { Collection } from '@rimbu/collection-types/collection';
import type { FastIterator } from '@rimbu/stream/stream-types';

import {
	EmptyCollectionAssumedNonEmptyError,
	throwModifiedBuilderWhileLoopingOverItError,
} from '@rimbu/base';
import { type ArrayNonEmpty, TraverseState } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

export type AbstractConstructor<Res> = abstract new (...args: any[]) => Res;

/**
 * Higher-kinded slot describing the extra API surface that a capability mixin
 * contributes to an empty collection base class.
 *
 * Capability mixins cannot be generic in the element type of the class they
 * produce (TypeScript mixin functions fix their type parameters at application
 * time). Instead the element type `_E` and thxe types record `_TP` are supplied
 * later, by the construct signature of {@link ApiMixinConstructor}, and each capability
 * describes its contribution as a function of those slots.
 *
 * Capabilities compose by intersection: `(IndexedEmptyCap & ValuedEmptyCap)['_API']`
 * is the intersection of both contributed API surfaces.
 */
export interface ApiMixin {
	/** the element type of the collection being extended */
	_E: unknown;
	/** the types record of the collection being extended */
	_TP: Collection.Advanced.TypesBase;
	/** the API surface contributed by this capability */
	_API: unknown;
}

export declare namespace ApiMixin {
	/**
	 * Resolves the API surface contributed by capability `C` for element type `E`
	 * and types record `Tp`.
	 */
	export type Apply<
		C extends ApiMixin,
		E,
		Tp extends Collection.Advanced.TypesBase,
	> = (C & { _E: E; _TP: Tp })['_API'];

	/**
	 * A constructor for an empty collection base class carrying the capabilities
	 * `C`. The element type, family and types record are type parameters of the
	 * *construct signature*, not of the enclosing type, so a subclass can bind them
	 * to its own type parameters:
	 *
	 * ```ts
	 * const Base = WithValuedCollectionEmptyBase(CollectionEmptyCtor);
	 *
	 * class MySetEmpty<E> extends Base<E, MySet.Advanced.Family<E>> {}
	 * ```
	 */
	export type AbstractEmptyConstructor<C extends ApiMixin> = abstract new <
		E,
		FAM extends Collection.Advanced.Family<E>,
		Tp extends Collection.Advanced.Types<FAM, E> = Collection.Advanced.Types<
			FAM,
			E
		>,
	>(
		context: Tp['_CONTEXT'],
	) => CollectionEmptyBase<E, Tp> & ApiMixin.Apply<C, E, Tp>;

	export type AbstractNonEmptyConstructor<C extends ApiMixin> = abstract new <
		E,
		FAM extends Collection.Advanced.Family<E>,
		Tp extends Collection.Advanced.TypesNonEmpty<
			FAM,
			E
		> = Collection.Advanced.TypesNonEmpty<FAM, E>,
	>(
		context: Tp['_CONTEXT'],
	) => CollectionNonEmptyBase<E, Tp> & ApiMixin.Apply<C, E, Tp>;
}

export class CollectionEmptyBase<
	E,
	Tp extends Collection.Advanced.Types<
		Collection.Advanced.Family<E>,
		E
	> = Collection.Advanced.Types<Collection.Advanced.Family<E>, E>,
> implements
		Collection.Advanced.Api<E, Tp>,
		Collection.Capability.WithMutate.Api<E, Tp>,
		Collection.Capability.WithToBuilder.Api<E, Tp>
{
	constructor(readonly context: Tp['_CONTEXT']) {}

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

	nonEmpty(): this is Tp['_NON_EMPTY'] {
		return false;
	}

	assumeNonEmpty(): never {
		throw new EmptyCollectionAssumedNonEmptyError();
	}

	stream(): Stream<E> {
		return Stream.empty<E>();
	}

	forEach(): void {}

	forEachIndexed(): void {}

	filter(): Tp['_NORMAL'] {
		return this;
	}

	filterIndexed(): Tp['_NORMAL'] {
		return this;
	}

	mutate(f: (builder: Tp['_BUILDER']) => void): Tp['_NORMAL'] {
		const builder = this.context.builder<E>();
		f(builder);
		return builder.build();
	}

	toArray(): [] {
		return [];
	}

	toBuilder(): Tp['_BUILDER'] {
		return this.context.builder();
	}
}

// /**
//  * {@link CollectionEmptyBase} viewed as a capability-free {@link ApiMixinConstructor} —
//  * the seed value to pass to the first capability mixin in a composition.
//  *
//  * The cast is unavoidable: TypeScript does not relate two generic construct
//  * signatures higher-order, so the class cannot be assigned to `EmptyCtor`
//  * directly even though it is structurally identical.
//  */
export const CollectionEmptyConstructor =
	CollectionEmptyBase as unknown as ApiMixin.AbstractEmptyConstructor<ApiMixin>;

export abstract class CollectionNonEmptyBase<
	E,
	Tp extends Collection.Advanced.TypesNonEmpty<
		Collection.Advanced.FamilyBase<E>,
		E
	> = Collection.Advanced.TypesNonEmpty<Collection.Advanced.FamilyBase<E>, E>,
> implements Collection.Advanced.Api<E, Tp>
{
	abstract readonly context: Tp['_CONTEXT'];

	abstract get size(): number;
	abstract stream(): Stream.NonEmpty<E>;
	abstract forEach(f: (value: E) => void): void;
	abstract filter(pred: (element: E) => boolean): Tp['_NORMAL'];
	abstract toArray(): ArrayNonEmpty<E>;

	[Symbol.iterator](): FastIterator<E> {
		return this.stream()[Symbol.iterator]();
	}

	get isEmpty(): false {
		return false;
	}

	nonEmpty(): this is Tp['_NON_EMPTY'] {
		return true;
	}

	assumeNonEmpty(): Tp['_NON_EMPTY'] {
		return this;
	}

	asNormal(): Tp['_NORMAL'] {
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
	): Tp['_NORMAL'] {
		const { negate = false, indexOffset = 0 } = options;
		let index = indexOffset;
		return negate
			? this.filter((element) => !pred(element, index++))
			: this.filter((element) => pred(element, index++));
	}
}

export interface CollectionNonEmptyMixin extends ApiMixin {
	_API: CollectionNonEmptyBase<this['_E'], this['_TP']>;

	/**
	 * Only wide enough to satisfy the `Tp` constraint of {@link CollectionNonEmptyBase}.
	 *
	 * This must stay on {@link Collection.Advanced.FamilyBase} and never narrow to
	 * {@link Collection.Advanced.Family}. `ApiMixin.Apply` supplies the real types
	 * record by *intersection* (`C & { _TP: Tp }`), which accumulates rather than
	 * replaces. A `Family<this['_E']>` default therefore survives into the applied
	 * record and forces every slot — notably `_CONTEXT` — to additionally satisfy
	 * the element-typed `Collection.Advanced.Family<E>` view alongside the
	 * key/value-typed view contributed by `Tp`. Those two views are irreconcilable
	 * for a generic `E`, because a keyed family rebuilds the element type as
	 * `readonly [E[0], E[1]]`, which is not assignable to an unresolved `E`.
	 * `FamilyBase` is element-agnostic, so it composes harmlessly.
	 */
	_TP: Collection.Advanced.TypesNonEmpty<
		Collection.Advanced.FamilyBase<this['_E']>,
		this['_E']
	>;
}

export const CollectionNonEmptyConstructor =
	CollectionNonEmptyBase as unknown as ApiMixin.AbstractNonEmptyConstructor<CollectionNonEmptyMixin>;

export abstract class CollectionBuilderBase<
	E,
	FAM extends Collection.Advanced.FamilyBase<E> = Collection.Advanced.Family<E>,
	Tp extends Collection.Advanced.TypesBase = Collection.Advanced.Types<FAM, E>,
> implements Collection.Advanced.BuilderApi<E, Tp>
{
	abstract readonly context: FAM['_CONTEXT'];

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

export abstract class ContextBaseWithAddAll<
	FAM extends Collection.Advanced.Family<any> &
		Collection.Capability.WithToBuilder<any> &
		Collection.Capability.WithAddAll<any>,
> implements Collection.Advanced.ContextApi<FAM>
{
	abstract isNonEmptyInstance<E extends FAM['_UPPER_E']>(
		source: unknown,
	): source is Collection.Advanced.FamToTypes<FAM, E>['_NON_EMPTY'];
	abstract readonly defaultContext: FAM['_CONTEXT'];
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

export function defaultAddAll<
	E,
	C extends Collection.NonEmpty<E, FAM>,
	FAM extends Collection.Advanced.Family<E> &
		Collection.Capability.WithAddAll<E> &
		Collection.Capability.WithToBuilder<E>,
>(col: C, elements: StreamSource<E>) {
	const builder = col.toBuilder();
	builder.addAll(elements);
	return builder.build();
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
	FAM extends Collection.Advanced.Family<E> &
		Collection.Capability.WithAddAll<E>,
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
