// Páginas estáticas (sin React en el navegador): se renderizan a HTML en el
// build con scripts/build-paginas.tsx. Los botones llevan data-track y un
// script inline los empuja al dataLayer con los mismos eventos que la home
// (whatsapp_click, agendapro_direct_click). Nunca llamar gtag() ni fbq().

import type { ReactNode } from "react";
import { BRAND_INFO, MedicalService } from "../data";
import { ESPECIALIDADES, Especialidad, formatoPrecio } from "./especialidades";

const WA_NUMERO = "5491164344822";

// Servicios presenciales por naturaleza: no se les ofrece teleconsulta.
const SIN_TELECONSULTA = new Set(["Podología", "Kinesiología", "Audiometría y estudios auditivos"]);
const waUrl = (texto: string) => `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(texto)}`;

function Header() {
  return (
    <header className="bg-white/95 border-b border-[#E8D5C4]/60 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/ba-isotipo-vino.png" alt="" width={36} height={36} className="w-9 h-9 object-contain" />
          <span className="font-extrabold text-[#5C1A3D] text-sm sm:text-base leading-tight">BA Consultorios Médicos</span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-3 text-[13px] font-medium">
          <a href="/especialidades/" className="hidden sm:inline px-3 py-2 rounded-lg text-[#5C1A3D] hover:bg-[#F8F6F4]">Especialidades</a>
          <a href="/" className="hidden sm:inline px-3 py-2 rounded-lg text-[#5C1A3D] hover:bg-[#F8F6F4]">Inicio</a>
          <a
            href={BRAND_INFO.whatsappUrl}
            target="_blank"
            rel="noopener"
            data-track="whatsapp_click"
            data-origin="pagina_header"
            className="px-4 py-2 rounded-full bg-[#C2006B] text-white font-bold hover:bg-[#5C1A3D] transition-colors"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#5C1A3D] text-[#F8F6F4]/90 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-6 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-extrabold text-white mb-2">BA Consultorios Médicos</p>
          <p className="font-light">{BRAND_INFO.address}</p>
        </div>
        <div>
          <p className="font-extrabold text-white mb-2">Horarios</p>
          <p className="font-light">{BRAND_INFO.schedule}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-extrabold text-white mb-1">Turnos</p>
          <a href="/especialidades/" className="hover:text-white">Todas las especialidades</a>
          <a href={BRAND_INFO.agendaProUrl} target="_blank" rel="noopener" data-track="agendapro_direct_click" data-origin="pagina_footer" className="hover:text-white">Reservar online</a>
          <a href={BRAND_INFO.whatsappUrl} target="_blank" rel="noopener" data-track="whatsapp_click" data-origin="pagina_footer" className="hover:text-white">WhatsApp: {BRAND_INFO.whatsapp}</a>
        </div>
      </div>
    </footer>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="font-sans">{children}</main>
      <Footer />
    </>
  );
}

