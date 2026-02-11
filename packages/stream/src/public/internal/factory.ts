import type { StreamConstructors } from '#stream/constructors';

import { Stream, type StreamSource } from '@rimbu/stream';

export interface StreamFactory extends StreamConstructors {
	/**
	 * Returns true if the given `source` is a `StreamSource` that is known to be empty.
	 * If this function returns `false`, the source may still be empty; it is simply not known.
	 * @param source - a potential stream source
	 * @note
	 * If this function returns false, it does not guarantee that the Stream is not empty. It only
	 * means that it is not known if it is empty.
	 */
	isEmptyStreamSourceInstance: (source: StreamSource<any>) => boolean;
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
