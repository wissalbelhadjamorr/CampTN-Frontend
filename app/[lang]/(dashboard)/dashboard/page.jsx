import React from "react";
import Link from "next/link";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold">Bienvenue sur CampingTN</h1>
      <p className="text-gray-500">Trouvez et réservez les meilleurs campings en Tunisie</p>
      
      <div className="flex gap-4">
        <Link href="/en/login">

          <button className="px-6 py-2 bg-primary text-white rounded-md">
            Se connecter
          </button>
        </Link>
        <Link href="/en/register">
          <button className="px-6 py-2 border border-primary text-primary rounded-md">
            S'inscrire
          </button>
        </Link>
      </div>
    </div>
  );
};

export default page;