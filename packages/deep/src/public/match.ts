import type { Path } from '@rimbu/deep/path';

import type { MatchInternal } from '#deep/match-internal';

import { isPlainObj } from '@rimbu/base/plain-object';
import { getAt } from '@rimbu/deep';

/**
 * The type to determine the allowed input values for the `match` function.
 * @typeparam T - the type of value to match
 * @typeparam C - utility type
 */
export type Match<T, C extends Partial<T> = Partial<T>> = MatchInternal.Entry<
	T,
	C,
	T,
	T
>;

/**
 * Returns true if the given `value` object matches the given `matcher`, false otherwise.
 * @typeparam T - the input value type
 * @typeparam C - utility type
 * @param source - the value to match (should be a plain object)
 * @param matcher - a matcher object or a function taking the matcher API and returning a match object
 * @param failureLog - (optional) a string array that can be passed to collect reasons why the match failed
 * @example
 * ```ts
 * const input = { a: 1, b: { c: true, d: 'a' } }
 * match(input, { a: 1 }) // => true
 * match(input, { a: 2 }) // => false
 * match(input, { a: (v) => v > 10 }) // => false
 * match(input, { b: { c: true }}) // => true
 * match(input, ['every', { a: (v) => v > 0 }, { b: { c: true } }]) // => true
 * match(input, { b: { c: (v, parent, root) => v && parent.d.length > 0 && root.a > 0 } })
 *  // => true
 * ```
 */
export function match<T, C extends Partial<T> = Partial<T>>(
	source: T,
	matcher: Match<T, C>,
	failureLog?: string[],
): boolean {
	return matchEntry(source, source, source, matcher as any, failureLog);
}

/**
 * Match a generic match entry against the given source.
 */
function matchEntry<T, C, P, R>(
	source: T,
	parent: P,
	root: R,
	matcher: MatchInternal.Entry<T, C, P, R>,
	failureLog?: string[],
): boolean {
	if (Object.is(source, matcher)) {
		// value and target are exactly the same, always will be true
		return true;
	}

	if (matcher === null || matcher === undefined) {
		// these matchers can only be direct matches, and previously it was determined that
		// they are not equal
		failureLog?.push(
			`value ${JSON.stringify(source)} did not match matcher ${matcher}`,
		);

		return false;
	}

	if (typeof source === 'function') {
		// function source values can only be directly matched
		const result = Object.is(source, matcher);

		if (!result) {
			failureLog?.push(
				`both value and matcher are functions, but they do not have the same reference`,
			);
		}

		return result;
	}

	if (typeof matcher === 'function') {
		// resolve match function first
		const matcherResult = matcher(source, parent, root);

		if (typeof matcherResult === 'boolean') {
			// function resulted in a direct match result

			if (!matcherResult) {
				failureLog?.push(
					`function matcher returned false for value ${JSON.stringify(source)}`,
				);
			}

			return matcherResult;
		}

		// function resulted in a value that needs to be further matched
		return matchEntry(source, parent, root, matcherResult, failureLog);
	}

	if (isPlainObj(source)) {
		// source ia a plain object, can be partially matched
		return matchPlainObj(source, parent, root, matcher as any, failureLog);
	}

	if (Array.isArray(source)) {
		// source is an array
		return matchArr(source, parent, root, matcher as any, failureLog);
	}

	// already determined above that the source and matcher are not equal

	failureLog?.push(
		`value ${JSON.stringify(source)} does not match given matcher ${JSON.stringify(matcher)}`,
	);

	return false;
}

/**
 * Match an array matcher against the given source.
 */
