import {
  packages as seedPackages,
  portfolios as seedPortfolios,
  monitoring,
} from "./mock";
import { productionPercent } from "../utils/format";

const STORE_VERSION = "v5";

const KEYS = {
  bookings: `inheartz_store_${STORE_VERSION}_bookings`,
  packages: `inheartz_store_${STORE_VERSION}_packages`,
  portfolios: `inheartz_store_${STORE_VERSION}_portfolios`,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readCollection(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return clone(seed);
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : clone(seed);
  } catch {
    return clone(seed);
  }
}

function writeCollection(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
  return list;
}

function nextId(list) {
  return (
    list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
  );
}

function generateBookingCode() {
  const year = new Date().getFullYear();
  const serial = String(Math.floor(Math.random() * 9000) + 1000);
  return `INH-${year}-${serial}`;
}

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePackage(payload = {}, base = {}) {
  const name = payload.name ?? base.name ?? "Paket Baru";
  return {
    id: base.id ?? payload.id,
    slug: payload.slug || base.slug || toSlug(name),
    name,
    category: payload.category ?? base.category ?? "umum",
    price: Number(payload.price ?? base.price ?? 0) || 0,
    duration: payload.duration ?? base.duration ?? "-",
    photos: payload.photos ?? base.photos ?? "-",
    unit: payload.unit ?? base.unit ?? "sesi",
    description: payload.description ?? base.description ?? "",
    features: Array.isArray(payload.features)
      ? payload.features
      : base.features || [],
  };
}

function normalizePortfolio(payload = {}, base = {}) {
  const title = payload.title ?? base.title ?? "Karya Baru";
  return {
    id: base.id ?? payload.id,
    title,
    slug: payload.slug || base.slug || toSlug(title),
    date: payload.date ?? base.date ?? "",
    category: payload.category ?? base.category ?? "produk",
    img: payload.img ?? base.img ?? "",
    description: payload.description ?? base.description ?? "",
    published: Boolean(payload.published ?? base.published ?? true),
  };
}

