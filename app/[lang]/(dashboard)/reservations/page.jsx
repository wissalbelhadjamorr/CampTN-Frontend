"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ReservationService } from "@/services/reservation";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const statutConfig = {
  en_attente: { label: "En attente", className: "bg-amber-50 text-amber-800 border border-amber-200" },
  confirmee:  { label: "Confirmée",  className: "bg-green-50 text-green-800 border border-green-200" },
  annulee:    { label: "Annulée",    className: "bg-red-50 text-red-800 border border-red-200" },
};

const MesReservationsPage = () => {
  const { user, loading } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const searchParams = useSearchParams();
  const toastShown = useRef(false);

  const fetchReservations = async () => {
    try {
      setDataLoading(true);
      const data = await ReservationService.getMesReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erreur chargement réservations");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user?.role === "client") fetchReservations();
  }, [loading, user]);

  useEffect(() => {
    if (toastShown.current) return;
    const paiement = searchParams.get("paiement");
    if (!paiement) return;
    toastShown.current = true;
    if (paiement === "success") toast.success("Paiement effectué avec succès !");
    if (paiement === "cancel") toast.error("Paiement annulé.");
    const url = new URL(window.location.href);
    url.searchParams.delete("paiement");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const handlePayer = async (id) => {
    setPayingId(id);
    try {
      const { url } = await ReservationService.createPaymentSession(id);
      window.location.href = url;
    } catch (err) {
      toast.error(err.message || "Erreur lors de la création du paiement");
      setPayingId(null);
    }
  };

  const handleAnnuler = async (id) => {
    if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;
    setCancellingId(id);
    try {
      await ReservationService.annulerReservation(id);
      toast.success("Réservation annulée !");
      fetchReservations();
    } catch (err) {
      toast.error(err.message || "Erreur annulation");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading || dataLoading)
    return <div className="p-10 text-center text-muted-foreground">Chargement...</div>;
  if (user?.role !== "client")
    return <div className="p-10 text-center text-muted-foreground">Accès refusé.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold tracking-tight mb-6">Mes réservations</h1>

      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          <p className="text-sm">Aucune réservation pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const statut = statutConfig[r.statut] ?? { label: r.statut, className: "bg-muted text-muted-foreground" };
            return (
              <div key={r.reservation_id} className="rounded-xl border border-border bg-card overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.camping?.nom}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
                      </svg>
                      {r.camping?.gouvernorat}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${statut.className}`}>
                    {statut.label}
                  </span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 md:grid-cols-5 divide-x divide-border border-b border-border">
                  {[
                    {
                      label: "Arrivée",
                      value: new Date(r.dateDebut).toLocaleDateString("fr-FR"),
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" />
                        </svg>
                      ),
                    },
                    {
                      label: "Départ",
                      value: new Date(r.dateFin).toLocaleDateString("fr-FR"),
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" />
                        </svg>
                      ),
                    },
                    {
                      label: "Nuits",
                      value: `${r.nombreNuits} nuit${r.nombreNuits > 1 ? "s" : ""}`,
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Personnes",
                      value: `${r.nombrePersonnes ?? 1} pers.`,
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Montant",
                      value: `${r.montant} DT`,
                      className: "text-green-700 dark:text-green-400",
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                      ),
                    },
                  ].map(({ label, value, icon, className }) => (
                    <div key={label} className="px-3 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
                      <p className={`text-xs font-medium flex items-center gap-1.5 ${className ?? "text-foreground"}`}>
                        {icon}
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/30 flex-wrap">
                  <span className="text-[11px] text-muted-foreground">
                    Réservé le {new Date(r.dateCreation).toLocaleDateString("fr-FR")}
                  </span>

                  {r.statut === "en_attente" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePayer(r.reservation_id)}
                        disabled={payingId === r.reservation_id}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z" />
                        </svg>
                        {payingId === r.reservation_id ? "Redirection..." : "Payer"}
                      </button>

                      <button
                        onClick={() => handleAnnuler(r.reservation_id)}
                        disabled={cancellingId === r.reservation_id}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        {cancellingId === r.reservation_id ? "Annulation..." : "Annuler"}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MesReservationsPage;