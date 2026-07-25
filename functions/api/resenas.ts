// Cloudflare Pages Function — corre en el servidor, nunca en el navegador.
// Expone GET /api/resenas y devuelve reseñas REALES de Google (nombre real,
// foto de perfil real, texto real) de la ficha de BA Consultorios Médicos.
//
// Requiere en Cloudflare Pages > Settings > Environment variables (como Secret):
//   GOOGLE_PLACES_API_KEY = <api key de Google Cloud con Places API (New) habilitada>
//
// La primera vez que corre, resuelve automáticamente el place_id buscando por
// nombre + dirección (configurado en _resenas-config.json) y lo cachea 24hs.
//
// Docs oficiales: https://developers.google.com/maps/documentation/places/web-service/place-details

import config from "./_resenas-config.json";

interface Env {
  GOOGLE_PLACES_API_KEY: string;
}

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24hs — las reseñas no cambian tan seguido, y así cuida la cuota/costo de la API

async function resolvePlaceId(apiKey: string): Promise<string | null> {
  if (config.place_id) return config.place_id;
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id"
      },
      body: JSON.stringify({ textQuery: config.search_query })
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { places?: { id: string }[] };
    return json?.places?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

interface GoogleReview {
  authorAttribution?: { displayName?: string; photoUri?: string };
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
}

// Google devuelve la fecha relativa en el idioma de la request; por las dudas
// traducimos las formas más comunes en inglés.
function esRelativeTime(input: string): string {
  if (!input) return "";
  const map: [RegExp, string][] = [
    [/^a day ago$/i, "hace 1 día"],
    [/^(\d+) days? ago$/i, "hace $1 días"],
    [/^a week ago$/i, "hace 1 semana"],
    [/^(\d+) weeks? ago$/i, "hace $1 semanas"],
    [/^a month ago$/i, "hace 1 mes"],
    [/^(\d+) months? ago$/i, "hace $1 meses"],
    [/^a year ago$/i, "hace 1 año"],
    [/^(\d+) years? ago$/i, "hace $1 años"]
  ];
  for (const [re, out] of map) {
    if (re.test(input)) return input.replace(re, out);
  }
  return input;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, context.request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const apiKey = context.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ ok: false, reason: "not_configured" }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }

  const placeId = await resolvePlaceId(apiKey);
  if (!placeId) {
    return new Response(JSON.stringify({ ok: false, reason: "place_not_found" }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }

  // Intentamos pedir las más recientes; si esa variante del endpoint falla,
  // caemos a la llamada estándar (orden "más relevantes" de Google).
  // languageCode=es evita que Google devuelva las reseñas traducidas al inglés.
  const headers = {
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews"
  };
  let detailsRes = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?languageCode=es&reviewsSort=NEWEST`,
    { headers }
  );
  if (!detailsRes.ok) {
    detailsRes = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=es`,
      { headers }
    );
  }

  if (!detailsRes.ok) {
    return new Response(JSON.stringify({ ok: false, reason: "api_error" }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }

  const details = (await detailsRes.json()) as {
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    reviews?: GoogleReview[];
  };

  // Google Place Details siempre devuelve un máximo de 5 reseñas (limitación de la API,
  // no nuestra); de esas, nos quedamos solo con las de 4-5 estrellas.
  const reviews = (details.reviews ?? [])
    .filter((r) => (r.rating ?? 0) >= 4)
    .map((r) => ({
      author: r.authorAttribution?.displayName ?? "Paciente de Google",
      photoUrl: r.authorAttribution?.photoUri ?? null,
      rating: r.rating ?? 5,
      text: r.originalText?.text ?? r.text?.text ?? "",
      relativeTime: esRelativeTime(r.relativePublishTimeDescription ?? "")
    }));

  const body = JSON.stringify({
    ok: true,
    updatedAt: new Date().toISOString(),
    placeIdResolved: placeId, // guardala en _resenas-config.json para ahorrar la búsqueda la próxima vez
    rating: details.rating ?? null,
    userRatingCount: details.userRatingCount ?? null,
    googleMapsUri: details.googleMapsUri ?? null,
    reviews
  });

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
