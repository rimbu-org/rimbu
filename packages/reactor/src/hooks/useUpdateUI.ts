import React from 'react';

/**
 * Returns a static function that will trigger a UI update when called.
 */
export function useUpdateUI(): () => void {
  const setState = React.useState(0)[1];

  return (): void => setState((v) => (v + 1) | 0);
}
