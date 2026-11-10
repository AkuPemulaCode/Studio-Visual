const SAFE_PROTOCOLS = new Set(["http:", "https:"]);
const IMAGE_EXTENSION = /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i;

export function safeExternalUrl(value) {
  if (!value) return "";
  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const url = new URL(String(value), base);
    if (!SAFE_PROTOCOLS.has(url.protocol)) return "";
    return url.href;
  } catch {
    return "";
  }
}

export function safeImageUrl(value) {
  const url = safeExternalUrl(value);
  if (!url) return "";
  return IMAGE_EXTENSION.test(new URL(url).pathname) ? url : "";
}

export function isImageUrl(value) {
  return Boolean(safeImageUrl(value));
}
