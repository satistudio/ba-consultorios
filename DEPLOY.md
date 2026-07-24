# Deploy con disponibilidad real (Cloudflare Pages)

GitHub Pages es hosting 100% estático: no puede correr `functions/api/disponibilidad.ts`.
Para que el simulador del hero muestre turnos reales hace falta un host que sí ejecute
funciones serverless. Recomendación: **Cloudflare Pages** (gratis, mismo flujo git push).

## 1. Conectar el repo
- Cloudflare Dashboard → Pages → Create a project → Connect to Git.
- Build command: `npm run build`
- Output directory: `dist`
- Cloudflare detecta `functions/` automáticamente y lo publica como Pages Functions.

## 2. Cargar las credenciales de AgendaPro (nunca en el código)
- Están en AgendaPro → ⚙️ Configuraciones → Integraciones / API Pública → sección "API"
  (usuario y contraseña — es la API v1, confirmada con soporte de AgendaPro).
- Cloudflare Pages → tu proyecto → Settings → Environment variables → Add secret:
  `AGENDAPRO_USER` = `<el usuario>`
  `AGENDAPRO_PASSWORD` = `<la contraseña>`

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

## Reseñas reales de Google (functions/api/resenas.ts)

1. Entrar a [console.cloud.google.com](https://console.cloud.google.com/) → crear
   un proyecto (o usar uno existente) → **APIs & Services → Library** → buscar
   **"Places API (New)"** → Enable.
2. **APIs & Services → Credentials → Create Credentials → API Key**.
3. Restringir la key (muy importante, evita que la usen desde otro sitio):
   - **API restrictions**: solo "Places API (New)".
   - **Application restrictions**: dejar sin restringir por ahora (la llamada
     sale desde el servidor de Cloudflare, no desde el navegador, así que no
     tiene IP fija fácil de whitelistear).
4. Cloudflare Pages → tu proyecto → Settings → Environment variables → Add secret:
   `GOOGLE_PLACES_API_KEY` = `<la key>`
5. No hace falta tocar `functions/api/_resenas-config.json` — ya tiene el nombre
   y dirección real de BA. La primera vez que se llame a `/api/resenas`, la
   función busca sola el `place_id` correcto y lo cachea 24hs.
6. Costo: Google da una cuota gratis mensual (créditos). Con el caché de 24hs
   esto hace como máximo ~30 llamadas al mes — muy por debajo del free tier.

## Envío de órdenes médicas por mail (functions/api/enviar-orden.ts)

1. Crear cuenta gratis en [resend.com](https://resend.com/) (hasta 3.000
   mails/mes, 100/día — de sobra para esto).
2. Dashboard de Resend → **API Keys → Create API Key** (permiso "Sending access"
   alcanza).
3. Cloudflare Pages → tu proyecto → Settings → Environment variables → Add secret:
   `RESEND_API_KEY` = `<la key>`
4. **Importante sobre el remitente:** por ahora el mail sale desde
   `onboarding@resend.dev` (dominio de prueba de Resend) — funciona, pero tiene
   más chance de caer en spam. Cuando BA tenga su propio dominio (`.com.ar` o
   similar), conviene verificarlo en Resend (Dashboard → Domains → Add Domain,
   agregar 2-3 registros DNS) y cambiar el `from` en
   `functions/api/enviar-orden.ts` a algo como
   `BA Consultorios Médicos <ordenes@baconsultoriosmedicos.com.ar>`.
5. El mail siempre llega a `baconsultoriosmedicos@gmail.com` con el mismo
   asunto y cuerpo, y la orden adjunta. Revisar la carpeta de spam las primeras
   veces por el punto anterior.

