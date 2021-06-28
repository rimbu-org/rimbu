/**
 * Throws an `Err.ForcedError` error when called.
 * @example
 * const emptyMap = HashMap.empty<number, string>()
 * emptyMap.get(5, Err);
 * // throws: Err.CustomError(message: 'Err: forced to throw error')
 */
export function Err(): never {
  return ErrBase.msg('Err: Forced to throw error')();
}

export namespace ErrBase {
  /**
   * A custom error instance.
   */
  export abstract class CustomError {
    constructor(readonly message: string) {}

    get name() {
      return this.constructor.name;
    }
  }

  export class ForcedError extends CustomError {}

  /**
   * Returns a function that, when called, throws an `Err.ForcedError` with the given `message` string.
   * @param message - the message to put in the `Err.ForcedError` instance.
   * @example
   * ```ts
   * const emptyMap = HashMap.empty<number, string>()
   * emptyMap.get(5, ErrBase.msg('not found'));
   * // throws: Err.CustomError(message: 'not found')
   * ```
   */
  export function msg(message: string): () => never {
    return function (): never {
      throw new ErrBase.ForcedError(message);
    };
  }
}
