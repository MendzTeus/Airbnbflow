import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { buildTimeClockPayload, validateAccuracy, validateAllowedWindow, type EventValidationResult } from "@/lib/timeClock/events";
import { isWithinGeofence } from "@/lib/timeClock/geo";
import { decryptJson, hasWebCryptoSupport, deriveAesKey } from "@/lib/crypto/secureStorage";
import type { JobSummary, SyncedTimeClockEvent } from "@/types/timeClock";
import { upsertSyncedEvent, computeTotalsFromEvents } from "@/stores/timeClockStore";
import { useTranslation } from "@/hooks/use-translation";
import { useData } from "@/hooks/use-data";

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
  const { properties } = useData();

  const { install, isSupported: canInstall } = useInstallPrompt();
  useGeolocationWatcher();

  const fallbackJobs = useMemo(() => {
    const entries = Object.values(properties ?? {});
    if (!entries.length) return [];
    const defaultLat = geoposition?.coords.latitude ?? -23.5505;
    const defaultLng = geoposition?.coords.longitude ?? -46.6333;

    return entries.map((property) => {
      const meta = property as Record<string, unknown>;
      const rawCode =
        typeof meta.code === "string" && meta.code.trim()
          ? (meta.code as string)
          : typeof property.zipCode === "string" && property.zipCode.trim()
            ? property.zipCode.replace(/\s+/g, "")
            : property.name.slice(0, 10).replace(/\s+/g, "-");
      const latitude =
        typeof meta.latitude === "number"
          ? (meta.latitude as number)
          : typeof meta.lat === "number"
            ? (meta.lat as number)
            : defaultLat;
      const longitude =
        typeof meta.longitude === "number"
          ? (meta.longitude as number)
          : typeof meta.lng === "number"
            ? (meta.lng as number)
            : defaultLng;
      const radiusCandidate =
        typeof meta.geofence_radius_m === "number"
          ? (meta.geofence_radius_m as number)
          : typeof meta.geofenceRadius === "number"
            ? (meta.geofenceRadius as number)
            : 1000;
      const allowedStart =
        typeof meta.allowed_start === "string"
          ? (meta.allowed_start as string)
          : typeof meta.allowedStart === "string"
            ? (meta.allowedStart as string)
            : "00:00";
      const allowedEnd =
        typeof meta.allowed_end === "string"
          ? (meta.allowed_end as string)
          : typeof meta.allowedEnd === "string"
            ? (meta.allowedEnd as string)
            : "00:00";

      return {
        id: property.id,
        code: rawCode.toUpperCase(),
        name: property.name,
        client: property.city ?? "",
        geofence_center: {
          lat: Number.isFinite(latitude) ? latitude : defaultLat,
          lng: Number.isFinite(longitude) ? longitude : defaultLng,
        },
        geofence_radius_m: Number.isFinite(radiusCandidate) && radiusCandidate > 0 ? radiusCandidate : 1000,
        allowed_hours: {
          start: allowedStart,
          end: allowedEnd,
        },
        color_tag: typeof meta.color_tag === "string" ? (meta.color_tag as string) : undefined,
        active: true,
      } satisfies JobSummary;
    });
  }, [properties, geoposition]);

  useEffect(() => {
    if (!jobs.length && fallbackJobs.length) {
      setJobs(fallbackJobs);
    }
  }, [jobs, fallbackJobs, setJobs]);

  const availableJobs = useMemo(() => {
    const source = jobs.length ? jobs : fallbackJobs;
    return source.filter((job) => job.active !== false);
  }, [jobs, fallbackJobs]);

  useEffect(() => {
    if (selectedJob && !availableJobs.some((job) => job.id === selectedJob.id)) {
      setSelectedJob(undefined);
    }
  }, [availableJobs, selectedJob]);

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

  const resolveValidationMessage = useCallback(
    (result: EventValidationResult | undefined) => {
      if (!result) return undefined;
      if (result.reasonKey) {
        let message = t(result.reasonKey);
        if (result.reasonParams) {
          Object.entries(result.reasonParams).forEach(([key, value]) => {
            message = message.replace(`{${key}}`, String(value));
          });
        }
        return message;
      }
      return result.reason;
    },
    [t]
  );

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
      toast({
        title: t("timeClock.toast.precisionFailTitle"),
        description: resolveValidationMessage(accuracyCheck),
        variant: "destructive",
      });
      return;
    }

    let job = selectedJob;
    if (!job) {
      setPropertyPickerOpen(true);
      return;
    }

    const windowCheck = validateAllowedWindow(job, new Date());
    if (!windowCheck.canProceed) {
      toast({
        title: t("timeClock.toast.outsideWindowTitle"),
        description: resolveValidationMessage(windowCheck),
        variant: "destructive",
      });
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

      const response = await postTimeEvent(payload, encryptionKey);
      upsertSyncedEvent(payload, navigator.onLine ? "pending" : "pending");

      if (response.status === 202) {
        toast({
          title: t("timeClock.toast.offlineQueuedTitle"),
          description: t("timeClock.toast.offlineQueuedDescription"),
        });
      }

      if (action === "clock_out") {
        setSelectedJob(undefined);
      }
    } catch (error) {
      console.error("Failed to submit time clock action", error);
      const description =
        error instanceof Error ? error.message : t("timeClock.toast.submitErrorDescription");
      toast({
        title: t("timeClock.toast.submitErrorTitle"),
        description,
        variant: "destructive",
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
          <DialogHeader className="sr-only">
            <DialogTitle>{t("timeClock.changeJob")}</DialogTitle>
            <DialogDescription>{t("timeClock.selectJobPlaceholder")}</DialogDescription>
          </DialogHeader>
          <Command className="h-96 w-full">
            <CommandInput placeholder={t("common.search") as string} />
            <CommandList>
              <CommandEmpty>{jobsLoading ? t("common.loading") : t("timeClock.noJobs")}</CommandEmpty>
              <CommandGroup>
                {availableJobs.map((job) => (
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
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}
