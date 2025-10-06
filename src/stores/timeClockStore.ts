import { create } from "zustand";
import type {
  JobSummary,
  SyncedTimeClockEvent,
  TimeClockEventPayload,
  TimeTotals,
} from "@/types/timeClock";

interface TimeClockState {
  jobs: JobSummary[];
  jobsLastSync?: number;
  pendingEvents: SyncedTimeClockEvent[];
  currentShift: SyncedTimeClockEvent | null;
  todaysTotals: TimeTotals;
  isOffline: boolean;
  permissionStatus: PermissionState | "unknown";
  installPromptEvent?: BeforeInstallPromptEvent;
  geoposition?: GeolocationPosition;
  encryptionKey?: CryptoKey;
  setJobs: (jobs: JobSummary[]) => void;
  setPendingEvents: (events: SyncedTimeClockEvent[]) => void;
  upsertPendingEvent: (event: SyncedTimeClockEvent) => void;
  markEventStatus: (eventUuid: string, status: "pending" | "synced" | "failed") => void;
  setCurrentShift: (event: SyncedTimeClockEvent | null) => void;
  setTodaysTotals: (totals: TimeTotals) => void;
  setOffline: (isOffline: boolean) => void;
  setPermissionStatus: (status: PermissionState | "unknown") => void;
  setInstallPromptEvent: (event?: BeforeInstallPromptEvent) => void;
  setGeoposition: (position?: GeolocationPosition) => void;
  setEncryptionKey: (key?: CryptoKey) => void;
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const defaultTotals: TimeTotals = {
  todaysMinutes: 0,
  formatted: "00:00",
};

export const useTimeClockStore = create<TimeClockState>((set, get) => ({
  jobs: [],
  pendingEvents: [],
  currentShift: null,
  todaysTotals: defaultTotals,
  isOffline: !navigator.onLine,
  permissionStatus: "unknown",

  setJobs: (jobs) => set({ jobs, jobsLastSync: Date.now() }),

  setPendingEvents: (events) => set({ pendingEvents: events }),

  upsertPendingEvent: (event) => {
    const events = get().pendingEvents.slice();
    const index = events.findIndex((item) => item.event_uuid === event.event_uuid);
    if (index >= 0) {
      events[index] = event;
    } else {
      events.unshift(event);
    }
    set({ pendingEvents: events });
  },

  markEventStatus: (eventUuid, status) => {
    const events = get().pendingEvents.map((event) =>
      event.event_uuid === eventUuid ? { ...event, status, updated_at: Date.now() } : event
    );
    set({ pendingEvents: events });
  },

  setCurrentShift: (event) => set({ currentShift: event }),

  setTodaysTotals: (totals) => set({ todaysTotals: totals }),

  setOffline: (isOffline) => set({ isOffline }),

  setPermissionStatus: (status) => set({ permissionStatus: status }),

  setInstallPromptEvent: (event) => set({ installPromptEvent: event }),

  setGeoposition: (position) => set({ geoposition: position }),

  setEncryptionKey: (key) => set({ encryptionKey: key }),
}));

export function computeTotalsFromEvents(events: SyncedTimeClockEvent[]): TimeTotals {
  if (!events.length) {
    return defaultTotals;
  }

  const sorted = [...events].sort((a, b) => new Date(a.timestamp_utc).getTime() - new Date(b.timestamp_utc).getTime());
  let totalMinutes = 0;
  let lastClockIn: Date | null = null;
  let pauseStart: Date | null = null;

  for (const event of sorted) {
    const ts = new Date(event.timestamp_utc);

    switch (event.type) {
      case "clock_in":
        lastClockIn = ts;
        break;
      case "break_start":
        pauseStart = ts;
        break;
      case "break_end":
        if (pauseStart) {
          totalMinutes -= (ts.getTime() - pauseStart.getTime()) / 60000;
          pauseStart = null;
        }
        break;
      case "clock_out":
        if (lastClockIn) {
          totalMinutes += (ts.getTime() - lastClockIn.getTime()) / 60000;
          lastClockIn = null;
        }
        break;
      default:
        break;
    }
  }

  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");

  return {
    todaysMinutes: minutes,
    formatted: `${hours}:${mins}`,
  };
}

export function upsertSyncedEvent(event: TimeClockEventPayload, status: "pending" | "synced" | "failed") {
  const record: SyncedTimeClockEvent = {
    ...event,
    status,
    created_at: Date.now(),
    updated_at: Date.now(),
  };
  useTimeClockStore.getState().upsertPendingEvent(record);
  const totals = computeTotalsFromEvents(useTimeClockStore.getState().pendingEvents);
  useTimeClockStore.getState().setTodaysTotals(totals);
}

export function computeLiveMinutes(events: SyncedTimeClockEvent[]) {
  if (!events.length) {
    return { minutes: 0, activeStart: null as Date | null };
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp_utc).getTime() - new Date(b.timestamp_utc).getTime(),
  );

  let minutes = 0;
  let currentStart: Date | null = null;

  for (const event of sorted) {
    const timestamp = new Date(event.timestamp_utc);

    if (event.type === "clock_in" || event.type === "break_end") {
      currentStart = timestamp;
      continue;
    }

    if ((event.type === "break_start" || event.type === "clock_out") && currentStart) {
      minutes += (timestamp.getTime() - currentStart.getTime()) / 60000;
      currentStart = null;
    }
  }

  return { minutes, activeStart: currentStart };
}

window.addEventListener("online", () => useTimeClockStore.getState().setOffline(false));
window.addEventListener("offline", () => useTimeClockStore.getState().setOffline(true));
