import type { StreamConstructors } from '#stream/constructors';

import { Stream, type StreamSource } from '@rimbu/stream';

export interface StreamFactory extends StreamConstructors {
	/**
	 * Converts any `StreamSource` into a concrete `Stream` implementation.
	 * @typeparam T - the element type
	 * @param source - the source to convert
	 */
	fromStreamSource: {
		<T>(source: StreamSource.NonEmpty<T>): Stream.NonEmpty<T>;
		<T>(source: StreamSource<T>): Stream<T>;
	};
}

export function StreamFactory(): StreamFactory {
	return Stream as StreamFactory;
}
