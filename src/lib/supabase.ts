// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente do Vite devem ser prefixadas com VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifique se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Variáveis de ambiente SUPABASE_URL ou SUPABASE_ANON_KEY não definidas. Verifique seu arquivo .env.");
  throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);