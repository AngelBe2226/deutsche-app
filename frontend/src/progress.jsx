import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";

// Global progress store. Loads every saved key once, keeps it in memory,
// and writes through to the backend on each change (optimistic update).
const ProgressCtx = createContext(null);

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .getProgress()
      .then((data) => setProgress(data || {}))
      .catch(() => setProgress({}))
      .finally(() => setLoaded(true));
  }, []);

  const getVal = useCallback((key) => progress[key] ?? null, [progress]);

  const setVal = useCallback((key, value) => {
    setProgress((prev) => ({ ...prev, [key]: value }));
    api.setProgress(key, value).catch(() => {});
  }, []);

  const delVal = useCallback((key) => {
    setProgress((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    return api.deleteProgress(key).catch(() => {});
  }, []);

  // Deletes an explicit list of keys (not a prefix) — used to reset just
  // one epígrafe's quiz without risking a prefix collision (e.g. "s1"
  // matching "s10", "s11"...).
  const delMany = useCallback((keys) => {
    setProgress((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const k of keys) {
        if (k in next) {
          delete next[k];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    return Promise.all(keys.map((k) => api.deleteProgress(k).catch(() => {})));
  }, []);

  const resetPrefix = useCallback((prefix) => {
    setProgress((prev) => {
      const next = {};
      for (const k of Object.keys(prev)) if (!k.startsWith(prefix)) next[k] = prev[k];
      return next;
    });
    return api.resetPrefix(prefix).catch(() => {});
  }, []);

  return (
    <ProgressCtx.Provider value={{ progress, loaded, getVal, setVal, delVal, delMany, resetPrefix }}>
      {children}
    </ProgressCtx.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
