export type TimeClockEventType =
  | "clock_in"
  | "clock_out"
  | "break_start"
  | "break_end";

type TimeClockEventStatus = "pending" | "synced" | "failed";

export interface GpsReading {
  lat: number;
  lng: number;
  accuracy_m: number;
  address?: string;
}

export interface DeviceMetadata {
  ua: string;
  fp_hash?: string;
  app_version: string;
}

export interface NetworkMetadata {
  online: boolean;
  public_ip?: string;
}

export interface AntiFraudMetadata {
  permissions: Record<string, PermissionState | "unknown">;
  spoof_check_passed: boolean;
}

export interface TimeClockEventPayload {
  event_uuid: string;
  user_id: string;
  job_id: string;
  timestamp_utc: string;
  device_time: string;
  gps: GpsReading;
  address?: string;
  device: DeviceMetadata;
  network: NetworkMetadata;
  anti_fraud: AntiFraudMetadata;
  notes?: string;
  type: TimeClockEventType;
}

export interface SyncedTimeClockEvent extends TimeClockEventPayload {
  status: TimeClockEventStatus;
  created_at: number;
  updated_at: number;
}

export interface JobSummary {
  id: string;
  code: string;
  name: string;
  client: string;
  geofence_center: {
    lat: number;
    lng: number;
  };
  geofence_radius_m: number;
  allowed_hours: {
    start: string;
    end: string;
  };
  color_tag?: string;
  active: boolean;
}

export interface ShiftBreak {
  id: string;
  started_at: string;
  ended_at?: string;
}

export interface ShiftSummary {
  id: string;
  user_id: string;
  job_id: string;
  clock_in: string;
  clock_out?: string;
  breaks: ShiftBreak[];
}

export interface TimeTotals {
  todaysMinutes: number;
  formatted: string;
}

export interface OfflineEventFeedback {
  eventUuid: string;
  status: TimeClockEventStatus;
  message: string;
}

export interface AdjustmentRequestPayload {
  id: string;
  user_id: string;
  from_event_uuid?: string;
  requested_timestamp: string;
  new_timestamp: string;
  reason: string;
  attachment_urls?: string[];
  status: "pending" | "approved" | "rejected";
  approver_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface TimesheetEntry {
  event_uuid: string;
  user_id: string;
  job_id: string;
  job_name: string;
  date: string;
  clock_in: string;
  clock_out?: string;
  total_minutes: number;
  break_minutes: number;
  source: 'online' | 'offline';
}

export interface TimesheetFilters {
  from: string;
  to: string;
  job_id?: string;
}
