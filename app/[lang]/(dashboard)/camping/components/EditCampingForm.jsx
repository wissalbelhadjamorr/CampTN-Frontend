"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { CampingService } from "@/services/camping";
import { ServiceService } from "@/services/service";
import { TypeZoneService } from "@/services/typeZone";
import { ActiviteService } from "@/services/activite";
import { useAuth } from "@/hooks/useAuth";

const GOUVERNORATS = [
  { label: "Tunis", value: "tunis" },
  { label: "Ariana", value: "ariana" },
  { label: "Ben Arous", value: "ben arous" },
  { label: "Manouba", value: "manouba" },
  { label: "Nabeul", value: "nabeul" },
  { label: "Bizerte", value: "bizerte" },
  { label: "Béja", value: "beja" },
  { label: "Jendouba", value: "jendouba" },
  { label: "Kef", value: "kef" },
  { label: "Siliana", value: "siliana" },
  { label: "Sousse", value: "sousse" },
  { label: "Monastir", value: "monastir" },
  { label: "Mahdia", value: "mahdia" },
  { label: "Sfax", value: "sfax" },
  { label: "Kairouan", value: "kairouan" },
  { label: "Kasserine", value: "kasserine" },
  { label: "Sidi Bouzid", value: "sidi bouzid" },
  { label: "Gabès", value: "gabes" },
  { label: "Médenine", value: "medenine" },
  { label: "Tataouine", value: "tatouine" },
  { label: "Gafsa", value: "gafsa" },
  { label: "Tozeur", value: "tozeur" },
  { label: "Kébili", value: "kebili" },
  { label: "Zaghouan", value: "zaghouan" },
];

const schema = z.object({
  nom: z.string().min(1, "Le nom est obligatoire"),
  gouvernorat: z.string().min(1, "Le gouvernorat est obligatoire"),
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  telephone: z.string().regex(/^\d{8}$/, "Numéro tunisien invalide (8 chiffres)"),
  prix: z.coerce.number().min(0, "Le prix doit être positif"),
  nombrePlaces: z.coerce.number().min(1, "Minimum 1 place"),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  description: z.string().min(1, "La description est obligatoire"),
  serviceIds: z.array(z.coerce.number()).min(1, "Choisissez au moins un service"),
  typeZoneIds: z.array(z.coerce.number()).optional(),
  activiteIds: z.array(z.coerce.number()).optional(),
  autresActivites: z.string().optional(),
  autresServices: z.string().optional(),
});

