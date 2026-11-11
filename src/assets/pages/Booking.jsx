import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import packageService from "../services/packageService";
import bookingService from "../services/bookingService";
import {
  packages as mockPackages,
  packageSegments,
  timeSlots,
} from "../data/mock";
import { useAuth } from "../context/authContext";
import {
  BOOKING_CATEGORIES,
  bookingCategoryLabel,
  formatIDR,
} from "../utils/format";

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const STEPS = ["Kategori", "Paket", "Jadwal", "Data", "Konfirmasi"];

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

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [packages, setPackages] = useState(mockPackages);
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState(timeSlots);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = startOfDay(new Date());

  useEffect(() => {
    let active = true;
    packageService.list().then((list) => {
      if (!active) return;
      setPackages(list);
      const slug = searchParams.get("paket");
      if (slug) {
        const found = list.find((item) => item.slug === slug);
        if (found) {
          setSelectedPackage(found);
          setSelectedCategory(segmentsOf(found)[0] || "personal");
          setStep(2);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [searchParams]);

  useEffect(() => {
    if (!selectedDate) return;
    let active = true;
    bookingService.availability(selectedDate).then((result) => {
      if (active) {
        setSlots(result.length ? result : timeSlots);
        setSelectedTime("");
      }
    });
    return () => {
      active = false;
    };
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [viewMonth]);

  const monthLabel = viewMonth.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const categoryPackages = useMemo(() => {
    if (!selectedCategory) return packages;
    const filtered = packages.filter((item) =>
      matchesCategory(item, selectedCategory)
    );
    return filtered.length ? filtered : packages;
  }, [packages, selectedCategory]);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    if (selectedPackage && !matchesCategory(selectedPackage, category)) {
      setSelectedPackage(null);
    }
  };

  const canContinue =
    (step === 0 && selectedCategory) ||
    (step === 1 && selectedPackage) ||
    (step === 2 && selectedDate && selectedTime) ||
    (step === 3 && form.name && form.phone && form.email) ||
    step === 4;

  const handleNext = () => {
    if (step < 4 && canContinue) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        booking_category: selectedCategory,
        package_id: selectedPackage.id,
        package_name: selectedPackage.name,
        price: selectedPackage.price,
        date: selectedDate,
        time: selectedTime,
        name: form.name,
        email: form.email,
        phone: form.phone,
        notes: form.notes,
      };
      const booking = await bookingService.create(payload);
      bookingService.saveDraft(payload);
      navigate(`/pembayaran?booking=${encodeURIComponent(booking.id)}`);
    } catch (err) {
      setError(err.message || "Gagal membuat booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white text-gray-900">
      <section className="border-b border-gray-300 bg-gray-50">
        <div className="container-editorial py-12 md:py-16">
          <p className="eyebrow mb-3">Jadwal & Booking</p>
          <h1 className="section-title">Pesan Sesi Anda</h1>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-gray-500 leading-relaxed">
            Ikuti lima langkah mudah untuk memesan sesi di Inheartz Studio.
            Pilih kategori, paket, atur jadwal, lengkapi data, lalu konfirmasi.
          </p>
        </div>
      </section>

      <section className="border-b border-gray-300">
        <div className="container-editorial">
          <ol className="grid grid-cols-5 divide-x divide-gray-200 border-x border-gray-200">
            {STEPS.map((label, index) => (
              <li
                key={label}
                className={`flex flex-col items-center gap-1 py-5 text-center ${
                  index <= step ? "bg-white" : "bg-gray-50"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center text-xs font-bold ${
                    index <= step
                      ? "bg-gray-900 text-white"
                      : "border border-gray-300 text-gray-400"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-[9px] md:text-xs font-bold uppercase tracking-widest ${
                    index <= step ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-editorial py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {step === 0 && (
              <div className="animate-fade-in">
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight mb-2">
                  Pilih Kategori Booking
                </h2>
                <p className="mb-6 text-sm text-gray-500 leading-relaxed">
                  Pilih kategori yang paling sesuai agar paket yang tampil
                  relevan dengan kebutuhan Anda.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {BOOKING_CATEGORIES.map((category) => {
                    const active = selectedCategory === category.key;
                    return (
                      <button
                        key={category.key}
                        type="button"
                        onClick={() => handleSelectCategory(category.key)}
                        className={`card p-5 text-left transition-all ${
                          active
                            ? "border-gray-900 ring-1 ring-gray-900"
                            : "hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="eyebrow">Kategori</span>
                          {active && (
                            <span className="badge bg-gray-900 text-white">
                              Dipilih
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 font-display text-lg font-extrabold uppercase tracking-tight">
                          {category.label}
                        </h3>
                        <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                          {category.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="animate-fade-in">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                      Pilih Paket
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Kategori: {bookingCategoryLabel(selectedCategory)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs font-bold uppercase tracking-widest text-gray-900 underline underline-offset-4"
                  >
                    Ubah kategori
                  </button>
                </div>

                <div className="card mb-6 grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                  <div>
                    <label className="label">Kategori Harga &amp; Paket</label>
                    <select
                      className="input"
                      value={selectedCategory}
                      onChange={(e) => handleSelectCategory(e.target.value)}
                    >
                      <option value="" disabled>
                        -- Pilih kategori --
                      </option>
                      {BOOKING_CATEGORIES.map((category) => (
                        <option key={category.key} value={category.key}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Paket &amp; Harga</label>
                    <select
                      className="input"
                      value={selectedPackage ? String(selectedPackage.id) : ""}
                      onChange={(e) => {
                        const found = categoryPackages.find(
                          (item) => String(item.id) === e.target.value
                        );
                        setSelectedPackage(found || null);
                      }}
                    >
                      <option value="">-- Pilih paket --</option>
                      {categoryPackages.map((item) => (
                        <option key={item.id} value={String(item.id)}>
                          {item.name} — {formatIDR(item.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categoryPackages.map((item) => {
                    const active = selectedPackage?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedPackage(item)}
                        className={`card p-5 text-left transition-all ${
                          active
                            ? "border-gray-900 ring-1 ring-gray-900"
                            : "hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="eyebrow">{item.category}</span>
                          {active && (
                            <span className="badge bg-gray-900 text-white">
                              Dipilih
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 font-display text-lg font-extrabold uppercase tracking-tight">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.duration} · {item.photos}
                        </p>
                        <p className="mt-3 font-extrabold text-lg">
                          {formatIDR(item.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight mb-6">
                  Pilih Tanggal & Jam
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() =>
                          setViewMonth(
                            new Date(
                              viewMonth.getFullYear(),
                              viewMonth.getMonth() - 1,
                              1
                            )
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center border border-gray-300 hover:bg-gray-900 hover:text-white transition-colors"
                        aria-label="Bulan sebelumnya"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="font-display text-sm font-extrabold uppercase tracking-widest">
                        {monthLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setViewMonth(
                            new Date(
                              viewMonth.getFullYear(),
                              viewMonth.getMonth() + 1,
                              1
                            )
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center border border-gray-300 hover:bg-gray-900 hover:text-white transition-colors"
                        aria-label="Bulan berikutnya"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {WEEKDAYS.map((day) => (
                        <span
                          key={day}
                          className="py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                        >
                          {day}
                        </span>
                      ))}
                      {calendarDays.map((date, index) => {
                        if (!date) return <span key={`empty-${index}`} />;
                        const past = date < today;
                        const active = selectedDate && isSameDay(date, new Date(selectedDate));
                        return (
                          <button
                            key={date.toISOString()}
                            type="button"
                            disabled={past}
                            onClick={() => setSelectedDate(toIsoDate(date))}
                            className={`aspect-square text-sm transition-colors ${
                              active
                                ? "bg-gray-900 text-white font-bold"
                                : past
                                ? "text-gray-300 cursor-not-allowed"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="card p-5">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                      Jam Tersedia
                    </h3>
                    {!selectedDate ? (
                      <p className="text-sm text-gray-400">
                        Pilih tanggal terlebih dahulu untuk melihat jam yang
                        tersedia.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`border py-3 text-sm transition-colors ${
                              selectedTime === slot
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-300 text-gray-700 hover:border-gray-900"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight mb-6">
                  Data Pemesan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Nama Lengkap</label>
                    <input
                      className="input"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="Nama Anda"
                    />
                  </div>
                  <div>
                    <label className="label">Nomor Telepon</label>
                    <input
                      className="input"
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      className="input"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      placeholder="nama@email.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Catatan</label>
                    <textarea
                      className="input min-h-[120px] resize-y"
                      value={form.notes}
                      onChange={(e) => updateForm("notes", e.target.value)}
                      placeholder="Konsep, referensi, atau permintaan khusus"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-fade-in">
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight mb-6">
                  Konfirmasi Booking
                </h2>
                <div className="card divide-y divide-gray-200">
                  <div className="flex items-center justify-between p-5">
                    <span className="text-sm text-gray-500">Kategori</span>
                    <span className="text-sm font-bold text-gray-900">
                      {bookingCategoryLabel(selectedCategory)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <span className="text-sm text-gray-500">Paket</span>
                    <span className="text-sm font-bold text-gray-900">
                      {selectedPackage?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <span className="text-sm text-gray-500">Jadwal</span>
                    <span className="text-sm font-bold text-gray-900">
                      {selectedDate} · {selectedTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <span className="text-sm text-gray-500">Nama</span>
                    <span className="text-sm font-bold text-gray-900">
                      {form.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <span className="text-sm text-gray-500">Kontak</span>
                    <span className="text-sm font-bold text-gray-900">
                      {form.phone} · {form.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-gray-50">
                    <span className="text-sm font-bold uppercase tracking-widest text-gray-500">
                      Total
                    </span>
                    <span className="font-display text-xl font-extrabold">
                      {formatIDR(selectedPackage?.price)}
                    </span>
                  </div>
                </div>

                {error && (
                  <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                disabled={step === 0}
                className="btn-outline disabled:opacity-40"
              >
                Kembali
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="btn-primary"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? "Memproses..." : "Konfirmasi & Bayar"}
                </button>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="card sticky top-28 p-6">
              <h3 className="font-display text-lg font-extrabold uppercase tracking-tight mb-4">
                Ringkasan
              </h3>
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Kategori</dt>
                  <dd className="text-right font-bold text-gray-900">
                    {selectedCategory
                      ? bookingCategoryLabel(selectedCategory)
                      : "-"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Paket</dt>
                  <dd className="text-right font-bold text-gray-900">
                    {selectedPackage?.name || "-"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Tanggal</dt>
                  <dd className="text-right font-bold text-gray-900">
                    {selectedDate || "-"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Jam</dt>
                  <dd className="text-right font-bold text-gray-900">
                    {selectedTime || "-"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-200 pt-4">
                  <dt className="font-bold uppercase tracking-widest text-gray-500">
                    Total
                  </dt>
                  <dd className="text-right font-display text-lg font-extrabold">
                    {selectedPackage ? formatIDR(selectedPackage.price) : "-"}
                  </dd>
                </div>
              </dl>
              <p className="mt-6 text-xs text-gray-400 leading-relaxed">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan layanan
                Inheartz Studio.
              </p>
              {!user && (
                <Link
                  to="/masuk"
                  className="mt-4 block text-xs font-bold uppercase tracking-widest text-gray-900 underline underline-offset-4"
                >
                  Masuk untuk mengisi data otomatis
                </Link>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
