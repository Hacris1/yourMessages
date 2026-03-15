const RAW_API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").trim();

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl
    .replace(/:(\d+)(?=api(?:\/|$))/i, ":$1/")
    .replace(/\/+$/, "");
}

export function buildApiUrl(path: string): string {
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = normalizeBaseUrl(RAW_API_URL);

  if (/\/api$/i.test(normalizedBase) && /^\/api(?:\/|$)/i.test(normalizedPath)) {
    normalizedPath = normalizedPath.replace(/^\/api/i, "");
    if (!normalizedPath) normalizedPath = "/";
  }

  return `${normalizedBase}${normalizedPath}`;
}
