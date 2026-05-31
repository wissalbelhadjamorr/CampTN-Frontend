const API_URL = "http://localhost:3000";

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
console.log(token);

  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // 🔴 erreurs HTTP
  if (res.status === 401) throw new Error("Non autorisé");
  if (res.status === 403) throw new Error("Accès refusé");

  if (!res.ok) {
    let message = `Erreur ${res.status}`;

    try {
      const errorData = await res.json();
      message = Array.isArray(errorData.message)
        ? errorData.message.join(", ")
        : errorData.message || message;
    } catch {
      const text = await res.text();
      console.log("❌ Réponse erreur brute :", text);
    }

    throw new Error(message);
  }

  // 🔵 pas de contenu
  if (res.status === 204) return null;

  const text = await res.text();

  if (!text) return null;

  // 🟢 sécurité JSON
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log("❌ Réponse NON JSON :", text);
    throw new Error("Le backend ne renvoie pas du JSON valide");
  }
};