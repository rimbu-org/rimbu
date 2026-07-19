import type { RMap } from '@rimbu/collection-types';
import type { RelatedTo } from '@rimbu/common/types';
import type { OrderedSet } from '@rimbu/ordered/set';
import type { SortedMap } from '@rimbu/sorted';

import type { OrderedSetBase } from '#set/base';
import type { ContextImpl } from '#set/context-factory';
import type { OrderedSetNonEmpty } from '#set/non-empty';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { Err } from '@rimbu/common';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

import { Indicator } from '#ordered/common/ordered-indicator';

export class OrderedSetBuilder<T> implements OrderedSetBase.Builder<T> {
	constructor(
		readonly context: ContextImpl<T>,
		public source?: OrderedSetNonEmpty<T>,
	) {}

	#keyIndicatorMapBuilder?: RMap.Builder<T, Indicator>;
	#indicatorMapBuilder?: SortedMap.Builder<Indicator, T>;

	_lock = 0;

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	prepareMutate(): void {
		if (
			undefined === this.#keyIndicatorMapBuilder ||
			undefined === this.#indicatorMapBuilder
		) {
			if (undefined !== this.source) {
				this.#keyIndicatorMapBuilder = this.source.keyIndicatorMap.toBuilder();
				this.#indicatorMapBuilder = this.source.indicatorKeyMap.toBuilder();
			} else {
				this.#keyIndicatorMapBuilder = this.context.keyMapContext.builder();
				this.#indicatorMapBuilder = this.context.indicatorMapContext.builder();
			}
		}
	}

	get keyMapBuilder(): RMap.Builder<T, Indicator> {
		this.prepareMutate();
		return this.#keyIndicatorMapBuilder!;
	}

	get indicatorMapBuilder(): SortedMap.Builder<Indicator, T> {
		this.prepareMutate();
		return this.#indicatorMapBuilder!;
	}

	get size(): number {
		return this.source?.size ?? this.indicatorMapBuilder.size;
	}

	get isEmpty(): boolean {
		return this.size === 0;
	}

	has = <U>(value: RelatedTo<T, U>): boolean => {
		return this.source?.has(value) ?? this.keyMapBuilder.hasKey(value);
	};

	add = (value: T): boolean => {
		this.checkLock();

		if (this.keyMapBuilder.isEmpty) {
			this.source = undefined;
			this.keyMapBuilder.set(value, Indicator.INIT_INDICATOR);
			this.indicatorMapBuilder.set(Indicator.INIT_INDICATOR, value);
			return true;
		}

		return this.keyMapBuilder.modifyAt(value, {
			ifNew: {
				create: () => {
					this.source = undefined;

					const [lastIndicator] = this.indicatorMapBuilder.max(Err);
					const nextIndicator = Indicator.after(lastIndicator);
					this.indicatorMapBuilder.set(nextIndicator, value);
					return nextIndicator;
				},
			},
		});
	};

	addAll = (source: StreamSource<T>): boolean => {
		this.checkLock();

		return Stream.from(source).filterPure({ pred: this.add }).count() > 0;
	};

	remove = <U>(value: RelatedTo<T, U>): boolean => {
		this.checkLock();

		const indicator = this.keyMapBuilder.removeKey(value);

		if (undefined === indicator) return false;

		this.source = undefined;
		this.indicatorMapBuilder.removeKey(indicator);

		return true;
	};

	removeAll = <U>(values: StreamSource<RelatedTo<T, U>>): boolean => {
		this.checkLock();

		return Stream.from(values).filterPure({ pred: this.remove }).count() > 0;
	};

	forEach = (
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed?: boolean; state?: TraverseState } = {},
	): void => {
		const { reversed = false, state = TraverseState() } = options;

		if (state.halted) return;

		this._lock++;

		if (undefined !== this.source) {
			this.source.forEach(f, { reversed, state });
		} else {
			this.indicatorMapBuilder.forEach(
				([_, value], index, halt) => f(value, index, halt),
				{
					// TODO: add reversed support to map builders
					// reversed,
					state,
				},
			);
		}

		this._lock--;
	};

	build = (): OrderedSet<T> => {
		if (undefined !== this.source) return this.source;
		if (this.size === 0) return this.context.empty();

		const keyMap = this.keyMapBuilder.build().assumeNonEmpty();
		const indicatorMap = this.indicatorMapBuilder.build().assumeNonEmpty();

		return this.context.createNonEmpty(keyMap, indicatorMap);
	};
}
