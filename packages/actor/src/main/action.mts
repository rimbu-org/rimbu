import { generateUUID } from './generate-uuid';
import type { ActionBase } from './internal';

/**
 * The default action interface, containing an optional payload.
 * @typeparam P - the payload type
 */
export interface Action<P = unknown> extends ActionBase {
  readonly type: string;
  readonly payload: P;
}

export namespace Action {
  /**
   * Type for creating an `Action` instance.
   * @typeparam P - the payload type
   * @typeparam A - the creation argument array
   */
  export type Creator<P = never, A extends unknown[] = []> = ActionBase.Creator<
    Action<P>,
    A
  >;

  /**
   * Returns a new action creator instance that can be used to create `Action` instances.
   * @param config - the configuration for the action
   */
  export const create: {
    <P = void>(config?: {
      type?: string;
      createTag?: () => string;
      createPayload?: never;
    }): Action.Creator<P, [payload: P]>;
    <P, A extends unknown[]>(config?: {
      type?: string;
      createTag?: () => string;
      createPayload: (...args: A) => P;
    }): Action.Creator<P, A>;
  } = <P, A extends any[]>(
    config: {
      type?: string;
      createPayload?: (...args: A) => P;
      createTag?: () => string;
    } = {}
  ): Action.Creator<P, A> => {
    const { createPayload, createTag = generateUUID } = config;
    const tag = createTag();
    const type = config.type ?? `ANON_${tag}`;

    const result: Action.Creator<P, A> & { actionTag: string } = (
      ...args: A
    ) => ({
      tag,
      type,
      payload: undefined === createPayload ? args[0] : createPayload(...args),
    });
    result.actionTag = tag;
    result.match = (action: ActionBase): action is Action<P> => {
      return action.tag === tag;
    };

    return result;
  };
}
