let snapPromise = null;

export function loadSnap(clientKey, isProduction = false) {
  if (typeof window !== "undefined" && window.snap) {
    return Promise.resolve(window.snap);
  }

  if (snapPromise) return snapPromise;

  const src = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  snapPromise = new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      snapPromise = null;
      reject(
        new Error(
          "Waktu habis memuat Midtrans Snap. Periksa koneksi internet atau matikan pemblokir iklan lalu coba lagi."
        )
      );
    }, 10000);

    const finish = (fn) => (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(value);
    };

    const script = document.createElement("script");
    script.src = src;
    if (clientKey) script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = finish(() => {
      if (typeof window !== "undefined" && window.snap) {
        resolve(window.snap);
      } else {
        snapPromise = null;
        reject(new Error("Midtrans Snap gagal dimuat sepenuhnya."));
      }
    });
    script.onerror = finish(() => {
      snapPromise = null;
      reject(
        new Error(
          "Gagal memuat Midtrans Snap. Matikan pemblokir iklan (ad-blocker) lalu coba lagi."
        )
      );
    });
    document.body.appendChild(script);
  });

  return snapPromise;
}

export default loadSnap;
