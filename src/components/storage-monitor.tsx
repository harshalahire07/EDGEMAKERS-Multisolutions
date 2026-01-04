"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { dbEvents } from "@/lib/database";
import { AlertTriangle, HardDrive } from "lucide-react";

/**
 * StorageMonitor Component
 *
 * This component monitors localStorage capacity and displays toast notifications
 * when storage is approaching or has exceeded its quota. It runs in the background
 * without rendering any UI.
 *
 * Features:
 * - Listens for storage warning events (>80% capacity)
 * - Listens for storage quota exceeded errors
 * - Shows actionable toast notifications with appropriate severity
 *
 * Should be mounted in the root layout to ensure monitoring across all pages.
 */
export default function StorageMonitor() {
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to storage warning events (>80% capacity)
    const unsubscribeWarning = dbEvents.subscribe("storageWarning", () => {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Storage Almost Full</span>
          </div>
        ) as any,
        description:
          "Your browser storage is over 80% full. Consider exporting and clearing old data from the admin panel.",
        variant: "destructive",
        duration: 8000,
      });
    });

    // Subscribe to storage quota exceeded events
    const handleQuotaError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const errorDetails = customEvent.detail;

      toast({
        title: (
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span>Storage Full</span>
          </div>
        ) as any,
        description:
          "Unable to save data. Storage quota exceeded. Please export your data from the admin panel and clear old entries.",
        variant: "destructive",
        duration: 10000,
      });
    };

    window.addEventListener("storage:quotaError", handleQuotaError);

    // Cleanup function
    return () => {
      unsubscribeWarning();
      window.removeEventListener("storage:quotaError", handleQuotaError);
    };
  }, [toast]);

  // This component doesn't render anything
  return null;
}
