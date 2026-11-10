import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { DEMO_MODE } from "../config/api";
import { resolvePostLoginPath } from "../utils/auth";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "";
  const flash = location.state?.message;

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const session = await login(form);
      navigate(resolvePostLoginPath(session.user?.role, redirectTo), {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Gagal masuk");
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2064&auto=format&fit=crop"
          alt="Inheartz Studio"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <p className="eyebrow mb-3 text-gray-300">Inheartz Studio</p>
          <h2 className="font-display text-4xl font-extrabold uppercase tracking-tighter text-white leading-none">
            Kelola Booking
            <br />
            Anda
          </h2>
          <p className="mt-4 max-w-sm text-sm text-gray-300 leading-relaxed">
            Masuk untuk memantau jadwal, status pembayaran, dan hasil sesi Anda
            dalam satu dashboard.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="eyebrow mb-3">Selamat Datang</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold uppercase tracking-tighter">
            Masuk Akun
          </h1>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="input"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="label">Password</label>
                <Link
                  to="/lupa-password"
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900"
                >
                  Lupa?
                </Link>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="input"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {flash && !error && (
              <p className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {flash}
              </p>
            )}

            {error && (
              <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {DEMO_MODE && (
            <div className="mt-6 border border-dashed border-gray-300 bg-gray-50 p-4 text-xs text-gray-500 leading-relaxed">
              <p className="font-bold uppercase tracking-widest text-gray-400 mb-2">
                Akun Demo
              </p>
              <p>Admin — admin@inheartz.test / admin123</p>
              <p>Produksi — staff@inheartz.test / staff123</p>
              <p>Client — client@inheartz.test / client123</p>
            </div>
          )}

          <p className="mt-6 text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link
              to="/daftar"
              className="font-bold text-gray-900 underline underline-offset-4"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
