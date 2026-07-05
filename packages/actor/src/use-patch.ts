/**
 * @packageDocumentation
 *
 * The `@rimbu/actor/patch` entry provides utilities for patch‑style state updates in
 * `@rimbu/actor`, letting you update only parts of the actor state using concise patch
 * objects and updater functions.<br/>
 * Use it when you want ergonomic, fine‑grained state changes on actors without manually
 * cloning or reconstructing full state objects.
 */

import { Action } from '@rimbu/actor/action';
import { type Patch, patch } from '@rimbu/deep/patch';

import { SliceConfig } from '#actor/slice-config';

export namespace SlicePatch {
	export interface Config extends SliceConfig {
		_ACTION_HANDLER_ARGS: this['_ACTION_HANDLER_UNKNOWN'][];

		_ACTION_HANDLER_RESULT: Patch<
			unknown extends this['_STATE'] ? unknown : this['_STATE']
		>;

		_ACTION_HANDLER: (
			...args: this['_ACTION_HANDLER_ARGS']
		) => this['_ACTION_HANDLER_RESULT'];

		_INCLUDE_HANDLER_ARGS: [action: this['_INCLUDE_ACTION_TYPE']];

		_ACTION_TYPE: Action<Parameters<this['_ACTION_HANDLER']>>;
		_ACTION_CREATOR_PARAMS: Parameters<this['_ACTION_HANDLER']>;
	}

	export const { create } = SliceConfig.configure<SlicePatch.Config>({
		applyHandler: <S, A extends unknown[]>(
			state: S,
			action: Action<A>,
			handler: (...args: A) => Patch<S>,
		) => handler(...action.payload),
		applyIncluder: (state, action, includeHandler) => includeHandler(action),
		applyHandlerResult: (state, action, result) => patch(state, result),
		createAction: (sliceName, actionName) =>
			Action.create({
				type: `${sliceName}_${actionName}`,
				createPayload: Array.of,
			}),
	});
}
