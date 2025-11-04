Supabase Instruction
====================

Global Providers
----------------
- `src/contexts/AuthContext.tsx`
  - `fetchUserRole(email)` looks up the `employees` table (`email`, `role`).
  - `login(username, password)` first queries `employees` for (`username`, `email`), then authenticates against Supabase Auth (`auth.users` table needs `email`, `hashed_password`). Ensure each employee record has a unique `username`.
  - `logout()` and the auth state listener rely on Supabase Auth sessions (`auth.sessions`, `auth.users`).
- `src/contexts/DataContext.tsx`
  - Loads every table below with `select *` and converts snake_case ↔ camelCase.
  - `properties` table: `id`, `user_id`, `name`, `address`, `city`, `region`, `zip_code`, `image_url`, `description`, `created_at`, `updated_at`.
  - `employees` table: `id`, `username`, `name`, `email`, `phone`, `role`, `start_date`, `properties` (array of property ids), `created_at`, `updated_at`.
  - `checklists` table: `id`, `title`, `property_id`, `assigned_to`, `type`, `items` (JSON array), `created_at`, `updated_at`, `completed_at`.
  - `access_codes` table: `id`, `property_id`, `name`, `code`, `expiry_date`, `created_at`, `updated_at`.
  - `maintenance_requests` table: `id`, `property_id`, `assigned_to`, `title`, `description`, `status`, `priority`, `created_at`, `updated_at`, `completed_at`.
  - `calendar_events` table: `id`, `title`, `property_id`, `assigned_to`, `start_date`, `end_date`, `type`, `notes`, `created_at`, `updated_at`.

Pages and Subpages
------------------
- `src/pages/Index.tsx`: no Supabase data required.
- `src/pages/NotFound.tsx`: no Supabase data required.
- `src/pages/auth/Login.tsx`: depends on `AuthContext.login` (needs `employees.username`, `employees.email`, and Supabase Auth credentials).
- `src/pages/Dashboard.tsx`: reads aggregated counts from `properties` (`id`), `employees` (`id`), and `maintenance_requests` (`status`).
- `src/pages/properties/PropertiesPage.tsx`: lists and deletes `properties` (`id`, `name`, `address`, `city`, `zip_code`, `image_url`, `description`).
- `src/pages/properties/PropertyForm.tsx`: creates/updates `properties` (fields listed above plus `user_id`, timestamps).
- `src/pages/properties/PropertyDetail.tsx`: shows a single `properties` record and related `access_codes`, `maintenance_requests`, and `checklists` via `property_id`.
- `src/pages/employees/EmployeesPage.tsx`: displays `employees` (`id`, `name`, `email`, `phone`, `role`, `start_date`, `properties` array).
- `src/pages/employees/EmployeeForm.tsx`: inserts/updates `employees` (must supply `username`, `name`, `email`, `phone`, `role`, `start_date`, `properties`).
- `src/pages/checklists/ChecklistsPage.tsx`: reads `checklists` (`title`, `items`, `assigned_to`, `completed_at`), also joins against `properties` and `employees` for labels.
- `src/pages/checklists/ChecklistForm.tsx`: writes `checklists` (needs `property_id`, `items[]`, optional `assigned_to`, timestamps handled in Supabase).
- `src/pages/access-codes/AccessCodesPage.tsx`: lists `access_codes` (`property_id`, `name`, `code`, `expiry_date`) and cross-references `properties`.
- `src/pages/access-codes/AccessCodeForm.tsx`: creates/updates `access_codes` with the same fields.
- `src/pages/maintenance/MaintenancePage.tsx`: filters `maintenance_requests` (`title`, `description`, `status`, `priority`, `created_at`, `property_id`) and looks up `properties`.
- `src/pages/maintenance/MaintenanceForm.tsx`: writes `maintenance_requests` (`property_id`, `title`, `description`, `priority`, `status`, optional `assigned_to`).
- `src/pages/calendar/CalendarPage.tsx`: manages `calendar_events` (`title`, `property_id`, `assigned_to`, `start_date`, `end_date`, `type`, `notes`) plus `properties` and `employees` for filter options.
- `src/pages/profile/ProfilePage.tsx`: updates the logged-in row in `employees` (`name`, `email`, `phone`, `role`, `start_date`, `properties`), syncs Supabase Auth user metadata, and stores appearance preferences in local storage (no extra tables).
- `src/pages/time-clock/TimeClockPage.tsx`: no direct Supabase usage (relies on time-clock REST APIs and local IndexedDB).
- `src/pages/time-clock/TimesheetPage.tsx`: no direct Supabase usage (calls `fetchTimesheet` REST endpoint).
- `src/pages/time-clock/AdjustmentsPage.tsx`: no direct Supabase usage (submits adjustment requests through REST).
- `src/pages/time-clock/components/*`: UI helpers only; no Supabase calls.
- `src/pages/admin/time-clock/AdminTimeClockPage.tsx`: no Supabase usage; interacts with time-clock admin REST endpoints.
- `src/pages/Dashboard.tsx` quick actions navigate to forms that use the tables listed above; no additional tables needed.

Supporting Hooks and Helpers
----------------------------
- `src/hooks/use-data.ts` wraps every `DataContext` mutation and therefore shares the same table requirements.
- `src/lib/supabase-helpers.ts` assumes all table columns follow snake_case naming that maps directly to the camelCase fields noted above.
