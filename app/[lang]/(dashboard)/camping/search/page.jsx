"use client";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { CampingService } from "@/services/camping";
import CampingCard from "@/app/[lang]/(dashboard)/camping/components/campingCard";

const SearchPage = () => {
  const [campings, setCampings] = useState([]);
  const [gouvernorats, setGouvernorats] = useState([]);
  const [services, setServices] = useState([]);
  const [typeZones, setTypeZones] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    nom: "",
    gouvernorat: "all",
    prixMin: 0,
    prixMax: 100,
    serviceIds: [],
    typeZoneIds: [],
  });

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const results = await CampingService.searchCampings({
        nom: filters.nom || undefined,
        gouvernorat:
          filters.gouvernorat !== "all" ? filters.gouvernorat : undefined,
        prixMin: filters.prixMin,
        prixMax: filters.prixMax,
        serviceIds: filters.serviceIds.length ? filters.serviceIds : undefined,
        typeZoneIds: filters.typeZoneIds.length
          ? filters.typeZoneIds
          : undefined,
      });

      setCampings(results);
    } catch (err) {
      console.error("Erreur recherche:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
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
      }
    };

    loadInitialData();
  }, []);

  const toggleSelection = (id, key) => {
    setFilters((prev) => {
      const list = prev[key];
      const exists = list.includes(id);
      return {
        ...prev,
        [key]: exists ? list.filter((i) => i !== id) : [...list, id],
      };
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">
        Trouver un camping
      </h1>

      <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-sm border border-default-200 mb-10 space-y-6">

        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700">Nom du lieu</label>
          <Input
            placeholder="Rechercher..."
            className="bg-default-50 border-default-200 focus:border-primary"
            value={filters.nom}
            onChange={(e) =>
              setFilters({ ...filters, nom: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-default-700">Gouvernorat</label>
          <Select
            value={filters.gouvernorat}
            onValueChange={(val) =>
              setFilters({ ...filters, gouvernorat: val })
            }
          >
            <SelectTrigger className="bg-default-50 border-default-200 text-default-900">
              <SelectValue placeholder="Toute la Tunisie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toute la Tunisie</SelectItem>
              {gouvernorats.map((gov) => (
                <SelectItem key={gov} value={gov}>
                  {gov}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <label className="text-sm font-medium text-default-700">Prix par nuité (DT)</label>
             <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                {filters.prixMin} - {filters.prixMax} DT
             </span>
          </div>
          <Slider
            value={[filters.prixMin, filters.prixMax]}
            min={0}
            max={500}
            step={5}
            onValueChange={(val) =>
              setFilters({
                ...filters,
                prixMin: val[0],
                prixMax: val[1],
              })
            }
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-default-700 block">Services</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {services.map((s) => (
              <label key={s.service_id} className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.serviceIds.includes(s.service_id)}
                  onCheckedChange={() =>
                    toggleSelection(s.service_id, "serviceIds")
                  }
                />
                <span className="text-sm text-default-600 group-hover:text-primary transition-colors">
                  {s.nom}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-sm font-medium text-default-700 block border-t border-default-100 pt-4">Type de zone</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {typeZones.map((z) => (
              <label key={z.type_zone_id} className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.typeZoneIds.includes(z.type_zone_id)}
                  onCheckedChange={() =>
                    toggleSelection(z.type_zone_id, "typeZoneIds")
                  }
                />
                <span className="text-sm text-default-600 group-hover:text-primary transition-colors">
                  {z.type_zone}
                </span> 
              </label>
            ))}
          </div>
        </div>

        <Button 
          className="w-full h-12 text-base font-semibold shadow-md"
          color="primary" 
          onClick={handleSearch} 
          disabled={loading}
        >
          {loading ? "Recherche en cours..." : "Appliquer les filtres"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campings.map((c) => (
          <CampingCard key={c.camping_id} camping={c} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;