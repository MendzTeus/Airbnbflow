/* eslint-disable no-undef */
/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { Queue } from "workbox-background-sync";

const PRECACHE_MANIFEST = [{"revision":"5bbf73cb47f2a2eb312c6bf227bfc248","url":"assets/AccessCodeForm-B3fUrfWq.js"},{"revision":"8247d58fb7bd7bb3fa42d849d5a3554b","url":"assets/AccessCodesPage-CLlIu5bC.js"},{"revision":"e40f37cf6bbf1d63ff3978b39a859721","url":"assets/alert-BKCop9Vh.js"},{"revision":"722489cf0beb42ae5180e6f1b43a4511","url":"assets/alert-dialog-dK_wMhNu.js"},{"revision":"bd3abababcdef2c4e41ef35d86de0395","url":"assets/AppLayout-G2GxdeTP.js"},{"revision":"bdd98369a1c3403c0efe92507e90ec28","url":"assets/arrow-left-s31EvzC8.js"},{"revision":"f1a4a0e57f76862f00fd652e97f7cfbb","url":"assets/building-acADVoMY.js"},{"revision":"0f1d05afd6dbeded6efe716c4a3aebac","url":"assets/calendar-LSReFn13.js"},{"revision":"7768c954204a7e9725ff7316fe2e33c7","url":"assets/checkbox-DKLiD9us.js"},{"revision":"fbc67b376b7fecf2ffabe99d9e0bd951","url":"assets/ChecklistForm-C_Pt2yHc.js"},{"revision":"02884fe147cd18971537ded979898a6a","url":"assets/ChecklistsPage-gmrKPgru.js"},{"revision":"e14bf542fdf2ea86e0bf76c014534a83","url":"assets/chevron-left-D8QJVROw.js"},{"revision":"54e729dd7c885d1e1722fbff25bd60d4","url":"assets/chevron-right-BoYVHMHi.js"},{"revision":"1683ac83f18fbeb6e05e6f3dae504b52","url":"assets/clipboard-check-DYPUPOyH.js"},{"revision":"0d613ef5f6412762d997d3e78d7ae83e","url":"assets/clock-DvPf5xfk.js"},{"revision":"6b29ffc7fd3ac67e7ca0facc68f2e04c","url":"assets/Dashboard-1yU2Nww8.js"},{"revision":"46e10c1a8df37ac70d3d4cc839d007ab","url":"assets/EmployeeForm-DkaQSmAI.js"},{"revision":"d00b50ed3330d729e9c08e9d55625a1d","url":"assets/EmployeesPage-Ja9B2Omt.js"},{"revision":"c453d1a429e5c3d60523a3c187e661f1","url":"assets/house-xoaF5Jwy.js"},{"revision":"7588ac132c353739aeafdfbf3dae5fde","url":"assets/index-CFBfUQr5.js"},{"revision":"5b42f41a729f22edd9d38033bd6100e4","url":"assets/index-DLQ-6Kaa.css"},{"revision":"ec08134e659c39336469af7365cde4f9","url":"assets/key-CbQEqBkp.js"},{"revision":"c0a2609cd03fd95eb4a8e6b9d8e0bfd9","url":"assets/label-Cdm9zhvV.js"},{"revision":"1a2d0ec55f01f2c8a698ce9455d4cba0","url":"assets/Login-CyoDuCw_.js"},{"revision":"8343d7744ff0b288af7eed9259c6cc31","url":"assets/MaintenanceForm-C0FDjt7P.js"},{"revision":"8506493dfb17cd20765d4738a82ff828","url":"assets/MaintenancePage-CVbN_CND.js"},{"revision":"f6bc0050aa47ef22df193d174c8f6085","url":"assets/map-pin-BsP7L8Kg.js"},{"revision":"c32b5fe7e2d9de35a998e255d92b2707","url":"assets/moon-Ccpft3WP.js"},{"revision":"a0193ea0a21f560adee23da096d6cc61","url":"assets/NotFound-B2MjQN7_.js"},{"revision":"46ac4930ebdddbe8c2003a8460268780","url":"assets/plus-Cvcf7KTe.js"},{"revision":"a7cee8e6a23b2a3b5efa4897f6bedd1e","url":"assets/ProfilePage-DWRoJnSC.js"},{"revision":"e4b6dd8e71bdfe67852b9482ede0f8ee","url":"assets/progress-BMeFLOzC.js"},{"revision":"16c743989c4cdee48111659439e4167f","url":"assets/PropertiesPage-YS2oo3oQ.js"},{"revision":"8c3e7169df3a7d37217fe7efc622022f","url":"assets/PropertyDetail-BNh9CRnO.js"},{"revision":"5f965e11dae80e081e4b1ea554bcad8f","url":"assets/PropertyForm-UC2tpDga.js"},{"revision":"6db95e360801dbd88c18b11d00e6da0a","url":"assets/separator-CeNxhGK4.js"},{"revision":"dae9369c2f28056a05a50e3b1678501b","url":"assets/skeleton-CFnampVp.js"},{"revision":"335a3bc394709a87d0edf21cc01cffe3","url":"assets/square-pen-2UOtia5C.js"},{"revision":"d544ee3369a5909bd188652f77a9ee9b","url":"assets/table-C3xMFgyL.js"},{"revision":"1d9e1e91a212267207d58bfced3339b8","url":"assets/trash-2-DDAci78G.js"},{"revision":"6170a792930df16af92f44fe7ade67eb","url":"assets/user-CxJjl2ik.js"},{"revision":"8eb32b6e7c9ca5106589e280678592f8","url":"assets/users-BU5ZOGGK.js"},{"revision":"09aa409b3f0180932607934816c318f2","url":"assets/wrench-D4g40m_u.js"},{"revision":"0664afd9fa1992696d98f1bd8688822d","url":"icons/apple-touch-icon.png"},{"revision":"066ee1bf40a8b34252502c92cc37a148","url":"icons/icon-192.png"},{"revision":"7f00f68f062c2460cb34df5508bfe852","url":"icons/icon-512.png"},{"revision":"2ed1838c052bd58de48bc0a4be14d616","url":"icons/splash-1024.png"},{"revision":"446a2c2dc5537b3e8e05f5bd49afaf00","url":"index.html"}];
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
