/**
 * The minimal interface for an action, containing a unique `tag`.
 */
export interface ActionBase {
  /**
   * The (unique) action creator tag.
   */
  readonly tag: string;
}

export namespace ActionBase {
  /**
   * Defines how to create an action, and specifies the mandatory
   * `match` function to determine whether an action matches the creator.
   * @typeparam AC - the action type
   * @typeparam A - the creation arguments array
   */
  export interface Creator<AC extends ActionBase, A extends unknown[]> {
    /**
     * The (unique) action creator tag, which is passed on to created actions.
     */
    readonly actionTag: string;

    /**
     * Returns true if the given `action` is created by the current creator.
     * @param action - the action to test
     */
    match(action: ActionBase): action is AC;

    /**
     * Creates a new action given the creation arguments.
     */
    (...args: A): AC;
  }
}
