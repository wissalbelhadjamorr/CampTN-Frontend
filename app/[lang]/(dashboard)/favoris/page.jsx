"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Heart, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { FavorisService } from "@/services/favoris";


const PhotoCarousel = ({ photos, nom }) => {
  const [index, setIndex] = useState(0);
  if (!photos?.length) return (
    <img
      src="https://placehold.co/400x200?text=Pas+de+photo"
      alt={nom}
      className="w-full h-full object-cover"
    />
  );
  return (
    <div className="relative w-full h-full">
      <img
        src={photos[index]?.url?.startsWith("http") ? photos[index].url : `http://localhost:3000/uploads/${photos[index].url}`}
        alt={nom}
        className="w-full h-full object-cover"
        onError={(e) => { e.target.src = "https://placehold.co/400x200?text=Pas+de+photo"; }}
      />
      {photos.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 z-10 transition-colors"
            onClick={(e) => { e.stopPropagation(); setIndex(i => (i - 1 + photos.length) % photos.length); }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 z-10 transition-colors"
            onClick={(e) => { e.stopPropagation(); setIndex(i => (i + 1) % photos.length); }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? "bg-white scale-125" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const FavorisPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [favoris, setFavoris] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchFavoris = async () => {
      if (!user?.id) return;
      try {
        const data = await FavorisService.getFavoris(user.id);
        setFavoris(data);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setFetching(false);
      }
    };
    if (!loading) fetchFavoris();
  }, [user, loading]);

  const handleSupprimer = async (favori_id) => {
    try {
      await FavorisService.deleteFavori(favori_id);
      setFavoris(prev => prev.filter(f => f.favori_id !== favori_id));
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  if (loading || fetching) return <div className="p-10 text-center">Chargement...</div>;
  if (!user) return <div className="p-10 text-center">Connectez-vous pour voir vos favoris.</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold">Mes Favoris</h1>
        <Badge variant="outline">{favoris.length}</Badge>
      </div>

      {favoris.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg">Aucun favori pour le moment.</p>
          <Button className="mt-4" onClick={() => router.push("/camping")}>
            Explorer les campings
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoris.map((favori) => {
            const camping = favori.camping;
            return (
              <div
                key={favori.favori_id}
                className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative h-44 w-full shrink-0">
                  <PhotoCarousel photos={camping.photos} nom={camping.nom} />
                  <Badge className="absolute top-3 right-3 bg-primary capitalize z-10">
                    {camping.gouvernorat}
                  </Badge>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h2 className="font-bold text-lg uppercase mb-1 line-clamp-2 leading-tight">
                    {camping.nom}
                  </h2>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{camping.adresse}</span>
                  </p>
                  <p className="text-green-600 font-bold text-xl mb-4 mt-auto">
                    {camping.prix} DT <span className="text-sm font-normal text-muted-foreground">/ nuit</span>
                  </p>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => router.push(`/en/camping/${camping.camping_id}`)}
                    >
                      Voir détails
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                      onClick={() => handleSupprimer(favori.favori_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavorisPage;