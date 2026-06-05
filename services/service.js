import { authFetch } from "./api";

const API_URL = "https://camptn-backend-production.up.railway.app";

export const ServiceService = {
  async getAllServices() {
    const res = await fetch(`${API_URL}/services`);
    if (!res.ok) throw new Error("Erreur services");
    return res.json();
  },

  async createService(nom) {
    return authFetch("/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom }),
    });
  },

  async updateService(id, nom) {
    return authFetch(`/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom }),
    });
  },

  async deleteService(id) {
    return authFetch(`/services/${id}`, {
      method: "DELETE",
    });
  },
};