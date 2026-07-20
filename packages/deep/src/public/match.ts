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
 * @returns true if the value matches the matcher, false otherwise
 * @example
 * ```ts
 * import { match, matchVerbose, matchAt, matchWith, matchAtWith } from '@rimbu/deep/match';
 * const input = { a: 1, b: { c: true, d: 'a' } }
 * match(input, { a: 1 }) // => true
 * match(input, { a: 2 }) // => false
 * match(input, { a: (v) => v > 10 }) // => false
 * match(input, { b: { c: true }}) // => true
 * match(input, { b: { c: (v, parent, root) => v && parent.d.length > 0 && root.a > 0 } })
 *  // => true
 * ```
 */
export function match<T, C extends Partial<T> = Partial<T>>(
	source: T,
	matcher: Match<T, C>,
): boolean {
	return matchEntry(source, source, source, matcher as any);
}

/**
 * Returns whether the given `source` value matches the given `matcher`, together with a
 * log of the reasons for any mismatch.
 * @typeparam T - the input value type
 * @typeparam C - utility type
 * @param source - the value to match (should be a plain object)
 * @param matcher - a matcher object or a function taking the matcher API and returning a match object
 * @returns an object with `result` (true if the value matches the matcher) and `failureLog`
 * (an array of human-readable descriptions of each sub-matcher that failed; empty when `result` is true)
 * @example
 * ```ts
 * import { match, matchVerbose, matchAt, matchWith, matchAtWith } from '@rimbu/deep/match';
 * const input = { a: 1, b: { c: true, d: 'a' } }
 * matchVerbose(input, { a: 1 })        // => { result: true, failureLog: [] }
 * matchVerbose(input, { a: 2 })        // => { result: false, failureLog: [...] }
 * matchVerbose(input, { b: { c: false } }) // => { result: false, failureLog: [...] }
 * ```
 */
export function matchVerbose<T, C extends Partial<T> = Partial<T>>(
	source: T,
	matcher: Match<T, C>,
): { result: boolean; failureLog: string[] } {
	const failureLog: string[] = [];
	const result = matchEntry(source, source, source, matcher as any, failureLog);
	return { result, failureLog };
}

function matchEntry<T, C, P, R>(
	source: T,
	parent: P,
	root: R,
	matcher: MatchInternal.Entry<T, C, P, R>,
	failureLog?: string[],
): boolean {
	if (Object.is(source, matcher)) return true;

	if (matcher === null || matcher === undefined) {
		failureLog?.push(
			`value ${JSON.stringify(source)} did not match matcher ${matcher}`,
		);
		return false;
	}

	if (typeof source === 'function') {
		// function sources can only match by reference; equality was already ruled out above
		failureLog?.push(
			'both value and matcher are functions, but they do not have the same reference',
		);
		return false;
	}

	if (typeof matcher === 'function') {
		const matcherResult = (matcher as any)(source, parent, root);
		if (typeof matcherResult === 'boolean') {
			if (!matcherResult) {
				failureLog?.push(
					`function matcher returned false for value ${JSON.stringify(source)}`,
				);
			}
			return matcherResult;
		}
		// function returned a new matcher — recurse
		return matchEntry(source, parent, root, matcherResult, failureLog);
	}

	if (isPlainObj(source))
		return matchPlainObj(source, parent, root, matcher, failureLog);
	if (Array.isArray(source))
		return matchArr(source, parent, root, matcher, failureLog);
	if (isCompound(matcher))
		return matchCompound(source, parent, root, matcher, failureLog);

	failureLog?.push(
		`value ${JSON.stringify(source)} does not match given matcher ${JSON.stringify(matcher)}`,
	);
	return false;
}

function matchPlainObj<T extends object, C, P, R>(
	source: T,
	parent: P,
	root: R,
	matcher: MatchInternal.Obj<T, C, P, R>,
	failureLog?: string[],
): boolean {
	if (Array.isArray(matcher)) {
		return matchCompound(source, parent, root, matcher[0], failureLog);
	}

	for (const key in matcher) {
		if (!(key in source)) {
			failureLog?.push(
				`key ${String(key)} is specified in matcher but not present in value ${JSON.stringify(source)}`,
			);
			return false;
		}

		if (
			!matchEntry((source as any)[key], source, root, matcher[key], failureLog)
		) {
			failureLog?.push(
				`key ${String(key)} does not match in value ${JSON.stringify(
					(source as any)[key],
				)} with matcher ${JSON.stringify(matcher[key])}`,
			);
			return false;
		}
	}

	return true;
}

