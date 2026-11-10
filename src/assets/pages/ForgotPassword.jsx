import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirm: "",
  });
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.forgotPassword(form.email);
      setPhone(res.phone || "");
      setStep(2);
    } catch (err) {
      setError(err.message || "Gagal mengirim kode OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.verifyOtp(form.email, form.otp);
      setStep(3);
    } catch (err) {
      setError(err.message || "Kode OTP tidak valid");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Konfirmasi password tidak sama");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword({
        email: form.email,
        otp: form.otp,
        password: form.password,
        password_confirmation: form.confirm,
      });
      navigate("/masuk", {
        replace: true,
        state: { message: res.message || "Password berhasil diubah. Silakan masuk." },
      });
    } catch (err) {
      setError(err.message || "Gagal mengubah password");
      setLoading(false);
    }
  };

  const titles = {
    1: "Lupa Password",
    2: "Verifikasi Kode",
    3: "Password Baru",
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
          <p className="eyebrow mb-3 text-gray-300">Pemulihan Akun</p>
          <h2 className="font-display text-4xl font-extrabold uppercase tracking-tighter text-white leading-none">
            Lupa
            <br />
            Password
          </h2>
          <p className="mt-4 max-w-sm text-sm text-gray-300 leading-relaxed">
            Kami akan mengirim kode verifikasi ke WhatsApp Anda untuk mengatur
            ulang password.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="eyebrow mb-3">Langkah {step} dari 3</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold uppercase tracking-tighter">
            {titles[step]}
          </h1>

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="mt-8 space-y-5">
              <div>
                <label className="label">Email Terdaftar</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="nama@email.com"
                />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Kode verifikasi akan dikirim ke nomor WhatsApp yang terdaftar
                pada akun Anda.
              </p>

              {error && (
                <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Mengirim..." : "Kirim Kode"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
              <div>
                <label className="label">Kode OTP</label>
                <input
                  required
                  inputMode="numeric"
                  maxLength={6}
                  className="input tracking-[0.5em] text-center font-mono"
                  value={form.otp}
                  onChange={(e) =>
                    update("otp", e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="000000"
                />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Kode dikirim ke WhatsApp {phone || "terdaftar"} dan berlaku 10
                menit.
              </p>

              {error && (
                <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Memverifikasi..." : "Verifikasi"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="w-full text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900"
              >
                Ganti email
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleReset} className="mt-8 space-y-5">
              <div>
                <label className="label">Password Baru</label>
                <input
                  type="password"
                  required
                  className="input"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="label">Konfirmasi Password</label>
                <input
                  type="password"
                  required
                  className="input"
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Menyimpan..." : "Simpan Password"}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-gray-500">
            Ingat password Anda?{" "}
            <Link
              to="/masuk"
              className="font-bold text-gray-900 underline underline-offset-4"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
