// Webhook del bot de Telegram de avisos de BA.
//
// Alta: cada socia abre t.me/<bot>?start=<TELEGRAM_ALTA_CODE> y toca
// "Iniciar". Telegram no deja que un bot le escriba primero a nadie, por eso
// el paso es necesario. Sin el código correcto el bot no da de alta a nadie.
// Baja: mandarle /baja al bot.
//
// Configurar una vez (después de cargar los secretos en Cloudflare):
//   abrir https://baconsultoriosmedicos.com.ar/api/telegram-bot?configurar=<AVISOS_SECRET>
// Eso le dice a Telegram que mande los mensajes del bot acá.

import { AvisosEnv, compararSecreto, enviarTelegram, guardarChats, leerChats } from "../_lib/avisos";

const BASE = "https://baconsultoriosmedicos.com.ar";

export const onRequestGet: PagesFunction<AvisosEnv> = async ({ request, env }) => {
  const clave = new URL(request.url).searchParams.get("configurar");
  if (!compararSecreto(clave, env.AVISOS_SECRET) || !env.TELEGRAM_BOT_TOKEN) {
    return new Response("No autorizado", { status: 403 });
  }
  const tg = (metodo: string, body?: unknown) =>
    fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${metodo}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {})
    }).then((r) => r.json() as Promise<{ ok: boolean; result?: { username?: string }; description?: string }>);

  const webhook = await tg("setWebhook", {
    url: `${BASE}/api/telegram-bot`,
    secret_token: env.AVISOS_SECRET,
    allowed_updates: ["message"]
  });
  const yo = await tg("getMe");
  const usuario = yo.result?.username;
  const link = usuario && env.TELEGRAM_ALTA_CODE ? `https://t.me/${usuario}?start=${env.TELEGRAM_ALTA_CODE}` : "(falta TELEGRAM_ALTA_CODE)";
  const chats = await leerChats(env);
  const texto = [
    webhook.ok ? "Bot conectado." : `Error al conectar el bot: ${webhook.description}`,
    `KV de avisos: ${env.AVISOS ? "OK" : "FALTA el binding AVISOS"}`,
    `Link de alta para Rocío y Tatiana: ${link}`,
    `Dadas de alta: ${chats.length ? chats.map((c) => c.nombre).join(", ") : "nadie todavía"}`
  ].join("\n");
  return new Response(texto, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
};

interface Update {
  message?: { chat?: { id: number; type: string }; from?: { first_name?: string }; text?: string };
}

export const onRequestPost: PagesFunction<AvisosEnv> = async ({ request, env }) => {
  const ok = new Response("ok");
  if (!compararSecreto(request.headers.get("X-Telegram-Bot-Api-Secret-Token"), env.AVISOS_SECRET)) {
    return new Response("No autorizado", { status: 403 });
  }
  let update: Update = {};
  try {
    update = await request.json();
  } catch {
    return ok;
  }
  const msg = update.message;
  const chat = msg?.chat;
  const texto = (msg?.text ?? "").trim();
  if (!chat || chat.type !== "private" || !texto) return ok;

  const nombre = msg?.from?.first_name || "socia";
  const chats = await leerChats(env);
  const yaEsta = chats.some((c) => c.id === chat.id);

  if (texto.startsWith("/start")) {
    const codigo = texto.split(/\s+/)[1] ?? "";
    if (yaEsta) {
      await enviarTelegram(env, chat.id, `Ya estás dada de alta, ${nombre}. Te van a llegar los avisos de reservas y el resumen de WhatsApp de las 21 h.`);
    } else if (compararSecreto(codigo, env.TELEGRAM_ALTA_CODE)) {
      chats.push({ id: chat.id, nombre });
      await guardarChats(env, chats);
      await enviarTelegram(
        env,
        chat.id,
        `Listo, ${nombre}. Desde ahora te llega un aviso cada vez que un paciente reserva online, y a las 21 h el resumen de WhatsApp. Para dejar de recibirlos, mandá /baja.`
      );
    } else {
      await enviarTelegram(env, chat.id, "Este bot es privado de BA Consultorios Médicos. Para usarlo, entrá con el link de alta.");
    }
    return ok;
  }

  if (texto.startsWith("/baja") && yaEsta) {
    await guardarChats(env, chats.filter((c) => c.id !== chat.id));
    await enviarTelegram(env, chat.id, "Listo, no te llegan más avisos. Para volver, usá el link de alta.");
  }
  return ok;
};
