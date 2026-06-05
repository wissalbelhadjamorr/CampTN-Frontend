import { authFetch } from "./api";

const API_URL = "https://camptn-backend-production.up.railway.app";

export const CampingService = {
 async createCamping(formData) {
  return authFetch("/camping/ajouter", {
    method: "POST",
    body: formData,
  });
},

  async updateCamping(id, formData) {
    return authFetch(`/camping/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  async updateStatut(id, statut) {
    return authFetch(`/camping/${id}/statut`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
  },

  async deleteCamping(id) {
    return authFetch(`/camping/${id}`, {
      method: "DELETE",
    });
  },

  async getAllCampings() {
    return authFetch("/camping");
  },

  async getCampingById(id) {
    return authFetch(`/camping/${id}`);
  },

  async getServices() {
    const res = await fetch(`${API_URL}/services`);
    if (!res.ok) throw new Error("Erreur services");
    return res.json();
  },

  async getTypeZones() {
    const res = await fetch(`${API_URL}/type-zones`);
    if (!res.ok) throw new Error("Erreur type zones");
    return res.json();
  },

  async getGouvernorats() {
    const res = await fetch(`${API_URL}/camping/gouvernorats`);
    if (!res.ok) throw new Error("Erreur gouvernorats");
    return res.json();
  },

async searchCampings(filters = {}) {
  const params = new URLSearchParams();
  if (filters.nom) params.append("nom", filters.nom);
  if (filters.gouvernorat && filters.gouvernorat !== "all") params.append("gouvernorat", filters.gouvernorat);
  if (filters.prixMin !== undefined) params.append("prixMin", String(filters.prixMin));
  if (filters.prixMax !== undefined) params.append("prixMax", String(filters.prixMax));
  if (filters.serviceIds?.length) params.append("serviceIds", filters.serviceIds.join(","));
  if (filters.typeZoneIds?.length) params.append("typeZoneIds", filters.typeZoneIds.join(","));

  return authFetch(`/camping/search?${params.toString()}`);
},
async getPublicCampings() {
  const res = await fetch(`${API_URL}/camping/public`);
  if (!res.ok) throw new Error("Erreur campings");
  return res.json();
},
};