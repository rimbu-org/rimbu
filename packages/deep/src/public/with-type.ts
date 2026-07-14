import type { Match } from '@rimbu/deep/match';
import type { Patch } from '@rimbu/deep/patch';
import type { Path } from '@rimbu/deep/path';
import type { Select } from '@rimbu/deep/select';

import { getAtWith } from '@rimbu/deep';
import { matchAtWith } from '@rimbu/deep/match';
import { patchAtWith, patchWith } from '@rimbu/deep/patch';
import { selectAtWith } from '@rimbu/deep/select';

/**
 * A builder object that fixes the root type `T` for the `xWith` helper functions
 * whose `T` cannot be inferred from their arguments alone.
 *
 * The standalone `xWith` helpers accept a path string as their first argument.
 * TypeScript has nothing to infer `T` from at that call site, so the path
 * constraint degenerates to `string` and the return type is `unknown`.
 * The builder captures `T` once — via the `withType<T>()` call — so every
 * subsequent method call infers paths, matchers, patches, and selectors precisely.
 *
 * Functions where `T` is already inferrable from other arguments
 * (`matchWith`, `selectWith`, `match`, `patch`, `select`, etc.) are intentionally
 * omitted — they work correctly as standalone calls and adding them here would
 * clutter the API without benefit.
 *
 * Use `withType<T>()` to obtain the builder, then call any method on it.
 *
 * @typeparam T - the root object type that all methods operate on
 * @example
 * ```ts
 * type Person = { name: string; address: { street: string; number: number } };
 * const wt = withType<Person>();
 *
 * const people: Person[] = [
 *   { name: 'Alice', address: { street: 'Main St', number: 1 } },
 *   { name: 'Bob',   address: { street: 'Oak Ave',  number: 2 } },
 * ];
 *
 * people.map(wt.getAtWith('address.street'));
 * // => ['Main St', 'Oak Ave']
 *
 * people.filter(wt.matchAtWith('address.number', (n) => n > 1));
 * // => [{ name: 'Bob', ... }]
 *
 * people.map(wt.patchWith([{ address: [{ street: 'New Rd' }] }]));
 * // => [{ name: 'Alice', address: { street: 'New Rd', number: 1 } }, ...]
 *
 * people.map(wt.patchAtWith('address', [{ street: 'New Rd' }]));
 * // => [{ name: 'Alice', address: { street: 'New Rd', number: 1 } }, ...]
 *
 * people.map(wt.selectAtWith('address', { road: 'street' }));
 * // => [{ road: 'Main St' }, { road: 'Oak Ave' }]
 * ```
 */
export interface WithType<T> {
	/**
	 * Returns a function that reads the value at the given `path` from a `T`.
	 * @param path - the typed path string into `T`
	 */
	getAtWith<P extends Path.Get<T>>(path: P): (source: T) => Path.Result<T, P>;

	/**
	 * Returns a predicate that tests whether the value at `path` inside a `T` matches `matcher`.
	 * @param path - the typed path string into `T`
	 * @param matcher - the matcher to apply to the value at `path`
	 */
	matchAtWith<P extends Path.Get<T>>(
		path: P,
		matcher: Match<Path.Result<T, P>>,
	): (source: T) => boolean;

	/**
	 * Returns a function that applies `patchItem` to a `T`.
	 * Equivalent to the standalone `patchWith<T>(patchItem)` but without requiring
	 * an explicit type annotation.
	 * @param patchItem - the patch to apply
	 */
	patchWith(patchItem: Patch<T>): (source: T) => T;

	/**
	 * Returns a function that applies `patchItem` at `path` to a `T`.
	 * @param path - the typed path string into `T`
	 * @param patchItem - the patch to apply to the value at `path`
	 */
	patchAtWith<P extends Path.Set<T>>(
		path: P,
		patchItem: Patch<Path.Result<T, P>>,
	): (source: T) => T;

	/**
	 * Returns a function that applies `selector` to the value at `path` inside a `T`.
	 * @param path - the typed path string into `T`
	 * @param selector - the selector shape to apply to the value at `path`
	 */
	selectAtWith<
		P extends Path.Get<T>,
		const SL extends Select<Path.Result<T, P>>,
	>(
		path: P,
		selector: Select.Shape<SL>,
	): (source: T) => Select.Result<Path.Result<T, P>, SL>;
}

/**
 * Returns a builder object whose methods all operate on the root type `T`.
 * This fixes the inference problem with the standalone `xAtWith` helpers and
 * `patchWith`: TypeScript cannot infer `T` from a path string alone, but the
 * builder captures `T` once at construction time so every subsequent method call
 * infers paths, matchers, patches, and selectors precisely.
 *
 * @typeparam T - the root object type that all methods operate on
 * @example
 * ```ts
 * type Person = { name: string; age: number };
 * const wt = withType<Person>();
 * const people: Person[] = [{ name: 'Alice', age: 34 }, { name: 'Bob', age: 25 }];
 *
 * people.map(wt.getAtWith('name'));                      // => ['Alice', 'Bob']
 * people.filter(wt.matchAtWith('age', (n) => n > 30));  // => [{ name: 'Alice', age: 34 }]
 * people.map(wt.patchWith([{ age: 0 }]));               // => [{ name: 'Alice', age: 0 }, ...]
 * ```
 */
export function withType<T>(): WithType<T> {
	return {
		getAtWith: (path) => getAtWith(path as any) as any,
		matchAtWith: (path, matcher) =>
			matchAtWith(path as any, matcher as any) as any,
		patchWith: (patchItem) => patchWith(patchItem as any) as any,
		patchAtWith: (path, patchItem) =>
			patchAtWith(path as any, patchItem as any) as any,
		selectAtWith: (path, selector) =>
			selectAtWith(path as any, selector as any) as any,
	};
}
