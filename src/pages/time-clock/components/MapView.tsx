import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle } from "react-leaflet";
import type { JobSummary } from "@/types/timeClock";
import { useTimeClockStore } from "@/stores/timeClockStore";

import "leaflet/dist/leaflet.css";

interface MapViewProps {
  job?: JobSummary;
}

const DEFAULT_POSITION: [number, number] = [-23.5505, -46.6333];

export function MapView({ job }: MapViewProps) {
  const position = useTimeClockStore((state) => state.geoposition);

  const center = useMemo(() => {
    if (position) {
      return [position.coords.latitude, position.coords.longitude] as [number, number];
    }
    if (job) {
      return [job.geofence_center.lat, job.geofence_center.lng] as [number, number];
    }
    return DEFAULT_POSITION;
  }, [job, position]);

  const accuracy = position?.coords.accuracy;

  return (
    <div className="rounded-xl overflow-hidden border bg-muted/10">
      <MapContainer
        key={center.join(",")}
        center={center}
        zoom={16}
        scrollWheelZoom={false}
        className="h-[280px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CircleMarker center={center} radius={10} pathOptions={{ color: "#1665d8", weight: 4 }} />

        {typeof accuracy === "number" && (
          <Circle center={center} radius={accuracy} pathOptions={{ color: "#2563eb", opacity: 0.25 }} />
        )}

        {job && (
          <Circle
            center={[job.geofence_center.lat, job.geofence_center.lng]}
            radius={job.geofence_radius_m}
            pathOptions={{ color: "#22c55e", opacity: 0.3 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
