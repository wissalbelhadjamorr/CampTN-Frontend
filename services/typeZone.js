import { authFetch } from "./api";

const API_URL = "http://localhost:3000";

export const TypeZoneService = {
  async getAllTypeZones() {
    const res = await fetch(`${API_URL}/type-zones`);
    if (!res.ok) throw new Error("Erreur chargement types de zone");
    return res.json();
  },

  async createTypeZone(nom) {
    
    return authFetch("/type-zones", { 
      method: "POST",
      body: JSON.stringify({nom: nom }), 
      headers: {
  "Content-Type": "application/json"
}
    });
  },

  async updateTypeZone(id, nom) {
    return authFetch(`/type-zones/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nom: nom }),
      headers: {
  "Content-Type": "application/json"
}
    });
  },

  async deleteTypeZone(id) {
    return authFetch(`/type-zones/${id}`, {
      method: "DELETE",
    });
  },
};