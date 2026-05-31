"use client"
import Image from "next/image";
import background from "@/public/images/auth/line.png";
import LogInForm from "./login-form";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center overflow-hidden w-full">
      <div className="min-h-screen basis-full flex flex-wrap w-full justify-center overflow-y-auto">

        {/* Partie gauche - formulaire */}
        <div className="min-h-screen basis-full md:basis-1/2 w-full px-4 py-5 flex justify-center items-center">
          <div className="lg:w-[480px]">
            <LogInForm />
          </div>
        </div>

        {/* Partie droite - contenu adaptatif */}
        <div className="basis-1/2 w-full relative hidden xl:flex justify-center items-center bg-card">
          <Image
            src={background}
            alt="background"
            className="absolute top-0 left-0 w-full h-full object-cover opacity-5 dark:opacity-20"
          />

          <div className="relative z-10 text-center space-y-6 max-w-[500px] px-12">
            <div className="text-6xl">🏕️</div>

            <h1 className="text-4xl font-bold leading-tight text-card-foreground">
              Bienvenue sur{" "}
              <span className="text-emerald-500 dark:text-emerald-400">CampTN</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Découvrez les plus beaux campings de Tunisie. Réservez facilement,
              vivez des expériences inoubliables en pleine nature.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { value: "20+", label: "Campings" },
                { value: "24", label: "Gouvernorats" },
                { value: "20+", label: "Voyageurs" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center border border-border rounded-xl p-4 bg-background"
                >
                  <div className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Feature cards */}
            <div className="flex flex-col gap-3 pt-2">
              {[
                { icon: "🏕️", title: "Réservation instantanée", desc: "Confirmez votre séjour en quelques clics" },
                { icon: "🗺️", title: "Carte interactive", desc: "Explorez les campings près de vous" },
                { icon: "⭐", title: "Avis vérifiés", desc: "Des retours d'expérience authentiques" },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-3 bg-background rounded-xl px-4 py-3 border border-border hover:bg-muted transition-all duration-300"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm text-card-foreground">{feature.title}</div>
                    <div className="text-xs text-muted-foreground">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Citation */}
            <div className="border-t border-border pt-6">
              <p className="text-muted-foreground text-sm italic">
                "La nature est la meilleure thérapie."
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;