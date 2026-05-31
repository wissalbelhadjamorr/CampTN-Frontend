"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const ProfileInfo = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || "fr"; 

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push(`/${lang}/login`);
  };

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link href={`/${lang}/login`}>
          <Button variant="outline" size="sm">Se connecter</Button>
        </Link>
        <Link href={`/${lang}/register`}>
          <Button size="sm">S'inscrire</Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium hidden md:block">
            {user?.email}
          </span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-default-800">
              {user?.email}
            </div>
            <div className="text-xs text-default-600 capitalize">
              {user?.role}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <Link href={`/${lang}/profil`}>
            <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
              <Icon icon="heroicons:user" className="w-4 h-4" />
              Profil
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
        >
          <Icon icon="heroicons:power" className="w-4 h-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileInfo;