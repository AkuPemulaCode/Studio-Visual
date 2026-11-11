import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";
import paymentService from "../../services/paymentService";
import AdminPageHeader from "../components/AdminPageHeader";
import Modal from "../components/Modal";
import { usePolling } from "../../hooks/usePolling";
import {
  formatIDR,
  formatShortDate,
  statusLabel,
  statusStyle,
  STATUS_ORDER,
  PRODUCTION_STAGES,
  productionStageLabel,
  productionStageStyle,
  BOOKING_CATEGORIES,
  bookingCategoryLabel,
  bookingCategoryStyle,
} from "../../utils/format";

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "awaiting_payment", label: "Menunggu Bayar" },
  { id: "confirmed", label: "Terkonfirmasi" },
  { id: "ongoing", label: "Berlangsung" },
  { id: "completed", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
];

const EMPTY_FORM = {
  status: "awaiting_payment",
  bookingCategory: "personal",
  adminNote: "",
  driveUrl: "",
  productionStage: "queued",
  productionNote: "",
  estimatedFinish: "",
  previewUrl: "",
};

const EMPTY_EDIT = {
  customer: "",
  email: "",
  phone: "",
  bookingCategory: "personal",
  package: "",
  date: "",
  time: "",
  location: "",
  notes: "",
  amount: "",
};

