"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AnalyticsService } from "@/services/analytics";
import CampingCard from "@/app/[lang]/(dashboard)/camping/components/campingCard";
import { Tent } from "lucide-react";

const CampingMap = dynamic(
  () => import("@/app/[lang]/(dashboard)/camping/map/CampingMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-xl border bg-muted/40 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Chargement de la carte...</span>
      </div>
    ),
  }
);

const features = [
  { icon: "🏕", title: "Réservation Facile", desc: "Réservez votre emplacement en quelques clics. Confirmation instantanée et paiement sécurisé via Paymee." },
  { icon: "⭐", title: "Avis Vérifiés", desc: "Lisez des avis authentiques laissés uniquement par des campeurs ayant séjourné sur place." },
  { icon: "🌤", title: "Météo en Temps Réel", desc: "Consultez la météo directement sur la fiche de chaque camping avant de réserver." },
  { icon: "❤", title: "Favoris", desc: "Sauvegardez vos campings préférés et retrouvez-les facilement pour votre prochaine aventure." },
  { icon: "🔔", title: "Notifications", desc: "Recevez des alertes pour vos réservations, confirmations et messages des gestionnaires." },
  { icon: "🔒", title: "Paiement Sécurisé", desc: "Transactions protégées via Paymee, la passerelle de paiement tunisienne de confiance." },
];

const stats = [
  { value: "20+", label: "Campings référencés" },
  { value: "24", label: "Gouvernorats couverts" },
  { value: "20+", label: "Voyageurs satisfaits" },
  { value: "100%", label: "Avis authentiques" },
];

const steps = [
  { num: "01", title: "Créez votre compte", desc: "Inscription gratuite en moins d'une minute." },
  { num: "02", title: "Explorez la carte", desc: "Trouvez le camping idéal selon votre région et vos critères." },
  { num: "03", title: "Réservez en ligne", desc: "Choisissez vos dates et payez en toute sécurité." },
  { num: "04", title: "Profitez de la nature", desc: "Vivez une expérience inoubliable en plein air." },
];

const zones = [
  { name: "Forêt", emoji: "🌲", count: "12 campings" },
  { name: "Bord de mer", emoji: "🏖", count: "18 campings" },
  { name: "Montagne", emoji: "⛰", count: "9 campings" },
  { name: "Désert", emoji: "🏜", count: "7 campings" },
  { name: "Lac", emoji: "💧", count: "6 campings" },
  { name: "Campagne", emoji: "🌾", count: "10 campings" },
];

const HomePage = () => {
  const { user, isAdmin, isGestionnaire, isClient } = useAuth();
  const isAuthenticated = !!user;
  const { lang } = useParams();
  const [recommendations, setRecommendations] = useState([]);

  const dashboardHref = isAdmin
    ? `/${lang}/admin/dashboard`
    : isGestionnaire
    ? `/${lang}/gestionnaire/dashboard`
    : `/${lang}/camping`;

  const prenom = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "";

  useEffect(() => {
    if (isClient) {
      AnalyticsService.getRecommendationsForMe().then(data => {
        setRecommendations(data || []);
      }).catch(() => {});
    }
  }, [isClient]);

  return (
    <div className="min-h-screen bg-background text-foreground">

      <section className="relative overflow-hidden py-24 px-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium px-4 py-2 rounded-full border border-emerald-500/20">
            <span>🇹🇳</span>
            <span>La première plateforme de camping en Tunisie</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-foreground">
            Découvrez la nature<br />
            <span className="text-emerald-500">tunisienne</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explorez, réservez et vivez des expériences de camping inoubliables à travers tous les gouvernorats de Tunisie.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated && !isClient ? (
              <Link href={dashboardHref} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-emerald-500/25">
                Accéder à mon espace
              </Link>
            ) : isAuthenticated && isClient ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-8 py-4 rounded-xl font-semibold text-lg">
                👋 Bienvenue, {prenom} !
              </div>
            ) : (
              <Link href={`/${lang}/register`} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-emerald-500/25">
                Commencer gratuitement
              </Link>
            )}
            <Link href={`/${lang}/camping`} className="text-muted-foreground hover:text-foreground border border-border px-8 py-4 rounded-xl font-medium transition-colors">
              Explorer les campings
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-emerald-500">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isClient && recommendations.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Tent className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Recommandés pour vous</h2>
                <p className="text-sm text-muted-foreground">Basé sur vos visites et réservations</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </section>
      )}

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium px-4 py-2 rounded-full border border-emerald-500/20">
              <span>Comment ça marche</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground">En 4 étapes simples</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-border z-0" />
                )}
                <div className="relative z-10 bg-card border border-border rounded-2xl p-6 text-center hover:border-emerald-500/50 transition-all duration-300">
                  <div className="text-4xl font-black text-emerald-500/20 mb-2">{s.num}</div>
                  <h3 className="font-semibold text-card-foreground mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium px-4 py-2 rounded-full border border-emerald-500/20">
              <span>Carte interactive</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground">Tous les campings sur une seule carte</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Visualisez en temps réel la disponibilité, les services et les tarifs de chaque camping partout en Tunisie.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
            <CampingMap />
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium px-4 py-2 rounded-full border border-emerald-500/20">
              <span>Fonctionnalités</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              CampTN regroupe tout pour planifier et vivre votre aventure camping en toute sérénité.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!isGestionnaire && !isAdmin && (
        <section className="py-20 px-6 bg-emerald-500/5 border-y border-emerald-500/20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium px-4 py-2 rounded-full border border-emerald-500/20">
              <span>🏕 Vous gérez un camping ?</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground">Rejoignez CampTN en tant que gestionnaire</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Publiez vos emplacements, gérez vos réservations en temps réel, communiquez avec vos campeurs et boostez votre visibilité auprès de milliers de voyageurs tunisiens.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
              {[
                { icon: "📋", title: "Gestion simplifiée", desc: "Tableau de bord complet pour gérer vos emplacements et réservations." },
                { icon: "💬", title: "Messagerie intégrée", desc: "Échangez directement avec vos campeurs depuis la plateforme." },
                { icon: "📈", title: "Plus de visibilité", desc: "Atteignez des milliers de campeurs à la recherche de leur prochaine aventure." },
              ].map((item) => (
                <div key={item.title} className="bg-card border border-border rounded-xl p-4">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-card-foreground text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              ))}
            </div>
            {!isAuthenticated && (
              <Link
                href={`/${lang}/auth/register?role=gestionnaire`}
                className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-emerald-500/25"
              >
                Inscrire mon camping
              </Link>
            )}
          </div>
        </section>
      )}

      {!isAuthenticated && (
        <section className="py-20 px-6 bg-muted/40">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="text-6xl">🏕</div>
            <h2 className="text-4xl font-bold text-foreground">Prêt pour votre prochaine aventure ?</h2>
            <p className="text-muted-foreground text-lg">
              Rejoignez des milliers de campeurs qui font confiance à CampTN pour planifier leurs escapades en nature.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/${lang}/auth/register`} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-emerald-500/25 w-full sm:w-auto">
                Créer un compte gratuit
              </Link>
              <Link href={`/${lang}/login`} className="border border-border text-muted-foreground hover:text-foreground px-8 py-4 rounded-xl font-medium transition-colors w-full sm:w-auto">
                {"J'ai déjà un compte"}
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">Inscription gratuite · Aucune carte bancaire requise</p>
          </div>
        </section>
      )}

    </div>
  );
};

export default HomePage;