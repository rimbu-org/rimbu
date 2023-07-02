/**
 * A range definition for any type of (orderable) value.
 * If a start or end is defined, a tuple can be used where the second item is a boolean
 * indicating whether that end is inclusive (true) or exclusive (false).<br/>
 * A Range of type T can have one of the following forms:<br/>
 * <br/>
 * - { end: T }<br/>
 * - { end: [T, boolean] }<br/>
 * - { start: T }<br/>
 * - { start: T, end: T }<br/>
 * - { start: T, end: [T, boolean] }<br/>
 * - { start: [T, boolean] }<br/>
 * - { start: [T, boolean], end: T }<br/>
 * - { start: [T, boolean], end: [T, boolean] }<br/>
 */
export type Range<T> =
  | { start: T | [T, boolean]; end?: T | [T, boolean]; amount?: undefined }
  | { start?: T | [T, boolean]; end: T | [T, boolean]; amount?: undefined };

export namespace Range {
  /**
   * Simplifies a given `range` `Range` input for easier processing, by returning optional
   * start and end ranges including whether they are inclusive or exclusive
   * @param range - the `Range` to use
   */
  export function getNormalizedRange<T>(range: Range<T>): {
    start?: [T, boolean] | undefined;
    end?: [T, boolean] | undefined;
  } {
    let start: [T, boolean] | undefined = undefined;
    let end: [T, boolean] | undefined = undefined;

    if (`start` in range && undefined !== range.start) {
      if (
        Array.isArray(range.start) &&
        range.start.length === 2 &&
        typeof range.start[1] === 'boolean'
      ) {
        start = range.start;
      } else {
        start = [range.start as T, true];
      }
    }
    if (`end` in range && undefined !== range.end) {
      if (
        Array.isArray(range.end) &&
        range.end.length === 2 &&
        typeof range.end[1] === 'boolean'
      ) {
        end = range.end;
      } else {
        end = [range.end as T, true];
      }
    }

    return { start, end };
  }
}
