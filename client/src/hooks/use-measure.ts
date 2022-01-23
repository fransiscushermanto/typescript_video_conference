import { useState, useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

import useCallbackRef from './use-callback-ref';

export default function useMeasure(ref) {
  const [element, attachRef] = useCallbackRef();
  const [bounds, setBounds] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    function onResize([entry]) {
      setBounds({
        height: entry.contentRect.height,
        width: entry.contentRect.width,
      });
    }

    const observer = new ResizeObserver(onResize);

    if (element && element.current) {
      observer.observe(element.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [element]);

  useEffect(() => {
    attachRef(ref);
  }, [attachRef, ref]);

  return bounds;
}
