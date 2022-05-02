import type { StreamSource } from '../../stream/mod.ts';
import { StreamConstructorsImpl } from '../../stream/custom/index.ts';

/**
 * Returns true if the given `source` StreamSource is known to be empty.
 * @param source - a StreamSource
 * @note
 * If this function returns false, it does not guarantee that the Stream is not empty. It only
 * means that it is not known if it is empty.
 */
export function isEmptyStreamSourceInstance(
  source: StreamSource<unknown>
): boolean {
  if (source === '') return true;
  if (typeof source === 'object') {
    if (source === StreamConstructorsImpl.empty()) return true;
    if (`length` in source && (source as any).length === 0) return true;
    if (`size` in source && (source as any).size === 0) return true;
    if (`isEmpty` in source && (source as any).isEmpty === true) return true;
  }

  return false;
}
