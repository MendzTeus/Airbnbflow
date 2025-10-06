import { injectManifest } from "workbox-build";

async function buildServiceWorker() {
  const { count, size, warnings } = await injectManifest({
    swSrc: "src/sw/service-worker.js",
    swDest: "dist/service-worker.js",
    globDirectory: "dist",
    globPatterns: ["**/*.{js,css,html,png,svg,ico,json,txt,woff2,woff}"]
  });

  if (warnings.length) {
    console.warn("Workbox warnings:\n", warnings.join("\n"));
  }

  console.info(`Generated service worker, precached ${count} assets totaling ${(size / 1024).toFixed(2)} KB.`);
}

buildServiceWorker().catch((error) => {
  console.error("Failed to build service worker", error);
  process.exit(1);
});
