"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { authFetch } from "@/services/api";
import { CampingService } from "@/services/camping";
import { ReservationService } from "@/services/reservation";
import {
  Tent, CalendarDays, CheckCircle, XCircle,
  Loader2, User, MessageSquare, Banknote, Moon, Plus, X, Star, Sparkles
} from "lucide-react";
import CampingCard from "@/app/[lang]/(dashboard)/camping/components/campingCard";
import EditCampingForm from "@/app/[lang]/(dashboard)/camping/components/EditCampingForm";
import CreateCampingForm from "@/app/[lang]/(dashboard)/camping/components/CreateCampingForm";

const GestionnaireDashboard = () => {
  const { user, loading } = useAuth();

  const [stats, setStats] = useState({
    totalCampings: 0,
    reservationsEnAttente: 0,
    avisValides: 0,
  });

  const [campings, setCampings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [avis, setAvis] = useState([]);
  const [selectedCamping, setSelectedCamping] = useState(null);
  const [editingCamping, setEditingCamping] = useState(null);
  const [creatingCamping, setCreatingCamping] = useState(false);

  const [loadingCampings, setLoadingCampings] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [loadingAvis, setLoadingAvis] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCampings = async () => {
    try {
      setLoadingCampings(true);
      const data = await CampingService.searchCampings({});
      const list = Array.isArray(data) ? data : [];
      setCampings(list);
      setStats(prev => ({ ...prev, totalCampings: list.length }));
      if (list.length > 0 && !selectedCamping) {
        setSelectedCamping(list[0].camping_id);
        fetchReservations(list[0].camping_id);
        fetchAvisByCamping(list[0].camping_id);
      }
    } catch (err) {
      toast.error("Erreur chargement campings");
    } finally {
      setLoadingCampings(false);
    }
  };

  const fetchReservations = async (campingId) => {
    try {
      setLoadingReservations(true);
      const data = await ReservationService.getReservationsByCamping(campingId);
      const list = Array.isArray(data) ? data : [];
      setReservations(list);
      setStats(prev => ({
        ...prev,
        reservationsEnAttente: list.filter(r => r.statut === "en_attente").length,
      }));
    } catch (err) {
      toast.error("Erreur chargement réservations");
    } finally {
      setLoadingReservations(false);
    }
  };

  const fetchAvisByCamping = async (campingId) => {
    try {
      setLoadingAvis(true);
      const data = await authFetch(`/avis/camping/${campingId}`);
      const list = Array.isArray(data) ? data : [];
      setAvis(list);
      setStats(prev => ({
        ...prev,
        avisValides: list.length,
      }));
    } catch (err) {
      toast.error("Erreur chargement avis");
    } finally {
      setLoadingAvis(false);
    }
  };

  useEffect(() => {
    if (!loading && user?.role === "gestionnaire") {
      fetchCampings();
    }
  }, [loading, user]);

  const handleSelectCamping = (campingId) => {
    setSelectedCamping(campingId);
    fetchReservations(campingId);
    fetchAvisByCamping(campingId);
  };

  const handleDeleteCamping = async (id) => {
    if (!confirm("Supprimer ce camping ?")) return;
    try {
      await CampingService.deleteCamping(id);
      toast.success("Camping supprimé !");
      fetchCampings();
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  const handleUpdateReservation = async (id, statut) => {
    setUpdatingId(id);
    try {
      await ReservationService.updateStatut(id, statut);
      toast.success(`Réservation ${statut === "confirmee" ? "confirmée" : "refusée"} !`);
      fetchReservations(selectedCamping);
    } catch (err) {
      toast.error("Erreur mise à jour");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Chargement de votre espace...</p>
      </div>
    );
  }

  if (user?.role !== "gestionnaire") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <div className="bg-destructive/10 p-3 rounded-full text-destructive mb-4">
          <XCircle className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold mb-1">Accès refusé</h3>
        <p className="text-muted-foreground max-w-sm">Vous devez disposer d'un compte gestionnaire pour accéder à cet espace.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 pb-6 border-b border-border/60">
        <div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Tableau de bord Gestionnaire
          </h1>
        </div>
        <Button className="shadow-md shadow-primary/10 hover:shadow-lg transition-all gap-2 self-start md:self-auto" onClick={() => setCreatingCamping(true)}>
          <Plus className="h-4 w-4" /> Nouveau camping
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mes camoings</CardTitle>
            <div className="p-2 bg-primary/10 text-primary rounded-lg transition-colors group-hover:bg-primary/20">
              <Tent className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold tracking-tight">{stats.totalCampings}</div>
            <p className="text-xs text-muted-foreground mt-1">Campings référencés</p>
          </CardContent>
        </Card>

      

        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border-emerald-500/20 dark:border-emerald-500/30 bg-gradient-to-b from-card to-emerald-500/[0.01]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-500">Avis clients validés</CardTitle>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-lg transition-colors group-hover:bg-emerald-500/20">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500">{stats.avisValides}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium text-emerald-600/80 dark:text-emerald-400/80">Retours d'expérience positifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Camping Selector Tab-Style */}
      {campings.length > 1 && (
        <div className="mb-8 bg-muted/40 p-2 rounded-xl border border-border/60">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Filtrer par camping :</p>
          <div className="flex gap-2 flex-wrap">
            {campings.map(c => (
              <button
                key={c.camping_id}
                onClick={() => handleSelectCamping(c.camping_id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCamping === c.camping_id
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {c.nom}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="campings" className="space-y-6">
        <TabsList className="bg-muted/80 p-1 rounded-xl border border-border/50 h-11 w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="campings" className="rounded-lg data-[state=active]:shadow-sm gap-2">
            <Tent className="h-4 w-4" /> <span className="hidden sm:inline">Mes</span> Campings
          </TabsTrigger>
          <TabsTrigger value="reservations" className="rounded-lg data-[state=active]:shadow-sm gap-2 relative">
            <CalendarDays className="h-4 w-4" /> Réservations
            {stats.reservationsEnAttente > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
                {stats.reservationsEnAttente}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="avis" className="rounded-lg data-[state=active]:shadow-sm gap-2">
            <MessageSquare className="h-4 w-4" /> Avis
          </TabsTrigger>
        </TabsList>

        {/* ===== TAB: CAMPINGS ===== */}
        <TabsContent value="campings" className="outline-none mt-4">
          {loadingCampings ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campings.map(camping => (
                <CampingCard
                  key={camping.camping_id}
                  camping={camping}
                  user={user}
                  onStatusUpdate={() => {}}
                  onDelete={handleDeleteCamping}
                  onEdit={(c) => setEditingCamping(c)}
                />
              ))}
              {campings.length === 0 && (
                <div className="col-span-full py-16 text-center border border-dashed border-border/80 rounded-2xl bg-muted/20">
                  <Tent className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
                  <p className="text-base font-medium text-foreground">Aucun camping enregistré</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Commencez dès maintenant en ajoutant votre premier camping.</p>
                  <Button size="sm" variant="outline" onClick={() => setCreatingCamping(true)}>Ajouter un camping</Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ===== TAB: RESERVATIONS ===== */}
        <TabsContent value="reservations" className="outline-none mt-4">
          {loadingReservations ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {reservations.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border/80 rounded-2xl bg-muted/20">
                  <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
                  <p className="text-base font-medium text-foreground">Aucune réservation trouvée</p>
                  <p className="text-sm text-muted-foreground mt-1">Les demandes de vos clients s'afficheront à cet endroit.</p>
                </div>
              ) : reservations.map(r => (
                <div key={r.reservation_id} className="bg-card border border-border/70 rounded-xl p-5 shadow-sm transition-all hover:border-border/100">
                  
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                        {r.utilisateur?.prenom?.[0] || <User className="h-5 w-5"/>}
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-tight">{r.utilisateur?.prenom} {r.utilisateur?.nom}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.utilisateur?.email}</p>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className={`w-fit font-medium text-xs px-2.5 py-0.5 capitalize rounded-full ${
                      r.statut === "confirmee" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" :
                      r.statut === "en_attente" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" : 
                      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                    }`}>
                      {r.statut === "confirmee" ? "Confirmée" : r.statut === "en_attente" ? "En attente" : "Annulée"}
                    </Badge>
                  </div>

                  {/* Grid info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Arrivée</p>
                      <p className="font-medium text-foreground mt-0.5">{new Date(r.dateDebut).toLocaleDateString("fr-FR", {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Départ</p>
                      <p className="font-medium text-foreground mt-0.5">{new Date(r.dateFin).toLocaleDateString("fr-FR", {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Séjour</p>
                      <p className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                        <Moon className="h-3.5 w-3.5 text-muted-foreground" /> {r.nombreNuits} {r.nombreNuits > 1 ? 'nuits' : 'nuit'} · {r.nombrePersonnes} pers.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Prix Total</p>
                      <p className="font-bold text-base text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        {r.montant} <span className="text-xs font-semibold">DT</span>
                      </p>
                    </div>
                  </div>

                  {/* Comment option */}
                  {r.message && (
                    <div className="text-sm bg-muted/50 text-muted-foreground rounded-lg p-3 italic border-l-2 border-primary/30 mb-4">
                      "{r.message}"
                    </div>
                  )}

                  {/* Bottom info / Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-muted-foreground">
                      Soumis le {new Date(r.dateCreation).toLocaleDateString("fr-FR")} à {new Date(r.dateCreation).toLocaleTimeString("fr-FR", {hour: '2-digit', minute:'2-digit'})}
                    </p>

                    {r.statut === "en_attente" && (
                      <div className="flex gap-2 self-end sm:self-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-1 border-rose-200 dark:border-rose-900/50"
                          onClick={() => handleUpdateReservation(r.reservation_id, "annulee")}
                          disabled={updatingId === r.reservation_id}
                        >
                          {updatingId === r.reservation_id ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          Refuser
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-sm"
                          onClick={() => handleUpdateReservation(r.reservation_id, "confirmee")}
                          disabled={updatingId === r.reservation_id}
                        >
                          {updatingId === r.reservation_id ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          Confirmer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== TAB: AVIS ===== */}
        <TabsContent value="avis" className="outline-none mt-4">
          {loadingAvis ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-4 max-w-4xl">
              {avis.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border/80 rounded-2xl bg-muted/20">
                  <Star className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
                  <p className="text-base font-medium text-foreground">Aucun avis publié</p>
                  <p className="text-sm text-muted-foreground mt-1">Les notes laissées par les campeurs validés s'afficheront ici.</p>
                </div>
              ) : avis.map(a => (
                <div key={a.avis_id} className="bg-card border border-border/70 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
                        {a.utilisateur?.prenom?.[0] || <User className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{a.utilisateur?.prenom} {a.utilisateur?.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.date).toLocaleDateString("fr-FR", {day: 'numeric', month: 'long', year: 'numeric'})}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-none rounded-full text-[11px] font-medium px-2 py-0">
                      Validé
                    </Badge>
                  </div>
                  
                  {/* Stars Container */}
                  <div className="flex items-center gap-1.5 mb-2 bg-muted/40 w-fit px-2 py-1 rounded-md">
                    <div className="flex text-amber-400">
                      {"★".repeat(a.note)}{"☆".repeat(5 - a.note)}
                    </div>
                    <span className="text-xs font-bold text-foreground/80">{a.note}/5</span>
                  </div>

                  {a.commentaire && (
                    <p className="text-sm text-muted-foreground leading-relaxed pl-1">{a.commentaire}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== MODAL: EDITION (Glassmorphism overlay) ===== */}
      {editingCamping && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card rounded-xl w-full max-w-2xl shadow-2xl border border-border/50 my-4 animate-in zoom-in-95 duration-200">
            <EditCampingForm
              camping={editingCamping}
              onSuccess={() => { setEditingCamping(null); fetchCampings(); }}
              onCancel={() => setEditingCamping(null)}
            />
          </div>
        </div>
      )}

      {/* ===== MODAL: CREATION (Glassmorphism overlay) ===== */}
      {creatingCamping && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card rounded-xl w-full max-w-2xl shadow-2xl border border-border/50 my-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border/60">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Nouveau camping</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Ajoutez un nouvel camping à votre catalogue</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCreatingCamping(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-1">
              <CreateCampingForm
                onSuccess={() => { setCreatingCamping(false); fetchCampings(); }}
                onCancel={() => setCreatingCamping(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionnaireDashboard;