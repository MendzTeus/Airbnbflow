import type { JobSummary, TimeClockEventPayload, TimeClockEventType, GpsReading } from "@/types/timeClock";
import { isWithinAllowedWindow } from "./geo";

const ACCURACY_THRESHOLD = 100; // meters

export interface EventValidationResult {
  canProceed: boolean;
  reason?: string;
}

export function validateAccuracy(gps: GpsReading, maxAccuracy = ACCURACY_THRESHOLD): EventValidationResult {
  if (gps.accuracy_m > maxAccuracy) {
    return {
      canProceed: false,
      reason: `Precisão do GPS (${Math.round(gps.accuracy_m)}m) acima do limite permitido (${maxAccuracy}m).`,
    };
  }
  return { canProceed: true };
}

export function validateAllowedWindow(job: JobSummary, now: Date): EventValidationResult {
  if (!isWithinAllowedWindow(job, now)) {
    return {
      canProceed: false,
      reason: "Fora da janela de batida permitida para este Job.",
    };
  }
  return { canProceed: true };
}

export function buildTimeClockPayload(params: {
  type: TimeClockEventType;
  job: JobSummary;
  userId: string;
  gps: GpsReading;
  notes?: string;
  publicIp?: string;
  permissions: Record<string, PermissionState | "unknown">;
  spoofCheckPassed: boolean;
}): TimeClockEventPayload {
  const event_uuid = crypto.randomUUID();
  const timestamp = new Date();
  const deviceTime = timestamp.toISOString();
  const tzOffsetMinutes = timestamp.getTimezoneOffset();
  const localDate = new Date(timestamp.getTime() - tzOffsetMinutes * 60 * 1000);
  const device_time = `${localDate.toISOString().slice(0, 19)}${formatTimezoneOffset(tzOffsetMinutes)}`;
  const appVersion = import.meta.env.VITE_APP_VERSION ?? "pwa-1.0.0";

  return {
    event_uuid,
    user_id: params.userId,
    job_id: params.job.id,
    timestamp_utc: timestamp.toISOString(),
    device_time,
    gps: params.gps,
    address: params.gps.address,
    device: {
      ua: navigator.userAgent,
      fp_hash: getDeviceFingerprint(),
      app_version: appVersion,
    },
    network: {
      online: navigator.onLine,
      public_ip: params.publicIp,
    },
    anti_fraud: {
      permissions: params.permissions,
      spoof_check_passed: params.spoofCheckPassed,
    },
    notes: params.notes ?? "",
    type: params.type,
  };
}

function formatTimezoneOffset(offsetMinutes: number) {
  const sign = offsetMinutes > 0 ? "-" : "+";
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (absolute % 60).toString().padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function getDeviceFingerprint() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    context.textBaseline = "top";
    context.font = "14px 'Arial'";
    context.fillText(navigator.userAgent, 2, 2);
    const data = canvas.toDataURL();
    return hashString(data + navigator.language + screen.width + screen.height);
  } catch (error) {
    console.warn("Fingerprint falhou", error);
    return undefined;
  }
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}
