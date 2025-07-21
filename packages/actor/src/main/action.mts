import { generateUUID } from './generate-uuid.mjs';
import type { ActionBase } from './internal.mjs';

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
   * @typeparam A - the creation argument array
   * @typeparam P - the payload type
   */
  export type Creator<A extends unknown[] = [], P = never> = ActionBase.Creator<
    Action<P>,
    A
  >;

  /**
   * Returns a new action creator instance that can be used to create `Action` instances.
   * @param config - the configuration for the action
   */
  export const create: {
    (config?: {
      type?: string;
      createTag?: () => string;
      createPayload?: never;
      unpack?: false;
    }): Action.Creator<[], unknown>;
    <A extends unknown[]>(config?: {
      type?: string;
      createTag?: () => string;
      createPayload?: never;
      unpack: true;
    }): Action.Creator<A, A>;
    <A>(config?: {
      type?: string;
      createTag?: () => string;
      createPayload?: never;
      unpack?: false;
    }): Action.Creator<[A], A>;
    <A extends unknown[], P>(config?: {
      type?: string;
      createTag?: () => string;
      createPayload: (...args: A) => P;
      unpack?: false;
    }): Action.Creator<A, P>;
  } = <A extends any[], P>(
    config: {
      type?: string;
      createPayload?: (...args: A) => P;
      createTag?: () => string;
      unpack?: boolean;
    } = {}
  ): Action.Creator<A, P> => {
    const { createPayload, createTag = generateUUID, unpack = false } = config;
    const tag = createTag();
    const type = config.type ?? `ANON_${tag}`;

    const result: Action.Creator<A, P> & { actionTag: string } = (
      ...args: A
    ) => ({
      tag,
      type,
      payload:
        undefined === createPayload
          ? unpack
            ? args
            : args[0]
          : createPayload(...args),
    });
    result.actionTag = tag;
    result.match = (action: ActionBase): action is Action<P> => {
      return action.tag === tag;
    };

    return result;
  };
}
