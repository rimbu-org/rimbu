/**
 * Type indicating a match condition. It is a tuple containing a predicate and a result if the given predicate is true,
 * @typeparam T - the input value type
 * @typeparam Res - the resulting value type
 */
export type Cond<T, Res> = [
  pred: T | boolean | ((value: T) => boolean),
  result: Res
];

/**
 * Namespace containing `Cond` related types.
 */
export namespace Cond {
  /**
   * The result type given a `Cond` type.
   * @typeparam CS - the condition type
   */
  export type Result<CS extends Cond<any, any>[]> = CS[number][1];

  /**
   * Returns a function that takes an input value and returns a one-element tuple containing the condition
   * to validate the input value against.
   * @param conds - tuples containing as first element the matching condition, and as second element the resulting value if the first element is matched
   * @typeparam T - the input value type
   * @typeparam CS - the type of the given array of conditions
   */
  export function match<T, CS extends Cond<T, any>[]>(
    ...conds: CS & Cond<T, any>[]
  ): (inputValue: T) => [Cond.Result<CS>] {
    return (inputValue) => {
      for (const condTuple of conds) {
        const [cond, result] = condTuple;

        if (typeof cond === 'boolean') {
          if (typeof inputValue === 'boolean') {
            if (inputValue !== cond) {
              continue;
            }
          } else if (!cond) {
            continue;
          }
        } else if (cond instanceof Function) {
          const result = cond(inputValue);

          if (!result) {
            continue;
          }
        } else if (!Object.is(cond, inputValue)) {
          continue;
        }

        return [result];
      }

      throw Error(
        `none of the given cases match the input value ${inputValue}. If you want to have a fallback value, add a final case like so: \`[true, <value>]\``
      );
    };
  }

  /**
   * Returns a function that takes an input value and returns a one-element tuple containing the condition
   * to validate the input value against.
   * @param createConds - a function that takes the input value and returns an array of tuples containing as first element the matching condition, and as second
   * element the resulting value if the first element is matched
   * @typeparam T - the input value type
   * @typeparam CS - the type of the given array of conditions
   */
  export function matchInput<T, CS extends Cond<T, unknown>[]>(
    createConds: (value: T) => CS
  ): (inputValue: T) => [Cond.Result<CS>] {
    return (inputValue) => {
      const conds = createConds(inputValue);

      return Cond.match(...conds)(inputValue);
    };
  }
}
