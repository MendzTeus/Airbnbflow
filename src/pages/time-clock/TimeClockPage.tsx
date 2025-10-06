import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, History, UploadCloud, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeClockStore } from "@/stores/timeClockStore";
import { useGeolocationWatcher } from "@/hooks/useGeolocation";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { fetchJobs, postTimeEvent } from "@/lib/timeClock/api";
import { getCachedJobs, getPendingEvents } from "@/lib/db/timeClockDb";
import { MapView } from "./components/MapView";
import { TotalsCard } from "./components/TotalsCard";
import { OfflineNotice } from "./components/OfflineNotice";
import { PrimaryActionButton, TimeClockAction } from "./components/PrimaryActionButton";
import { JobSelectModal } from "./components/JobSelectModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { buildTimeClockPayload, validateAccuracy, validateAllowedWindow } from "@/lib/timeClock/events";
import { isWithinGeofence } from "@/lib/timeClock/geo";
import { decryptJson, hasWebCryptoSupport, deriveAesKey } from "@/lib/crypto/secureStorage";
import type { JobSummary, SyncedTimeClockEvent } from "@/types/timeClock";
import { upsertSyncedEvent, computeTotalsFromEvents } from "@/stores/timeClockStore";
import { useTranslation } from "@/hooks/use-translation";

const MAX_BREAKS = 4;