export default function Bookings({ worker = false }) {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const [managing, setManaging] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  // const [workers, setWorkers] = useState([]);
  // const [assigning, setAssigning] = useState(null);

  const load = () =>
    adminService.bookings().then((data) => setBookings(data || []));

  usePolling(load, 15000, !savingId);

  useEffect(() => {
    let active = true;
    adminService.bookings().then((data) => {
      if (active) setBookings(data || []);
    });
    // adminService.workers().then((data) => {
    //   if (active) setWorkers(data || []);
    // });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchStatus = filter === "all" || booking.status === filter;
      const matchCategory =
        categoryFilter === "all" ||
        (booking.bookingCategory || booking.booking_category) ===
          categoryFilter;
      const matchQuery =
        !keyword ||
        booking.id?.toLowerCase().includes(keyword) ||
        booking.customer?.toLowerCase().includes(keyword) ||
        booking.package?.toLowerCase().includes(keyword);
      return matchStatus && matchCategory && matchQuery;
    });
  }, [bookings, filter, categoryFilter, query]);

  const handleStatus = async (id, status) => {
    setSavingId(id);
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    );
    await adminService.updateBookingStatus(id, status);
    setSavingId(null);
  };

  const openManage = (booking) => {
    setManaging(booking);
    setSyncNote("");
    setForm({
      status: booking.status || "awaiting_payment",
      bookingCategory:
        booking.bookingCategory || booking.booking_category || "personal",
      adminNote: booking.adminNote || "",
      driveUrl: booking.driveUrl || "",
      productionStage: booking.productionStage || "queued",
      productionNote: "",
      estimatedFinish: booking.estimatedFinish || "",
      previewUrl: booking.previewUrl || "",
    });
  };

  const checkPayment = async (bookingId) => {
    setSyncing(true);
    setSyncNote("");
    try {
      const res = await paymentService.midtransSyncBooking(bookingId);
      await load();
      if (res?.booking_status === "paid" || res?.status === "verified") {
        setSyncNote("Pembayaran terkonfirmasi (verified). Status booking diperbarui ke paid.");
        setForm((prev) => ({ ...prev, status: "paid" }));
      } else if (res?.status === "pending") {
        setSyncNote("Status Midtrans masih pending — pelanggan belum menyelesaikan pembayaran.");
      } else {
        setSyncNote(`Status diperbarui: ${res?.status || "tidak diketahui"}.`);
      }
    } catch (error) {
      setSyncNote(error.message || "Gagal memeriksa status pembayaran.");
    } finally {
      setSyncing(false);
    }
  };

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // const handleAssign = async (bookingId, userId) => {
  //   if (!userId) return;
  //   setAssigning(bookingId);
  //   setBookings((prev) =>
  //     prev.map((booking) =>
  //       booking.id === bookingId
  //         ? { ...booking, assignedTo: userId, assigned_to: userId }
  //         : booking
  //     )
  //   );
  //   await adminService.assignBooking(bookingId, userId);
  //   setAssigning(null);
  // };

  const handleManageSave = async () => {
    if (!managing) return;
    setSaving(true);
    const patch = {
      status: form.status,
      bookingCategory: form.bookingCategory,
      adminNote: form.adminNote.trim(),
      driveUrl: form.driveUrl.trim(),
    };
    await adminService.updateBooking(managing.id, patch);

    const stageChanged = form.productionStage !== managing.productionStage;
    const finishChanged =
      (form.estimatedFinish || "") !== (managing.estimatedFinish || "");
    const previewChanged =
      (form.previewUrl || "") !== (managing.previewUrl || "");
    if (
      stageChanged ||
      finishChanged ||
      previewChanged ||
      form.productionNote.trim()
    ) {
      await adminService.updateProgress(managing.id, {
        stage: form.productionStage,
        note: form.productionNote.trim(),
        estimatedFinish: form.estimatedFinish || null,
        previewUrl: form.previewUrl.trim(),
      });
    }

    await load();
    setSaving(false);
    setManaging(null);
  };

  const handleDelete = async (id) => {
    setBookings((prev) => prev.filter((booking) => booking.id !== id));
    await adminService.removeBooking(id);
  };

  const openEdit = (booking) => {
    setEditing(booking);
    setEditError("");
    setEditForm({
      customer: booking.customer || "",
      email: booking.email || "",
      phone: booking.phone || "",
      bookingCategory:
        booking.bookingCategory || booking.booking_category || "personal",
      package: booking.package || "",
      date: booking.date || "",
      time: booking.time || "",
      location: booking.location || "",
      notes: booking.notes || "",
      amount: booking.amount != null ? String(booking.amount) : "",
    });
  };

  const updateEdit = (key, value) =>
    setEditForm((prev) => ({ ...prev, [key]: value }));

  const handleEditSave = async () => {
    if (!editing) return;
    if (!editForm.customer.trim()) {
      setEditError("Nama pelanggan wajib diisi.");
      return;
    }
    setEditSaving(true);
    setEditError("");
    try {
      const patch = {
        customer: editForm.customer.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        bookingCategory: editForm.bookingCategory,
        package: editForm.package.trim() || "Paket Layanan",
        date: editForm.date,
        time: editForm.time,
        location: editForm.location.trim(),
        notes: editForm.notes,
        amount: Number(editForm.amount) || 0,
      };
      await adminService.updateBooking(editing.id, patch);
      await load();
      setEditing(null);
    } catch (err) {
      setEditError(err.message || "Gagal menyimpan perubahan booking");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        title="Booking"
        description="Konfirmasi pesanan, beri catatan, dan lampirkan link Google Drive hasil sesi untuk pelanggan."
        action={
          <Link
            to={worker ? "/worker/booking-baru" : "/admin/bookings/baru"}
            className="btn-primary self-start"
          >
            + Tambah Booking
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                filter === item.id
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 text-gray-600 hover:border-gray-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:items-center">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input sm:w-48"
          >
            <option value="all">Semua Kategori</option>
            {BOOKING_CATEGORIES.map((category) => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ID / pelanggan / paket"
            className="input md:max-w-xs"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4 font-bold">ID</th>
                <th className="px-6 py-4 font-bold">Pelanggan</th>
                <th className="px-6 py-4 font-bold">Kategori</th>
                <th className="px-6 py-4 font-bold">Paket</th>
                <th className="px-6 py-4 font-bold">Jadwal</th>
                <th className="px-6 py-4 font-bold">Status Progress</th>
                <th className="px-6 py-4 font-bold text-right">Nilai</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((booking) => (
                <Fragment key={booking.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {booking.customer}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${bookingCategoryStyle(
                          booking.bookingCategory || booking.booking_category
                        )}`}
                      >
                        {bookingCategoryLabel(
                          booking.bookingCategory || booking.booking_category
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {booking.package}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatShortDate(booking.date)} · {booking.time}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={statusStyle(booking.status) + " badge"}>
                          {statusLabel(booking.status)}
                        </span>
                        {booking.driveUrl && (
                          <span className="badge bg-blue-100 text-blue-700">
                            Drive
                          </span>
                        )}
                      </div>
                      <select
                        value={booking.status}
                        disabled={savingId === booking.id}
                        onChange={(e) =>
                          handleStatus(booking.id, e.target.value)
                        }
                        className="mt-2 w-full border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-gray-900 disabled:opacity-50"
                      >
                        {STATUS_ORDER.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {formatIDR(booking.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!worker && (
                          <button
                            onClick={() => openEdit(booking)}
                            className="border border-gray-300 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-700 transition-colors hover:border-gray-900"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => openManage(booking)}
                          className="border border-gray-900 bg-gray-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-gray-700"
                        >
                          Kelola
                        </button>
                        <button
                          onClick={() =>
                            setExpanded((prev) =>
                              prev === booking.id ? null : booking.id
                            )
                          }
                          className="border border-gray-300 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 transition-colors hover:border-gray-900"
                        >
                          {expanded === booking.id ? "Tutup" : "Detail"}
                        </button>
                        {!worker && (
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="border border-red-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 transition-colors hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === booking.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                          <div>
                            <p className="eyebrow mb-1">Email</p>
                            <p className="text-gray-700">
                              {booking.email || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="eyebrow mb-1">Telepon</p>
                            <p className="text-gray-700">
                              {booking.phone || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="eyebrow mb-1">Kategori Booking</p>
                            <p className="text-gray-700">
                              {bookingCategoryLabel(
                                booking.bookingCategory ||
                                  booking.booking_category
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="eyebrow mb-1">Hasil (Drive)</p>
                            {booking.driveUrl ? (
                              <a
                                href={booking.driveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-blue-600 underline underline-offset-2"
                              >
                                Buka Folder
                              </a>
                            ) : (
                              <p className="text-gray-500">-</p>
                            )}
                          </div>
                          <div className="sm:col-span-3">
                            <p className="eyebrow mb-1">Catatan Pelanggan</p>
                            <p className="text-gray-700">
                              {booking.notes || "-"}
                            </p>
                          </div>
                          <div className="sm:col-span-3">
                            <p className="eyebrow mb-1">Catatan Admin</p>
                            <p className="text-gray-700">
                              {booking.adminNote || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Tidak ada booking pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={Boolean(managing)}
        onClose={() => setManaging(null)}
        title={`Kelola Pesanan${managing ? ` · ${managing.id}` : ""}`}
        footer={
          <>
            <button onClick={() => setManaging(null)} className="btn-outline">
              Batal
            </button>
            <button
              onClick={handleManageSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </>
        }
      >
        {managing && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 border border-gray-100 bg-gray-50 p-4 text-xs sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-1">Pelanggan</p>
                <p className="font-bold text-gray-900">
                  {managing.customer}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-1">Kategori Booking</p>
                <p className="font-bold text-gray-900">
                  {bookingCategoryLabel(
                    managing.bookingCategory || managing.booking_category
                  )}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-1">Paket</p>
                <p className="font-bold text-gray-900">{managing.package}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Jadwal</p>
                <p className="font-bold text-gray-900">
                  {formatShortDate(managing.date)} · {managing.time}
                </p>
              </div>
              <div>
                <p className="eyebrow mb-1">Nilai</p>
                <p className="font-bold text-gray-900">
                  {formatIDR(managing.amount)}
                </p>
              </div>
            </div>

            {!worker && (
              <div className="border border-gray-200 bg-white p-4">
                <p className="eyebrow mb-2">Sinkronisasi Pembayaran Midtrans</p>
                <button
                  type="button"
                  onClick={() => checkPayment(managing.id)}
                  disabled={syncing}
                  className="btn-outline text-xs disabled:opacity-50"
                >
                  {syncing ? "Memeriksa..." : "Cek Status Pembayaran"}
                </button>
                {syncNote && (
                  <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                    {syncNote}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                  Menarik status terbaru langsung dari Midtrans bila webhook
                  belum masuk.
                </p>
              </div>
            )}

            <div className="border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="eyebrow">Progres Produksi</p>
                <span
                  className={`badge ${productionStageStyle(
                    managing.productionStage
                  )}`}
                >
                  {productionStageLabel(managing.productionStage)} ·{" "}
                  {managing.productionPercent || 0}%
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Tahapan Produksi</label>
                  <select
                    className="input"
                    value={form.productionStage}
                    onChange={(e) =>
                      update("productionStage", e.target.value)
                    }
                  >
                    {PRODUCTION_STAGES.map((stage) => (
                      <option key={stage.key} value={stage.key}>
                        {stage.label} ({stage.percent}%)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Estimasi Selesai</label>
                  <input
                    type="date"
                    className="input"
                    value={form.estimatedFinish}
                    onChange={(e) =>
                      update("estimatedFinish", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Link Preview Hasil (untuk review klien)</label>
                <input
                  type="url"
                  className="input"
                  value={form.previewUrl}
                  onChange={(e) => update("previewUrl", e.target.value)}
                  placeholder="https://drive.google.com/... atau https://.../preview.jpg"
                />
              </div>
              <div className="mt-4">
                <label className="label">Catatan Progres (opsional)</label>
                <textarea
                  className="input min-h-[80px] resize-y"
                  value={form.productionNote}
                  onChange={(e) => update("productionNote", e.target.value)}
                  placeholder="Contoh: Proses retouch 30 foto, color grading menyusul."
                />
              </div>
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                Perubahan tahapan akan tercatat pada riwayat progres pelanggan
                dan mengirim notifikasi.
              </p>
            </div>

            <div>
              <label className="label">Kategori Booking</label>
              <select
                className="input"
                value={form.bookingCategory}
                onChange={(e) => update("bookingCategory", e.target.value)}
              >
                {BOOKING_CATEGORIES.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                Ubah kategori bila pesanan perlu dipindahkan ke UMKM,
                Corporate, Personal, atau Event.
              </p>
            </div>

            <div>
              <label className="label">Status Pesanan</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                {STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Catatan Admin / Konfirmasi</label>
              <textarea
                className="input min-h-[110px] resize-y"
                value={form.adminNote}
                onChange={(e) => update("adminNote", e.target.value)}
                placeholder="Contoh: Sesi terkonfirmasi. Hasil edit akan dikirim 3-7 hari kerja melalui link Google Drive."
              />
            </div>

            <div>
              <label className="label">Link Google Drive Hasil</label>
              <input
                type="url"
                className="input"
                value={form.driveUrl}
                onChange={(e) => update("driveUrl", e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
              />
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                Link ini akan ditampilkan di halaman progress pesanan pelanggan
                sebagai tombol "Buka Hasil".
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Edit Booking${editing ? ` · ${editing.id}` : ""}`}
        footer={
          <>
            <button onClick={() => setEditing(null)} className="btn-outline">
              Batal
            </button>
            <button
              onClick={handleEditSave}
              disabled={editSaving}
              className="btn-primary"
            >
              {editSaving ? "Menyimpan..." : "Simpan Booking"}
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 border border-gray-100 bg-gray-50 p-4 text-xs sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-1">ID Booking</p>
                <p className="font-mono text-gray-900">{editing.id}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Status Saat Ini</p>
                <span className={`badge ${statusStyle(editing.status)}`}>
                  {statusLabel(editing.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="label">Nama Pelanggan</label>
                <input
                  className="input"
                  value={editForm.customer}
                  onChange={(e) => updateEdit("customer", e.target.value)}
                  placeholder="Nama pelanggan"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={editForm.email}
                  onChange={(e) => updateEdit("email", e.target.value)}
                  placeholder="nama@email.com"
                />
              </div>
              <div>
                <label className="label">No. Telepon</label>
                <input
                  className="input"
                  value={editForm.phone}
                  onChange={(e) => updateEdit("phone", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div>
                <label className="label">Kategori Booking</label>
                <select
                  className="input"
                  value={editForm.bookingCategory}
                  onChange={(e) =>
                    updateEdit("bookingCategory", e.target.value)
                  }
                >
                  {BOOKING_CATEGORIES.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Paket</label>
                <input
                  className="input"
                  value={editForm.package}
                  onChange={(e) => updateEdit("package", e.target.value)}
                  placeholder="Nama paket"
                />
              </div>
              <div>
                <label className="label">Nilai Pesanan (IDR)</label>
                <input
                  type="number"
                  className="input"
                  value={editForm.amount}
                  onChange={(e) => updateEdit("amount", e.target.value)}
                  placeholder="Harga pesanan"
                />
              </div>
              <div>
                <label className="label">Tanggal Sesi</label>
                <input
                  type="date"
                  className="input"
                  value={editForm.date}
                  onChange={(e) => updateEdit("date", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Jam Sesi</label>
                <input
                  className="input"
                  value={editForm.time}
                  onChange={(e) => updateEdit("time", e.target.value)}
                  placeholder="09:00"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Lokasi Sesi</label>
                <input
                  className="input"
                  value={editForm.location}
                  onChange={(e) => updateEdit("location", e.target.value)}
                  placeholder="Studio / alamat lokasi pemotretan"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Catatan Pelanggan</label>
                <textarea
                  className="input min-h-[100px] resize-y"
                  value={editForm.notes}
                  onChange={(e) => updateEdit("notes", e.target.value)}
                  placeholder="Konsep, referensi, atau permintaan khusus"
                />
              </div>

              {editError && (
                <p className="sm:col-span-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {editError}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
