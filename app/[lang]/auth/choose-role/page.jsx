"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ChooseRolePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, setIsPending] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [justificatif, setJustificatif] = useState("");

  const handleChooseRole = async () => {
    if (selectedRole === "gestionnaire" && !justificatif.trim()) {
      alert("Veuillez fournir un justificatif.");
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch("http://localhost:3000/auth/choose-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          role: selectedRole,
          justificatif: selectedRole === "gestionnaire" ? justificatif : null,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour du rôle");

      localStorage.setItem("token", token);

      if (selectedRole === "gestionnaire") {
        router.push("/en/auth/en-attente");
      } else {
        router.push("/en/camping");
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-2xl font-bold">Choisissez votre rôle</h1>
      <p className="text-gray-500 text-center px-4">
        Comment voulez-vous utiliser la plateforme CampTN ?
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => setSelectedRole("client")}
          disabled={isPending}
          variant={selectedRole === "client" ? "default" : "outline"}
          className="w-48 h-24 flex flex-col gap-2 border-2"
        >
          <span className="text-2xl">🏕️</span>
          <span>Je suis Client</span>
        </Button>

        <Button
          onClick={() => setSelectedRole("gestionnaire")}
          disabled={isPending}
          variant={selectedRole === "gestionnaire" ? "default" : "outline"}
          className="w-48 h-24 flex flex-col gap-2 px-6"
        >
          <span className="text-2xl">🏢</span>
          <span className="text-center">Gestionnaire de Camping</span>
        </Button>
      </div>

      {selectedRole === "gestionnaire" && (
        <div className="w-full max-w-sm flex flex-col gap-2">
          <label className="text-sm font-medium">
            Justificatif <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Ex: Numéro de registre de commerce, lien document..."
            value={justificatif}
            onChange={(e) => setJustificatif(e.target.value)}
          />
        </div>
      )}

      {selectedRole && (
        <Button onClick={handleChooseRole} disabled={isPending} className="w-48">
          {isPending ? "Chargement..." : "Confirmer"}
        </Button>
      )}
    </div>
  );
};

export default ChooseRolePage;