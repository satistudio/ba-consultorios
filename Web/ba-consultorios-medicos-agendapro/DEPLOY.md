# Deploy con disponibilidad real (Cloudflare Pages)

GitHub Pages es hosting 100% estático: no puede correr `functions/api/disponibilidad.ts`.
Para que el simulador del hero muestre turnos reales hace falta un host que sí ejecute
funciones serverless. Recomendación: **Cloudflare Pages** (gratis, mismo flujo git push).

## 1. Conectar el repo
- Cloudflare Dashboard → Pages → Create a project → Connect to Git.
- Build command: `npm run build`
- Output directory: `dist`
- Cloudflare detecta `functions/` automáticamente y lo publica como Pages Functions.

## 2. Cargar el API key de AgendaPro (nunca en el código)
- Obtenerlo en AgendaPro → Configuraciones → Integraciones → API v3 / Connect
  (con scope `bookings:read`). Si el panel solo muestra usuario/contraseña clásicos,
  pedir al chat de soporte de AgendaPro habilitar la API v3 (Bearer key) para poder
  usar el endpoint de disponibilidad — es distinto del par usuario/contraseña que
  se ve en la captura que enviaste.
- Cloudflare Pages → tu proyecto → Settings → Environment variables → Add secret:
  `AGENDAPRO_API_KEY` = `<el key>`

## 3. Completar los IDs (no son secretos, van en el repo)
Editar `functions/api/_services-map.json`:
- `location_id`: el ID del local de BA en AgendaPro.
- `service_id` de cada una de las 5 especialidades del hero.

Se consiguen desde el endpoint `List Locations` / `List Services` de la API, o
pidiéndolos directamente al chat de soporte de AgendaPro.

## 4. Verificar
- Con los tres pasos hechos, `/api/disponibilidad` en el dominio de Cloudflare Pages
  debería devolver `{ "ok": true, "items": [...] }`.
- Si falta cualquier dato, el simulador cae solo al mensaje genérico (sin números
  inventados) — no rompe la página.

## Nota sobre el dominio actual
Si `baconsultorios.com` (o el dominio que uses) sigue apuntando a GitHub Pages,
hay que migrar el DNS a Cloudflare Pages para que la función quede activa ahí.
GitHub Pages puede quedar como respaldo, pero no correrá `/api/disponibilidad`.
