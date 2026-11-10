import http from "./http";
import { ENDPOINTS, STORAGE_KEYS } from "../config/api";
import { store } from "../data/store";
import { timeSlots } from "../data/mock";

export const bookingService = {
  async availability(date) {
    try {
      const data = await http.get(
        `${ENDPOINTS.availability}?date=${encodeURIComponent(date)}`
      );
      return data.slots || data.data || timeSlots;
    } catch (error) {
      void error;
      const taken = store.bookings
        .all()
        .filter((item) => item.date === date && item.status !== "cancelled")
        .map((item) => item.time);
      return timeSlots.filter((slot) => !taken.includes(slot));
    }
  },

  async create(payload) {
    let result = null;
    try {
      const data = await http.post(ENDPOINTS.bookings, payload);
      result = data.data || data;
    } catch (error) {
      void error;
    }
    const stored = store.bookings.create({
      ...payload,
      id: result?.id,
      status: result?.status || "awaiting_payment",
    });
    return result || stored;
  },

  async detail(id) {
    try {
      const data = await http.get(`${ENDPOINTS.bookings}/${id}`);
      return data.data || data;
    } catch (error) {
      void error;
      return store.bookings.find(id);
    }
  },

  async mine(email) {
    try {
      const data = await http.get(ENDPOINTS.bookings);
      const list = Array.isArray(data) ? data : data.data;
      if (Array.isArray(list)) return list;
      return store.bookings.mine(email);
    } catch (error) {
      void error;
      return store.bookings.mine(email);
    }
  },

  async review(id, { decision, note } = {}) {
    try {
      const data = await http.post(`${ENDPOINTS.bookings}/${id}/review`, {
        decision,
        note: note ?? null,
      });
      return data.data || data;
    } catch (error) {
      void error;
      return store.bookings.review(id, { decision, note });
    }
  },

  async cancel(id) {
    try {
      const data = await http.post(`${ENDPOINTS.bookings}/${id}/cancel`);
      return data.data || data;
    } catch (error) {
      void error;
      return store.bookings.cancel(id);
    }
  },

  async updateStatus(id, status) {
    try {
      const data = await http.patch(`${ENDPOINTS.bookings}/${id}`, { status });
      return data.data || data;
    } catch (error) {
      void error;
      return store.bookings.update(id, { status });
    }
  },

  async remove(id) {
    try {
      await http.delete(`${ENDPOINTS.bookings}/${id}`);
    } catch (error) {
      void error;
    }
    return store.bookings.remove(id);
  },

  saveDraft(draft) {
    localStorage.setItem(STORAGE_KEYS.bookingDraft, JSON.stringify(draft));
  },

  getDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.bookingDraft);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      void error;
      return null;
    }
  },

  clearDraft() {
    localStorage.removeItem(STORAGE_KEYS.bookingDraft);
  },
};

export default bookingService;
