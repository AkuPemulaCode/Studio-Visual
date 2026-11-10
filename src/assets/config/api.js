export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export const DEMO_MODE =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO === "true";

export const STORAGE_KEYS = {
  token: "inheartz_token",
  user: "inheartz_user",
  bookingDraft: "inheartz_booking_draft",
  registerOtp: "inheartz_register_otp",
};

export const ENDPOINTS = {
  auth: {
    login: "/login",
    register: "/register",
    registerRequestOtp: "/register/request-otp",
    logout: "/logout",
    me: "/me",
    forgotPassword: "/forgot-password",
    verifyOtp: "/verify-otp",
    resetPassword: "/reset-password",
  },
  packages: "/packages",
  categories: "/categories",
  portfolios: "/portfolios",
  bookings: "/bookings",
  bookingProgress: "/bookings", // + /{id}/progress
  production: "/production",
  availability: "/availability",
  paymentMethods: "/payment-methods",
  payments: "/payments",
  paymentProof: "/payments/proof",
  paymentMidtransCharge: "/payments/midtrans/charge",
  paymentMidtransSync: "/payments/midtrans/sync",
  paymentMidtransStatus: "/payments/midtrans/status",
  contact: "/contact",
  notifications: "/notifications",
  recommendations: "/recommendations",
  admin: {
    stats: "/admin/stats",
    bookings: "/admin/bookings",
    users: "/admin/users",
    customers: "/admin/customers",
    revenue: "/admin/revenue",
    monitoring: "/admin/monitoring",
    finance: "/admin/finance",
    production: "/admin/production",
    workers: "/admin/workers",
    assignBooking: "/admin/bookings",
    auditLogs: "/admin/audit-logs",
  },
};

export const APP_NAME = "Inheartz Studio";
