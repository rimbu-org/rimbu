import { Immutable, Literal, patch, Patch, Path } from '@rimbu/deep';

class NotifierBase<T> {
  readonly _subscribers = new Set<Obs.StateUpdate<T>>();
  _onNoMoreSupscribers?: Obs.UnsubscribeFn;

  constructor(
    readonly options?: { onFirstSubscription?: () => Obs.UnsubscribeFn }
  ) {}

  get hasSubscribers(): boolean {
    return this._subscribers.size > 0;
  }

  subscribe(onChange: Obs.StateUpdate<T>): Obs.UnsubscribeFn {
    if (!this.hasSubscribers) {
      this._onNoMoreSupscribers = this.options?.onFirstSubscription?.();
    }

    this._subscribers.add(onChange);

    return () => {
      this._subscribers.delete(onChange);

      if (!this.hasSubscribers) {
        this._onNoMoreSupscribers?.();
        this._onNoMoreSupscribers = undefined;
      }
    };
  }

  notify(newState: T, oldState: T) {
    for (const subscriber of this._subscribers) {
      subscriber(newState, oldState);
    }
  }
}

class Impl<T, D> extends NotifierBase<Immutable<T & D>> implements Obs<T, D> {
  constructor(
    public pureState: T,
    readonly options?: {
      onGetState?: () => void;
      onSetState?: (newState: Immutable<T & D>) => void;
      derive?: (
        newState: Immutable<T>,
        oldState: Immutable<T>,
        oldDerived?: Immutable<D>
      ) => D;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    },
    public derivedState = options?.derive?.(
      pureState as Immutable<T>,
      pureState as Immutable<T>
    ),
    public fullState = (options?.derive
      ? { ...pureState, ...derivedState }
      : pureState) as T & D
  ) {
    super(options);
  }

  get state(): Immutable<T & D> {
    this.options?.onGetState?.();
    return this.fullState as Immutable<T & D>;
  }

  get obs() {
    return this;
  }

  get obsReadonly() {
    return this;
  }

  asReadonly(): this {
    return this;
  }

  setState(newPureState: T): void {
    const oldPureState = this.pureState;

    if (Object.is(newPureState, oldPureState)) return;

    this.pureState = newPureState;

    if (!this.options?.derive) {
      this.fullState = newPureState as T & D;
      this.options?.onSetState?.(newPureState as Immutable<T & D>);

      this.notify(
        newPureState as Immutable<T & D>,
        oldPureState as Immutable<T & D>
      );
      return;
    }

    const oldDerivedState = this.derivedState;

    const newDerivedState = this.options.derive(
      newPureState as Immutable<T>,
      oldPureState as Immutable<T>,
      oldDerivedState as Immutable<D>
    );

    const newFullState = { ...newPureState, ...newDerivedState };

    this.derivedState = newDerivedState;

    const oldFullState = this.fullState;
    this.fullState = newFullState;
    this.options?.onSetState?.(newPureState as Immutable<T & D>);

    this.notify(
      newFullState as Immutable<T & D>,
      oldFullState as Immutable<T & D>
    );
  }

  patchState(...patches: Patch.Multi<T>): void {
    const pureState = this.pureState;

    const newState = patch(pureState as T)(...patches) as T;

    this.setState(newState);
  }

