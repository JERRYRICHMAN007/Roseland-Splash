import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dotenv from "dotenv";
import { componentTagger } from "lovable-tagger";

const rootDir = __dirname;

// Local dev: one file — server/.env powers both `npm run dev:api` and the browser Supabase client.
// Later files do not override existing process.env (e.g. Vercel build env).
dotenv.config({ path: path.resolve(rootDir, "server/.env") });
dotenv.config({ path: path.resolve(rootDir, ".env.local") });
dotenv.config({ path: path.resolve(rootDir, ".env") });

const viteSupabaseUrl =
  process.env.VITE_SUPABASE_URL?.trim() ||
  process.env.SUPABASE_URL?.trim() ||
  "";
const viteSupabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim() ||
  "";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === "development" && (!viteSupabaseUrl || !viteSupabaseAnonKey)) {
    console.warn(
      "\n[Vite] Browser Supabase client needs keys. Add SUPABASE_URL and SUPABASE_ANON_KEY to server/.env (copy from server/.env.example), or set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env\n"
    );
  }

  return {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(viteSupabaseUrl),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
        viteSupabaseAnonKey
      ),
    },
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:3001",
          changeOrigin: true,
        },
        "/health": {
          target: "http://127.0.0.1:3001",
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean
    ),
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "./src"),
      },
    },
    build: {
      minify: "esbuild",
      target: "es2015",
    },
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
  };
});
