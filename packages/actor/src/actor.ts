import { Obs } from './internal';

/**
 * Am `Actor` that has an `Obs` instance so that its state can be observed and modified. Its main aim is to allow
 * custom methods to be added to an `Obs`.
 * @typeparam T - the state type
 */
export interface Actor<T, D = unknown> extends Actor.Readonly<T & D> {
  /**
   * Returns the `Obs` instance of this `Actor`.
   */
  readonly obs: Obs<T, D>;
}

export namespace Actor {
  /**
   * A readonly `Actor` that has a readonly `Obs` instance so that its state can be observed. Its main aim is to allow
   * custom methods to be added to an `Obs.Readonly`.
   * @typeparam T - the state type
   */
  export interface Readonly<T> {
    /**
     * Returns the readonly `Obs` instance of this `Actor`.
     */
    readonly obsReadonly: Obs.Readonly<T>;
    /**
     * Returns the state of the associated `Obs` instance.
     */
    readonly state: this['obsReadonly']['state'];
  }

  export type StateType<
    A extends Actor.Readonly<unknown>
  > = A extends Actor.Readonly<infer S> ? S : never;

  class Impl<T, P extends Record<string, unknown>, D> implements Actor<T, D> {
    constructor(readonly actor: Actor<T, D>, props: P) {
      Object.assign(this, props);
    }

    get obs() {
      return this.actor.obs;
    }

    get obsReadonly() {
      return this.actor.obsReadonly;
    }

    get state() {
      return this.actor.state;
    }
  }

  /**
   * Returns an `Actor` instance based on the given input `Actor` (which may also be an `Obs`), and adds the methods and properties of the
   * given `props` object to it.
   * @param actor - the Actor or Obs instance to add the given `props` to
   * @param props - the properties to add to the `actor`.
   * @example
   * const o = Obs.create({ count: 0 })
   * const actor = Actor.from(o, {
   *   inc(amount: number) {
   *     o.patchState({ count: v => v + amount })
   *   }
   *   reset() {
   *     o.setState({ count: 0 })
   *   }
   * })
   *
   * console.log(actor.state)
   * // => { count: 0 }
   * actor.inc(2)
   * console.log(actor.state)
   * // => { count: 2 }
   * actor.reset()
   * console.log(actor.state)
   * // => { count: 0 }
   */
  export const from: {
    <T, P extends Record<string, unknown>, D = unknown>(
      actor: Actor<T, D>,
      props: P
    ): Actor<T, D> & P;
    <T, P extends Record<string, unknown>>(
      actor: Actor.Readonly<T>,
      props: P
    ): Actor.Readonly<T> & P;
  } = <T, P extends Record<string, unknown>>(
    actor: Actor.Readonly<T>,
    props: P
  ) => {
    return new Impl(actor as any, props);
  };
}