function matchArr<T extends any[], C, P, R>(
	source: T,
	parent: P,
	root: R,
	matcher: MatchInternal.Arr<T, C, P, R>,
	failureLog?: string[],
): boolean {
	if (Array.isArray(matcher)) {
		if (source.length !== matcher.length) {
			failureLog?.push(
				`array lengths are not equal: value length ${source.length} !== matcher length ${matcher.length}`,
			);
			return false;
		}

		for (let i = 0; i < source.length; i++) {
			if (!matchEntry(source[i], source, root, matcher[i], failureLog)) {
				failureLog?.push(
					`index ${i} does not match with value ${JSON.stringify(source[i])} and matcher ${matcher[i]}`,
				);
				return false;
			}
		}

		return true;
	}

	if (isTraverseCompound(matcher))
		return matchTraverseCompound(source, root, matcher as any, failureLog);
	if (isCompound(matcher))
		return matchCompound(source, parent, root, matcher as any, failureLog);

	// sparse index object: match only the specified numeric indices
	for (const index in matcher as any) {
		const matcherAtIndex = (matcher as any)[index];

		if (!(index in source)) {
			failureLog?.push(
				`index ${index} does not exist in source ${JSON.stringify(source)} but should match matcher ${JSON.stringify(matcherAtIndex)}`,
			);
			return false;
		}

		if (
			!matchEntry(
				(source as any)[index],
				source,
				root,
				matcherAtIndex,
				failureLog,
			)
		) {
			failureLog?.push(
				`index ${index} does not match with value ${JSON.stringify(
					(source as any)[index],
				)} and matcher ${JSON.stringify(matcherAtIndex)}`,
			);
			return false;
		}
	}

	return true;
}

function isCompound(
	obj: any,
): obj is MatchInternal.Compound<any, any, any, any> {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		!Array.isArray(obj) &&
		('every' in obj ||
			'some' in obj ||
			'none' in obj ||
			'single' in obj ||
			'customMatch' in obj)
	);
}

function isTraverseCompound(
	obj: any,
): obj is MatchInternal.TraverseCompound<any, any, any, any> {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		!Array.isArray(obj) &&
		('everyItem' in obj ||
			'someItem' in obj ||
			'noneItem' in obj ||
			'singleItem' in obj ||
			'customMatchItem' in obj)
	);
}

type CompoundControl = {
	getResult: (pass: number, fail: number) => boolean;
	halt?: (pass: number, fail: number) => boolean;
};

function resolveCompoundControl(
	mode: string,
	value: any,
	failureLog: string[] | undefined,
): { matchers: any[]; control: CompoundControl } | undefined {
	switch (mode) {
		case 'every':
			return {
				matchers: value,
				control: { getResult: (_, f) => f === 0, halt: (_, f) => f > 0 },
			};
		case 'some':
			return {
				matchers: value,
				control: { getResult: (p) => p > 0, halt: (p) => p > 0 },
			};
		case 'none':
			return {
				matchers: value,
				control: { getResult: (p) => p === 0, halt: (p) => p > 0 },
			};
		case 'single':
			return {
				matchers: value,
				control: { getResult: (p) => p === 1, halt: (p) => p > 1 },
			};
		case 'customMatch':
			return {
				matchers: value.matchers,
				control: { getResult: value.getResult, halt: value.halt },
			};
		default:
			failureLog?.push(
				`compound matcher has unknown key "${mode}", expected one of "every", "some", "none", "single", "customMatch"`,
			);
			return undefined;
	}
}

