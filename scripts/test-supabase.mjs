// scripts/test-supabase.mjs
// Quick sanity script to check if Supabase tables accept inserts matching the frontend models.
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseKey,
} = process.env;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Load .env before running this script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const inserted = []; // keep track of inserted records to clean up later

const logDivider = () => console.log("------------------------------------------------------------");

async function testInsert(table, record) {
  logDivider();
  console.log(`Testing insert into '${table}' with payload:`, record);
  try {
    const { data, error } = await supabase.from(table).insert([record]).select();
    if (error) {
      console.error(`❌ Insert into '${table}' failed.`);
      console.error("Reason:", error.message);
      if (error.details) console.error("Details:", error.details);
      if (error.hint) console.error("Hint:", error.hint);
      return { success: false, data: null };
    }
    console.log(`✅ Insert into '${table}' succeeded with returned row:`, data?.[0]);
    if (data?.length) {
      inserted.push({ table, ids: data.map((row) => row.id) });
    }
    return { success: true, data: data?.[0] ?? null };
  } catch (err) {
    console.error(`⚠️ Unexpected error inserting into '${table}':`, err);
    return { success: false, data: null };
  }
}

async function cleanUp() {
  if (!inserted.length) return;
  logDivider();
  console.log("Cleaning up inserted test records...");
  for (const { table, ids } of inserted.reverse()) {
    if (!ids?.length) continue;
    try {
      const { error } = await supabase.from(table).delete().in("id", ids);
      if (error) {
        console.error(`Failed to clean up table '${table}' for ids ${ids.join(", ")}`, error);
      } else {
        console.log(`Deleted ${ids.length} row(s) from '${table}'.`);
      }
    } catch (err) {
      console.error(`Unexpected error cleaning up table '${table}':`, err);
    }
  }
}

function isoNow() {
  return new Date().toISOString();
}

async function main() {
  const propertyId = randomUUID();
  const employeeId = randomUUID();
  const checklistId = randomUUID();
  const accessCodeId = randomUUID();
  const maintenanceRequestId = randomUUID();
  const eventId = randomUUID();

  const propertyPayload = {
    id: propertyId,
    name: "Codex Test Property",
    address: "123 Automation Ave",
    city: "Testville",
    region: "QA Region",
    zipCode: "M1 2AB",
    bedrooms: 3,
    bathrooms: 2,
    imageUrl: "https://example.com/image.jpg",
    description: "Inserted by Codex test script.",
    createdAt: isoNow(),
    updatedAt: isoNow(),
    user_id: "test-user-id", // the frontend expects this column to exist
  };

  const employeePayload = {
    id: employeeId,
    name: "Codex Test Employee",
    email: `codex.employee+${Date.now()}@example.com`,
    phone: "+44 161 000 0000",
    role: "manager",
    startDate: isoNow(),
    properties: [propertyId],
  };

  const checklistPayload = {
    id: checklistId,
    title: "Codex Test Checklist",
    propertyId,
    assignedTo: employeeId,
    type: "checkin",
    items: [
      { id: randomUUID(), text: "Run automation test", completed: false },
    ],
    createdAt: isoNow(),
    updatedAt: isoNow(),
  };

  const accessCodePayload = {
    id: accessCodeId,
    name: "Codex Test Access",
    code: "CODEX1234",
    propertyId,
    expiryDate: isoNow(),
    createdAt: isoNow(),
    updatedAt: isoNow(),
  };

  const maintenanceRequestPayload = {
    id: maintenanceRequestId,
    title: "Codex Test Maintenance",
    description: "Check automation wiring.",
    propertyId,
    assignedTo: employeeId,
    status: "open",
    priority: "medium",
    createdAt: isoNow(),
    updatedAt: isoNow(),
  };

  const eventPayload = {
    id: eventId,
    title: "Codex Test Event",
    propertyId,
    assignedTo: employeeId,
    startDate: isoNow(),
    endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    type: "cleaning",
    notes: "Automation dry-run.",
    createdAt: isoNow(),
    updatedAt: isoNow(),
  };

  const results = [];
  results.push(await testInsert("properties", propertyPayload));
  results.push(await testInsert("employees", employeePayload));
  results.push(await testInsert("checklists", checklistPayload));
  results.push(await testInsert("access_codes", accessCodePayload));
  results.push(await testInsert("maintenance_requests", maintenanceRequestPayload));
  results.push(await testInsert("calendar_events", eventPayload));

  await cleanUp();

  logDivider();
  console.table(
    [
      ["properties", results[0].success],
      ["employees", results[1].success],
      ["checklists", results[2].success],
      ["access_codes", results[3].success],
      ["maintenance_requests", results[4].success],
      ["calendar_events", results[5].success],
    ].map(([table, success]) => ({ table, success }))
  );
}

main()
  .catch((err) => {
    console.error("Fatal error while running Supabase sanity test:", err);
  })
  .finally(() => {
    process.exit(0);
  });
