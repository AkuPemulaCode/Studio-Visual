export const DB_ERROR_EVENT = "inheartz:db-error";

export function notifyDatabaseError(message, status = 0) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(DB_ERROR_EVENT, {
      detail: {
        message: message || "Tidak dapat mengakses database.",
        status,
      },
    })
  );
}
