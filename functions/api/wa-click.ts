// Cuenta los toques a los botones de WhatsApp de la web (para el resumen
// diario por Telegram). La web lo llama con navigator.sendBeacon al mismo
// tiempo que empuja whatsapp_click al dataLayer. No guarda nada del visitante.

import { AvisosEnv, fechaAR, sumar } from "../_lib/avisos";

const ORIGENES_OK = new Set(["https://baconsultoriosmedicos.com.ar", "https://www.baconsultoriosmedicos.com.ar"]);

export const onRequestPost: PagesFunction<AvisosEnv> = async ({ request, env, waitUntil }) => {
  const origen = request.headers.get("Origin") ?? "";
  const esVistaPrevia = /^https:\/\/[a-z0-9-]+\.ba-consultorios-3da\.pages\.dev$/.test(origen);
  // Las vistas previas no suman: así las pruebas no inflan el número real.
  if (ORIGENES_OK.has(origen)) waitUntil(sumar(env, `wa:${fechaAR()}`, "web"));
  else if (!esVistaPrevia) return new Response(null, { status: 403 });
  return new Response(null, { status: 204 });
};