  mapReadonly<T2, D2>(
    mapTo: (newState: Immutable<T & D>) => T2,
    options?: {
      derive?: (
        newState: Immutable<T2>,
        oldState: Immutable<T2>,
        oldDerived?: Immutable<D2>
      ) => D2;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ): Obs.Readonly<T2 & D2> {
    const onFirstSubscription = (): Obs.UnsubscribeFn => {
      const unsubscribe1 = this.subscribe((newState) =>
        result.setState(mapTo(newState))
      );
      const unsubscribe2 = options?.onFirstSubscription?.();

      return () => {
        unsubscribe1();
        unsubscribe2?.();
      };
    };

    const result = new Impl<T2, D2>(mapTo(this.state), {
      derive: options?.derive,
      onFirstSubscription,
      onGetState: () => {
        if (!result.hasSubscribers) {
          result.setState(mapTo(this.state));
        }
      },
    });

    return result;
  }

  map<T2, D2 = unknown>(
    mapTo: (newState: Immutable<T & D>) => T2,
    mapFrom: (newState: Immutable<T2>) => Patch<T>,
    options?: {
      derive?: (
        newState: Immutable<T2>,
        oldState: Immutable<T2>,
        oldDerived?: Immutable<D2>
      ) => D2;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ): Obs<T2, D2> {
    const onFirstSubscription = (): Obs.UnsubscribeFn => {
      const unsubscribe1 = this.subscribe((newState) => {
        result.setState(mapTo(newState));
      });
      const unsubscribe2 = options?.onFirstSubscription?.();

      return () => {
        unsubscribe1();
        unsubscribe2?.();
      };
    };

    const result = new Impl<T2, D2>(mapTo(this.state), {
      derive: options?.derive,
      onFirstSubscription,
      onGetState: () => {
        if (!result.hasSubscribers) {
          result.setState(mapTo(this.state));
        }
      },
      onSetState: (newState) => {
        if (Object.is(mapTo(this.state), newState)) return;

        this.patchState(mapFrom(newState));
      },
    });

    return result;
  }

  select<P extends Path<T>, DR = unknown>(
    pathInState: P,
    options?: {
      derive?: (
        newState: Immutable<Path.Result<T, P>>,
        oldState: Immutable<Path.Result<T, P>>,
        oldDerived?: Immutable<DR>
      ) => DR;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ): Obs<Path.Result<T, P>, DR> {
    return this.map(
      (newParentState) => Path.getValue(newParentState as T, pathInState),
      (newChildState: Immutable<Path.Result<T, P>>): Patch<T> => {
        const pathObj = {};
        const parts = pathInState.split('.');

        if (parts.length <= 0) return Literal.of(newChildState);

        const lastPart = parts.pop()!;

        let obj: any = pathObj;

        for (const part of parts) {
          obj[part] = {};
          obj = obj[part];
        }

        obj[lastPart] = Literal.of(newChildState);

        return pathObj as any;
      },
      options
    );
  }

  selectReadonly<P extends Path<T & D>, DR>(
    pathInState: P,
    options?: {
      derive?: (
        newState: Immutable<Path.Result<T & D, P>>,
        oldState: Immutable<Path.Result<T & D, P>>,
        oldDerived?: Immutable<DR>
      ) => DR;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ): Obs.Readonly<Path.Result<T & D, P> & DR> {
    return this.mapReadonly(
      (newParentState: Immutable<T & D>) =>
        Path.getValue(newParentState as T & D, pathInState),
      options
    );
  }

  combineReadonly<T2, R, DR = unknown>(
    other: Obs.Readonly<T2>,
    mapTo: (state1: Immutable<T & D>, state2: Immutable<T2>) => R,
    options?: {
      derive?: (
        newState: Immutable<R>,
        oldState: Immutable<R>,
        oldDerived?: Immutable<DR>
      ) => DR;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ): Obs.Readonly<R & DR> {
    const onFirstSubscription = (): Obs.UnsubscribeFn => {
      const unsubscribe1 = this.subscribe((newState) => {
        result.setState(mapTo(newState, other.state));
      });
      const unsubscribe2 = other.subscribe((newState) => {
        result.setState(mapTo(this.state, newState));
      });
      const unsubscribe3 = options?.onFirstSubscription?.();
      return () => {
        unsubscribe1();
        unsubscribe2();
        unsubscribe3?.();
      };
    };
    const result = new Impl(mapTo(this.state, other.state), {
      onFirstSubscription,
      onGetState: () => {
        if (!result.hasSubscribers) {
          result.setState(mapTo(this.state, other.state));
        }
      },
      derive: options?.derive,
    });

    return result;
  }

  combine<T2, D2, R, DR = unknown>(
    other: Obs<T2, D2>,
    mapTo: (state1: Immutable<T & D>, state2: Immutable<T2 & D2>) => R,
    mapFrom: (state: Immutable<R & DR>) => Patch<readonly [T, T2]>,
    options?: {
      derive?: (
        newState: Immutable<R>,
        oldState: Immutable<R>,
        oldDerived?: Immutable<DR>
      ) => DR;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ): Obs<R> {
    const onFirstSubscription = (): Obs.UnsubscribeFn => {
      const unsubscribe1 = this.subscribe((newState) => {
        result.setState(mapTo(newState, other.state));
      });
      const unsubscribe2 = other.subscribe((newState) => {
        result.setState(mapTo(this.state, newState));
      });
      const unsubscribe3 = options?.onFirstSubscription?.();

      return () => {
        unsubscribe1();
        unsubscribe2();
        unsubscribe3?.();
      };
    };

    const result = new Impl(mapTo(this.state, other.state), {
      onFirstSubscription,
      derive: options?.derive,
      onGetState: () => {
        if (!result.hasSubscribers) {
          result.setState(mapTo(this.state, other.state));
        }
      },
      onSetState: (newCombinedState) => {
        const parentPatch = mapFrom(newCombinedState);

        const [newThisState, newOtherState] = patch([
          this.state,
          other.state,
        ] as const)(parentPatch as any);

        this.setState(newThisState as T);
        other.setState(newOtherState as T2);
      },
    });

    return result;
  }
}

/**
 * An observable entity that contains potentially complex state and methods to manipulate
 * the state.
 * @typeparam T - the state type
 * @typeparam D - the derived state type
 */
export interface Obs<T, D = unknown> extends Obs.Readonly<T & D> {
  /**
   * Returns the same Obs instance, used for compatibility with the `Actor` interface.
   */
  readonly obs: Obs<T, D>;
  /**
   * Returns the same Obs instance as a readonly instance.
   */
  asReadonly(): Obs.Readonly<T & D>;
  /**
   * Sets the Obs state to the given `newState`, and notifies the listeners of the state change.
   * @note will not update if the given state is equal to the current state
   * @example
   * const o = Obs.create({ a: 1, b: 'a' });
   * o.subscribe(newState => console.log(newState));
   * o.setState({ a: 2, b: 'a' });
   * // => logs { a: 2, b: 'a' })
   * o.setState({ a: 2, b: 'a' });
   * // nothing happens since given state equal to current state
   */
  setState: (newState: T) => void;
  /**
   * Patches the Obs state with the given `patches`.
   * @params patches - an array of patches to apply to the current state
   * @note will not update if the resulting state is equal to the current state
   * @example
   * const o = Obs.create({ a: 1, b: 'a' });
   * o.subscribe(newState => console.log(newState));
   * o.patchState({ a: v => v + 1 });
   * // => logs { a: 2, b: 'a' })
   * o.patchState({ b: 'a' });
   * // nothing happens since given state equal to current state
   */
  patchState: (...patches: Patch.Multi<T>) => void;
  /**
   * Returns a readonly Obs with the state resulting from applying the given `mapTo` function to
   * this state.
   * @typeparam T2 - the result state type
   * @typeparam D2 - the result derived state type
   * @param mapTo - a function taking the current state and returning the result state
   * @param options - (optional) an object containing the following properties:
   * * derive - a function taking the newState, oldState, and optionally the old derived state,
   * returning the new derived properties
   * * onFirstSubscription - a function that will be executed each time a first subscription occurs, and which
   * returns a function that will be called when there are no more subscribers
   * @example
   * const o = Obs.create({ a: 1, b: 'a' })
   * const m = o.mapReadonly(s => s.a + s.b)
   * console.log(m.state)
   * // => '1a'
   * o.patchState({ a: v => v + 1 })
   * console.log(m.state)
   * // => '2a'
   */
  mapReadonly: <T2, D2 = unknown>(
    mapTo: (newState: Immutable<T & D>) => T2,
    options?: {
      derive?: (
        newState: Immutable<T2>,
        oldState: Immutable<T2>,
        oldDerived?: Immutable<D2>
      ) => D2;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ) => Obs.Readonly<T2 & D2>;
  /**
   * Returns an Obs with the state resulting from applying the given `mapTo` function to
   * this state, and updates to its state propagating back to the curretn state using the given
   * `mapFrom` function.
   * @typeparam T2 - the result state type
   * @typeparam D2 - the result derived state type
   * @param mapTo - a function taking the current state and returning the result state
   * @param mapFrom - a function taking the target state and returning a patch to update the current
   * state accordingly
   * @param options - (optional) an object containing the following properties:
   * * derive - a function taking the newState, oldState, and optionally the old derived state,
   * returning the new derived properties
   * * onFirstSubscription - a function that will be executed each time a first subscription occurs, and which
   * returns a function that will be called when there are no more subscribers
   * @example
   * const o = Obs.create({ a: 1, b: 'a' })
   * const m = o.map(s => s.a, s => ({ a: s }))
   * console.log(m.state)
   * // => 1
   * m.patchState(5)
   * console.log(o.state)
   * // => { a: 5, b: 'a' }
   */
  map: <T2, D2 = unknown>(
    mapTo: (newState: Immutable<T & D>) => T2,
    mapFrom: (newState: Immutable<T2>) => Patch<T>,
    options?: {
      derive?: (
        newState: Immutable<T2>,
        oldState: Immutable<T2>,
        oldDerived?: Immutable<D2>
      ) => D2;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ) => Obs<T2, D2>;
  /**
   * Returns a readonly Obs with the state resulting from applying the given `pathInState` path
   * to the current state.
   * @typeparam P - the path type defining the property to select
   * @typeparam DR - the result derived state type
   * @param pathInState: a Path in the current state to the selected property
   * @param options - (optional) an object containing the following properties:
   * * derive - a function taking the newState, oldState, and optionally the old derived state,
   * returning the new derived properties
   * * onFirstSubscription - a function that will be executed each time a first subscription occurs, and which
   * returns a function that will be called when there are no more subscribers
   * @example
   * const o = Obs.create({ a: 1, b: { c: 2 } })
   * const m = o.selectReadonly('b')
   * console.log(m.state)
   * // => { c: 2 }
   * o.patchState({ b: { c: 5 })
   * console.log(m.state)
   * // => { c: 5 }
   */
  selectReadonly: <P extends Path<T & D>, DR = unknown>(
    pathInState: P,
    options?: {
      derive?: (
        newState: Immutable<Path.Result<T & D, P>>,
        oldState: Immutable<Path.Result<T & D, P>>,
        oldDerived?: Immutable<DR>
      ) => DR;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ) => Obs.Readonly<Path.Result<T & D, P> & DR>;
  /**
   * Returns an Obs with the state resulting from applying the given `pathInState` path
   * to the current state. Updates to the resulting obs will be copied back into the parent
   * state using the same `pathInState`.
   * @typeparam P - the path type defining the property to select
   * @typeparam DR - the result derived state type
   * @param pathInState: a Path in the current state to the selected property
   * @param options - (optional) an object containing the following properties:
   * * derive - a function taking the newState, oldState, and optionally the old derived state,
   * returning the new derived properties
   * * onFirstSubscription - a function that will be executed each time a first subscription occurs, and which
   * returns a function that will be called when there are no more subscribers
   * @example
   * const o = Obs.create({ a: 1, b: { c: 2 } })
   * const m = o.select('b')
   * console.log(m.state)
   * // => { c: 2 }
   * m.patchState({ c: 5 })
   * console.log(o.state)
   * // => { a: 1, b: { c: 5 } }
   */
  select: <P extends Path<T>, DR = unknown>(
    pathInState: P,
    options?: {
      derive?: (
        newState: Immutable<Path.Result<T, P>>,
        oldState: Immutable<Path.Result<T, P>>,
        oldDerived?: Immutable<DR>
      ) => DR;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ) => Obs<Path.Result<T, P>>;
  /**
   * Returns a readonly Obs that combines this state with the state of the given `other` Obs using
   * the given `mapTo` function.
   * @typeparam T2 - the `other` Obs state type
   * @typeparam R - the combined state type
   * @typeparam DR - the combined derived state type
   * @param other - the other Obs containing the state to combine
   * @param mapTo - a function taking the two states, and returning the combined state
   * @param options - (optional) an object containing the following properties:
   * * derive - a function taking the newState, oldState, and optionally the old derived state,
   * returning the new derived properties
   * * onFirstSubscription - a function that will be executed each time a first subscription occurs, and which
   * returns a function that will be called when there are no more subscribers
   * @example
   * const o1 = Obs.create(1)
   * const o2 = Obs.create('a')
   * const m = o1.combineReadonly(o2, (a, b) => ({ a, b }))
   * console.log(m.state)
   * // { a: 1, b: 'a' }
   * o1.setState(5)
   * console.log(m.state)
   * // { a: 5, b: 'a' }
   * o2.setStatE('z')
   * console.log(m.state)
   * // { a: 5, b: 'z' }
   */
  combineReadonly<T2, R, DR = unknown>(
    other: Obs.Readonly<T2>,
    mapTo: (state1: Immutable<T & D>, state2: Immutable<T2>) => R,
    options?: {
      derive?: (
        newState: Immutable<R>,
        oldState: Immutable<R>,
        oldDerived?: Immutable<DR>
      ) => DR;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ): Obs.Readonly<R & DR>;
  /**
   * Returns an Obs that combines this state with the state of the given `other` Obs using
   * the given `mapTo` function. Updates to the combined Obs are propagated back using the given
   * `mapFrom` function.
   * @typeparam T2 - the `other` Obs state type
   * @typeparam D2 - the `other` Obs derived state type
   * @typeparam R - the combined state type
   * @typeparam DR - the combined derived state type
   * @param other - the other Obs containing the state to combine
   * @param mapTo - a function taking the two states, and returning the combined state
   * @param mapFrom - a function taking the current combined state and returning a patch tuple, where
   * the first element is a patch to update this state, and the second element is a patch for the
   * `other` state.
   * @param options - (optional) an object containing the following properties:
   * * derive - a function taking the newState, oldState, and optionally the old derived state,
   * returning the new derived properties
   * * onFirstSubscription - a function that will be executed each time a first subscription occurs, and which
   * returns a function that will be called when there are no more subscribers
   * @example
   * const o1 = Obs.create({ a: 1, b: 2 })
   * const o2 = Obs.create({ c: 3, d: 4 })
   * const m = o1.combine(o2,
   *   (s1, s2) => ({ a: s1.a, d: s2.d }),
   *   s => [{ a: s.a }, { d: s.d }]
   * )
   * console.log(m.state)
   * // => { a: 1, d: 4 }
   * m.setState({ a: 5, d: 8 })
   * console.log(o1.state)
   * // => { a: 5, b: 2 }
   * console.log(o2.state)
   * // => { c: 3, d: 8 }
   */
  combine<T2, D2, R, DR = unknown>(
    other: Obs<T2, D2>,
    mapTo: (state1: Immutable<T & D>, state2: Immutable<T2 & D2>) => R,
    mapFrom: (state: R) => Patch<readonly [T, T2]>,
    options?: {
      derive?: (
        newState: Immutable<R>,
        oldState: Immutable<R>,
        oldDerived?: Immutable<DR>
      ) => DR;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ): Obs<R>;
}

export namespace Obs {
  /**
   * A function performing some action given the `newState` and the `oldState`.
   * @typeparam T - the state type
   * @param newState - the new state
   * @param oldState - the old state
   * @typeparam T - the state type
   */
  export type StateUpdate<T> = (newState: T, oldState: T) => void;

  /**
   * A generic function that is called to unsubscribe a subscription.
   */
  export type UnsubscribeFn = () => void;

  /**
   * A readonly observable entity that contains potentially complex state.
   * @typeparam T - the state type
   */
  export interface Readonly<T> {
    /**
     * Returns the same readonly Obs instance, used for compatibility with the `Actor` interface.
     */
    readonly obsReadonly: Obs.Readonly<T>;
    /**
     * Returns an immutable view of the current state.
     * @example
     * const o = Obs.create({ a: 1, b: 'a' })
     * console.log(o.state)
     * // => { a: 1, b: 'a' }
     */
    readonly state: Immutable<T>;
    /**
     * Returns true if the Obs has at least one subscriber.
     * @example
     * const o = Obs.create(1)
     * console.log(o.hasSubscribers)
     * // => false
     * o.subscribe(() => {})
     * console.log(o.hasSubscribers)
     * // => true
     */
    readonly hasSubscribers: boolean;
    /**
     * Adds the given `onChange` function to the subscribers for state changes, and
     * returns an unsubscribe function that, when called, removes the `onChange` function
     * from the subscribers.
     */
    subscribe: (onChange: StateUpdate<Immutable<T>>) => UnsubscribeFn;
    /**
     * Returns a readonly Obs with the state resulting from applying the given `mapTo` function to
     * this state.
     * @typeparam T2 - the result state type
     * @typeparam D2 - the result derived state type
     * @param mapTo - a function taking the current state and returning the result state
     * @param options - (optional) an object containing the following properties:
     * * derive - a function taking the newState, oldState, and optionally the old derived state,
     * returning the new derived properties
     * * onFirstSubscription - a function that will be executed each time a first subscription occurs, and which
     * returns a function that will be called when there are no more subscribers
     * @example
     * const o = Obs.create({ a: 1, b: 'a' })
     * const m = o.mapReadonly(s => s.a + s.b)
     * console.log(m.state)
     * // => '1a'
     * o.patchState({ a: v => v + 1 })
     * console.log(m.state)
     * // => '2a'
     */
    mapReadonly: <T2, D2>(
      mapTo: (newState: Immutable<T>) => T2,
      options?: {
        derive?: (
          newState: Immutable<T2>,
          oldState: Immutable<T2>,
          oldDerived?: Immutable<D2>
        ) => D2;
        onFirstSubscription?: () => Obs.UnsubscribeFn;
      }
    ) => Obs.Readonly<T2 & D2>;
    /**
     * Returns a readonly Obs with the state resulting from applying the given `pathInState` path
     * to the current state.
     * @typeparam P - the path type defining the property to select
     * @typeparam DR - the result derived state type
     * @param pathInState: a Path in the current state to the selected property
     * @param options - (optional) an object containing the following properties:
     * * derive - a function taking the newState, oldState, and optionally the old derived state,
     * returning the new derived properties
     * * onFirstSubscription - a function that will be executed each time a first subscription occurs, and which
     * returns a function that will be called when there are no more subscribers
     * @example
     * const o = Obs.create({ a: 1, b: { c: 2 } })
     * const m = o.selectReadonly('b')
     * console.log(m.state)
     * // => { c: 2 }
     * o.patchState({ b: { c: 5 })
     * console.log(m.state)
     * // => { c: 5 }
     */
    selectReadonly: <P extends Path<T>, DR = unknown>(
      pathInState: P,
      options?: {
        derive?: (
          newState: Immutable<Path.Result<T, P>>,
          oldState: Immutable<Path.Result<T, P>>,
          oldDerived?: Immutable<DR>
        ) => DR;
        onFirstSubscription?: () => Obs.UnsubscribeFn;
      }
    ) => Obs.Readonly<Path.Result<T, P> & DR>;
    /**
     * Returns a readonly Obs that combines this state with the state of the given `other` Obs using
     * the given `mapTo` function.
     * @param other - the other Obs containing the state to combine
     * @param mapTo - a function taking the two states, and returning the combined state
     * @param options - (optional) an object containing the following properties:
     * * derive - a function taking the newState, oldState, and optionally the old derived state,
     * returning the new derived properties
     * * onFirstSubscription - a function that will be executed each time a first subscription occurs, and which
     * returns a function that will be called when there are no more subscribers
     * @example
     * const o1 = Obs.create(1)
     * const o2 = Obs.create('a')
     * const m = o1.combineReadonly(o2, (a, b) => ({ a, b }))
     * console.log(m.state)
     * // { a: 1, b: 'a' }
     * o1.setState(5)
     * console.log(m.state)
     * // { a: 5, b: 'a' }
     * o2.setStatE('z')
     * console.log(m.state)
     * // { a: 5, b: 'z' }
     */
    combineReadonly<T2, R, DR = unknown>(
      other: Obs.Readonly<T2>,
      mapTo: (state1: Immutable<T>, state2: Immutable<T2>) => R,
      options?: {
        derive?: (
          newState: Immutable<R>,
          oldState: Immutable<R>,
          oldDerived?: Immutable<DR>
        ) => DR;
        onFirstSubscription?: () => Obs.UnsubscribeFn;
      }
    ): Obs.Readonly<R & DR>;
  }

  /**
   * Returns an `Obs` instance with the given `initState` as initial state.
   * @typeparam T - the state type
   * @typeparam D - the derived state type
   * @param initState - the initial state
   * @param options - (optional) an object containing the following properties:
   * * derive - a function taking the newState, oldState, and optionally the old derived state,
   * returning the new derived properties
   * * onFirstSubscription - a function that will be executed each time a first subscription occurs, and which
   * returns a function that will be called when there are no more subscribers
   * @example
   * const o1 = Obs.create({ a: 1 })
   * console.log(o1.state)
   * // => { a: 1 }
   * const o2 = Obs.create({ a: 1 }, { derive: s => ({ b: s.a + 10 })})
   * console.log(o2.state)
   * // => { a: 1, b: 11 }
   * o2.patchState({ a: 5 })
   * console.log(o2.state)
   * // => { a: 5, b: 15 }
   */
  export function create<T, D = unknown>(
    initState: T,
    options?: {
      derive?: (
        newState: Immutable<T>,
        oldState: Immutable<T>,
        oldDerived?: Immutable<D>
      ) => D;
      onFirstSubscription?: () => Obs.UnsubscribeFn;
    }
  ): Obs<T, D> {
    return new Impl<T, D>(initState, options);
  }
}
