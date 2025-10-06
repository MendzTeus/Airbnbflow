import { openDB, type DBSchema } from "idb";
import type { JobSummary, TimeClockEventPayload } from "@/types/timeClock";

interface TimeClockSchema extends DBSchema {
  jobs: {
    key: string;
    value: JobSummary & { cachedAt: number };
  };
  time_events: {
    key: string;
    value: {
      event_uuid: string;
      status: "pending" | "synced" | "failed";
      payloadCipher?: string;
      payloadIv?: string;
      payload?: TimeClockEventPayload;
      created_at: number;
      updated_at: number;
    };
    indexes: { status: string };
  };
  sync_queue: {
    key: string;
    value: {
      event_uuid: string;
      request: RequestInit & { url: string; method: string };
      created_at: number;
      attempts: number;
    };
  };
}

const DB_NAME = "time-clock-db";
const DB_VERSION = 1;

const dbPromise = openDB<TimeClockSchema>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("jobs")) {
      db.createObjectStore("jobs", { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains("time_events")) {
      const store = db.createObjectStore("time_events", { keyPath: "event_uuid" });
      store.createIndex("status", "status");
    }

    if (!db.objectStoreNames.contains("sync_queue")) {
      db.createObjectStore("sync_queue", { keyPath: "event_uuid" });
    }
  },
});

export async function cacheJobs(jobs: JobSummary[]) {
  const db = await dbPromise;
  const tx = db.transaction("jobs", "readwrite");
  const now = Date.now();
  await Promise.all(jobs.map((job) => tx.store.put({ ...job, cachedAt: now })));
  await tx.done;
}

export async function getCachedJobs() {
  const db = await dbPromise;
  return db.getAll("jobs");
}

export async function putTimeEvent(
  payload: TimeClockEventPayload,
  options: { status: "pending" | "synced" | "failed"; cipher?: { cipher: string; iv: string } }
) {
  const db = await dbPromise;
  const now = Date.now();
  const value = {
    event_uuid: payload.event_uuid,
    status: options.status,
    payloadCipher: options.cipher?.cipher,
    payloadIv: options.cipher?.iv,
    payload: options.cipher ? undefined : payload,
    created_at: now,
    updated_at: now,
  };
  await db.put("time_events", value);
}

export async function updateTimeEventStatus(eventUuid: string, status: "pending" | "synced" | "failed") {
  const db = await dbPromise;
  const record = await db.get("time_events", eventUuid);
  if (!record) return;
  record.status = status;
  record.updated_at = Date.now();
  await db.put("time_events", record);
}

export async function getPendingEvents() {
  const db = await dbPromise;
  return db.getAllFromIndex("time_events", "status", "pending");
}

export async function writeQueueRequest(entry: {
  event_uuid: string;
  request: RequestInit & { url: string; method: string };
}) {
  const db = await dbPromise;
  await db.put("sync_queue", { ...entry, created_at: Date.now(), attempts: 0 });
}

export async function markQueueAttempt(eventUuid: string) {
  const db = await dbPromise;
  const record = await db.get("sync_queue", eventUuid);
  if (!record) return;
  record.attempts += 1;
  await db.put("sync_queue", record);
}

export async function removeFromQueue(eventUuid: string) {
  const db = await dbPromise;
  await db.delete("sync_queue", eventUuid);
}

export async function getQueueEntries() {
  const db = await dbPromise;
  return db.getAll("sync_queue");
}

export async function clearCaches() {
  const db = await dbPromise;
  await Promise.all([
    db.clear("jobs"),
    db.clear("time_events"),
    db.clear("sync_queue"),
  ]);
}
