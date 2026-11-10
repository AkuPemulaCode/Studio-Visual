import http from "./http";
import { ENDPOINTS } from "../config/api";
import { store } from "../data/store";
import { portfolios as mockPortfolios } from "../data/mock";

export const portfolioService = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = query
      ? `${ENDPOINTS.portfolios}?${query}`
      : ENDPOINTS.portfolios;
    try {
      const data = await http.get(path);
      return Array.isArray(data) ? data : data.data || store.portfolios.all();
    } catch (error) {
      void error;
      return store.portfolios
        .all()
        .filter((item) => item.published !== false);
    }
  },

  async adminList() {
    try {
      const data = await http.get(ENDPOINTS.portfolios);
      const list = Array.isArray(data) ? data : data.data;
      if (Array.isArray(list)) return list;
    } catch (error) {
      void error;
    }
    return store.portfolios.all();
  },

  async detail(id) {
    try {
      const data = await http.get(`${ENDPOINTS.portfolios}/${id}`);
      return data.data || data;
    } catch (error) {
      void error;
      return (
        store.portfolios.find(id) ||
        mockPortfolios.find((item) => item.id === Number(id)) ||
        null
      );
    }
  },

  async create(payload) {
    try {
      const data = await http.post(ENDPOINTS.portfolios, payload);
      if (data) return data.data || data;
    } catch (error) {
      void error;
    }
    return store.portfolios.create(payload);
  },

  async update(id, payload) {
    try {
      const data = await http.put(`${ENDPOINTS.portfolios}/${id}`, payload);
      if (data) return data.data || data;
    } catch (error) {
      void error;
    }
    return store.portfolios.update(id, payload);
  },

  async remove(id) {
    try {
      await http.delete(`${ENDPOINTS.portfolios}/${id}`);
    } catch (error) {
      void error;
    }
    return store.portfolios.remove(id);
  },
};

export default portfolioService;
