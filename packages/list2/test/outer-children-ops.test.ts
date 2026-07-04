import { describe, expect, it } from 'bun:test';

import type { ListImpl } from '#list/list-impl';

import { TraverseState } from '@rimbu/common/traverse-state';
import { TypedArrayListHelpers } from '@rimbu/list2/internal/typed-array-helpers';

import { BitListHelpers } from '#list/bit-list-helpers';
import { CharListHelpers } from '#list/char-list-helpers';
import { ListHelpers } from '#list/list-helpers';

/**
 * Value-type–specific helpers needed by the shared suite.
 *
 * `samples` — four distinct values used as `[a, b, c, d]` throughout tests.
 * `makeChildren` — converts a `samples` sub-array into the concrete children
 *   representation used by this implementation.
 * `toValues` — converts children back to a plain array for assertions.
 * `mapFn` — a deterministic element→element transform used in `map` /
 *   `reverseMap` tests (must be its own inverse so we can verify the output).
 * `haltValue` — the value at which `forEach` should call `halt()`; must be
 *   `samples[1]` so the halt test expects `[samples[0], samples[1]]`.
 * `joinSep` — separator character used in `join` tests.
 * `joinExpected` — expected result of `join(children, joinSep)` for
 *   `[samples[0], samples[1], samples[2]]`.
 * `joinReversedExpected` — expected result of the reversed join.
 */
interface OuterChildrenOpsTestConfig<V> {
	samples: [V, V, V, V];
	makeChildren: (values: V[]) => any;
	toValues: (children: any) => V[];
	mapFn: (v: V) => V;
	mapExpected: (values: V[]) => V[];
	haltValue: V;
	joinSep: string;
	joinExpected: string;
	joinReversedExpected: string;
}

/**
 * A shared test suite for any `OuterChildrenOps` implementation.
 *
 * `createOps` — factory that returns the ops object under test.
 * `cfg` — value-type–specific helpers (see `OuterChildrenOpsTestConfig`).
 */
