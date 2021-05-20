import { Actor, Command } from '@rimbu/actor';
import { Immutable } from '@rimbu/deep';
import React from 'react';
import { useConst, useSubscribeUpdateUI } from '../internal';

/**
 * Returns the result of activating the bindings in resulting from the given `getBindings`.
 * @param getBindings - a memoizable function that returns the bindings to use.
 * const modelActor = Obs.create({ value: 1 })
 *
 * const command = Command.create({
 *   execute() {
 *     modelActor.patchState({ value: v => v + 1 })
 *   },
 *   enabled: modelActor.mapReadonly(s => s.value < 10)
 * })
 *
 * export const MyComponent = () => {
 *   const state = useActorState(() => modelActor)

*   const bindings = useBindings(() => ({
 *     increase: Binding.command(command)
 *   }));
 *
 *   return (
 *     <>
 *       <div>{state.value}</div>
 *       <button {...bindings.increase}>Increase</button>
 *     </>
 *   )
 * }
 */
export function useBindings<B extends Binding.Def>(
  getBindings: () => B
): Binding.Result<B> {
  const bindings = useConst(getBindings);

  for (const key in bindings) {
    for (const source of bindings[key][0]) {
      useSubscribeUpdateUI(() => source);
    }
  }

  return useConst(() => {
    const result: any = {};

    for (const key in bindings) {
      result[key] = bindings[key][1];
    }

    return result;
  });
}

/**
 * A Binding is a 2-element tuple of which the first element is an array of Actors to subscribe to for state changes,
 * and the second element is the binding result.
 * @typeparam T - the binding result type
 */
export type Binding<T> = readonly [
  readonly Actor.Readonly<any>[],
  Immutable<T>
];

export namespace Binding {
  /**
   * An object containing a Binding for each key.
   */
  export type Def = Record<string, Binding<unknown>>;

  /**
   * Defines the result type of a Binding.Def instance, being for each object key the corresponding Binding result type.
   * @typeparam B - the Binding definition object type
   */
  export type Result<B extends Binding.Def> = { [K in keyof B]: B[K][1] };

  /**
   * Returns a binding that can be used to bind an Actor value and an `enabled` Actor to an HTML input, where the input follows the actor values.
   * @param value - the Actor containing the value to bind to
   * @param enabled - (optional) the Actor containing the boolean defining state
   */
  export function inputValueReadonly(
    value: Actor.Readonly<string>,
    enabled?: Actor.Readonly<boolean>
  ): Binding<{ value: string; disabled: boolean; onChange: () => void }> {
    return [
      enabled ? [value, enabled] : [value],
      {
        get value() {
          return value.state;
        },
        get disabled() {
          return enabled?.state === false;
        },
        onChange() {
          //
        },
      },
    ];
  }

  /**
   * Returns a binding that can be used to bind an Actor value and an `enabled` Actor to an HTML input, where the input follows the actor values,
   * and changing the input's value updates the actors.
   * @param value - the Actor containing the value to bind to
   * @param enabled - (optional) the Actor containing the boolean defining state
   */
  export function inputValue(
    value: Actor<string>,
    enabled?: Actor.Readonly<boolean>
  ): Binding<{
    value: string;
    disabled: boolean;
    onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  }> {
    return [
      enabled ? [value, enabled] : [value],
      {
        get value() {
          return value.state;
        },
        get disabled() {
          return enabled?.state === false;
        },
        onChange(evt) {
          const newValue = evt.target.value;
          value.obs.setState(newValue);
        },
      },
    ];
  }

  /**
   * Returns a binding that can be used to bind an Actor checked value and an `enabled` Actor to an HTML input, where the input follows the actor values.
   * @param value - the Actor containing the value to bind to
   * @param enabled - (optional) the Actor containing the boolean defining state
   */
  export function inputCheckedReadonly(
    value: Actor.Readonly<boolean>,
    enabled?: Actor.Readonly<boolean>
  ): Binding<{
    type: 'checkbox';
    checked: boolean;
    disabled: boolean;
    onChange: () => void;
  }> {
    return [
      enabled ? [value, enabled] : [value],
      {
        type: 'checkbox',
        get checked() {
          return value.state;
        },
        get disabled() {
          return enabled?.state === false;
        },
        onChange() {
          //
        },
      },
    ];
  }

  /**
   * Returns a binding that can be used to bind an Actor checked value and an `enabled` Actor to an HTML input, where the input follows the actor values,
   * and the actor value is updated when the input's value changes.
   * @param value - the Actor containing the value to bind to
   * @param enabled - (optional) the Actor containing the boolean defining state
   */
  export function inputChecked(
    value: Actor<boolean>,
    enabled?: Actor.Readonly<boolean>
  ): Binding<{
    type: 'checkbox';
    checked: boolean;
    disabled: boolean;
    onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  }> {
    return [
      enabled ? [value, enabled] : [value],
      {
        type: 'checkbox',
        get checked() {
          return value.state;
        },
        get disabled() {
          return enabled?.state === false;
        },
        onChange(evt) {
          const newValue = evt.target.checked;
          value.obs.setState(newValue);
        },
      },
    ];
  }

  /**
   * Returns a binding that can be used to bind a Command instance to an HTML button-like component. Arguments for the command can be supplied
   * when invoking the binding. If the command is not enabled, the disabled property will be true.
   * @typeparam Args - the arguments for the command
   * @param sourceCommand - the command to bind to
   * @example
   *
   */
  export function commandArgs<Args extends readonly unknown[] = []>(
    sourceCommand: Command<Args>
  ): Binding<(...args: Args) => { onClick: () => void; disabled: boolean }> {
    return [
      [sourceCommand],
      (...args: Args) => ({
        onClick() {
          sourceCommand.execute(...args);
        },
        get disabled() {
          return !sourceCommand.state;
        },
      }),
    ];
  }

  export function command<Args extends readonly unknown[] = []>(
    sourceCommand: Command<Args>,
    ...args: Args
  ): Binding<{ onClick: () => void; disabled: boolean }> {
    return [
      [sourceCommand],
      {
        onClick() {
          sourceCommand.execute(...args);
        },
        get disabled() {
          return !sourceCommand.state;
        },
      },
    ];
  }
}
