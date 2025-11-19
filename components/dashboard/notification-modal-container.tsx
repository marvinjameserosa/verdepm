import { useUserNotifications } from "@/hooks/useUserNotifications";
import { NotificationModal } from "@/components/dashboard/notification-modal";

type NotificationType = "info" | "success" | "warning" | "error";

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

interface NotificationModalContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export default function NotificationModalContainer({
  open,
  onOpenChange,
  userId,
}: NotificationModalContainerProps) {
  const { notifications, loading, error } = useUserNotifications(userId); // ← Data from hook

  if (loading) return <div>Loading notifications...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <NotificationModal
      open={open}
      onOpenChange={onOpenChange}
      notifications={notifications}
      // other modal props...
    />
  );
}
