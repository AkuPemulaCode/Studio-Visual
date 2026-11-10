import { createContext, useContext } from "react";

export const NotificationContext = createContext(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications harus dipakai di dalam NotificationProvider");
  }
  return context;
}
