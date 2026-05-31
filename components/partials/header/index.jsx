"use client";
import React from "react";
import { cn } from "@/lib/utils";
import ThemeButton from "./theme-button";
import { useSidebar, useThemeStore } from "@/store";
import ProfileInfo from "./profile-info";
import HorizontalHeader from "./horizontal-header";
import HorizontalMenu from "./horizontal-menu";
import NotificationMessage from "./notification-message";
import { useMediaQuery } from "@/hooks/use-media-query";
import ClassicHeader from "./layout/classic-header";
import Link from "next/link";
import Language from "./language";
import { useAuth } from "@/hooks/useAuth";

// Logo CampTN
const Logo = () => (
  <Link href="/" className="flex items-center gap-2 select-none">
    <div className="relative w-8 h-8">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
        <rect width="32" height="32" rx="8" fill="#10b981" />
        <path d="M16 6 L26 22 H6 Z" fill="white" opacity="0.9" />
        <path d="M16 11 L22 22 H10 Z" fill="#10b981" />
        <rect x="14" y="22" width="4" height="4" rx="1" fill="white" opacity="0.9" />
      </svg>
    </div>
    <span className="text-foreground font-bold text-lg tracking-tight">
      Camp<span className="text-emerald-500">TN</span>
    </span>
  </Link>
);

// Liens publics (non connecté)
const PublicNavLinks = () => (
  <nav className="hidden md:flex items-center gap-6">
    {[

      { label: "Campings", href: "/camping" },
      { label: "Carte", href: "/camping/map" },
   
    ].map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className="text-muted-foreground hover:text-emerald-500 text-sm font-medium transition-colors"
      >
        {link.label}
      </Link>
    ))}
  </nav>
);

const AuthNavLinks = ({ isAdmin, isGestionnaire, isClient }) => {
  const links = [
    // Commun à tous
    { label: "Campings", href: "/camping", roles: ["admin", "gestionnaire", "client"] },
    { label: "Carte", href: "/camping/map", roles: ["admin", "gestionnaire", "client"] },

    // Client
    { label: "Mes Réservations", href: "/reservations", roles: ["client"] },
    { label: "Mes Favoris", href: "/favoris", roles: ["client"] },
{ label: "Messages", href: "/en/messages", roles: ["client", "gestionnaire"] },
    // Gestionnaire
    { label: "Mes Campings", href: "/camping", roles: ["gestionnaire"] },
    { label: "Tableau de Bord", href: "/gestionnaire/dashboard", roles: ["gestionnaire"] },

    // Admin
    { label: "Tableau de Bord", href: "/admin/dashboard", roles: ["admin"] },
  ];

  const role = isAdmin ? "admin" : isGestionnaire ? "gestionnaire" : "client";
  const filtered = links.filter((l) => l.roles.includes(role));

  return (
    <nav className="hidden md:flex items-center gap-6">
      {filtered.map((link) => (
        <Link
          key={link.href + link.label}
          href={link.href}
          className="text-muted-foreground hover:text-emerald-500 text-sm font-medium transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

const NavTools = ({ isDesktop, isMobile, sidebarType, isAuthenticated, isAdmin, isGestionnaire, isClient }) => {
  if (isAuthenticated) {
    return (
      <div className="nav-tools flex items-center gap-2">
        <NotificationMessage />
        <ThemeButton />
        <div className="ltr:pl-2 rtl:pr-2">
          <ProfileInfo />
        </div>
      </div>
    );
  }

  return (
    <div className="nav-tools flex items-center gap-2">
      <ThemeButton />
      <Link
        href="/login"
        className="border border-border text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Se connecter
      </Link>
      <Link
        href="/register"
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {"S'inscrire"}
      </Link>
    </div>
  );
};

const Header = ({ handleOpenSearch, trans }) => {
  const { collapsed, sidebarType, setSidebarType } = useSidebar();
  const { layout, navbarType } = useThemeStore();
  const { user, isAdmin, isGestionnaire, isClient } = useAuth();
  const isAuthenticated = !!user;
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isMobile = useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    if (!isDesktop && layout === "horizontal") {
      setSidebarType("classic");
    }
  }, [isDesktop]);

  if (layout === "horizontal" && navbarType !== "hidden") {
    return (
      <ClassicHeader className={cn(" ", { "sticky top-0 z-50": navbarType === "sticky" })}>
        <div className="w-full bg-card/90 backdrop-blur-lg md:px-6 px-[15px] py-3 border-b">
          <div className="flex justify-between items-center h-full">
            <HorizontalHeader handleOpenSearch={handleOpenSearch} />
            <NavTools isDesktop={isDesktop} isMobile={isMobile} sidebarType={sidebarType} isAuthenticated={isAuthenticated} />
          </div>
        </div>
        {isDesktop && (
          <div className="bg-card bg-card/90 backdrop-blur-lg w-full px-6 shadow-md">
            <HorizontalMenu trans={trans} />
          </div>
        )}
      </ClassicHeader>
    );
  }

  return (
    <ClassicHeader className={cn("sticky top-0 z-50")}>
      <div className="w-full bg-card/90 backdrop-blur-lg md:px-6 px-[15px] py-3 border-b">
        <div className="flex justify-between items-center h-full gap-6">
          <Logo />
          {isAuthenticated ? (
            <AuthNavLinks isAdmin={isAdmin} isGestionnaire={isGestionnaire} isClient={isClient} />
          ) : (
            <PublicNavLinks />
          )}
          <NavTools
            isDesktop={isDesktop}
            isMobile={isMobile}
            sidebarType={sidebarType}
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            isGestionnaire={isGestionnaire}
            isClient={isClient}
          />
        </div>
      </div>
    </ClassicHeader>
  );
};

export default Header;