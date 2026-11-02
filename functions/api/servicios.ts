// Cloudflare Pages Function — GET /api/servicios
// Lista los servicios de BA en AgendaPro (nombre e id) para el buscador de
// turnos de la home. Es el mismo catálogo que se ve en la reserva online.
// Usa las mismas credenciales que /api/disponibilidad (AGENDAPRO_USER/PASSWORD).

interface Env {
  AGENDAPRO_USER: string;
  AGENDAPRO_PASSWORD: string;
}

const CACHE_TTL_SECONDS = 6 * 3600;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const cache = caches.default;
  const url = new URL(context.request.url);
  const cacheKey = new Request(url.origin + url.pathname + (url.searchParams.has("crudo") ? "?crudo" : ""));
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const { AGENDAPRO_USER: user, AGENDAPRO_PASSWORD: password } = context.env;
  if (!user || !password) return Response.json({ ok: false, reason: "not_configured" });

  const res = await fetch("https://agendapro.com/api/public/v1/services", {
    headers: { Authorization: "Basic " + btoa(`${user}:${password}`), Accept: "application/json" },
  });
  const texto = await res.text();
  // Diagnóstico temporal: forma real de la respuesta (se quita al terminar el buscador).
  const body = url.searchParams.has("crudo")
    ? JSON.stringify({ ok: res.ok, status: res.status, muestra: texto.slice(0, 3000) })
    : JSON.stringify({ ok: false, reason: "en_construccion" });
  const response = new Response(body, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  return response;
};
