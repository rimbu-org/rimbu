/**
 * Regular expression used to split a path string into tokens.
 */
export const stringSplitRegex = /\?\.|\.|\[|\]/g;

/**
 * The allowed values of a split path.
 */
export type StringSplit = (string | number | undefined)[];

/**
 * Return the given `path` string split into an array of subpaths.
 * @param path - the input string path
 */
export function stringSplit(path: string): StringSplit {
  return path.split(stringSplitRegex);
}
