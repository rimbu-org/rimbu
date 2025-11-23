/**
 * Utility namespace used by the sorted B‑tree implementations to encode
 * positions within a node.<br/>
 * <br/>
 * Non‑negative values represent entry indices, while negative values
 * represent child positions encoded using {@link SortedIndex.firstChild}
 * and the {@link SortedIndex.next} / {@link SortedIndex.prev} helpers.
 */
export namespace SortedIndex {
  /**
   * Returns the next encoded index after the given `index`.<br/>
   * <br/>
   * The sequence walks over both entries and children inside a node in
   * a consistent order and is used to traverse node contents.
   * @param index - the current encoded index
   */
  export function next(index: number): number {
    return index >= 0 ? -index - 2 : -index - 1;
  }

  /**
   * Returns the previous encoded index before the given `index`.<br/>
   * <br/>
   * Together with {@link SortedIndex.next} this allows iteration in
   * both directions over entries and children within a node.
   * @param index - the current encoded index
   */
  export function prev(index: number): number {
    return index >= 0 ? -index - 1 : -index - 2;
  }

  /**
   * Encoded index representing the position of the first child inside a node.
   * Used as a starting point when traversing children with
   * {@link SortedIndex.next} / {@link SortedIndex.prev}.
   */
  export const firstChild = -1;

  /**
   * Compares two encoded indices and returns a negative number if `i1` comes
   * before `i2`, a positive number if `i1` comes after `i2`, or `0` when
   * they represent the same position.
   * @param i1 - the first encoded index
   * @param i2 - the second encoded index
   */
  export function compare(i1: number, i2: number): number {
    if (Object.is(i1, i2)) return 0;

    const v1 = i1 >= 0 ? i1 : -i1 - 1.5;
    const v2 = i2 >= 0 ? i2 : -i2 - 1.5;

    return v1 - v2;
  }
}
