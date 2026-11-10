import http from "./http";
import { ENDPOINTS } from "../config/api";

export const recommendationService = {
  async list(limit = 3) {
    try {
      const data = await http.get(`${ENDPOINTS.recommendations}?limit=${limit}`);
      const list = Array.isArray(data) ? data : data.data;
      return Array.isArray(list) ? list : [];
    } catch (error) {
      void error;
      return [];
    }
  },
};

export default recommendationService;
