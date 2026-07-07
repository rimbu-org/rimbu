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
 * @returns true if the value matches the matcher, false otherwise
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
 * @typeparam T - the entry value type
 * @typeparam C - utility matcher type
 * @typeparam P - the parent value type
 * @typeparam R - the root value type
 * @param source - the value to match
 * @param parent - the parent value of `source`
 * @param root - the root value in which the match started
 * @param matcher - the matcher entry to evaluate
 * @param failureLog - optional array to collect failure reasons
 * @returns true when the entry matches, false otherwise
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
 * @typeparam T - the array value type
 * @typeparam C - utility matcher type
 * @typeparam P - the parent value type
 * @typeparam R - the root value type
 * @param source - the array value to match
 * @param parent - the parent value of `source`
 * @param root - the root value in which the match started
 * @param matcher - the array matcher to evaluate
 * @param failureLog - optional array to collect failure reasons
 * @returns true when the array matches the matcher, false otherwise
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

	if (isTraverseCompound(matcher)) {
		return matchTraverseCompound(source, root, matcher as any, failureLog);
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
		const [compoundMatcher] = matcher;
		return matchCompound(source, parent, root, compoundMatcher, failureLog);
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

export function isCompound(
	obj: any,
): obj is MatchInternal.Compound<any, any, any, any> {
	return (
		typeof obj === 'object' &&
		null !== obj &&
		!Array.isArray(obj) &&
		('every' in obj ||
			'some' in obj ||
			'none' in obj ||
			'single' in obj ||
			'customMatch' in obj)
	);
}

export function isTraverseCompound(
	obj: any,
): obj is MatchInternal.Compound<any, any, any, any> {
	return (
		typeof obj === 'object' &&
		null !== obj &&
		!Array.isArray(obj) &&
		('everyItem' in obj ||
			'someItem' in obj ||
			'noneItem' in obj ||
			'singleItem' in obj ||
			'customMatchItem' in obj)
	);
}

/**
 * Match a compound matcher against the given source.
 * @typeparam T - the input value type for the compound match
 * @typeparam C - utility matcher type
 * @typeparam P - the parent value type
 * @typeparam R - the root value type
 * @param source - the value to match
 * @param parent - the parent value of `source`
 * @param root - the root value in which the match started
 * @param compound - the compound matcher tuple
 * @param failureLog - optional array to collect failure reasons
 * @returns true when the compound matcher succeeds, false otherwise
 */
function matchCompound<T, C, P, R>(
	source: T,
	parent: P,
	root: R,
	compound: MatchInternal.Compound<T, C, P, R>,
	failureLog?: string[],
): boolean {
	const compoundKeys = Object.entries(compound);
	const amountKeys = compoundKeys.length;

	type Entry = MatchInternal.Entry<T, C, P, R>;

	let matchers: Entry[];
	let getResult: (pass: number, fail: number) => boolean;
	let halt: ((pass: number, fail: number) => boolean) | undefined;

	if (amountKeys === 1) {
		const [[mode, compoundMatchers]] = compoundKeys;
		matchers = compoundMatchers as Entry[];

		switch (mode) {
			case 'every':
				getResult = (_, fail) => fail === 0;
				halt = (_, fail) => fail > 0;
				break;
			case 'some':
				getResult = (pass) => pass > 0;
				halt = (pass) => pass > 0;
				break;
			case 'none':
				getResult = (pass) => pass === 0;
				halt = (pass) => pass > 0;
				break;
			case 'single':
				getResult = (pass) => pass === 1;
				halt = (pass) => pass > 1;
				break;
			default:
				failureLog?.push(
					`compound matcher has unknown key ${mode}, expected one of "every", "some", "none", "single"`,
				);
				return false;
		}
	} else if ('customMatch' in compound && 'getResult' in compound) {
		matchers = compound.customMatch;
		getResult = compound.getResult;
		halt = compound.halt;
	} else {
		failureLog?.push(
			`compound matcher has multiple keys, expected only one of "every", "some", "none", "single" or both "customMatch" and "getResult"`,
		);
		return false;
	}

	const length = matchers.length;

	let passed = 0;
	let failed = 0;

	let index = -1;
	while (++index < length) {
		// if any item does not match, return false
		const result = matchEntry(
			source,
			parent,
			root,
			matchers[index],
			failureLog,
		);
		if (result) {
			passed++;
		} else {
			failed++;
		}

		if (halt?.(passed, failed)) {
			break;
		}
	}

	const matchPassed = getResult(passed, failed);

	if (!matchPassed) {
		failureLog?.push(
			`compound matcher failed with ${passed} passed and ${failed} failed`,
		);

		return false;
	}

	return true;
}

/**
 * Traverse an array for item-level match checks.
 * @typeparam T - the array value type
 * @typeparam C - utility matcher type for array items
 * @typeparam R - the root value type
 * @param source - the array to traverse
 * @param root - the root value in which the match started
 * @param matchType - the traversal match type (someItem/everyItem/noneItem/singleItem)
 * @param traverseCompound - the entry matcher to apply to items
 * @param failureLog - optional array to collect failure reasons
 * @returns true when the traversal condition is satisfied, false otherwise
 */
function matchTraverseCompound<T extends any[], C extends any[], R>(
	source: T,
	root: R,
	traverseCompound: MatchInternal.TraverseCompound<
		T[keyof T],
		C[keyof C],
		T,
		R
	>,
	failureLog?: string[],
): boolean {
	const compoundKeys = Object.entries(traverseCompound);
	const amountKeys = compoundKeys.length;

	type Entry = MatchInternal.Entry<T[keyof T], C[keyof C], T, R>;

	let matcher: Entry;
	let getResult: (pass: number, fail: number) => boolean;
	let halt: ((pass: number, fail: number) => boolean) | undefined;

	if (amountKeys === 1) {
		const [[mode, _matcher]] = compoundKeys;
		matcher = _matcher as Entry;

		switch (mode) {
			case 'everyItem':
				getResult = (_, fail) => fail === 0;
				halt = (_, fail) => fail > 0;
				break;
			case 'someItem':
				getResult = (pass) => pass > 0;
				halt = (pass) => pass > 0;
				break;
			case 'noneItem':
				getResult = (pass) => pass === 0;
				halt = (pass) => pass > 0;
				break;
			case 'singleItem':
				getResult = (pass) => pass === 1;
				halt = (pass) => pass > 1;
				break;
			default:
				failureLog?.push(
					`compound traverse matcher has unknown key ${mode}, expected one of "every", "some", "none", "single"`,
				);
				return false;
		}
	} else if (
		'customMatchItem' in traverseCompound &&
		'getResult' in traverseCompound
	) {
		matcher = traverseCompound.customMatchItem as Entry;
		getResult = traverseCompound.getResult;
		halt = traverseCompound.halt;
	} else {
		failureLog?.push(
			`compound matcher has multiple keys, expected only one of "every", "some", "none", "single" or both "customMatch" and "getResult"`,
		);
		return false;
	}

	let pass = 0;
	let fail = 0;

	let index = -1;
	const length = source.length;

	while (++index < length) {
		const matches = matchEntry(
			source[index],
			source,
			root,
			matcher,
			failureLog,
		);

		if (matches) {
			pass++;
		} else {
			fail++;
		}

		if (halt?.(pass, fail)) {
			break;
		}
	}

	const result = getResult(pass, fail);

	if (!result) {
		failureLog?.push(
			`compound traverse matcher failed with ${pass} passed and ${fail} failed`,
		);
	}

	return result;
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
