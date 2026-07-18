// Cloudflare Pages Function — corre en el servidor, nunca en el navegador.
// Expone GET /api/disponibilidad y devuelve turnos disponibles reales (hoy/mañana)
// por especialidad, sin exponer nunca el API key de AgendaPro al cliente.
//
// Requiere en Cloudflare Pages > Settings > Environment variables (como Secret):
//   AGENDAPRO_API_KEY = <api key v3 con scope bookings:read>
//
// Requiere completar functions/api/_services-map.json con location_id y
// service_id reales (no son secretos, son IDs numéricos).
//
// Docs oficiales: https://developers.agendapro.com/reference/listavailableslots

import servicesMap from "./_services-map.json";

interface Env {
  AGENDAPRO_API_KEY: string;
}

interface SlotsMetadata {
  slots_count: number;
}

const AGENDAPRO_BASE = "https://connect.agendapro.com/v3/available_slots";
const CACHE_TTL_SECONDS = 300; // 5 min — cuida la cuota diaria de la API

function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function fetchSlotsCount(
  apiKey: string,
  locationId: number,
  serviceId: number,
  date: string
): Promise<number | null> {
  try {
    const url = `${AGENDAPRO_BASE}?location_id=${locationId}&service_id=${serviceId}&start_date=${date}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { metadata?: SlotsMetadata } };
    return json?.data?.metadata?.slots_count ?? null;
  } catch {
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, context.request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const apiKey = context.env.AGENDAPRO_API_KEY;
  const locationId = servicesMap.location_id;

  if (!apiKey || !locationId) {
    return new Response(
      JSON.stringify({ ok: false, reason: "not_configured" }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }

  const today = todayISO(0);
  const tomorrow = todayISO(1);

  const items = await Promise.all(
    servicesMap.specialties.map(async (s) => {
      if (!s.service_id) return { ...s, todayCount: null, tomorrowCount: null };
      const [todayCount, tomorrowCount] = await Promise.all([
        fetchSlotsCount(apiKey, locationId, s.service_id, today),
        fetchSlotsCount(apiKey, locationId, s.service_id, tomorrow)
      ]);
      return { ...s, todayCount, tomorrowCount };
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