function matchArr<T extends any[], C, P, R>(
	source: T,
	parent: P,
	root: R,
	matcher: MatchInternal.Arr<T, C, P, R>,
	failureLog?: string[],
): boolean {
	if (Array.isArray(matcher)) {
		// directly compare array contents
		const length = source.length;

		if (length !== matcher.length) {
			// if lengths not equal, arrays are not equal

			failureLog?.push(
				`array lengths are not equal: value length ${source.length} !== matcher length ${matcher.length}`,
			);

			return false;
		}

		// loop over arrays, matching every value
		let index = -1;
		while (++index < length) {
			if (
				!matchEntry(source[index], source, root, matcher[index], failureLog)
			) {
				// item did not match, return false

				failureLog?.push(
					`index ${index} does not match with value ${JSON.stringify(
						source[index],
					)} and matcher ${matcher[index]}`,
				);

				return false;
			}
		}

		// all items are equal
		return true;
	}

	// matcher is plain object

	if (typeof matcher === 'object' && null !== matcher) {
		if (`every` in matcher) {
			return matchCompound(
				source,
				parent,
				root,
				['every', ...(matcher.every as any)],
				failureLog,
			);
		}
		if (`some` in matcher) {
			return matchCompound(
				source,
				parent,
				root,
				['some', ...(matcher.some as any)],
				failureLog,
			);
		}
		if (`none` in matcher) {
			return matchCompound(
				source,
				parent,
				root,
				['none', ...(matcher.none as any)],
				failureLog,
			);
		}
		if (`single` in matcher) {
			return matchCompound(
				source,
				parent,
				root,
				['single', ...(matcher.single as any)],
				failureLog,
			);
		}
		if (`someItem` in matcher) {
			return matchTraversal(
				source,
				root,
				'someItem',
				matcher.someItem as any,
				failureLog,
			);
		}
		if (`everyItem` in matcher) {
			return matchTraversal(
				source,
				root,
				'everyItem',
				matcher.everyItem as any,
				failureLog,
			);
		}
		if (`noneItem` in matcher) {
			return matchTraversal(
				source,
				root,
				'noneItem',
				matcher.noneItem as any,
				failureLog,
			);
		}
		if (`singleItem` in matcher) {
			return matchTraversal(
				source,
				root,
				'singleItem',
				matcher.singleItem as any,
				failureLog,
			);
		}
	}

	// matcher is plain object with index keys

	for (const index in matcher as any) {
		const matcherAtIndex = (matcher as any)[index];

		if (!(index in source)) {
			// source does not have item at given index

			failureLog?.push(
				`index ${index} does not exist in source ${JSON.stringify(
					source,
				)} but should match matcher ${JSON.stringify(matcherAtIndex)}`,
			);

			return false;
		}

		// match the source item at the given index
		const result = matchEntry(
			(source as any)[index],
			source,
			root,
			matcherAtIndex,
			failureLog,
		);

		if (!result) {
			// item did not match

			failureLog?.push(
				`index ${index} does not match with value ${JSON.stringify(
					(source as any)[index],
				)} and matcher ${JSON.stringify(matcherAtIndex)}`,
			);

			return false;
		}
	}

	// all items match

	return true;
}

/**
 * Match an object matcher against the given source.
 */
function matchPlainObj<T extends object, C, P, R>(
	source: T,
	parent: P,
	root: R,
	matcher: MatchInternal.Obj<T, C, P, R>,
	failureLog?: string[],
): boolean {
	if (Array.isArray(matcher)) {
		// the matcher is of compound type
		return matchCompound(source, parent, root, matcher as any, failureLog);
	}

	// partial object props matcher

	for (const key in matcher) {
		if (!(key in source)) {
			// the source does not have the given key

			failureLog?.push(
				`key ${key} is specified in matcher but not present in value ${JSON.stringify(source)}`,
			);

			return false;
		}

		// match the source value at the given key with the matcher at given key
		const result = matchEntry(
			(source as any)[key],
			source,
			root,
			matcher[key],
			failureLog,
		);

		if (!result) {
			failureLog?.push(
				`key ${key} does not match in value ${JSON.stringify(
					(source as any)[key],
				)} with matcher ${JSON.stringify(matcher[key])}`,
			);
			return false;
		}
	}

	// all properties match

	return true;
}

/**
 * Match a compound matcher against the given source.
 */
function matchCompound<T, C, P, R>(
	source: T,
	parent: P,
	root: R,
	compound: [MatchInternal.CompoundType, ...MatchInternal.Entry<T, C, P, R>[]],
	failureLog?: string[],
): boolean {
	// first item indicates compound match type
	const matchType = compound[0];

	const length = compound.length;

	// start at index 1
	let index = 0;

	type Entry = MatchInternal.Entry<T, C, P, R>;

	switch (matchType) {
		case 'every': {
			while (++index < length) {
				// if any item does not match, return false
				const result = matchEntry(
					source,
					parent,
					root,
					compound[index] as Entry,
					failureLog,
				);

				if (!result) {
					failureLog?.push(
						`in compound "every": match at index ${index} failed`,
					);

					return false;
				}
			}

			return true;
		}
		case 'none': {
			// if any item matches, return false
			while (++index < length) {
				const result = matchEntry(
					source,
					parent,
					root,
					compound[index] as Entry,
					failureLog,
				);

				if (result) {
					failureLog?.push(
						`in compound "none": match at index ${index} succeeded`,
					);

					return false;
				}
			}

			return true;
		}
		case 'single': {
			// if not exactly one item matches, return false
			let onePassed = false;

			while (++index < length) {
				const result = matchEntry(
					source,
					parent,
					root,
					compound[index] as Entry,
					failureLog,
				);

				if (result) {
					if (onePassed) {
						failureLog?.push(
							`in compound "single": multiple matches succeeded`,
						);

						return false;
					}

					onePassed = true;
				}
			}

			if (!onePassed) {
				failureLog?.push(`in compound "single": no matches succeeded`);
			}

			return onePassed;
		}
		case 'some': {
			// if any item matches, return true
			while (++index < length) {
				const result = matchEntry(
					source,
					parent,
					root,
					compound[index] as Entry,
					failureLog,
				);

				if (result) {
					return true;
				}
			}

			failureLog?.push(`in compound "some": no matches succeeded`);

			return false;
		}
	}
}

