/* eslint-disable no-undef */
/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { Queue } from "workbox-background-sync";

const PRECACHE_MANIFEST = [{"revision":"5e233f595279a3e8a673dea089243685","url":"assets/AccessCodeForm-Cxtfpen2.js"},{"revision":"b8aba8d0bd525e683a3c6e95225ee87f","url":"assets/AccessCodesPage-BDECJh7a.js"},{"revision":"079acb0379c5a0b0af3e8b34d4cfc2e9","url":"assets/alert-dialog-BG5Z9-VA.js"},{"revision":"b22f73335989fbcefaec3a347e946372","url":"assets/alert-DLKyW8vI.js"},{"revision":"d5dc103c83a4713cc43a0088f3d7a70a","url":"assets/AppLayout-BS68jX1K.js"},{"revision":"960eed5c75b703e8b0400a777ecaa04b","url":"assets/arrow-left-CckCSTOh.js"},{"revision":"42ed430f1c453a7bb9c8b46a156bb55e","url":"assets/building-BM5-JlZW.js"},{"revision":"14bdd897e99d8bac9e8a71f03b296ac0","url":"assets/calendar-Qjo46L6M.js"},{"revision":"31f3624dbd8014e4138882f96c864ccb","url":"assets/checkbox-Dvs0pfFz.js"},{"revision":"21d21e9730c82bd99ff3bce4272a4c8b","url":"assets/ChecklistForm-DtDyPo62.js"},{"revision":"8f551c681ebe16a4eae291ebc142f2cc","url":"assets/ChecklistsPage-Ad0QawcK.js"},{"revision":"4fbf87f91a4b3164d2d61151f9100475","url":"assets/chevron-left-pwNhMfY7.js"},{"revision":"7443e4877d6d2659ab53c121dda45830","url":"assets/chevron-right-BvD891gX.js"},{"revision":"e0eb8551e2d83e392e034ccc5da742b5","url":"assets/clipboard-check-CJwqAXkX.js"},{"revision":"e88e1d6628560eb3a6f94acb9b3f5967","url":"assets/clock-DfN4e_i_.js"},{"revision":"a66166a15f2ed90218b5b059ef6615a6","url":"assets/Dashboard-BnpQCPSq.js"},{"revision":"76f26f5428499b67eda2cd221054685a","url":"assets/EmployeeForm-BrHV1Gv9.js"},{"revision":"f7a582e091e2f510937a280c1bbf26d2","url":"assets/EmployeesPage-BHtr5Coz.js"},{"revision":"414a6325934012875385082bc26c8fb9","url":"assets/house-CRnzh2ea.js"},{"revision":"5b42f41a729f22edd9d38033bd6100e4","url":"assets/index-DLQ-6Kaa.css"},{"revision":"8631ef4c120c500e68e60bf9a5810527","url":"assets/index-FssQvzDw.js"},{"revision":"3b655cc085d4b0fdc92ec18d65ae93b5","url":"assets/key-XfqUl1wI.js"},{"revision":"585c6de2c094fd208c53c7f976f1e1bc","url":"assets/label-BU-lORoH.js"},{"revision":"6590374d3d6983b8e9ed02f7df7705c7","url":"assets/Login-ZMSl0EJP.js"},{"revision":"d26f5c9426938c4564aa86ff232c54c6","url":"assets/MaintenanceForm-DS0MGwzA.js"},{"revision":"ff2515fe54ce15a2a1c6249769357337","url":"assets/MaintenancePage-BmIPFPev.js"},{"revision":"7f6f17d88c1ea1e0fa76429f1408e61f","url":"assets/map-pin-EDCw2AZu.js"},{"revision":"525849d22c4c7df72e1aaea5752a5c13","url":"assets/moon-DaCxncRn.js"},{"revision":"b2b9b2c35b5bb47c3292124b57b4409f","url":"assets/NotFound-B2IsRh_P.js"},{"revision":"78c0f3ecc0dc5e684034fea6d3b221cf","url":"assets/plus-Da2i-u4n.js"},{"revision":"18809e9326a66dcb712f4faf009473be","url":"assets/ProfilePage-eLEuHkGe.js"},{"revision":"70123edf0b19c0615da7daf8df4e6806","url":"assets/progress-z0wsUtYD.js"},{"revision":"86f394d6ee8e2100050369ef4d05d0a3","url":"assets/PropertiesPage-BdW8JSRd.js"},{"revision":"111456bdf785bac2e2e3e3adf635520f","url":"assets/PropertyDetail-DEW5_Ch_.js"},{"revision":"7eca4723e7fa8665c316241e1e9ae21d","url":"assets/PropertyForm-c3L-sLCA.js"},{"revision":"84dc6a446f5a5ced7de076e097f35120","url":"assets/separator-8Fl_thLf.js"},{"revision":"8a52c6672e538c0b9aeac2ac724c8811","url":"assets/skeleton-__-Q3iyX.js"},{"revision":"145992ed18a4eadf7962fdced17277c0","url":"assets/square-pen-CtMB0vH1.js"},{"revision":"f791c9c4d0c087b322a0e0783f166965","url":"assets/table-C32gEQT9.js"},{"revision":"767a73dd8edf2468f894f5e2c7b2a988","url":"assets/trash-2-Dnh5Za_5.js"},{"revision":"83bde95204b590ef9e766802cc539aa6","url":"assets/user-Bvo9jLzB.js"},{"revision":"b3101e9ddb66c55e701885d0a6d12922","url":"assets/users-g1thU772.js"},{"revision":"55bff28bb475488ec429e4f34ff68281","url":"assets/wrench--rEdjBcc.js"},{"revision":"0664afd9fa1992696d98f1bd8688822d","url":"icons/apple-touch-icon.png"},{"revision":"066ee1bf40a8b34252502c92cc37a148","url":"icons/icon-192.png"},{"revision":"7f00f68f062c2460cb34df5508bfe852","url":"icons/icon-512.png"},{"revision":"2ed1838c052bd58de48bc0a4be14d616","url":"icons/splash-1024.png"},{"revision":"89ce81a71cac18a6d35ce3dafb1d9762","url":"index.html"}];
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
