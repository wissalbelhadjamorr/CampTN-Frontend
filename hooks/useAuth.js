import { useState, useEffect } from "react";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }
        setUser({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        });
        setToken(storedToken);
      } catch (err) {
        console.error("Token invalide");
        localStorage.removeItem("token");
      }
      setLoading(false);
    };

    // Attendre que localStorage soit disponible (hydration SSR)
    if (typeof window !== "undefined") {
      init();
    }
  }, []);

  // Écouter les changements de token (login/logout depuis d'autres onglets ou composants)
  useEffect(() => {
    const handleStorage = () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        setUser(null);
        setToken(null);
        return;
      }
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        });
        setToken(storedToken);
      } catch {
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return {
    user,
    token,
    loading,
    isAdmin: user?.role === "admin",
    isGestionnaire: user?.role === "gestionnaire",
    isClient: user?.role === "client",
  };
};