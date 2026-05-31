"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

const ProfilPage = () => {
  const { user, token, loading } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [compte, setCompte] = useState("local");
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    newPassword: "",
  });

  useEffect(() => {
    if (!token) return;
    const fetchProfil = async () => {
      try {
        const res = await fetch("http://localhost:3000/utilisateur/profil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCompte(data.compte);
        setFormData({ nom: data.nom || "", prenom: data.prenom || "", email: data.email || "", newPassword: "" });
      } catch {
        toast.error("Erreur lors du chargement du profil.");
      }
    };
    fetchProfil();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const body = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        ...(compte === "local" && formData.newPassword && { password: formData.newPassword }),
      };
      const res = await fetch("http://localhost:3000/utilisateur/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Profil mis à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setIsPending(false);
    }
  };

  const initials = ((formData.prenom[0] || "") + (formData.nom[0] || "")).toUpperCase();

  if (loading) return <div className="p-10 text-center text-muted-foreground">Chargement...</div>;
  if (!user) return <div className="p-10 text-center text-muted-foreground">Accès refusé</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium text-lg border border-border shrink-0">
          {initials || "?"}
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Mon profil</h1>
          <p className="text-sm text-muted-foreground">
            {compte === "google" ? "Compte Google" : "Compte local"}
          </p>
        </div>
      </div>

      {/* Google badge */}
      {compte === "google" && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-lg px-3 py-2 mb-6">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 1 1 0-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
          </svg>
          Connecté via Google
        </div>
      )}

      {/* Informations card */}
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
        Informations personnelles
      </p>
      <div className="rounded-xl border border-border bg-card overflow-hidden mb-3">
        {[
          { id: "prenom", label: "Prénom", type: "text", key: "prenom" },
          { id: "nom", label: "Nom", type: "text", key: "nom" },
          { id: "email", label: "Email", type: "email", key: "email" },
        ].map(({ id, label, type, key }, i, arr) => (
          <div
            key={id}
            className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-border" : ""}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
              <input
                id={id}
                type={type}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                disabled={isPending || (key === "email" && compte === "google")}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {key === "email" && compte === "google" && (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7a4.5 4.5 0 0 0-9 0v3.5m-2 0h13a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-8.5a1 1 0 0 1 1-1z" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Password card */}
      {compte === "local" && (
        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden mb-6">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-sm font-medium">Mot de passe</span>
            <span className="text-xs text-muted-foreground ml-auto">Laisser vide pour ne pas modifier</span>
          </div>
          <div className="px-4 py-3.5 bg-card">
            <p className="text-[11px] text-muted-foreground mb-0.5">Nouveau mot de passe</p>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              disabled={isPending}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full py-3 bg-foreground text-background rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Mise à jour..." : "Sauvegarder"}
      </button>
    </div>
  );
};

export default ProfilPage;