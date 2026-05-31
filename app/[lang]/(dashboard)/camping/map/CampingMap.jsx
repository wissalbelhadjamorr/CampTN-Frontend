"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CampingService } from "@/services/camping";

export default function CampingMap() {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [campings, setCampings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { lang } = useParams();

  useEffect(() => {
    CampingService.getPublicCampings().then((data) => {
      setCampings(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mapRef.current) return;

    const L = require("leaflet");
    require("leaflet/dist/leaflet.css");

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    mapRef.current = L.map("camping-map", { zoomControl: false }).setView([36.5, 9.2], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(mapRef.current);

    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || campings.length === 0) return;

    const L = require("leaflet");

    const makeIcon = (active = false) => L.divIcon({
      className: "",
      html: `<div style="
        width: ${active ? 40 : 34}px;
        height: ${active ? 40 : 34}px;
        background: ${active ? "#16a34a" : "#22c55e"};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 14px rgba(34,197,94,${active ? "0.6" : "0.35"});
        transition: all 0.2s;
      "></div>`,
      iconSize: [active ? 40 : 34, active ? 40 : 34],
      iconAnchor: [active ? 20 : 17, active ? 40 : 34],
    });

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    campings.forEach((c) => {
      if (!c.latitude || !c.longitude) return;
      const marker = L.marker([c.latitude, c.longitude], { icon: makeIcon(false) }).addTo(mapRef.current);
      marker.on("click", () => {
        setSelected(c);
        marker.setIcon(makeIcon(true));
        mapRef.current.flyTo([c.latitude, c.longitude], 13, { duration: 0.8 });
        markersRef.current.forEach((m) => { if (m !== marker) m.setIcon(makeIcon(false)); });
      });
      markersRef.current.push(marker);
    });
  }, [campings]);

  const closePanel = () => {
    setSelected(null);
    const L = require("leaflet");
    markersRef.current.forEach((m) => m.setIcon(L.divIcon({
      className: "",
      html: `<div style="width:34px;height:34px;background:#22c55e;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 14px rgba(34,197,94,0.35);"></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    })));
  };

  return (
    <div className="mx-auto w-full max-w-5xl mt-10">

      {/* Titre */}
      <div className="mb-4 px-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carte des campings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Explorez les campings disponibles en Tunisie</p>
      </div>

      {/* Carte container */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-border"
        style={{ height: 480 }}
      >
        {/* Header flottant */}
        <div
          className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-5 py-3"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            <span className="text-sm font-semibold text-gray-700">Carte des campings · Tunisie</span>
          </div>
          {!loading && (
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              {campings.length} disponibles
            </div>
          )}
        </div>

        {/* Map */}
        <div id="camping-map" className="w-full h-full" />

        {/* Panel latéral */}
        {selected && (
          <div
            className="absolute top-0 right-0 h-full z-[1000] flex flex-col bg-white dark:bg-zinc-900 shadow-2xl"
            style={{ width: 260, borderLeft: "1px solid rgba(0,0,0,0.06)" }}
          >
            {/* Photo */}
            <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 150 }}>
              {selected.photos?.[0]?.url ? (
                <img src={selected.photos[0].url} alt={selected.nom} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl bg-emerald-50">🏕</div>
              )}
              <button
                onClick={closePanel}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs flex items-center justify-center transition-colors"
              >
                ✕
              </button>
              <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                {selected.prix} DT / nuit
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{selected.nom}</h3>
                <p className="text-xs text-gray-400 mt-0.5">📍 {selected.gouvernorat}</p>
              </div>

              {selected.services?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Services</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.services.slice(0, 4).map(s => (
                      <span key={s.service_id} className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        {s.nom}
                      </span>
                    ))}
                    {selected.services.length > 4 && (
                      <span className="text-[10px] text-gray-400">+{selected.services.length - 4}</span>
                    )}
                  </div>
                </div>
              )}

              {selected.activites?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Activités</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.activites.slice(0, 3).map(a => (
                      <span key={a.activite_id} className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        {a.nom}
                      </span>
                    ))}
                    {selected.activites.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{selected.activites.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              {selected.description && (
                <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">{selected.description}</p>
              )}
            </div>

            {/* Boutons */}
            <div className="p-3 border-t border-gray-100 dark:border-zinc-800 space-y-1.5 flex-shrink-0">
              <button
                onClick={() => router.push(`/${lang}/camping/${selected.camping_id}`)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
              >
                Voir les détails →
              </button>
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`, "_blank")}
                className="w-full flex items-center justify-center gap-1.5 border border-gray-200 dark:border-zinc-700 text-xs text-gray-500 hover:text-gray-700 py-2 rounded-xl transition-colors"
              >
                🧭 Itinéraire
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 z-[999] bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Chargement des campings...</p>
            </div>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />
          Camping disponible
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>👆</span> Cliquez sur un marqueur pour voir les détails
        </div>
      </div>
    </div>
  );
}