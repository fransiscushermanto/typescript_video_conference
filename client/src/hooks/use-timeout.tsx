import * as React from "react";

export default function useTimeout() {
  const timeout = React.useRef<number | undefined>(undefined);

  const _setTimeout = React.useCallback((fn, ms: number) => {
    timeout.current = setTimeout(fn, ms) as unknown as number;
  }, []);

  const _clearTimeout = React.useCallback(
    () => clearTimeout(timeout.current),
    [],
  );

  React.useEffect(() => {
    return function cleanup() {
      if (timeout) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return {
    setTimeout: _setTimeout,
    clearTimeout: _clearTimeout,
  };
}
