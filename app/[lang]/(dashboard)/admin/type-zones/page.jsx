"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Edit, Plus, Type } from "lucide-react";
import toast from "react-hot-toast";

const TypeZonesPage = () => {
  const [typeZones, setTypeZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [newNom, setNewNom] = useState("");
  const [editItem, setEditItem] = useState(null); // ← { type_zone_id, type_zone }
  const [editNom, setEditNom] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { 
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}` 
  };

  const fetchTypeZones = async () => {
    try {
      setLoading(true);
      const res = await TypeZone.TypeZone.getAll(headers);
      const data = await res.json();
      setTypeZones(data);
    } catch (err) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypeZones();
  }, []);

  const handleAdd = async () => {
    if (!newNom.trim()) return toast.error("Le nom est obligatoire");
    setIsPending(true);
    try {
      const res = await TypeZone.TypeZone.create({ nom: newNom }, headers);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast.success("Type de zone ajouté !");
      setNewNom("");
      fetchTypeZones();
    } catch (err) {
      toast.error(err.message || "Erreur");
    } finally {
      setIsPending(false);
    }
  };

  const handleEdit = async () => {
    if (!editNom.trim()) return toast.error("Le nom est obligatoire");
    setIsPending(true);
    try {
      const res = await TypeZone.TypeZone.update(editItem.type_zone_id, { nom: editNom }, headers);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast.success("Type de zone modifié !");
      setEditItem(null);
      setEditNom("");
      fetchTypeZones();
    } catch (err) {
      toast.error(err.message || "Erreur");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce type de zone ?")) return;
    try {
      const res = await TypeZone.TypeZone.delete(id, headers);
      if (!res.ok) throw new Error("Erreur");
      toast.success("Type de zone supprimé !");
      fetchTypeZones();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Gérer les Types de Zone</h1>

      <div className="bg-card border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Ajouter un type de zone</h2>
        <div className="flex gap-2">
          <Input
            value={newNom}
            onChange={(e) => setNewNom(e.target.value)}
            placeholder="Ex: Forêt, Plage, Montagne..."
            disabled={isPending}
          />
          <Button onClick={handleAdd} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Ajouter</>}
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Liste des types de zone</h2>

        {loading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : typeZones.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">Aucun type de zone</p>
        ) : (
          <div className="space-y-2">
            {typeZones.map(typeZone => (
              <div key={typeZone.type_zone_id} className="flex items-center justify-between p-3 border rounded-lg">
                
                {editItem?.type_zone_id === typeZone.type_zone_id ? (
                  <div className="flex gap-2 flex-1">
                    <Input
                      value={editNom}
                      onChange={(e) => setEditNom(e.target.value)}
                      disabled={isPending}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleEdit} disabled={isPending}>
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sauvegarder"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditItem(null); setEditNom(""); }}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium">{typeZone.type_zone}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditItem(typeZone); setEditNom(typeZone.type_zone); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(typeZone.type_zone_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TypeZonesPage;