function runOuterChildrenOpsTests<V>(
	tag: string,
	createOps: () => ListImpl.OuterChildrenOps<any>,
	cfg: OuterChildrenOpsTestConfig<V>,
) {
	const {
		samples,
		makeChildren,
		toValues,
		mapFn,
		mapExpected,
		haltValue,
		joinSep,
		joinExpected,
		joinReversedExpected,
	} = cfg;
	const [a, b, c, d] = samples;

	describe(`${tag} OuterChildrenOps`, () => {
		describe('length', () => {
			it('returns 0 for empty children', () => {
				const ops = createOps();
				expect(ops.length(makeChildren([]))).toBe(0);
			});

			it('returns the correct count', () => {
				const ops = createOps();
				expect(ops.length(makeChildren([a, b, c]))).toBe(3);
			});
		});

		describe('at', () => {
			it('returns element at positive index', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				expect(ops.at(ch, 0)).toBe(a as any);
				expect(ops.at(ch, 1)).toBe(b as any);
				expect(ops.at(ch, 2)).toBe(c as any);
			});

			it('returns element at negative index', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				expect(ops.at(ch, -1)).toBe(c as any);
				expect(ops.at(ch, -3)).toBe(a as any);
			});
		});

		describe('updateAt', () => {
			it('returns updated children when value changes', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const result = ops.updateAt(ch, 1, () => d);
				expect(toValues(result)).toEqual([a, d, c]);
			});

			it('returns the same reference when update returns the same value', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const result = ops.updateAt(ch, 1, (v) => v);
				expect(result).toBe(ch);
			});

			it('passes the current value to the updater', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				let received: V | undefined;
				ops.updateAt(ch, 2, (v) => {
					received = v;
					return v;
				});
				expect(received).toBe(c);
			});
		});

		describe('stream', () => {
			it('streams elements in order', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				expect(ops.stream(ch).toArray()).toEqual([a, b, c]);
			});

			it('streams elements in reverse order', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				expect(ops.stream(ch, { reversed: true }).toArray()).toEqual([c, b, a]);
			});
		});

		describe('streamRange', () => {
			it('streams all elements when no range provided', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c, d]);
				expect(ops.streamRange(ch, {}).toArray()).toEqual([a, b, c, d]);
			});

			it('streams a sub-range', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c, d]);
				expect(
					ops.streamRange(ch, { range: { start: 1, end: 2 } }).toArray(),
				).toEqual([b, c]);
			});

			it('streams a sub-range reversed', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c, d]);
				expect(
					ops
						.streamRange(ch, { range: { start: 1, end: 2 }, reversed: true })
						.toArray(),
				).toEqual([c, b]);
			});
		});

		describe('of', () => {
			it('creates children from an array of values', () => {
				const ops = createOps();
				const result = ops.of([a, b, c]);
				expect(toValues(result)).toEqual([a, b, c]);
			});

			it('creates empty children from an empty array', () => {
				const ops = createOps();
				const result = ops.of([]);
				expect(toValues(result)).toEqual([]);
			});
		});

		describe('prepend', () => {
			it('adds value at the front', () => {
				const ops = createOps();
				const ch = makeChildren([b, c]);
				expect(toValues(ops.prepend(ch, a))).toEqual([a, b, c]);
			});

			it('prepend to empty', () => {
				const ops = createOps();
				expect(toValues(ops.prepend(makeChildren([]), a))).toEqual([a]);
			});
		});

		describe('append', () => {
			it('adds value at the end', () => {
				const ops = createOps();
				const ch = makeChildren([a, b]);
				expect(toValues(ops.append(ch, c))).toEqual([a, b, c]);
			});

			it('append to empty', () => {
				const ops = createOps();
				expect(toValues(ops.append(makeChildren([]), d))).toEqual([d]);
			});
		});

		describe('concat', () => {
			it('concatenates two children', () => {
				const ops = createOps();
				const ch1 = makeChildren([a, b]);
				const ch2 = makeChildren([c, d]);
				expect(toValues(ops.concat(ch1, ch2))).toEqual([a, b, c, d]);
			});

			it('concat with empty left', () => {
				const ops = createOps();
				const empty = makeChildren([]);
				const ch = makeChildren([a, b]);
				expect(toValues(ops.concat(empty, ch))).toEqual([a, b]);
			});

			it('concat with empty right', () => {
				const ops = createOps();
				const ch = makeChildren([a, b]);
				const empty = makeChildren([]);
				expect(toValues(ops.concat(ch, empty))).toEqual([a, b]);
			});
		});

		describe('toReversed', () => {
			it('reverses children', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				expect(toValues(ops.toReversed(ch))).toEqual([c, b, a]);
			});

			it('reverse of single element is the same values', () => {
				const ops = createOps();
				const ch = makeChildren([a]);
				expect(toValues(ops.toReversed(ch))).toEqual([a]);
			});

			it('reverse of empty is empty', () => {
				const ops = createOps();
				const ch = makeChildren([]);
				expect(toValues(ops.toReversed(ch))).toEqual([]);
			});
		});

		describe('toSpliced', () => {
			it('removes elements in range', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c, d]);
				expect(toValues(ops.toSpliced(ch, 1, 2))).toEqual([a, d]);
			});

			it('inserts elements without deleting', () => {
				const ops = createOps();
				const ch = makeChildren([a, d]);
				const items = makeChildren([b, c]);
				expect(toValues(ops.toSpliced(ch, 1, 0, items))).toEqual([a, b, c, d]);
			});

			it('replaces elements', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const items = makeChildren([c, d]);
				expect(toValues(ops.toSpliced(ch, 1, 1, items))).toEqual([a, c, d, c]);
			});

			it('does not mutate original children', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				ops.toSpliced(ch, 0, 1);
				expect(toValues(ch)).toEqual([a, b, c]);
			});
		});

		describe('join', () => {
			it('joins with separator', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				expect(ops.join(ch, joinSep)).toBe(joinExpected);
			});

			it('joins with empty separator', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				expect(ops.join(ch, '')).toBe(joinExpected.split(joinSep).join(''));
			});

			it('joins reversed', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				expect(ops.join(ch, joinSep, true)).toBe(joinReversedExpected);
			});
		});

		describe('map', () => {
			it('maps each element', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const result = ops.map(ch, mapFn);
				expect(toValues(result)).toEqual(mapExpected([a, b, c]));
			});

			it('passes correct index without offset', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const indices: number[] = [];
				ops.map(ch, (v: V, i: number) => {
					indices.push(i);
					return v;
				});
				expect(indices).toEqual([0, 1, 2]);
			});

			it('passes correct index with offset', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const indices: number[] = [];
				ops.map(
					ch,
					(v: V, i: number) => {
						indices.push(i);
						return v;
					},
					10,
				);
				expect(indices).toEqual([10, 11, 12]);
			});
		});

		describe('reverseMap', () => {
			it('maps elements in reverse order', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const result = ops.reverseMap(ch, mapFn);
				expect(toValues(result)).toEqual(mapExpected([c, b, a]));
			});

			it('passes ascending index without offset', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const indices: number[] = [];
				ops.reverseMap(ch, (v: V, i: number) => {
					indices.push(i);
					return v;
				});
				expect(indices).toEqual([0, 1, 2]);
			});

			it('passes ascending index with offset', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const indices: number[] = [];
				ops.reverseMap(
					ch,
					(v: V, i: number) => {
						indices.push(i);
						return v;
					},
					5,
				);
				expect(indices).toEqual([5, 6, 7]);
			});
		});

		describe('forEach', () => {
			it('visits all elements in order', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const visited: V[] = [];
				const state = TraverseState();
				ops.forEach(
					ch,
					(v: V) => {
						visited.push(v);
					},
					{ reversed: false, state },
				);
				expect(visited).toEqual([a, b, c]);
			});

			it('visits all elements in reverse', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const visited: V[] = [];
				const state = TraverseState();
				ops.forEach(
					ch,
					(v: V) => {
						visited.push(v);
					},
					{ reversed: true, state },
				);
				expect(visited).toEqual([c, b, a]);
			});

			it('tracks sequential indices via state', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const indices: number[] = [];
				const state = TraverseState();
				ops.forEach(
					ch,
					(_v: V, i: number) => {
						indices.push(i);
					},
					{ reversed: false, state },
				);
				expect(indices).toEqual([0, 1, 2]);
			});

			it('halts traversal when halt() is called', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c, d]);
				const visited: V[] = [];
				const state = TraverseState();
				ops.forEach(
					ch,
					(v: V, _i: number, halt: () => void) => {
						visited.push(v);
						if (v === haltValue) halt();
					},
					{ reversed: false, state },
				);
				expect(visited).toEqual([a, haltValue]);
			});

			it('skips all elements when state is already halted', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const visited: V[] = [];
				const state = TraverseState();
				state.halt();
				ops.forEach(
					ch,
					(v: V) => {
						visited.push(v);
					},
					{ reversed: false, state },
				);
				expect(visited).toEqual([]);
			});
		});

		describe('toArray', () => {
			it('returns all values as an array', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				expect(ops.toArray(ch)).toEqual([a, b, c]);
			});

			it('returns a slice when start and end are given', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c, d]);
				expect(ops.toArray(ch, 1, 3)).toEqual([b, c]);
			});

			it('returns reversed array', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				expect(ops.toArray(ch, undefined, undefined, true)).toEqual([c, b, a]);
			});

			it('returns reversed slice with exclusive end', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c, d]);
				expect(ops.toArray(ch, 1, 3, true)).toEqual([c, b]);
			});
		});

		describe('mutateSet', () => {
			it('sets value at given index', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren([a, b, c]));
				const result = ops.mutateSet(ch, 1, d);
				expect(toValues(result)).toEqual([a, d, c]);
			});
		});

		describe('mutateAppend', () => {
			it('appends a value', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren([a, b]));
				const result = ops.mutateAppend(ch, c);
				expect(toValues(result)).toEqual([a, b, c]);
			});
		});

		describe('mutatePrepend', () => {
			it('prepends a value', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren([b, c]));
				const result = ops.mutatePrepend(ch, a);
				expect(toValues(result)).toEqual([a, b, c]);
			});
		});

		describe('mutateDropFirst', () => {
			it('drops first element and returns it', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren([a, b, c]));
				const [result, dropped] = ops.mutateDropFirst(ch);
				expect(dropped).toBe(a);
				expect(toValues(result)).toEqual([b, c]);
			});
		});

		describe('mutateDropLast', () => {
			it('drops last element and returns it', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren([a, b, c]));
				const [result, dropped] = ops.mutateDropLast(ch);
				expect(dropped).toBe(c);
				expect(toValues(result)).toEqual([a, b]);
			});
		});

		describe('mutateSplice', () => {
			it('removes elements and returns them', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren([a, b, c, d]));
				const [result, deleted] = ops.mutateSplice(ch, 1, 2);
				expect(toValues(result)).toEqual([a, d]);
				expect(toValues(deleted)).toEqual([b, c]);
			});

			it('inserts elements', () => {
				const ops = createOps();
				const ch = ops.safeCopy(makeChildren([a, d]));
				const items = makeChildren([b, c]);
				const [result, deleted] = ops.mutateSplice(ch, 1, 0, items);
				expect(toValues(result)).toEqual([a, b, c, d]);
				expect(toValues(deleted)).toEqual([]);
			});
		});

		describe('safeCopy', () => {
			it('returns a copy that can be mutated independently', () => {
				const ops = createOps();
				const ch = makeChildren([a, b, c]);
				const copy = ops.safeCopy(ch);
				ops.mutateAppend(copy, d);
				expect(toValues(ch)).toEqual([a, b, c]);
			});
		});
	});
}

