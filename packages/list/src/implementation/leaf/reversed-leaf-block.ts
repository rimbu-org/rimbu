import { Arr } from '@rimbu/base';
import { IndexRange, OptLazy, Update } from '@rimbu/common';
import { Stream } from '@rimbu/stream';
import { LeafBlock } from '../../list-custom';

export class ReversedLeafBlock<T> extends LeafBlock<T> {
  copy(children: readonly T[]): LeafBlock<T> {
    if (children === this.children) return this;
    return new ReversedLeafBlock(this.context, children);
  }

  copy2<T2>(children: readonly T2[]): LeafBlock<T2> {
    return new ReversedLeafBlock(this.context, children);
  }

  stream(reversed = false): Stream.NonEmpty<T> {
    return Stream.fromArray(
      this.children,
      undefined,
      !reversed
    ) as Stream.NonEmpty<T>;
  }

  streamRange(range: IndexRange, reversed = false): Stream<T> {
    const indices = IndexRange.getIndicesFor(range, this.length);
    if (indices === 'empty') return Stream.empty();
    if (indices === 'all') return this.stream(reversed);

    const start = this.length - 1 - indices[1];
    const end = this.length - 1 - indices[0];
    return Stream.fromArray(this.children, { start, end }, !reversed);
  }

  get<O>(index: number, otherwise?: OptLazy<O>): T | O {
    if (index >= this.length || -index > this.length) {
      return OptLazy(otherwise) as O;
    }
    if (index < 0) {
      return this.get(this.length + index, otherwise);
    }

    return this.children[this.length - 1 - index];
  }

  prependInternal(value: T): LeafBlock<T> {
    return super.appendInternal(value);
  }

  appendInternal(value: T): LeafBlock<T> {
    return super.prependInternal(value);
  }

  takeChildren(childAmount: number): LeafBlock<T> {
    return super.dropChildren(this.length - childAmount);
  }

  dropChildren(childAmount: number): LeafBlock<T> {
    return super.takeChildren(this.length - childAmount);
  }

  concatChildren(other: LeafBlock<T>): LeafBlock<T> {
    if (other instanceof ReversedLeafBlock) {
      return this.copy(other.children.concat(this.children));
    }

    return other.copy(Arr.reverse(this.children).concat(other.children));
  }

  updateAt(index: number, update: Update<T>): LeafBlock<T> {
    if (index >= this.length || -index > this.length) return this;
    if (index < 0) return this.updateAt(this.length + index, update);

    return super.updateAt(this.length - 1 - index, update);
  }

  map<T2>(
    mapFun: (value: T, index: number) => T2,
    reversed = false,
    indexOffset = 0
  ): LeafBlock<T2> {
    if (!reversed) {
      const newChildren = Arr.reverseMap(this.children, mapFun, indexOffset);
      return super.copy2(newChildren);
    }

    const newChildren = Arr.map(this.children, mapFun, indexOffset);
    return this.copy2(newChildren);
  }

  reversed(): LeafBlock<T> {
    return this.context.leafBlock(this.children);
  }

  toArray(range?: IndexRange, reversed = false): T[] | any {
    let result: readonly T[];

    if (undefined === range) result = this.children;
    else {
      const indexRange = IndexRange.getIndicesFor(range, this.length);

      if (indexRange === 'empty') return [];
      else if (indexRange === 'all') result = this.children;
      else {
        const [indexStart, indexEnd] = indexRange;
        const start = this.length - 1 - indexEnd;
        const end = this.length - 1 - indexStart;
        if (!reversed) return Arr.reverse(this.children, start, end);
        return this.children.slice(start, end + 1);
      }
    }

    if (!reversed) return Arr.reverse(result);
    return result.slice();
  }

  _mutateSplitRight(childIndex = this.children.length >>> 1): LeafBlock<T> {
    const rightChildren = this.mutateChildren.splice(0, childIndex);

    return this.copy(rightChildren);
  }

  structure(): string {
    return `<RLeaf ${this.length}>`;
  }
}
