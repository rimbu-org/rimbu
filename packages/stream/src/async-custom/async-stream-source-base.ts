import type { StreamSource } from '../main';
import type { AsyncStreamSource } from '../async';
import { isEmptyStreamSourceInstance } from '../custom';
import { AsyncStreamConstructorsImpl } from '.';

export function isEmptyAsyncStreamSourceInstance(
  source: AsyncStreamSource<any>
): boolean {
  return (
    source === AsyncStreamConstructorsImpl.empty() ||
    isEmptyStreamSourceInstance(source as StreamSource<any>)
  );
}
