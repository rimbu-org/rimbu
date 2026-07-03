import { describe, expect, it } from 'bun:test';

import type { ListImpl } from '#list/list-impl';

import { TraverseState } from '@rimbu/common/traverse-state';
import { TypedArrayListHelpers } from '@rimbu/list2/internal/typed-array-helpers';

import { CharListHelpers } from '#list/char-list-helpers';
import { ListHelpers } from '#list/list-helpers';

/**
 * A shared test suite for any `OuterChildrenOps` implementation.
 *
 * `createOps` — factory that returns the ops object under test.
 * `makeChildren` — converts a plain `string[]` of single characters into the
 *   concrete children representation used by this implementation.
 * `toValues` — converts children back to a plain `string[]` for easy
 *   assertion.
 *
 * All test data uses single-character strings so that the same suite works
 * for both the array-backed implementation (ListHelpers) and the
 * string-backed implementation (CharListHelpers) without modification.
 */
function runOuterChildrenOpsTests(
	tag: string,
	createOps: () => ListImpl.OuterChildrenOps<any>,
	makeChildren: (chars: string[]) => any,
	toValues: (children: any) => string[],
) {
	describe(`${tag} OuterChildrenOps`, () => {
		// ------------------------------------------------------------------ //
		// length
		// ------------------------------------------------------------------ //
		describe('length', () => {
			it('returns 0 for empty children', () => {
				const ops = createOps();
				expect(ops.length(makeChildren([]))).toBe(0);
			});

			it('returns the correct count', () => {
				const ops = createOps();
				expect(ops.length(makeChildren(['a', 'b', 'c']))).toBe(3);
			});
		});

		// ------------------------------------------------------------------ //
		// at
		// ------------------------------------------------------------------ //
		describe('at', () => {
			it('returns element at positive index', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				expect(ops.at(ch, 0)).toBe('a');
				expect(ops.at(ch, 1)).toBe('b');
				expect(ops.at(ch, 2)).toBe('c');
			});

			it('returns element at negative index', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				expect(ops.at(ch, -1)).toBe('c');
				expect(ops.at(ch, -3)).toBe('a');
			});
		});

		// ------------------------------------------------------------------ //
		// updateAt
		// ------------------------------------------------------------------ //
		describe('updateAt', () => {
			it('returns updated children when value changes', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const result = ops.updateAt(ch, 1, () => 'x');
				expect(toValues(result)).toEqual(['a', 'x', 'c']);
			});

			it('returns the same reference when update returns the same value', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const result = ops.updateAt(ch, 1, (v) => v);
				// identity check: no unnecessary allocation
				expect(result).toBe(ch);
			});

			it('passes the current value to the updater', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				let received: string | undefined;
				ops.updateAt(ch, 2, (v) => {
					received = v;
					return v;
				});
				expect(received).toBe('c');
			});
		});

		// ------------------------------------------------------------------ //
		// stream
		// ------------------------------------------------------------------ //
		describe('stream', () => {
			it('streams elements in order', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				expect(ops.stream(ch).toArray()).toEqual(['a', 'b', 'c']);
			});

			it('streams elements in reverse order', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				expect(ops.stream(ch, { reversed: true }).toArray()).toEqual([
					'c',
					'b',
					'a',
				]);
			});
		});

		// ------------------------------------------------------------------ //
		// streamRange
		// ------------------------------------------------------------------ //
		describe('streamRange', () => {
			it('streams all elements when no range provided', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c', 'd']);
				expect(ops.streamRange(ch, {}).toArray()).toEqual(['a', 'b', 'c', 'd']);
			});

			it('streams a sub-range', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c', 'd']);
				expect(
					ops.streamRange(ch, { range: { start: 1, end: 2 } }).toArray(),
				).toEqual(['b', 'c']);
			});

			it('streams a sub-range reversed', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c', 'd']);
				expect(
					ops
						.streamRange(ch, { range: { start: 1, end: 2 }, reversed: true })
						.toArray(),
				).toEqual(['c', 'b']);
			});
		});

		// ------------------------------------------------------------------ //
		// of
		// ------------------------------------------------------------------ //
		describe('of', () => {
			it('creates children from an array of values', () => {
				const ops = createOps();
				const result = ops.of(['a', 'b', 'c']);
				expect(toValues(result)).toEqual(['a', 'b', 'c']);
			});

			it('creates empty children from an empty array', () => {
				const ops = createOps();
				const result = ops.of([]);
				expect(toValues(result)).toEqual([]);
			});
		});

		// ------------------------------------------------------------------ //
		// prepend
		// ------------------------------------------------------------------ //
		describe('prepend', () => {
			it('adds value at the front', () => {
				const ops = createOps();
				const ch = makeChildren(['b', 'c']);
				expect(toValues(ops.prepend(ch, 'a'))).toEqual(['a', 'b', 'c']);
			});

			it('prepend to empty', () => {
				const ops = createOps();
				expect(toValues(ops.prepend(makeChildren([]), 'a'))).toEqual(['a']);
			});
		});

		// ------------------------------------------------------------------ //
		// append
		// ------------------------------------------------------------------ //
		describe('append', () => {
			it('adds value at the end', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b']);
				expect(toValues(ops.append(ch, 'c'))).toEqual(['a', 'b', 'c']);
			});

			it('append to empty', () => {
				const ops = createOps();
				expect(toValues(ops.append(makeChildren([]), 'z'))).toEqual(['z']);
			});
		});

		// ------------------------------------------------------------------ //
		// concat
		// ------------------------------------------------------------------ //
		describe('concat', () => {
			it('concatenates two children', () => {
				const ops = createOps();
				const ch1 = makeChildren(['a', 'b']);
				const ch2 = makeChildren(['c', 'd']);
				expect(toValues(ops.concat(ch1, ch2))).toEqual(['a', 'b', 'c', 'd']);
			});

			it('concat with empty left', () => {
				const ops = createOps();
				const empty = makeChildren([]);
				const ch = makeChildren(['a', 'b']);
				expect(toValues(ops.concat(empty, ch))).toEqual(['a', 'b']);
			});

			it('concat with empty right', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b']);
				const empty = makeChildren([]);
				expect(toValues(ops.concat(ch, empty))).toEqual(['a', 'b']);
			});
		});

		// ------------------------------------------------------------------ //
		// toReversed
		// ------------------------------------------------------------------ //
		describe('toReversed', () => {
			it('reverses children', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				expect(toValues(ops.toReversed(ch))).toEqual(['c', 'b', 'a']);
			});

			it('reverse of single element is the same values', () => {
				const ops = createOps();
				const ch = makeChildren(['x']);
				expect(toValues(ops.toReversed(ch))).toEqual(['x']);
			});

			it('reverse of empty is empty', () => {
				const ops = createOps();
				const ch = makeChildren([]);
				expect(toValues(ops.toReversed(ch))).toEqual([]);
			});
		});

		// ------------------------------------------------------------------ //
		// toSpliced
		// ------------------------------------------------------------------ //
		describe('toSpliced', () => {
			it('removes elements in range', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c', 'd']);
				expect(toValues(ops.toSpliced(ch, 1, 2))).toEqual(['a', 'd']);
			});

			it('inserts elements without deleting', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'd']);
				const items = makeChildren(['b', 'c']);
				expect(toValues(ops.toSpliced(ch, 1, 0, items))).toEqual([
					'a',
					'b',
					'c',
					'd',
				]);
			});

			it('replaces elements', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const items = makeChildren(['x', 'y']);
				expect(toValues(ops.toSpliced(ch, 1, 1, items))).toEqual([
					'a',
					'x',
					'y',
					'c',
				]);
			});

			it('does not mutate original children', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				ops.toSpliced(ch, 0, 1);
				// Original is unchanged
				expect(toValues(ch)).toEqual(['a', 'b', 'c']);
			});
		});

		// ------------------------------------------------------------------ //
		// join
		// ------------------------------------------------------------------ //
		describe('join', () => {
			it('joins with separator', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				expect(ops.join(ch, '-')).toBe('a-b-c');
			});

			it('joins with empty separator', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				expect(ops.join(ch, '')).toBe('abc');
			});

			it('joins reversed', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				expect(ops.join(ch, '-', true)).toBe('c-b-a');
			});
		});

		// ------------------------------------------------------------------ //
		// map
		// ------------------------------------------------------------------ //
		describe('map', () => {
			it('maps each element', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const result = ops.map(ch, (v: string) => v.toUpperCase());
				expect(toValues(result)).toEqual(['A', 'B', 'C']);
			});

			it('passes correct index without offset', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const indices: number[] = [];
				ops.map(ch, (_v: string, i: number) => {
					indices.push(i);
					return _v;
				});
				expect(indices).toEqual([0, 1, 2]);
			});

			it('passes correct index with offset', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const indices: number[] = [];
				ops.map(
					ch,
					(_v: string, i: number) => {
						indices.push(i);
						return _v;
					},
					10,
				);
				expect(indices).toEqual([10, 11, 12]);
			});
		});

		// ------------------------------------------------------------------ //
		// reverseMap
		// ------------------------------------------------------------------ //
		describe('reverseMap', () => {
			it('maps elements in reverse order', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				// reverseMap iterates reversed, writing to result in forward order
				const result = ops.reverseMap(ch, (v: string) => v.toUpperCase());
				expect(toValues(result)).toEqual(['C', 'B', 'A']);
			});

			it('passes ascending index without offset', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const indices: number[] = [];
				ops.reverseMap(ch, (_v: string, i: number) => {
					indices.push(i);
					return _v;
				});
				expect(indices).toEqual([0, 1, 2]);
			});

			it('passes ascending index with offset', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const indices: number[] = [];
				ops.reverseMap(
					ch,
					(_v: string, i: number) => {
						indices.push(i);
						return _v;
					},
					5,
				);
				expect(indices).toEqual([5, 6, 7]);
			});
		});

		// ------------------------------------------------------------------ //
		// forEach
		// ------------------------------------------------------------------ //
		describe('forEach', () => {
			it('visits all elements in order', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const visited: string[] = [];
				const state = TraverseState();
				ops.forEach(
					ch,
					(v: string) => {
						visited.push(v);
					},
					{ reversed: false, state },
				);
				expect(visited).toEqual(['a', 'b', 'c']);
			});

			it('visits all elements in reverse', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const visited: string[] = [];
				const state = TraverseState();
				ops.forEach(
					ch,
					(v: string) => {
						visited.push(v);
					},
					{ reversed: true, state },
				);
				expect(visited).toEqual(['c', 'b', 'a']);
			});

			it('tracks sequential indices via state', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const indices: number[] = [];
				const state = TraverseState();
				ops.forEach(
					ch,
					(_v: string, i: number) => {
						indices.push(i);
					},
					{ reversed: false, state },
				);
				expect(indices).toEqual([0, 1, 2]);
			});

			it('halts traversal when halt() is called', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c', 'd']);
				const visited: string[] = [];
				const state = TraverseState();
				ops.forEach(
					ch,
					(v: string, _i: number, halt: () => void) => {
						visited.push(v);
						if (v === 'b') halt();
					},
					{ reversed: false, state },
				);
				expect(visited).toEqual(['a', 'b']);
			});

			it('skips all elements when state is already halted', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const visited: string[] = [];
				const state = TraverseState();
				state.halt();
				ops.forEach(
					ch,
					(v: string) => {
						visited.push(v);
					},
					{ reversed: false, state },
				);
				expect(visited).toEqual([]);
			});
		});

		// ------------------------------------------------------------------ //
		// toArray
		// ------------------------------------------------------------------ //
		describe('toArray', () => {
			it('returns all values as an array', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				expect(ops.toArray(ch)).toEqual(['a', 'b', 'c']);
			});

			it('returns a slice when start and end are given', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c', 'd']);
				expect(ops.toArray(ch, 1, 3)).toEqual(['b', 'c']);
			});

			it('returns reversed array', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				expect(ops.toArray(ch, undefined, undefined, true)).toEqual([
					'c',
					'b',
					'a',
				]);
			});

			// NOTE: the `end` parameter semantics differ between implementations
			// when `reversed` is true: the array-backed implementation treats `end`
			// as exclusive (matching Array.prototype.slice), while the string-backed
			// implementation delegates to Stream.fromString which uses an inclusive
			// IndexRange end. The reversed-slice test is therefore implementation-
			// specific and is omitted from this shared suite.
		});

		// ------------------------------------------------------------------ //
		// mutateSet
		// ------------------------------------------------------------------ //
		describe('mutateSet', () => {
			it('sets value at given index', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren(['a', 'b', 'c']));
				const result = ops.mutateSet(ch, 1, 'x');
				expect(toValues(result)).toEqual(['a', 'x', 'c']);
			});
		});

		// ------------------------------------------------------------------ //
		// mutateAppend
		// ------------------------------------------------------------------ //
		describe('mutateAppend', () => {
			it('appends a value', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren(['a', 'b']));
				const result = ops.mutateAppend(ch, 'c');
				expect(toValues(result)).toEqual(['a', 'b', 'c']);
			});
		});

		// ------------------------------------------------------------------ //
		// mutatePrepend
		// ------------------------------------------------------------------ //
		describe('mutatePrepend', () => {
			it('prepends a value', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren(['b', 'c']));
				const result = ops.mutatePrepend(ch, 'a');
				expect(toValues(result)).toEqual(['a', 'b', 'c']);
			});
		});

		// ------------------------------------------------------------------ //
		// mutateDropFirst
		// ------------------------------------------------------------------ //
		describe('mutateDropFirst', () => {
			it('drops first element and returns it', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren(['a', 'b', 'c']));
				const [result, dropped] = ops.mutateDropFirst(ch);
				expect(dropped).toBe('a');
				expect(toValues(result)).toEqual(['b', 'c']);
			});
		});

		// ------------------------------------------------------------------ //
		// mutateDropLast
		// ------------------------------------------------------------------ //
		describe('mutateDropLast', () => {
			it('drops last element and returns it', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren(['a', 'b', 'c']));
				const [result, dropped] = ops.mutateDropLast(ch);
				expect(dropped).toBe('c');
				expect(toValues(result)).toEqual(['a', 'b']);
			});
		});

		// ------------------------------------------------------------------ //
		// mutateSplice
		// ------------------------------------------------------------------ //
		describe('mutateSplice', () => {
			it('removes elements and returns them', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren(['a', 'b', 'c', 'd']));
				const [result, deleted] = ops.mutateSplice(ch, 1, 2);
				expect(toValues(result)).toEqual(['a', 'd']);
				expect(toValues(deleted)).toEqual(['b', 'c']);
			});

			it('inserts elements', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren(['a', 'd']));
				const items = makeChildren(['b', 'c']);
				const [result, deleted] = ops.mutateSplice(ch, 1, 0, items);
				expect(toValues(result)).toEqual(['a', 'b', 'c', 'd']);
				expect(toValues(deleted)).toEqual([]);
			});
		});

		// ------------------------------------------------------------------ //
		// safeCopy
		// ------------------------------------------------------------------ //
		describe('safeCopy', () => {
			it('returns a copy that can be mutated independently', () => {
				const ops = createOps();
				const ch = makeChildren(['a', 'b', 'c']);
				const copy = ops.safeCopy(ch);
				// mutating the copy must not affect the original
				ops.mutateAppend(copy, 'x');
				expect(toValues(ch)).toEqual(['a', 'b', 'c']);
			});
		});
	});
}

const listContext = ListHelpers.createListContext({ blockSizeBits: 2 });

runOuterChildrenOpsTests(
	'ListHelpers (array)',
	() => (listContext as any).outerChildrenOps,
	(chars: string[]) => chars as readonly string[],
	(children: readonly string[]) => [...children],
);

const charListContext = CharListHelpers.createCharListContext({
	blockSizeBits: 2,
});

runOuterChildrenOpsTests(
	'CharListHelpers (string)',
	() => (charListContext as any).outerChildrenOps,
	(chars: string[]) => chars.join('') as any,
	(children: string) => children.split(''),
);

const typedArrayContext = TypedArrayListHelpers.createTypedArrayListContext(
	{ ViewConstructor: Uint16Array },
	{ blockSizeBits: 2 },
);
