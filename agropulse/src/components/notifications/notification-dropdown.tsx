"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  MessageSquare, 
  TrendingUp, 
  Gavel, 
  AlertCircle,
  Clock,
  DollarSign,
  X,
  Settings
} from "lucide-react";
import Link from "next/link";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useLanguage } from "~/providers/language-provider";

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  BID_RECEIVED: Gavel,
  BID_ACCEPTED: Check,
  BID_REJECTED: X,
  MESSAGE_RECEIVED: MessageSquare,
  PRICE_ALERT: TrendingUp,
  LISTING_EXPIRED: Clock,
  PAYMENT_RECEIVED: DollarSign,
  SYSTEM: AlertCircle,
};

const notificationColors: Record<string, string> = {
  BID_RECEIVED: "bg-blue-100 text-blue-600",
  BID_ACCEPTED: "bg-green-100 text-green-600",
  BID_REJECTED: "bg-red-100 text-red-600",
  MESSAGE_RECEIVED: "bg-purple-100 text-purple-600",
  PRICE_ALERT: "bg-amber-100 text-amber-600",
  LISTING_EXPIRED: "bg-gray-100 text-gray-600",
  PAYMENT_RECEIVED: "bg-emerald-100 text-emerald-600",
  SYSTEM: "bg-slate-100 text-slate-600",
};

export function NotificationDropdown() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, refetch } = api.notification.getRecent.useQuery(
    undefined,
    { 
      refetchInterval: 30000, // Refetch every 30 seconds
      enabled: true 
    }
  );

  const markAsRead = api.notification.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markAllAsRead = api.notification.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const createTestNotification = api.notification.createTest.useMutation({
    onSuccess: () => refetch(),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleNotificationClick = (notificationId: string, isRead: boolean, link?: string | null) => {
    if (!isRead) {
      markAsRead.mutate({ id: notificationId });
    }
    if (link) {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">{t("notifications.title")}</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                {t("notifications.markAllRead")}
              </Button>
            )}
            <Link href="/dashboard/profile">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

       
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              {t("common.loading")}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">{t("notifications.noNotifications")}</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] ?? AlertCircle;
                const colorClass = notificationColors[notification.type] ?? "bg-gray-100 text-gray-600";

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => handleNotificationClick(
                      notification.id, 
                      notification.isRead,
                      notification.link
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {notification.link && (
                      <Link 
                        href={notification.link}
                        className="text-xs text-green-600 hover:text-green-700 mt-2 inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t("common.viewAll")} →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

       
        <div className="p-3 border-t">
          <div className="flex gap-2">
            {notifications.length > 0 ? (
              <Link href="/dashboard/profile" onClick={() => setIsOpen(false)} className="flex-1">
                <Button variant="ghost" className="w-full text-sm text-green-600 hover:text-green-700 hover:bg-green-50">
                  {t("common.viewAll")}
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => createTestNotification.mutate({ type: "SYSTEM" })}
                disabled={createTestNotification.isPending}
              >
                {createTestNotification.isPending ? t("common.loading") : "Create Test Notification"}
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
