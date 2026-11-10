import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/notificationContext";

const TYPE_ACCENT = {
  new_booking: "border-l-gray-900",
  payment_succeeded: "border-l-emerald-500",
  booking_completed: "border-l-blue-500",
  booking_status: "border-l-amber-500",
  production_progress: "border-l-indigo-500",
  review_decision: "border-l-violet-500",
  package_recommendation: "border-l-pink-500",
};

const TYPE_BADGE = {
  new_booking: { label: "Pesanan Baru", className: "bg-gray-900 text-white" },
  payment_succeeded: {
    label: "Pembayaran",
    className: "bg-emerald-100 text-emerald-700",
  },
  booking_completed: { label: "Selesai", className: "bg-blue-100 text-blue-700" },
  booking_status: {
    label: "Status",
    className: "bg-amber-100 text-amber-700",
  },
  production_progress: {
    label: "Produksi",
    className: "bg-indigo-100 text-indigo-700",
  },
  review_decision: {
    label: "Review",
    className: "bg-violet-100 text-violet-700",
  },
  package_recommendation: {
    label: "Rekomendasi",
    className: "bg-pink-100 text-pink-700",
  },
};

export default function NotificationToaster() {
  const { toasts, removeToast, markRead } = useNotifications();
  const navigate = useNavigate();

  if (toasts.length === 0) return null;

  const handleClick = (toast) => {
    if (!toast.read) markRead(toast.id);
    removeToast(toast.toastId);
    if (toast.url) navigate(toast.url);
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3">
      {toasts.map((toast) => {
        const badge = TYPE_BADGE[toast.type] || {
          label: "Notifikasi",
          className: "bg-gray-100 text-gray-700",
        };
        return (
          <div
            key={toast.toastId}
            className={`pointer-events-auto animate-fade-in border border-gray-100 border-l-4 bg-white p-4 shadow-xl ${
              TYPE_ACCENT[toast.type] || "border-l-gray-400"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => handleClick(toast)}
                className="min-w-0 flex-1 text-left"
              >
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
                >
                  {badge.label}
                </span>
                <span className="mt-2 block text-sm font-bold text-gray-900">
                  {toast.title}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  {toast.message}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeToast(toast.toastId)}
                aria-label="Tutup notifikasi"
                className="text-gray-400 transition-colors hover:text-gray-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
