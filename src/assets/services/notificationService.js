import http from "./http";
import { ENDPOINTS } from "../config/api";

export const notificationService = {
  async list(limit = 20) {
    const data = await http.get(`${ENDPOINTS.notifications}?limit=${limit}`);
    return {
      items: Array.isArray(data.data) ? data.data : [],
      unread: typeof data.unread === "number" ? data.unread : 0,
    };
  },

  async markRead(id) {
    return http.post(`${ENDPOINTS.notifications}/${id}/read`);
  },

  async markAllRead() {
    return http.post(`${ENDPOINTS.notifications}/read-all`);
  },
};

export default notificationService;
