import { useEffect, useRef } from "react";
import { useTimeClockStore } from "@/stores/timeClockStore";

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocationWatcher(options: GeolocationOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }) {
  const setPermissionStatus = useTimeClockStore((state) => state.setPermissionStatus);
  const setGeoposition = useTimeClockStore((state) => state.setGeoposition);
  const watcherId = useRef<number>();

  useEffect(() => {
    let cancelled = false;

    async function checkPermissions() {
      if (!navigator.permissions) {
        setPermissionStatus("unknown");
        return;
      }

      try {
        const status = await navigator.permissions.query({ name: "geolocation" });
        if (!cancelled) {
          setPermissionStatus(status.state);
        }
        status.onchange = () => setPermissionStatus(status.state);
      } catch (error) {
        console.warn("Erro ao consultar Permissions API", error);
        setPermissionStatus("unknown");
      }
    }

    checkPermissions();

    if (!("geolocation" in navigator)) {
      return () => undefined;
    }

    watcherId.current = navigator.geolocation.watchPosition(
      (position) => {
        if (!cancelled) {
          setGeoposition(position);
        }
      },
      (error) => {
        console.warn("Falha ao obter geolocalização", error);
      },
      options
    );

    return () => {
      cancelled = true;
      if (watcherId.current !== undefined) {
        navigator.geolocation.clearWatch(watcherId.current);
      }
    };
  }, [options.enableHighAccuracy, options.maximumAge, options.timeout, setGeoposition, setPermissionStatus]);
}
