import type { AsyncFastIterator } from '@rimbu/stream/async';

export interface AsyncFastIteratorFactory {
	/**
	 * A frozen `IteratorResult` that represents the completed asynchronous iterator state.
	 * This value is reused to avoid repeated allocations in async iterator implementations.
	 */
	_fixedDoneAsyncIteratorResultInstance: Promise<IteratorResult<any>>;
	/**
	 * An `AsyncFastIterator` that is already exhausted and never yields values.
	 * Its `fastNext` method always resolves to the provided fallback value.
	 */
	_emptyAsyncFastIteratorInstance: AsyncFastIterator<any>;
	/**
	 * Returns true if the given `iterator` implements the `AsyncFastIterator` interface.
	 * @param iterator - the async iterator instance to test
	 */
	isAsyncFastIterator<T>(
		iterator: AsyncIterator<T>,
	): iterator is AsyncFastIterator<T>;
}
