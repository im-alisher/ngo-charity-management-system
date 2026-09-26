import { useEffect, useState } from 'react';

/**
 * Returns a value that only updates after it has been stable for `delay` ms.
 *
 * Used by search inputs so typing does not fire a request per keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