export default function TimeClockPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [jobsLoading, setJobsLoading] = useState(false);
  const [propertyPickerOpen, setPropertyPickerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobSummary | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breakCount, setBreakCount] = useState(0);

  const jobs = useTimeClockStore((state) => state.jobs);
  const setJobs = useTimeClockStore((state) => state.setJobs);
  const pendingEvents = useTimeClockStore((state) => state.pendingEvents);
  const setPendingEvents = useTimeClockStore((state) => state.setPendingEvents);
  const permissionStatus = useTimeClockStore((state) => state.permissionStatus);
  const geoposition = useTimeClockStore((state) => state.geoposition);
  const setTodaysTotals = useTimeClockStore((state) => state.setTodaysTotals);
  const encryptionKey = useTimeClockStore((state) => state.encryptionKey);
  const setEncryptionKey = useTimeClockStore((state) => state.setEncryptionKey);

  const { install, isSupported: canInstall } = useInstallPrompt();
  useGeolocationWatcher();

  useEffect(() => {
    let cancelled = false;
    async function hydrateEvents() {
      try {
        const stored = await getPendingEvents();
        const events = [] as SyncedTimeClockEvent[];
        for (const item of stored) {
          let payload = item.payload;
          if (!payload && item.payloadCipher && item.payloadIv && encryptionKey && hasWebCryptoSupport()) {
            try {
              payload = await decryptJson({ cipher: item.payloadCipher, iv: item.payloadIv }, encryptionKey);
            } catch (error) {
              console.warn("Falha ao descriptografar evento", error);
            }
          }
          if (payload) {
            events.push({
              ...payload,
              status: item.status,
              created_at: item.created_at,
              updated_at: item.updated_at,
            });
          }
        }
        if (!cancelled) {
          setPendingEvents(events);
        }
      } catch (error) {
        console.warn("Falha ao carregar eventos locais", error);
      }
    }
    hydrateEvents();
    return () => {
      cancelled = true;
    };
  }, [encryptionKey, setPendingEvents]);

  useEffect(() => {
    if (!user || !hasWebCryptoSupport()) return;
    let cancelled = false;
    async function establishKey() {
      try {
        const key = await deriveAesKey(user.id, user.id.slice(0, 8));
        if (!cancelled) {
          setEncryptionKey(key);
        }
      } catch (error) {
        console.warn("Falha ao gerar chave de criptografia", error);
      }
    }
    establishKey();
    return () => {
      cancelled = true;
    };
  }, [setEncryptionKey, user]);

  useEffect(() => {
    async function hydrateJobs() {
      const cached = await getCachedJobs();
      if (cached.length) {
        setJobs(cached);
      }
      try {
        setJobsLoading(true);
        const response = await fetchJobs({ page: 1, size: 50 });
        setJobs(response.data as JobSummary[]);
      } catch (error) {
        console.warn("Falha ao buscar jobs", error);
      } finally {
        setJobsLoading(false);
      }
    }

    hydrateJobs();
  }, [setJobs]);

  useEffect(() => {
    const totals = computeTotalsFromEvents(pendingEvents as SyncedTimeClockEvent[]);
    setTodaysTotals(totals);
    const breaks = pendingEvents.filter((event) => event.type === "break_start").length;
    setBreakCount(breaks);
  }, [pendingEvents, setTodaysTotals]);

  const nextAction = useMemo<TimeClockAction>(() => {
    if (!pendingEvents.length) return "clock_in";
    const sorted = [...pendingEvents].sort((a, b) => new Date(a.timestamp_utc).getTime() - new Date(b.timestamp_utc).getTime());
    const last = sorted[sorted.length - 1];

    if (last.type === "clock_out") return "clock_in";
    if (last.type === "break_start") return "break_end";
    if (last.type === "break_end") {
      return breakCount >= MAX_BREAKS ? "clock_out" : "break_start";
    }
    // last.type === clock_in
    return "break_start";
  }, [pendingEvents, breakCount]);

  const iosInstructions = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }, []);

  async function handleAction(action: TimeClockAction) {
    if (!user) {
      toast({
        title: t("timeClock.toast.authRequiredTitle"),
        description: t("timeClock.toast.authRequiredDescription"),
      });
      return;
    }

    if (permissionStatus === "denied") {
      toast({
        title: t("timeClock.toast.locationRequiredTitle"),
        description: t("timeClock.toast.locationRequiredDescription"),
        variant: "destructive",
      });
      return;
    }

    if (!geoposition) {
      toast({
        title: t("timeClock.toast.locationUnavailableTitle"),
        description: t("timeClock.toast.locationUnavailableDescription"),
      });
      return;
    }

    const gps = {
      lat: geoposition.coords.latitude,
      lng: geoposition.coords.longitude,
      accuracy_m: geoposition.coords.accuracy,
    };

    const accuracyCheck = validateAccuracy(gps);
    if (!accuracyCheck.canProceed) {
      toast({ title: t("timeClock.toast.precisionFailTitle"), description: accuracyCheck.reason, variant: "destructive" });
      return;
    }

    let job = selectedJob;
    if (!job) {
      setPropertyPickerOpen(true);
      return;
    }

    const windowCheck = validateAllowedWindow(job, new Date());
    if (!windowCheck.canProceed) {
      toast({ title: t("timeClock.toast.outsideWindowTitle"), description: windowCheck.reason, variant: "destructive" });
      return;
    }

    const { distance, isInside } = isWithinGeofence(gps, job);
    if (!isInside) {
      toast({
        title: t("timeClock.toast.outsideGeofenceTitle"),
        description: t("timeClock.toast.outsideGeofenceDescription")
          .replace("{distance}", Math.round(distance).toString())
          .replace("{radius}", job.geofence_radius_m.toString()),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildTimeClockPayload({
        type: action === "break_start" ? "break_start" : action === "break_end" ? "break_end" : action,
        job,
        userId: user.id,
        gps,
        permissions: { geolocation: permissionStatus ?? "unknown" },
        spoofCheckPassed: true,
      });

      await postTimeEvent(payload, encryptionKey);
      upsertSyncedEvent(payload, navigator.onLine ? "pending" : "pending");

      if (action === "clock_out") {
        setSelectedJob(undefined);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: t("timeClock.toast.submitErrorTitle"),
        description: t("timeClock.toast.submitErrorDescription"),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const buttonDisabled = permissionStatus === "denied" || (nextAction === "break_start" && breakCount >= MAX_BREAKS);

  return (
    <div className="space-y-6 pb-16">
      <header className="relative">
        <TotalsCard />
        <MapView job={selectedJob} />
      </header>

      <OfflineNotice />

      {iosInstructions && (
        <Card>
          <CardContent className="space-y-2 p-4 text-sm">
            <p className="font-medium">{t("timeClock.installInstructionsTitle")}</p>
            <ol className="list-decimal space-y-1 pl-4">
              <li>{t("timeClock.installStepShare")}</li>
              <li>{t("timeClock.installStepAddToHome")}</li>
              <li>{t("timeClock.installStepConfirm")}</li>
            </ol>
          </CardContent>
        </Card>
      )}

      <div className="rounded-3xl bg-card p-6 shadow-sm space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-muted-foreground">
            {t("timeClock.selectedJob")}
          </label>
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setPropertyPickerOpen(true)}
          >
            <span className="truncate">
              {selectedJob ? `${selectedJob.code} — ${selectedJob.name}` : t("timeClock.selectJobPlaceholder")}
            </span>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <PrimaryActionButton
          action={nextAction}
          disabled={buttonDisabled || !selectedJob}
          loading={isSubmitting}
          onClick={() => handleAction(nextAction)}
        />

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <Link to="/time-clock/adjustments" className="rounded-2xl border bg-muted/50 p-4">
            <div className="flex items-center gap-2 font-medium">
              <ClipboardList className="h-4 w-4" /> {t("timeClock.linkAdjustmentsTitle")}
            </div>
            <p className="mt-1 text-muted-foreground">{t("timeClock.linkAdjustmentsDescription")}</p>
          </Link>
          <Link to="/time-clock/timesheet" className="rounded-2xl border bg-muted/50 p-4">
            <div className="flex items-center gap-2 font-medium">
              <History className="h-4 w-4" /> {t("timeClock.linkTimesheetTitle")}
            </div>
            <p className="mt-1 text-muted-foreground">{t("timeClock.linkTimesheetDescription")}</p>
          </Link>
        </div>

        {canInstall && (
          <Button onClick={install} variant="secondary" className="mt-6 w-full">
            <UploadCloud className="mr-2 h-4 w-4" /> {t("timeClock.installButton")}
          </Button>
        )}
      </div>

      <Dialog open={propertyPickerOpen} onOpenChange={setPropertyPickerOpen}>
        <DialogContent className="sm:max-w-lg p-0">
          <Command className="h-96 w-full">
            <CommandInput placeholder={t("common.search") as string} />
            <CommandEmpty>{t("common.loading")}</CommandEmpty>
            <CommandGroup>
              {jobs.map((job) => (
                <CommandItem
                  key={job.id}
                  value={`${job.code} ${job.name}`}
                  onSelect={() => {
                    setSelectedJob(job);
                    setPropertyPickerOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{job.code} — {job.name}</span>
                    {job.client && <span className="text-xs text-muted-foreground">{job.client}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}
