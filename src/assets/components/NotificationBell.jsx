import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/notificationContext";

const TYPE_STYLES = {
  new_booking: { dot: "bg-gray-900" },
  payment_succeeded: { dot: "bg-emerald-500" },
  booking_completed: { dot: "bg-blue-500" },
  booking_status: { dot: "bg-amber-500" },
  production_progress: { dot: "bg-indigo-500" },
  review_decision: { dot: "bg-violet-500" },
  package_recommendation: { dot: "bg-pink-500" },
};

function timeAgo(value) {
  if (!value) return "";
  const date = new Date(value);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function NotificationBell({ align = "right" }) {
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleOpenItem = (item) => {
    if (!item.read) markRead(item.id);
    setOpen(false);
    if (item.url) navigate(item.url);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifikasi"
        className="relative flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] border border-gray-100 bg-white shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-900">
              Notifikasi
            </span>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900"
              >
                Tandai semua
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                Belum ada notifikasi
              </p>
            ) : (
              items.map((item) => {
                const style = TYPE_STYLES[item.type] || { dot: "bg-gray-400" };
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOpenItem(item)}
                    className={`flex w-full gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                      item.read ? "" : "bg-gray-50/70"
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        item.read ? "bg-transparent" : style.dot
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-gray-900">
                        {item.title}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {item.message}
                      </span>
                      <span className="mt-1 block text-[10px] uppercase tracking-wider text-gray-400">
                        {timeAgo(item.created_at)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
