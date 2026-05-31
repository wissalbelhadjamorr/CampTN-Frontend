"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, Mail, ArrowLeft } from "lucide-react";

const EnAttentePage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="max-w-md w-full bg-white shadow-sm rounded-xl p-8 text-center border border-slate-200">
        
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Clock className="w-16 h-16 text-warning animate-pulse" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">
          Compte en cours de vérification
        </h1>

        <p className="text-muted-foreground mb-6 text-sm">
          Merci de votre inscription sur <span className="font-semibold text-primary">CampTN</span>. 
          Votre profil gestionnaire doit être validé par notre équipe.
        </p>

        <div className="bg-info/10 border-l-4 border-info p-4 mb-8 text-left">
          <div className="flex items-start">
            <Mail className="w-5 h-5 text-info mr-3 mt-0.5" />
            <p className="text-sm text-info-700">
              Vous recevrez un <strong>e-mail</strong> dès que votre accès sera activé (sous 24h).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EnAttentePage;