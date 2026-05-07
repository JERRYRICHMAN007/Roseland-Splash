/**
 * Local API server entrypoint (Express wrapper around ../api/index.js).
 *
 * This exists so `cd server && npm run dev` works (it used to be empty).
 * For repo-root usage, `npm run dev:api` runs server/dev-api.mjs.
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load local dev env (server/.env preferred, then repo root .env)
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];
const missing = required.filter((k) => !process.env[k]?.trim());
if (missing.length) {
  console.error(
    "\n❌ Missing required env for /api (signup, login, etc.):",
    missing.join(", ")
  );
  console.error(
    "   → Copy server/.env.example → server/.env and add keys from Supabase:\n" +
      "   https://supabase.com/dashboard (your project → Project Settings → API)\n"
  );
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
  console.warn(
    "⚠️  SUPABASE_SERVICE_ROLE_KEY is missing — user_profiles sync and email auto-confirm may not run. Add the service_role key from the same Supabase API settings page.\n"
  );
}

const { default: app } = await import("../api/index.js");

const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const host = process.env.API_HOST || "127.0.0.1";

const server = http.createServer(app);
server.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});
