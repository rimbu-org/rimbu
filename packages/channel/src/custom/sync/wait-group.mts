import { WaitGroupImpl } from './wait-group-impl.mjs';

/**
 * A WaitGroup is a way to perform fork-join logic in an asynchronous context. It allows a process to create an
 * arbitrary amount of sub-processes, and wait for all of them to finish before continuing.
 */
export interface WaitGroup {
  /**
   * Adds the given amount of processes to the WaitGroup.
   * @param amount - (default: 1) the amount of processes to add
   */
  add(amount?: number): void;
  /**
   * Informs the WaitGroup that a process has completed.
   * @param amount - (default: 1) the amount of processes to add
   */
  done(amount?: number): void;
  /**
   * Blocks until all the processes in the WaitGroup have completed.
   */
  wait(): Promise<void>;
}

export namespace WaitGroup {
  /**
   * Defines the static `WaitGroup` API.
   */
  export interface Constructors {
    /**
     * Returns a new `WaitGroup` that can be used to wait for fan-out processes to complete.
     */
    create(): WaitGroup;
  }
}

export const WaitGroup: WaitGroup.Constructors = Object.freeze(
  class {
    static create(): WaitGroup {
      return new WaitGroupImpl();
    }
  }
);
