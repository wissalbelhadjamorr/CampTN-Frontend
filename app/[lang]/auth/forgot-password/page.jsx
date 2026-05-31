"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const { lang } = useParams();
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return toast.error("L'email est obligatoire");
    setIsPending(true);
    try {
      const res = await fetch("http://localhost:3000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSent(true);
      toast.success("Email envoyé !");
    } catch (err) {
      toast.error(err.message || "Erreur");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-[440px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏕️</div>
          <h1 className="text-2xl font-bold">Mot de passe oublié ?</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {sent ? (
          // ← état après envoi
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <Mail className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h2 className="font-semibold text-green-800 mb-2">Email envoyé !</h2>
            <p className="text-green-700 text-sm">
              Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <Link href={`/${lang}/login`}>
              <Button className="mt-4 w-full" variant="outline">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <Button className="w-full" onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Envoi en cours...</>
              ) : (
                "Envoyer le lien"
              )}
            </Button>

            <Link href={`/${lang}/login`} className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;