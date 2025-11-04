import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      "Content-Security-Policy": [
        "default-src 'self'",
        "connect-src 'self' https://vrenpdehtmrjhilxbzav.supabase.co https://*.supabase.co wss://vrenpdehtmrjhilxbzav.supabase.co wss://*.supabase.co https://cdn.gpteng.co https://api.postcodes.io https://api.zippopotam.us",
        "script-src 'self' https://cdn.gpteng.co 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
      ].join("; "),
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
