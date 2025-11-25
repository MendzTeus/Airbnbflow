import type { GpsReading, JobSummary } from "@/types/timeClock";

const EARTH_RADIUS_M = 6371000;

export function haversineDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}

export function isWithinGeofence(gps: GpsReading, job: JobSummary) {
  const distance = haversineDistance({ lat: gps.lat, lng: gps.lng }, job.geofence_center);
  return {
    distance,
    isInside: distance <= job.geofence_radius_m,
  };
}

function parseTimeToMinutes(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return undefined;
  const [, rawHours, rawMinutes, rawSeconds] = match;
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  const seconds = rawSeconds ? Number(rawSeconds) : 0;
  if ([hours, minutes, seconds].some((part) => Number.isNaN(part))) return undefined;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return undefined;
  return hours * 60 + minutes + seconds / 60;
}

export function isWithinAllowedWindow(job: JobSummary, date: Date) {
  if (!job.allowed_hours) return true;
  const startMinutes = parseTimeToMinutes(job.allowed_hours.start);
  const endMinutes = parseTimeToMinutes(job.allowed_hours.end);
  if (startMinutes === undefined || endMinutes === undefined) {
    return true;
  }

  if (startMinutes === endMinutes) {
    return true;
  }

  const minutes = date.getHours() * 60 + date.getMinutes();
  if (startMinutes < endMinutes) {
    return minutes >= startMinutes && minutes <= endMinutes;
  }

  return minutes >= startMinutes || minutes <= endMinutes;
}
