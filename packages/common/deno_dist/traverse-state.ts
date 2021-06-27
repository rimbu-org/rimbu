/**
 * An object used to track the state of a traversal, e.g. a `forEach`.
 */
export interface TraverseState {
  /**
   * Returns true if the traversal has been halted by the user.
   */
  readonly halted: boolean;
  /**
   * Returns the current index of the traversal.
   */
  readonly currentIndex: number;

  /**
   * Increases the `currentIndex` of this traversal
   * @returns the next index that the traversal should use
   */
  nextIndex(): number;
  /**
   * Sets the `halted` value to true.
   */
  halt(): void;
  /**
   * Sets the `halted` value to false, and resets the `currentIndex`
   * value to its start value.
   */
  reset(): void;
}

class TraverseStateImpl implements TraverseState {
  currentIndex: number;
  halted = false;

  constructor(readonly startIndex: number) {
    this.currentIndex = startIndex;
  }

  nextIndex(): number {
    return this.currentIndex++;
  }

  halt = (): void => {
    this.halted = true;
  };

  reset(): void {
    this.currentIndex = this.startIndex;
    this.halted = false;
  }
}

/**
 * Returns a new `TraverseState` instance, using optionally given `startIndex` as a start
 * index value.
 * @param startIndex - (default: 0) the start index to use
 */
export function TraverseState(startIndex = 0): TraverseState {
  return new TraverseStateImpl(startIndex);
}
