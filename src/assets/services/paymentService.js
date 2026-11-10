import http from "./http";
import { ENDPOINTS } from "../config/api";
import { paymentMethods as mockMethods } from "../data/mock";

export const paymentService = {
  async methods() {
    try {
      const data = await http.get(ENDPOINTS.paymentMethods);
      return Array.isArray(data) ? data : data.data || mockMethods;
    } catch (error) {
      void error;
      return mockMethods;
    }
  },

  async create(payload) {
    try {
      const data = await http.post(ENDPOINTS.payments, payload);
      return data.data || data;
    } catch (error) {
      void error;
      return { ...payload, status: "pending", id: `PAY-${Date.now()}` };
    }
  },

  async uploadProof(bookingId, file) {
    const form = new FormData();
    form.append("booking_id", bookingId);
    form.append("proof", file);
    const data = await http.post(ENDPOINTS.paymentProof, form);
    return data.data || data;
  },

  async chargeMidtrans(payload) {
    const data = await http.post(ENDPOINTS.paymentMidtransCharge, payload);
    return data.data || data;
  },

  async midtransSync(orderId) {
    const data = await http.post(ENDPOINTS.paymentMidtransSync, {
      order_id: orderId,
    });
    return data.data || data;
  },

  async midtransSyncBooking(bookingId) {
    const data = await http.post(ENDPOINTS.paymentMidtransSync, {
      booking_id: bookingId,
    });
    return data.data || data;
  },

  async midtransStatus(orderId) {
    const data = await http.get(
      `${ENDPOINTS.paymentMidtransStatus}/${orderId}`
    );
    return data.data || data;
  },
};

export default paymentService;
