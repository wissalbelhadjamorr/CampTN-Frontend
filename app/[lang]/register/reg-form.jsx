"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { addUser } from "@/action/auth-action";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import Image from "next/image";
import googleIcon from "@/public/images/auth/google.png";

const schema = z
  .object({
    nom: z.string().min(1, { message: "Le nom est obligatoire." }),
    prenom: z.string().min(1, { message: "Le prénom est obligatoire." }),
    email: z.string().email({ message: "Email invalide." }),
    password: z.string().min(4, { message: "Le mot de passe doit contenir au moins 4 caractères." }),
    role: z.enum(["gestionnaire", "client"], { required_error: "Veuillez choisir un rôle." }),
    justificatif: z.string().optional()
  })
  .refine(
    (data) => data.role === "client" || (data.role === "gestionnaire" && data.justificatif?.length > 0),
    { message: "Le justificatif est obligatoire pour un gestionnaire.", path: ["justificatif"] }
  );

const RegForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const [passwordType, setPasswordType] = useState("password");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all"
  });

  const watchRole = watch("role");

  const togglePasswordType = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

 const onSubmit = (data) => {
  startTransition(async () => {
    try {
      await addUser({
        ...data,
        justificatif: data.role === "gestionnaire" ? data.justificatif : undefined
      });
      
      if (data.role === "gestionnaire") {
        toast("Inscription réussie ! Vous recevrez un email dès que votre compte sera validé par un administrateur.", {
          duration: 8000,
          
          style: {
            background: "#fefce8",
            color: "#854d0e",
            border: "1px solid #fde047",
          },
        });
      } else {
        toast.success("Inscription réussie !");
      }
      
      reset();
      router.push("/en/login");
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'inscription.");
    }
  });
};

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">Créer un compte</h2>
      <p className="text-gray-600 mb-6">Remplissez le formulaire pour vous inscrire</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="nom">Nom</Label>
          <Input
            id="nom"
            {...register("nom")}
            disabled={isPending}
            className={cn({ "border-destructive": errors.nom })}
          />
          {errors.nom && <p className="text-destructive text-sm">{errors.nom.message}</p>}
        </div>

        <div>
          <Label htmlFor="prenom">Prénom</Label>
          <Input
            id="prenom"
            {...register("prenom")}
            disabled={isPending}
            className={cn({ "border-destructive": errors.prenom })}
          />
          {errors.prenom && <p className="text-destructive text-sm">{errors.prenom.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            disabled={isPending}
            className={cn({ "border-destructive": errors.email })}
          />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={passwordType}
              {...register("password")}
              disabled={isPending}
              className={cn({ "border-destructive": errors.password })}
            />
            <div
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
              onClick={togglePasswordType}
            >
              {passwordType === "password" }
            </div>
          </div>
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>

        <div>
          <Label>Vous êtes :</Label>
          <Select onValueChange={(val) => setValue("role", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gestionnaire">Gestionnaire de centre de Camping</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-destructive text-sm">{errors.role.message}</p>}
        </div>

        {watchRole === "gestionnaire" && (
          <div>
            <Label htmlFor="justificatif">Justificatif ( le nom du centre du camping )</Label>
            <Input
              id="justificatif"
              {...register("justificatif")}
              disabled={isPending}
              className={cn({ "border-destructive": errors.justificatif })}
            />
            {errors.justificatif && <p className="text-destructive text-sm">{errors.justificatif.message}</p>}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2 inline-block" /> : "S'inscrire"}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-gray-500">Ou</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={() => (window.location.href = "http://localhost:3000/auth/google")}
      >
        <Image src={googleIcon} alt="google" className="w-5 h-5" />
        S'inscrire avec Google
      </Button>

      <p className="text-center text-gray-600 mt-4">
        Déjà inscrit ?{" "}
        <Link href="/en/login" className="text-primary">
          Se connecter
        </Link>
      </p>
    </div>
  );
};

export default RegForm;