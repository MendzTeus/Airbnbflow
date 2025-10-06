import { Workbox } from "workbox-window";

let registrationPromise: Promise<ServiceWorkerRegistration> | null = null;

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (registrationPromise) {
    return;
  }

  registrationPromise = new Promise(async (resolve, reject) => {
    try {
      const wb = new Workbox("/service-worker.js");

      wb.addEventListener("waiting", () => {
        wb.messageSW({ type: "SKIP_WAITING" });
      });

      wb.addEventListener("controlling", () => {
        window.dispatchEvent(new CustomEvent("pwa:sw-updated"));
      });

      wb.addEventListener("activated", (event) => {
        if (!event.isUpdate) {
          console.info("Service worker ativado com sucesso.");
        }
      });

      const registration = await wb.register();

      if ("sync" in registration) {
        try {
          await registration.sync.register("time-clock-sync");
        } catch (error) {
          console.warn("Background Sync indisponível", error);
        }
      }

      resolve(registration);
    } catch (error) {
      console.error("Falha ao registrar service worker", error);
      reject(error);
    }
  });
}

export function getServiceWorkerRegistration() {
  return registrationPromise;
}

export async function requestQueueReplay() {
  try {
    const registration = await getServiceWorkerRegistration();
    if (registration?.active) {
      registration.active.postMessage({ type: "REPLAY_QUEUE" });
    }
  } catch (error) {
    console.warn("Não foi possível solicitar replay da fila", error);
  }
}
