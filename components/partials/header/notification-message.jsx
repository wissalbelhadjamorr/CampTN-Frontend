"use client";

import { Bell } from "@/components/svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import shortImage from "@/public/images/all-img/short-image-2.png";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

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

const NotificationMessage = () => {
    const { token, user } = useAuth();
  
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const socketRef = useRef(null);


  const getNotificationRoute = (type, notification) => {
    const role = user?.role;
    switch (type) {
      case "reservation_created":
      case "reservation_confirmed":
      case "reservation_cancelled":
      case "reservation_expired":
  return role === "gestionnaire" ? `/gestionnaire/dashboard` : `/en/reservations`;

      case "new_review":
      case "review_approved":
      case "review_rejected":
        return `/en/admin/dashboard/${notification.reference_id ?? ""}`;
      case "new_message":
        return `/en/messages/${notification.reference_id ?? ""}`;
      case "manager_approved":
      case "manager_rejected":
        return role === "admin" ? `/admin/dashboard` : `/en/dashboard`;
      case "camping_added":
      case "camping_approved":
      case "camping_rejected":
        return role === "admin"
          ? `/admin/dashboard`
          : `/en/camping/${notification.reference_id ?? ""}`;
      default:
        return `/en/notifications`;
    }
  };

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:3000", { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => console.log("✅ Socket connecté:", socket.id));
    socket.on("connect_error", (err) => console.log("❌ Erreur socket:", err.message));

    socket.emit("getNotifications");

    socket.on("notifications", (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });

    socket.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [token]);

  const handleMarkAllRead = () => {
    socketRef.current?.emit("markNotificationsAsRead");
    setUnreadCount(0);
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
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
    const route = getNotificationRoute(notification.type, notification);
    router.push(route);
  };
  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative md:h-9 md:w-9 h-8 w-8 hover:bg-default-100 dark:hover:bg-default-200 
          data-[state=open]:bg-default-100 dark:data-[state=open]:bg-default-200 
          hover:text-primary text-default-500 dark:text-default-800 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="w-4 h-4 p-0 text-xs font-medium items-center justify-center absolute left-[calc(100%-18px)] bottom-[calc(100%-16px)] ring-2 ring-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="z-[999] mx-4 lg:w-[412px] p-0">
        <DropdownMenuLabel
          style={{ backgroundImage: `url(${shortImage.src})` }}
          className="w-full h-full bg-cover bg-no-repeat p-4 flex items-center"
        >
          <span className="text-base font-semibold text-white flex-1">
            Notifications
          </span>
          <span
            onClick={handleMarkAllRead}
            className="text-xs font-medium text-white flex-0 cursor-pointer hover:underline"
          >
            Tout marquer comme lu
          </span>
        </DropdownMenuLabel>

        <div className="h-[300px] xl:h-[350px]">
          <ScrollArea className="h-full">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Aucune notification
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.notification_id}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "flex gap-3 py-3 px-4 border-b last:border-0 cursor-pointer hover:bg-default-50 dark:hover:bg-background transition-colors",
                    { "bg-blue-50 dark:bg-blue-950/20": !item.read }
                  )}
                >
                  <span className="text-xl mt-0.5">{getIcon(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-default-900 leading-snug">
                      {item.message}
                    </p>
                    <p className="text-xs text-default-500 mt-1">
                      {new Date(item.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!item.read && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        <DropdownMenuSeparator />
        <div className="m-4 mt-5">
          <Button asChild type="button" className="w-full">
            <Link href="/en/notifications">Voir tout</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMessage;