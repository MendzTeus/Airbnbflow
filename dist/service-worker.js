/* eslint-disable no-undef */
/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { Queue } from "workbox-background-sync";

const PRECACHE_MANIFEST = [{"revision":"406d3904a55fc349085c6ae02a2f3c0d","url":"assets/AccessCodeForm-PKrIXfio.js"},{"revision":"28013d3765c785b1aebefe4c17e009d9","url":"assets/AccessCodesPage-BvpubAZb.js"},{"revision":"83ea480b9d545ad4aeae4e6cd7e9ecc7","url":"assets/alert-CEhlKXPI.js"},{"revision":"b70de5ae22620cdfff7fc9868c9e95e4","url":"assets/alert-dialog-CJZazSXn.js"},{"revision":"6de0e323ffdc0dfaa65c242d49a05da3","url":"assets/AppLayout-CYvE2Zo7.js"},{"revision":"a1a4de5f42915aebd55c5f062486bc1d","url":"assets/arrow-left-Btt4dkoU.js"},{"revision":"761553b17d2dfae10f3a4a09477db88c","url":"assets/building-DerEMeSk.js"},{"revision":"cba497dd69e9606be2401b2b6e0aee12","url":"assets/calendar-3PICvh-k.js"},{"revision":"393d2099cf8be9cc00be65b58d0fe72f","url":"assets/checkbox-Xt73L8At.js"},{"revision":"3b995cfb2bae6cfcc11c438ff9a174f7","url":"assets/ChecklistForm-B_TqRU7F.js"},{"revision":"2a3cc9e8a8f836feba48b21bb8d7e7c1","url":"assets/ChecklistsPage-RcY7lvkP.js"},{"revision":"14fda7e6ed2f4c84af33ba54ebd19d77","url":"assets/chevron-left-XWE9Ca6N.js"},{"revision":"1d0dbba16de78a20d4a45ff6f5bcc4b8","url":"assets/chevron-right-xoItGTd-.js"},{"revision":"a4d595b808df4ab8758c11099cb6d5a0","url":"assets/clipboard-check-CV8NF4v1.js"},{"revision":"5741b132e8111d17ff36259955993143","url":"assets/clock-CNHPTQvb.js"},{"revision":"3fc578270db61126ae00a4f09eb7c2ec","url":"assets/Dashboard-Cec40U4g.js"},{"revision":"602fe8ea7e9e98d1f01b77a9d17123a6","url":"assets/EmployeeForm-DcTreqtX.js"},{"revision":"846f020cb1988e387e99a0a9c038494f","url":"assets/EmployeesPage-BXPMnO3E.js"},{"revision":"a68b35f6fab8ec01a3c0f57b69c32049","url":"assets/house-ChA0r5ez.js"},{"revision":"ba467e7399f2ac4e657468d8859bcc2e","url":"assets/index-C1WOv-0a.css"},{"revision":"8c39c136b1a7e962a07f56869dfe0950","url":"assets/index-D987av7h.js"},{"revision":"13127a0da321f6e28ce8529841361767","url":"assets/key-EQwDagte.js"},{"revision":"7198189fba4277e4a18abda9c9e3f19c","url":"assets/label-hcpCoKgR.js"},{"revision":"a808929993cd5a38c0b327ff97a89964","url":"assets/Login-CEYNTK3e.js"},{"revision":"51e5aae3fe9a8aa22b26e1dc56086b81","url":"assets/MaintenanceForm-D_nxGjL4.js"},{"revision":"c9e27b587c09b6d23fa8fe7acac7b51b","url":"assets/MaintenancePage-CNpjdsJl.js"},{"revision":"89ae06461d2aa75f21867f96d44ddc04","url":"assets/map-pin-BNgvn07t.js"},{"revision":"b1142f42b5783b97df871a6671e5473a","url":"assets/moon-DauTy7Sx.js"},{"revision":"5815d51113bc5f5856eb69b85d908252","url":"assets/NotFound-CQnlqvWV.js"},{"revision":"f41b7b279334fc3f142797348039a038","url":"assets/plus-CCvK0xMO.js"},{"revision":"9d74780a0668e2ed7aa0c67200e21b70","url":"assets/ProfilePage-DFwvQMOe.js"},{"revision":"ff88fe4eb85e14a2c045f7f3438bc8d8","url":"assets/progress-Cp4xWyTy.js"},{"revision":"50b4a69bd58cdf67054508445deb82ee","url":"assets/PropertiesPage-ghoI0Jb2.js"},{"revision":"7704f2e43d6da65d23d391cf3155f3e8","url":"assets/PropertyDetail-CrDlbm5E.js"},{"revision":"c8771acc5dffd3d42076a4279613867a","url":"assets/PropertyForm-C0u2Z0OI.js"},{"revision":"2ae0379e46c221d66b4e0cba45c02760","url":"assets/separator-CX8n38Ca.js"},{"revision":"4e35a987045bb1ea00b3fbc79f21f4d8","url":"assets/skeleton-BTH_uehk.js"},{"revision":"74609e3be75912bf7fc8244ba2b7c991","url":"assets/square-pen-tbPWaySm.js"},{"revision":"11a7c1a86f5df99843367c5201b4fbb1","url":"assets/table-oNvy3PqP.js"},{"revision":"7c2ce12e57021774fce704f963d08feb","url":"assets/trash-2-Dcpnl3L1.js"},{"revision":"d2695a1ad0cab13c1579806c465a9857","url":"assets/user-C-BtZzw6.js"},{"revision":"e70b2f0c9cb28e189020f83ce58ecdec","url":"assets/users-DlwfwAwF.js"},{"revision":"300e076eae3da562de2651891bd94664","url":"assets/wrench-Cq1EaaG7.js"},{"revision":"0664afd9fa1992696d98f1bd8688822d","url":"icons/apple-touch-icon.png"},{"revision":"066ee1bf40a8b34252502c92cc37a148","url":"icons/icon-192.png"},{"revision":"7f00f68f062c2460cb34df5508bfe852","url":"icons/icon-512.png"},{"revision":"2ed1838c052bd58de48bc0a4be14d616","url":"icons/splash-1024.png"},{"revision":"3588a8fc7b55a97074154f959eefa5d2","url":"index.html"}];
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
