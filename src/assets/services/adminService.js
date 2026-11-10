import http from "./http";
import { ENDPOINTS } from "../config/api";
import { store } from "../data/store";
import { monitoring as mockMonitoring } from "../data/mock";
import { PRODUCTION_STAGES, PRODUCTION_STATUSES } from "../utils/format";

const REVENUE_STATUSES = ["paid", "confirmed", "ongoing", "completed"];

function toNumber(value) {
  return Number(value) || 0;
}

function countByStatus(bookings) {
  return bookings.reduce((acc, booking) => {
    const status = booking.status || "pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
}

export const adminService = {
  async stats() {
    try {
      const data = await http.get(ENDPOINTS.admin.stats);
      if (data) return data.data || data;
    } catch (error) {
      void error;
    }
    const bookings = store.bookings.all();
    const totalRevenue = bookings
      .filter((booking) => REVENUE_STATUSES.includes(booking.status))
      .reduce((sum, booking) => sum + toNumber(booking.amount), 0);
    const customers = new Set(
      bookings.map((booking) => booking.email).filter(Boolean)
    );
    const completed = bookings.filter(
      (booking) => booking.status === "completed"
    );
    return {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((booking) =>
        ["pending", "awaiting_payment"].includes(booking.status)
      ).length,
      completedBookings: completed.length,
      totalRevenue,
      activeCustomers: customers.size,
      balance: completed.reduce(
        (sum, booking) => sum + toNumber(booking.amount),
        0
      ),
    };
  },

  async finance() {
    try {
      const data = await http.get(ENDPOINTS.admin.finance);
      if (data) return data.data || data;
    } catch (error) {
      void error;
    }
    const completed = store.bookings
      .all()
      .filter((booking) => booking.status === "completed");
    const income = completed.reduce(
      (sum, booking) => sum + toNumber(booking.amount),
      0
    );
    return {
      balance: income,
      income,
      expense: 0,
      transactions: completed.map((booking) => ({
        id: booking.id,
        type: "income",
        amount: toNumber(booking.amount),
        description: `Pendapatan booking ${booking.id}`,
        bookingId: booking.id,
        occurredAt: booking.createdAt,
      })),
    };
  },

  async bookings() {
    try {
      const data = await http.get(ENDPOINTS.admin.bookings);
      const list = Array.isArray(data) ? data : data.data;
      if (Array.isArray(list)) return list;
    } catch (error) {
      void error;
    }
    return store.bookings.all();
  },

  async users() {
    try {
      const data = await http.get(ENDPOINTS.admin.users);
      const list = Array.isArray(data) ? data : data.data;
      if (Array.isArray(list)) return list;
    } catch (error) {
      void error;
    }
    const map = new Map();
    map.set("admin@inheartz.test", {
      id: 1,
      name: "Admin Inheartz",
      email: "admin@inheartz.test",
      phone: "",
      role: "admin",
      bookings: 0,
      createdAt: null,
    });
    store.bookings.all().forEach((booking) => {
      const key = booking.email || booking.customer;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: booking.customer,
          email: booking.email || "",
          phone: booking.phone || "",
          role: "client",
          bookings: 0,
          createdAt: booking.createdAt || null,
        });
      }
      map.get(key).bookings += 1;
    });
    return Array.from(map.values());
  },

  async createUser(payload) {
    const data = await http.post(ENDPOINTS.admin.users, payload);
    return data.data || data;
  },

  async updateUser(id, payload) {
    const data = await http.put(`${ENDPOINTS.admin.users}/${id}`, payload);
    return data.data || data;
  },

  async removeUser(id) {
    await http.delete(`${ENDPOINTS.admin.users}/${id}`);
    return true;
  },

  async customers() {
    try {
      const data = await http.get(ENDPOINTS.admin.customers);
      const list = Array.isArray(data) ? data : data.data;
      if (Array.isArray(list)) return list;
    } catch (error) {
      void error;
    }
    const map = new Map();
    store.bookings.all().forEach((booking) => {
      const key = booking.email || booking.customer;
      if (!map.has(key)) {
        map.set(key, {
          name: booking.customer,
          email: booking.email || "",
          phone: booking.phone || "",
          total: 0,
          bookings: 0,
          lastStatus: booking.status,
        });
      }
      const entry = map.get(key);
      entry.total += toNumber(booking.amount);
      entry.bookings += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  },

  async revenue() {
    try {
      const data = await http.get(ENDPOINTS.admin.revenue);
      const list = Array.isArray(data) ? data : data.data;
      if (Array.isArray(list)) return list;
    } catch (error) {
      void error;
    }
    return mockMonitoring.revenue;
  },

  async statusBreakdown() {
    return countByStatus(store.bookings.all());
  },

  async updateBookingStatus(id, status) {
    return this.updateBooking(id, { status });
  },

  async updateBooking(id, patch) {
    let result = null;
    try {
      const data = await http.patch(`${ENDPOINTS.bookings}/${id}`, patch);
      result = data.data || data;
    } catch (error) {
      void error;
    }
    const local = store.bookings.update(id, patch);
    return result || local;
  },

  async assignBooking(id, userId) {
    try {
      const data = await http.patch(
        `${ENDPOINTS.admin.assignBooking}/${id}/assign`,
        { user_id: userId }
      );
      return data.data || data;
    } catch (error) {
      void error;
      return store.bookings.update(id, { assignedTo: userId, assigned_to: userId });
    }
  },

  async workers() {
    try {
      const data = await http.get(ENDPOINTS.admin.workers);
      const list = Array.isArray(data) ? data : data.data;
      if (Array.isArray(list)) return list;
    } catch (error) {
      void error;
    }
    return [
      {
        id: 2,
        name: "Staff Produksi",
        email: "staff@inheartz.test",
        role: "production",
        phone: "",
      },
    ];
  },

  async auditLogs(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const data = await http.get(
        query ? `${ENDPOINTS.admin.auditLogs}?${query}` : ENDPOINTS.admin.auditLogs
      );
      const list = Array.isArray(data) ? data : data.data;
      if (Array.isArray(list)) return list;
    } catch (error) {
      void error;
    }
    return [];
  },

  async removeBooking(id) {
    try {
      await http.delete(`${ENDPOINTS.bookings}/${id}`);
    } catch (error) {
      void error;
    }
    return store.bookings.remove(id);
  },

  async monitoring() {
    try {
      const data = await http.get(ENDPOINTS.admin.monitoring);
      if (data) return data.data || data;
    } catch (error) {
      void error;
    }
    return {
      summary: await this.stats(),
      bookings: await this.bookings(),
      revenue: await this.revenue(),
    };
  },

  async production() {
    try {
      const data = await http.get(ENDPOINTS.production);
      const payload = data?.data || data;
      if (payload && Array.isArray(payload.bookings)) return payload;
    } catch (error) {
      void error;
    }
    return buildProductionFallback(store.bookings.all());
  },

  async updateProgress(id, patch = {}) {
    const payload = {
      stage: patch.stage,
      note: patch.note ?? null,
      estimated_finish: patch.estimatedFinish ?? null,
      preview_url: patch.previewUrl ?? null,
    };
    let result = null;
    try {
      const data = await http.patch(
        `${ENDPOINTS.bookingProgress}/${id}/progress`,
        payload
      );
      result = data.data || data;
    } catch (error) {
      void error;
    }
    const local = store.bookings.updateProgress(id, patch);
    return result || local;
  },
};

function buildProductionFallback(bookings) {
  const inProduction = bookings.filter((booking) =>
    PRODUCTION_STATUSES.includes(booking.status)
  );

  const breakdown = {};
  PRODUCTION_STAGES.forEach((stage) => {
    breakdown[stage.key] = 0;
  });
  inProduction.forEach((booking) => {
    const key = booking.productionStage || PRODUCTION_STAGES[0].key;
    if (key in breakdown) breakdown[key] += 1;
  });

  const active = inProduction.filter(
    (booking) => (booking.productionStage || "queued") !== "delivered"
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = active.filter(
    (booking) => booking.estimatedFinish && new Date(booking.estimatedFinish) < today
  );

  const averagePercent = inProduction.length
    ? Math.round(
        inProduction.reduce(
          (sum, booking) => sum + toNumber(booking.productionPercent),
          0
        ) / inProduction.length
      )
    : 0;

  return {
    stages: PRODUCTION_STAGES,
    breakdown,
    summary: {
      total: inProduction.length,
      active: active.length,
      delivered: inProduction.filter(
        (booking) => (booking.productionStage || "queued") === "delivered"
      ).length,
      overdue: overdue.length,
      averagePercent,
    },
    bookings: inProduction,
  };
}

export default adminService;
