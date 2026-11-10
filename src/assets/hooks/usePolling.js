import { useEffect, useRef } from "react";

/**
 * Menjalankan `callback` secara berkala (polling) selama komponen hidup.
 * Polling dihentikan saat tab tidak aktif untuk menghemat resource.
 */
export function usePolling(callback, interval = 15000, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !interval) return undefined;

    const tick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      savedCallback.current?.();
    };

    const timer = setInterval(tick, interval);
    return () => clearInterval(timer);
  }, [interval, enabled]);
}

export default usePolling;
