import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import bookingService from "../services/bookingService";
import paymentService from "../services/paymentService";
import recommendationService from "../services/recommendationService";
import { useAuth } from "../context/authContext";
import { usePolling } from "../hooks/usePolling";
import { useToast } from "../hooks/useToast";
import ToastStack from "../components/Toast";
import Reveal from "../components/Reveal";
import { isImageUrl, safeExternalUrl } from "../utils/url";
import {
  formatIDR,
  formatDate,
  statusLabel,
  statusStyle,
  stageIndex,
  isCancelled,
  isInProduction,
  PROGRESS_STAGES,
  PRODUCTION_STAGES,
  productionStageIndex,
  productionPercent,
} from "../utils/format";

function ProgressStepper({ status }) {
  const current = stageIndex(status);
  const cancelled = isCancelled(status);
  const lastIndex = PROGRESS_STAGES.length - 1;

  return (
    <ol className="mt-8 flex items-start">
      {PROGRESS_STAGES.map((stage, index) => {
        const done = !cancelled && index <= current;
        const isCurrent = !cancelled && index === current;

        let fillClass = "";
        if (!cancelled) {
          if (index < current) fillClass = "w-full bg-gray-900 animate-grow-x";
          else if (index === current && status === "ongoing")
            fillClass = "w-full progress-flow";
        }

        return (
          <li key={stage.key} className="relative flex-1">
            <div className="flex items-center">
              <span
                className={`z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center text-xs font-bold ${
                  cancelled
                    ? "border border-gray-300 text-gray-300"
                    : done
                    ? "bg-gray-900 text-white"
                    : "border border-gray-300 text-gray-400"
                } ${isCurrent ? "animate-pulse-step" : ""}`}
              >
                {done && index < current ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              {index < lastIndex && (
                <span className="relative h-0.5 flex-1 overflow-hidden rounded bg-gray-200">
                  <span
                    className={`absolute inset-y-0 left-0 ${fillClass}`}
                    style={{ animationDelay: `${index * 220}ms` }}
                  />
                </span>
              )}
            </div>
            <p
              className={`mt-3 pr-2 text-[10px] font-bold uppercase leading-tight tracking-widest ${
                !cancelled && index <= current
                  ? "text-gray-900"
                  : "text-gray-400"
              }`}
            >
              {stage.label}
              {isCurrent && status === "ongoing" && (
                <span className="ml-1 inline-block animate-pulse text-gray-500">
                  ●
                </span>
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function ProductionPanel({ order }) {
  const current = productionStageIndex(order.productionStage);
  const percent = order.productionPercent ?? productionPercent(order.productionStage);
  const history = Array.isArray(order.progress) ? order.progress : [];
  const latestNote = [...history].reverse().find((item) => item.note);

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Progres Produksi</p>
        <span className="text-sm font-bold text-gray-900">{percent}%</span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gray-900 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {PRODUCTION_STAGES.map((stage, index) => {
          const done = index < current;
          const isCurrent = index === current;
          return (
            <div key={stage.key} className="flex items-center gap-2">
              <span
                className={`flex h-3 w-3 flex-shrink-0 rounded-full ${
                  done || isCurrent
                    ? "bg-gray-900"
                    : "border border-gray-300 bg-white"
                }`}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  done || isCurrent ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {stage.label}
                {isCurrent && (
                  <span className="ml-1 inline-block animate-pulse text-gray-500">
                    •
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {latestNote && (
        <p className="mt-4 text-xs text-gray-600 leading-relaxed">
          <span className="eyebrow mr-2">Catatan Produksi</span>
          {latestNote.note}
        </p>
      )}

      {order.estimatedFinish && (
        <p className="mt-2 text-xs text-gray-500">
          Estimasi selesai:{" "}
          <span className="font-bold text-gray-700">
            {formatDate(order.estimatedFinish)}
          </span>
        </p>
      )}
    </div>
  );
}

function ReviewPanel({ order, onReviewed, push }) {
  const [mode, setMode] = useState("idle");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const status = order.reviewStatus;
  const canDecide = status === "pending" || status == null;
  const previewUrl = safeExternalUrl(order.previewUrl);

  const submit = async (decision) => {
    setBusy(true);
    try {
      const updated = await bookingService.review(order.id, { decision, note });
      onReviewed?.(updated);
      push(
        decision === "revision"
          ? "Permintaan revisi terkirim. Tim kami akan menindaklanjuti."
          : "Terima kasih! Hasil Anda telah disetujui.",
        "success"
      );
      setMode("idle");
      setNote("");
    } catch (error) {
      push(error.message || "Gagal mengirim keputusan.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 animate-slide-up border border-violet-200 bg-violet-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-violet-500">Review Hasil</p>
          <p className="mt-1 text-sm text-gray-700">
            Hasil sesi Anda siap ditinjau. Silakan periksa preview, lalu setujui
            atau minta revisi.
          </p>
        </div>
        {order.revisionCount > 0 && (
          <span className="badge bg-amber-100 text-amber-800">
            Revisi ke-{order.revisionCount}
          </span>
        )}
      </div>

      {previewUrl ? (
        isImageUrl(previewUrl) ? (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block overflow-hidden border border-violet-200"
          >
            <img
              src={previewUrl}
              alt="Preview hasil sesi"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="animate-pop-in max-h-80 w-full object-cover"
            />
          </a>
        ) : (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline mt-4 border-violet-600 text-violet-700 hover:bg-violet-600"
          >
            Buka Preview Hasil
          </a>
        )
      ) : (
        <p className="mt-4 border border-violet-200 bg-white px-4 py-3 text-xs text-gray-500">
          Preview hasil belum tersedia. Akan muncul di sini setelah tim
          mengunggahnya.
        </p>
      )}

      {status === "approved" && (
        <p className="mt-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Hasil telah Anda setujui. Tim akan menyiapkan pengiriman final.
        </p>
      )}

      {status === "revision" && (
        <p className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Permintaan revisi sedang dikerjakan tim produksi. Anda akan menerima
          notifikasi saat preview baru siap.
        </p>
      )}

      {canDecide && (
        <div className="mt-5">
          {mode === "revision" ? (
            <div className="animate-slide-up space-y-3">
              <label className="label">Catatan Revisi</label>
              <textarea
                className="input min-h-[100px] resize-y"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tuliskan bagian yang ingin direvisi, mis. warna kulit, pencahayaan, cropping."
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || !note.trim()}
                  onClick={() => submit("revision")}
                  className="btn-primary bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                >
                  {busy ? "Mengirim..." : "Kirim Permintaan Revisi"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("idle")}
                  className="btn-outline"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => submit("approved")}
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                {busy ? "Memproses..." : "Setujui Hasil"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setMode("revision")}
                className="btn-outline border-amber-600 text-amber-700 hover:bg-amber-600"
              >
                Minta Revisi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [expanded, setExpanded] = useState(null);
  const [syncId, setSyncId] = useState(null);
  const [syncNote, setSyncNote] = useState({ id: null, text: "" });
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const { toasts, push, remove } = useToast();
  const firstLoad = useRef(true);

  const loadOrders = useCallback(
    async (silent = false) => {
      if (!isAuthenticated) return;
      if (!silent) setLoading(true);
      const data = await bookingService.mine(user?.email);
      setOrders(data || []);
      setLoading(false);
      firstLoad.current = false;
    },
    [isAuthenticated, user?.email]
  );

  const cancelPayment = async (orderId) => {
    setCancellingId(orderId);
    await bookingService.cancel(orderId);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "cancelled" } : order
      )
    );
    setCancellingId(null);
    setCancelConfirmId(null);
    push("Pembayaran dibatalkan. Pesanan ditandai batal.", "info");
  };

  const checkPayment = async (orderId) => {
    setSyncId(orderId);
    setSyncNote({ id: orderId, text: "" });
    try {
      const res = await paymentService.midtransSyncBooking(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: res?.booking_status || order.status }
            : order
        )
      );
      if (res?.booking_status === "paid" || res?.status === "verified") {
        setSyncNote({ id: orderId, text: "Pembayaran terkonfirmasi. Terima kasih!" });
      } else if (res?.status === "pending") {
        setSyncNote({
          id: orderId,
          text: "Pembayaran belum kami terima. Jika baru membayar, tunggu 1-2 menit lalu cek lagi.",
        });
      } else {
        setSyncNote({ id: orderId, text: "Status pesanan diperbarui." });
      }
    } catch (error) {
      setSyncNote({
        id: orderId,
        text: error.message || "Gagal memeriksa status pembayaran.",
      });
    } finally {
      setSyncId(null);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    bookingService.mine(user?.email).then((data) => {
      if (!active) return;
      setOrders(data || []);
      setLoading(false);
      firstLoad.current = false;
    });
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.email]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    recommendationService.list(3).then((list) => {
      if (active) setRecommendations(list);
    });
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.email]);

  usePolling(
    () => {
      if (firstLoad.current) return;
      loadOrders(true);
    },
    15000,
    isAuthenticated
  );

  const handleReviewed = useCallback((updated) => {
    if (!updated?.id) {
      loadOrders(true);
      return;
    }
    setOrders((prev) =>
      prev.map((order) =>
        order.id === updated.id ? { ...order, ...updated } : order
      )
    );
  }, [loadOrders]);

  return (
    <div className="w-full bg-white text-gray-900">
      <section className="border-b border-gray-300 bg-gray-50">
        <div className="container-editorial py-12 md:py-16">
          <p className="eyebrow mb-3">Pesanan Saya</p>
          <h1 className="section-title">Progress Pesanan</h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-gray-500 leading-relaxed">
            Pantau sejauh mana pesanan Anda diproses oleh tim Inheartz Studio,
            mulai dari pembayaran hingga hasil sesi selesai.
          </p>
        </div>
      </section>

      <section className="container-editorial py-12 md:py-16">
        {isAuthenticated && recommendations.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-1">Rekomendasi</p>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                  Paket untuk Anda
                </h2>
                <p className="mt-2 max-w-xl text-sm text-gray-500 leading-relaxed">
                  Dipilih berdasarkan riwayat pesanan Anda di Inheartz Studio.
                </p>
              </div>
              <Link
                to="/layanan"
                className="text-xs font-bold uppercase tracking-widest text-gray-500 underline underline-offset-4 hover:text-gray-900"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {recommendations.map((item) => (
                <div key={item.id} className="card flex flex-col p-5">
                  <h3 className="font-display text-lg font-extrabold uppercase leading-tight tracking-tight">
                    {item.name}
                  </h3>
                  <p className="mt-2 font-display text-base font-extrabold">
                    {formatIDR(item.price)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.duration || "-"}
                    {item.photos ? ` · ${item.photos} foto` : ""}
                  </p>
                  <Link
                    to={`/booking?paket=${encodeURIComponent(item.slug)}`}
                    className="btn-primary mt-4 self-start text-xs"
                  >
                    Pesan Paket Ini
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="mx-auto max-w-lg card p-10 text-center">
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
              Masuk Dulu Ya
            </h2>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Masuk ke akun Anda untuk melihat status dan progress pesanan yang
              sedang berjalan.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/masuk" className="btn-primary">
                Masuk
              </Link>
              <Link to="/booking" className="btn-outline">
                Buat Booking
              </Link>
            </div>
          </div>
        ) : loading ? (
          <p className="text-sm text-gray-400">Memuat pesanan...</p>
        ) : orders.length === 0 ? (
          <div className="mx-auto max-w-lg card p-10 text-center">
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
              Belum Ada Pesanan
            </h2>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Anda belum memiliki pesanan. Mulai booking sesi pertama Anda
              sekarang.
            </p>
            <Link to="/booking" className="btn-primary mt-6">
              Booking Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <Reveal key={order.id} delay={index * 90}>
                <div className="card p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-mono text-xs text-gray-400">
                      {order.id}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-extrabold uppercase tracking-tight">
                      {order.package}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(order.date)} · {order.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${statusStyle(order.status)}`}>
                      {statusLabel(order.status)}
                    </span>
                    <span className="font-display text-lg font-extrabold">
                      {formatIDR(order.amount)}
                    </span>
                  </div>
                </div>

                {isCancelled(order.status) ? (
                  <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    Pesanan ini dibatalkan. Hubungi tim kami bila perlu
                    penjadwalan ulang.
                  </p>
                ) : (
                  <ProgressStepper status={order.status} />
                )}

                {!isCancelled(order.status) && isInProduction(order.status) && (
                  <ProductionPanel order={order} />
                )}

                {!isCancelled(order.status) &&
                  ["review", "revision"].includes(order.productionStage) && (
                    <ReviewPanel
                      order={order}
                      onReviewed={handleReviewed}
                      push={push}
                    />
                  )}

                {["awaiting_payment", "paid"].includes(order.status) && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => checkPayment(order.id)}
                        disabled={syncId === order.id}
                        className="btn-outline text-xs disabled:opacity-50"
                      >
                        {syncId === order.id
                          ? "Memeriksa..."
                          : "Cek Status Pembayaran"}
                      </button>
                      {order.status === "awaiting_payment" && (
                        <Link
                          to={`/pembayaran?booking=${encodeURIComponent(
                            order.id
                          )}`}
                          className="btn-primary text-xs"
                        >
                          Bayar Sekarang
                        </Link>
                      )}
                      {order.status === "awaiting_payment" &&
                        (cancelConfirmId === order.id ? (
                          <>
                            <button
                              onClick={() => cancelPayment(order.id)}
                              disabled={cancellingId === order.id}
                              className="btn-outline border-red-300 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {cancellingId === order.id
                                ? "Membatalkan..."
                                : "Ya, Batalkan"}
                            </button>
                            <button
                              onClick={() => setCancelConfirmId(null)}
                              disabled={cancellingId === order.id}
                              className="btn-outline text-xs"
                            >
                              Tidak
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setCancelConfirmId(order.id)}
                            className="btn-outline border-red-300 text-xs text-red-600 hover:bg-red-50"
                          >
                            Batalkan Pembayaran
                          </button>
                        ))}
                    </div>
                    {syncNote.id === order.id && syncNote.text && (
                      <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                        {syncNote.text}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                      Baru saja membayar? Klik tombol di atas untuk menyinkronkan
                      status pembayaran dari Midtrans.
                    </p>
                  </div>
                )}

                {(order.adminNote || order.driveUrl) && (
                  <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {order.adminNote && (
                      <div className="border border-gray-200 bg-gray-50 p-4">
                        <p className="eyebrow mb-2">Catatan dari Admin</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {order.adminNote}
                        </p>
                      </div>
                    )}
                    {order.driveUrl && (
                      <div className="flex flex-col justify-between border border-blue-200 bg-blue-50 p-4">
                        <div>
                          <p className="eyebrow mb-2 text-blue-500">
                            Hasil Sesi
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            Foto/video hasil sesi Anda tersedia di Google Drive.
                          </p>
                        </div>
                        <a
                          href={order.driveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary mt-4 self-start"
                        >
                          Buka Hasil (Google Drive)
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() =>
                    setExpanded((prev) =>
                      prev === order.id ? null : order.id
                    )
                  }
                  className="mt-6 text-xs font-bold uppercase tracking-widest text-gray-500 underline underline-offset-4 hover:text-gray-900"
                >
                  {expanded === order.id ? "Sembunyikan Detail" : "Lihat Detail"}
                </button>

                {expanded === order.id && (
                  <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="eyebrow mb-1">Kontak</p>
                      <p className="text-gray-700">{order.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="eyebrow mb-1">Dibuat</p>
                      <p className="text-gray-700">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="eyebrow mb-1">Catatan</p>
                      <p className="text-gray-700">{order.notes || "-"}</p>
                    </div>
                  </div>
                )}
              </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <ToastStack toasts={toasts} remove={remove} />
    </div>
  );
}