const listContext = ListHelpers.createListContext({ blockSizeBits: 2 });

runOuterChildrenOpsTests(
	'ListHelpers (array)',
	() => (listContext as any).outerChildrenOps,
	{
		samples: ['a', 'b', 'c', 'd'],
		makeChildren: (chars: string[]) => chars as readonly string[],
		toValues: (children: readonly string[]) => [...children],
		mapFn: (v: string) => v.toUpperCase(),
		mapExpected: (vs: string[]) => vs.map((v) => v.toUpperCase()),
		haltValue: 'b',
		joinSep: '-',
		joinExpected: 'a-b-c',
		joinReversedExpected: 'c-b-a',
	},
);

const charListContext = CharListHelpers.createCharListContext({
	blockSizeBits: 2,
});

runOuterChildrenOpsTests(
	'CharListHelpers (string)',
	() => (charListContext as any).outerChildrenOps,
	{
		samples: ['a', 'b', 'c', 'd'],
		makeChildren: (chars: string[]) => chars.join('') as any,
		toValues: (children: string) => children.split(''),
		mapFn: (v: string) => v.toUpperCase(),
		mapExpected: (vs: string[]) => vs.map((v) => v.toUpperCase()),
		haltValue: 'b',
		joinSep: '-',
		joinExpected: 'a-b-c',
		joinReversedExpected: 'c-b-a',
	},
);

