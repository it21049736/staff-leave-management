const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const ORIGIN = API_URL.replace(/\/api\/?$/, "");

/** Resolves a backend-relative path like "/media/avatars/3_x.jpg" into an
 *  absolute URL pointing at the API server (frontend and backend run on
 *  different ports in dev). Returns null unchanged so callers can fall back
 *  to initials. */
export function mediaUrl(path) {
  if (!path) return null;
  return `${ORIGIN}${path}`;
}
