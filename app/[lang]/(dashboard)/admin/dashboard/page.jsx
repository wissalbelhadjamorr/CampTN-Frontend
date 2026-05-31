"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import toast from "react-hot-toast";
import { authFetch } from "@/services/api";
import { TypeZoneService } from "@/services/typeZone";
import { ServiceService } from "@/services/service";
import { ActiviteService } from "@/services/activite";
import { CampingService } from "@/services/camping";
import {
  Users, Tent, CheckCircle, XCircle, Clock, X,
  Trash2, Edit, Plus, Loader2, User, Settings, Map, Activity, MessageSquare
} from "lucide-react";
import CampingCard from "@/app/[lang]/(dashboard)/camping/components/campingCard";

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCampings: 0,
    campingsEnAttente: 0,
    gestionnairesEnAttente: 0,
    avisEnAttente: 0,
  });

  const [utilisateurs, setUtilisateurs] = useState([]);
  const [campings, setCampings] = useState([]);
  const [gestionnaires, setGestionnaires] = useState([]);
  const [services, setServices] = useState([]);
  const [typeZones, setTypeZones] = useState([]);
  const [activites, setActivites] = useState([]);
  const [avis, setAvis] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCampings, setLoadingCampings] = useState(false);
  const [loadingGestionnaires, setLoadingGestionnaires] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingTypeZones, setLoadingTypeZones] = useState(false);
  const [loadingActivites, setLoadingActivites] = useState(false);
  const [loadingAvis, setLoadingAvis] = useState(false);

  const [newService, setNewService] = useState("");
  const [editService, setEditService] = useState(null);
  const [editServiceNom, setEditServiceNom] = useState("");

  const [newTypeZone, setNewTypeZone] = useState("");
  const [editTypeZone, setEditTypeZone] = useState(null);
  const [editTypeZoneNom, setEditTypeZoneNom] = useState("");

  const [newActivite, setNewActivite] = useState("");
  const [editActivite, setEditActivite] = useState(null);
  const [editActiviteNom, setEditActiviteNom] = useState("");

  const [isPending, setIsPending] = useState(false);

  const fetchUtilisateurs = async () => {
    try {
      setLoadingUsers(true);
      const data = await authFetch("/utilisateur");
      setUtilisateurs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Erreur chargement utilisateurs");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCampings = async () => {
    try {
      setLoadingCampings(true);
      const data = await authFetch("/camping");
      const list = Array.isArray(data) ? data : [];
      setCampings(list);
      setStats(prev => ({
        ...prev,
        totalCampings: list.length,
        campingsEnAttente: list.filter(c => c.statut === "en_attente").length,
      }));
    } catch (err) {
      toast.error("Erreur chargement campings");
    } finally {
      setLoadingCampings(false);
    }
  };

  const fetchGestionnaires = async () => {
    try {
      setLoadingGestionnaires(true);
      const data = await authFetch("/auth/gestionnaires/en-attente");
      const list = Array.isArray(data) ? data : [];
      setGestionnaires(list);
      setStats(prev => ({ ...prev, gestionnairesEnAttente: list.length }));
    } catch (err) {
      toast.error("Erreur chargement gestionnaires");
    } finally {
      setLoadingGestionnaires(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const data = await ServiceService.getAllServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Erreur chargement services");
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchTypeZones = async () => {
    try {
      setLoadingTypeZones(true);
      const data = await TypeZoneService.getAllTypeZones();
      setTypeZones(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Erreur chargement types de zone");
    } finally {
      setLoadingTypeZones(false);
    }
  };

  const fetchActivites = async () => {
    try {
      setLoadingActivites(true);
      const data = await ActiviteService.getAllActivites();
      setActivites(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Erreur chargement activités");
    } finally {
      setLoadingActivites(false);
    }
  };

  const fetchAvis = async () => {
    try {
      setLoadingAvis(true);
      const data = await authFetch("/avis");
      const list = Array.isArray(data) ? data : [];
      setAvis(list);
      setStats(prev => ({
        ...prev,
        avisEnAttente: list.filter(a => a.statut === "en_attente").length,
      }));
    } catch (err) {
      toast.error("Erreur chargement avis");
    } finally {
      setLoadingAvis(false);
    }
  };

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      fetchUtilisateurs();
      fetchCampings();
      fetchGestionnaires();
      fetchServices();
      fetchTypeZones();
      fetchActivites();
      fetchAvis();
    }
  }, [loading, user]);

  useEffect(() => {
    setStats(prev => ({ ...prev, totalUsers: utilisateurs.length }));
  }, [utilisateurs]);

  const handleCampingStatus = async (id, statut) => {
    try {
      await CampingService.updateStatut(id, statut);
      toast.success(`Camping ${statut} !`);
      fetchCampings();
    } catch (err) {
      toast.error("Erreur mise à jour statut");
    }
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

  const handleValiderGestionnaire = async (id, statut) => {
    try {
      await authFetch(`/auth/gestionnaires/${id}/statut`, {
        method: "PATCH",
        body: JSON.stringify({ statut }),
      });
      toast.success(`Compte ${statut} !`);
      fetchGestionnaires();
    } catch (err) {
      toast.error("Erreur mise à jour");
    }
  };

  const handleAddService = async () => {
    if (!newService.trim()) return toast.error("Nom obligatoire");
    setIsPending(true);
    try {
      await ServiceService.createService(newService);
      toast.success("Service ajouté !");
      setNewService("");
      fetchServices();
    } catch (err) {
      toast.error("Le service existe déjà");
    } finally {
      setIsPending(false);
    }
  };

  const handleEditService = async () => {
    if (!editServiceNom.trim()) return toast.error("Nom obligatoire");
    setIsPending(true);
    try {
      await ServiceService.updateService(editService.service_id, editServiceNom);
      toast.success("Service modifié !");
      setEditService(null);
      fetchServices();
    } catch (err) {
      toast.error("Erreur modification");
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!confirm("Supprimer ce service ?")) return;
    try {
      await ServiceService.deleteService(id);
      toast.success("Service supprimé !");
      fetchServices();
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  const handleAddTypeZone = async () => {
    if (!newTypeZone.trim()) return toast.error("Nom obligatoire");
    setIsPending(true);
    try {
      await TypeZoneService.createTypeZone(newTypeZone);
      toast.success("Type de zone ajouté !");
      setNewTypeZone("");
      fetchTypeZones();
    } catch (err) {
      toast.error("Le type de zone existe déjà");
    } finally {
      setIsPending(false);
    }
  };

  const handleEditTypeZone = async () => {
    if (!editTypeZoneNom.trim()) return toast.error("Nom obligatoire");
    setIsPending(true);
    try {
      await TypeZoneService.updateTypeZone(editTypeZone.type_zone_id, editTypeZoneNom);
      toast.success("Type de zone modifié !");
      setEditTypeZone(null);
      fetchTypeZones();
    } catch (err) {
      toast.error("Erreur mise à jour");
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteTypeZone = async (id) => {
    if (!confirm("Supprimer ce type de zone ?")) return;
    try {
      await TypeZoneService.deleteTypeZone(id);
      toast.success("Type de zone supprimé !");
      fetchTypeZones();
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  const handleAddActivite = async () => {
    if (!newActivite.trim()) return toast.error("Nom obligatoire");
    setIsPending(true);
    try {
      await ActiviteService.createActivite(newActivite);
      toast.success("Activité ajoutée !");
      setNewActivite("");
      fetchActivites();
    } catch (err) {
      toast.error("L'activité existe déjà");
    } finally {
      setIsPending(false);
    }
  };

  const handleEditActivite = async () => {
    if (!editActiviteNom.trim()) return toast.error("Nom obligatoire");
    setIsPending(true);
    try {
      await ActiviteService.updateActivite(editActivite.activite_id, editActiviteNom);
      toast.success("Activité modifiée !");
      setEditActivite(null);
      fetchActivites();
    } catch (err) {
      toast.error("Erreur modification");
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteActivite = async (id) => {
    if (!confirm("Supprimer cette activité ?")) return;
    try {
      await ActiviteService.deleteActivite(id);
      toast.success("Activité supprimée !");
      fetchActivites();
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  const handleAvisStatus = async (id, statut) => {
    try {
      await authFetch(`/avis/${id}/statut`, {
        method: "PATCH",
        body: JSON.stringify({ statut }),
      });
      toast.success(`Avis ${statut} !`);
      fetchAvis();
    } catch (err) {
      toast.error("Erreur mise à jour avis");
    }
  };

  const handleDeleteAvis = async (id) => {
    if (!confirm("Supprimer cet avis ?")) return;
    try {
      await authFetch(`/avis/${id}`, { method: "DELETE" });
      toast.success("Avis supprimé !");
      fetchAvis();
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  if (loading) return <div className="p-10 text-center flex items-center justify-center gap-2"><Loader2 className="animate-spin h-5 w-5" /> Chargement...</div>;
  if (user?.role !== "admin") return <div className="p-10 text-center text-destructive">Accès refusé.</div>;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Admin</h1>
        <p className="text-muted-foreground mt-1">Gérez l'ensemble des utilisateurs, campings, configurations et avis de la plateforme.</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalUsers}</p></CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Campings</CardTitle>
            <Tent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalCampings}</p></CardContent>
        </Card>
        <Card className="shadow-sm border-yellow-200 bg-yellow-50/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-yellow-700">Campings en attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-yellow-700">{stats.campingsEnAttente}</p></CardContent>
        </Card>
        <Card className="shadow-sm border-amber-200 bg-amber-50/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-amber-700">Gestionnaires en attente</CardTitle>
            <User className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-700">{stats.gestionnairesEnAttente}</p></CardContent>
        </Card>
        <Card className="shadow-sm border-orange-200 bg-orange-50/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-orange-700">Avis en attente</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-orange-700">{stats.avisEnAttente}</p></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="utilisateurs" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 flex flex-wrap h-auto gap-1 border">
          <TabsTrigger value="utilisateurs" className="gap-2"><Users className="h-4 w-4" />Utilisateurs</TabsTrigger>
          <TabsTrigger value="campings" className="gap-2"><Tent className="h-4 w-4" />Campings</TabsTrigger>
          <TabsTrigger value="gestionnaires" className="gap-2 relative">
            <Clock className="h-4 w-4" />Gestionnaires
            {stats.gestionnairesEnAttente > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">{stats.gestionnairesEnAttente}</span>}
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2"><Settings className="h-4 w-4" />Services</TabsTrigger>
          <TabsTrigger value="typezones" className="gap-2"><Map className="h-4 w-4" />Types de zone</TabsTrigger>
          <TabsTrigger value="activites" className="gap-2"><Activity className="h-4 w-4" />Activités</TabsTrigger>
          <TabsTrigger value="avis" className="gap-2 relative">
            <MessageSquare className="h-4 w-4" />Avis
            {stats.avisEnAttente > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">{stats.avisEnAttente}</span>}
          </TabsTrigger>
        </TabsList>

        {/* ── Utilisateurs — lecture seule ── */}
        <TabsContent value="utilisateurs">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Gestion des Utilisateurs</CardTitle>
              <CardDescription>Liste globale des comptes inscrits sur la plateforme.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="p-8 text-center flex justify-center">
                  <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="text-muted-foreground border-b">
                        <th className="text-left p-3 font-medium">Nom</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Rôle</th>
                        <th className="text-left p-3 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {utilisateurs.map(u => (
                        <tr key={u.utilisateur_id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{u.prenom} {u.nom}</td>
                          <td className="p-3 text-muted-foreground">{u.email}</td>
                          <td className="p-3">
                            <Badge variant={u.role === "admin" ? "default" : u.role === "gestionnaire" ? "secondary" : "outline"}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" className={
                              u.statut === "valide" ? "bg-green-50 text-green-700 border-green-200" :
                              u.statut === "en_attente" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"
                            }>
                              {u.statut}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Campings ── */}
        <TabsContent value="campings">
          {loadingCampings ? (
            <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campings.map(camping => (
                <CampingCard
                  key={camping.camping_id}
                  camping={camping}
                  user={user}
                  onStatusUpdate={handleCampingStatus}
                  onDelete={handleDeleteCamping}
                  onEdit={() => {}}
                />
              ))}
              {campings.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6">
                  <Tent className="h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p className="text-sm text-muted-foreground">Aucun centre de camping enregistré.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Gestionnaires ── */}
        <TabsContent value="gestionnaires">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Demandes d'inscription Gestionnaires</CardTitle>
              <CardDescription>Approuvez ou refusez les accès pour les propriétaires de terrains.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGestionnaires ? (
                <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
              ) : (
                <div className="space-y-3">
                  {gestionnaires.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6">
                      <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                      <p className="text-sm text-muted-foreground">Toutes les demandes ont été traitées.</p>
                    </div>
                  ) : gestionnaires.map(g => (
                    <div key={g.utilisateur_id} className="border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {g.prenom[0]}{g.nom[0]}
                        </div>
<div>
  <p className="font-medium text-sm">{g.prenom} {g.nom}</p>
  <p className="text-xs text-muted-foreground">{g.email}</p>
  {g.justificatif && (
    <p className="text-xs text-muted-foreground mt-1">📄 {g.justificatif}</p>
  )}
</div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8"
                          onClick={() => handleValiderGestionnaire(g.utilisateur_id, "valide")}>
                          Accepter
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200 h-8"
                          onClick={() => handleValiderGestionnaire(g.utilisateur_id, "invalide")}>
                          Refuser
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Services ── */}
        <TabsContent value="services">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Nouveau Service</CardTitle>
                <CardDescription>Ajoutez une option (ex: Électricité, Douche).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input value={newService} onChange={e => setNewService(e.target.value)} placeholder="Nom du service..." className="h-9" />
                  <Button onClick={handleAddService} disabled={isPending} className="w-full h-9">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Services existants ({services.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingServices ? (
                  <div className="p-4 text-center flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {services.map(s => (
                      <div key={s.service_id} className="flex items-center justify-between p-2.5 border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                        {editService?.service_id === s.service_id ? (
                          <div className="flex gap-1.5 flex-1 items-center">
                            <Input value={editServiceNom} onChange={e => setEditServiceNom(e.target.value)} className="h-8 text-xs" />
                            <Button size="sm" onClick={handleEditService} disabled={isPending} className="h-8 text-xs px-2">Sauvegarder</Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditService(null)}><X className="h-4 w-4" /></Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-medium pl-1">{s.nom}</span>
                            <div className="flex gap-0.5">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditService(s); setEditServiceNom(s.nom); }}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50" onClick={() => handleDeleteService(s.service_id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Types de Zone ── */}
        <TabsContent value="typezones">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Nouveau Type de Zone</CardTitle>
                <CardDescription>Catégories géographiques (ex: Montagne, Fleuve).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input value={newTypeZone} onChange={e => setNewTypeZone(e.target.value)} placeholder="Nom du type..." className="h-9" />
                  <Button onClick={handleAddTypeZone} disabled={isPending} className="w-full h-9">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Types de zones ({typeZones.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTypeZones ? (
                  <div className="p-4 text-center flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {typeZones.map(tz => (
                      <div key={tz.type_zone_id} className="flex items-center justify-between p-2.5 border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                        {editTypeZone?.type_zone_id === tz.type_zone_id ? (
                          <div className="flex gap-1.5 flex-1 items-center">
                            <Input value={editTypeZoneNom} onChange={e => setEditTypeZoneNom(e.target.value)} className="h-8 text-xs" />
                            <Button size="sm" onClick={handleEditTypeZone} disabled={isPending} className="h-8 text-xs px-2">Sauvegarder</Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditTypeZone(null)}><X className="h-4 w-4" /></Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-medium pl-1">{tz.type_zone}</span>
                            <div className="flex gap-0.5">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditTypeZone(tz); setEditTypeZoneNom(tz.type_zone); }}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50" onClick={() => handleDeleteTypeZone(tz.type_zone_id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Activités ── */}
        <TabsContent value="activites">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Nouvelle Activité</CardTitle>
                <CardDescription>Loisirs disponibles (ex: Kayak, Tir à l'arc).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input value={newActivite} onChange={e => setNewActivite(e.target.value)} placeholder="Nom de l'activité..." className="h-9" />
                  <Button onClick={handleAddActivite} disabled={isPending} className="w-full h-9">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Activités enregistrées ({activites.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingActivites ? (
                  <div className="p-4 text-center flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activites.map(a => (
                      <div key={a.activite_id} className="flex items-center justify-between p-2.5 border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                        {editActivite?.activite_id === a.activite_id ? (
                          <div className="flex gap-1.5 flex-1 items-center">
                            <Input value={editActiviteNom} onChange={e => setEditActiviteNom(e.target.value)} className="h-8 text-xs" />
                            <Button size="sm" onClick={handleEditActivite} disabled={isPending} className="h-8 text-xs px-2">Sauvegarder</Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditActivite(null)}><X className="h-4 w-4" /></Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-medium pl-1">{a.nom}</span>
                            <div className="flex gap-0.5">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditActivite(a); setEditActiviteNom(a.nom); }}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50" onClick={() => handleDeleteActivite(a.activite_id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Avis ── */}
        <TabsContent value="avis">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Modération des Avis ({avis.length})</CardTitle>
              <CardDescription>Consultez, approuvez ou supprimez les retours d'expérience des utilisateurs.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAvis ? (
                <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {avis.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                      <p className="text-sm text-muted-foreground">Aucun avis soumis pour le moment.</p>
                    </div>
                  ) : avis.map(a => (
                    <div key={a.avis_id} className="border rounded-xl p-4 bg-muted/5 hover:bg-muted/10 transition-colors flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{a.utilisateur?.prenom} {a.utilisateur?.nom}</span>
                          <span className="text-xs text-muted-foreground">• sur {a.camping?.nom}</span>
                          <Badge variant="secondary" className={
                            a.statut === "valide" ? "bg-green-50 text-green-700 border-green-200" :
                            a.statut === "en_attente" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"
                          }>
                            {a.statut}
                          </Badge>
                        </div>
                        <div className="flex items-center text-amber-500 font-medium text-xs">
                          {"★".repeat(a.note)}{"☆".repeat(5 - a.note)}
                          <span className="text-muted-foreground ml-1.5 text-xs">({a.note}/5)</span>
                        </div>
                        <p className="text-sm text-muted-foreground italic pt-1">"{a.commentaire}"</p>
                      </div>
                      <div className="flex gap-1.5 self-end sm:self-start shrink-0">
                        {a.statut === "en_attente" && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs" onClick={() => handleAvisStatus(a.avis_id, "valide")}>Valider</Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleAvisStatus(a.avis_id, "refuse")}>Refuser</Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50" onClick={() => handleDeleteAvis(a.avis_id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;