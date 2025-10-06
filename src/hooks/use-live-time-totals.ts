import { useEffect, useMemo, useState } from "react";
import { useTimeClockStore, computeLiveMinutes } from "@/stores/timeClockStore";

const formatMinutes = (minutes: number) => {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const mins = (safe % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

export function useLiveTimeTotals() {
  const pendingEvents = useTimeClockStore((state) => state.pendingEvents);

  const { minutes, activeStart } = useMemo(
    () => computeLiveMinutes(pendingEvents),
    [pendingEvents],
  );

  const [display, setDisplay] = useState(() =>
    formatMinutes(minutes + (activeStart ? (Date.now() - activeStart.getTime()) / 60000 : 0)),
  );

  useEffect(() => {
    const update = () => {
      const runningAddition = activeStart ? (Date.now() - activeStart.getTime()) / 60000 : 0;
      setDisplay(formatMinutes(minutes + runningAddition));
    };

    update();
    if (!activeStart) {
      return;
    }

    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [minutes, activeStart]);

  return display;
}
