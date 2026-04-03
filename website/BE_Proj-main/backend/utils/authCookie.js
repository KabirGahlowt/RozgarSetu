/**
 * JWT cookie flags: cross-origin SPA (e.g. Vercel) → API (e.g. Render) requires
 * SameSite=None and Secure. Render does not always set NODE_ENV=production, so we
 * also key off RENDER=true.
 */
function useCrossSiteCookieFlags() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.RENDER === "true"
  );
}

export function getAuthCookieOptions() {
  const crossSite = useCrossSiteCookieFlags();
  return {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    path: "/",
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
  };
}

/** Match set options so logout clears the same cookie in the browser. */
export function getClearAuthCookieOptions() {
  const crossSite = useCrossSiteCookieFlags();
  return {
    maxAge: 0,
    httpOnly: true,
    path: "/",
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
  };
}
