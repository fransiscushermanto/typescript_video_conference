import { useState, useCallback } from 'react';

export default function useCallbackRef(): any {
  const [ref, setRef] = useState<any>(null);
  const fn = useCallback((node) => {
    setRef(node);
  }, []);

  return [ref, fn];
}
