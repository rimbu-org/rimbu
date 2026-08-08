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
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithCollectIndexed.Types<E>
				>,
				IndexedCollection.Capability.WithCollectIndexed.API<
					E,
					IndexedCollection.Capability.WithCollectIndexed.Types<E>
				> {}

		export namespace WithCollectIndexed {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
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

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithCollectIndexed.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithCollectIndexed.API<
						E,
						IndexedCollection.Capability.WithCollectIndexed.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithCollectIndexed<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithCollectIndexed.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithCollectIndexed.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> =
				IndexedCollection.Capability.WithCollectIndexed.Family<E> &
					IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithCollectIndexed.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithFlatMapIndexed<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithFlatMapIndexed.Types<E>
				>,
				IndexedCollection.Capability.WithFlatMapIndexed.API<
					E,
					IndexedCollection.Capability.WithFlatMapIndexed.Types<E>
				> {}

		export namespace WithFlatMapIndexed {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
				flatMapIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
					f: (element: E, index: number) => StreamSource.NonEmpty<E2>,
				): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
				flatMapIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
					f: (element: E, index: number) => StreamSource<E2>,
				): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_NORMAL'];
			}

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithFlatMapIndexed.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithFlatMapIndexed.API<
						E,
						IndexedCollection.Capability.WithFlatMapIndexed.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithFlatMapIndexed<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithFlatMapIndexed.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithFlatMapIndexed.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> =
				IndexedCollection.Capability.WithFlatMapIndexed.Family<E> &
					IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithFlatMapIndexed.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithFilterIndexed<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithFilterIndexed.Types<E>
				>,
				IndexedCollection.Capability.WithFilterIndexed.API<
					E,
					IndexedCollection.Capability.WithFilterIndexed.Types<E>
				> {}

		export namespace WithFilterIndexed {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
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

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithFilterIndexed.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithFilterIndexed.API<
						E,
						IndexedCollection.Capability.WithFilterIndexed.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithFilterIndexed<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithFilterIndexed.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithFilterIndexed.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> =
				IndexedCollection.Capability.WithFilterIndexed.Family<E> &
					IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithFilterIndexed.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithMapIndexed<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithMapIndexed.Types<E>
				>,
				IndexedCollection.Capability.WithMapIndexed.API<
					E,
					IndexedCollection.Capability.WithMapIndexed.Types<E>
				> {}

		export namespace WithMapIndexed {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
				mapIndexed<E2 extends this[TypesKey]['_UPPER_E']>(
					f: (element: E, index: number) => E2,
				): (this[TypesKey] & { _NEW_E: E2 })['_NEW_TYPES']['_SELF'];
			}

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithMapIndexed.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithMapIndexed.API<
						E,
						IndexedCollection.Capability.WithMapIndexed.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithMapIndexed<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithMapIndexed.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithMapIndexed.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> =
				IndexedCollection.Capability.WithMapIndexed.Family<E> &
					IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithMapIndexed.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithOrderEditable<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithOrderEditable.Types<E>
				>,
				IndexedCollection.Capability.WithOrderEditable.API<
					E,
					IndexedCollection.Capability.WithOrderEditable.Types<E>
				> {}

		export namespace WithOrderEditable {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
				placeAt(index: number, element: E): this[TypesKey]['_NON_EMPTY'];
				moveTo(index: number, element: E): this[TypesKey]['_SELF'];
			}

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithOrderEditable.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithOrderEditable.API<
						E,
						IndexedCollection.Capability.WithOrderEditable.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithOrderEditable<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithOrderEditable.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithOrderEditable.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> =
				IndexedCollection.Capability.WithOrderEditable.Family<E> &
					IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithOrderEditable.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithPadTo<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithPadTo.Types<E>
				>,
				IndexedCollection.Capability.WithPadTo.API<
					E,
					IndexedCollection.Capability.WithPadTo.Types<E>
				> {}

		export namespace WithPadTo {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
				padTo(
					size: number,
					fill: E,
					options?: { paddingLeftBias?: number | undefined } | undefined,
				): this[TypesKey]['_SELF'];
			}

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithPadTo.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithPadTo.API<
						E,
						IndexedCollection.Capability.WithPadTo.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithPadTo<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithPadTo.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithPadTo.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> = IndexedCollection.Capability.WithPadTo.Family<E> &
				IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithPadTo.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithPrependAppend<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithPrependAppend.Types<E>
				>,
				IndexedCollection.Capability.WithPrependAppend.API<
					E,
					IndexedCollection.Capability.WithPrependAppend.Types<E>
				> {}

		export namespace WithPrependAppend {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
				prepend(element: E): this[TypesKey]['_NON_EMPTY'];
				append(element: E): this[TypesKey]['_NON_EMPTY'];
			}

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithPrependAppend.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithPrependAppend.API<
						E,
						IndexedCollection.Capability.WithPrependAppend.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithPrependAppend<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithPrependAppend.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithPrependAppend.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> =
				IndexedCollection.Capability.WithPrependAppend.Family<E> &
					IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithPrependAppend.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithRepeat<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithRepeat.Types<E>
				>,
				IndexedCollection.Capability.WithRepeat.API<
					E,
					IndexedCollection.Capability.WithRepeat.Types<E>
				> {}

		export namespace WithRepeat {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
				repeat<N extends number>(
					amount: N,
				): 0 extends N ? this[TypesKey]['_NORMAL'] : this[TypesKey]['_SELF'];
			}

			export interface NonEmpty<
				E,
				Tp extends Collection.Advanced.Types<E> = Collection.Advanced.Types<E>,
			> extends IndexedCollection.NonEmpty<
						E,
						Tp & IndexedCollection.Capability.WithRepeat.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithRepeat.API<
						E,
						Tp & IndexedCollection.Capability.WithRepeat.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithRepeat<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithRepeat.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithRepeat.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> = IndexedCollection.Capability.WithRepeat.Family<E> &
				IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithRepeat.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithRemoveAt<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithRemoveAt.Types<E>
				>,
				IndexedCollection.Capability.WithRemoveAt.API<
					E,
					IndexedCollection.Capability.WithRemoveAt.Types<E>
				> {}

		export namespace WithRemoveAt {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
				removeAt(index: number): this[TypesKey]['_NORMAL'];
			}

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithRemoveAt.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithRemoveAt.API<
						E,
						IndexedCollection.Capability.WithRemoveAt.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithRemoveAt<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithRemoveAt.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithRemoveAt.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> =
				IndexedCollection.Capability.WithRemoveAt.Family<E> &
					IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithRemoveAt.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithReversed<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithReversed.Types<E>
				>,
				IndexedCollection.Capability.WithReversed.API<
					E,
					IndexedCollection.Capability.WithReversed.Types<E>
				> {}

		export namespace WithReversed {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
				reversed(): this[TypesKey]['_SELF'];
			}

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithReversed.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithReversed.API<
						E,
						IndexedCollection.Capability.WithReversed.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithReversed<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithReversed.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithReversed.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> =
				IndexedCollection.Capability.WithReversed.Family<E> &
					IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithReversed.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithRotate<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithRotate.Types<E>
				>,
				IndexedCollection.Capability.WithRotate.API<
					E,
					IndexedCollection.Capability.WithRotate.Types<E>
				> {}

		export namespace WithRotate {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
				rotateLeft(amount: number): this[TypesKey]['_SELF'];
			}

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithRotate.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithRotate.API<
						E,
						IndexedCollection.Capability.WithRotate.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithRotate<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithRotate.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithRotate.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> = IndexedCollection.Capability.WithRotate.Family<E> &
				IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithRotate.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithSpliceAt<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithSpliceAt.Types<E>
				>,
				IndexedCollection.Capability.WithSpliceAt.API<
					E,
					IndexedCollection.Capability.WithSpliceAt.Types<E>
				> {}

		export namespace WithSpliceAt {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
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
				insertAt(
					index: number,
					values: StreamSource<E>,
				): this[TypesKey]['_SELF'];

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

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithSpliceAt.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithSpliceAt.API<
						E,
						IndexedCollection.Capability.WithSpliceAt.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithSpliceAt<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithSpliceAt.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithSpliceAt.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> =
				IndexedCollection.Capability.WithSpliceAt.Family<E> &
					IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithSpliceAt.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithSwapAt<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithSwapAt.Types<E>
				>,
				IndexedCollection.Capability.WithSwapAt.API<
					E,
					IndexedCollection.Capability.WithSwapAt.Types<E>
				> {}

		export namespace WithSwapAt {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
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

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithSwapAt.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithSwapAt.API<
						E,
						IndexedCollection.Capability.WithSwapAt.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithSwapAt<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithSwapAt.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithSwapAt.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> = IndexedCollection.Capability.WithSwapAt.Family<E> &
				IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithSwapAt.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}

		export interface WithUpdateAt<E>
			extends IndexedCollection<
					E,
					IndexedCollection.Capability.WithUpdateAt.Types<E>
				>,
				IndexedCollection.Capability.WithUpdateAt.API<
					E,
					IndexedCollection.Capability.WithUpdateAt.Types<E>
				> {}

		export namespace WithUpdateAt {
			export interface API<
				E,
				Tp extends
					IndexedCollection.Advanced.Types<E> = IndexedCollection.Advanced.Types<E>,
			> extends IndexedCollection.Advanced.Trait<E, Tp> {
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

			export interface NonEmpty<E>
				extends IndexedCollection.NonEmpty<
						E,
						IndexedCollection.Capability.WithUpdateAt.TypesNonEmpty<E>
					>,
					IndexedCollection.Capability.WithUpdateAt.API<
						E,
						IndexedCollection.Capability.WithUpdateAt.TypesNonEmpty<E>
					> {}

			export interface Family<E> extends IndexedCollection.Advanced.Family<E> {
				_NORMAL: IndexedCollection.Capability.WithUpdateAt<E>;
				_NON_EMPTY: IndexedCollection.Capability.WithUpdateAt.NonEmpty<E>;

				_NEW_FAMILY: IndexedCollection.Capability.WithUpdateAt.Family<
					this['_NEW_E']
				>;
			}

			export type Types<E> =
				IndexedCollection.Capability.WithUpdateAt.Family<E> &
					IndexedCollection.Advanced.NormalKind<E>;

			export type TypesNonEmpty<E> =
				IndexedCollection.Capability.WithUpdateAt.Family<E> &
					IndexedCollection.Advanced.NonEmptyKind<E>;
		}
	}
}
