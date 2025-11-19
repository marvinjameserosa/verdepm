"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type?: "info" | "success" | "warning" | "error";
}

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearNotification?: (id: string) => void;
}

export function NotificationModal({
  open,
  onOpenChange,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification,
}: NotificationModalProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeStyles = (type?: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "error":
        return "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-emerald-500/5 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                  {unreadCount}
                </span>
              )}
            </DialogTitle>
            {unreadCount > 0 && onMarkAllAsRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-sm">
                No notifications yet
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative p-4 rounded-lg border transition-all",
                    !notification.read
                      ? getTypeStyles(notification.type)
                      : "bg-muted/50 border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={cn(
                            "text-sm font-medium",
                            !notification.read && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && onMarkAsRead && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="p-1 hover:bg-background rounded transition-colors"
                          title="Mark as read"
                        >
                          <CheckCheck className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                      {onClearNotification && (
                        <button
                          onClick={() => onClearNotification(notification.id)}
                          className="p-1 hover:bg-background rounded transition-colors"
                          title="Remove notification"
                        >
                          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
