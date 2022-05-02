import type { StreamSource } from '../../stream/mod.ts';
import type { AsyncStreamSource } from '../../stream/async/index.ts';
import { isEmptyStreamSourceInstance } from '../../stream/custom/index.ts';
import { AsyncStreamConstructorsImpl } from '../../stream/async-custom/index.ts';

export function isEmptyAsyncStreamSourceInstance(
  source: AsyncStreamSource<any>
): boolean {
  return (
    source === AsyncStreamConstructorsImpl.empty() ||
    isEmptyStreamSourceInstance(source as StreamSource<any>)
  );
}
