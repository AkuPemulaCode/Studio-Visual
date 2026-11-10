import { useEffect, useState } from "react";
import portfolioService from "../../services/portfolioService";
import AdminPageHeader from "../components/AdminPageHeader";
import Modal from "../components/Modal";
import { formatShortDate } from "../../utils/format";

const EMPTY_FORM = {
  title: "",
  category: "produk",
  date: "",
  img: "",
  description: "",
  published: true,
};

function toForm(item) {
  return {
    title: item.title || "",
    category: item.category || "produk",
    date: item.date || "",
    img: item.img || "",
    description: item.description || "",
    published: item.published ?? true,
  };
}

export default function Portfolios() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    portfolioService.adminList().then((data) => setItems(data || []));

  useEffect(() => {
    let active = true;
    portfolioService.adminList().then((data) => {
      if (active) setItems(data || []);
    });
    return () => {
      active = false;
    };
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setForm(toForm(item));
    setEditingId(item.id);
    setError("");
    setModalOpen(true);
  };

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Judul karya wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim() || "produk",
        date: form.date,
        img: form.img.trim(),
        description: form.description.trim(),
        published: form.published,
      };
      if (editingId) {
        await portfolioService.update(editingId, payload);
      } else {
        await portfolioService.create(payload);
      }
      await load();
      setModalOpen(false);
    } catch (err) {
      setError(err.message || "Gagal menyimpan karya");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    await portfolioService.remove(confirmId);
    setConfirmId(null);
    await load();
  };

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        title="Portofolio"
        description="Kelola galeri karya yang tampil di halaman portofolio publik."
        action={
          <button onClick={openCreate} className="btn-primary self-start">
            + Tambah Karya
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="card overflow-hidden flex flex-col">
            <div className="relative h-48 bg-gray-100">
              {item.img ? (
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-gray-400">
                  Tanpa Gambar
                </div>
              )}
              <span className="absolute left-3 top-3 badge bg-white/90 text-gray-900">
                {item.category}
              </span>
              {item.published === false && (
                <span className="absolute right-3 top-3 badge bg-amber-500 text-white">
                  Draft
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-base font-extrabold uppercase tracking-tight">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-gray-400">
                {formatShortDate(item.date)}
              </p>
              <p className="mt-3 flex-1 text-xs text-gray-500 leading-relaxed line-clamp-3">
                {item.description}
              </p>
              <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => openEdit(item)}
                  className="flex-1 border border-gray-300 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 transition-colors hover:border-gray-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmId(item.id)}
                  className="flex-1 border border-red-200 py-2 text-xs font-bold uppercase tracking-widest text-red-600 transition-colors hover:bg-red-50"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-gray-400">Belum ada karya.</p>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Karya" : "Tambah Karya"}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-outline">
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Judul Karya</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Katalog Fashion Minimalist"
            />
          </div>
          <div>
            <label className="label">Kategori</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="produk">Produk</option>
              <option value="prewedding">Pre-Wedding</option>
              <option value="portrait">Portrait</option>
              <option value="event">Event</option>
              <option value="konten">Konten</option>
            </select>
          </div>
          <div>
            <label className="label">Tanggal</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">URL Gambar</label>
            <input
              className="input"
              value={form.img}
              onChange={(e) => update("img", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Deskripsi</label>
            <textarea
              className="input min-h-[110px] resize-y"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Ceritakan konsep sesi..."
            />
          </div>
          <label className="flex items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => update("published", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-700">
              Tampilkan di halaman publik
            </span>
          </label>

          {error && (
            <p className="sm:col-span-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </Modal>

      <Modal
        open={Boolean(confirmId)}
        onClose={() => setConfirmId(null)}
        title="Hapus Karya"
        footer={
          <>
            <button onClick={() => setConfirmId(null)} className="btn-outline">
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center bg-red-600 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700"
            >
              Hapus
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          Karya ini akan dihapus dari galeri portofolio publik.
        </p>
      </Modal>
    </div>
  );
}
