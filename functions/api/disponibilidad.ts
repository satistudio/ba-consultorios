// Cloudflare Pages Function — corre en el servidor, nunca en el navegador.
// Expone GET /api/disponibilidad y devuelve, para cada especialidad, la
// PRIMERA fecha real con turnos disponibles dentro de los próximos 7 días
// (nunca inventa: si no encuentra nada en la semana, lo dice honestamente).
//
// Requiere en Cloudflare Pages > Settings > Environment variables (como Secret):
//   AGENDAPRO_USER = <usuario del panel Configuraciones > Integraciones > API Pública>
//   AGENDAPRO_PASSWORD = <contraseña del mismo panel>
//
// API: AgendaPro Public API v1 (Basic Auth)
// GET https://agendapro.com/api/public/v1/services/{service_id}/available_hours?date=YYYY-MM-DD&(location_id=X | provider_id=Y)

import servicesMap from "./_services-map.json";

interface Env {
  AGENDAPRO_USER: string;
  AGENDAPRO_PASSWORD: string;
}

const AGENDAPRO_BASE = "https://agendapro.com/api/public/v1/services";
const CACHE_TTL_SECONDS = 900; // 15 min — con la búsqueda de hasta 7 días, cuida mejor la cuota diaria
const MAX_DAYS_AHEAD = 7;

const WEEKDAYS_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function dateAt(offsetDays: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function fetchSlotsCount(
  authHeader: string,
  serviceId: number,
  date: string,
  scope: { locationId?: number; providerId?: number }
): Promise<number | null> {
  try {
    const scopeParam = scope.providerId
      ? `provider_id=${scope.providerId}`
      : `location_id=${scope.locationId}`;
    const url = `${AGENDAPRO_BASE}/${serviceId}/available_hours?date=${date}&${scopeParam}`;
    const res = await fetch(url, {
      headers: { Authorization: authHeader, Accept: "application/json" }
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { available_hours?: unknown[] };
    return Array.isArray(json?.available_hours) ? json.available_hours.length : null;
  } catch {
    return null;
  }
}

// Busca día por día (hoy, mañana, ...) hasta encontrar el primero con turnos.
// Se detiene apenas encuentra uno — no barre los 7 días si no hace falta.
async function findNextAvailable(
  authHeader: string,
  serviceId: number,
  scope: { locationId?: number; providerId?: number }
) {
  let sawAnyResponse = false;
  for (let offset = 0; offset < MAX_DAYS_AHEAD; offset++) {
    const d = dateAt(offset);
    const count = await fetchSlotsCount(authHeader, serviceId, toISODate(d), scope);
    if (count === null) continue; // fallo puntual de esa fecha, seguimos probando
    sawAnyResponse = true;
    if (count > 0) {
      return {
        status: offset === 0 ? "today" : offset === 1 ? "tomorrow" : "soon",
        count,
        dayLabel: offset === 0 ? "hoy" : offset === 1 ? "mañana" : WEEKDAYS_ES[d.getDay()],
        date: toISODate(d)
      };
    }
  }
  return { status: sawAnyResponse ? "none" : "error", count: 0, dayLabel: null, date: null };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, context.request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const user = context.env.AGENDAPRO_USER;
  const password = context.env.AGENDAPRO_PASSWORD;
  const locationId = servicesMap.location_id;

  if (!user || !password || !locationId) {
    return new Response(
      JSON.stringify({ ok: false, reason: "not_configured" }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }

  const authHeader = "Basic " + btoa(`${user}:${password}`);

  const items = await Promise.all(
    servicesMap.specialties.map(async (s) => {
      if (!s.service_id) return { ...s, status: "error", count: 0, dayLabel: null, date: null };
      const scope = s.provider_id ? { providerId: s.provider_id } : { locationId };
      const next = await findNextAvailable(authHeader, s.service_id, scope);
      return { ...s, ...next };
    })
  );

  const body = JSON.stringify({ ok: true, updatedAt: new Date().toISOString(), items });
  const response = new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": `public, max-age=${CACHE_TTL_SECONDS}`
    }
  });

  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
};
