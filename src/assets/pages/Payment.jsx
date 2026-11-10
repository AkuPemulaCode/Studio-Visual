import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import paymentService from "../services/paymentService";
import bookingService from "../services/bookingService";
import { useAuth } from "../context/authContext";
import { formatIDR } from "../utils/format";
import { loadSnap } from "../utils/loadSnap";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking");
  const { user, isAuthenticated } = useAuth();

  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [unpaid, setUnpaid] = useState([]);
  const [loadingUnpaid, setLoadingUnpaid] = useState(
    Boolean(!bookingId && isAuthenticated && user?.email)
  );
  const [booking, setBooking] = useState(null);
  const [bookingState, setBookingState] = useState(
    bookingId ? "loading" : "none"
  );
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve(bookingService.getDraft()).then((bookingDraft) => {
      if (active) setDraft(bookingDraft);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (bookingId || !isAuthenticated || !user?.email) return undefined;
    let active = true;
    bookingService.mine(user.email).then((list) => {
      if (!active) return;
      setUnpaid(
        (list || []).filter((order) => order.status === "awaiting_payment")
      );
      setLoadingUnpaid(false);
    });
    return () => {
      active = false;
    };
  }, [bookingId, isAuthenticated, user?.email]);

  useEffect(() => {
    if (!bookingId) return undefined;
    let active = true;
    bookingService.detail(bookingId).then((data) => {
      if (!active) return;
      setBooking(data || null);
      setBookingState(data ? "found" : "missing");
    });
    return () => {
      active = false;
    };
  }, [bookingId]);

  const summary = {
    packageName: booking?.package || draft?.package_name || "Paket sesi",
    date: booking?.date || draft?.date || "",
    time: booking?.time || draft?.time || "",
    name: booking?.customer || draft?.name || user?.name || "-",
  };
  const amount = booking?.amount ?? draft?.price ?? 0;

  const syncPayment = async (orderId) => {
    if (!orderId) return;
    try {
      await paymentService.midtransSync(orderId);
    } catch (error) {
      void error;
    }
  };

  const handlePay = async () => {
    if (!bookingId) {
      setStatus("error");
      setMessage("Booking belum tersedia untuk pembayaran.");
      return;
    }
    setStatus("paying");
    setMessage("");
    setNotice("");
    try {
      const res = await paymentService.chargeMidtrans({
        booking_id: bookingId,
        customer: booking?.customer || draft?.name,
        email: booking?.email || draft?.email,
      });

      if (res.mock) {
        setStatus("idle");
        setNotice(
          `Midtrans belum dikonfigurasi (server key kosong). Order mock: ${res.order_id}. Isi MIDTRANS_SERVER_KEY & MIDTRANS_CLIENT_KEY di backend untuk pembayaran nyata.`
        );
        return;
      }

      setOrderRef(res.order_id);
      setRedirectUrl(res.redirect_url || "");

      if (!res.token) {
        throw new Error("Token pembayaran dari Midtrans tidak diterima.");
      }

      const snap = await loadSnap(
        res.client_key || import.meta.env.VITE_MIDTRANS_CLIENT_KEY,
        res.is_production
      );

      if (!snap || typeof snap.pay !== "function") {
        throw new Error("Midtrans Snap tidak siap. Silakan muat ulang halaman.");
      }

      try {
        snap.pay(res.token, {
          onSuccess: () => {
            setStatus("success");
            syncPayment(res.order_id);
          },
          onPending: () => {
            setStatus("pending");
            syncPayment(res.order_id);
          },
          onError: () => {
            setStatus("error");
            setMessage(
              "Pembayaran gagal diproses. Silakan coba lagi. Jika saldo Anda sudah terpotong, dana akan dikembalikan otomatis sesuai kebijakan Midtrans."
            );
            syncPayment(res.order_id);
          },
          onClose: () =>
            setStatus((prev) => (prev === "paying" ? "cancelled" : prev)),
        });
      } catch (snapErr) {
        if (res.redirect_url) {
          window.location.href = res.redirect_url;
          return;
        }
        throw snapErr;
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Gagal memulai pembayaran online.");
    }
  };

  const handleCancel = async () => {
    if (!bookingId || cancelling) return;
    setCancelling(true);
    await bookingService.cancel(bookingId);
    setCancelling(false);
    setConfirmCancel(false);
    setBooking(null);
    setStatus("void");
  };

  if (!bookingId) {
    return (
      <div className="w-full bg-white text-gray-900">
        <section className="border-b border-gray-300 bg-gray-50">
          <div className="container-editorial py-12 md:py-16">
            <p className="eyebrow mb-3">Pembayaran</p>
            <h1 className="section-title">Pembayaran Pesanan</h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-gray-500 leading-relaxed">
              Pembayaran hanya dapat dilakukan untuk pesanan yang sudah dibuat.
              Selesaikan booking Anda terlebih dahulu, lalu lanjutkan pembayaran
              di halaman ini.
            </p>
          </div>
        </section>

        <section className="container-editorial py-12 md:py-16">
          <div className="mx-auto max-w-xl">
            {loadingUnpaid ? (
              <div className="card p-10 text-center">
                <div className="mx-auto mb-6 h-10 w-10 animate-spin border-4 border-gray-200 border-t-gray-900" />
                <p className="text-sm text-gray-500">
                  Memeriksa pesanan Anda...
                </p>
              </div>
            ) : unpaid.length > 0 ? (
              <div className="card p-6 md:p-8">
                <h2 className="font-display text-xl font-extrabold uppercase tracking-tight">
                  Pesanan Menunggu Pembayaran
                </h2>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  Pilih pesanan yang ingin Anda selesaikan pembayarannya.
                </p>
                <ul className="mt-6 space-y-3">
                  {unpaid.map((order) => (
                    <li
                      key={order.id}
                      className="flex flex-col gap-3 border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-mono text-xs text-gray-400">
                          {order.id}
                        </p>
                        <p className="mt-1 font-bold text-gray-900">
                          {order.package || "Paket sesi"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.date ? `${order.date} · ${order.time}` : "-"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="font-display font-extrabold">
                          {formatIDR(order.amount || 0)}
                        </span>
                        <Link
                          to={`/pembayaran?booking=${encodeURIComponent(
                            order.id
                          )}`}
                          className="btn-primary"
                        >
                          Bayar
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex justify-center">
                  <Link to="/pesanan" className="btn-outline">
                    Lihat Semua Pesanan
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card p-10 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-gray-900 text-gray-900">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                  Belum Ada Pesanan untuk Dibayar
                </h2>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  Anda belum memiliki pesanan yang siap dibayar. Buat booking
                  terlebih dahulu, lalu Anda akan diarahkan ke halaman
                  pembayaran secara otomatis.
                </p>
                <ol className="mt-8 space-y-3 text-left text-sm text-gray-600">
                  {[
                    "Pilih paket layanan yang Anda inginkan",
                    "Tentukan tanggal & jam sesi",
                    "Lengkapi data lalu konfirmasi booking",
                  ].map((text, index) => (
                    <li key={text} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-none items-center justify-center bg-gray-900 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{text}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link to="/booking" className="btn-primary">
                    Mulai Booking
                  </Link>
                  <Link to="/layanan" className="btn-outline">
                    Lihat Paket Layanan
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  const isStatusScreen = [
    "paying",
    "pending",
    "success",
    "error",
    "cancelled",
    "void",
  ].includes(status);

  return (
    <div className="w-full bg-white text-gray-900">
      <section className="border-b border-gray-300 bg-gray-50">
        <div className="container-editorial py-12 md:py-16">
          <p className="eyebrow mb-3">Pembayaran</p>
          <h1 className="section-title">Selesaikan Pembayaran</h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-gray-500 leading-relaxed">
            Pembayaran diproses secara aman melalui Midtrans. Pilih metode
            pembayaran (transfer bank, e-wallet, QRIS, kartu) pada jendela
            Midtrans.
          </p>
        </div>
      </section>

      <section className="container-editorial py-12 md:py-16">
        {isStatusScreen ? (
          <div className="mx-auto max-w-xl card p-10 text-center">
            {status === "paying" && (
              <>
                <div className="mx-auto mb-6 h-10 w-10 animate-spin border-4 border-gray-200 border-t-gray-900" />
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                  Menyiapkan Pembayaran
                </h2>
                <p className="mt-4 text-sm text-gray-500">
                  Mohon tunggu, jendela Midtrans sedang dibuka...
                </p>
              </>
            )}

            {status === "pending" && (
              <>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                  Menunggu Pembayaran
                </h2>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  Pesanan Anda menunggu penyelesaian pembayaran. Status akan
                  otomatis diperbarui setelah Midtrans mengonfirmasi.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-gray-900 text-white">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                  Pembayaran Berhasil
                </h2>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  Terima kasih. Pembayaran Anda telah kami terima dan pesanan
                  akan segera diproses.
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-red-600 text-white">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                  Pembayaran Gagal
                </h2>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  {message ||
                    "Pembayaran tidak berhasil diproses. Silakan coba lagi."}
                </p>
              </>
            )}

            {status === "cancelled" && (
              <>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                  Pembayaran Dibatalkan
                </h2>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  Anda menutup jendela pembayaran sebelum menyelesaikan
                  transaksi. Pesanan Anda belum dibayar.
                </p>
              </>
            )}

            {status === "void" && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-gray-900 text-gray-900">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                  Pesanan Dibatalkan
                </h2>
                <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                  Pesanan Anda telah dibatalkan. Anda dapat membuat pesanan baru
                  kapan saja.
                </p>
              </>
            )}

            {orderRef && (
              <p className="mt-6 font-mono text-xs text-gray-400">
                No. Order: {orderRef}
              </p>
            )}

            {redirectUrl && ["paying", "cancelled", "error"].includes(status) && (
              <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                Jendela pembayaran tidak muncul?{" "}
                <a
                  href={redirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-gray-900 underline"
                >
                  Buka halaman pembayaran Midtrans
                </a>
              </p>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {["error", "cancelled"].includes(status) && (
                <button onClick={handlePay} className="btn-primary">
                  Coba Bayar Lagi
                </button>
              )}
              {status === "void" && (
                <Link to="/booking" className="btn-primary">
                  Buat Booking Baru
                </Link>
              )}
              <Link to="/pesanan" className="btn-outline">
                Lihat Progress Pesanan
              </Link>
            </div>
          </div>
        ) : bookingState === "loading" ? (
          <div className="mx-auto max-w-xl card p-10 text-center">
            <div className="mx-auto mb-6 h-10 w-10 animate-spin border-4 border-gray-200 border-t-gray-900" />
            <p className="text-sm text-gray-500">
              Memuat detail pesanan...
            </p>
          </div>
        ) : bookingState === "missing" ? (
          <div className="mx-auto max-w-lg card p-10 text-center">
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
              Pesanan Tidak Ditemukan
            </h2>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Pesanan yang ingin Anda bayar tidak ditemukan atau sudah tidak
              berlaku. Silakan buat pesanan baru.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/booking" className="btn-primary">
                Buat Booking
              </Link>
              <Link to="/pesanan" className="btn-outline">
                Lihat Pesanan
              </Link>
            </div>
          </div>
        ) : booking && booking.status !== "awaiting_payment" ? (
          <div className="mx-auto max-w-lg card p-10 text-center">
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
              Pesanan Tidak Menunggu Pembayaran
            </h2>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Pesanan ini sudah diproses atau dibatalkan, sehingga tidak perlu
              dibayar lagi.
            </p>
            <div className="mt-6 flex justify-center">
              <Link to="/pesanan" className="btn-primary">
                Lihat Progress Pesanan
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-xl">
            <div className="card p-6 md:p-8">
              <h2 className="font-display text-xl font-extrabold uppercase tracking-tight mb-4">
                Rincian Pembayaran
              </h2>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Paket</dt>
                  <dd className="text-right font-bold text-gray-900">
                    {summary.packageName}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Jadwal</dt>
                  <dd className="text-right font-bold text-gray-900">
                    {summary.date ? `${summary.date} · ${summary.time}` : "-"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Atas Nama</dt>
                  <dd className="text-right font-bold text-gray-900">
                    {summary.name}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Referensi Booking</dt>
                  <dd className="text-right font-mono text-xs text-gray-500">
                    {bookingId || "Draft"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-200 pt-4">
                  <dt className="text-gray-500">Total</dt>
                  <dd className="text-right font-display text-lg font-extrabold">
                    {formatIDR(amount)}
                  </dd>
                </div>
              </dl>

              <button onClick={handlePay} className="btn-primary mt-6 w-full">
                Bayar Sekarang (Midtrans)
              </button>

              {confirmCancel ? (
                <div className="mt-4 border border-red-200 bg-red-50 p-4">
                  <p className="text-xs text-red-700 leading-relaxed">
                    Yakin ingin membatalkan pembayaran pesanan ini? Pesanan akan
                    ditandai batal dan tidak dapat dilanjutkan lagi.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="btn-primary bg-red-600 text-xs hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancelling ? "Membatalkan..." : "Ya, Batalkan"}
                    </button>
                    <button
                      onClick={() => setConfirmCancel(false)}
                      disabled={cancelling}
                      className="btn-outline text-xs"
                    >
                      Tidak
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="btn-outline mt-3 w-full border-red-300 text-xs text-red-600 hover:bg-red-50"
                >
                  Batalkan Pembayaran
                </button>
              )}

              {notice && (
                <p className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 leading-relaxed">
                  {notice}
                </p>
              )}

              <p className="mt-4 text-center text-xs text-gray-400 leading-relaxed">
                Dengan melanjutkan, Anda akan diarahkan ke halaman pembayaran
                Midtrans yang aman.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
