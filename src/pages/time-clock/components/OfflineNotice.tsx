import { AlertTriangle } from "lucide-react";
import { useTimeClockStore } from "@/stores/timeClockStore";
import { useTranslation } from "@/hooks/use-translation";

export function OfflineNotice() {
  const isOffline = useTimeClockStore((state) => state.isOffline);
  const pendingEvents = useTimeClockStore((state) => state.pendingEvents);
  const { t } = useTranslation();

  if (!isOffline && !pendingEvents.some((event) => event.status === "pending")) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50/90 p-4 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-5 w-5" />
      <div>
        <p className="font-medium">{t("timeClock.offlineTitle")}</p>
        <p>
          {t("timeClock.offlineDescription").replace(
            "{count}",
            pendingEvents.filter((event) => event.status !== "synced").length.toString()
          )}
        </p>
      </div>
    </div>
  );
}
