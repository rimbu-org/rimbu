import { OptLazy, TraverseState, Update } from '@rimbu/common';
import type { BlockBuilder, ListContext } from '../../list-custom';
import { NonLeafBlockBuilder, NonLeafBuilder } from '../../list-custom';

export abstract class TreeBuilderBase<T, C> {
  abstract readonly context: ListContext;
  abstract readonly level: number;
  abstract left: BlockBuilder<T, C>;
  abstract right: BlockBuilder<T, C>;
  abstract middle?: NonLeafBuilder<T, BlockBuilder<T, C>>;
  abstract length: number;
  abstract getChildLength(child: C): number;

  get<O>(index: number, otherwise?: OptLazy<O>): T | O {
    const middleIndex = index - this.left.length;

    if (middleIndex < 0) return this.left.get(index, otherwise);

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
      this.left.prepend(child);
      return;
    }

    if (undefined !== this.middle) {
      const delta = this.middle.modifyFirstChild((firstChild):
        | number
        | undefined => {
        if (firstChild.nrChildren < this.context.maxBlockSize) {
          const shiftChild = this.left.dropLast();
          this.left.prepend(child);
          firstChild.prepend(shiftChild);
          return this.getChildLength(shiftChild);
        }
        return;
      });

      if (undefined !== delta) return;
    } else if (this.right.nrChildren < this.context.maxBlockSize) {
      const shiftChild = this.left.dropLast();
      this.left.prepend(child);
      this.right.prepend(shiftChild);
      return;
    }

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
      const delta = this.middle.modifyLastChild((lastChild):
        | number
        | undefined => {
        if (lastChild.nrChildren < this.context.maxBlockSize) {
          const shiftChild = this.right.dropFirst();
          this.right.append(child);
          lastChild.append(shiftChild);
          return this.getChildLength(shiftChild);
        }
        return;
      });

