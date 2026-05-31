import { authFetch } from "./api";

const API_URL = "http://localhost:3000";

export const AvisService = {
  async addAvis(campingId, note, commentaire) {
    return authFetch(`/avis/${campingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, commentaire }),
    });
  },

  async updateAvis(avisId, note, commentaire) {
    return authFetch(`/avis/${avisId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, commentaire }),
    });
  },

  async deleteAvis(avisId) {
    return authFetch(`/avis/${avisId}`, {
      method: "DELETE",
    });
  },

  
  async getAvisByCamping(campingId) {
  return authFetch(`/avis/camping/${campingId}`);
},

  async getAllAvis() {
    return authFetch("/avis");
  },

 
async updateStatut(avisId, statut) {
  return authFetch(`/avis/${avisId}/statut`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statut }),
  });
}

};