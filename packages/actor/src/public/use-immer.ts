/**
 * @packageDocumentation
 *
 * The `@rimbu/actor/immer` entry provides helpers to integrate `@rimbu/actor` with
 * [`immer`](https://github.com/immerjs/immer) so you can express state updates as
 * convenient mutable drafts while still producing immutable state.<br/>
 * Use it when you want actor‑based state management with an Immer‑style update syntax.
 */

import type { Tail } from '#actor/utils';

import { Action } from '@rimbu/actor/action';
import { createDraft, finishDraft } from 'immer';

import { SliceConfig } from '#actor/slice-config';

export namespace SliceImmer {
	export interface Config extends SliceConfig {
		_ACTION_HANDLER_ARGS: [
			this['_STATE'],
			...this['_ACTION_HANDLER_UNKNOWN'][],
		];

		_ACTION_HANDLER: (...args: this['_ACTION_HANDLER_ARGS']) => void;

		_ACTION_HANDLER_RESULT: this['_STATE'];

		_INCLUDE_HANDLER_ARGS: [
			state: this['_STATE'],
			action: this['_INCLUDE_ACTION_TYPE'],
		];

		_INCLUDE_HANDLER: (...args: this['_INCLUDE_HANDLER_ARGS']) => void;

		_ACTION_TYPE: Action<Tail<Parameters<this['_ACTION_HANDLER']>>>;
		_ACTION_CREATOR_PARAMS: Tail<Parameters<this['_ACTION_HANDLER']>>;
	}

	/**
	 * Creates a new Immer-based actor {@link Slice} whose action handlers receive a
	 * mutable draft of the state and produce immutable updates via `immer`.
	 * @typeparam S - the slice state type
	 * @typeparam LU - the action-handler definition
	 * @param config - the slice configuration (name, initState, actions, includeActions)
	 * @returns a {@link Slice} containing the reducer and action creators
	 */
	export const { create } = SliceConfig.configure<SliceImmer.Config>({
		applyHandler: <S, A extends unknown[]>(
			state: S,
			action: Action<A>,
			handler: (state: S, ...args: A) => void,
		) => {
			const draft = createDraft(state as any) as S;
			handler(draft, ...action.payload);
			return finishDraft(draft) as S;
		},
		applyIncluder: (state, action, includeHandler) => {
			const draft = createDraft(state as any) as typeof state;
			includeHandler(draft, action);
			return finishDraft(draft) as any;
		},
		applyHandlerResult: (state, action, result) => result,
		createAction: (sliceName, actionName) =>
			Action.create({
				type: `${sliceName}_${actionName}`,
				createPayload: Array.of,
			}),
	});
}
