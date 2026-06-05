"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const getIcon = (type) => {
  switch (type) {
    case "reservation_created": return "🏕️";
    case "reservation_confirmed": return "✅";
    case "reservation_cancelled": return "❌";
    case "reservation_expired": return "⏰";
    case "new_review": return "⭐";
    case "review_approved": return "👍";
    case "review_rejected": return "👎";
    case "new_message": return "💬";
    case "manager_approved": return "🎉";
    case "manager_rejected": return "🚫";
    case "camping_added": return "🏕️";
    case "camping_approved": return "✅";
    case "camping_rejected": return "❌";
    default: return "🔔";
  }
};

const getNotificationRoute = (type, notification, role) => {
  switch (type) {
    case "reservation_created":
    case "reservation_confirmed":
    case "reservation_cancelled":
    case "reservation_expired":
      return role === "gestionnaire" ? `/gestionnaire/dashboard` : `/en/reservations`;
    case "new_review":
    case "review_approved":
    case "review_rejected":
      return `/en/reviews/${notification.reference_id ?? ""}`;
    case "new_message":
      return `/en/messages/${notification.reference_id ?? ""}`;
    case "manager_approved":
    case "manager_rejected":
      return role === "admin" ? `/admin/dashboard` : `/en/reservations`;
    case "camping_added":
    case "camping_approved":
    case "camping_rejected":
      return role === "admin" ? `/admin/dashboard` : `/en/camping/${notification.reference_id ?? ""}`;
    default:
      return `/en/notifications`;
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case "reservation_created": return "Réservation";
    case "reservation_confirmed": return "Réservation";
    case "reservation_cancelled": return "Réservation";
    case "reservation_expired": return "Réservation";
    case "new_review": return "Avis";
    case "review_approved": return "Avis";
    case "review_rejected": return "Avis";
    case "new_message": return "Message";
    case "manager_approved": return "Compte";
    case "manager_rejected": return "Compte";
    case "camping_added": return "Camping";
    case "camping_approved": return "Camping";
    case "camping_rejected": return "Camping";
    default: return "Notification";
  }
};

export default function NotificationsPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unread | read
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = io("https://camptn-backend-production.up.railway.app", { auth: { token } });
    socketRef.current = socket;

    socket.emit("getNotifications");

    socket.on("notifications", (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    socket.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => socket.disconnect();
  }, [token]);

  const handleMarkAllRead = () => {
    socketRef.current?.emit("markNotificationsAsRead");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      socketRef.current?.emit("markNotificationAsRead", notification.notification_id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notification.notification_id ? { ...n, read: true } : n
        )
      );
    }
    const route = getNotificationRoute(notification.type, notification, user?.role);
    router.push(route);
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-default-900">Notifications</h1>
            <p className="text-sm text-default-500">
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est lu"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "Toutes" },
          { key: "unread", label: "Non lues" },
          { key: "read", label: "Lues" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === f.key
                ? "bg-primary text-white"
                : "bg-default-100 text-default-600 hover:bg-default-200"
            )}
          >
            {f.label}
            {f.key === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-white text-primary text-xs rounded-full px-1.5 py-0.5 font-semibold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-default-500 text-sm">
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-10 w-10 text-default-300 mx-auto mb-3" />
            <p className="text-default-500 text-sm">Aucune notification</p>
          </div>
        ) : (
          filtered.map((item, index) => (
            <div
              key={item.notification_id}
              onClick={() => handleNotificationClick(item)}
              className={cn(
                "flex gap-4 p-4 cursor-pointer hover:bg-default-50 dark:hover:bg-default-100/5 transition-colors",
                { "border-t": index !== 0 },
                { "bg-blue-50 dark:bg-blue-950/20": !item.read }
              )}
            >
              <div className="text-2xl mt-0.5 flex-shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-default-900 leading-snug">
                    {item.message}
                  </p>
                  {!item.read && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                    {getTypeLabel(item.type)}
                  </Badge>
                  <span className="text-xs text-default-400">
                    {new Date(item.date).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}