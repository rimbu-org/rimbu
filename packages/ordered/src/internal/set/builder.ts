import type { RSet } from '@rimbu/collection-types';
import type { RSetBase } from '@rimbu/collection-types/set/base';
import type { RelatedTo } from '@rimbu/common/types';
import type { List } from '@rimbu/list';
import type { OrderedSet } from '@rimbu/ordered/set';

import type { OrderedSetBase } from '#set/base';
import type { ContextImpl } from '#set/context-factory';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

export class OrderedSetBuilder<T> implements OrderedSetBase.Builder<T> {
	constructor(
		readonly context: ContextImpl<T>,
		public source?: OrderedSet.NonEmpty<T>,
	) {}

	_orderBuilder?: List.Builder<T>;
	_setBuilder?: RSet.Builder<T>;

	_lock = 0;

	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	prepareMutate(): void {
		if (undefined === this._orderBuilder || undefined === this._setBuilder) {
			if (undefined !== this.source) {
				this._orderBuilder = this.source.order.toBuilder();
				this._setBuilder = this.source.sourceSet.toBuilder();
			} else {
				this._orderBuilder = this.context.listContext.builder();
				this._setBuilder = this.context.setContext.builder();
			}
		}
	}

	get orderBuilder(): List.Builder<T> {
		this.prepareMutate();
		return this._orderBuilder!;
	}

	get setBuilder(): RSetBase.Builder<T> {
		this.prepareMutate();
		return this._setBuilder!;
	}

	get size(): number {
		return this.source?.size ?? this.orderBuilder.length;
	}

	get isEmpty(): boolean {
		return this.size === 0;
	}

	has = <U>(value: RelatedTo<T, U>): boolean => {
		return this.source?.has(value) ?? this.setBuilder.has(value);
	};

	add = (value: T): boolean => {
		this.checkLock();

		const changed = this.setBuilder.add(value);

		if (changed) {
			this.source = undefined;
			this.orderBuilder.append(value);
		}

		return changed;
	};

	addAll = (source: StreamSource<T>): boolean => {
		this.checkLock();

		return Stream.from(source).filterPure({ pred: this.add }).count() > 0;
	};

	remove = <U>(value: RelatedTo<T, U>): boolean => {
		this.checkLock();

		if (!this.context.setContext.isValidValue(value)) return false;

		const changed = this.setBuilder.remove(value);

		if (changed) {
			this.source = undefined;

			let index = -1;
			this.orderBuilder.forEach((v, i, halt): void => {
				if (Object.is(v, value)) {
					index = i;
					halt();
				}
			});
			this.orderBuilder.remove(index);
		}

		return changed;
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
			this.source.order.forEach(f, { reversed, state });
		} else {
			this.orderBuilder.forEach(f, { reversed, state });
		}

		this._lock--;
	};

	build = (): OrderedSet<T> => {
		if (undefined !== this.source) return this.source;
		if (this.size === 0) return this.context.empty();

		const order = this.orderBuilder.build().assumeNonEmpty();
		const sourceMap = this.setBuilder.build().assumeNonEmpty();

		return this.context.createNonEmpty(order, sourceMap);
	};
}
