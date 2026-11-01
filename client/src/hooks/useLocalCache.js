import { useState, useEffect, useCallback } from 'react';

const CACHE_EVENT = 'prep_local_cache_sync';

/**
 * Custom hook for localStorage caching with fallback and cross-component live sync.
 * (Implements assignment requirement for React Hooks & caching)
 */
export function useLocalCache(key, initialValue) {
  const [value, setValueState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.warn(`Error reading localStorage key "${key}":`, err);
      return initialValue;
    }
  });

  // Listen to same-window and cross-window storage updates for this key
  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail && e.detail.key === key) {
        setValueState(e.detail.value);
      }
    };

    const handleStorage = (e) => {
      if (e.key === key) {
        try {
          setValueState(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (err) {
          setValueState(initialValue);
        }
      }
    };

    window.addEventListener(CACHE_EVENT, handleSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(CACHE_EVENT, handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [key, initialValue]);

  const setValue = useCallback((newValueOrUpdater) => {
    setValueState((prev) => {
      const resolved = typeof newValueOrUpdater === 'function' ? newValueOrUpdater(prev) : newValueOrUpdater;
      try {
        if (resolved === null || resolved === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        }
        window.dispatchEvent(new CustomEvent(CACHE_EVENT, { detail: { key, value: resolved } }));
      } catch (err) {
        console.warn(`Error setting localStorage key "${key}":`, err);
      }
      return resolved;
    });
  }, [key]);

  return [value, setValue];
}
