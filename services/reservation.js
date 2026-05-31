import { authFetch } from "./api";

export const ReservationService = {
  async createReservation(data) {
    return authFetch("/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getMesReservations() {
    return authFetch("/reservations/mes-reservations");
  },

  async getReservationsByCamping(campingId) {
    return authFetch(`/reservations/camping/${campingId}`);
  },

  async getAllReservations() {
    return authFetch("/reservations");
  },

  async updateStatut(id, statut) {
    return authFetch(`/reservations/${id}/statut`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
  },

  async annulerReservation(id) {
    return authFetch(`/reservations/${id}/annuler`, {
      method: "PATCH",
    });
  },
// services/reservation.ts
async checkReservationPourAvis(campingId) {
  return authFetch(`/avis/check-avis/${campingId}`);
},

async createPaymentSession(id) {
  return authFetch(`/reservations/${id}/paiement`, { method: "POST" });
},
};