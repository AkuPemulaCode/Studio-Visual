import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NotificationContext } from "./notificationContext";
import { useAuth } from "./authContext";
import notificationService from "../services/notificationService";
import {
  initAudioUnlock,
  playNotificationSound,
} from "../utils/notificationSound";

const POLL_INTERVAL = 15000;

export default function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [toasts, setToasts] = useState([]);

  const sessionRef = useRef({ key: null, ids: new Set() });
  const userId = user?.id ?? null;

  const pushToast = useCallback((notification) => {
    const toast = {
      ...notification,
      toastId: `${notification.id}-${Date.now()}`,
    };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.toastId !== toast.toastId));
    }, 7000);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { items: list, unread: count } = await notificationService.list(20);
      setItems(list);
      setUnread(count);

      const key = userId ?? "__guest__";

      if (sessionRef.current.key !== key) {
        sessionRef.current = { key, ids: new Set(list.map((item) => item.id)) };
        return;
      }

      const fresh = list.filter((item) => !sessionRef.current.ids.has(item.id));
      if (fresh.length > 0) {
        fresh.forEach((item) => sessionRef.current.ids.add(item.id));
        playNotificationSound();
        [...fresh].reverse().forEach(pushToast);
      }
    } catch {
      /* diamkan error polling (offline / 401) */
    }
  }, [userId, pushToast]);

  useEffect(() => initAudioUnlock(), []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const tick = () => refresh();
    const initial = setTimeout(tick, 0);
    const timer = setInterval(tick, POLL_INTERVAL);

    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [isAuthenticated, refresh]);

  const markRead = useCallback(async (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    setUnread((prev) => Math.max(0, prev - 1));
    try {
      const result = await notificationService.markRead(id);
      if (typeof result?.unread === "number") setUnread(result.unread);
    } catch {
      /* abaikan */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnread(0);
    try {
      await notificationService.markAllRead();
    } catch {
      /* abaikan */
    }
  }, []);

  const removeToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((item) => item.toastId !== toastId));
  }, []);

  const value = useMemo(
    () => ({
      items,
      unread,
      toasts,
      refresh,
      markRead,
      markAllRead,
      removeToast,
    }),
    [items, unread, toasts, refresh, markRead, markAllRead, removeToast]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
