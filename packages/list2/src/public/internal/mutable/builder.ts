import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Update } from '@rimbu/common/update';

import type { ListContext } from '#list/context';
import type { ListImpl } from '#list/list-impl';

import { throwModifiedBuilderWhileLoopingOverItError } from '@rimbu/base/rimbu-error';
import { OptLazy } from '@rimbu/common/opt-lazy';

import { BuilderBase, type LeafBuilder } from '#list/mutable/builder-base';

export class ListBuilder<T> extends BuilderBase<T> {
	constructor(
		context: ListContext,
		public leafBuilder?: LeafBuilder<T>,
	) {
		super(context);
	}

	_lock = 0;

	checkLock(): void {
		if (this._lock) {
			throwModifiedBuilderWhileLoopingOverItError();
		}
	}

	get length(): number {
		return this.leafBuilder?.length ?? 0;
	}

	get isEmpty(): boolean {
		return this.length === 0;
	}

	get = <O = undefined>(index: number, otherwise?: OptLazy<O>): T | O => {
		if (
			undefined === this.leafBuilder ||
			index >= this.length ||
			-index > this.length
		) {
			return OptLazy(otherwise) as O;
		}
		if (index < 0) {
			return this.get(this.length + index, otherwise);
		}

		return this.leafBuilder.get(index);
	};

	prepend = (value: T): void => {
		this.checkLock();

		if (undefined === this.leafBuilder) {
			this.leafBuilder = this.context.leafBlockBuilder<T>(this.ops.of([value]));
			return;
		}

		this.leafBuilder.prepend(value);
		this.leafBuilder = this.leafBuilder.normalized();
	};

	append = (value: T): void => {
		this.checkLock();

		if (undefined === this.leafBuilder) {
			this.leafBuilder = this.context.leafBlockBuilder<T>(this.ops.of([value]));
			return;
		}

		this.leafBuilder.append(value);
		this.leafBuilder = this.leafBuilder.normalized();
	};

	updateAt = <O>(
		index: number,
		update: Update<T>,
		otherwise?: OptLazy<O>,
	): T | O => {
		throw new Error('Method not implemented.');
	};

	forEach = (
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed?: boolean; state?: TraverseState } = {},
	): void => {
		throw new Error('Method not implemented.');
	};

	build = (): ListImpl<T> => {
		if (undefined === this.leafBuilder) {
			return this.context.empty();
		}
		const result = this.leafBuilder.build();
		return result;
	};
}
