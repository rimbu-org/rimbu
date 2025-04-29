import type { Reducer } from '@rimbu/stream';
import { Impl } from './implementation.mjs';
import type { Last, Prepend } from './utils.mjs';

/**
 * A function that transforms a state and input value into an output value and a new state.
 * @typeparam Tp - The source types of the transformer.
 */
export type StateTransformer<Tp extends StateTransformer.Types> = (
  state: Tp['_state'],
  input: Tp['_in']
) => [Tp['_state'], Tp['_out']];

export namespace StateTransformer {
  /**
   * A type that extract the state type of a state transformer.
   */
  export type StateType<Tp extends StateTransformer.Types> = Tp['_state'];

  /**
   * A generic interface that defines the types used in the StateTransformer.
   * @typeparam S - the state type
   */
  export interface Types<S = any> {
    /**
     * The input value type.
     */
    _in: unknown;
    /**
     * The state type
     */
    _state: S;
    /**
     * The output value type.
     */
    _out: unknown;
    /**
     * The state transformer context type.
     */
    _context: StateTransformer.Context<this>;

    /**
     * The state transformer function type.
     */
    _fn: StateTransformer<this>;
  }

  /**
   * A type that represents a chain of state transformers.
   * @typeparam Tp - the source types of the state transformer.
   * @typeparam I - the input type.
   * @typeparam OS - the output types.
   */
  export type Chain<
    in out Tp extends StateTransformer.Types,
    I,
    OS extends any[],
  > = {
    [K in keyof OS]: (Tp & {
      _in: Prepend<I, OS>[K & keyof Prepend<I, OS>];
      _out: OS[K];
    })['_fn'];
  };

