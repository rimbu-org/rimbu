import { OptLazy, TraverseState, Update } from '@rimbu/common';

import type {
  BlockBuilder,
  ListContext,
  NonLeafBuilder,
} from '@rimbu/list/custom';

export abstract class TreeBuilderBase<T, C> {
  abstract get context(): ListContext;
  abstract get level(): number;
  abstract get left(): BlockBuilder<T, C>;
  abstract set left(value: BlockBuilder<T, C>);
  abstract get right(): BlockBuilder<T, C>;
  abstract set right(value: BlockBuilder<T, C>);
  abstract get middle(): NonLeafBuilder<T, BlockBuilder<T, C>> | undefined;
  abstract set middle(value: NonLeafBuilder<T, BlockBuilder<T, C>> | undefined);
  abstract get length(): number;
  abstract set length(value: number);
  abstract getChildLength(child: C): number;

  get<O>(index: number, otherwise?: OptLazy<O>): T | O {
    const middleIndex = index - this.left.length;

    if (middleIndex < 0) {
      return this.left.get(index, otherwise);
    }

    if (undefined === this.middle) {
      return this.right.get(middleIndex, otherwise);
    }

    const rightIndex = middleIndex - this.middle.length;
    if (rightIndex >= 0) return this.right.get(rightIndex, otherwise);

    return this.middle.get(middleIndex, otherwise);
  }

  updateAt<O>(index: number, update: Update<T>, otherwise?: OptLazy<O>): T | O {
    const middleIndex = index - this.left.length;

    if (middleIndex < 0) {
      return this.left.updateAt(index, update, otherwise);
    }

    if (undefined === this.middle) {
      return this.right.updateAt(middleIndex, update, otherwise);
    }

    const rightIndex = middleIndex - this.middle.length;
    if (rightIndex >= 0) {
      return this.right.updateAt(rightIndex, update, otherwise);
    }

    return this.middle.updateAt(middleIndex, update, otherwise);
  }

  prepend(child: C): void {
    this.length += this.getChildLength(child);

    if (this.left.nrChildren < this.context.maxBlockSize) {
      // can prepend to left
      this.left.prepend(child);
      return;
    }

    if (undefined !== this.middle) {
      const delta = this.middle.modifyFirstChild(
        (firstChild): number | undefined => {
          if (firstChild.nrChildren < this.context.maxBlockSize) {
            const shiftChild = this.left.dropLast();
            this.left.prepend(child);
            firstChild.prepend(shiftChild);
            return this.getChildLength(shiftChild);
          }
          return;
        }
      );

      if (undefined !== delta) {
        return;
      }
    } else if (this.right.nrChildren < this.context.maxBlockSize) {
      // right not full, shift last left child to right
      const shiftChild = this.left.dropLast();
      this.left.prepend(child);
      this.right.prepend(shiftChild);
      return;
    }

    // move current left to middle
    this.left.prepend(child);
    const toMiddle = this.left.splitRight(1);

    this.prependMiddle(toMiddle);
  }

  append(child: C): void {
    this.length += this.getChildLength(child);

    if (this.right.nrChildren < this.context.maxBlockSize) {
      this.right.append(child);
      return;
    }

    if (undefined !== this.middle) {
      // try to shift to last middle child
      const delta = this.middle.modifyLastChild(
        (lastChild): number | undefined => {
          if (lastChild.nrChildren < this.context.maxBlockSize) {
            const shiftChild = this.right.dropFirst();
            this.right.append(child);
            lastChild.append(shiftChild);
            return this.getChildLength(shiftChild);
          }
          return;
        }
      );

      if (undefined !== delta) return;
    } else if (this.left.nrChildren < this.context.maxBlockSize) {
      // shift first right to left
      const shiftChild = this.right.dropFirst();
      this.right.append(child);
      this.left.append(shiftChild);
      return;
    }

    // append right to middle
    this.right.append(child);
    const newRight = this.right.splitRight(this.context.maxBlockSize);

    this.appendMiddle(this.right);
    this.right = newRight;
  }