function Migas({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Ruta" className="text-xs text-gray-500 mb-4">
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1.5">›</span>}
          {it.href ? <a href={it.href} className="hover:text-[#C2006B]">{it.label}</a> : <span className="text-[#5C1A3D]">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function Beneficios() {
  return (
    <section className="rounded-2xl bg-[#F2C4D0]/30 border border-[#F2C4D0] p-6">
      <h2 className="font-extrabold text-lg text-[#5C1A3D] mb-3">Beneficios al pagar</h2>
      <ul className="space-y-2 text-sm text-gray-700 font-light">
        <li><strong className="font-bold text-[#5C1A3D]">Pago en efectivo:</strong> hasta 10% de descuento.</li>
        <li><strong className="font-bold text-[#5C1A3D]">Con LinkMed:</strong> $2.000 menos por cada consulta o práctica, en BA y en los centros asociados (farmacias Vilela).</li>
        <li>Los dos beneficios se suman. Las promos del mes las consultás por WhatsApp.</li>
      </ul>
    </section>
  );
}

const TIPOS: { tipo: MedicalService["type"]; titulo: string }[] = [
  { tipo: "Consulta", titulo: "Consultas" },
  { tipo: "Estudio realizado en BA", titulo: "Estudios que se hacen en BA" },
  { tipo: "Práctica o procedimiento", titulo: "Prácticas y procedimientos" },
];

export function EspecialidadPage({ esp }: { esp: Especialidad }) {
  const textoWa = `Hola BA! Quiero un turno de ${esp.nombre}. (Vengo de la web)`;
  const otras = ESPECIALIDADES.filter((e) => e.slug !== esp.slug);
  const teleconsulta = !SIN_TELECONSULTA.has(esp.nombre);
  return (
    <Shell>
      <section className="bg-white border-b border-[#E8D5C4]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid gap-8 lg:grid-cols-[1.4fr_1fr] items-start">
          <div>
            <Migas items={[{ href: "/", label: "Inicio" }, { href: "/especialidades/", label: "Especialidades" }, { label: esp.nombre }]} />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5C1A3D] leading-tight">{esp.nombre} en San Justo</h1>
            <p className="mt-4 text-gray-600 font-light leading-relaxed max-w-xl">
              Atención particular de {esp.nombre.toLowerCase()} en BA Consultorios Médicos, Almafuerte 3558, San Justo.
              Reservá online con la agenda a la vista o escribinos por WhatsApp para consultar disponibilidad.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={BRAND_INFO.agendaProUrl}
                target="_blank"
                rel="noopener"
                data-track="agendapro_direct_click"
                data-origin="especialidad_hero"
                data-service={esp.nombre}
                className="text-center px-6 py-3 rounded-full bg-[#5C1A3D] text-white font-bold hover:bg-[#C2006B] transition-colors"
              >
                Reservá online
              </a>
              <a
                href={waUrl(textoWa)}
                target="_blank"
                rel="noopener"
                data-track="whatsapp_click"
                data-origin="especialidad_hero"
                data-service={esp.nombre}
                data-stype="Consulta"
                className="text-center px-6 py-3 rounded-full border-2 border-[#C2006B] text-[#C2006B] font-bold hover:bg-[#C2006B] hover:text-white transition-colors"
              >
                Escribinos por WhatsApp
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              {teleconsulta && "Teleconsulta disponible. "}Atención particular, sin obras sociales ni prepagas.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8D5C4] bg-[#F8F6F4] p-6">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#C2006B]">Consulta particular</p>
            {esp.consulta ? (
              <>
                <p className="mt-3 text-sm text-gray-600">Precio de lista</p>
                <p className="text-3xl font-extrabold text-[#5C1A3D]">{formatoPrecio(esp.consulta.lista)}</p>
                <p className="mt-2 text-sm text-gray-700">
                  Con beneficios, desde <strong className="font-extrabold text-[#C2006B]">{formatoPrecio(esp.consulta.desde)}</strong>
                </p>
                {esp.consulta.nota && <p className="mt-2 text-xs text-gray-500">{esp.consulta.nota}</p>}
                <p className="mt-4 text-[11px] text-gray-400">Valores de referencia. Pueden cambiar: confirmalos al reservar.</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-700">Consultá el valor por WhatsApp.</p>
            )}
            <div className="mt-5 pt-5 border-t border-[#E8D5C4]">
              <p className="text-sm font-bold text-[#5C1A3D]">Disponibilidad</p>
              <p className="text-sm text-gray-600 font-light mt-1">
                Los días y horarios cambian seguido. Los ves actualizados en la agenda online, o te los pasamos por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          {esp.servicios.length > 0 &&
            TIPOS.map(({ tipo, titulo }) => {
              const lista = esp.servicios.filter((s) => s.type === tipo);
              if (!lista.length) return null;
              return (
                <section key={tipo}>
                  <h2 className="font-extrabold text-xl text-[#5C1A3D] mb-3">{titulo}</h2>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {lista.map((s) => (
                      <li key={s.id} className="rounded-xl bg-white border border-gray-100 px-4 py-3 text-sm text-gray-700">{s.name}</li>
                    ))}
                  </ul>
                </section>
              );
            })}

          <section>
            <h2 className="font-extrabold text-xl text-[#5C1A3D] mb-3">Preguntas frecuentes</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Atienden por obra social o prepaga?</dt>
                <dd className="text-gray-600 font-light mt-1">No. La atención en BA es particular, con beneficios por pago en efectivo y con LinkMed.</dd>
              </div>
              {teleconsulta && (
                <div>
                  <dt className="font-bold text-[#5C1A3D]">¿Hay teleconsulta?</dt>
                  <dd className="text-gray-600 font-light mt-1">Sí. Se reserva en la agenda online o por WhatsApp.</dd>
                </div>
              )}
              <div>
                <dt className="font-bold text-[#5C1A3D]">¿Dónde queda BA?</dt>
                <dd className="text-gray-600 font-light mt-1">En {BRAND_INFO.address}. {BRAND_INFO.schedule}.</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="space-y-8">
          <Beneficios />
          <section>
            <h2 className="font-extrabold text-lg text-[#5C1A3D] mb-3">Otras especialidades</h2>
            <ul className="flex flex-wrap gap-2">
              {otras.map((e) => (
                <li key={e.slug}>
                  <a href={`/especialidades/${e.slug}/`} className="inline-block text-xs px-3 py-1.5 rounded-full bg-white border border-[#E8D5C4] text-[#5C1A3D] hover:border-[#C2006B] hover:text-[#C2006B]">
                    {e.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Shell>
  );
}

export function EspecialidadesIndex() {
  return (
    <Shell>
      <section className="bg-white border-b border-[#E8D5C4]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Migas items={[{ href: "/", label: "Inicio" }, { label: "Especialidades" }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5C1A3D] leading-tight">Especialidades en San Justo</h1>
          <p className="mt-4 text-gray-600 font-light leading-relaxed max-w-2xl">
            Más de 30 especialidades con atención particular en BA Consultorios Médicos, Almafuerte 3558, San Justo.
            Elegí la tuya para ver el valor de la consulta y cómo pedir turno.
          </p>
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <ul className="grid sm:grid-cols-2 gap-3">
          {ESPECIALIDADES.map((e) => (
            <li key={e.slug}>
              <a href={`/especialidades/${e.slug}/`} className="flex items-center justify-between gap-3 rounded-xl bg-white border border-gray-100 px-4 py-3 hover:border-[#C2006B] transition-colors">
                <span className="font-bold text-[#5C1A3D] text-sm">{e.nombre}</span>
                {e.consulta && <span className="text-xs text-gray-500 whitespace-nowrap">desde {formatoPrecio(e.consulta.desde)}</span>}
              </a>
            </li>
          ))}
        </ul>
        <aside>
          <Beneficios />
        </aside>
      </div>
    </Shell>
  );
}