  /**
   * Provides convenient methods for creating and manipulating state transformers.
   * @typeparam Tp - the source types of the state transformer.
   */
  export interface Context<
    Tp extends StateTransformer.Types = StateTransformer.Types,
  > {
    /**
     * Returns a transformer that returns the given value as its output.
     * @typeparam T - the type of the value to set
     * @param value - the value to set
     */
    setValue<T>(value: T): (Tp & { _in: any; _out: T })['_fn'];
    /**
     * Returns a transformer that sets the given state as the resulting state.
     * @typeparam I - the input value type
     * @param state - the state to set
     */
    setState<I>(state: Tp['_state']): (Tp & { _in: I; _out: I })['_fn'];
    /**
     * Returns a transformer that maps the input value and current state to a new output value.
     * @typeparam I - the input value type
     * @typeparam O - the type of the output value
     * @param mapFn - function that maps state and input value to a new output value
     */
    mapValue<I, O>(
      mapFn: (value: I, state: Tp['_state']) => O
    ): (Tp & { _in: I; _out: O })['_fn'];
    /**
     * Returns a transformer that maps the input value and current state to a new state.
     * @typeparam T - the input value type
     * @param mapFn - t function that maps the state and input value to a new state
     */
    mapState<T>(
      mapFn: (state: Tp['_state'], value: T) => Tp['_state']
    ): (Tp & { _in: T; _out: T })['_fn'];
    /**
     * Returns a transformer that performs a side effect using current state and input value.
     * @typeparam T - the input value type
     * @param fn - function that performs the side effect
     */
    effect<T>(
      fn: (state: Tp['_state'], value: T) => void
    ): (Tp & { _in: T; _out: T })['_fn'];
    /**
     * Returns a transformer where the given value is provided as input to the given transformer.
     * @typeparam T - the type of the value to supply
     * @typeparam O - the type of the output value
     * @param value - the value to supply
     * @param transformer - the transformer to apply after supplying the value
     */
    supply<T, O>(
      value: T,
      transformer: (Tp & { _in: T; _out: O })['_fn']
    ): (Tp & { _in: any; _out: O })['_fn'];
    /**
     * Returns a transformer that chains the given transformers together, so that they are executed in sequence.
     * @typeparam I - the input value type
     * @typeparam OS - the transformer output types
     * @param transformers - the transformers to chain together
     */
    chain<T>(): (Tp & { _in: T; _out: T })['_fn'];
    chain<I, O>(
      transformer: (Tp & { _in: I; _out: O })['_fn']
    ): (Tp & { _in: I; _out: O })['_fn'];
    chain<I, O1, OS extends any[]>(
      ...args: [
        (Tp & { _in: I; _out: O1 })['_fn'],
        ...transformers: StateTransformer.Chain<Tp, O1, OS>,
      ]
    ): (Tp & { _in: I; _out: Last<OS, O1> })['_fn'];
    /**
     * Returns a transformer that combines the outputs of the given transformers into an array.
     * @typeparam I - the input value type
     * @typeparam OS - the transformer output types
     * @param transformers - the transformers to combine
     */
    combine<I, OS extends any[]>(transformers: {
      [K in keyof OS]: (Tp & { _in: I; _out: OS[K] })['_fn'];
    }): (Tp & { _in: I; _out: OS })['_fn'];
    /**
     * Returns a transformer that combines the outputs of the given transformers into an array, and applies the given
     * combine function to the outputs, the input value, and current state, returning its result.
     * @typeparam I - the input value type
     * @typeparam OS - the transformer output types
     * @param transformers - the transformers to combine
     * @param combineFn - function that combines the outputs of the transformers, together with the resulting state and input.
     */
    combine<I, O, OS extends any[]>(
      transformers: {
        [K in keyof OS]: (Tp & { _in: I; _out: OS[K] })['_fn'];
      },
      combineFn: (outputs: OS, state: Tp['_state'], input: I) => O
    ): (Tp & { _in: I; _out: O })['_fn'];
    /**
     * Returns a function that takes an input value and returns the output value of the transformer, using the given initial state.
     * @typeparam I - the input value type
     * @typeparam O - the output value type
     * @param transformer - the transformer to apply
     * @param initState - the initial state to use
     */
    toFunction<I, O>(
      transformer: (Tp & { _in: I; _out: O })['_fn'],
      initState: Tp['_state']
    ): (input: I) => O;
    /**
     * Returns a reducer that applies the given transformer to the received input values, and returns the output.
     * @typeparam I - the input value type
     * @typeparam O - the output value type
     * @param transformer - the transformer to apply
     * @param createInitState - function that creates the initial state
     * @param ifEmpty - function that returns a default value if the reducer is empty
     */
    toReducer<I, O>(
      transformer: (Tp & { _in: I; _out: O })['_fn'],
      createInitState: () => Tp['_state'],
      ifEmpty: () => O
    ): Reducer<I, O>;
    /**
     * Returns a reducer that applies the given transformer to the received input values, and returns the output.
     * @typeparam I - the input value type
     * @typeparam O - the output value type
     * @param transformer - the transformer to apply
     * @param createInitState - function that creates the initial state
     */
    toReducer<I, O>(
      transformer: (Tp & { _in: I; _out: O })['_fn'],
      createInitState: () => Tp['_state']
    ): Reducer<I, O | undefined>;
    /**
     * Returns a transformer that decides which transformer to apply based on the input value and current state.
     * @typeparam I - the input value type
     * @typeparam O - the output value type
     * @param createTransformer - function that creates the transformer to apply based on the state and input value
     */
    decide<I, O>(
      createTransformer: (
        state: Tp['_state'],
        value: I
      ) => (Tp & { _in: I; _out: O })['_fn']
    ): (Tp & {
      _in: I;
      _out: O;
    })['_fn'];
    /**
     * Returns a transformer that allows using a transformer that accepts a different state type through temporarily
     * modifying the state with the given functions..
     * @typeparam I - the input value type
     * @typeparam O - the output value type
     * @typeparam Tp2 - the new state transformer types
     * @param toModifiedState - function takes current state and input value and returns the modified state
     * @param transformer - the transformer to apply on the modified state
     * @param fromModifiedState - function takes the resulting modified state, the last outer state, and the output, and returns the new outer state
     */
    withModifiedState<Tp2 extends StateTransformer.Types>(
      context?: StateTransformer.Context<Tp2>
    ): <I, O>(
      toModifiedState: (state: Tp['_state'], input: I) => Tp2['_state'],
      transformer: (Tp2 & { _in: I; _out: O })['_fn'],
      fromModifiedState: (
        modifiedState: Tp2['_state'],
        outerState: Tp['_state'],
        output: O
      ) => Tp['_state']
    ) => (Tp & { _in: I; _out: O })['_fn'];
    /**
     * Returns a transformer that uses the input value and current state to produce an output value, but keeps the original state.
     * @typeparam I - the input value type
     * @typeparam O - the output value type
     * @param transformer - the transformer to evaluate
     */
    evaluateOutput<I, O>(
      transformer: (Tp & { _in: I; _out: O })['_fn']
    ): (Tp & { _in: I; _out: O })['_fn'];
    /**
     * Returns a transformer that executes the given transformer until the condition is met.
     * @typeparam T - the input and output value type
     * @param transformer - the transformer to execute
     * @param condition - function taking the state and input value, and returning true if the transformer should stop executing
     */
    execUntil<T>(
      transformer: (Tp & { _in: T; _out: T })['_fn'],
      condition: (state: Tp['_state'], value: T) => boolean
    ): (Tp & { _in: T; _out: T })['_fn'];
  }
}

export const StateTransformer = Object.freeze({
  /**
   * Returns a transformer Context object that provides methods for creating and manipulating state transformers.
   * @typeparam Tp - the source types of the state transformer.
   */
  createContext<Tp extends StateTransformer.Types>(): Tp['_context'] {
    return Impl as StateTransformer.Context;
  },
});
