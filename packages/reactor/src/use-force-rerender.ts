import React from 'react';

/**
 * React hook that returns a callback forcing the calling component to re-render.
 * @returns a function that, when called, triggers a re-render of the component
 */
export function useForceRerender(): () => void {
  const setState = React.useState(0)[1];

  return (): void => setState((v) => (v + 1) | 0);
}
