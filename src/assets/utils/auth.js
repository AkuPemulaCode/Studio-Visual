const ADMIN_ROLES = new Set(["admin", "superadmin"]);
const WORKER_ROLES = new Set(["staff", "production"]);
const VALID_ROLES = new Set([...ADMIN_ROLES, ...WORKER_ROLES, "client"]);

const AUTH_PATHS = new Set([
  "/",
  "/masuk",
  "/login",
  "/daftar",
  "/register",
  "/lupa-password",
]);

export function normalizeRole(value) {
  const role = String(value || "").trim().toLowerCase();
  return VALID_ROLES.has(role) ? role : "client";
}

export function isAdminRole(value) {
  return ADMIN_ROLES.has(normalizeRole(value));
}

export function isWorkerRole(value) {
  return WORKER_ROLES.has(normalizeRole(value));
}

export function normalizeUser(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return { ...raw, role: normalizeRole(raw.role) };
}

export function getHomePath(role) {
  if (isAdminRole(role)) return "/admin";
  if (isWorkerRole(role)) return "/worker";
  return "/";
}

export function isSafeInternalPath(path) {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("\\") &&
    !path.includes("\0")
  );
}

export function resolvePostLoginPath(role, from) {
  const home = getHomePath(role);

  if (!isSafeInternalPath(from)) return home;
  if (AUTH_PATHS.has(from)) return home;

  if (isAdminRole(role)) return from;

  if (isWorkerRole(role)) {
    return from === "/worker" || from.startsWith("/worker/") ? from : home;
  }

  if (from.startsWith("/admin") || from.startsWith("/worker")) return home;
  return from;
}
