import type { StreamSource } from '../main/index.ts';
import type { AsyncStreamSource } from '../async/index.ts';
import { isEmptyStreamSourceInstance } from '../custom/index.ts';
import { AsyncStreamConstructorsImpl } from './index.ts';

export function isEmptyAsyncStreamSourceInstance(
  source: AsyncStreamSource<any>
): boolean {
  return (
    source === AsyncStreamConstructorsImpl.empty() ||
    isEmptyStreamSourceInstance(source as StreamSource<any>)
  );
}