  remove(index: number): T {
    this.length--;

    const middleIndex = index - this.left.length;

    if (middleIndex < 0) {
      // remove from left
      const oldValue = this.left.remove(index);

      if (this.left.nrChildren >= this.context.minBlockSize) return oldValue;
      // rebalancing is needed

      if (undefined !== this.middle) {
        // left borrows from middle
        const delta = this.middle.modifyFirstChild(
          (firstChild): number | undefined => {
            if (firstChild.nrChildren > this.context.minBlockSize) {
              // left borrows from middle's first grandChild
              const shiftChild = firstChild.dropFirst();
              this.left.append(shiftChild);
              return -this.getChildLength(shiftChild);
            }
            return;
          }
        );

        // if borrow was succesful
        if (undefined !== delta) return oldValue;

        // need to merge middle's first child with left
        const middleFirst = this.middle.dropFirst();
        this.middle = this.middle.normalized();
        this.left.concat(middleFirst);
      } else if (this.right.nrChildren > this.context.minBlockSize) {
        // left merges with right's first child
        const shiftChild = this.right.dropFirst();
        this.left.append(shiftChild);
      }

      return oldValue;
    }

    const rightIndex = middleIndex - (this.middle?.length ?? 0);

    if (undefined === this.middle || rightIndex >= 0) {
      // remove from right
      const oldValue = this.right.remove(rightIndex);

      if (this.right.nrChildren >= this.context.minBlockSize) return oldValue;
      // rebalancing is needed

      if (undefined !== this.middle) {
        // right borrows from middle
        const delta = this.middle.modifyLastChild(
          (lastChild): number | undefined => {
            if (lastChild.nrChildren > this.context.minBlockSize) {
              const shiftChild = lastChild.dropLast();
              this.right.prepend(shiftChild);
              return -this.getChildLength(shiftChild);
            }
            return;
          }
        );

        if (undefined !== delta) {
          //  borrow was succesful
          return oldValue;
        }

        // need to merge middle's last child with right
        const middleLast = this.middle.dropLast();
        this.middle = this.middle.normalized();
        middleLast.concat(this.right);
        this.right = middleLast;
      } else if (this.left.nrChildren > this.context.minBlockSize) {
        // right borrows from left
        const shiftChild = this.left.dropLast();
        this.right.prepend(shiftChild);
      }

      return oldValue;
    }

    // remove from middle
    const oldValue = this.middle.remove(middleIndex);
    this.middle = this.middle.normalized();
    return oldValue;
  }

  insert(index: number, value: T): void {
    this.length++;

    const middleIndex = index - this.left.length;

    if (middleIndex <= 0) {
      // insert left
      this.left.insert(index, value);

      if (this.left.nrChildren <= this.context.maxBlockSize) {
        // no need to rebalance
        return;
      }

      if (undefined !== this.middle) {
        // try shift child from left to middle
        const delta = this.middle.modifyFirstChild(
          (firstChild): number | undefined => {
            if (firstChild.nrChildren < this.context.maxBlockSize) {
              const shiftChild = this.left.dropLast();
              firstChild.prepend(shiftChild);
              return this.getChildLength(shiftChild);
            }
            return;
          }
        );

        if (undefined !== delta) {
          // shift succeeded
          return;
        }
      } else if (this.right.nrChildren < this.context.maxBlockSize) {
        // try to shift child from left to right
        const shiftChild = this.left.dropLast();
        this.right.prepend(shiftChild);
        return;
      }

      // split left and prepend block to middle
      const toMiddle = this.left.splitRight(1);
      this.prependMiddle(toMiddle);
      return;
    }

    const rightIndex = middleIndex - (this.middle?.length ?? 0);

    if (undefined === this.middle || rightIndex >= 0) {
      // insert in right block
      this.right.insert(rightIndex, value);

      if (this.right.nrChildren <= this.context.maxBlockSize) {
        // no need to rebalance
        return;
      }

      if (undefined !== this.middle) {
        // try to shift child from right to middle last
        const delta = this.middle.modifyLastChild(
          (lastChild): number | undefined => {
            if (lastChild.nrChildren < this.context.maxBlockSize) {
              const shiftChild = this.right.dropFirst();
              lastChild.append(shiftChild);
              return this.getChildLength(shiftChild);
            }
            return;
          }
        );

        if (undefined !== delta) {
          // shift succeeded
          return;
        }
      } else if (this.left.nrChildren < this.context.maxBlockSize) {
        // shift child from right to left
        const shiftChild = this.right.dropFirst();
        this.left.append(shiftChild);
        return;
      }

      // split right and append block to middle
      const newRight = this.right.splitRight(this.context.maxBlockSize);
      this.appendMiddle(this.right);
      this.right = newRight;
      return;
    }

    // insert into middle
    this.middle.insert(middleIndex, value);
    this.middle = this.middle.normalized();
  }

