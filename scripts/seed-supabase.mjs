// scripts/seed-supabase.mjs
// Utility script to insert a fake property into Supabase for smoke-testing connectivity.

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

const camelToSnake = (value) => {
  if (Array.isArray(value)) {
    return value.map((entry) => camelToSnake(entry));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, entry]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      acc[snakeKey] = camelToSnake(entry);
      return acc;
    }, {});
  }
  return value;
};

const loadEnvFallback = async () => {
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
    return;
  }

  try {
    const envFilePath = resolve(projectRoot, ".env");
    const envContents = await readFile(envFilePath, "utf8");
    envContents
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .forEach((line) => {
        const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (!match) return;
        const [, key, rawValue] = match;
        if (process.env[key]) return;
        const value = rawValue.replace(/^['"]|['"]$/g, "");
        process.env[key] = value;
      });
  } catch (error) {
    console.warn("Could not read .env file automatically. Ensure environment variables are set.");
  }
};

await loadEnvFallback();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const seedEmail = process.env.SEED_SUPABASE_EMAIL;
const seedPassword = process.env.SEED_SUPABASE_PASSWORD;
const ownerIdFromEnv = process.env.SEED_PROPERTY_USER_ID?.trim();

let authenticatedUserId = ownerIdFromEnv;

if (seedEmail && seedPassword) {
  console.log(`🔐 Autenticando usuário ${seedEmail}...`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: seedEmail,
    password: seedPassword,
  });

  if (error) {
    console.error("❌ Falha na autenticação:", error);
    process.exit(1);
  }

  authenticatedUserId = authenticatedUserId || data.user?.id || undefined;
  console.log("✅ Autenticação concluída.");
} else if (!authenticatedUserId) {
  console.warn("⚠️  Nenhum usuário autenticado. Forneça SEED_SUPABASE_EMAIL/SEED_SUPABASE_PASSWORD ou SEED_PROPERTY_USER_ID para evitar políticas de RLS.");
}

const now = new Date();
const isoNow = now.toISOString();
const propertyId = randomUUID();

const fakeProperty = {
  id: propertyId,
  name: `Teste AirbnbFlow ${now.toLocaleDateString("pt-BR")} ${now.toLocaleTimeString("pt-BR")}`,
  address: "Rua de Exemplo, 123",
  city: "São Paulo",
  description: "Propriedade gerada automaticamente para testar a conexão com o Supabase.",
  createdAt: isoNow,
  updatedAt: isoNow,
  ...(authenticatedUserId ? { userId: authenticatedUserId } : {}),
};

const payload = camelToSnake(fakeProperty);

console.log("🔄 Enviando propriedade fictícia para Supabase...");

try {
  const { data, error } = await supabase
    .from("properties")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("❌ Falha ao inserir propriedade:", error);
    process.exit(1);
  }

  console.log("✅ Propriedade criada com sucesso!");
  console.log("➡️  ID:", data.id ?? payload.id);
  console.log("📦 Dados retornados:", data);
} catch (error) {
  console.error("❌ Erro inesperado ao inserir propriedade:", error);
  process.exit(1);
}
