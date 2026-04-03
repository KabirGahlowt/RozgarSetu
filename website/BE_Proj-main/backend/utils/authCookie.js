/**
 * JWT cookie flags: in production (e.g. Render HTTPS + Vercel SPA) browsers require
 * SameSite=None and Secure for cross-origin credentialed requests.
 * In development, Lax + insecure is fine for localhost.
 */
export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    path: "/",
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  };
}

/** Match set options so logout clears the same cookie in the browser. */
export function getClearAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    maxAge: 0,
    httpOnly: true,
    path: "/",
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  };
}
