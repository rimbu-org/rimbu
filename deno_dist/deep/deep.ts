import type { Match, Patch, Path, Protected, Selector } from './internal.ts';
import { Deep } from './internal.ts';

export { match, type Match } from './match.ts';
export { patch, type Patch } from './patch.ts';
export { getAt, patchAt, type Path } from './path.ts';
export type { Protected } from './protected.ts';
export { select, type Selector } from './selector.ts';

/**
 * Returns the same value wrapped in the `Protected` type.
 * @typeparam T - the source value type
 * @param source - the value to wrap
 * @note does not perform any runtime protection, it is only a utility to easily add the `Protected`
 * type to a value
 * @example
 * ```ts
 * const obj = Deep.protect({ a: 1, b: { c: true, d: [1] } })
 * obj.a = 2        // compiler error: a is readonly
 * obj.b.c = false  // compiler error: c is readonly
 * obj.b.d.push(2)  // compiler error: d is a readonly array
 * (obj as any).b.d.push(2)  // will actually mutate the object
 * ```
 */
export function protect<T>(source: T): Protected<T> {
  return source as Protected<T>;
}

/**
 * Returns a function that gets the value at the given string `path` inside an object.
 * @typeparam T - the input value type
 * @typeparam P - the string literal path type in the object
 * @param path - the string path in the object
 * @param source - the value from which to extract the path value
 * @example
 * ```ts
 * const items = [{ a: { b:  1, c: 'a' } }, { a: { b: 2, c: 'b' } }];
 * items.map(Deep.getAtWith('a.c'));
 * // => ['a', 'b']
 * ```
 */
export function getAtWith<T, P extends Path.Get<T>>(
  path: P
): (source: T) => Path.Result<T, P> {
  return (source) => Deep.getAt(source, path);
}

/**
 * Returns a function that patches a given `source` with the given `patchItems`.
 * @typeparam T - the patch value type
 * @typeparam TE - utility type
 * @typeparam TT - utility type
 * @param patchItem - the `Patch` definition to update the given value of type `T` with.
 * @param source - the value to use the given `patchItem` on.
 * @example
 * ```ts
 * const items = [{ a: 1, b: 'a' }, { a: 2, b: 'b' }];
 * items.map(Deep.patchWith([{ a: v => v + 1 }]));
 * // => [{ a: 2, b: 'a' }, { a: 3, b: 'b' }]
 * ```
 */
export function patchWith<T, TE extends T = T, TT = T>(
  patchItem: Patch<TT, TE>
): (source: TE) => T {
  return (source) => Deep.patch(source, patchItem as any);
}

/**
 * Returns a function that patches a given `value` with the given `patchItems` at the given `path`.
 * @typeparam T - the patch value type
 * @typeparam P - the string literal path type in the object
 * @typeparam TE - utility type
 * @typeparam TT - utility type
 * @param path - the string path in the object
 * @param patchItem - the `Patch` definition to update the value at the given `path` in `T` with.
 * @param source - the value to use the given `patchItem` on at the given `path`.
 * @example
 * ```ts
 * const items = [{ a: { b:  1, c: 'a' } }, { a: { b: 2, c: 'b' } }];
 * items.map(Deep.patchAtWith('a', [{ b: (v) => v + 1 }]));
 * // => [{ a: { b: 2, c: 'a' } }, { a: { b: 3, c: 'b' } }]
 * ```
 */
export function patchAtWith<T, P extends Path.Set<T>, TE extends T = T, TT = T>(
  path: P,
  patchItem: Patch<Path.Result<TE, P>, Path.Result<TT, P>>
): (source: T) => T {
  return (source) => Deep.patchAt(source, path, patchItem as any);
}

/**
 * Returns a function that matches a given `value` with the given `matcher`.
 * @typeparam T - the input value type
 * @param matcher - a matcher object that matches input values.
 * @param source - the value to match (parameter of the returned function).
 * @example
 * ```ts
 * const items = [{ a: 1, b: 'a' }, { a: 2, b: 'b' }];
 * items.filter(Deep.matchWith({ a: 2 }));
 * // => [{ a: 2, b: 'b' }]
 * ```
 */