  prependMiddle(child: BlockBuilder<T, C>): void {
    if (undefined === this.middle) {
      // no middle, create it with child
      this.middle = this.context.nonLeafBlockBuilder(
        this.level + 1,
        [child],
        child.length
      );

      return;
    }

    if (child.nrChildren >= this.context.minBlockSize) {
      // child size enough for its own middle block
      this.middle.prepend(child);
      this.middle = this.middle.normalized();

      return;
    }

    // child size too small for own block, need to combine with first middle block
    const firstMiddleChild = this.middle.first();

    if (
      child.nrChildren + firstMiddleChild.nrChildren <=
      this.context.maxBlockSize
    ) {
      // can merge child into firstMiddleChild
      firstMiddleChild.concat(child, true);
      this.middle.length += child.length;

      return;
    }

    // need to replace firstMiddleChild with two split blocks
    this.middle.dropFirst();
    child.concat(firstMiddleChild);
    const newSecondChild = child.splitRight();
    this.middle.prepend(newSecondChild);
    this.middle.prepend(child);
    this.middle = this.middle.normalized();
  }

  appendMiddle(child: BlockBuilder<T, C>): void {
    if (undefined === this.middle) {
      // no middle, create it with child
      this.middle = this.context.nonLeafBlockBuilder(
        this.level + 1,
        [child],
        child.length
      );

      return;
    }

    if (child.nrChildren >= this.context.minBlockSize) {
      // child size enough for its own middle block

      this.middle.append(child);
      this.middle = this.middle.normalized();

      return;
    }

    // child size too small for own block, need to combine with last middle block
    const lastMiddleChild = this.middle.last();

    if (
      child.nrChildren + lastMiddleChild.nrChildren <=
      this.context.maxBlockSize
    ) {
      // can merge child into lastMiddleChild
      lastMiddleChild.concat(child);
      this.middle.length += child.length;

      return;
    }

    // need to split lastMiddleChild and append new right
    lastMiddleChild.concat(child);
    const newLast = lastMiddleChild.splitRight();
    this.middle.append(newLast);
    this.middle = this.middle.normalized();
  }

  dropFirst(): C {
    // remove first child from left
    const first = this.left.dropFirst();
    this.length -= this.getChildLength(first);

    if (this.left.nrChildren >= this.context.minBlockSize) {
      // enough children left, nothing else to do
      return first;
    }

    // left does not have enough children

    if (undefined !== this.middle) {
      const firstMiddle = this.middle.first();

      if (
        this.left.nrChildren + firstMiddle.nrChildren <=
        this.context.maxBlockSize
      ) {
        // can merge left and first middle
        this.middle.dropFirst();
        this.middle = this.middle.normalized();
        this.left.concat(firstMiddle);

        return first;
      }

      // can shift from first middle child
      const shiftChild = firstMiddle.dropFirst();
      this.middle.length -= this.getChildLength(shiftChild);
      this.left.append(shiftChild);

      return first;
    }

    // no middle
    // left size = min - 1
    // if left + right <= max, parent needs to normalize
    // otherwise, shift from right to left
    if (
      this.left.nrChildren + this.right.nrChildren >
      this.context.maxBlockSize
    ) {
      const shiftChild = this.right.dropFirst();
      this.left.append(shiftChild);

      return first;
    }

    // assume parent will normalize
    return first;
  }

  dropLast(): C {
    // remove last child from right
    const last = this.right.dropLast();
    this.length -= this.getChildLength(last);

    if (this.right.nrChildren >= this.context.minBlockSize) {
      // enough children left, nothing else to do
      return last;
    }

    // right does not have enough children

    if (undefined !== this.middle) {
      const lastMiddle = this.middle.last();

      if (
        lastMiddle.nrChildren + this.right.nrChildren <=
        this.context.maxBlockSize
      ) {
        // can merge last middle and right
        this.middle.dropLast();
        this.middle = this.middle.normalized();
        this.right.concat(lastMiddle, true);

        return last;
      }

      const shiftChild = lastMiddle.dropLast();
      this.middle.length -= this.getChildLength(shiftChild);
      this.right.prepend(shiftChild);

      return last;
    }

    // no middle
    // right size = min - 1
    // if left + right <= max, parent needs to normalize
    // otherwise, shift from left to right
    if (
      this.left.nrChildren + this.right.nrChildren >
      this.context.maxBlockSize
    ) {
      const shiftChild = this.left.dropLast();
      this.right.prepend(shiftChild);

      return last;
    }

    // assume parent will normalize
    return last;
  }

  forEach(
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted) return;
    this.left.forEach(f, state);

    if (state.halted) return;

    if (undefined !== this.middle) {
      this.middle.forEach(f, state);
      if (state.halted) return;
    }

    this.right.forEach(f, state);
  }
}
