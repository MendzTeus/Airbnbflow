import { useTranslation } from "@/hooks/use-translation";
import { useLiveTimeTotals } from "@/hooks/use-live-time-totals";

export function TotalsCard() {
  const { t } = useTranslation();
  const displayTotal = useLiveTimeTotals();
  return (
    <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-2xl bg-background/90 px-6 py-2 shadow-lg backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("timeClock.totalToday")}</p>
      <p className="text-2xl font-semibold">{displayTotal}</p>
    </div>
  );
}
