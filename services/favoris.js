import { authFetch } from "./api";

const API_URL = "https://camptn-backend-production.up.railway.app";

export const FavorisService = {
  async addFavori(utilisateur_id, camping_id) {
    return authFetch(`/favori/${utilisateur_id}/${camping_id}`, {
      method: "POST",
    });
  },

  async deleteFavori(favori_id) {
    return authFetch(`/favori/${favori_id}`, {
      method: "DELETE",
    });
  },

  async getFavoris(utilisateur_id) {
    return authFetch(`/favori/${utilisateur_id}`, {
      method: "GET",
    });
  },

  async isFavori(utilisateur_id, camping_id) {
    const favoris = await authFetch(`/favori/${utilisateur_id}`, {
      method: "GET",
    });
    return favoris.some(f => f.camping.camping_id === camping_id);
  },
};