// scripts/dump-schema.mjs
// Fetch column metadata for selected tables using Supabase REST.
import { createClient } from "@supabase/supabase-js";

const {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseKey,
} = process.env;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Load .env before running this script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  "properties",
  "employees",
  "checklists",
  "checklist_items",
  "access_codes",
  "maintenance_requests",
  "calendar_events",
  "time_entries",
];

async function loadColumns(tableName) {
  const { data, error } = await supabase
    .from("information_schema.columns")
    .select("column_name, data_type, is_nullable, column_default")
    .eq("table_schema", "public")
    .eq("table_name", tableName)
    .order("ordinal_position");

  if (error) {
    return { tableName, error };
  }

  return { tableName, columns: data ?? [] };
}

async function main() {
  const results = [];
  for (const table of tables) {
    results.push(await loadColumns(table));
  }

  for (const result of results) {
    console.log("------------------------------------------------------------");
    console.log(`Table: ${result.tableName}`);
    if (result.error) {
      console.error("  ❌ Error:", result.error.message ?? result.error);
      if (result.error.details) {
        console.error("  Details:", result.error.details);
      }
      if (result.error.hint) {
        console.error("  Hint:", result.error.hint);
      }
      continue;
    }
    if (!result.columns?.length) {
      console.log("  (no columns or table not found)");
      continue;
    }
    for (const col of result.columns) {
      const nullable = col.is_nullable === "YES" ? "NULL" : "NOT NULL";
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : "";
      console.log(`  - ${col.column_name} ${col.data_type} ${nullable}${defaultVal}`);
    }
  }
  console.log("------------------------------------------------------------");
}

main().catch((err) => {
  console.error("Fatal error dumping schema:", err);
  process.exit(1);
});
