import { defineConfig, splitVendorChunkPlugin } from "vite";
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
    splitVendorChunkPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    cssCodeSplit: true,
    treeshake: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          const chunkMap: Record<string, string> = {
            react: "react",
            "react-dom": "react",
            "@supabase/supabase-js": "supabase",
            "lucide-react": "ui",
            "@radix-ui/react-dialog": "ui",
            "@radix-ui/react-dropdown-menu": "ui",
            "react-hook-form": "forms",
            zod: "forms",
            "date-fns": "dates",
          };

          const parts = id.split("node_modules/")[1]?.split("/");
          if (!parts || parts.length === 0) return undefined;

          const pkg = parts[0].startsWith("@")
            ? `${parts[0]}/${parts[1] ?? ""}`.replace(/\/$/, "")
            : parts[0];
          if (!pkg) return undefined;
          if (pkg in chunkMap) {
            return chunkMap[pkg];
          }

          return `vendor-${pkg.replace(/[@/]/g, "-")}`;
        },
      },
    },
  },
}));
