"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const GoogleCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      router.push("/en/camping");
    }
  }, []);

  return <div>Connexion en cours...</div>;
};

export default GoogleCallback;