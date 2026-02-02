import type { AsyncStreamConstructors } from '#async/constructors';
import type { AsyncFastIteratorFactory } from '#async/fast-iterator-factory';
import { AsyncStream, type AsyncStreamSource } from '@rimbu/stream/async';

export interface AsyncStreamFactory extends AsyncStreamConstructors {
	_emptyInstance: AsyncStream<any>;
	isAsyncStream(obj: any): obj is AsyncStream<any>;
	/**
	 * Returns true if the given async stream source is known to be empty.
	 * If this function returns false, the source may still be empty; it is simply not known.
	 * @param source - a potential async stream source
	 */
	isEmptyAsyncStreamSourceInstance(source: AsyncStreamSource<any>): boolean;
	/**
	 * Converts any `AsyncStreamSource` into a concrete `AsyncStream` implementation.
	 * @typeparam T - the element type
	 * @param source - the async stream source to convert
	 */
	fromAsyncStreamSource: {
		<T>(source: AsyncStreamSource.NonEmpty<T>): AsyncStream.NonEmpty<T>;
		<T>(source: AsyncStreamSource<T>): AsyncStream<T>;
	};
	asyncFastIteratorFactory: AsyncFastIteratorFactory;
}

export function AsyncStreamFactory(): AsyncStreamFactory {
	return AsyncStream as AsyncStreamFactory;
}
