import http from "./http";
import { ENDPOINTS } from "../config/api";
import { store } from "../data/store";
import {
  packages as mockPackages,
  categories as mockCategories,
} from "../data/mock";

export const packageService = {
  async list() {
    try {
      const data = await http.get(ENDPOINTS.packages);
      return Array.isArray(data) ? data : data.data || store.packages.all();
    } catch (error) {
      void error;
      return store.packages.all();
    }
  },

  async detail(slug) {
    try {
      const data = await http.get(`${ENDPOINTS.packages}/${slug}`);
      return data.data || data;
    } catch (error) {
      void error;
      return (
        store.packages
          .all()
          .find((item) => item.slug === slug || String(item.id) === String(slug)) ||
        mockPackages.find((item) => item.slug === slug) ||
        null
      );
    }
  },

  async create(payload) {
    try {
      const data = await http.post(ENDPOINTS.packages, payload);
      if (data) return data.data || data;
    } catch (error) {
      void error;
    }
    return store.packages.create(payload);
  },

  async update(id, payload) {
    try {
      const data = await http.put(`${ENDPOINTS.packages}/${id}`, payload);
      if (data) return data.data || data;
    } catch (error) {
      void error;
    }
    return store.packages.update(id, payload);
  },

  async remove(id) {
    try {
      await http.delete(`${ENDPOINTS.packages}/${id}`);
    } catch (error) {
      void error;
    }
    return store.packages.remove(id);
  },

  async categories() {
    try {
      const data = await http.get(ENDPOINTS.categories);
      return Array.isArray(data) ? data : data.data || mockCategories;
    } catch (error) {
      void error;
      return mockCategories;
    }
  },
};

export default packageService;
