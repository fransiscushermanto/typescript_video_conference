import * as React from "react";

export default function useInterval() {
  const interval = React.useRef<number | undefined>(undefined);

  const _setInterval = React.useCallback((fn, ms: number) => {
    interval.current = setInterval(fn, ms) as unknown as number;
  }, []);

  const _clearInterval = React.useCallback(
    () => clearInterval(interval.current),
    [],
  );

  React.useEffect(() => {
    return function cleanup() {
      if (interval) {
        clearInterval(interval.current);
      }
    };
  }, []);

  return {
    setInterval: _setInterval,
    clearInterval: _clearInterval,
  };
}
