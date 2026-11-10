import { useEffect, useMemo, useState } from "react";
import adminService from "../../services/adminService";
import AdminPageHeader from "../components/AdminPageHeader";
import Modal from "../components/Modal";
import { useAuth } from "../../context/authContext";
import { formatShortDate, ROLE_LABELS } from "../../utils/format";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  role: "production",
  password: "",
  password_confirmation: "",
};

const ROLE_OPTIONS = [
  { value: "production", label: "Pekerja Produksi" },
  { value: "admin", label: "Admin" },
  { value: "client", label: "Client" },
];

function toForm(item) {
  return {
    name: item.name || "",
    email: item.email || "",
    phone: item.phone || "",
    role: item.role || "production",
    password: "",
    password_confirmation: "",
  };
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    adminService.users().then((data) => setUsers(data || []));

  useEffect(() => {
    let active = true;
    adminService.users().then((data) => {
      if (active) setUsers(data || []);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.role?.toLowerCase().includes(keyword)
    );
  }, [users, query]);

  const roleBadge = (role) => {
    if (role === "superadmin" || role === "admin") return "bg-gray-900 text-white";
    if (role === "production" || role === "staff") return "bg-emerald-600 text-white";
    return "bg-gray-100 text-gray-700";
  };

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

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }
    if (!editingId && !form.password) {
      setError("Password wajib diisi untuk akun baru.");
      return;
    }
    if (form.password && form.password !== form.password_confirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
      };
      if (form.password) {
        payload.password = form.password;
        payload.password_confirmation = form.password_confirmation;
      }

      if (editingId) {
        await adminService.updateUser(editingId, payload);
      } else {
        await adminService.createUser(payload);
      }
      await load();
      setModalOpen(false);
    } catch (err) {
      const firstError =
        err.errors && Object.values(err.errors)[0]?.[0];
      setError(firstError || err.message || "Gagal menyimpan user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await adminService.removeUser(confirmId);
      setConfirmId(null);
      await load();
    } catch (err) {
      setConfirmId(null);
      setError(err.message || "Gagal menghapus user");
    }
  };

  return (
    <div className="animate-fade-in">
      <AdminPageHeader
        title="User"
        description="Kelola akun admin dan pekerja produksi. Pekerja hanya bisa mengakses dashboard produksi."
        action={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari user"
              className="input sm:max-w-xs"
            />
            <button onClick={openCreate} className="btn-primary self-start">
              + Tambah User
            </button>
          </div>
        }
      />

      {error && !modalOpen && (
        <p className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4 font-bold">Nama</th>
                <th className="px-6 py-4 font-bold">Kontak</th>
                <th className="px-6 py-4 font-bold">Peran</th>
                <th className="px-6 py-4 font-bold">Jumlah Booking</th>
                <th className="px-6 py-4 font-bold">Terdaftar</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((user) => {
                const isSelf = String(user.id) === String(currentUser?.id);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {user.name}
                      {isSelf && (
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          (Anda)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="block">{user.email || "-"}</span>
                      <span className="block text-xs text-gray-400">
                        {user.phone || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest ${roleBadge(
                          user.role
                        )}`}
                      >
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.bookings ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.createdAt ? formatShortDate(user.createdAt) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="border border-gray-300 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-700 transition-colors hover:border-gray-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmId(user.id)}
                          disabled={isSelf}
                          className="border border-red-200 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Belum ada user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit User" : "Tambah User"}
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
            <label className="label">Nama Lengkap</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Nama user"
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
            <label className="label">No. Telepon (WhatsApp)</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="0812xxxxxxx"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Peran</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">
              Pekerja produksi hanya bisa masuk ke dashboard produksi untuk
              memperbarui tahapan pengerjaan pesanan.
            </p>
          </div>
          <div>
            <label className="label">
              Password {editingId && "(kosongkan jika tidak diubah)"}
            </label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div>
            <label className="label">Konfirmasi Password</label>
            <input
              type="password"
              className="input"
              value={form.password_confirmation}
              onChange={(e) => update("password_confirmation", e.target.value)}
              placeholder="Ulangi password"
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
        title="Hapus User"
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
          Akun ini akan dihapus permanen dan tidak bisa masuk lagi. Tindakan ini
          tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
}
