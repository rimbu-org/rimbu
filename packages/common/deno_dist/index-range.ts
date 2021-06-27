import { Range } from './internal.ts';

/**
 * A flexible range specification for numeric indices.
 * If a start or end is defined, a tuple can be used where the second item is a boolean
 * indicating whether that end is inclusive or exclusive.
 * An IndexRange can have one of the following forms:
 * - { amount: number }
 * - { start: number }
 * - { start: number, amount: number }
 * - { start: number, end: number }
 * - { start: number, end: [number, boolean] }
 * - { start: [number, boolean] }
 * - { start: [number, boolean], amount: number }
 * - { start: [number, boolean], end: number }
 * - { start: [number, boolean], end: [number, boolean] }
 * - { end: number }
 * - { end: [number, boolean] }
 */
export type IndexRange =
  | { amount: number; start?: number | [number, boolean]; end?: undefined }
  | Range<number>;

export namespace IndexRange {
  /**
   * Returns, given the `range` `IndexRange`, a normalized tuple containing the
   * start index, and optionally an end index.
   * @param range - the `IndexRange` to use
   */
  export function getIndexRangeIndices(
    range: IndexRange
  ): [number, number | undefined] {
    if (undefined !== range.amount) {
      if (undefined === range.start) return [0, range.amount - 1];

      if (Array.isArray(range.start)) {
        const [start, includeStart] = range.start;
        if (includeStart) return [start, start + range.amount - 1];
        return [start + 1, start + 1 + range.amount - 1];
      }
      return [range.start, range.start + range.amount - 1];
    }

    let start = 0;
    let end: number | undefined = undefined;

    if (`start` in range) {
      if (Array.isArray(range.start)) {
        if (range.start[1]) start = range.start[0];
        else start = range.start[0] + 1;
      } else start = range.start ?? 0;
    }

    if (`end` in range) {
      if (Array.isArray(range.end)) {
        if (range.end[1]) end = range.end[0];
        else end = range.end[0] - 1;
      } else end = range.end;
    }

    return [start, end];
  }

  /**
   * Returns, given the `range` `IndexRange`, and a target maximum `length`, the actual index range.
   * This can be one of three options:
   * - 'empty': there are no elements within the range
   * - 'all': all elements are within the range
   * - [start: number, end: number]: an inclusive range of element indices within the given range
   * @param range - the `IndexRange` to use
   * @param length - the target maximum length
   */
  export function getIndicesFor(
    range: IndexRange,
    length: number
  ): [number, number] | 'empty' | 'all' {
    if (length <= 0) return 'empty';

    let start = 0;
    let end = length - 1;

    if (undefined !== range.start) {
      if (Array.isArray(range.start)) {
        start = range.start[0];
        if (!range.start[1]) start++;
      } else start = range.start;

      if (start >= length || -start > length) return 'empty';
      if (start < 0) start = length + start;
    }

    if (undefined !== range.amount) {
      if (range.amount <= 0) return 'empty';
      if (undefined === range.start) {
        if (range.amount >= length) return 'all';
        return [0, Math.min(end, range.amount - 1)];
      }

      end = start + range.amount - 1;
    } else if (undefined !== range.end) {
      if (Array.isArray(range.end)) {
        end = range.end[0];
        if (!range.end[1]) {
          if (end === 0) return 'empty';
          end--;
        }
      } else end = range.end;

      if (end < 0) end = length + end;
    }

    if (end < start) return 'empty';
    end = Math.min(length - 1, end);

    if (start === 0 && end === length - 1) return 'all';

    return [start, end];
  }
}
