import React from "https://dev.jspm.io/react@17.0.2";;

export function useForceRerender(): () => void {
  const setState = React.useState(0)[1];

  return (): void => setState((v) => (v + 1) | 0);
}
