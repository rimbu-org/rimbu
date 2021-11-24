import { RimbuError } from '@rimbu/base';
import { OptLazy, TraverseState, Update } from '@rimbu/common';
import { Stream, StreamSource } from '@rimbu/stream';
import type { List } from '../internal';
import type { LeafBuilder, ListContext } from '../list-custom';

export class GenBuilder<T> implements List.Builder<T> {
  constructor(readonly context: ListContext, public builder?: LeafBuilder<T>) {}

  _lock = 0;

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  get length(): number {
    return this.builder?.length ?? 0;
  }

  get isEmpty(): boolean {
    return this.length === 0;
  }

  get = <O>(index: number, otherwise?: OptLazy<O>): T | O => {
    if (
      undefined === this.builder ||
      index >= this.length ||
      -index > this.length
    ) {
      return OptLazy(otherwise) as O;
    }
    if (index < 0) return this.get(this.length + index, otherwise);

    return this.builder.get(index, otherwise);
  };

  updateAt = <O>(
    index: number,
    update: Update<T>,
    otherwise?: OptLazy<O>
  ): T | O => {
    this.checkLock();

    if (
      undefined === this.builder ||
      index >= this.length ||
      -index > this.length
    )
      return OptLazy(otherwise) as O;
    if (index < 0) return this.updateAt(this.length + index, update);

    return this.builder.updateAt(index, update);
  };

  set = <O>(index: number, value: T, otherwise?: OptLazy<O>): T | O => {
    return this.updateAt(index, value, otherwise);
  };

  prepend = (value: T): void => {
    this.checkLock();

    if (undefined === this.builder) {
      this.builder = this.context.leafBlockBuilder([value]);
    } else if (
      this.context.isLeafBlockBuilder(this.builder) &&
      this.builder.nrChildren >= this.context.maxBlockSize
    ) {
      this.builder.prepend(value);
      const newLength = this.length;
      const newRight = this.builder.splitRight();
      this.builder = this.context.leafTreeBuilder<T>(
        this.builder,
        newRight,
        undefined,
        newLength
      );
    } else {
      this.builder.prepend(value);
    }
  };

  append = (value: T): void => {
    this.checkLock();

    if (undefined === this.builder) {
      this.builder = this.context.leafBlockBuilder([value]);
    } else if (
      this.context.isLeafBlockBuilder(this.builder) &&
      this.builder.nrChildren >= this.context.maxBlockSize
    ) {
      this.builder.append(value);
      const newLength = this.length;
      const newRight = this.builder.splitRight();
      this.builder = this.context.leafTreeBuilder<T>(
        this.builder,
        newRight,
        undefined,
        newLength
      );
    } else {
      this.builder.append(value);
    }
  };

  appendAll = (values: StreamSource<T>): void => {
    this.checkLock();

    if (Array.isArray(values)) {
      this.appendArray(values);
      return;
    }

    Stream.from(values).forEach(this.append);
  };

  appendArray(array: T[], from = 0): void {
    this.checkLock();

    if (array.length === 0 || from >= array.length) return;

    if (undefined === this.builder) {
      const items = array.slice(from, this.context.maxBlockSize);
      this.builder = this.context.leafBlockBuilder(items);

      return this.appendArray(array, from + items.length);
    }

    if (this.context.isLeafBlockBuilder(this.builder)) {
      if (this.builder.nrChildren < this.context.maxBlockSize) {
        const items = array.slice(
          from,
          from + this.context.maxBlockSize - this.builder.nrChildren
        );
        this.builder.children = this.builder.children.concat(items);
        return this.appendArray(array, from + items.length);
      }

      const secondItems = array.slice(from, from + this.context.maxBlockSize);
      const secondBlock = this.context.leafBlockBuilder(secondItems);
      this.builder = this.context.leafTreeBuilder<T>(
        this.builder,
        secondBlock,
        undefined,
        this.builder.length + secondBlock.length
      );
      return this.appendArray(array, from + secondItems.length);
    }

    if (this.context.isLeafTreeBuilder(this.builder)) {
      this.builder.appendChildren(array, from);
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

  remove = <O>(index: number, otherwise?: OptLazy<O>): T | O => {
    this.checkLock();

    if (
      undefined === this.builder ||
      index >= this.length ||
      -index > this.length
    ) {
      return OptLazy(otherwise) as O;
    }

    if (index < 0) return this.remove(this.length + index);

    const result = this.builder.remove(index);
    this.builder = this.builder.normalized();

    return result;
  };

  forEach = (
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void => {
    if (state.halted) return;

    this._lock++;

    if (undefined !== this.builder) {
      this.builder.forEach(f, state);
    }

    this._lock--;
  };

  build = (): List<T> => {
    if (undefined === this.builder) return this.context.empty();
    const result = this.builder.build();
    return result;
  };

  buildMap = <T2>(f: (value: T) => T2): List<T2> => {
    if (undefined === this.builder) return this.context.empty();
    return this.builder.buildMap(f);
  };
}
