import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import authService from "../services/authService";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const payload = () => ({
    name: form.name,
    email: form.email,
    phone: form.phone,
    password: form.password,
    password_confirmation: form.confirm,
  });

  const handleRequestOtp = async (event) => {
    event?.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Konfirmasi password tidak sama");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    setSending(true);
    try {
      const res = await authService.requestRegisterOtp(payload());
      setMaskedPhone(res.phone || form.phone);
      setStep(2);
    } catch (err) {
      setError(err.message || "Gagal mengirim kode OTP");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    if (form.otp.length < 6) {
      setError("Kode OTP harus 6 digit");
      return;
    }
    try {
      await register({ ...payload(), otp: form.otp });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Kode OTP tidak valid");
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
          alt="Inheartz Studio"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <p className="eyebrow mb-3 text-gray-300">Mulai Bersama Kami</p>
          <h2 className="font-display text-4xl font-extrabold uppercase tracking-tighter text-white leading-none">
            Buat Akun
            <br />
            Inheartz
          </h2>
          <p className="mt-4 max-w-sm text-sm text-gray-300 leading-relaxed">
            Simpan riwayat booking, pembayaran, dan galeri hasil sesi Anda dalam
            satu akun.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="eyebrow mb-3">Langkah {step} dari 2</p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold uppercase tracking-tighter">
            {step === 1 ? "Akun Baru" : "Verifikasi OTP"}
          </h1>

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="mt-8 space-y-5">
              <div>
                <label className="label">Nama Lengkap</label>
                <input
                  required
                  className="input"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Nama Anda"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    required
                    className="input"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="nama@email.com"
                  />
                </div>
                <div>
                  <label className="label">Telepon (WhatsApp)</label>
                  <input
                    required
                    className="input"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Password</label>
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
                  <label className="label">Konfirmasi</label>
                  <input
                    type="password"
                    required
                    className="input"
                    value={form.confirm}
                    onChange={(e) => update("confirm", e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Kode verifikasi akan dikirim ke nomor WhatsApp Anda untuk
                mengaktifkan akun.
              </p>

              {error && (
                <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full"
              >
                {sending ? "Mengirim..." : "Kirim Kode OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerify} className="mt-8 space-y-5">
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
                Kode dikirim ke WhatsApp {maskedPhone || "terdaftar"} dan
                berlaku 10 menit.
              </p>

              {error && (
                <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Memverifikasi..." : "Verifikasi & Daftar"}
              </button>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  className="hover:text-gray-900"
                >
                  Ubah data
                </button>
                <button
                  type="button"
                  disabled={sending}
                  onClick={handleRequestOtp}
                  className="hover:text-gray-900 disabled:opacity-50"
                >
                  {sending ? "Mengirim..." : "Kirim ulang kode"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-sm text-gray-500">
            Sudah punya akun?{" "}
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