const EditCampingForm = ({ camping, onSuccess, onCancel }) => {
  const { user, loading } = useAuth();
  const [isPending, startTransition] = React.useTransition();
  const [services, setServices] = useState([]);
  const [typeZones, setTypeZones] = useState([]);
  const [activites, setActivites] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTypeZones, setSelectedTypeZones] = useState([]);
  const [selectedActivites, setSelectedActivites] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState(camping.photos || []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: camping.nom || "",
      gouvernorat: camping.gouvernorat || "",
      adresse: camping.adresse || "",
      telephone: camping.telephone || "",
      prix: camping.prix || 0,
      latitude: camping.latitude || 0,
      longitude: camping.longitude || 0,
      nombrePlaces: camping.nombrePlaces || 10,
      description: camping.description || "",
      serviceIds: [],
      typeZoneIds: [],
      activiteIds: [],
      autresActivites: "",
      autresServices: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, typeZonesData, activitesData] = await Promise.all([
          ServiceService.getAllServices(),
          TypeZoneService.getAllTypeZones(),
          ActiviteService.getAllActivites(),
        ]);
        setServices(servicesData);
        setTypeZones(typeZonesData);
        setActivites(activitesData);

        const serviceIds = camping.services?.map(s => s.service_id) || [];
        const typeZoneIds = camping.typeZones?.map(t => t.type_zone_id) || [];
        const activiteIds = camping.activites?.map(a => a.activite_id) || [];
        setSelectedServices(serviceIds);
        setSelectedTypeZones(typeZoneIds);
        setSelectedActivites(activiteIds);
        setValue("serviceIds", serviceIds);
        setValue("typeZoneIds", typeZoneIds);
        setValue("activiteIds", activiteIds);
      } catch (err) {
        toast.error("Erreur lors du chargement");
      }
    };
    fetchData();
  }, []);

  const handleServiceChange = (id) => {
    const updated = selectedServices.includes(id)
      ? selectedServices.filter(s => s !== id)
      : [...selectedServices, id];
    setSelectedServices(updated);
    setValue("serviceIds", updated);
  };

  const handleTypeZoneChange = (id) => {
    const updated = selectedTypeZones.includes(id)
      ? selectedTypeZones.filter(t => t !== id)
      : [...selectedTypeZones, id];
    setSelectedTypeZones(updated);
    setValue("typeZoneIds", updated);
  };

  const handleActiviteChange = (id) => {
    const updated = selectedActivites.includes(id)
      ? selectedActivites.filter(a => a !== id)
      : [...selectedActivites, id];
    setSelectedActivites(updated);
    setValue("activiteIds", updated);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotos(prev => [...prev, ...files]);
    setNewPhotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleRemoveNewPhoto = (index) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingPhoto = (photoId) => {
    setExistingPhotos(prev => prev.filter(p => p.photo_id !== photoId));
  };
const onSubmit = (data) => {
  startTransition(async () => {
    try {
      const formData = new FormData();

      newPhotos.forEach(f => formData.append("photo", f));
      existingPhotos.forEach(p => formData.append("existingPhotos", p.url));

      formData.append("nom", data.nom);
      formData.append("gouvernorat", data.gouvernorat);
      formData.append("adresse", data.adresse);
      formData.append("telephone", data.telephone.trim());
      formData.append("prix", data.prix);
      formData.append("nombrePlaces", data.nombrePlaces);

      formData.append("latitude", data.latitude);
      formData.append("longitude", data.longitude);
      formData.append("description", data.description);
      if (data.autresServices) formData.append("autresServices", data.autresServices);
      if (data.autresActivites) formData.append("autresActivites", data.autresActivites);
      data.serviceIds.forEach(id => formData.append("serviceIds", String(id)));        
      data.typeZoneIds?.forEach(id => formData.append("typeZoneIds", String(id)));     
      data.activiteIds?.forEach(id => formData.append("activiteIds", String(id)));     
      await CampingService.updateCamping(camping.camping_id, formData);

      toast.success("Camping modifié avec succès !");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || "Erreur lors de la modification");
    }
  });
};

  if (loading) {
    return <div className="p-10 text-center">Chargement...</div>;
  }

  if (user?.role !== "gestionnaire") {
    return <div className="p-10 text-center">Accès refusé</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 overflow-y-auto max-h-[90vh]">
      <h2 className="text-xl font-bold mb-4">Modifier le camping</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Label>Nom du camping</Label>
          <Input {...register("nom")} disabled={isPending} />
          {errors.nom && <p className="text-destructive text-sm">{errors.nom.message}</p>}
        </div>

        <div>
          <Label>Gouvernorat</Label>
          <select {...register("gouvernorat")} disabled={isPending} className="w-full border rounded-md px-3 py-2 text-sm">
            <option value="">Choisir un gouvernorat</option>
            {GOUVERNORATS.map(g => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
          {errors.gouvernorat && <p className="text-destructive text-sm">{errors.gouvernorat.message}</p>}
        </div>

        <div>
          <Label>Adresse</Label>
          <Input {...register("adresse")} disabled={isPending} />
          {errors.adresse && <p className="text-destructive text-sm">{errors.adresse.message}</p>}
        </div>

        <div>
          <Label>Téléphone</Label>
          <Input type="text" placeholder="Ex: 22334455" {...register("telephone")} disabled={isPending} />
          {errors.telephone && <p className="text-destructive text-sm">{errors.telephone.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Prix (TND/nuit)</Label>
            <Input type="number" min="0" {...register("prix")} disabled={isPending} />
            {errors.prix && <p className="text-destructive text-sm">{errors.prix.message}</p>}
          </div>
          <div>
            
            <Label>Latitude</Label>
            <Input type="number" step="any" min="0"{...register("latitude")} disabled={isPending} />
          </div>
          <div>
            <Label>Longitude</Label>
            <Input type="number" step="any" min="0"{...register("longitude")} disabled={isPending} />
          </div>

  <div>
  <Label>Nombre de places</Label>
  <Input type="number" min="1" {...register("nombrePlaces")} disabled={isPending} />
  {errors.nombrePlaces && <p className="text-destructive text-sm">{errors.nombrePlaces.message}</p>}
</div>
        </div>

        <div>
          <Label>Description</Label>
          <textarea {...register("description")} disabled={isPending} className="w-full border rounded-md px-3 py-2 text-sm min-h-[70px]" />
          {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
        </div>

        <div>
          <Label>Photos existantes</Label>
          {existingPhotos.length > 0 ? (
            <div className="flex gap-2 mt-2 flex-wrap">
              {existingPhotos.map(photo => (
                <div key={photo.photo_id} className="relative">
                  <img src={photo.url} alt="photo" className="h-24 w-24 object-cover rounded-md" />
                  <button type="button" onClick={() => handleRemoveExistingPhoto(photo.photo_id)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Aucune photo existante.</p>
          )}
        </div>

        <div>
          <Label>Ajouter des photos</Label>
          <input type="file" accept="image/*" multiple onChange={handlePhotoChange} disabled={isPending} className="w-full border rounded-md px-3 py-2 text-sm" />
          {newPhotoPreviews.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {newPhotoPreviews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt={`preview-${i}`} className="h-24 w-24 object-cover rounded-md" />
                  <button type="button" onClick={() => handleRemoveNewPhoto(i)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5">
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Services</Label>
            <div className="grid grid-cols-1 gap-1 mt-2">
              {services.map(service => (
                <div key={service.service_id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`edit-service-${service.service_id}`}
                    checked={selectedServices.includes(service.service_id)}
                    onChange={() => handleServiceChange(service.service_id)}
                    disabled={isPending}
                  />
                  <label htmlFor={`edit-service-${service.service_id}`} className="text-sm">{service.nom}</label>
                </div>
              ))}
            </div>
            {errors.serviceIds && <p className="text-destructive text-sm">{errors.serviceIds.message}</p>}
          </div>

          <div>
            <Label>Types de zone</Label>
            <div className="grid grid-cols-1 gap-1 mt-2">
              {typeZones.map(typeZone => (
                <div key={typeZone.type_zone_id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`edit-typeZone-${typeZone.type_zone_id}`}
                    checked={selectedTypeZones.includes(typeZone.type_zone_id)}
                    onChange={() => handleTypeZoneChange(typeZone.type_zone_id)}
                    disabled={isPending}
                  />
                  <label htmlFor={`edit-typeZone-${typeZone.type_zone_id}`} className="text-sm">{typeZone.type_zone}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Label>Autres services:</Label>
          <Input {...register("autresServices")} disabled={isPending} placeholder="Ex: Jacuzzi, Sauna..." />
        </div>

        <div>
          <Label>Activités disponibles</Label>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {activites.map(activite => (
              <div key={activite.activite_id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`edit-activite-${activite.activite_id}`}
                  checked={selectedActivites.includes(activite.activite_id)}
                  onChange={() => handleActiviteChange(activite.activite_id)}
                  disabled={isPending}
                />
                <label htmlFor={`edit-activite-${activite.activite_id}`} className="text-sm">{activite.nom}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Autres activités:</Label>
          <Input {...register("autresActivites")} disabled={isPending} placeholder="Ex: Escalade, Parapente..." />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? <><Loader2 className="animate-spin h-4 w-4 mr-2" />Chargement...</> : "Modifier"}
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCampingForm;