import http, { setToken } from "./http";
import { DEMO_MODE, ENDPOINTS, STORAGE_KEYS } from "../config/api";
import { normalizeUser } from "../utils/auth";

const DEMO_ACCOUNTS = [
  {
    email: "admin@inheartz.test",
    password: "admin123",
    user: {
      id: 1,
      name: "Admin Inheartz",
      email: "admin@inheartz.test",
      role: "admin",
    },
  },
  {
    email: "staff@inheartz.test",
    password: "staff123",
    user: {
      id: 3,
      name: "Staff Produksi",
      email: "staff@inheartz.test",
      role: "production",
    },
  },
  {
    email: "client@inheartz.test",
    password: "client123",
    user: {
      id: 2,
      name: "Client Inheartz",
      email: "client@inheartz.test",
      role: "client",
    },
  },
];

function persistSession(token, user) {
  const safeUser = normalizeUser(user);
  if (!token || !safeUser) {
    const error = new Error("Respons autentikasi tidak valid");
    error.status = 502;
    throw error;
  }
  setToken(token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(safeUser));
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  setToken(null);
  localStorage.removeItem(STORAGE_KEYS.user);
}

function saveLocalOtp(email, code) {
  localStorage.setItem(
    STORAGE_KEYS.registerOtp,
    JSON.stringify({ email, code, expiresAt: Date.now() + 10 * 60 * 1000 })
  );
}

function checkLocalOtp(email, code) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.registerOtp);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return (
      data.email === email &&
      data.code === String(code) &&
      data.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function clearLocalOtp() {
  localStorage.removeItem(STORAGE_KEYS.registerOtp);
}

function demoLogin(email, password) {
  if (!DEMO_MODE) {
    const error = new Error("Mode demo dinonaktifkan. Hubungkan ke backend.");
    error.status = 503;
    throw error;
  }

  const match = DEMO_ACCOUNTS.find(
    (account) =>
      account.email === email && account.password === password
  );
  if (!match) {
    const error = new Error("Email atau password salah");
    error.status = 401;
    throw error;
  }
  const token = `demo.${btoa(email)}.${Date.now()}`;
  persistSession(token, match.user);
  return { token, user: match.user };
}

export const authService = {
  async login(credentials) {
    try {
      const data = await http.post(ENDPOINTS.auth.login, credentials);
      const payload = data?.data ?? data;
      const token =
        payload?.token || payload?.access_token || data?.token || data?.access_token;
      const user = normalizeUser(payload?.user || data?.user || payload);
      persistSession(token, user);
      return { token, user };
    } catch (error) {
      if (
        DEMO_MODE &&
        (error.offline || error.status === 0 || error.status === 404)
      ) {
        return demoLogin(credentials.email, credentials.password);
      }
      throw error;
    }
  },

  async requestRegisterOtp(payload) {
    try {
      return await http.post(ENDPOINTS.auth.registerRequestOtp, payload);
    } catch (error) {
      if (
        DEMO_MODE &&
        (error.offline || error.status === 0 || error.status === 404)
      ) {
        const code = String(Math.floor(Math.random() * 900000) + 100000);
        saveLocalOtp(payload.email, code);
        return {
          message: "Kode OTP telah dikirim (mode demo).",
          phone: payload.phone,
        };
      }
      throw error;
    }
  },

  async register(payload) {
    try {
      const data = await http.post(ENDPOINTS.auth.register, payload);
      const body = data?.data ?? data;
      const token = body?.token || body?.access_token || data?.token;
      const user = normalizeUser(body?.user || data?.user || body || payload);
      if (token) persistSession(token, user);
      return data;
    } catch (error) {
      if (
        DEMO_MODE &&
        (error.offline || error.status === 0 || error.status === 404)
      ) {
        if (!checkLocalOtp(payload.email, payload.otp)) {
          const otpError = new Error("Kode OTP salah atau sudah kedaluwarsa.");
          otpError.status = 422;
          throw otpError;
        }
        clearLocalOtp();
        const demoUser = {
          id: Date.now(),
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: "client",
        };
        persistSession(`demo.${btoa(payload.email)}.${Date.now()}`, demoUser);
        return { user: demoUser };
      }
      throw error;
    }
  },

  async forgotPassword(email) {
    return http.post(ENDPOINTS.auth.forgotPassword, { email });
  },

  async verifyOtp(email, otp) {
    return http.post(ENDPOINTS.auth.verifyOtp, { email, otp });
  },

  async resetPassword(payload) {
    return http.post(ENDPOINTS.auth.resetPassword, payload);
  },

  async me() {
    return http.get(ENDPOINTS.auth.me);
  },

  async logout() {
    try {
      await http.post(ENDPOINTS.auth.logout);
    } catch (error) {
      void error;
    } finally {
      clearSession();
    }
  },
};

export default authService;
