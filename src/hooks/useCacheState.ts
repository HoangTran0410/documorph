import React from 'react';

function parseSafe<T>(value: string | null, defaultValue: T): T {
  if (value === null) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

export default function useCacheState<T>(key: string, initialValue: T) {
  const [state, setState] = React.useState(() => {
    const cached = localStorage.getItem(key);
    return cached !== null ? parseSafe(cached, initialValue) : initialValue;
  });

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}
