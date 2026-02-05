import { describe, expect, it, vi } from 'bun:test';

import type { ActionBase } from '#actor/action-base';

import { Action } from '@rimbu/actor/action';

import { Lookup } from '#actor/lookup';

const mockHalt = vi.fn();

describe('Lookup', () => {
	it('empty lookup creates reducer that does not change state', () => {
		const initState = { count: 0 };
		const reducer = Lookup.create(
			initState,
			{ actions: {} },
			(s, a, v) => s,
			(s) => s,
		);
		expect(reducer.init(mockHalt)).toBe(initState);
		const action = Action.create();
		expect(reducer.next(reducer.init(mockHalt), action(), 0, () => {})).toBe(
			initState,
		);
	});

	it('handles action values', () => {
		const initState = { count: 0 };
		const reducer = Lookup.create(
			initState,
			{
				actions: {
					inc: 1,
					dec: -1,
				},
			},
			(s, a, v) => ({ count: s.count + v }),
			(s) => s,
		);
		expect(reducer.init(mockHalt)).toBe(initState);
		const action = Action.create();
		const incAction = Action.create({ createTag: () => 'inc' });
		const decAction = Action.create({ createTag: () => 'dec' });

		expect(reducer.next(reducer.init(mockHalt), action(), 0, () => {})).toBe(
			initState,
		);
		expect(
			reducer.next(reducer.init(mockHalt), incAction(), 0, () => {}),
		).toEqual({
			count: 1,
		});
		expect(
			reducer.next(reducer.init(mockHalt), decAction(), 0, () => {}),
		).toEqual({
			count: -1,
		});
	});

	it('handles fallback', () => {
		const initState = { count: 0 };
		const reducer = Lookup.create(
			initState,
			{
				actions: {
					inc: 1,
				},
				fallback: (a: ActionBase) => 100,
			},
			(s, a, v) => ({ count: s.count + v }),
			(s, a, v) => ({ count: s.count + v(a) }),
		);
		expect(reducer.init(mockHalt)).toBe(initState);
		const action = Action.create();
		const incAction = Action.create({ createTag: () => 'inc' });

		expect(
			reducer.next(reducer.init(mockHalt), incAction(), 0, () => {}),
		).toEqual({
			count: 1,
		});
		expect(reducer.next(reducer.init(mockHalt), action(), 0, () => {})).toEqual(
			{
				count: 100,
			},
		);
	});
});
