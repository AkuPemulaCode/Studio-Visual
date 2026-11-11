import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import packageService from "../../services/packageService";
import adminService from "../../services/adminService";
import AdminPageHeader from "../components/AdminPageHeader";
import { timeSlots, packageSegments } from "../../data/mock";
import {
  BOOKING_CATEGORIES,
  formatIDR,
  STATUS_ORDER,
  statusLabel,
} from "../../utils/format";

const EMPTY_FORM = {
  bookingCategory: "personal",
  packageId: "",
  name: "",
  email: "",
  phone: "",
  date: "",
  time: "",
  location: "",
  notes: "",
  amount: "",
  status: "awaiting_payment",
};

function segmentsOf(item) {
  if (!item) return [];
  return Array.isArray(item.segments)
    ? item.segments
    : packageSegments[item.slug] || [];
}

function matchesCategory(item, category) {
  const segments = segmentsOf(item);
  return segments.length === 0 || segments.includes(category);
}

export default function BookingCreate({ worker = false }) {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    packageService.list().then((list) => {
      if (active) setPackages(list || []);
    });
    return () => {
      active = false;
    };
  }, []);

  const categoryPackages = useMemo(() => {
    const filtered = packages.filter((item) =>
      matchesCategory(item, form.bookingCategory)
    );
    return filtered.length ? filtered : packages;
  }, [packages, form.bookingCategory]);

  const selectedPackage = useMemo(
    () =>
      packages.find((item) => String(item.id) === String(form.packageId)) ||
      null,
    [packages, form.packageId]
  );

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSelectCategory = (value) => {
    setForm((prev) => ({
      ...prev,
      bookingCategory: value,
      packageId: "",
    }));
  };

  const handleSelectPackage = (value) => {
    const found = packages.find(
      (item) => String(item.id) === String(value)
    );
    setForm((prev) => ({
      ...prev,
      packageId: value,
      amount: found ? String(found.price ?? "") : prev.amount,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Nama, email, dan nomor telepon wajib diisi.");
      return;
    }
    if (!selectedPackage) {
      setError("Pilih paket terlebih dahulu.");
      return;
    }
    if (!form.date || !form.time) {
      setError("Tanggal dan jam sesi wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        booking_category: form.bookingCategory,
        package_id: selectedPackage.id,
        package_name: selectedPackage.name,
        price: Number(form.amount) || Number(selectedPackage.price) || 0,
        date: form.date,
        time: form.time,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        notes: form.notes,
        status: worker ? "awaiting_payment" : form.status,
      };
      await adminService.createBooking(payload);
      navigate(worker ? "/worker/bookings" : "/admin/bookings");
    } catch (err) {
      setError(err.message || "Gagal membuat booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        title="Tambah Booking"
        description="Buat pesanan baru secara manual untuk pelanggan, baik yang dipesan via WhatsApp, telepon, maupun walk-in."
        action={
          <Link
            to={worker ? "/worker/bookings" : "/admin/bookings"}
            className="btn-outline self-start"
          >
            Kembali ke Daftar Booking
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="card max-w-3xl p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Kategori Booking</label>
            <select
              className="input"
              value={form.bookingCategory}
              onChange={(e) => handleSelectCategory(e.target.value)}
            >
              {BOOKING_CATEGORIES.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              Pilih salah satu dari 4 kategori: UMKM, Corporate, Personal,
              atau Event.
            </p>
          </div>
          <div>
            <label className="label">Paket &amp; Harga</label>
            <select
              className="input"
              value={form.packageId}
              onChange={(e) => handleSelectPackage(e.target.value)}
            >
              <option value="">-- Pilih paket --</option>
              {categoryPackages.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name} — {formatIDR(item.price)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Nama Pelanggan</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Nama pelanggan"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="label">No. Telepon</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div>
            <label className="label">Nilai Pesanan (IDR)</label>
            <input
              type="number"
              className="input"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder="Otomatis dari paket"
            />
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              Terisi otomatis dari harga paket, tetap bisa disesuaikan.
            </p>
          </div>
          <div>
            <label className="label">Tanggal Sesi</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Jam Sesi</label>
            <select
              className="input"
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
            >
              <option value="">-- Pilih jam --</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Lokasi Sesi (opsional)</label>
            <input
              className="input"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Studio / alamat lokasi pemotretan"
            />
          </div>

          {!worker && (
            <div>
              <label className="label">Status Awal</label>
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
          )}

          <div className="sm:col-span-2">
            <label className="label">Catatan (opsional)</label>
            <textarea
              className="input min-h-[110px] resize-y"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Konsep, referensi, atau permintaan khusus pelanggan"
            />
          </div>

          {error && (
            <p className="sm:col-span-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <Link
            to={worker ? "/worker/bookings" : "/admin/bookings"}
            className="btn-outline"
          >
            Batal
          </Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Menyimpan..." : "Simpan Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
