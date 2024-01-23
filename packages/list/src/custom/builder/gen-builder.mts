import { RimbuError } from '@rimbu/base';
import { OptLazy, TraverseState, type Update } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

import type { LeafBuilder, ListContext } from '@rimbu/list/custom';
import type { List } from '@rimbu/list';

export class GenBuilder<T> implements List.Builder<T> {
  constructor(readonly context: ListContext, public builder?: LeafBuilder<T>) {}

  _lock = 0;

  checkLock(): void {
    if (this._lock) {
      RimbuError.throwModifiedBuilderWhileLoopingOverItError();
    }
  }

  get length(): number {
    return this.builder?.length ?? 0;
  }

  get isEmpty(): boolean {
    return this.length === 0;
  }

  // prettier-ignore
  get = <O,>(index: number, otherwise?: OptLazy<O>): T | O => {
    if (
      undefined === this.builder ||
      index >= this.length ||
      -index > this.length
    ) {
      return OptLazy(otherwise) as O;
    }
    if (index < 0) {
      return this.get(this.length + index, otherwise);
    }

    return this.builder.get(index, otherwise);
  };

  // prettier-ignore
  updateAt = <O,>(
    index: number,
    update: Update<T>,
    otherwise?: OptLazy<O>
  ): T | O => {
    this.checkLock();

    if (
      undefined === this.builder ||
      index >= this.length ||
      -index > this.length
    ) {
      return OptLazy(otherwise) as O;
    }
    if (index < 0) {
      return this.updateAt(this.length + index, update);
    }

    return this.builder.updateAt(index, update);
  };

  // prettier-ignore
  set = <O,>(index: number, value: T, otherwise?: OptLazy<O>): T | O => {
    return this.updateAt(index, value, otherwise);
  };

  prepend = (value: T): void => {
    this.checkLock();

    if (undefined === this.builder) {
      this.builder = this.context.leafBlockBuilder([value]);
      return;
    }

    this.builder.prepend(value);
    this.builder = this.builder.normalized();
  };

  append = (value: T): void => {
    this.checkLock();

    if (undefined === this.builder) {
      this.builder = this.context.leafBlockBuilder([value]);
      return;
    }

    this.builder.append(value);
    this.builder = this.builder.normalized();
  };

  appendAll = (values: StreamSource<T>): void => {
    this.checkLock();

    if (Array.isArray(values)) {
      this.appendArray(values);
      return;
    }

    Stream.from(values).forEachPure(this.append);
  };

  appendFullOrLastWindow(window: T[]): void {
    const leafBlockBuilder = this.context.leafBlockBuilder(window);

    if (undefined === this.builder) {
      this.builder = leafBlockBuilder;
      return;
    }

    if (this.context.isLeafBlockBuilder(this.builder)) {
      this.builder = this.context.leafTreeBuilder(
        this.builder,
        leafBlockBuilder,
        undefined,
        this.builder.length + leafBlockBuilder.length
      );
      return;
    }

    if (this.context.isLeafTreeBuilder(this.builder)) {
      this.builder.appendMiddle(this.builder.right);
      this.builder.right = leafBlockBuilder;
      this.builder.length += leafBlockBuilder.length;
      return;
    }

    RimbuError.throwInvalidStateError();
  }

  appendArray(array: T[]): void {
    let index = 0;
    const blockSize = this.context.maxBlockSize;

    // fill last child
    if (undefined !== this.builder) {
      if (this.context.isLeafBlockBuilder(this.builder)) {
        index = blockSize - this.builder.length;

        if (index > 0) {
          const slice = array.slice(0, index);
          this.builder.children = this.builder.children.concat(slice);
        }
      } else if (this.context.isLeafTreeBuilder(this.builder)) {
        const left = this.builder.left;
        index = blockSize - left.length;

        if (index > 0) {
          const slice = array.slice(0, index);
          left.children = left.children.concat(slice);
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

  insert = (index: number, value: T): void => {
    this.checkLock();

    if (undefined === this.builder) {
      this.builder = this.context.leafBlockBuilder([value]);
    } else {
      if (index === 0) {
        return this.prepend(value);
      }
      if (index > this.length || -index > this.length + 1) {
        return this.append(value);
      }
      if (index < 0) {
        return this.insert(this.length + index, value);
      }

      this.builder.insert(index, value);
      this.builder = this.builder.normalized();
    }
  };

  // prettier-ignore
  remove = <O,>(index: number, otherwise?: OptLazy<O>): T | O => {
    this.checkLock();

    if (
      undefined === this.builder ||
      index >= this.length ||
      -index > this.length
    ) {
      return OptLazy(otherwise) as O;
    }

    if (index < 0) {
      return this.remove(this.length + index);
    }

    const result = this.builder.remove(index);
    this.builder = this.builder.normalized();

    return result;
  };

  forEach = (
    f: (value: T, index: number, halt: () => void) => void,
    options: { reversed?: boolean; state?: TraverseState } = {}
  ): void => {
    const { reversed = false, state = TraverseState() } = options;

    if (undefined !== this.builder) {
      if (state.halted) return;

      this._lock++;

      try {
        this.builder.forEach(f, { reversed, state });
      } finally {
        this._lock--;
      }
    }
  };

  build = (): List<T> => {
    if (undefined === this.builder) {
      return this.context.empty();
    }
    const result = this.builder.build();
    return result;
  };

  // prettier-ignore
  buildMap = <T2,>(f: (value: T) => T2): List<T2> => {
    if (undefined === this.builder) {
      return this.context.empty();
    }
    return this.builder.buildMap(f);
  };
}
