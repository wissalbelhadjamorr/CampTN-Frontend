import { useState, useEffect } from "react";

const setCookie = (token) => {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
};

const deleteCookie = () => {
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        deleteCookie();
        setLoading(false);
        return;
      }
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          deleteCookie();
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
        setCookie(storedToken); // ← sync cookie pour le middleware
      } catch (err) {
        console.error("Token invalide");
        localStorage.removeItem("token");
        deleteCookie();
      }
      setLoading(false);
    };

    if (typeof window !== "undefined") {
      init();
    }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        deleteCookie();
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
        setCookie(storedToken); // ← sync cookie pour le middleware
      } catch {
        deleteCookie();
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