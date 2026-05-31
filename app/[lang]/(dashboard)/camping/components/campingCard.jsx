"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { MapPin, Info, Check, X, Edit, Trash2, Cloud, Sun, CloudRain, CloudSnow, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

const isDay = (meteo) => meteo?.is_day === 1;

const getWeatherIcon = (code, meteo) => {
  const day = isDay(meteo);
  if (code === 0) return day ? <Sun className="h-4 w-4 text-yellow-500" /> : <span className="text-sm">🌙</span>;
  if (code <= 3) return day ? <Cloud className="h-4 w-4 text-gray-400" /> : <span className="text-sm">☁️</span>;
  if (code <= 67) return <CloudRain className="h-4 w-4 text-blue-500" />;
  if (code <= 77) return <CloudSnow className="h-4 w-4 text-blue-200" />;
  return <Wind className="h-4 w-4 text-gray-500" />;
};

const getWeatherLabel = (code, meteo) => {
  const day = isDay(meteo);
  if (code === 0) return day ? "Ensoleillé" : "Ciel dégagé";
  if (code <= 3) return "Nuageux";
  if (code <= 67) return "Pluvieux";
  if (code <= 77) return "Neigeux";
  return "Venteux";
};

const CampingCard = ({ camping, user, onStatusUpdate, onEdit, onDelete }) => {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || "en";
  const [meteo, setMeteo] = useState(null);

  const isAdmin = user?.role === "admin";
  const isGestionnaire = user?.role === "gestionnaire";
  const isOwner = camping?.utilisateur?.utilisateur_id === user?.id;

  useEffect(() => {
    const fetchMeteo = async () => {
      if (!camping.latitude || !camping.longitude) return;
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
    fetchMeteo();
  }, [camping.latitude, camping.longitude]);

  const nbServices = camping.services?.length || 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col bg-card">

      <div className="relative h-48 w-full bg-muted">
        {camping.photos?.length > 0 ? (
          <Carousel className="h-full w-full">
            <CarouselContent className="h-full">
              {camping.photos.map((photo) => (
                <CarouselItem key={photo.photo_id} className="h-full">
                  <img
                    src={photo.url}
                    alt={camping.nom}
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/400x320?text=Image+non+trouvee";
                    }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {camping.photos.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        ) : (
          <img
            src="https://placehold.co/400x320?text=Pas+de+photo"
            alt={camping.nom}
            className="h-full w-full object-cover"
          />
        )}

        {(isAdmin || (isGestionnaire && isOwner)) && (
          <Badge className={`absolute top-2 left-2 z-10 ${
            camping.statut === 'valide' ? 'bg-green-600' :
            camping.statut === 'archive' ? 'bg-gray-600' :
            camping.statut === 'refuse' ? 'bg-red-600' : 'bg-yellow-600'
          }`}>
            {camping.statut}
          </Badge>
        )}

        <Badge className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground">
          {camping.gouvernorat || "Destination"}
        </Badge>

        {meteo && (
          <div className="absolute bottom-2 right-2 z-10 bg-black/60 text-white rounded-lg px-2 py-1 flex items-center gap-1 text-xs">
            {getWeatherIcon(meteo.weathercode, meteo)}
            <span>{Math.round(meteo.temperature)}°C</span>
            <span className="text-gray-300">· {getWeatherLabel(meteo.weathercode, meteo)}</span>
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-primary uppercase text-lg font-bold truncate">
          {camping.nom}
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs">
          <MapPin className="h-3 w-3" /> {camping.adresse || camping.gouvernorat}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {camping.description}
        </p>

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold italic">Prix / nuit</span>
            <span className="text-xl font-bold text-green-600">{camping.prix} DT</span>
          </div>
          <Badge variant="outline" className="h-6 border-primary/30 text-primary">
            {nbServices} {nbServices > 1 ? "services" : "service"}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 border-t border-border flex flex-col gap-2">

        {/* ── Admin : camping en attente ── */}
        {isAdmin && camping.statut === 'en_attente' && (
          <>
            <div className="flex gap-2 w-full">
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 gap-1 text-white"
                onClick={() => onStatusUpdate(camping.camping_id, 'valide')}
              >
                <Check className="h-4 w-4" /> Valider
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-red-600 hover:bg-red-700 gap-1 text-white"
                onClick={() => onStatusUpdate(camping.camping_id, 'refuse')}
              >
                <X className="h-4 w-4" /> Refuser
              </Button>
            </div>
            <Button
              size="sm"
              className="w-full gap-1 bg-gray-600 hover:bg-gray-700 text-white"
              onClick={() => onStatusUpdate(camping.camping_id, 'archive')}
            >
              Archiver
            </Button>
          </>
        )}

        {/* ── Admin : camping validé → peut archiver ── */}
        {isAdmin && camping.statut === 'valide' && (
          <Button
            size="sm"
            className="w-full gap-1 bg-gray-600 hover:bg-gray-700 text-white"
            onClick={() => onStatusUpdate(camping.camping_id, 'archive')}
          >
            Archiver
          </Button>
        )}



        {/* ── Gestionnaire propriétaire ── */}
        {isGestionnaire && isOwner && (
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1"
              onClick={() => onEdit(camping)}
            >
              <Edit className="h-4 w-4" /> Modifier
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => onDelete(camping.camping_id)}
            >
              <Trash2 className="h-4 w-4" /> Supprimer
            </Button>
          </div>
        )}

        <Button
          className="w-full gap-2"
          variant="secondary"
          size="sm"
          onClick={() => router.push(`/${lang}/camping/${camping.camping_id}`)}
        >
          <Info className="h-4 w-4" /> Détails
        </Button>

      </CardFooter>
    </Card>
  );
};

export default CampingCard;