// Mini sitio que se publica SOLO en el proyecto viejo de Cloudflare Pages
// ("ba-consultorios", cuenta de Araguine), que sirve ba-consultorios.pages.dev.
// Ese proyecto no puede conectarse al repo (Cloudflare no deja usar el mismo
// repo en dos cuentas), así que se sube a mano con el workflow
// redirect-old-pages.yml. Todo lo que llega se redirige con 301 al dominio
// real, conservando ruta y parámetros, para que Google mude la indexación.

const CANONICAL_ORIGIN = "https://baconsultoriosmedicos.com.ar";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    return Response.redirect(CANONICAL_ORIGIN + url.pathname + url.search, 301);
  },
};