      if (undefined !== delta) return;
    } else if (this.left.nrChildren < this.context.maxBlockSize) {
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
        const delta = this.middle.modifyFirstChild((firstChild):
          | number
          | undefined => {
          if (firstChild.nrChildren > this.context.minBlockSize) {
            // left borrows from middle's first grandChild
            const shiftChild = firstChild.dropFirst();
            this.left.append(shiftChild);
            return -this.getChildLength(shiftChild);
          }
          return;
        });

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
        const delta = this.middle.modifyLastChild((lastChild):
          | number
          | undefined => {
          if (lastChild.nrChildren > this.context.minBlockSize) {
            const shiftChild = lastChild.dropLast();
            this.right.prepend(shiftChild);
            return -this.getChildLength(shiftChild);
          }
          return;
        });

        // if borrow was succesful
        if (undefined !== delta) return oldValue;

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
      this.left.insert(index, value);

      if (this.left.nrChildren <= this.context.maxBlockSize) return;

      if (undefined !== this.middle) {
        // try shift to middle
        const delta = this.middle.modifyFirstChild((firstChild):
          | number
          | undefined => {
          if (firstChild.nrChildren < this.context.maxBlockSize) {
            const shiftChild = this.left.dropLast();
            firstChild.prepend(shiftChild);
            return this.getChildLength(shiftChild);
          }
          return;
        });

        if (undefined !== delta) return;
      } else if (this.right.nrChildren < this.context.maxBlockSize) {
        // try to shift to right
        const shiftChild = this.left.dropLast();
        this.right.prepend(shiftChild);
        return;
      }

      // prepend block to middle
      const toMiddle = this.left.splitRight(1);
      this.prependMiddle(toMiddle);
      return;
    }

    const rightIndex = middleIndex - (this.middle?.length ?? 0);

    if (undefined === this.middle || rightIndex >= 0) {
      this.right.insert(rightIndex, value);

      if (this.right.nrChildren <= this.context.maxBlockSize) return;

      if (undefined !== this.middle) {
        // try to shift child to middle last
        const delta = this.middle.modifyLastChild((lastChild):
          | number
          | undefined => {
          if (lastChild.nrChildren < this.context.maxBlockSize) {
            const shiftChild = this.right.dropFirst();
            lastChild.append(shiftChild);
            return this.getChildLength(shiftChild);
          }
          return;
        });

        if (undefined !== delta) return;
      } else if (this.left.nrChildren < this.context.maxBlockSize) {
        // try to shift child to left
        const shiftChild = this.right.dropFirst();
        this.left.append(shiftChild);
        return;
      }

      const newRight = this.right.splitRight(this.context.maxBlockSize);
      this.appendMiddle(this.right);
      this.right = newRight;
      return;
    }

    this.middle.insert(middleIndex, value);
    this.middle = this.middle.normalized();
  }

  prependMiddle(child: BlockBuilder<T, C>): void {
    if (undefined === this.middle) {
      this.middle = this.context.nonLeafBlockBuilder(
        this.level + 1,
        [child],
        child.length
      );
    } else if (this.middle instanceof NonLeafBlockBuilder) {
      if (child.nrChildren < this.context.minBlockSize) {
        this.middle.length += child.length;
        const firstChild = this.middle.first();
        child.concat(firstChild);

        if (child.nrChildren <= this.context.maxBlockSize) {
          this.middle.children[0] = child;
          return;
        }

        const newRight = child.splitRight();
        this.middle.children.splice(0, 1, child, newRight);

        this.middle = this.middle.normalized();
      } else if (this.middle.nrChildren >= this.context.maxBlockSize) {
        const newLength = this.middle.length + child.length;
        this.middle.prepend(child);
        const newRight = this.middle.splitRight();
        this.middle = this.context.nonLeafTreeBuilder(
          this.level + 1,
          this.middle,
          newRight,
          undefined,
          newLength
        );
      } else {
        this.middle.prepend(child);
      }
    } else {
      this.middle.prepend(child);
    }
  }

  appendMiddle(child: BlockBuilder<T, C>): void {
    if (undefined === this.middle) {
      this.middle = this.context.nonLeafBlockBuilder(
        this.level + 1,
        [child],
        child.length
      );
    } else if (this.middle instanceof NonLeafBlockBuilder) {
      if (child.nrChildren < this.context.minBlockSize) {
        const lastChild = this.middle.last();
        lastChild.concat(child);

        if (lastChild.nrChildren <= this.context.maxBlockSize) return;

        const newRight = lastChild.splitRight();
        this.middle.append(newRight);

        this.middle = this.middle.normalized();
      } else if (this.middle.nrChildren >= this.context.maxBlockSize) {
        const newLength = this.middle.length + child.length;
        this.middle.append(child);
        const newRight = this.middle.splitRight();
        this.middle = this.context.nonLeafTreeBuilder(
          this.level + 1,
          this.middle,
          newRight,
          undefined,
          newLength
        );
      } else {
        this.middle.append(child);
      }
    } else {
      this.middle.append(child);
    }
  }

  dropFirst(): C {
    const first = this.left.dropFirst();
    this.length -= this.getChildLength(first);
    if (this.left.nrChildren >= this.context.minBlockSize) return first;

    if (undefined !== this.middle) {
      const delta = this.middle.modifyFirstChild((firstChild):
        | number
        | undefined => {
        if (firstChild.nrChildren > this.context.minBlockSize) {
          const shiftChild = firstChild.dropFirst();
          this.left.append(shiftChild);
          return -this.getChildLength(shiftChild);
        }
        return;
      });

      if (undefined !== delta) return first;

      const middleFirst = this.middle.dropFirst();
      this.middle = this.middle.normalized();
      this.left.concat(middleFirst);
      return first;
    }

    if (this.right.nrChildren > this.context.minBlockSize) {
      const shiftChild = this.right.dropFirst();
      this.left.append(shiftChild);
      return first;
    }

    // parent will normalize
    return first;
  }

  dropLast(): C {
    const last = this.right.dropLast();
    this.length -= this.getChildLength(last);
    if (this.right.nrChildren >= this.context.minBlockSize) return last;

    if (undefined !== this.middle) {
      const delta = this.middle.modifyLastChild((lastChild):
        | number
        | undefined => {
        if (lastChild.nrChildren > this.context.minBlockSize) {
          const shiftChild = lastChild.dropLast();
          this.right.prepend(shiftChild);
          return -this.getChildLength(shiftChild);
        }
        return;
      });

      if (undefined !== delta) return last;

      const middleLast = this.middle.dropLast();
      middleLast.concat(this.right);
      this.middle = this.middle.normalized();
      this.right = middleLast;
      return last;
    }

    if (this.left.nrChildren > this.context.minBlockSize) {
      const shiftChild = this.left.dropLast();
      this.right.prepend(shiftChild);
      return last;
    }

    // parent will normalize
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
