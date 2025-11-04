Supabase Setup Reference
========================

This document consolidates everything the frontend expects from the Supabase project: environment variables, Auth metadata, required tables and columns, plus the row‑level policies needed for the app to function.

Environment & Auth
------------------
- Required `.env` keys (already read by Vite and the helper scripts):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Optional seeding helpers (`scripts/seed-supabase.mjs`):
  - `SEED_SUPABASE_EMAIL`, `SEED_SUPABASE_PASSWORD` (authenticate before inserting)
  - `SEED_PROPERTY_USER_ID` (force the owner of the seeded property)
- Supabase Auth users must log in with **email + password**. The app reads `user_metadata.name` and `user_metadata.phone` to show basic profile details.
- `AuthContext.fetchUserRole(email)` expects an `employees` row with the same email address; keep that table in sync with the user base so that roles resolve correctly after login.

Core Tables
-----------
The frontend uses one schema: `public`. Every table is queried via `select *`, and rows are converted snake_case ↔ camelCase in the client. Suggested DDL (adjust schemas or constraints as needed, but keep the column names):

```sql
-- PROPERTIES ---------------------------------------------------------------
create table public.properties (
  id uuid primary key,
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  address text not null,
  city text not null,
  region text,
  zip_code text not null,
  image_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index properties_user_id_idx on public.properties (user_id);

-- EMPLOYEES ---------------------------------------------------------------
create table public.employees (
  id uuid primary key,
  name text not null,
  email citext not null unique,
  phone text,
  role text not null check (role in ('manager','cleaner')),
  start_date timestamptz not null,
  properties uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CHECKLISTS ---------------------------------------------------------------
create table public.checklists (
  id uuid primary key,
  title text not null,
  property_id uuid not null references public.properties (id) on delete cascade,
  assigned_to uuid references public.employees (id),
  type text not null check (type in ('checkin','checkout','maintenance')),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ACCESS CODES -------------------------------------------------------------
create table public.access_codes (
  id uuid primary key,
  property_id uuid not null references public.properties (id) on delete cascade,
  name text not null,
  code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- MAINTENANCE REQUESTS -----------------------------------------------------
create table public.maintenance_requests (
  id uuid primary key,
  title text not null,
  description text,
  property_id uuid not null references public.properties (id) on delete cascade,
  assigned_to uuid references public.employees (id),
  status text not null check (status in ('open','in-progress','completed')) default 'open',
  priority text not null check (priority in ('low','medium','high')) default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- CALENDAR EVENTS ----------------------------------------------------------
create table public.calendar_events (
  id uuid primary key,
  title text not null,
  property_id uuid not null references public.properties (id) on delete cascade,
  assigned_to uuid references public.employees (id),
  start_date timestamptz not null,
  end_date timestamptz not null,
  type text not null check (type in ('cleaning','maintenance')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

> ℹ️  The frontend never writes `created_at` / `updated_at` explicitly except during initial insert seeds. You can keep the defaults above and optionally add update triggers that refresh `updated_at` automatically.

Row-Level Security
------------------
Enable RLS on every table and add policies that mirror how the UI reads or mutates data.

### General helpers
```sql
alter table public.properties            enable row level security;
alter table public.employees             enable row level security;
alter table public.checklists            enable row level security;
alter table public.access_codes          enable row level security;
alter table public.maintenance_requests  enable row level security;
alter table public.calendar_events       enable row level security;
```

### Properties
The client always annotates properties with the logged-in user as `user_id`, so ownership-based policies work well:
```sql
create policy "Properties select" on public.properties
  for select using (auth.role() = 'authenticated' and user_id = auth.uid());

create policy "Properties insert" on public.properties
  for insert with check (user_id = auth.uid());

create policy "Properties update" on public.properties
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Properties delete" on public.properties
  for delete using (user_id = auth.uid());
```

### Employees
Employees are shared across the workspace, and the UI needs full CRUD after login. If you want stricter control, add extra columns (e.g., `created_by uuid default auth.uid()`) and tighten the checks, but the minimal set is:
```sql
create policy "Employees readable" on public.employees
  for select using (auth.role() = 'authenticated');

create policy "Employees insertable" on public.employees
  for insert with check (auth.role() = 'authenticated');

create policy "Employees updatable" on public.employees
  for update using (auth.role() = 'authenticated');

