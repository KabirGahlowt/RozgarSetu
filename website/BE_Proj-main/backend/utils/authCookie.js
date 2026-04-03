/**
 * Cross-origin SPA (Vercel) → API (Render) needs SameSite=None + Secure.
 * Local dev should stay Lax + non-Secure on http://localhost.
 *
 * Render may omit NODE_ENV; RENDER / RENDER_EXTERNAL_URL indicate a hosted deploy.
 * Override: FORCE_CROSS_SITE_COOKIES=true | FORCE_LOCAL_AUTH_COOKIES=true
 */
export function isCrossSiteAuthCookiesEnabled() {
  if (process.env.FORCE_LOCAL_AUTH_COOKIES === "true") return false;
  if (process.env.FORCE_CROSS_SITE_COOKIES === "true") return true;
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return false;
  }
  if (process.env.NODE_ENV === "production") return true;
  const onHostedPlatform =
    process.env.RENDER === "true" ||
    Boolean(process.env.RENDER_EXTERNAL_URL) ||
    Boolean(process.env.RENDER_SERVICE_NAME) ||
    Boolean(process.env.RAILWAY_ENVIRONMENT) ||
    Boolean(process.env.FLY_APP_NAME);
  if (onHostedPlatform) return true;
  return false;
}

export function getAuthCookieOptions() {
  const crossSite = isCrossSiteAuthCookiesEnabled();
  return {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    path: "/",
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
  };
}

export function getClearAuthCookieOptions() {
  const crossSite = isCrossSiteAuthCookiesEnabled();
  return {
    maxAge: 0,
    httpOnly: true,
    path: "/",
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
  };
}
