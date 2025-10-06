/* eslint-disable no-undef */
/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { Queue } from "workbox-background-sync";

const PRECACHE_MANIFEST = self.__WB_MANIFEST;
precacheAndRoute(PRECACHE_MANIFEST);
cleanupOutdatedCaches();

const appShellHandler = createHandlerBoundToURL("/index.html");
const navigationRoute = new NavigationRoute(appShellHandler);
registerRoute(navigationRoute);

registerRoute(
  ({ request }) => request.destination === "style" || request.destination === "script" || request.destination === "font",
  new CacheFirst({
    cacheName: "static-assets",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-assets",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 15 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

const apiNetworkFirst = new NetworkFirst({
  cacheName: "api-cache",
  networkTimeoutSeconds: 10,
  plugins: [
    new ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 5 * 60,
      purgeOnQuotaError: true,
    }),
  ],
});

registerRoute(
  ({ request, url }) => request.method === "GET" && ["/timesheet", "/jobs"].some((path) => url.pathname.startsWith(path)),
  apiNetworkFirst
);

const eventQueue = new Queue("time-clock-events", {
  maxRetentionTime: 24 * 60,
});

async function handleTimeEvent({ event }) {
  const clonedRequest = event.request.clone();
  try {
    const response = await fetch(clonedRequest);
    return response;
  } catch (error) {
    await eventQueue.pushRequest({ request: clonedRequest });
    return new Response(
      JSON.stringify({
        queued: true,
        message: "Evento registrado offline e será sincronizado quando a conexão voltar.",
      }),
      {
        status: 202,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

registerRoute(
  ({ request, url }) =>
    request.method === "POST" &&
    [/\/time\/clock-in$/, /\/time\/clock-out$/, /\/time\/break-start$/, /\/time\/break-end$/].some((pattern) => pattern.test(url.pathname)),
  handleTimeEvent,
  "POST"
);

self.addEventListener("sync", async (event) => {
  if (event.tag === "time-clock-sync") {
    event.waitUntil(eventQueue.replayRequests());
  }
});

self.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data.type === "REPLAY_QUEUE") {
    eventQueue.replayRequests();
  }
  if (event.data.type === "SKIP_WAITING" && self.skipWaiting) {
    self.skipWaiting();
  }
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
