import { useEffect, useState } from "react";
import packageService from "../../services/packageService";
import AdminPageHeader from "../components/AdminPageHeader";
import Modal from "../components/Modal";
import { formatIDR } from "../../utils/format";

const EMPTY_FORM = {
  name: "",
  slug: "",
  category: "",
  price: "",
  duration: "",
  photos: "",
  unit: "sesi",
  description: "",
  features: "",
};

function toForm(item) {
  return {
    name: item.name || "",
    slug: item.slug || "",
    category: item.category || "",
    price: String(item.price ?? ""),
    duration: item.duration || "",
    photos: item.photos || "",
    unit: item.unit || "sesi",
    description: item.description || "",
    features: (item.features || []).join("\n"),
  };
}

function toPayload(form) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    category: form.category.trim() || "umum",
    price: Number(form.price) || 0,
    duration: form.duration.trim(),
    photos: form.photos.trim(),
    unit: form.unit.trim() || "sesi",
    description: form.description.trim(),
    features: form.features
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    packageService.list().then((data) => setPackages(data || []));

  useEffect(() => {
    let active = true;
    packageService.list().then((data) => {
      if (active) setPackages(data || []);
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
    if (!form.name.trim() || !form.price) {
      setError("Nama dan harga paket wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = toPayload(form);
      if (editingId) {
        await packageService.update(editingId, payload);
      } else {
        await packageService.create(payload);
      }
      await load();
      setModalOpen(false);
    } catch (err) {
      setError(err.message || "Gagal menyimpan paket");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    await packageService.remove(confirmId);
    setConfirmId(null);
    await load();
  };

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        title="Paket"
        description="Tambah, ubah, dan hapus paket layanan yang ditampilkan di halaman publik."
        action={
          <button onClick={openCreate} className="btn-primary self-start">
            + Tambah Paket
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((item) => (
          <div key={item.id} className="card p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{item.category}</span>
            </div>
            <h3 className="mt-3 font-display text-lg font-extrabold uppercase tracking-tight">
              {item.name}
            </h3>
            <p className="mt-2 text-xs text-gray-500">
              {item.duration} · {item.photos}
            </p>
            <p className="mt-4 font-display text-xl font-extrabold">
              {formatIDR(item.price)}
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-xs text-gray-500">
              {(item.features || []).map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 flex-shrink-0 bg-gray-400" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-2 border-t border-gray-100 pt-4">
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
        ))}
        {packages.length === 0 && (
          <p className="text-sm text-gray-400">Belum ada paket.</p>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Paket" : "Tambah Paket"}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="btn-outline"
            >
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
            <label className="label">Nama Paket</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Product Photography"
            />
          </div>
          <div>
            <label className="label">Kategori</label>
            <input
              className="input"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="produk"
            />
          </div>
          <div>
            <label className="label">Harga (IDR)</label>
            <input
              type="number"
              className="input"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="499000"
            />
          </div>
          <div>
            <label className="label">Durasi</label>
            <input
              className="input"
              value={form.duration}
              onChange={(e) => update("duration", e.target.value)}
              placeholder="2 Jam"
            />
          </div>
          <div>
            <label className="label">Hasil Foto</label>
            <input
              className="input"
              value={form.photos}
              onChange={(e) => update("photos", e.target.value)}
              placeholder="20 Foto Edit"
            />
          </div>
          <div>
            <label className="label">Satuan</label>
            <input
              className="input"
              value={form.unit}
              onChange={(e) => update("unit", e.target.value)}
              placeholder="sesi"
            />
          </div>
          <div>
            <label className="label">Slug (opsional)</label>
            <input
              className="input"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="otomatis dari nama"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Deskripsi</label>
            <textarea
              className="input min-h-[90px] resize-y"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Deskripsi singkat paket..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Fitur (satu per baris)</label>
            <textarea
              className="input min-h-[110px] resize-y"
              value={form.features}
              onChange={(e) => update("features", e.target.value)}
              placeholder={"Studio & lighting profesional\n20 foto final retouch"}
            />
          </div>
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
        title="Hapus Paket"
        footer={
          <>
            <button
              onClick={() => setConfirmId(null)}
              className="btn-outline"
            >
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
          Paket ini akan dihapus dari daftar layanan publik. Tindakan ini tidak
          dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
}
