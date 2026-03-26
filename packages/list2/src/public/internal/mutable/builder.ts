import type { WithElem } from '@rimbu/collection-types/common';
import type { Update } from '@rimbu/common/update';

import type { ListContext } from '#list/context-module';
import type { ListImpl } from '#list/list-impl';

import {
	throwInvalidStateError,
	throwModifiedBuilderWhileLoopingOverItError,
} from '@rimbu/base/rimbu-error';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream, type StreamSource } from '@rimbu/stream';

import { BuilderBase, type LeafBuilder } from '#list/mutable/builder-base';

export class ListBuilder<
	T,
	Tp extends ListImpl.Types = ListImpl.Types,
> extends BuilderBase {
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

	appendArray(array: T[]): void {
		let index = 0;
		const blockSize = this.context.maxBlockSize;

		// fill last child
		if (undefined !== this.leafBuilder) {
			if (this.context.isLeafBlockBuilder(this.leafBuilder)) {
				index = blockSize - this.leafBuilder.length;

				if (index > 0) {
					const slice = array.slice(0, index);
					this.leafBuilder.children = this.ops.concat(
						this.leafBuilder.children,
						this.ops.of(slice),
					);
				}
			} else if (this.context.isLeafTreeBuilder(this.leafBuilder)) {
				const left = this.leafBuilder.left;
				index = blockSize - left.length;

				if (index > 0) {
					const slice = array.slice(0, index);
					left.children = this.ops.concat(left.children, this.ops.of(slice));
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
		const leafBlockBuilder = this.context.leafBlockBuilder<T>(
			this.ops.of(window),
		);

		if (undefined === this.leafBuilder) {
			this.leafBuilder = leafBlockBuilder;
			return;
		}

		if (this.context.isLeafBlockBuilder<T>(this.leafBuilder)) {
			this.leafBuilder = this.context.leafTreeBuilder(
				this.leafBuilder,
				leafBlockBuilder,
				undefined,
				this.leafBuilder.length + leafBlockBuilder.length,
			);
			return;
		}

		if (this.context.isLeafTreeBuilder<T>(this.leafBuilder)) {
			this.leafBuilder.appendMiddle(this.leafBuilder.right);
			this.leafBuilder.right = leafBlockBuilder;
			this.leafBuilder.length += leafBlockBuilder.length;
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
			undefined === this.leafBuilder ||
			index >= this.length ||
			-index > this.length
		) {
			return OptLazy(otherwise) as O;
		}
		if (index < 0) {
			return this.updateAt(this.length + index, update);
		}

		return this.leafBuilder.updateAt(index, update);
	};

	set = <O>(index: number, value: T, otherwise?: OptLazy<O>): T | O => {
		return this.updateAt(index, value, otherwise);
	};

	forEach = (
		f: (value: T, index: number, halt: () => void) => void,
		options: { reversed?: boolean; state?: TraverseState } = {},
	): void => {
		if (undefined === this.leafBuilder) return;

		const { reversed = false, state = TraverseState() } = options;

		if (state.halted) return;

		this._lock++;

		try {
			this.leafBuilder.forEach(f, { reversed, state });
		} finally {
			this._lock--;
		}
	};

	build = (): WithElem<Tp, T>['normal'] => {
		if (undefined === this.leafBuilder) {
			return this.context.empty();
		}
		const result = this.leafBuilder.build();
		return result;
	};
}
