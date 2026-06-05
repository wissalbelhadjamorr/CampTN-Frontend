import { authFetch } from "./api";

const API_URL = "https://camptn-backend-production.up.railway.app";

export const ActiviteService = {
  async getAllActivites() {
    const res = await fetch(`${API_URL}/activites`);
    if (!res.ok) throw new Error("Erreur activités");
    return res.json();
  },

  async createActivite(nom) {
    return authFetch("/activites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom }),
    });
  },

  async updateActivite(id, nom) {
    return authFetch(`/activites/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom }),
    });
  },

  async deleteActivite(id) {
    return authFetch(`/activites/${id}`, {
      method: "DELETE",
    });
  },
};