import type { SortedSet } from '@rimbu/sorted/set';
import type { StreamSource } from '@rimbu/stream';

import { ContextBaseWithAddAll } from '@rimbu/collection-types/advanced/collection-base';
import { Comp } from '@rimbu/common/comp';
import { Reducer } from '@rimbu/stream/reducer';

import { SortedSetBuilder } from '#set/builder';
import {
	SortedSetEmpty,
	SortedSetInner,
	SortedSetLeaf,
	SortedSetNode,
} from '#set/immutable';

export class SortedSetContext<UE>
	extends ContextBaseWithAddAll<SortedSet.Advanced.Family<UE>>
	implements SortedSet.Advanced.ContextApi<UE, SortedSet.Advanced.Family<UE>>
{
	static createDefault<UE>(
		comp?: Comp<UE> | undefined,
		blockSizeBits: number = 5,
	): SortedSetContext<UE> {
		const result: SortedSetContext<UE> = new SortedSetContext(
			comp,
			blockSizeBits,
			() => result,
		);
		return result;
	}

	private constructor(
		readonly _comp: Comp<UE> | undefined = undefined,
		readonly blockSizeBits: number = 5,
		readonly getDefaultInstance: () => SortedSetContext<any>,
	) {
		super();
		this.maxEntries = 1 << blockSizeBits;
		this.minEntries = 1 << (blockSizeBits - 1);
	}

	readonly maxEntries: number;
	readonly minEntries: number;

	get comp(): Comp<UE> {
		return this._comp ?? Comp.defaultInstance;
	}

	get defaultContext(): SortedSet.Context<any> {
		return this.getDefaultInstance();
	}

	isValidValue(value: unknown): value is UE {
		return this.comp.isComparable(value as UE);
	}

	findIndex(value: UE, entries: readonly UE[]): number {
		let start = 0;
		let end = entries.length - 1;

		while (start <= end) {
			const mid = (start + end) >>> 1;
			const midEntry = entries[mid];
			const comp = this.comp.compare(value, midEntry);
			if (comp < 0) end = mid - 1;
			else if (comp > 0) start = mid + 1;
			else return mid;
		}

		return -(start + 1);
	}

	leaf<E extends UE>(entries: readonly E[]): SortedSetLeaf<E> {
		return new SortedSetLeaf(this, entries);
	}

	inner<E extends UE>(
		entries: readonly E[],
		children: readonly SortedSetNode<E>[],
		size: number,
	): SortedSetInner<E> {
		return new SortedSetInner(this, entries, children, size);
	}

	isSortedSetEmpty<E extends UE>(obj: unknown): obj is SortedSetEmpty<E> {
		return obj instanceof SortedSetEmpty;
	}

	isSortedSetLeaf<E extends UE>(obj: unknown): obj is SortedSetLeaf<E> {
		return obj instanceof SortedSetLeaf;
	}

	isSortedSetInner<E extends UE>(obj: unknown): obj is SortedSetInner<E> {
		return obj instanceof SortedSetInner;
	}

	isSortedSetNode<E extends UE>(obj: unknown): obj is SortedSetNode<E> {
		return obj instanceof SortedSetNode;
	}

	isNonEmptyInstance<E extends UE>(
		source: unknown,
	): source is SortedSet.NonEmpty<E> {
		return source instanceof SortedSetNode;
	}

	#empty: SortedSet<UE> | undefined;

	empty = <E extends UE>(): SortedSet<E> => {
		if (undefined === this.#empty) {
			this.#empty = Object.freeze(new SortedSetEmpty<UE>(this));
		}
		return this.#empty as unknown as SortedSet<E>;
	};

	builder = <E extends UE>(): SortedSet.Builder<E> => {
		return new SortedSetBuilder<E>(this);
	};

	createBuilder<E extends UE>(source?: SortedSet<E>): SortedSet.Builder<E> {
		return new SortedSetBuilder<E>(this, source);
	}

	reducer = <E extends UE>(
		source?: StreamSource<E>,
	): Reducer<E, SortedSet<E>> => {
		return Reducer.create(
			() =>
				undefined === source
					? this.builder<E>()
					: (this.from(source as StreamSource<E>) as SortedSet<E>).toBuilder(),
			(builder, element) => {
				builder.add(element);
				return builder;
			},
			(builder) => builder.build(),
		);
	};

	createContext = <E>(
		options: {
			comp?: Comp<E> | undefined;
			blockSizeBits?: number | undefined;
		} = {},
	): SortedSet.Context<E> => {
		return new SortedSetContext<E>(
			options.comp as Comp<E> | undefined,
			options.blockSizeBits ?? this.blockSizeBits,
			this.getDefaultInstance as unknown as () => SortedSetContext<any>,
		) as unknown as SortedSet.Context<E>;
	};
}
