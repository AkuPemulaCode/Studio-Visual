import { API_BASE_URL, STORAGE_KEYS } from "../config/api";
import { notifyDatabaseError } from "../utils/dbEvents";

const PUBLIC_AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
];

function isPublicAuthPath(path) {
  return PUBLIC_AUTH_PATHS.some((item) => path.startsWith(item));
}

function handleUnauthorized(path) {
  if (isPublicAuthPath(path)) return;
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
  if (typeof window !== "undefined" && window.location.pathname !== "/masuk") {
    window.location.replace("/masuk");
  }
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export function setToken(token) {
  if (token) localStorage.setItem(STORAGE_KEYS.token, token);
  else localStorage.removeItem(STORAGE_KEYS.token);
}

function buildHeaders(options) {
  const headers = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  return { ...headers, ...(options.headers || {}) };
}

export async function request(path, options = {}) {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    const error = new Error("Endpoint API tidak valid");
    error.status = 400;
    throw error;
  }

  const config = {
    method: options.method || "GET",
    headers: buildHeaders(options),
    cache: "no-store",
    referrerPolicy: "no-referrer",
  };

  if (options.body) {
    config.body =
      options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, config);
  } catch {
    const error = new Error("Tidak dapat terhubung ke server");
    error.status = 0;
    error.offline = true;
    notifyDatabaseError(
      "Tidak dapat terhubung ke server. Pastikan backend dan database berjalan.",
      0
    );
    throw error;
  }

  const isJson = (response.headers.get("content-type") || "").includes(
    "application/json"
  );
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized(path);
    const error = new Error(
      (payload && payload.message) || "Permintaan gagal diproses"
    );
    error.status = response.status;
    error.errors = payload && payload.errors;
    if (response.status >= 500) {
      notifyDatabaseError(error.message, response.status);
    }
    throw error;
  }

  return payload;
}

export const http = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    request(path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) =>
    request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

export default http;
