import React from 'react';

export function useForceRerender(): () => void {
  const setState = React.useState(0)[1];

  return (): void => setState((v) => (v + 1) | 0);
}
