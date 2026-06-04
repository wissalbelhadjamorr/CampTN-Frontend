"use client";

import { useState, useEffect, useRef } from "react"; 
import { useParams, useRouter } from "next/navigation";
import {
  MapPin, ArrowLeft, Heart, Calendar,
  Sun, Cloud, CloudRain, CloudSnow, Wind, Loader2, Phone, MessageSquare, X, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle2, Info, Users, Moon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import dynamic from "next/dynamic";
import { FavorisService } from "@/services/favoris";
import { AvisService } from "@/services/avis";
import { CampingService } from "@/services/camping";
import { ReservationService } from "@/services/reservation";
import { Rating } from "@/components/ui/rating";
import toast from "react-hot-toast";
import { AnalyticsService } from "@/services/analytics";

const CampingMap = dynamic(() => import("@/components/CampingMap"), { ssr: false });
const LOGIN_PATH = "/en/login";

const isDay = (meteo) => meteo?.is_day === 1;

const getWeatherIcon = (code, meteo) => {
  const day = isDay(meteo);
  if (code === 0) return day ? <Sun className="h-5 w-5 text-yellow-500" /> : <span className="text-lg">🌙</span>;
  if (code <= 3) return day ? <Cloud className="h-5 w-5 text-gray-300" /> : <span className="text-lg">☁️</span>;
  if (code <= 67) return <CloudRain className="h-5 w-5 text-blue-400" />;
  if (code <= 77) return <CloudSnow className="h-5 w-5 text-blue-200" />;
  return <Wind className="h-5 w-5 text-gray-400" />;
};

const getWeatherLabel = (code, meteo) => {
  const day = isDay(meteo);
  if (code === 0) return day ? "Ensoleillé" : "Ciel dégagé";
  if (code <= 3) return "Nuageux";
  if (code <= 67) return "Pluvieux";
  if (code <= 77) return "Neigeux";
  return "Venteux";
};

const FieldError = ({ message }) => {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 mt-1.5 flex items-start gap-1">
      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      {message}
    </p>
  );
};

const FieldInfo = ({ message }) => {
  if (!message) return null;
  return (
    <p className="text-xs text-blue-500 mt-1.5 flex items-start gap-1">
      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      {message}
    </p>
  );
};

const validateReservation = ({ dateDebut, dateFin, nombrePersonnes }) => {
  const errors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!dateDebut) {
    errors.dateDebut = "La date d'arrivée est obligatoire.";
  } else {
    const debut = new Date(dateDebut);
    if (debut < today) errors.dateDebut = "La date d'arrivée ne peut pas être dans le passé.";
  }

  if (!dateFin) {
    errors.dateFin = "La date de départ est obligatoire.";
  } else if (dateDebut) {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const nuits = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
    if (fin <= debut) {
      errors.dateFin = "La date de départ doit être au moins 1 nuit après la date d'arrivée.";
    } else if (nuits > 30) {
      errors.dateFin = "La durée maximale autorisée est de 30 nuits.";
    }
  }

  const nb = Number(nombrePersonnes);
  if (!nombrePersonnes || isNaN(nb) || nb < 1 || !Number.isInteger(nb)) {
    errors.nombrePersonnes = "Le nombre de personnes doit être un entier supérieur ou égal à 1.";
  } else if (nb > 20) {
    errors.nombrePersonnes = "Le nombre maximum de personnes est de 20.";
  }

  return errors;
};

const CampingDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [camping, setCamping] = useState(null);
  const [avisList, setAvisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavori, setIsFavori] = useState(false);
  const [favoriLoading, setFavoriLoading] = useState(false);
  const [meteo, setMeteo] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [avisLoading, setAvisLoading] = useState(false);
  const [editingAvis, setEditingAvis] = useState(null);
  const [editNote, setEditNote] = useState(0);
  const [editCommentaire, setEditCommentaire] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [nombrePersonnes, setNombrePersonnes] = useState(1);
  const [messageReservation, setMessageReservation] = useState("");
  const [nombreNuits, setNombreNuits] = useState(0);
  const [montantTotal, setMontantTotal] = useState(0);

  const [dateErrors, setDateErrors] = useState({});
  const [touched, setTouched] = useState({ dateDebut: false, dateFin: false, nombrePersonnes: false });

  const [statutReservation, setStatutReservation] = useState(null);
  const [dateFinSejour, setDateFinSejour] = useState(null);

  const [recommendations, setRecommendations] = useState([]);

  const viewTracked = useRef(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  const minDateFin = (() => {
    if (!dateDebut) return todayStr;
    const d = new Date(dateDebut);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  const fetchCamping = async () => {
    try {
      const data = await CampingService.getCampingById(id);
      setCamping(data);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvis = async () => {
    try {
      const data = await AvisService.getAvisByCamping(id);
      setAvisList(data);
    } catch (err) {
      console.error("Erreur avis:", err);
    }
  };

  useEffect(() => {
    if (id) { fetchCamping(); fetchAvis(); }
  }, [id]);

  useEffect(() => {
    const fetchMeteo = async () => {
      if (!camping?.latitude || !camping?.longitude) return;
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${camping.latitude}&longitude=${camping.longitude}&current_weather=true`
        );
        const data = await res.json();
        setMeteo(data.current_weather);
      } catch (err) {
        console.error("Erreur météo:", err);
      }
    };
    if (camping) fetchMeteo();
  }, [camping]);

  useEffect(() => {
    const checkFavori = async () => {
      if (user?.id && id) {
        const result = await FavorisService.isFavori(user.id, parseInt(id));
        setIsFavori(result);
      }
    };
    checkFavori();
  }, [user, id]);

  useEffect(() => {
    if (!camping) return;
    const errorsToShow = {};
    const allErrors = validateReservation({ dateDebut, dateFin, nombrePersonnes });
    if (touched.dateDebut && allErrors.dateDebut) errorsToShow.dateDebut = allErrors.dateDebut;
    if (touched.dateFin && allErrors.dateFin) errorsToShow.dateFin = allErrors.dateFin;
    if (touched.nombrePersonnes && allErrors.nombrePersonnes) errorsToShow.nombrePersonnes = allErrors.nombrePersonnes;
    setDateErrors(errorsToShow);

    if (dateDebut && dateFin && !allErrors.dateDebut && !allErrors.dateFin) {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      const nuits = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));
      if (nuits > 0 && nuits <= 30) {
        setNombreNuits(nuits);
        setMontantTotal(nuits * camping.prix * (nombrePersonnes >= 1 ? nombrePersonnes : 1));
        return;
      }
    }
    setNombreNuits(0);
    setMontantTotal(0);
  }, [dateDebut, dateFin, nombrePersonnes, camping, touched]);

  useEffect(() => {
    const checkReservation = async () => {
      if (!user || user.role !== "client" || !id) return;
      try {
        const data = await ReservationService.checkReservationPourAvis(parseInt(id));
        setStatutReservation(data.statut);
        if (data.dateFin) setDateFinSejour(data.dateFin);
      } catch {
        setStatutReservation("non_reserve");
      }
    };
    checkReservation();
  }, [user, id]);

  useEffect(() => {
    const handleKey = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex(i => (i + 1) % camping.photos.length);
      if (e.key === "ArrowLeft") setLightboxIndex(i => (i - 1 + camping.photos.length) % camping.photos.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, camping]);

  useEffect(() => {
    if (!camping?.camping_id || !user?.id) return;
    if (viewTracked.current) return;
    viewTracked.current = true;

    AnalyticsService.trackView(parseInt(id), camping.gouvernorat);

    if (user.role === "client") {
      AnalyticsService.getRecommendations(parseInt(id)).then(data => {
        setRecommendations(Array.isArray(data) ? data : []);
      });
    }
  }, [camping?.camping_id, user?.id]);

  const handleFavori = async () => {
    if (!user) { router.push(LOGIN_PATH); return; }
    setFavoriLoading(true);
    try {
      if (isFavori) {
        const favoris = await FavorisService.getFavoris(user.id);
        const favori = favoris.find((f) => f.camping.camping_id === parseInt(id));
        if (favori) await FavorisService.deleteFavori(favori.favori_id);
        setIsFavori(false);
        await AnalyticsService.trackFavorite(parseInt(id), camping.gouvernorat); // ← optionnel : tracker le retrait différemment
      } else {
        await FavorisService.addFavori(user.id, parseInt(id));
        setIsFavori(true);
        await AnalyticsService.trackFavorite(parseInt(id), camping.gouvernorat);
      }
    } catch (err) {
      console.error("Erreur favori:", err);
    } finally {
      setFavoriLoading(false);
    }
  };

  const handleReservation = () => {
    if (!user) { router.push(LOGIN_PATH); return; }
    setShowReservationForm(true);
  };

  const handleContacterGestionnaire = () => {
    if (!user) { router.push(LOGIN_PATH); return; }
    router.push(`/en/messages?destinataire=${camping.utilisateur?.utilisateur_id}`);
  };

  const closeModal = () => {
    setShowReservationForm(false);
    setDateDebut("");
    setDateFin("");
    setNombrePersonnes(1);
    setMessageReservation("");
    setNombreNuits(0);
    setMontantTotal(0);
    setDateErrors({});
    setTouched({ dateDebut: false, dateFin: false, nombrePersonnes: false });
  };

  const handleSubmitReservation = async () => {
    setTouched({ dateDebut: true, dateFin: true, nombrePersonnes: true });
    const errors = validateReservation({ dateDebut, dateFin, nombrePersonnes });
    setDateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setReservationLoading(true);
    try {
      await ReservationService.createReservation({
        campingId: parseInt(id),
        dateDebut,
        dateFin,
        nombrePersonnes,
        message: messageReservation,
      });
      toast.success("Demande de réservation envoyée !");
      closeModal();
    } catch (err) {
      toast.error(err.message || "Erreur lors de la réservation");
    } finally {
      setReservationLoading(false);
    }
  };

  const handleAddAvis = async () => {
    if (!user) { router.push(LOGIN_PATH); return; }
    if (note === 0) { toast.error("Choisissez une note"); return; }
    setAvisLoading(true);
    try {
      await AvisService.addAvis(id, note, commentaire);
      toast.success("Avis envoyé, merci d'avoir partagé votre expérience !");
      await fetchAvis();
      setNote(0);
      setCommentaire("");
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'envoi");
    } finally {
      setAvisLoading(false);
    }
  };

  const handleUpdateAvis = async (avisId) => {
    setEditLoading(true);
    try {
      await AvisService.updateAvis(avisId, editNote, editCommentaire);
      toast.success("Avis modifié, en attente de validation !");
      setEditingAvis(null);
      await fetchAvis();
    } catch (err) {
      toast.error(err.message || "Erreur lors de la modification");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteAvis = async (avisId) => {
    if (!confirm("Supprimer cet avis ?")) return;
    try {
      await AvisService.deleteAvis(avisId);
      toast.success("Avis supprimé !");
      await fetchAvis();
    } catch (err) {
      toast.error(err.message || "Erreur lors de la suppression");
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;
  if (!camping) return <div className="p-10 text-center">Camping introuvable</div>;

  const isClient = user?.role === "client";
  const avisValides = avisList.filter(a => a.statut === "valide");
  const avisEnAttente = avisList.filter(a =>
    a.statut === "en_attente" &&
    user && Number(user.id) === Number(a.utilisateur?.utilisateur_id)
  );

  const hasErrors = Object.keys(dateErrors).length > 0;
  const canSubmit = !hasErrors && nombreNuits >= 1;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>

      {/* ── Photos ────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        {camping.photos?.length > 0 ? (
          <div className={`grid gap-2 ${
            camping.photos.length === 1 ? "grid-cols-1" :
            camping.photos.length === 2 ? "grid-cols-2" :
            "grid-cols-2 md:grid-cols-3"
          }`}>
            {camping.photos.map((photo, index) => (
              <div
                key={photo.photo_id}
                className="relative h-48 rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={photo.url}
                  alt={camping.nom}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = "https://placehold.co/800x400?text=Pas+de+photo"; }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">🔍 Agrandir</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative h-72 w-full rounded-xl overflow-hidden">
            <img
              src="https://placehold.co/800x400?text=Pas+de+photo"
              alt={camping.nom}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          {meteo && (
            <div className="bg-black/60 backdrop-blur-sm text-white rounded-xl px-3 py-2 flex items-center gap-2 text-sm">
              {getWeatherIcon(meteo.weathercode, meteo)}
              <span className="font-bold">{Math.round(meteo.temperature)}°C</span>
              <span className="text-gray-300">· {getWeatherLabel(meteo.weathercode, meteo)}</span>
              <span className="text-gray-400 text-xs">· {meteo.windspeed} km/h</span>
            </div>
          )}
          <div className="flex gap-2">
            <Badge className="bg-primary capitalize">{camping.gouvernorat}</Badge>
          </div>
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && camping.photos?.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-10" onClick={() => setLightboxIndex(null)}>
            <X className="h-8 w-8" />
          </button>
          {camping.photos.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white hover:text-gray-300 z-10 bg-black/40 rounded-full p-2"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + camping.photos.length) % camping.photos.length); }}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                className="absolute right-4 text-white hover:text-gray-300 z-10 bg-black/40 rounded-full p-2"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % camping.photos.length); }}
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <img
            src={camping.photos[lightboxIndex]?.url}
            alt={camping.nom}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 text-white text-sm">
            {lightboxIndex + 1} / {camping.photos.length}
          </div>
        </div>
      )}

      {/* ── Infos + carte prix ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold uppercase mb-2">{camping.nom}</h1>
          <p className="flex items-center gap-1 text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            {camping.adresse}, {camping.gouvernorat}
          </p>
          {camping.telephone && (
            <p className="flex items-center gap-1 text-muted-foreground mb-4">
              <Phone className="h-4 w-4" />
              {camping.telephone}
            </p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{camping.description}</p>
        </div>

        <div className="bg-card border rounded-xl p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Prix / nuit / personne</p>
            <p className="text-3xl font-bold text-green-600">{camping.prix} DT</p>
          </div>
          {isClient && (
            <>
              <Button className="w-full gap-2" onClick={handleReservation}>
                <Calendar className="h-4 w-4" />
                Réserver
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleFavori} disabled={favoriLoading}>
                <Heart className={`h-4 w-4 ${isFavori ? "fill-red-500 text-red-500" : ""}`} />
                {isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
              </Button>
              {camping.utilisateur?.utilisateur_id && (
                <Button variant="outline" className="w-full gap-2" onClick={handleContacterGestionnaire}>
                  <MessageSquare className="h-4 w-4" />
                  Contacter le gestionnaire
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Services disponibles ({camping.services?.length || 0})</h2>
        {camping.services?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {camping.services.map((s) => (
              <Badge key={s.service_id} variant="outline" className="text-sm px-3 py-1">{s.nom}</Badge>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-sm">Aucun service disponible.</p>}
      </div>

      {/* ── Activités ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Activités ({camping.activites?.length || 0})</h2>
        {camping.activites?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {camping.activites.map((a) => (
              <Badge key={a.activite_id} className="text-sm px-3 py-1 bg-green-100 text-green-800">{a.nom}</Badge>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-sm">Aucune activité disponible.</p>}
      </div>

      {/* ── Types de zone ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Types de zone ({camping.typeZones?.length || 0})</h2>
        {camping.typeZones?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {camping.typeZones.map((t) => (
              <Badge key={t.type_zone_id} variant="secondary" className="text-sm px-3 py-1">{t.type_zone}</Badge>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-sm">Aucun type de zone défini.</p>}
      </div>

      {/* ── Carte ─────────────────────────────────────────────────────────── */}
      {camping.latitude && camping.longitude && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">Localisation</h2>
          <CampingMap latitude={parseFloat(camping.latitude)} longitude={parseFloat(camping.longitude)} nom={camping.nom} />
        </div>
      )}

      {/* ── Avis (clients uniquement) ─────────────────────────────────────── */}
      {isClient && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">Avis ({avisValides.length})</h2>

          {statutReservation === "peut" && (
            <div className="bg-card border rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold mb-2">Laisser un avis</p>
              <Rating value={note} onChange={setNote} style={{ maxWidth: 120 }} className="mb-3" />
              <Textarea
                placeholder="Partagez votre expérience..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={3}
                className="text-sm mb-3"
              />
              <Button onClick={handleAddAvis} disabled={avisLoading || note === 0} className="w-full">
                {avisLoading ? <><Loader2 className="animate-spin h-4 w-4 mr-2" />Envoi...</> : "Envoyer l'avis"}
              </Button>
            </div>
          )}

          {statutReservation === "sejour_en_cours" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-4 text-sm text-blue-700 dark:text-blue-300">
              Votre séjour est en cours. Vous pourrez laisser un avis après le{" "}
              <span className="font-semibold">
                {dateFinSejour ? new Date(dateFinSejour).toLocaleDateString("fr-FR") : "la fin de votre séjour"}
              </span>.
            </div>
          )}

          {statutReservation === "non_reserve" && (
            <div className="bg-muted border rounded-xl p-4 mb-4 text-sm text-muted-foreground">
              Réservez ce camping et séjournez-y pour pouvoir laisser un avis.
            </div>
          )}

          {avisEnAttente.length > 0 && (
            <div className="space-y-3 mb-3">
              {avisEnAttente.map((avis) => (
                <div key={avis.avis_id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
                  {editingAvis === avis.avis_id ? (
                    <div className="space-y-2">
                      <Rating value={editNote} onChange={setEditNote} style={{ maxWidth: 120 }} />
                      <Textarea value={editCommentaire} onChange={(e) => setEditCommentaire(e.target.value)} rows={2} className="text-sm" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdateAvis(avis.avis_id)} disabled={editLoading} className="flex-1">
                          {editLoading ? <Loader2 className="animate-spin h-3 w-3" /> : "Sauvegarder"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingAvis(null)} className="flex-1">Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Rating value={avis.note} readOnly style={{ maxWidth: 80 }} />
                          <span className="text-xs text-muted-foreground">{avis.note}/5</span>
                          <Badge className="bg-yellow-500 text-white text-xs">En attente de validation</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
                            onClick={() => { setEditingAvis(avis.avis_id); setEditNote(avis.note); setEditCommentaire(avis.commentaire || ""); }}>
                            Modifier
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteAvis(avis.avis_id)}>
                            Supprimer
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm">{avis.commentaire}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {avisValides.length > 0 ? (
            <div className="space-y-3">
              {avisValides.map((avis) => {
                const isOwner = user && Number(user.id) === Number(avis.utilisateur?.utilisateur_id);
                return (
                  <div key={avis.avis_id} className="bg-card border rounded-xl p-4">
                    {editingAvis === avis.avis_id ? (
                      <div className="space-y-2">
                        <Rating value={editNote} onChange={setEditNote} style={{ maxWidth: 120 }} />
                        <Textarea value={editCommentaire} onChange={(e) => setEditCommentaire(e.target.value)} rows={2} className="text-sm" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateAvis(avis.avis_id)} disabled={editLoading} className="flex-1">
                            {editLoading ? <Loader2 className="animate-spin h-3 w-3" /> : "Sauvegarder"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingAvis(null)} className="flex-1">Annuler</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Rating value={avis.note} readOnly style={{ maxWidth: 80 }} />
                            <span className="text-xs text-muted-foreground">{avis.note}/5</span>
                          </div>
                          {isOwner && (
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteAvis(avis.avis_id)}>
                              Supprimer
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{avis.commentaire}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {avis.utilisateur?.prenom} {avis.utilisateur?.nom} — {new Date(avis.date).toLocaleDateString("fr-FR")}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            avisEnAttente.length === 0 && <p className="text-muted-foreground text-sm">Aucun avis pour le moment.</p>
          )}
        </div>
      )}

      {isClient && recommendations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Campings similaires</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map(c => (
              <div
                key={c.camping_id}
                className="bg-card border rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/en/camping/${c.camping_id}`)}
              >
                <div className="h-36 overflow-hidden">
                  <img
                    src={c.photos?.[0]?.url || "https://placehold.co/400x200?text=Camping"}
                    alt={c.nom}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = "https://placehold.co/400x200?text=Camping"; }}
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{c.nom}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />{c.gouvernorat}
                  </p>
                  {c.moyenneAvis > 0 && (
                    <p className="text-xs text-yellow-500 mt-1">
                      {"★".repeat(Math.round(c.moyenneAvis))}{"☆".repeat(5 - Math.round(c.moyenneAvis))}{" "}
                      <span className="text-muted-foreground">{c.moyenneAvis.toFixed(1)}/5</span>
                    </p>
                  )}
                  <p className="text-xs font-semibold text-green-600 mt-1">{c.prix} DT / nuit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReservationForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold">Demande de réservation</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{camping.nom}</p>
              </div>
              <button
                onClick={closeModal}
                disabled={reservationLoading}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3.5 py-3">
                <Moon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  <span className="font-semibold">Durée minimale : 1 nuit.</span> La date de départ doit être au moins le lendemain de la date d'arrivée. Durée maximale : 30 nuits.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">
                    Date d'arrivée <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={dateDebut}
                    min={todayStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDateDebut(val);
                      if (dateFin) {
                        if (new Date(dateFin) <= new Date(val)) {
                          setDateFin("");
                          setTouched(t => ({ ...t, dateFin: false }));
                        }
                      }
                      setTouched(t => ({ ...t, dateDebut: true }));
                    }}
                    onBlur={() => setTouched(t => ({ ...t, dateDebut: true }))}
                    className={`text-sm ${
                      dateErrors.dateDebut
                        ? "border-red-400 focus-visible:ring-red-400 bg-red-50 dark:bg-red-950/20"
                        : dateDebut && !dateErrors.dateDebut
                          ? "border-green-400 focus-visible:ring-green-400"
                          : ""
                    }`}
                  />
                  <FieldError message={dateErrors.dateDebut} />
                  {!dateErrors.dateDebut && !dateDebut && (
                    <FieldInfo message="Sélectionnez votre date d'arrivée" />
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">
                    Date de départ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={dateFin}
                    min={minDateFin}
                    disabled={!dateDebut || !!dateErrors.dateDebut}
                    onChange={(e) => {
                      setDateFin(e.target.value);
                      setTouched(t => ({ ...t, dateFin: true }));
                    }}
                    onBlur={() => setTouched(t => ({ ...t, dateFin: true }))}
                    className={`text-sm ${
                      !dateDebut || dateErrors.dateDebut
                        ? "opacity-50 cursor-not-allowed"
                        : dateErrors.dateFin
                          ? "border-red-400 focus-visible:ring-red-400 bg-red-50 dark:bg-red-950/20"
                          : dateFin && !dateErrors.dateFin
                            ? "border-green-400 focus-visible:ring-green-400"
                            : ""
                    }`}
                  />
                  <FieldError message={dateErrors.dateFin} />
                  {!dateErrors.dateFin && !dateFin && dateDebut && !dateErrors.dateDebut && (
                    <FieldInfo message={`Minimum : ${new Date(minDateFin).toLocaleDateString("fr-FR")}`} />
                  )}
                  {!dateDebut && (
                    <p className="text-xs text-muted-foreground mt-1.5 italic">Choisissez d'abord la date d'arrivée.</p>
                  )}
                </div>
              </div>

              {nombreNuits >= 1 && !dateErrors.dateDebut && !dateErrors.dateFin && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl px-3.5 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                    {nombreNuits} nuit{nombreNuits > 1 ? "s" : ""} sélectionnée{nombreNuits > 1 ? "s" : ""} — du{" "}
                    {new Date(dateDebut).toLocaleDateString("fr-FR")} au{" "}
                    {new Date(dateFin).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground block mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Nombre de personnes <span className="text-red-500">*</span>
                  </span>
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={nombrePersonnes}
                  onChange={(e) => {
                    setNombrePersonnes(parseInt(e.target.value) || "");
                    setTouched(t => ({ ...t, nombrePersonnes: true }));
                  }}
                  onBlur={() => setTouched(t => ({ ...t, nombrePersonnes: true }))}
                  className={`text-sm ${
                    dateErrors.nombrePersonnes
                      ? "border-red-400 focus-visible:ring-red-400 bg-red-50 dark:bg-red-950/20"
                      : nombrePersonnes >= 1 && !dateErrors.nombrePersonnes
                        ? "border-green-400 focus-visible:ring-green-400"
                        : ""
                  }`}
                />
                <FieldError message={dateErrors.nombrePersonnes} />
                {!dateErrors.nombrePersonnes && (
                  <p className="text-xs text-muted-foreground mt-1.5">Entre 1 et 20 personnes.</p>
                )}
              </div>

              {nombreNuits >= 1 && !hasErrors && (
                <div className="bg-muted/60 rounded-xl p-4 border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-2 tracking-wide">Récapitulatif</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{camping.prix} DT × {nombreNuits} nuit{nombreNuits > 1 ? "s" : ""} × {nombrePersonnes} pers.</span>
                      <span>{montantTotal} DT</span>
                    </div>
                    <div className="border-t border-border pt-1.5 flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-green-600">{montantTotal} DT</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button className="flex-1" onClick={handleSubmitReservation} disabled={reservationLoading || !canSubmit}>
                  {reservationLoading
                    ? <><Loader2 className="animate-spin h-4 w-4 mr-2" />Envoi en cours...</>
                    : "Confirmer la demande"
                  }
                </Button>
                <Button variant="outline" className="flex-1" onClick={closeModal} disabled={reservationLoading}>
                  Annuler
                </Button>
              </div>

              {!canSubmit && (touched.dateDebut || touched.dateFin) && !reservationLoading && (
                <p className="text-xs text-center text-muted-foreground -mt-2">
                  Veuillez corriger les erreurs pour continuer.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampingDetailPage;