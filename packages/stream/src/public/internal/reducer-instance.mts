import type { Reducer } from '@rimbu/stream/reducer';
import { ReducerHaltedError } from './reducer-errors.mjs';

/**
 * The default `Reducer.Impl` implementation.
 * @typeparam I - the input element type
 * @typeparam O - the output element type
 * @typeparam S - the reducer state type
 */
export class ReducerInstanceImpl<I, O, S> implements Reducer.Instance<I, O> {
  constructor(readonly reducer: Reducer.Impl<I, O, S>) {
    this.#state = reducer.init(this.halt);
  }

  #state: S;
  #index = 0;
  #halted = false;

  halt = (): void => {
    this.#halted = true;
  };

  get halted(): boolean {
    return this.#halted;
  }

  get index(): number {
    return this.#index;
  }

  next = (value: I): void => {
    if (this.#halted) {
      throw new ReducerHaltedError();
    }

    this.#state = this.reducer.next(
      this.#state,
      value,
      this.#index++,
      this.halt
    );
  };

  getOutput(): O {
    return this.reducer.stateToResult(this.#state, this.index, this.halted);
  }
}
