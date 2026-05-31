import { DashBoard } from "@/components/svg";
import { 
  LayoutDashboard,
  Home,
  Tent,
  PlusCircle,
  CheckCircle,
  Settings,
  Map,
  Calendar,
  Heart,
  Users,
  MessageCircle
} from "lucide-react";

export const menusConfig = {
  mainNav: [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  ],

  sidebarNav: {
    modern: [
      { title: "Campings", icon: Tent, href: "/camping/" },
      { title: "Carte", icon: Map, href: "/camping/map" },
      { title: "Mes Campings", icon: Tent, href: "/camping", role: "gestionnaire" },
      { title: "Ajouter Camping", icon: PlusCircle, href: "/camping/create", role: "gestionnaire" },
      { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard", role: "admin" },
      { title: "Tableau de Bord", icon: DashBoard, href: "/gestionnaire/dashboard", role: "gestionnaire" },
      { title: "Mes Réservations", icon: Calendar, href: "/reservations", role: "client" },
      { title: "Mes Favoris", icon: Heart, href: "/favoris", role: "client" },
      { title: "Messagerie", icon: MessageCircle, href: "/en/messages", role: "client" },
    ],

    classic: [
      // Visible par tous
      { isHeader: true, title: "Explorer" },
      { title: "Campings", icon: Tent, href: "/camping" },
      { title: "Carte", icon: Map, href: "/camping/map" },

      // Gestionnaire
      { isHeader: true, title: "Mes Campings", role: "gestionnaire" },
      { title: "Liste Campings", icon: Tent, href: "/camping", role: "gestionnaire" },
      { title: "Ajouter Camping", icon: PlusCircle, href: "/camping/create", role: "gestionnaire" },
      { title: "Tableau de Bord", icon: DashBoard, href: "/gestionnaire/dashboard", role: "gestionnaire" },

      // Admin
      { isHeader: true, title: "Administration", role: "admin" },
      { title: "Campings", icon: Tent, href: "/camping", role: "admin" },
      { title: "Gérer Services", icon: Settings, href: "/admin/services", role: "admin" },
      { title: "Gérer Types Zone", icon: Map, href: "/admin/type-zones", role: "admin" },
      { title: "Gérer Utilisateurs", icon: Users, href: "/admin/utilisateurs", role: "admin" },

      // Client
      { isHeader: true, title: "Espace Client", role: "client" },
      { title: "Campings", icon: Tent, href: "/camping", role: "client" },
      { title: "Mes Réservations", icon: Calendar, href: "/reservations", role: "client" },
      { title: "Mes Favoris", icon: Heart, href: "/favoris", role: "client" },
      // ✅ Ajouté ici
      { title: "Messagerie", icon: MessageCircle, href: "/en/messages", role: "client" },
    ],
  },
};