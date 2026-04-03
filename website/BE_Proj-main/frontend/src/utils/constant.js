/**
 * API bases for Node backend + RS Bot (FastAPI).
 *
 * **Local / phone on Wi‑Fi (recommended):** do *not* set `VITE_API_BASE_URL` or `VITE_RS_BOT_URL`
 * in dev — the app uses **relative URLs** and Vite proxies to `localhost:8000` / `localhost:8001`,
 * so the phone only talks to `:5173` (no CORS / wrong-host issues).
 *
 * **Explicit URLs:** set in `.env.local` if you need a deployed API:
 *   VITE_API_BASE_URL=https://api.example.com
 *   VITE_RS_BOT_URL=https://bot.example.com
 */
const rawApi = import.meta.env.VITE_API_BASE_URL;
const rawBot = import.meta.env.VITE_RS_BOT_URL;

const hasApi = rawApi != null && String(rawApi).trim() !== "";
const hasBot = rawBot != null && String(rawBot).trim() !== "";

const API_BASE = hasApi
  ? String(rawApi).replace(/\/$/, "")
  : import.meta.env.DEV
    ? ""
    : "http://localhost:8000";

const RS_BOT_BASE = hasBot
  ? String(rawBot).replace(/\/$/, "")
  : import.meta.env.DEV
    ? "/rs-bot-proxy"
    : "http://localhost:8001";

export const USER_API_END_POINT = `${API_BASE}/api/v1/user`;
export const WORKER_API_END_POINT = `${API_BASE}/api/v1/worker`;
export const APPLICATION_API_END_POINT = `${API_BASE}/api/v1/application`;
export const ADMIN_API_END_POINT = `${API_BASE}/api/v1/admin`;
export const REVIEW_API_END_POINT = `${API_BASE}/api/v1/review`;
export const RS_BOT_API_END_POINT = RS_BOT_BASE;
