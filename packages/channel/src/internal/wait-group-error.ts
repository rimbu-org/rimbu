import { ErrBase } from '@rimbu/common/err';

/**
 * The abstract base class/type for WaitGroup Errors.
 */
export abstract class WaitGroupError extends ErrBase.CustomError {}

export namespace WaitGroupError {
	/**
	 * Error indicating that `done()` was called more times than `add()`, causing an underflow.
	 * This is always a programming error — the `add`/`done` count must be balanced.
	 */
	export class UnderflowError extends WaitGroupError {
		constructor() {
			super(
				'WaitGroup underflow: done() was called more times than add(). Ensure add() and done() calls are balanced.',
			);
		}
	}

	/**
	 * Returns true if the given object is an instance of a `WaitGroupError`.
	 * @param obj - the value to test
	 */
	export function isWaitGroupError(obj: any): obj is WaitGroupError {
		return obj instanceof WaitGroupError;
	}
}
