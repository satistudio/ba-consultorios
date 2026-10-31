// Cloudflare Pages middleware — corre en el servidor antes de cada request.
// Redirige con 301 los subdominios .pages.dev de producción al dominio real,
// conservando ruta y parámetros. Google solo toma una mudanza de dominio como
// definitiva con un 301 del servidor; la redirección por JavaScript de
// index.html no alcanza y deja a los dos dominios compitiendo en búsquedas.
//
// Las vistas previas de cada rama (<hash>.<proyecto>.pages.dev) NO se
// redirigen, para poder seguir revisando cambios antes de publicarlos.

const CANONICAL_ORIGIN = "https://baconsultoriosmedicos.com.ar";

const REDIRECT_HOSTS = new Set([
  "ba-consultorios.pages.dev",
  "ba-consultorios-3da.pages.dev",
]);

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);
  if (REDIRECT_HOSTS.has(url.hostname)) {
    return Response.redirect(CANONICAL_ORIGIN + url.pathname + url.search, 301);
  }
  return next();
};
