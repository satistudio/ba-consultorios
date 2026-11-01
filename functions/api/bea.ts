// Cloudflare Pages Function: BEA, el asistente virtual de la web.
// Corre en el servidor. Recibe la charla desde el navegador, le pasa los
// mensajes a Claude y devuelve la respuesta. NO guarda ni registra el texto de
// la charla en ningún lado (regla aprobada: "no se guardan conversaciones").
//
// Requiere en Cloudflare Pages > Settings > Variables and Secrets (Secret):
//   ANTHROPIC_API_KEY = clave de la cuenta de API de BA
// Opcional:
//   BEA_MODEL = modelo a usar (por defecto claude-sonnet-5-5)

import Anthropic from "@anthropic-ai/sdk";
import { REGLAS, RIESGO_DE_VIDA, URGENCIA } from "../../src/bea/reglas";
import { CONOCIMIENTO } from "../../src/bea/conocimiento";

interface Env {
  ANTHROPIC_API_KEY?: string;
  BEA_MODEL?: string;
}

type Accion = "ninguna" | "turnos" | "whatsapp" | "urgencia" | "riesgo_vida";
interface Salida {
  respuesta: string;
  accion: Accion;
  mensaje_whatsapp: string;
}

const MODELO_POR_DEFECTO = "claude-sonnet-5-5";
const MAX_MENSAJES_PERSONA = 15; // límite aprobado por charla
const MAX_CARACTERES_PERSONA = 800;
const MAX_CARACTERES_BEA = 2000;

// Solo responde a la web de BA y a sus vistas previas.
const ORIGENES = [
  /^https:\/\/(www\.)?baconsultoriosmedicos\.com\.ar$/,
  /^https:\/\/([a-z0-9-]+\.)?ba-consultorios-3da\.pages\.dev$/,
  /^http:\/\/localhost(:\d+)?$/,
];

// Red de seguridad que no depende de la IA: frases de riesgo de vida.
const RIESGO = /(no quiero vivir|quiero morir(me)?|me quiero morir|matarme|suicid|quitarme la vida|hacerme da[ñn]o|lastimarme|terminar con (todo|mi vida))/i;

const ESQUEMA = {
  type: "object",
  properties: {
    respuesta: { type: "string" },
    accion: { type: "string", enum: ["ninguna", "turnos", "whatsapp", "urgencia", "riesgo_vida"] },
    mensaje_whatsapp: { type: "string" },
  },
  required: ["respuesta", "accion", "mensaje_whatsapp"],
  additionalProperties: false,
} as const;

const SISTEMA = REGLAS + "\n\n" + CONOCIMIENTO;

const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });

const DERIVAR: Salida = {
  respuesta: "No puedo ayudarte con eso desde acá. Escribinos por WhatsApp y te responde una persona de BA.",
  accion: "whatsapp",
  mensaje_whatsapp: "Hola BA! Tengo una consulta. (Vengo del asistente de la web)",
};

function fija(accion: "urgencia" | "riesgo_vida"): Salida {
  return { respuesta: accion === "urgencia" ? URGENCIA : RIESGO_DE_VIDA, accion, mensaje_whatsapp: "" };
}

function validar(body: unknown): Anthropic.MessageParam[] | null {
  const mensajes = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(mensajes) || mensajes.length === 0 || mensajes.length > MAX_MENSAJES_PERSONA * 2) return null;
  const salida: Anthropic.MessageParam[] = [];
  for (let i = 0; i < mensajes.length; i++) {
    const m = mensajes[i] as { role?: unknown; content?: unknown };
    const rol = i % 2 === 0 ? "user" : "assistant"; // siempre alternado, empieza la persona
    if (m?.role !== rol || typeof m.content !== "string") return null;
    const texto = m.content.trim();
    if (!texto || texto.length > (rol === "user" ? MAX_CARACTERES_PERSONA : MAX_CARACTERES_BEA)) return null;
    salida.push({ role: rol, content: texto });
  }
  return salida[salida.length - 1].role === "user" ? salida : null;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const origen = request.headers.get("origin") ?? "";
  if (!ORIGENES.some((r) => r.test(origen))) return json({ ok: false, reason: "origin" }, 403);
  const cors = { "access-control-allow-origin": origen, vary: "origin" };

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, reason: "invalid" }, 400, cors);
  }
  const mensajes = validar(body);
  if (!mensajes) return json({ ok: false, reason: "invalid" }, 400, cors);

  const ultimo = mensajes[mensajes.length - 1].content as string;
  if (RIESGO.test(ultimo)) return json({ ok: true, ...fija("riesgo_vida") }, 200, cors);

  const dePersona = mensajes.filter((m) => m.role === "user").length;
  if (dePersona > MAX_MENSAJES_PERSONA) {
    return json({
      ok: true,
      respuesta: "Llegamos al límite de esta charla. Para seguir, escribinos por WhatsApp y te responde una persona de BA.",
      accion: "whatsapp",
      mensaje_whatsapp: "Hola BA! Quiero seguir una consulta que empecé en la web. (Vengo del asistente de la web)",
    }, 200, cors);
  }

  if (!env.ANTHROPIC_API_KEY) return json({ ok: false, reason: "not_configured" }, 200, cors);

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  let salida: Salida = DERIVAR;
  try {
    const r = await client.messages.create({
      model: env.BEA_MODEL || MODELO_POR_DEFECTO,
      max_tokens: 2000,
      // Reglas + datos de BA no cambian entre charlas: se cachean y salen ~10 veces más baratos.
      system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }],
      messages: mensajes,
      // Effort bajo: respuestas cortas y rápidas. Las reglas de urgencia no dependen de pensar mucho.
      output_config: { effort: "low", format: { type: "json_schema", schema: ESQUEMA } },
    });
    if (r.stop_reason !== "refusal" && r.stop_reason !== "max_tokens") {
      const texto = r.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      const p = JSON.parse(texto) as Salida;
      if (typeof p.respuesta === "string" && p.respuesta.trim() && (ESQUEMA.properties.accion.enum as readonly string[]).includes(p.accion)) {
        salida = { respuesta: p.respuesta.trim(), accion: p.accion, mensaje_whatsapp: (p.mensaje_whatsapp || "").trim() };
      }
    }
  } catch (error) {
    // Solo se registra el tipo de error, nunca el contenido de la charla.
    const status = error instanceof Anthropic.APIError ? error.status : "red";
    console.error("bea_error", status);
    return json({ ok: false, reason: "error" }, 200, cors);
  }

  // Las urgencias siempre muestran el mismo texto aprobado, diga lo que diga el modelo.
  if (salida.accion === "urgencia" || salida.accion === "riesgo_vida") salida = fija(salida.accion);
  if (salida.accion === "whatsapp" && !salida.mensaje_whatsapp) salida.mensaje_whatsapp = DERIVAR.mensaje_whatsapp;
  if (salida.accion !== "whatsapp") salida.mensaje_whatsapp = "";

  return json({ ok: true, ...salida }, 200, cors);
};