create policy "Employees deletable" on public.employees
  for delete using (auth.role() = 'authenticated');
```

Because login resolves roles by email, ensure that the authenticated user has a matching row:
```sql
-- Optional helper to sync current user
create policy "Employees self lookup" on public.employees
  for select using (email = auth.email());
```

### Tables tied to properties
`checklists`, `access_codes`, `maintenance_requests`, and `calendar_events` should be visible only when the user owns the related property. Each policy joins back to `properties.user_id`:
```sql
-- Template used for select; repeat same condition for insert/update/delete (with CHECK).
create policy "Checklists select" on public.checklists
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.properties p
      where p.id = checklists.property_id
        and p.user_id = auth.uid()
    )
  );

create policy "Checklists mutate" on public.checklists
  for all using (
    exists (
      select 1 from public.properties p
      where p.id = checklists.property_id
        and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.properties p
      where p.id = checklists.property_id
        and p.user_id = auth.uid()
    )
  );

-- Apply the same pattern to access_codes, maintenance_requests, calendar_events:
-- replace table name in the subquery condition.
```

-Access codes
```sql
create policy "Access codes select" on public.access_codes
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.properties p
      where p.id = access_codes.property_id
        and p.user_id = auth.uid()
    )
  );

create policy "Access codes mutate" on public.access_codes
  for all using (
    exists (
      select 1 from public.properties p
      where p.id = access_codes.property_id
        and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.properties p
      where p.id = access_codes.property_id
        and p.user_id = auth.uid()
    )
  );
```

-Maintenance requests
```sql
create policy "Maintenance select" on public.maintenance_requests
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.properties p
      where p.id = maintenance_requests.property_id
        and p.user_id = auth.uid()
    )
  );

create policy "Maintenance mutate" on public.maintenance_requests
  for all using (
    exists (
      select 1 from public.properties p
      where p.id = maintenance_requests.property_id
        and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.properties p
      where p.id = maintenance_requests.property_id
        and p.user_id = auth.uid()
    )
  );
```

-Calendar events
```sql
create policy "Calendar select" on public.calendar_events
  for select using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.properties p
      where p.id = calendar_events.property_id
        and p.user_id = auth.uid()
    )
  );

create policy "Calendar mutate" on public.calendar_events
  for all using (
    exists (
      select 1 from public.properties p
      where p.id = calendar_events.property_id
        and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.properties p
      where p.id = calendar_events.property_id
        and p.user_id = auth.uid()
    )
  );
```

> Tip: If you want to allow cleaners to see assignments without owning the property, broaden the `exists` condition (e.g., allow `assigned_to = auth.uid()` once you store the cleaner’s `auth_user_id`).

Data Usage by Feature
---------------------
- `AuthContext`  
  - `supabase.auth.getSession()` and `supabase.auth.signInWithPassword()` require enabled email/password auth.  
  - After login, `fetchUserRole(email)` queries `employees (email, role)` and the RLS above must allow that `select`.
- `DataContext`  
  - On load it calls `.select("*")` for every table above; deny listed columns will break the app.  
  - All CRUD helpers (`addProperty`, `updateEmployee`, `removeChecklist`, etc.) call through Supabase directly; the policies must allow authenticated users to insert/update/delete as shown.
- `ProfilePage`  
  - Uses `updateEmployee` to persist profile changes and `supabase.auth.updateUser` to sync Auth metadata. Those operations require the authenticated user to be allowed to update their corresponding employee row.

Validation & Tooling
--------------------
- Run `node scripts/test-supabase.mjs` after applying migrations to confirm that every table accepts insertions shaped like the frontend models.
- The script cleans up after itself; if it fails, inspect the console output to see which table or policy rejected the data.
- `scripts/seed-supabase.mjs` can create a sample property owned by a specific user—useful for verifying your RLS setup.

Troubleshooting Checklist
-------------------------
- Missing rows? Check that the authenticated user matches the RLS conditions (`auth.uid()` or `auth.email()`).
- Inserts rejected? Ensure the payload includes all `NOT NULL` fields (especially `user_id` on `properties`).
- Realtime? If you enable Supabase Realtime later, keep `connect-src` in the CSP allowing the `wss://<project>.supabase.co` endpoints.

With the schema, policies, and Auth metadata above in place, the frontend can run without CSP/RLS errors. Run the sanity script whenever you tweak the database to guarantee compatibility.
