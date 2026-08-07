import type { Collection } from '@rimbu/collection-types/collection';
import type { Op, TypesKey } from '@rimbu/collection-types/types';
import type { CollectFun, IndexRange, OptLazy } from '@rimbu/common';
import type { Stream, StreamSource } from '@rimbu/stream';

export interface IndexedCollection<
	E,
	Tp extends
		IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
> extends Collection<E, Tp> {
	streamSlice(
		range: IndexRange,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream<E>;

	at(index: number): E | undefined;
	at<O>(index: number, otherwise: OptLazy<O>): E | O;

	first(): E | undefined;
	last: this[TypesKey]['_firstLast'];

	take: this[TypesKey]['_take'];
	drop(amount: number): this[TypesKey]['_NORMAL'];
	splitAt: this[TypesKey]['_splitAt'];
	slice(range: IndexRange): this[TypesKey]['_NORMAL'];
}

export declare namespace IndexedCollection {
	export interface NonEmpty<
		E,
		Tp extends
			IndexedCollection.Advanced.TypesNonEmpty<E> = IndexedCollection.Advanced.TypesNonEmpty<E>,
	> extends IndexedCollection<E, Tp>,
			Collection.NonEmpty<E, Tp> {}

	export interface Builder<
		E,
		Tp extends
			IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
	> extends Collection.Builder<E, Tp> {
		at(index: number): E | undefined;
		at<O>(index: number, otherwise: OptLazy<O>): E | O;

		first: this[TypesKey]['_firstLast'];
		last: this[TypesKey]['_firstLast'];
	}

	export namespace Advanced {
		export interface Trait<
			E,
			Tp extends
				IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
		> extends Collection.Advanced.Trait<E, Tp> {}

		export interface FirstLast<R, IsNonEmpty extends boolean = boolean> {
			(): IsNonEmpty extends true ? R : R | undefined;
			<O>(otherwise: OptLazy<O>): IsNonEmpty extends true ? R : R | O;
		}

		export interface TakeNonEmpty<RN, RNE> {
			<const N extends number>(amount: N): 0 extends N ? RN : RNE;
			(amount: number): RN;
		}

		export interface SplitAtNonEmpty<RN, RNE> {
			<const N extends number>(amount: N): [0 extends N ? RN : RNE, RN];
			(amount: number): [RN, RN];
		}

		export interface Family<E> extends Collection.Advanced.Family<E> {
			_NORMAL: IndexedCollection<E>;
			_NON_EMPTY: IndexedCollection.NonEmpty<E>;
			_BUILDER: IndexedCollection.Builder<E>;

			_NEW_FAMILY: IndexedCollection.Advanced.Family<this['_NEW_E']>;
		}

		export interface NormalKind<E> extends Collection.Advanced.NormalKind<E> {
			_firstLast: IndexedCollection.Advanced.FirstLast<E>;
			_take: (amount: number) => this['_NORMAL'];
			_splitAt: (index: number) => [this['_NORMAL'], this['_NORMAL']];
			_stream: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream<E>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				IndexedCollection.Advanced.NormalKind<this['_NEW_E']>;
		}

		export interface NonEmptyKind<E>
			extends Collection.Advanced.NonEmptyKind<E> {
			_firstLast: IndexedCollection.Advanced.FirstLast<E, true>;
			_take: TakeNonEmpty<this['_NORMAL'], this['_NON_EMPTY']>;
			_splitAt: SplitAtNonEmpty<this['_NORMAL'], this['_NON_EMPTY']>;

			_stream: (
				options?: { reversed?: boolean | undefined } | undefined,
			) => Stream.NonEmpty<E>;

			_NEW_TYPES: this['_NEW_FAMILY'] &
				IndexedCollection.Advanced.NonEmptyKind<this['_NEW_E']>;
		}

		export type Types<E> = IndexedCollection.Advanced.Family<E> &
			IndexedCollection.Advanced.NormalKind<E>;

		export type TypesNonEmpty<E> = IndexedCollection.Advanced.Family<E> &
			IndexedCollection.Advanced.NonEmptyKind<E>;
	}

	export namespace Capability {
		/**
		 * A types record describing "any collection whose builder supports
		 * `append`/`prepend`".
		 *
		 * This exists purely as a *constraint* for generic helpers such as
		 * `defaultCollect`. Concrete collections must never intersect it into
		 * their own `Builder` declaration — they simply mix in
		 * `Collection.Builder.Capability.WithAppendPrepend` via `extends`, and
		 * their own types record then satisfies this constraint structurally.
		 */
		export interface BuilderWithAppendPrependTypes<E>
			extends IndexedCollection.Advanced.Types<E> {
			_BUILDER: IndexedCollection.Builder<E, BuilderWithAppendPrependTypes<E>> &
				Collection.Builder.Capability.WithAppendPrepend<E>;

			_NEW_TYPES: BuilderWithAppendPrependTypes<this['_NEW_E']>;
		}

		export interface WithBuilderWithAppendPrepend<E>
			extends IndexedCollection<E, BuilderWithAppendPrependTypes<E>> {}

		export interface WithCollectIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			collectIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
				collectFun: (
					element: E,
					index: number,
					skip: CollectFun.Skip,
					halt: () => void,
				) => E2 | CollectFun.Skip,
				options?: { indexOffset?: number | undefined } | undefined,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		}

		export interface WithFlatMapIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			flatMapIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
				f: (element: E, index: number) => StreamSource.NonEmpty<E2>,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
			flatMapIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
				f: (element: E, index: number) => StreamSource<E2>,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
		}

		export interface WithFilterIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			filterIndexed<E2 extends E, NE2 = Exclude<E, E2>>(
				pred: (element: E, index: number) => element is E2,
				options: { negate: true; indexOffset?: number | undefined },
			): (this[TypesKey] & {
				_NEW_E: NE2;
			})['_NEW_TYPES']['_NORMAL'];
			filterIndexed<E2 extends E>(
				pred: (element: E, index: number) => element is E2,
				options?:
					| { negate?: false | undefined; indexOffset?: number | undefined }
					| undefined,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
			filterIndexed(
				pred: (element: E, index: number) => boolean,
				options?:
					| { negate?: boolean | undefined; indexOffset?: number | undefined }
					| undefined,
			): this[TypesKey]['_NORMAL'];
		}

		export interface WithMapIndexed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			mapIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
				f: (element: E, index: number) => E2,
			): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
		}

		export interface WithOrderEditable<E>
			extends IndexedCollection.Advanced.Trait<E> {
			placeAt(index: number, element: E): this[TypesKey]['_NON_EMPTY'];
			moveTo(index: number, element: E): this[TypesKey]['_SELF'];
		}

		export interface WithPadTo<E> extends IndexedCollection.Advanced.Trait<E> {
			padTo(
				size: number,
				fill: E,
				options?: { paddingLeftBias?: number | undefined } | undefined,
			): this[TypesKey]['_SELF'];
		}

		export interface WithPrependAppend<E>
			extends IndexedCollection.Advanced.Trait<E> {
			prepend(element: E): this[TypesKey]['_NON_EMPTY'];
			append(element: E): this[TypesKey]['_NON_EMPTY'];
		}

		export interface WithRepeat<E> extends IndexedCollection.Advanced.Trait<E> {
			repeat<N extends number>(
				amount: N,
			): 0 extends N ? this[TypesKey]['_NORMAL'] : this[TypesKey]['_SELF'];
		}

		export interface WithRemoveAt<E>
			extends IndexedCollection.Advanced.Trait<E> {
			removeAt(index: number): this[TypesKey]['_NORMAL'];
		}

		export interface WithReversed<E>
			extends IndexedCollection.Advanced.Trait<E> {
			reversed(): this[TypesKey]['_SELF'];
		}

		export interface WithRotate<E> extends IndexedCollection.Advanced.Trait<E> {
			rotateLeft(amount: number): this[TypesKey]['_SELF'];
		}

		export interface WithSpliceAt<E>
			extends IndexedCollection.Advanced.Trait<E> {
			spliceAt(
				index: number,
				options: {
					removeAmount?: number | undefined;
					insert: StreamSource.NonEmpty<E>;
				},
			): this[TypesKey]['_NON_EMPTY'];
			spliceAt(
				index: number,
				options?:
					| {
							removeAmount?: number | undefined;
							insert?: StreamSource<E> | undefined;
					  }
					| undefined,
			): this[TypesKey]['_NORMAL'];
			spliceAtAndReturn(
				index: number,
				options: {
					removeAmount?: number | undefined;
					insert: StreamSource.NonEmpty<E>;
				},
			): Op.WithResult<
				this[TypesKey]['_NON_EMPTY'],
				[
					removed: this[TypesKey]['_NORMAL'],
					inserted: this[TypesKey]['_NON_EMPTY'],
				],
				true
			>;
			spliceAtAndReturn(
				index: number,
				options?:
					| {
							removeAmount?: number | undefined;
							insert?: StreamSource<E> | undefined;
					  }
					| undefined,
			): Op.DynamicResult<
				this[TypesKey]['_SELF'],
				[
					removed: this[TypesKey]['_NORMAL'],
					inserted: this[TypesKey]['_NORMAL'],
				],
				[
					removed: this[TypesKey]['_NORMAL'],
					inserted: this[TypesKey]['_NORMAL'],
				],
				this[TypesKey]['_NORMAL']
			>;

			insertAt(
				index: number,
				values: StreamSource.NonEmpty<E>,
			): this[TypesKey]['_NON_EMPTY'];
			insertAt(index: number, values: StreamSource<E>): this[TypesKey]['_SELF'];

			removeAt(
				index: number,
				amount?: number | undefined,
			): this[TypesKey]['_NORMAL'];

			removeAtAndReturn(
				index: number,
				amount?: number | undefined,
			): Op.DynamicResult<
				this[TypesKey]['_SELF'],
				this[TypesKey]['_NORMAL'],
				this[TypesKey]['_NON_EMPTY'],
				this[TypesKey]['_NORMAL']
			>;
		}

		export interface WithSwapAt<E> extends IndexedCollection.Advanced.Trait<E> {
			swapAt(index1: number, index2: number): this[TypesKey]['_SELF'];
			swapAtAndReturn(
				index1: number,
				index2: number,
			): Op.DynamicResult<
				this[TypesKey]['_SELF'],
				[previous1: undefined, previous2: undefined],
				[previous1: E, previous2: E],
				this[TypesKey]['_NON_EMPTY']
			>;
		}

		export interface WithUpdateAt<E>
			extends IndexedCollection.Advanced.Trait<E> {
			setAt(index: number, element: E): this[TypesKey]['_SELF'];
			setAtAndReturn(
				index: number,
				element: E,
			): Op.DynamicResult<
				this[TypesKey]['_SELF'],
				undefined,
				E,
				this[TypesKey]['_NON_EMPTY']
			>;
			updateAt(index: number, f: (element: E) => E): this[TypesKey]['_SELF'];
			updateAtAndReturn(
				index: number,
				f: (element: E) => E,
			): Op.DynamicResult<
				this[TypesKey]['_SELF'],
				[previous: undefined, current: undefined],
				[previous: E, current: E],
				this[TypesKey]['_NON_EMPTY']
			>;
		}
	}
}