function resolveTraverseControl(
	mode: string,
	value: any,
	failureLog: string[] | undefined,
): { matcher: any; control: CompoundControl } | undefined {
	switch (mode) {
		case 'everyItem':
			return {
				matcher: value,
				control: { getResult: (_, f) => f === 0, halt: (_, f) => f > 0 },
			};
		case 'someItem':
			return {
				matcher: value,
				control: { getResult: (p) => p > 0, halt: (p) => p > 0 },
			};
		case 'noneItem':
			return {
				matcher: value,
				control: { getResult: (p) => p === 0, halt: (p) => p > 0 },
			};
		case 'singleItem':
			return {
				matcher: value,
				control: { getResult: (p) => p === 1, halt: (p) => p > 1 },
			};
		case 'customMatchItem':
			return {
				matcher: value.matcher,
				control: { getResult: value.getResult, halt: value.halt },
			};
		default:
			failureLog?.push(
				`traversal compound matcher has unknown key "${mode}", expected one of "everyItem", "someItem", "noneItem", "singleItem", "customMatchItem"`,
			);
			return undefined;
	}
}

function matchCompound<T, C, P, R>(
	source: T,
	parent: P,
	root: R,
	compound: MatchInternal.Compound<T, C, P, R>,
	failureLog?: string[],
): boolean {
	const entries = Object.entries(compound as any);
	if (entries.length !== 1) {
		failureLog?.push(
			`compound matcher must have exactly one key ("every", "some", "none", "single", or "customMatch")`,
		);
		return false;
	}

	const [[mode, value]] = entries;
	const resolved = resolveCompoundControl(mode, value, failureLog);
	if (resolved === undefined) return false;

	const { matchers, control } = resolved;
	let pass = 0;
	let fail = 0;

	for (let i = 0; i < matchers.length; i++) {
		if (matchEntry(source, parent, root, matchers[i], failureLog)) {
			pass++;
		} else {
			fail++;
		}
		if (control.halt?.(pass, fail)) break;
	}

	const result = control.getResult(pass, fail);
	if (!result) {
		failureLog?.push(
			`compound matcher failed with ${pass} passed and ${fail} failed`,
		);
	}
	return result;
}

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
	const entries = Object.entries(traverseCompound as any);
	if (entries.length !== 1) {
		failureLog?.push(
			`traversal compound matcher must have exactly one key ("everyItem", "someItem", "noneItem", "singleItem", or "customMatchItem")`,
		);
		return false;
	}

	const [[mode, value]] = entries;
	const resolved = resolveTraverseControl(mode, value, failureLog);
	if (resolved === undefined) return false;

	const { matcher, control } = resolved;
	let pass = 0;
	let fail = 0;

	for (let i = 0; i < source.length; i++) {
		if (matchEntry(source[i], source, root, matcher, failureLog)) {
			pass++;
		} else {
			fail++;
		}
		if (control.halt?.(pass, fail)) break;
	}

	const result = control.getResult(pass, fail);
	if (!result) {
		failureLog?.push(
			`compound traverse matcher failed with ${pass} passed and ${fail} failed`,
		);
	}
	return result;
}

/**
 * Returns true if the given `source` matches the given `matcher` at the given `path`, false otherwise.
 * @example
 * ```ts
 * import { match, matchVerbose, matchAt, matchWith, matchAtWith } from '@rimbu/deep/match';
 * const input = { a: 1, b: { c: true, d: 'a' } }
 * matchAt(input, 'b', { c: true }) // => true
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
 * Returns a function that matches a given `source` with the given `matcher`.
 * @example
 * ```ts
 * import { match, matchVerbose, matchAt, matchWith, matchAtWith } from '@rimbu/deep/match';
 * const items = [{ a: 1, b: 'a' }, { a: 2, b: 'b' }];
 * items.filter(matchWith({ a: 2 }));
 * // => [{ a: 2, b: 'b' }]
 * ```
 */
export function matchWith<T>(matcher: Match<T>): (source: T) => boolean {
	return (source) => match(source, matcher);
}

/**
 * Returns a function that matches a given `source` with the given `matcher` at the given string `path`.
 * @example
 * ```ts
 * import { match, matchVerbose, matchAt, matchWith, matchAtWith } from '@rimbu/deep/match';
 * const items = [{ a: { b: 1, c: 'a' } }, { a: { b: 2, c: 'b' } }];
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
