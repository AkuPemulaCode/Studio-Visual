import { useEffect, useState } from "react";
import { DB_ERROR_EVENT } from "../utils/dbEvents";

export default function DatabaseAlert() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      const detail = event.detail || {};
      setError({
        message: detail.message || "Tidak dapat mengakses database.",
        status: detail.status ?? null,
        at: Date.now(),
      });
    };

    window.addEventListener(DB_ERROR_EVENT, handleError);
    return () => window.removeEventListener(DB_ERROR_EVENT, handleError);
  }, []);

  useEffect(() => {
    if (!error) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") setError(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [error]);

  if (!error) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup peringatan database"
        onClick={() => setError(null)}
        className="animate-backdrop-in absolute inset-0 bg-black/60"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="database-alert-title"
        className="animate-modal-in relative w-full max-w-md border border-gray-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-red-50 text-red-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </span>
          <div className="min-w-0">
            <h2
              id="database-alert-title"
              className="font-display text-lg font-extrabold uppercase tracking-tight text-gray-900"
            >
              Koneksi Database Bermasalah
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Sistem tidak dapat memuat data dari database. Data mungkin tidak
              tersedia sampai koneksi pulih. Pastikan server backend dan
              database berjalan, lalu coba lagi.
            </p>
            {error.message && (
              <p className="mt-3 break-words border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error.message}
                {error.status ? ` (HTTP ${error.status})` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setError(null)}
            className="btn-outline"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    </div>
  );
}
