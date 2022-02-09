import { useState, useCallback } from "react";

export default function useCallbackRef<T = any>(): [T, (...args) => void] {
  const [ref, setRef] = useState<T>(null);
  const fn = useCallback((node) => {
    setRef(node);
  }, []);

  return [ref, fn];
}