const typedArrayContext = TypedArrayListHelpers.createTypedArrayListContext(
	{ ViewConstructor: Uint16Array },
	{ blockSizeBits: 2 },
);

runOuterChildrenOpsTests(
	'TypedArrayListHelpers (Uint16Array)',
	() => (typedArrayContext as any).outerChildrenOps,
	{
		samples: [1, 10, 100, 1000],
		makeChildren: (nums: number[]) => {
			const buf = new ArrayBuffer(nums.length * Uint16Array.BYTES_PER_ELEMENT, {
				maxByteLength: 256 * Uint16Array.BYTES_PER_ELEMENT,
			});
			new Uint16Array(buf).set(nums);
			return buf;
		},
		toValues: (children: ArrayBuffer) => Array.from(new Uint16Array(children)),
		mapFn: (v: number) => v * 2,
		mapExpected: (vs: number[]) => vs.map((v) => v * 2),
		haltValue: 10,
		joinSep: '-',
		joinExpected: '1-10-100',
		joinReversedExpected: '100-10-1',
	},
);

const bitListContext = BitListHelpers.createBitListContext({
	blockSizeBits: 2,
});

runOuterChildrenOpsTests(
	'BitListHelpers (bigint)',
	() => (bitListContext as any).outerChildrenOps,
	{
		// Four distinct boolean values cycling false/true; haltValue must be
		// samples[1] so the halt test expects [samples[0], samples[1]].
		samples: [false, true, false, true] as [boolean, boolean, boolean, boolean],
		makeChildren: (values: boolean[]) => {
			// Replicate the bigint encoding from BitListHelpers:
			// lower (blockSizeBits + 1) bits = length, upper bits = element values.
			const dataBitOffset = 3; // blockSizeBits(2) + 1
			// const lengthBits = BigInt(dataBitOffset);
			const len = values.length;
			let result = BigInt(len);
			for (let i = 0; i < len; i++) {
				if (values[i]) result |= 1n << BigInt(dataBitOffset + i);
			}
			return result;
		},
		toValues: (children: bigint) => {
			const dataBitOffset = 3; // blockSizeBits(2) + 1
			const lengthMask = (1n << BigInt(dataBitOffset)) - 1n;
			const len = Number(children & lengthMask);
			const result: boolean[] = [];
			for (let i = 0; i < len; i++) {
				result.push((children & (1n << BigInt(dataBitOffset + i))) !== 0n);
			}
			return result;
		},
		mapFn: (v: boolean) => !v,
		mapExpected: (vs: boolean[]) => vs.map((v) => !v),
		haltValue: true,
		joinSep: '-',
		joinExpected: 'false-true-false',
		joinReversedExpected: 'false-true-false',
	},
);
