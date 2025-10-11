/* eslint-disable no-undef */
/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { Queue } from "workbox-background-sync";

const PRECACHE_MANIFEST = [{"revision":"01c3415a1aba0979c178c009e8081864","url":"assets/AccessCodeForm-DCtCn8hD.js"},{"revision":"89ae2a3c3be02a16a931137c291314e7","url":"assets/AccessCodesPage-g1S-vv9b.js"},{"revision":"e238fb36ccd81332bcbb93c4ddce47c8","url":"assets/alert-dialog-DW6Xl5Dd.js"},{"revision":"d1dae50e4d1d469ec8d6814e671d31f6","url":"assets/alert-DmHhVe5J.js"},{"revision":"30bc3b3b47395b4b54ad1f51c5d3886b","url":"assets/AppLayout-pdkrc5ei.js"},{"revision":"1a451e63b02792808f6b07c260a83af5","url":"assets/arrow-left-CR17IvGt.js"},{"revision":"54905408395159b79e0b5b4b80fc381e","url":"assets/building-Cz2-lbxx.js"},{"revision":"302fb18e1ba43ad7efa46781fbd82656","url":"assets/calendar-D5zIh5WE.js"},{"revision":"a54c93bed66c81c2dda953988cea46de","url":"assets/checkbox-lYf4Qz72.js"},{"revision":"c33f373bf2cf3039406d04adfd64f205","url":"assets/ChecklistForm-kAtgzL0I.js"},{"revision":"2143033400a2f50c2702c29a65194faf","url":"assets/ChecklistsPage-67ETcjHg.js"},{"revision":"8b9d47c974eca2c327abbd779cf64d64","url":"assets/chevron-left-t47wSiEy.js"},{"revision":"007afd7a34e14e7ace1022823faf44bd","url":"assets/chevron-right-CqfuMHS1.js"},{"revision":"d216595af72cab1c75b06cdef232188d","url":"assets/clipboard-check-Bisw_q-O.js"},{"revision":"84ddccc779d1763bf698eb8af5448c9d","url":"assets/clock-BT5pHYdE.js"},{"revision":"fed01899fd38814c752508e86241a0d7","url":"assets/Dashboard-DCTvH-sn.js"},{"revision":"d8c8c066874a80bf78a351f3c857bdac","url":"assets/EmployeeForm-BY_RCtp0.js"},{"revision":"27c137378ca70edb376d69c1c30bd47f","url":"assets/EmployeesPage-BOLTc-YS.js"},{"revision":"ff446368b3dbf3038de57f14ea5aa5f0","url":"assets/house-C81aCLBk.js"},{"revision":"fce97acf4756041eaf40ccdb45c4fc4e","url":"assets/index-CrOiOZaf.js"},{"revision":"5b42f41a729f22edd9d38033bd6100e4","url":"assets/index-DLQ-6Kaa.css"},{"revision":"67fd792365ec55d9516bad88bebfb139","url":"assets/key-CKyw0Akm.js"},{"revision":"dd55db8bd2ae5431a87901f92a59b2cf","url":"assets/label-WgsdipAv.js"},{"revision":"37710f39314c57230470757b2162f797","url":"assets/Login-3fmR4xCE.js"},{"revision":"a0351661da6312c61b0c9f84b6dbcedb","url":"assets/MaintenanceForm-0h1e3XD7.js"},{"revision":"c58ae01c3ab7d6ddd38928cb08e70a65","url":"assets/MaintenancePage-BbQVlPVU.js"},{"revision":"2a4b69286e48b5dba4dbca850060a3f1","url":"assets/map-pin-CqrHScCI.js"},{"revision":"e6ad557684b4c12ba896a550e44e92a0","url":"assets/moon-CAkX89O4.js"},{"revision":"0df3fab52a2a547c9f55a4d44cf1f03e","url":"assets/NotFound-BJhVizPM.js"},{"revision":"1296e682253beebd0ae3802d2fb7c4da","url":"assets/plus-C5WDt3dV.js"},{"revision":"b6dcf84d5cc64a4c7aeea79874d46864","url":"assets/ProfilePage-BRVV07Es.js"},{"revision":"f283ad71e4a29bc8d31f33c15309f90d","url":"assets/progress-D0Ws5wh_.js"},{"revision":"7ffbfd2b075bcebd2cd0db5bcd5112d9","url":"assets/PropertiesPage-BWCaQLgj.js"},{"revision":"dfdc627386cf6d6db8c307af1140f514","url":"assets/PropertyDetail-BY2nbA6f.js"},{"revision":"e6f14c35964f2d0760ccf97a919a2b6e","url":"assets/PropertyForm-DtgmNcNa.js"},{"revision":"35c34a473a1a25fc7bb6e797823b6a85","url":"assets/separator-oIb70CZ-.js"},{"revision":"c4cb9bea2577e6599a6990e5f25103d6","url":"assets/skeleton-D_g-C0Zp.js"},{"revision":"575c1375e1192ebcb32822689991208b","url":"assets/square-pen-C6eNhy5e.js"},{"revision":"554914a62bb66cb1980e8a14e36314c1","url":"assets/table-v3n5Y4sF.js"},{"revision":"a215348d28fa61ed03d440e2251a7770","url":"assets/trash-2-1yK8xfS6.js"},{"revision":"3a20a5f47e11cfb2332fdbb9163bac1c","url":"assets/user-CSvYSfmX.js"},{"revision":"9caab87a611154c410ba53bb0350f491","url":"assets/users-CMjfndfd.js"},{"revision":"78c4f5f895d013e0783ba729911f973e","url":"assets/wrench-D6WSHtyv.js"},{"revision":"0664afd9fa1992696d98f1bd8688822d","url":"icons/apple-touch-icon.png"},{"revision":"066ee1bf40a8b34252502c92cc37a148","url":"icons/icon-192.png"},{"revision":"7f00f68f062c2460cb34df5508bfe852","url":"icons/icon-512.png"},{"revision":"2ed1838c052bd58de48bc0a4be14d616","url":"icons/splash-1024.png"},{"revision":"4d46320530d8a449d83a4af64cb70829","url":"index.html"}];
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
