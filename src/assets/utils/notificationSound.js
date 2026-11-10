let audioContext;

function getContext() {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioContext) audioContext = new AudioCtx();
  return audioContext;
}

/**
 * Resume AudioContext saat interaksi pertama pengguna.
 * Browser memblokir audio sebelum ada gesture, jadi kita "buka kunci" di sini.
 */
export function initAudioUnlock() {
  if (typeof window === "undefined") return () => {};

  const unlock = () => {
    const ctx = getContext();
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
  };

  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });

  return () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
}

/**
 * Bunyi notifikasi (dua nada) disintesis via Web Audio API.
 */
export function playNotificationSound() {
  try {
    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const now = ctx.currentTime;

    const beep = (frequency, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    };

    beep(880, now, 0.15);
    beep(1174.66, now + 0.16, 0.22);
  } catch {
    /* audio tidak wajib; abaikan bila gagal */
  }
}