export function matchWith<T>(matcher: Match<T>): (source: T) => boolean {
  return (source) => Deep.match(source, matcher);
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
 * Deep.matchAt(input, 'b', { c: true })
 * // => true
 * ```
 */
export function matchAt<T, P extends Path.Get<T>>(
  source: T,
  path: P,
  matcher: Match<Path.Result<T, P>>
): boolean {
  return Deep.match(Deep.getAt(source, path), matcher);
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
 * items.filter(Deep.matchAtWith('a.b', 2));
 * // => [{ a: 2, b: 'b' }]
 * ```
 */
export function matchAtWith<T, P extends Path.Get<T>, TE extends T = T>(
  path: P,
  matcher: Match<Path.Result<T & TE, P>>
): (source: T) => boolean {
  return (source) => Deep.matchAt(source, path, matcher as any);
}

/**
 * Returns a function that selects a certain shape from a given `value` with the given `selector`.
 * @typeparam T - the input value type
 * @typeparam SL - the selector shape type
 * @param selector - a shape indicating the selection from the source values
 * @param source - the value to use the given `selector` on.
 * @example
 * ```ts
 * const items = [{ a: { b:  1, c: 'a' } }, { a: { b: 2, c: 'b' } }];
 * items.map(Deep.selectWith({ q: 'a.c', z: ['a.b', v => v.a.b + 1] as const }));
 * // => [{ q: 'a', z: [1, 2] }, { q: 'b', z: [2, 3] }]
 * ```
 */
export function selectWith<T, SL extends Selector<T>>(
  selector: Selector.Shape<SL>
): (source: T) => Selector.Result<T, SL> {
  return (source) => Deep.select(source, selector);
}

/**
 * Returns the result of applying the given `selector` shape to the given `source` value.
 * @typeparam T - the input value type
 * @typeparam P - the string literal path type in the object
 * @typeparam SL - the selector shape type
 * @param source - the source value to select from
 * @param path - the string path in the object
 * @param selector - a shape indicating the selection from the source value at the given path
 * @example
 * ```ts
 * const item = { a: { b:  1, c: 'a' } };
 * Deep.selectAt(item, 'a', { q: 'c', z: ['b', v => v.b + 1] as const });
 * // => { q: 'a', z: [1, 2] }
 * ```
 */
export function selectAt<
  T,
  P extends Path.Get<T>,
  SL extends Selector<Path.Result<T, P>>,
>(
  source: T,
  path: P,
  selector: Selector.Shape<SL>
): Selector.Result<Path.Result<T, P>, SL> {
  return Deep.select(Deep.getAt(source, path), selector);
}

/**
 * Returns a function that selects a certain shape from a given `value` with the given `selector` at the given string `path`.
 * @typeparam T - the input value type
 * @typeparam P - the string literal path type in the object
 * @typeparam SL - the selector shape type
 * @param path - the string path in the object
 * @param selector - a shape indicating the selection from the source values
 * @example
 * ```ts
 * const items = [{ a: { b:  1, c: 'a' } }, { a: { b: 2, c: 'b' } }];
 * items.map(Deep.selectAtWith('a', { q: 'c', z: ['b', v => v.b + 1] as const }));
 * // => [{ q: 'a', z: [1, 2] }, { q: 'b', z: [2, 3] }]
 * ```
 */
export function selectAtWith<
  T,
  P extends Path.Get<T>,
  SL extends Selector<Path.Result<T, P>>,
>(
  path: P,
  selector: Selector.Shape<SL>
): (source: T) => Selector.Result<Path.Result<T, P>, SL> {
  return (source) => Deep.selectAt(source, path, selector);
}

/**
 * Typed and curried Deep API, used in situations where the target type
 * is known but the value will be applied later.
 * @typeparam T - the target type
 * @example
 * ```ts
 * const s = { a: 1, b: { c: 'a', d: true }};
 * const upd = Deep.withType<typeof s>().patchWith([{ a: (v) => v + 1 }]);
 * upd(s);
 * // => { a: 2, b: { c: 'a', d: true }}
 * ```
 */
export interface WithType<T> {
  /**
   * Returns a function that given an object returns the value at the given `path`.
   * @typeparam P - a Path in object type T
   * @param path - the path into the object
   * @example
   * ```ts
   * const value = { a: { b: { c: 5 } } }
   * const getValue = Deep.withType<typeof value>().getAtWith('a.b.c');
   * getValue(value);
   * // => 5
   * ```
   */
  getAtWith<P extends Path.Get<T>>(path: P): (source: T) => Path.Result<T, P>;
  /**
   * Returns a function that patches a given `value` with the given `patchItems`.
   * @typeparam TT - utility type
   * @param patchItem - the `Patch` definition to update the given value with
   * @param source - the value to use the given `patchItem` on.
   * @example
   * ```ts
   * const value = { a: 1, b: 'a' };
   * const upd = Deep.withType<typeof value>().patch([{ a: v => v + 1 }]);
   * upd(value);
   * // => { a: 2, b: 'a' }
   * ```
   */
  patchWith<TE extends T = T, TT = T>(
    patchItem: Patch<TT, TE>
  ): (source: TE) => T;
  /**
   * Returns a function that patches a given `value` with the given `patchItems` at the given `path`.
   * @typeparam P - the string literal path type in the object
   * @typeparam TT - utility type
   * @param path - the string path in the object
   * @param patchItem - the `Patch` definition to update the given value with
   * @param source - the value to use the given `patchItem` on at the given `path`.
   * @example
   * ```ts
   * const value = { a: { b: 1, c: 'a' } };
   * const upd = Deep.withType<typeof value>().patchAtWith('a', [{ b: (v) => v + 1 }])
   * upd(value);
   * // => { a: { b: 2, c: 'a' } }
   * ```
   */
  patchAtWith<P extends Path.Set<T>, TT = T>(
    path: P,
    patchItem: Patch<Path.Result<T, P>, Path.Result<TT, P>>
  ): (source: T) => T;
  /**
   * Returns a function that matches a given `value` with the given `matcher`.
   * @param matcher - a matcher object that matches input values.
   * @param source - the value to use the given `matcher` on.
   * @example
   * ```ts
   * const value = { a: 1, b: 'a' };
   * const m = Deep.withType<typeof value>().matchWith({ a: 1 });
   * m(value);
   * // => true
   * ```
   */
  matchWith(matcher: Match<T>): (source: T) => boolean;
  /**
   * Returns a function that matches a given `value` with the given `matcher` at the given string `path`.
   * @typeparam P - the string literal path type in the object
   * @param path - the string path in the object
   * @param matcher - a matcher object that matches input values.
   * @param source - the value to use the given `matcher` on at the given `path`.
   * @example
   * ```ts
   * const items = [{ a: { b:  1, c: 'a' } }, { a: { b: 2, c: 'b' } }];
   * items.filter(Deep.matchAtWith('a.b', 2));
   * // => [{ a: 2, b: 'b' }]
   * ```
   */
  matchAtWith<P extends Path.Get<T>>(
    path: P,
    matcher: Match<Path.Result<T, P>>
  ): (source: T) => boolean;
  /**
   * Returns a function that selects a certain shape from a given `value` with the given `selector`.
   * @typeparam SL - the selector shape type
   * @param selector - a shape indicating the selection from the source values
   * @param source - the value to use the given `selector` on.
   * @example
   * ```ts
   * const value = { a: { b: 1, c: 'a' } };
   * const sel = Deep.withType<typeof value>().selectWith({ q: 'a.b' });
   * sel(value);
   * // => { q: 1 }
   * ```
   */
  selectWith<SL extends Selector<T>>(
    selector: Selector.Shape<SL>
  ): (source: T) => Selector.Result<T, SL>;
  /**
   * Returns a function that selects a certain shape from a given `value` with the given `selector` at the given string `path`.
   * @typeparam P - the string literal path type in the object
   * @typeparam SL - the selector shape type
   * @param path - the string path in the object
   * @param selector - a shape indicating the selection from the source values
   * @param source - the value to use the given `selector` on at the given `path`.
   * @example
   * ```ts
   * const value = { a: { b: 1, c: 'a' } };
   * const sel = Deep.withType<typeof value>().selectAtWith('a', { q: 'b' });
   * sel(value);
   * // => { q: 1 }
   * ```
   */
  selectAtWith<P extends Path.Get<T>, SL extends Selector<Path.Result<T, P>>>(
    path: P,
    selector: Selector.Shape<SL>
  ): (source: T) => Selector.Result<Path.Result<T, P>, SL>;
}

/**
 * Returns a curried API with a known target type. This can be useful for using the methods in
 * contexts where the target type can be inferred from the usage.
 * @typeparam T - the target type
 * @example
 * ```ts
 * const s = { a: 1, b: { c: 'a', d: true }}
 * const upd = Deep.withType<typeof s>().patchWith([{ d: (v) => !v }])
 * upd(s)
 * // => { a: 1, b: { c: 'a', d: false }}
 * ```
 */
export function withType<T>(): WithType<T> {
  return Deep;
}
