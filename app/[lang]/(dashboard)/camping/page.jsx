"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import CampingCard from "@/app/[lang]/(dashboard)/camping/components/campingCard";
import EditCampingForm from "@/app/[lang]/(dashboard)/camping/components/EditCampingForm";
import { CampingService } from "@/services/camping";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Tent, Filter, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { AnalyticsService } from "@/services/analytics";

const STATUT_CONFIG = {
  tous: { label: "Tous" },
  en_attente: { label: "En attente" },
  valide: { label: "Validés" },
  refuse: { label: "Refusés" },
  archive: { label: "Archivés" },
};

const CampingsPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [campings, setCampings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedCamping, setSelectedCamping] = useState(null);
  const [filter, setFilter] = useState("tous");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [services, setServices] = useState([]);
  const [typeZones, setTypeZones] = useState([]);
  const [gouvernorats, setGouvernorats] = useState([]);

  const [filters, setFilters] = useState({
    nom: "",
    gouvernorat: "all",
    prixMin: 0,
    prixMax: 500,
    serviceIds: [],
    typeZoneIds: [],
  });
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setDataLoading(true);
        const [govs, servs, zones, allCampings] = await Promise.all([
          CampingService.getGouvernorats(),
          CampingService.getServices(),
          CampingService.getTypeZones(),
          CampingService.searchCampings({}),
        ]);
        setGouvernorats(govs || []);
        setServices(servs || []);
        setTypeZones(zones || []);
        setCampings(allCampings || []);
      } catch (err) {
        console.error("Erreur chargement initial", err);
      } finally {
        setDataLoading(false);
      }
    };
    if (!authLoading) loadInitialData();
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (user?.role === "client") {
      AnalyticsService.getRecommendationsForMe().then(data => {
        console.log("recommendations:", data);
        setRecommendations(data || []);
      });
    }
  }, [user]);

  const handleSearch = useCallback(async () => {
    setDataLoading(true);
    try {
      const results = await CampingService.searchCampings({
        nom: filters.nom || undefined,
        gouvernorat: filters.gouvernorat !== "all" ? filters.gouvernorat : undefined,
        prixMin: filters.prixMin,
        prixMax: filters.prixMax,
        serviceIds: filters.serviceIds.length ? filters.serviceIds : undefined,
        typeZoneIds: filters.typeZoneIds.length ? filters.typeZoneIds : undefined,
      });
      setCampings(results || []);
    } catch (err) {
      console.error("Erreur recherche:", err);
    } finally {
      setDataLoading(false);
    }
  }, [filters]);

  const handleStatusUpdate = async (id, statut) => {
    try {
      await CampingService.updateStatut(id, statut);
      toast.success(`Camping ${statut} avec succès !`);
      handleSearch();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce camping ?")) return;
    try {
      await CampingService.deleteCamping(id);
      toast.success("Camping supprimé !");
      handleSearch();
    } catch (err) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const toggleSelection = (id, key) => {
    setFilters((prev) => {
      const list = prev[key];
      return { ...prev, [key]: list.includes(id) ? list.filter(i => i !== id) : [...list, id] };
    });
  };

  const clearFilters = () => {
    setFilters({ nom: "", gouvernorat: "all", prixMin: 0, prixMax: 500, serviceIds: [], typeZoneIds: [] });
    setFilter("tous");
  };

  const hasActiveFilters =
    filters.nom || filters.gouvernorat !== "all" ||
    filters.prixMin > 0 || filters.prixMax < 500 ||
    filters.serviceIds.length > 0 || filters.typeZoneIds.length > 0 ||
    filter !== "tous";

  const filteredCampings = (user?.role === "admin" || user?.role === "gestionnaire")
    ? campings.filter(c => filter === "tous" || c.statut === filter)
    : campings;

  const getCount = (statut) =>
    statut === "tous" ? campings.length : campings.filter(c => c.statut === statut).length;

  const getStatutFilters = () =>
    user?.role === "admin"
      ? ["tous", "en_attente", "valide", "refuse", "archive"]
      : ["tous", "en_attente", "valide", "refuse"];

  if (authLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Tent className="h-10 w-10 text-primary animate-bounce" />
      <p className="text-muted-foreground text-sm">Chargement...</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">

      {/* Header compact */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Tent className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">
              {user?.role === "admin" ? "Gestion des Campings" :
               user?.role === "gestionnaire" ? "Mes Campings" : "Découvrir les Campings"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {filteredCampings.length} camping{filteredCampings.length !== 1 ? "s" : ""}
              {hasActiveFilters && " · filtres actifs"}
            </p>
          </div>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs text-muted-foreground h-7">
            <X className="h-3 w-3" /> Réinitialiser
          </Button>
        )}
      </div>

      {/* Barre de recherche principale */}
      <div className="bg-card border rounded-xl p-3 mb-4 space-y-3">

        {/* Ligne 1 : nom + gouvernorat + bouton filtres */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-sm"
              placeholder="Rechercher par nom..."
              value={filters.nom}
              onChange={(e) => setFilters({ ...filters, nom: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <Select
            value={filters.gouvernorat}
            onValueChange={(val) => setFilters({ ...filters, gouvernorat: val })}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Gouvernorat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toute la Tunisie</SelectItem>
              {gouvernorats.map((gov) => (
                <SelectItem key={gov} value={gov} className="text-xs">{gov}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 px-3"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal className="h-3 w-3" />
            Filtres
            {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>

          <Button size="sm" className="h-8 text-xs gap-1 px-4" onClick={handleSearch} disabled={dataLoading}>
            <Search className="h-3 w-3" />
            {dataLoading ? "..." : "Chercher"}
          </Button>
        </div>

        {/* Filtres avancés collapsibles */}
        {showAdvanced && (
          <div className="border-t pt-3 space-y-3">

            {/* Prix */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap w-24">Prix / nuit</span>
              <div className="flex-1">
                <Slider
                  value={[filters.prixMin, filters.prixMax]}
                  min={0} max={500} step={5}
                  onValueChange={(val) => setFilters({ ...filters, prixMin: val[0], prixMax: val[1] })}
                />
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded whitespace-nowrap">
                {filters.prixMin}–{filters.prixMax} DT
              </span>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Services</p>
                <div className="flex flex-wrap gap-2">
                  {services.map((s) => (
                    <label key={s.service_id} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        className="h-3 w-3"
                        checked={filters.serviceIds.includes(s.service_id)}
                        onCheckedChange={() => toggleSelection(s.service_id, "serviceIds")}
                      />
                      <span className="text-xs text-muted-foreground hover:text-primary transition-colors">{s.nom}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Types de zone */}
            {typeZones.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Type de zone</p>
                <div className="flex flex-wrap gap-2">
                  {typeZones.map((z) => (
                    <label key={z.type_zone_id} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        className="h-3 w-3"
                        checked={filters.typeZoneIds.includes(z.type_zone_id)}
                        onCheckedChange={() => toggleSelection(z.type_zone_id, "typeZoneIds")}
                      />
                      <span className="text-xs text-muted-foreground hover:text-primary transition-colors">{z.type_zone}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filtres statut admin/gestionnaire */}
        {(user?.role === "admin" || user?.role === "gestionnaire") && (
          <div className="flex gap-1.5 flex-wrap border-t pt-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> Statut :
            </span>
            {getStatutFilters().map(f => {
              const isActive = filter === f;
              const colorMap = {
                tous: isActive ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted",
                en_attente: isActive ? "bg-yellow-500 text-white border-yellow-500" : "text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
                valide: isActive ? "bg-green-600 text-white border-green-600" : "text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20",
                refuse: isActive ? "bg-red-600 text-white border-red-600" : "text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20",
                archive: isActive ? "bg-gray-600 text-white border-gray-600" : "text-gray-500 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20",
              };
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${colorMap[f]}`}
                >
                  {STATUT_CONFIG[f].label}
                  <span className="ml-1 opacity-70">({getCount(f)})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ Recommandations EN HAUT — avant la grille principale */}
      {user?.role === "client" && recommendations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Tent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Recommandés pour vous</h2>
              <p className="text-xs text-muted-foreground">Basé sur vos visites et réservations</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((camping) => (
              <CampingCard
                key={camping.camping_id}
                camping={camping}
                user={user}
                onStatusUpdate={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grille principale */}
      {filteredCampings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampings.map((camping) => (
            <CampingCard
              key={camping.camping_id || camping.id}
              camping={camping}
              user={user}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDelete}
              onEdit={(c) => setSelectedCamping(c)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl gap-3">
          <div className="p-3 bg-muted rounded-full">
            <Tent className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">Aucun camping trouvé</p>
            <p className="text-xs text-muted-foreground mt-1">
              {hasActiveFilters ? "Modifiez vos filtres." : "Aucun camping disponible."}
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={clearFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
      )}

      {/* Modal édition */}
      {selectedCamping && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-xl w-full max-w-2xl my-4 shadow-2xl">
            <EditCampingForm
              camping={selectedCamping}
              onSuccess={() => { setSelectedCamping(null); handleSearch(); }}
              onCancel={() => setSelectedCamping(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CampingsPage;