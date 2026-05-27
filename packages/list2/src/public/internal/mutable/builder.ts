import type { WithElem } from '@rimbu/collection-types/common';
import type { Update } from '@rimbu/common/update';

import type { ListContext } from '#list/context-module';
import type { ListBase } from '#list/list-base';
import type { ListImpl } from '#list/list-impl';

import {
	throwInvalidStateError,
	throwModifiedBuilderWhileLoopingOverItError,
} from '@rimbu/base/rimbu-error';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

import { BuilderBase, type OuterBuilder } from '#list/mutable/builder-base';

export class ListBuilder<T, Tp extends ListImpl.Types = ListImpl.Types>
	extends BuilderBase
	implements ListBase.Builder<T, Tp>
{
	constructor(
		context: ListContext,
		public outerBuilder?: OuterBuilder<T>,
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
		return this.outerBuilder?.length ?? 0;
	}

	get isEmpty(): boolean {
		return this.length === 0;
	}

	get = <O = undefined>(index: number, otherwise?: OptLazy<O>): T | O => {
		if (
			undefined === this.outerBuilder ||
			index >= this.length ||
			-index > this.length
		) {
			return OptLazy(otherwise) as O;
		}
		if (index < 0) {
			return this.get(this.length + index, otherwise);
		}

		return this.outerBuilder.get(index);
	};

	prepend = (value: T): void => {
		this.checkLock();

		if (undefined === this.outerBuilder) {
			this.outerBuilder = this.context.outerBlockBuilder<T>(
				this.ops.of([value]),
			);
			return;
		}

		this.outerBuilder.prepend(value);
		this.outerBuilder = this.outerBuilder.normalized();
	};

	append = (value: T): void => {
		this.checkLock();

		if (undefined === this.outerBuilder) {
			this.outerBuilder = this.context.outerBlockBuilder<T>(
				this.ops.of([value]),
			);
			return;
		}

		this.outerBuilder.append(value);
		this.outerBuilder = this.outerBuilder.normalized();
	};

	appendAll = (values: StreamSource<T>): void => {
		this.checkLock();

		if (Array.isArray(values)) {
			this.appendArray(values);
			return;
		}

		const token = Symbol();
		const iterator = Stream.from(values)[Symbol.iterator]();
		let next: T | typeof token;
		while ((next = iterator.fastNext(token)) !== token) {
			this.append(next);
		}
	};

	insert = (index: number, value: T): void => {
		this.checkLock();

		if (undefined === this.outerBuilder) {
			this.outerBuilder = this.context.outerBlockBuilder<T>(
				this.ops.of([value]),
			);
		} else {
			if (index === 0) {
				this.prepend(value);
				return;
			}
			if (index > this.length || -index > this.length + 1) {
				this.append(value);
				return;
			}
			if (index < 0) {
				this.insert(this.length + index, value);
				return;
			}

			this.outerBuilder.insert(index, value);
			this.outerBuilder = this.outerBuilder.normalized();
		}
	};

	remove = <O>(index: number, otherwise?: OptLazy<O>): T | O => {
		this.checkLock();

		if (
			undefined === this.outerBuilder ||
			index >= this.length ||
			-index > this.length
		) {
			return OptLazy(otherwise) as O;
		}

		if (index < 0) {
			return this.remove(this.length + index);
		}

		const result = this.outerBuilder.remove(index);
		this.outerBuilder = this.outerBuilder.normalized();

		return result;
	};

	appendArray(array: T[]): void {
		let index = 0;
		const blockSize = this.context.maxBlockSize;

		// fill last child
		if (undefined !== this.outerBuilder) {
			if (this.context.isOuterBlockBuilder(this.outerBuilder)) {
				const remaining = blockSize - this.outerBuilder.length;

				if (remaining > 0) {
					const slice = array.slice(0, remaining);
					this.outerBuilder.appendValues(slice);
					index = remaining;
				}
			} else if (this.context.isOuterTreeBuilder(this.outerBuilder)) {
				this.outerBuilder.prepareMutate();
				const left = this.outerBuilder.left;
				const remaining = blockSize - left.length;

				if (remaining > 0) {
					const slice = array.slice(0, remaining);
					left.appendValues(slice);
					index = remaining;
				}
			}
		}

		// append blocks
		while (index < array.length) {
			const end = index + blockSize;
			const window = array.slice(index, end);
			this.appendFullOrLastWindow(window);
			index = end;
		}
	}

	appendFullOrLastWindow(window: T[]): void {
		const outerBlockBuilder = this.context.outerBlockBuilder<T>(
			this.ops.of(window),
		);

		if (undefined === this.outerBuilder) {
			this.outerBuilder = outerBlockBuilder;
			return;
		}

		if (this.context.isOuterBlockBuilder<T>(this.outerBuilder)) {
			this.outerBuilder = this.context.outerTreeBuilder(
				this.outerBuilder,
				outerBlockBuilder,
				undefined,
				this.outerBuilder.length + outerBlockBuilder.length,
			);
			return;
		}

		if (this.context.isOuterTreeBuilder<T>(this.outerBuilder)) {
			this.outerBuilder.appendMiddle(this.outerBuilder.right);
			this.outerBuilder.right = outerBlockBuilder;
			this.outerBuilder.length += outerBlockBuilder.length;
			return;
		}

		throwInvalidStateError();
	}

	updateAt = <O>(
		index: number,
		update: Update<T>,
		otherwise?: OptLazy<O>,
	): T | O => {
		this.checkLock();

		if (
			undefined === this.outerBuilder ||
			index >= this.length ||
			-index > this.length
		) {
			return OptLazy(otherwise) as O;
		}
		if (index < 0) {
			return this.updateAt(this.length + index, update);
		}

		return this.outerBuilder.updateAt(index, update);
	};

	set = <O>(index: number, value: T, otherwise?: OptLazy<O>): T | O => {
		return this.updateAt(index, value, otherwise);
	};

	forEach = (
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed?: boolean; state?: TraverseState } = {},
	): void => {
		if (undefined === this.outerBuilder) return;

		const { reversed = false, state = TraverseState() } = options;

		if (state.halted) return;

		this._lock++;

		try {
			this.outerBuilder.forEach(f, { reversed, state });
		} finally {
			this._lock--;
		}
	};

	build = (): WithElem<Tp, T>['normal'] => {
		if (undefined === this.outerBuilder) {
			return this.context.empty();
		}
		const result = this.outerBuilder.build();
		return result;
	};

	buildMap = <T2>(f: (value: T) => T2): ListImpl<T2> => {
		if (undefined === this.outerBuilder) {
			return this.context.empty();
		}
		return this.outerBuilder.buildMap(f);
	};

	_verifyStructure(messages: string[] = []): string[] {
		if (undefined === this.outerBuilder) {
			return [];
		}
		
		return this.outerBuilder._verifyStructure(messages);
	}
}