export const store = {
  bookings: {
    all() {
      return readCollection(KEYS.bookings, monitoring.bookings);
    },
    find(id) {
      return this.all().find((item) => item.id === id) || null;
    },
    mine(email) {
      const list = this.all();
      if (!email) return list;
      const target = String(email).toLowerCase();
      return list.filter(
        (item) => String(item.email || "").toLowerCase() === target
      );
    },
    create(payload = {}) {
      const list = this.all();
      const booking = {
        id: payload.id || generateBookingCode(),
        customer: payload.name || payload.customer || "Guest",
        email: payload.email || payload.customerEmail || "",
        phone: payload.phone || "",
        packageId: payload.package_id ?? payload.packageId ?? null,
        package: payload.package_name || payload.package || "Paket Layanan",
        date: payload.date || payload.booking_date || "",
        time: payload.time || payload.booking_time || "",
        location: payload.location || "",
        notes: payload.notes || "",
        status: payload.status || "awaiting_payment",
        adminNote: payload.adminNote || "",
        driveUrl: payload.driveUrl || "",
        previewUrl: payload.previewUrl || "",
        reviewStatus: payload.reviewStatus || null,
        revisionCount: Number(payload.revisionCount) || 0,
        productionStage: payload.productionStage || "queued",
        productionPercent: Number(payload.productionPercent) || 0,
        estimatedFinish: payload.estimatedFinish || null,
        progress: Array.isArray(payload.progress) ? payload.progress : [],
        amount: Number(payload.price ?? payload.amount) || 0,
        createdAt: payload.createdAt || new Date().toISOString(),
      };
      list.unshift(booking);
      writeCollection(KEYS.bookings, list);
      return booking;
    },
    update(id, patch = {}) {
      const list = this.all();
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) return null;
      list[index] = { ...list[index], ...patch };
      writeCollection(KEYS.bookings, list);
      return list[index];
    },
    updateProgress(id, { stage, note, estimatedFinish, previewUrl } = {}) {
      const list = this.all();
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) return null;

      const current = list[index];
      const entry = {
        stage,
        status: stage === "delivered" ? "done" : "in_progress",
        note: note || null,
        at: new Date().toISOString(),
      };

      list[index] = {
        ...current,
        productionStage: stage,
        productionPercent: productionPercent(stage),
        productionFinishedAt:
          stage === "delivered" ? entry.at : current.productionFinishedAt || null,
        productionStartedAt: current.productionStartedAt || entry.at,
        estimatedFinish:
          estimatedFinish !== undefined
            ? estimatedFinish
            : current.estimatedFinish || null,
        previewUrl:
          previewUrl !== undefined ? previewUrl : current.previewUrl || "",
        reviewStatus:
          stage === "review"
            ? "pending"
            : stage === "revision"
              ? "revision"
              : current.reviewStatus || null,
        progress: [...(current.progress || []), entry],
      };
      writeCollection(KEYS.bookings, list);
      return list[index];
    },
    review(id, { decision, note } = {}) {
      const list = this.all();
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) return null;

      const current = list[index];
      const at = new Date().toISOString();

      if (decision === "revision") {
        list[index] = {
          ...current,
          productionStage: "revision",
          productionPercent: productionPercent("revision"),
          reviewStatus: "revision",
          revisionCount: (Number(current.revisionCount) || 0) + 1,
          progress: [
            ...(current.progress || []),
            {
              stage: "revision",
              status: "in_progress",
              note: note || "Permintaan revisi dari pelanggan.",
              at,
            },
          ],
        };
      } else {
        list[index] = {
          ...current,
          reviewStatus: "approved",
          progress: [
            ...(current.progress || []),
            {
              stage: "review",
              status: "done",
              note: note || "Hasil disetujui pelanggan.",
              at,
            },
          ],
        };
      }

      writeCollection(KEYS.bookings, list);
      return list[index];
    },
    cancel(id) {
      const list = this.all();
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) return null;

      const current = list[index];
      if (!["pending", "awaiting_payment"].includes(current.status)) {
        return current;
      }

      list[index] = {
        ...current,
        status: "cancelled",
        progress: [
          ...(current.progress || []),
          {
            stage: current.productionStage || "queued",
            status: "skipped",
            note: "Pembayaran dibatalkan oleh pelanggan.",
            at: new Date().toISOString(),
          },
        ],
      };
      writeCollection(KEYS.bookings, list);
      return list[index];
    },
    remove(id) {
      const list = this.all().filter((item) => item.id !== id);
      writeCollection(KEYS.bookings, list);
      return true;
    },
  },

  packages: {
    all() {
      return readCollection(KEYS.packages, seedPackages);
    },
    find(id) {
      return this.all().find((item) => item.id === Number(id)) || null;
    },
    create(payload) {
      const list = this.all();
      const item = normalizePackage({ ...payload, id: nextId(list) });
      list.push(item);
      writeCollection(KEYS.packages, list);
      return item;
    },
    update(id, patch) {
      const list = this.all();
      const index = list.findIndex((item) => item.id === Number(id));
      if (index === -1) return null;
      list[index] = normalizePackage(patch, list[index]);
      writeCollection(KEYS.packages, list);
      return list[index];
    },
    remove(id) {
      const list = this.all().filter((item) => item.id !== Number(id));
      writeCollection(KEYS.packages, list);
      return true;
    },
  },

  portfolios: {
    all() {
      return readCollection(KEYS.portfolios, seedPortfolios);
    },
    find(id) {
      return this.all().find((item) => item.id === Number(id)) || null;
    },
    create(payload) {
      const list = this.all();
      const item = normalizePortfolio({ ...payload, id: nextId(list) });
      list.unshift(item);
      writeCollection(KEYS.portfolios, list);
      return item;
    },
    update(id, patch) {
      const list = this.all();
      const index = list.findIndex((item) => item.id === Number(id));
      if (index === -1) return null;
      list[index] = normalizePortfolio(patch, list[index]);
      writeCollection(KEYS.portfolios, list);
      return list[index];
    },
    remove(id) {
      const list = this.all().filter((item) => item.id !== Number(id));
      writeCollection(KEYS.portfolios, list);
      return true;
    },
  },
};

export default store;
