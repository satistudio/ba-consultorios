// Avisos por Telegram a las socias de BA (Rocío y Tatiana).
//
// Qué se guarda (KV "AVISOS", binding del proyecto de Cloudflare Pages):
//   tg:chats          → lista de chats de Telegram dados de alta en el bot
//   wa:AAAA-MM-DD     → toques a WhatsApp del día, por origen
//   res:AAAA-MM-DD    → reservas online del día (solo el número)
// Nunca se guardan datos de pacientes. El aviso de reserva lleva solo
// iniciales y día/hora: nombre + turno es dato de salud (Ley 25.326).

export interface AvisosEnv {
  AVISOS?: KVNamespace;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_ALTA_CODE?: string; // código del link de alta t.me/<bot>?start=<código>
  AVISOS_SECRET?: string; // protege el webhook de Telegram y el resumen diario
}

export interface ChatAlta {
  id: number;
  nombre: string;
}

// Argentina no tiene horario de verano: UTC-3 fijo.
export function fechaAR(d = new Date()): string {
  return new Date(d.getTime() - 3 * 3600_000).toISOString().slice(0, 10);
}

export async function leerChats(env: AvisosEnv): Promise<ChatAlta[]> {
  if (!env.AVISOS) return [];
  return ((await env.AVISOS.get("tg:chats", "json")) as ChatAlta[] | null) ?? [];
}

export async function guardarChats(env: AvisosEnv, chats: ChatAlta[]) {
  await env.AVISOS?.put("tg:chats", JSON.stringify(chats));
}

export async function enviarTelegram(env: AvisosEnv, chatId: number, texto: string) {
  if (!env.TELEGRAM_BOT_TOKEN) return;
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: texto, disable_web_page_preview: true })
  });
  if (!res.ok) console.error("Telegram respondió con error:", res.status, await res.text());
}

export async function avisarATodas(env: AvisosEnv, texto: string) {
  const chats = await leerChats(env);
  await Promise.all(chats.map((c) => enviarTelegram(env, c.id, texto)));
}

// Suma 1 a un contador del día. KV no es atómico, pero con el volumen de BA
// (decenas por día) la chance de pisarse es despreciable.
export async function sumar(env: AvisosEnv, clave: string, campo: string) {
  if (!env.AVISOS) return;
  const actual = ((await env.AVISOS.get(clave, "json")) as Record<string, number> | null) ?? {};
  actual[campo] = (actual[campo] ?? 0) + 1;
  // 40 días alcanzan para revisar el mes; después se borra solo.
  await env.AVISOS.put(clave, JSON.stringify(actual), { expirationTtl: 40 * 86400 });
}

export async function leerContador(env: AvisosEnv, clave: string): Promise<Record<string, number>> {
  if (!env.AVISOS) return {};
  return ((await env.AVISOS.get(clave, "json")) as Record<string, number> | null) ?? {};
}

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

// AgendaPro manda "start" como texto. Si trae zona horaria se convierte a
// hora argentina; si no la trae, ya es la hora local de la agenda.
export function formatearTurno(start: string): string {
  const m = start.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return start || "—";
  const tieneZona = /([zZ]|[+-]\d{2}:?\d{2})$/.test(start.trim());
  let [anio, mes, dia, hora, min] = m.slice(1).map(Number);
  if (tieneZona) {
    const d = new Date(start);
    if (!Number.isNaN(d.getTime())) {
      const ar = new Date(d.getTime() - 3 * 3600_000);
      [anio, mes, dia, hora, min] = [ar.getUTCFullYear(), ar.getUTCMonth() + 1, ar.getUTCDate(), ar.getUTCHours(), ar.getUTCMinutes()];
    }
  }
  const diaSemana = DIAS[new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()];
  const dd = String(dia).padStart(2, "0");
  const mm = String(mes).padStart(2, "0");
  return `${diaSemana} ${dd}/${mm}, ${String(hora).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function iniciales(nombre: string, apellido: string): string {
  const ini = (s: string) => {
    const t = (s || "").trim();
    return t ? t[0].toLocaleUpperCase("es-AR") + "." : "";
  };
  return [ini(nombre), ini(apellido)].filter(Boolean).join(" ") || "Paciente";
}

export function compararSecreto(a: string | null | undefined, b: string | undefined): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
