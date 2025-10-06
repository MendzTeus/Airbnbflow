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

export function isWithinAllowedWindow(job: JobSummary, date: Date) {
  if (!job.allowed_hours) return true;
  const [startHour, startMinute] = job.allowed_hours.start.split(":").map(Number);
  const [endHour, endMinute] = job.allowed_hours.end.split(":").map(Number);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  return minutes >= startMinutes && minutes <= endMinutes;
}
