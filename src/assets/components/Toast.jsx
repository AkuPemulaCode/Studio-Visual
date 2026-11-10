const VARIANT_STYLE = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  info: "border-l-gray-900",
};

const VARIANT_ICON = {
  success: "text-emerald-500",
  error: "text-red-500",
  info: "text-gray-900",
};

export default function ToastStack({ toasts, remove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[95] flex w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex animate-toast-in items-center gap-3 border border-gray-100 border-l-4 bg-white px-4 py-3 shadow-xl ${
            VARIANT_STYLE[toast.variant] || VARIANT_STYLE.info
          }`}
          role="status"
        >
          <span className={`text-sm font-bold ${VARIANT_ICON[toast.variant] || ""}`}>
            {toast.variant === "success" ? "✓" : toast.variant === "error" ? "!" : "i"}
          </span>
          <span className="flex-1 text-sm text-gray-700">{toast.message}</span>
          <button
            type="button"
            onClick={() => remove(toast.id)}
            aria-label="Tutup"
            className="text-gray-400 transition-colors hover:text-gray-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
