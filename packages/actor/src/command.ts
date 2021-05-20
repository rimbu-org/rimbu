import { Actor, Obs } from './internal';

/**
 * A `Command` is an `Actor` that can execute some command optinally with some arguments,
 * only if its state is `true`.
 * @typeparam Args - the arguments for the `execute` function
 */
export interface Command<Args extends readonly unknown[] = []>
  extends Actor.Readonly<boolean> {
  /**
   * Executes the action associated with this Command, if its state is `true`.
   * Otherwise, will do nothing.
   * @params args - the arguments needed to execute the action.
   */
  execute: (...args: Args) => void;
}

export namespace Command {
  const trueObs = Obs.create(true);

  /**
   * Returns a `Command` instance with the given `execute` action, and will only execute the action
   * if the optionally given `enabled` Actor state is true.
   * @param props - an object containing the following properties:
   * - execute - a function taking arguments of type `Args` and performing some action.
   * - enabled - (optional) an `Actor` with a boolean state indicating whether the execute function can be called
   * @returns
   */
  export function create<Args extends readonly unknown[] = []>(props: {
    execute: (...args: Args) => void;
    enabled?: Actor.Readonly<boolean>;
  }): Command<Args> {
    const enabled = props.enabled ?? trueObs;

    return Actor.from<boolean, { execute(...args: Args): void }>(enabled, {
      execute(...args: Args): void {
        if (enabled.obsReadonly.state) {
          props.execute(...args);
        }
      },
    });
  }
}