function matchTraversal<T extends any[], C extends any[], R>(
	source: T,
	root: R,
	matchType: MatchInternal.ArrayTraversalType,
	matcher: MatchInternal.Entry<T[keyof T], C[keyof C], T, R>,
	failureLog?: string[],
): boolean {
	let index = -1;
	const length = source.length;

	switch (matchType) {
		case 'someItem': {
			while (++index < length) {
				if (matchEntry(source[index], source, root, matcher, failureLog)) {
					return true;
				}
			}

			failureLog?.push(
				`in array traversal "someItem": no items matched given matcher`,
			);

			return false;
		}
		case 'everyItem': {
			while (++index < length) {
				if (!matchEntry(source[index], source, root, matcher, failureLog)) {
					failureLog?.push(
						`in array traversal "everyItem": at least one item did not match given matcher`,
					);
					return false;
				}
			}

			return true;
		}
		case 'noneItem': {
			while (++index < length) {
				if (matchEntry(source[index], source, root, matcher, failureLog)) {
					failureLog?.push(
						`in array traversal "noneItem": at least one item matched given matcher`,
					);
					return false;
				}
			}

			return true;
		}
		case 'singleItem': {
			let singleMatched = false;

			while (++index < length) {
				if (matchEntry(source[index], source, root, matcher, failureLog)) {
					if (singleMatched) {
						failureLog?.push(
							`in array traversal "singleItem": more than one item matched given matcher`,
						);

						return false;
					}

					singleMatched = true;
				}
			}

			if (!singleMatched) {
				failureLog?.push(
					`in array traversal "singleItem": no item matched given matcher`,
				);

				return false;
			}

			return true;
		}
	}
}

/**
 * Returns true if the given `value` object matches the given `matcher` at the given `path`, false otherwise.
 * @typeparam T - the input value type
 * @typeparam P - the string literal path type in the object
 * @param source - the input value
 * @param path - the string path in the object
 * @param matcher - a matcher object or a function taking the matcher API and returning a match object
 * @example
 * ```ts
 * const input = { a: 1, b: { c: true, d: 'a' } }
 * matchAt(input, 'b', { c: true })
 * // => true
 * ```
 */
export function matchAt<T, P extends Path.Get<T>>(
	source: T,
	path: P,
	matcher: Match<Path.Result<T, P>>,
): boolean {
	return match(getAt(source, path), matcher);
}

/**
 * Returns a function that matches a given `value` with the given `matcher`.
 * @typeparam T - the input value type
 * @param matcher - a matcher object that matches input values.
 * @param source - the value to match (parameter of the returned function).
 * @example
 * ```ts
 * const items = [{ a: 1, b: 'a' }, { a: 2, b: 'b' }];
 * items.filter(matchWith({ a: 2 }));
 * // => [{ a: 2, b: 'b' }]
 * ```
 */
export function matchWith<T>(matcher: Match<T>): (source: T) => boolean {
	return (source) => match(source, matcher);
}

/**
 * Returns a function that matches a given `value` with the given `matcher` at the given string `path`.
 * @typeparam T - the input value type
 * @typeparam P - the string literal path type in the object
 * @typeparam TE - utility type
 * @param path - the string path in the object
 * @param matcher - a matcher object that matches input values.
 * @param source - the value to use the given `matcher` on at the given `path`.
 * @example
 * ```ts
 * const items = [{ a: { b:  1, c: 'a' } }, { a: { b: 2, c: 'b' } }];
 * items.filter(matchAtWith('a.b', 2));
 * // => [{ a: 2, b: 'b' }]
 * ```
 */
export function matchAtWith<T, P extends Path.Get<T>, TE extends T = T>(
	path: P,
	matcher: Match<Path.Result<T & TE, P>>,
): (source: T) => boolean {
	return (source) => matchAt(source, path, matcher as any);
}
