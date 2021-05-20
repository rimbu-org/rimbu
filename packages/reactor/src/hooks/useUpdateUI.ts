import { useState } from 'react';

/**
 * Returns a static function that will trigger a UI update when called.
 */
export function useUpdateUI(): () => void {
  const setState = useState(0)[1];

  return () => setState((v) => (v + 1) | 0);
}
