// Links de WhatsApp para redes: baconsultoriosmedicos.com.ar/wa/<origen>
// Cuentan el toque (para el resumen diario por Telegram) y abren WhatsApp con
// un mensaje precargado que dice de dónde viene, para que recepción lo vea.
//
// Links para usar:
//   /wa/ig      bio y Stories de Instagram
//   /wa/status  Status de WhatsApp
//   /wa/canal   Canal de WhatsApp
//   /wa/fb      Facebook
//   /wa/ads     anuncios de Meta
//   /wa/gmb     perfil de Google Maps
// Cualquier otro texto cuenta como "otro".

import { AvisosEnv, fechaAR, sumar } from "../_lib/avisos";

const NUMERO = "5491164344822";

const CODIGOS: Record<string, string> = {
  ig: "Vengo de Instagram",
  status: "Vengo del Status",
  canal: "Vengo del Canal",
  fb: "Vengo de Facebook",
  ads: "Vengo del anuncio",
  gmb: "Vengo de Google"
};

export const onRequestGet: PagesFunction<AvisosEnv, "origen"> = async ({ params, env, request, waitUntil }) => {
  const pedido = String(params.origen ?? "").toLowerCase();
  const clave = pedido in CODIGOS ? pedido : "otro";
  const codigo = CODIGOS[clave] ?? "Vengo de un link";
  const texto = `Hola! Quiero pedir un turno en BA Consultorios Médicos. (${codigo})`;

  // Los robots que arman la vista previa del link (WhatsApp, Instagram) no cuentan.
  const ua = request.headers.get("User-Agent") ?? "";
  const esRobot = /bot|crawler|spider|facebookexternalhit|WhatsApp\/|Slackbot|TelegramBot|preview/i.test(ua);
  const esProduccion = new URL(request.url).hostname.endsWith("baconsultoriosmedicos.com.ar");
  if (!esRobot && esProduccion) waitUntil(sumar(env, `wa:${fechaAR()}`, clave));

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`,
      "Cache-Control": "no-store"
    }
  });
};
