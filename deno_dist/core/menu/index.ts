import * as Menu from './menu.ts';

/**
 * Default export for the `@rimbu/core/menu` entry point.
 *
 * @remarks
 * The default export is the Rimbu creation "menu", which groups the main
 * collections and their factory functions into a single namespace. This makes
 * it easy to create collections without importing each sub-package
 * individually.
 *
 * @example
 * ```ts
 * import Rimbu from '@rimbu/core/menu';
 *
 * const list = Rimbu.List.of(1, 3, 2, 4, 2);
 * const stream = Rimbu.Stream.from(list).map((v) => [v, String(v * 2)]);
 * const map = Rimbu.Map.Sorted.from(stream);
 * ```
 */
export default Menu;
