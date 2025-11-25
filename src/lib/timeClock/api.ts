import { z } from "zod";
import type {
  JobSummary,
  TimeClockEventPayload,
  TimeClockEventType,
  AdjustmentRequestPayload,
  TimesheetEntry,
  TimesheetFilters,
} from "@/types/timeClock";
import { cacheJobs, putTimeEvent, updateTimeEventStatus } from "@/lib/db/timeClockDb";
import { upsertSyncedEvent } from "@/stores/timeClockStore";
import { encryptJson } from "@/lib/crypto/secureStorage";
import { supabase } from "@/lib/supabase";

const jobSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  client: z.string().optional().default(""),
  geofence_center: z.object({ lat: z.number(), lng: z.number() }),
  geofence_radius_m: z.number().min(1),
  allowed_hours: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional()
    .default({ start: "06:00", end: "22:00" }),
  color_tag: z.string().optional(),
  active: z.boolean().optional().default(true),
});

const jobsResponseSchema = z.object({
  data: z.array(jobSchema),
  page: z.number(),
  size: z.number(),
  total: z.number(),
});

const timesheetEntrySchema = z.object({
  event_uuid: z.string(),
  user_id: z.string(),
  job_id: z.string(),
  job_name: z.string(),
  date: z.string(),
  clock_in: z.string(),
  clock_out: z.string().nullable(),
  total_minutes: z.number(),
  break_minutes: z.number(),
  source: z.enum(["online", "offline"]),
});

const adjustmentsResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      user_id: z.string(),
      requested_timestamp: z.string(),
      new_timestamp: z.string(),
      reason: z.string(),
      status: z.enum(["pending", "approved", "rejected"]),
      approver_comment: z.string().optional(),
      created_at: z.string(),
      updated_at: z.string(),
    })
  ),
});

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";
const FALLBACK_ORIGIN = "http://localhost";

const getOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  if (typeof globalThis !== "undefined") {
    const possibleOrigin = (globalThis as { location?: { origin?: string } }).location?.origin;
    if (possibleOrigin) {
      return possibleOrigin;
    }
  }
  return FALLBACK_ORIGIN;
};

function resolveApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  if (/^https?:\/\//i.test(apiBaseUrl)) {
    const base = apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`;
    return new URL(normalizedPath, base);
  }

  const origin = getOrigin();
  const base = apiBaseUrl.startsWith("/") ? apiBaseUrl : `/${apiBaseUrl}`;
  const baseWithSlash = base.endsWith("/") ? base : `${base}/`;

  return new URL(normalizedPath, `${origin}${baseWithSlash}`);
}

const buildTimesheetUrl = (filters?: Partial<TimesheetFilters> & { user_id?: string; job_id?: string }) => {
  const url = resolveApiUrl("timesheet");
  if (!filters) {
    return url;
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
};

async function authenticatedFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (!headers.has("Authorization")) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (error) {
      console.warn("Não foi possível recuperar sessão do Supabase", error);
    }
  }
  const response = await fetch(input, { ...init, headers, credentials: init.credentials ?? "include" });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API request failed (${response.status}): ${body}`);
  }
  return response;
}

export async function fetchJobs(params: { search?: string; page?: number; size?: number }, signal?: AbortSignal) {
  const url = resolveApiUrl("jobs");
  if (params.search) url.searchParams.set("search", params.search);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.size) url.searchParams.set("size", String(params.size));

  const response = await authenticatedFetch(url, { method: "GET", signal });
  const payload = jobsResponseSchema.parse(await response.json());
  cacheJobs(payload.data as JobSummary[]).catch((error) => console.warn("Falha ao cachear jobs", error));
  return payload;
}

export async function fetchTimesheet(filters: Partial<TimesheetFilters> & { user_id: string }, signal?: AbortSignal) {
  const url = buildTimesheetUrl(filters);
  const response = await authenticatedFetch(url, { method: "GET", signal });
  const data = await response.json();
  const schema = z.object({ data: z.array(timesheetEntrySchema) });
  return schema.parse(data).data as TimesheetEntry[];
}

