import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type?: NotificationType;
  read: boolean;
  created_at?: string;
  timestamp: Date;
}

export function useUserNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false });
      if (error) {
        setError(error);
        setNotifications([]);
      } else {
        setNotifications(
          (data || []).map((n: any) => ({
            ...n,
            type: (["info", "success", "warning", "error"].includes(n.type)
              ? n.type
              : "info") as NotificationType,
            timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
          }))
        );
      }
      setLoading(false);
    };
    fetchNotifications();
  }, [userId]);

  return { notifications, loading, error };
}
