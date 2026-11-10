export function formatIDR(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

export function formatDate(value, options) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(
    "id-ID",
    options || { year: "numeric", month: "long", day: "numeric" }
  );
}

export function formatShortDate(value) {
  return formatDate(value, { day: "2-digit", month: "short", year: "numeric" });
}

export const STATUS_LABELS = {
  pending: "Menunggu",
  awaiting_payment: "Menunggu Pembayaran",
  paid: "Dibayar",
  confirmed: "Terkonfirmasi",
  ongoing: "Berlangsung",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  awaiting_payment: "bg-orange-100 text-orange-800",
  paid: "bg-blue-100 text-blue-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  ongoing: "bg-indigo-100 text-indigo-800",
  completed: "bg-gray-200 text-gray-800",
  cancelled: "bg-red-100 text-red-700",
};

export const STATUS_ORDER = [
  "pending",
  "awaiting_payment",
  "paid",
  "confirmed",
  "ongoing",
  "completed",
  "cancelled",
];

export const PROGRESS_STAGES = [
  { key: "awaiting_payment", label: "Menunggu Pembayaran" },
  { key: "confirmed", label: "Dikonfirmasi" },
  { key: "ongoing", label: "Sesi Berlangsung" },
  { key: "completed", label: "Selesai" },
];

const STAGE_INDEX = {
  pending: 0,
  awaiting_payment: 0,
  paid: 1,
  confirmed: 1,
  ongoing: 2,
  completed: 3,
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function statusStyle(status) {
  return STATUS_STYLES[status] || "bg-gray-100 text-gray-700";
}

export function stageIndex(status) {
  return STAGE_INDEX[status] ?? 0;
}

export function isCancelled(status) {
  return status === "cancelled";
}

export const PRODUCTION_STAGES = [
  { key: "queued", label: "Antrean Produksi", percent: 0 },
  { key: "transfer", label: "Transfer File", percent: 15 },
  { key: "culling", label: "Seleksi & Sortir", percent: 35 },
  { key: "editing", label: "Editing & Retouch", percent: 60 },
  { key: "review", label: "Review Klien", percent: 80 },
  { key: "revision", label: "Revisi", percent: 90 },
  { key: "delivered", label: "Hasil Dikirim", percent: 100 },
];

export const PRODUCTION_STATUSES = ["paid", "confirmed", "ongoing", "completed"];

export const PRODUCTION_STAGE_STYLES = {
  queued: "bg-gray-200 text-gray-700",
  transfer: "bg-sky-100 text-sky-800",
  culling: "bg-cyan-100 text-cyan-800",
  editing: "bg-indigo-100 text-indigo-800",
  review: "bg-violet-100 text-violet-800",
  revision: "bg-amber-100 text-amber-800",
  delivered: "bg-emerald-100 text-emerald-800",
};

export function productionStageIndex(stage) {
  const index = PRODUCTION_STAGES.findIndex((item) => item.key === stage);
  return index === -1 ? 0 : index;
}

export function productionStageLabel(stage) {
  return (
    PRODUCTION_STAGES.find((item) => item.key === stage)?.label ||
    "Antrean Produksi"
  );
}

export function productionPercent(stage) {
  return PRODUCTION_STAGES.find((item) => item.key === stage)?.percent ?? 0;
}

export function productionStageStyle(stage) {
  return PRODUCTION_STAGE_STYLES[stage] || "bg-gray-100 text-gray-700";
}

export function isInProduction(status) {
  return PRODUCTION_STATUSES.includes(status);
}

export const ROLE_LABELS = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  staff: 'Staff',
  production: 'Produksi',
  client: 'Client',
};
