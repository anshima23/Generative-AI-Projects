import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationToastProps {
  title: string;
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  onMarkDone?: () => void;
  onSnooze?: () => void;
}

export function NotificationToast({
  title,
  message,
  isVisible,
  onDismiss,
  onMarkDone,
  onSnooze,
}: NotificationToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onDismiss, 300); // Wait for animation
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 max-w-sm bg-card border border-border rounded-xl shadow-2xl p-4 z-50 transition-transform duration-300",
        show ? "translate-x-0" : "translate-x-full"
      )}
      data-testid="notification-toast"
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="text-accent-foreground w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground" data-testid="notification-title">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1" data-testid="notification-message">
            {message}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShow(false);
            setTimeout(onDismiss, 300);
          }}
          className="h-8 w-8 p-0"
          data-testid="button-dismiss-notification"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {(onMarkDone || onSnooze) && (
        <div className="mt-3 flex space-x-2">
          {onMarkDone && (
            <Button
              size="sm"
              onClick={onMarkDone}
              data-testid="button-mark-done"
            >
              Mark Done
            </Button>
          )}
          {onSnooze && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSnooze}
              data-testid="button-snooze-reminder"
            >
              <Clock className="mr-1 w-3 h-3" />
              Snooze
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