export async function exportTimesheet(filters: Partial<TimesheetFilters> & { user_id: string; format: "csv" | "xlsx" | "pdf" }) {
  const url = buildTimesheetUrl(filters);
  url.searchParams.set("format", filters.format);
  const response = await authenticatedFetch(url, { method: "GET" });
  const blob = await response.blob();
  const fileName = `timesheet.${filters.format === "xlsx" ? "xlsx" : filters.format}`;
  return { blob, fileName };
}

export async function postTimeEvent(payload: TimeClockEventPayload, encryptionKey?: CryptoKey) {
  const endpoint = resolveApiUrl(`time/${mapEventTypeToEndpoint(payload.type)}`).toString();
  const responsePromise = authenticatedFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const cipher = encryptionKey ? await encryptJson(payload, encryptionKey) : undefined;
  await putTimeEvent(payload, { status: navigator.onLine ? "pending" : "pending", cipher });
  upsertSyncedEvent(payload, navigator.onLine ? "pending" : "pending");

  return responsePromise
    .then(async (response) => {
      await updateTimeEventStatus(payload.event_uuid, "synced");
      upsertSyncedEvent(payload, "synced");
      return response;
    })
    .catch(async (error) => {
      console.warn("Erro ao enviar evento, manter em fila", error);
      if (!navigator.onLine) {
        return new Response(JSON.stringify({ queued: true }), { status: 202 });
      }
      await updateTimeEventStatus(payload.event_uuid, "failed");
      upsertSyncedEvent(payload, "failed");
      throw error;
    });
}

function mapEventTypeToEndpoint(type: TimeClockEventType) {
  switch (type) {
    case "clock_in":
      return "clock-in";
    case "clock_out":
      return "clock-out";
    case "break_start":
      return "break-start";
    case "break_end":
      return "break-end";
    default:
      return type satisfies never;
  }
}

export async function fetchAdjustments(signal?: AbortSignal) {
  const response = await authenticatedFetch(resolveApiUrl("adjustments"), { method: "GET", signal });
  return adjustmentsResponseSchema.parse(await response.json());
}

export async function submitAdjustment(payload: Partial<AdjustmentRequestPayload>) {
  const response = await authenticatedFetch(resolveApiUrl("adjustments"), {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function updateAdjustmentStatus(id: string, action: "approve" | "reject", comment: string) {
  const response = await authenticatedFetch(resolveApiUrl(`adjustments/${id}/${action}`), {
    method: "PATCH",
    body: JSON.stringify({ comment }),
  });
  return response.json();
}

export async function adminListJobs(params: { search?: string; page?: number; size?: number } = {}) {
  const url = resolveApiUrl("admin/jobs");
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  const response = await authenticatedFetch(url, { method: "GET" });
  return jobsResponseSchema.parse(await response.json());
}

export async function adminUpsertJob(job: Partial<JobSummary> & { id?: string }) {
  const endpoint = resolveApiUrl(job.id ? `admin/jobs/${job.id}` : "admin/jobs").toString();
  const method = job.id ? "PUT" : "POST";
  const response = await authenticatedFetch(endpoint, {
    method,
    body: JSON.stringify(job),
  });
  return jobSchema.parse(await response.json());
}

export async function adminToggleJob(jobId: string, active: boolean) {
  const response = await authenticatedFetch(resolveApiUrl(`admin/jobs/${jobId}/status`), {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
  return jobSchema.parse(await response.json());
}

export async function adminAssignUsers(jobId: string, userIds: string[]) {
  const response = await authenticatedFetch(resolveApiUrl(`admin/jobs/${jobId}/assignments`), {
    method: "POST",
    body: JSON.stringify({ user_ids: userIds }),
  });
  return response.json();
}
