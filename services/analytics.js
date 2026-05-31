import { authFetch } from "./api";

export const AnalyticsService = {
  async trackView(campingId, gouvernorat) {
    try {
      await authFetch("/analytics/view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campingId,
          gouvernorat,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  },
async trackFavorite(campingId, gouvernorat) {
  try {
    await authFetch("/analytics/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campingId, gouvernorat }),
    });
  } catch (err) {
    console.error(err);
  }
},
  async getRecommendations(campingId) {
    try {
      return await authFetch(
        `/recommendations/camping/${campingId}`
      );
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async getRecommendationsForMe() {
    try {
      return await authFetch("/recommendations/for-me");
    } catch (err) {
      console.error(err);
      return [];
    }
  },
};