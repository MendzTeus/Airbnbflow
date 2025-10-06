# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6af84197-9d04-455c-9c96-4a02c4fbc8da

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6af84197-9d04-455c-9c96-4a02c4fbc8da) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6af84197-9d04-455c-9c96-4a02c4fbc8da) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Time Clock PWA Module

The project now ships a mobile-first "Time Clock" module with PWA capabilities:

- Installable manifest (`public/manifest.webmanifest`) with icons/splash screens and Service Worker generated via Workbox (`src/sw/service-worker.js`).
- Offline-first flow backed by IndexedDB (`src/lib/db/timeClockDb.ts`) to cache jobs and enqueue clock events with Background Sync retry (`time-clock-sync`).
- React pages for employees (`/time-clock`, `/time-clock/timesheet`, `/time-clock/adjustments`) and an administrative cockpit (`/admin/time-clock`).
- State management with Zustand (`src/stores/timeClockStore.ts`), geolocation guard hooks, A2HS prompt helper, and map visualization powered by Leaflet.

### Building & Testing

- Run `npm run dev` for local development. Service Worker registration only happens in production builds; use `npm run build:pwa && npm run preview` to test the full PWA envelope.
- A post-build script (`scripts/inject-sw.mjs`) runs Workbox `injectManifest` to compile the Service Worker and precache the Vite output. Ensure the `dist/service-worker.js` file is served from the app root.

### Platform Notes

- iOS PWAs cannot capture location in a suspended/background state; geofence validation happens at the moment of the punch only. The UI communicates this in `TimeClockPage`.
- Offline punches are encrypted (WebCrypto/AES-GCM) and synced automatically when connectivity returns. If Background Sync is unavailable, the front-end exposes manual retry controls.
- Add to Home Screen flows differ by platform; Android uses a custom prompt via `beforeinstallprompt`, while iOS displays manual instructions.

Keep the API base URL in `VITE_API_URL` aligned with the backend that implements the endpoints referenced in `src/lib/timeClock/api.ts`.
