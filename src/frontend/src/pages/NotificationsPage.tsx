import { Bell, BellOff, Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";
import { cn } from "../lib/utils";

export default function NotificationsPage() {
  const { identity } = useInternetIdentity();
  const { notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center">
          <BellOff className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
          <p className="text-muted-foreground">
            You need to be logged in to view notifications.
          </p>
        </div>
      </div>
    );
  }

  const handleClick = (id: bigint, isRead: boolean) => {
    if (!isRead) {
      markRead.mutate(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <Bell className="w-7 h-7 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Stay updated on your orders and rentals
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <BellOff className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        )}

        {!isLoading && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <button
                key={notif.id.toString()}
                type="button"
                onClick={() => handleClick(notif.id, notif.isRead)}
                className={cn(
                  "w-full text-left px-5 py-4 rounded-xl border transition-all",
                  notif.isRead
                    ? "bg-background border-border text-muted-foreground"
                    : "bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-sm",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                      notif.isRead ? "bg-muted" : "bg-[#1E88E5]",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm",
                        !notif.isRead && "font-medium text-foreground",
                      )}
                    >
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Order #{notif.relatedOrder.toString()}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="text-xs text-[#1E88E5] font-medium flex-shrink-0">
                      New
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
