import type { StreamSource } from '@rimbu/stream';
import type { AsyncStreamSource } from '@rimbu/stream/async';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';
import { AsyncStreamConstructorsImpl } from '@rimbu/stream/async-custom';

export function isEmptyAsyncStreamSourceInstance(
  source: AsyncStreamSource<any>
): boolean {
  return (
    source === AsyncStreamConstructorsImpl.empty() ||
    isEmptyStreamSourceInstance(source as StreamSource<any>)
  );
}
