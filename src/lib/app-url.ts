const DEFAULT_SITE_URL = "https://juleshaggard.github.io/departmentofconsent";

export const siteUrl = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");

export function withBasePath(path = "/"): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base === "/" ? "" : `/${base.replace(/^\/|\/$/g, "")}`;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}` || "/";
}

export function appUrl(path = "/"): string {
  const origin = typeof window === "undefined" ? new URL(siteUrl).origin : window.location.origin;
  return new URL(withBasePath(path), origin).toString();
}

export function publicSiteUrl(path = "/"): string {
  return new URL(withBasePath(path), new URL(siteUrl).origin).toString();
}
