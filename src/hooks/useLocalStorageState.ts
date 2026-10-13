import { useCallback, useEffect, useState } from 'react';

/** State mirrored into localStorage, with a validator so corrupt data falls back to the default. */
export const useLocalStorageState = <T,>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T,
) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return initialValue;
      const parsed: unknown = JSON.parse(raw);
      return isValid(parsed) ? parsed : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable (private mode / kiosk); calibration is then session-only.
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, setValue, reset] as const;
};
