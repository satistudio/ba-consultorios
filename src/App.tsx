import React, { useState, useEffect, useMemo } from "react";
import {
  Phone,
  Calendar,
  Check,
  Instagram,
  ArrowRight,
  Sparkles,
  UserRound,
  Menu,
  X,
  FileText,
  Stethoscope,
  Tag,
  ClipboardList,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BRAND_INFO, INSTALLATION_PHOTOS } from "./data";

// Páginas propias: la home ya no repite su contenido, lleva a cada una.
const NAV = [
  { href: "/especialidades/", label: "Especialidades" },
  { href: "/estudios/", label: "Estudios y preparación" },
  { href: "/precios/", label: "Precios" },
  { href: "/turnos/", label: "Turnos y órdenes" },
  { href: "/contacto/", label: "Cómo llegar" },
];

// Reserva directa de un servicio en AgendaPro (sucursal 9099).
const reservaServicio = (serviceId?: number) =>
  serviceId ? `https://baconsultorios.site.agendapro.com/ar/sucursal/9099?services_id=${serviceId}` : BRAND_INFO.agendaProUrl;

const hora = (t: string) => (/^\d{2}:\d{2}/.test(t) ? t.slice(0, 5) : t);

export default function App() {
  // Active FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [turnoSel, setTurnoSel] = useState(0);

  // ==========================================================================
  //  MEDICIÓN — único punto de salida de datos del sitio
  // ==========================================================================
  //  El código SOLO empuja eventos al dataLayer. Qué herramienta recibe qué
  //  (GA4, Meta Pixel, futuras) se decide dentro de GTM, nunca acá.
  //  Nunca llamar gtag() ni fbq() directamente desde este archivo.
  //
  //  Los nombres de evento son genéricos a propósito: no pueden contener
  //  terminología médica (restricción de tracking sensible de salud, Meta 2026).
  //  El nombre del estudio viaja como parámetro y GTM lo manda solo a GA4.
  //
  //  Eventos:
  //   whatsapp_click         → CTA que lleva a WhatsApp .......... CONVERSIÓN
  //   agendapro_booking_open → se abre el modal de reserva ....... CONVERSIÓN
  //   agendapro_direct_click → link directo a AgendaPro .......... CONVERSIÓN
  //   lead_form_submit       → formulario propio enviado ......... CONVERSIÓN
  //   social_click           → redes o mapa ..................... NO conversión
  // ==========================================================================

  const pushEvent = (payload: Record<string, unknown>) => {
    const win = window as any;
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push(payload);
  };

  // CONVERSIÓN. origin identifica QUÉ botón se tocó (para saber qué convierte).
  const trackWhatsApp = (origin: string, serviceName?: string, serviceType?: string) => {
    pushEvent({
      event: "whatsapp_click",
      origin,
      service_name: serviceName || "",
      service_type: serviceType || ""
    });
  };

  // CONVERSIÓN. Link que va derecho a AgendaPro sin pasar por el modal.
  const trackAgendaProDirect = (origin: string, serviceName?: string) => {
    pushEvent({
      event: "agendapro_direct_click",
      origin,
      service_name: serviceName || ""
    });
  };

  // CONVERSIÓN. Formularios propios (orden médica, newsletter).
  const trackFormSubmit = (formName: string) => {
    pushEvent({ event: "lead_form_submit", form_name: formName });
  };

  // NO es conversión. Solo para saber hacia dónde se va el tráfico.
  const trackSocial = (destination: string) => {
    pushEvent({ event: "social_click", destination });
  };

  // CONVERSIÓN. Apertura del modal de reserva online (canal autogestión).
  const openBookingModal = (origin: string) => {
    pushEvent({ event: "agendapro_booking_open", origin });
    setIsBookingModalOpen(true);
  };

  // Newsletter popup: aparece a los 5s, una sola vez por visitante.
  // En móvil se muestra como banner inferior (no intersticial) para no caer
  // en la penalización de Google por interstitials intrusivos en mobile.
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subForm, setSubForm] = useState({ name: "", email: "", consent: false });
  const [subStatus, setSubStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    try {
      if (localStorage.getItem("ba_newsletter_dismissed") === "1") return;
    } catch {
      // si localStorage no está disponible, seguimos igual
    }
    const timer = setTimeout(() => setShowSubscribe(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismissSubscribe = () => {
    setShowSubscribe(false);
    try {
      localStorage.setItem("ba_newsletter_dismissed", "1");
    } catch {
      // ignorar
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name.trim() || !subForm.email.trim() || !subForm.consent) return;
    setSubStatus("sending");
    try {
      const res = await fetch("/api/suscribir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: subForm.name.trim(), email: subForm.email.trim(), consent: true })
      });
      const json = await res.json();
      if (json.ok) {
        setSubStatus("sent");
        trackFormSubmit("newsletter");
        try {
          localStorage.setItem("ba_newsletter_dismissed", "1");
        } catch {
          // ignorar
        }
        setTimeout(() => setShowSubscribe(false), 2500);
      } else {
        setSubStatus("error");
      }
    } catch {
      setSubStatus("error");
    }
  };

  // Real availability data (fetched from our own serverless proxy — never calls AgendaPro directly from the browser)
  type AvailabilityItem = { name: string; icon: string; service_id?: number; status: "today" | "tomorrow" | "soon" | "none" | "error"; count: number; firstTimes: string[]; dayLabel: string | null; date?: string | null };
  const [availability, setAvailability] = useState<AvailabilityItem[] | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<"loading" | "ok" | "not_configured" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/disponibilidad")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.ok) {
          setAvailability(json.items);
          setAvailabilityStatus("ok");
        } else {
          setAvailabilityStatus("not_configured");
        }
      })
      .catch(() => {
        if (!cancelled) setAvailabilityStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Real Google reviews (fetched from our own serverless proxy — never calls Google directly from the browser)
  type Review = { author: string; photoUrl: string | null; rating: number; text: string; relativeTime: string };
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsMeta, setReviewsMeta] = useState<{ rating: number | null; count: number | null; mapsUri: string | null }>({ rating: null, count: null, mapsUri: null });
  const [reviewsStatus, setReviewsStatus] = useState<"loading" | "ok" | "unavailable">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/resenas")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.ok && json.reviews?.length) {
          const shuffled = [...json.reviews].sort(() => Math.random() - 0.5);
          setReviews(shuffled);
          setReviewsMeta({ rating: json.rating, count: json.userRatingCount, mapsUri: json.googleMapsUri });
          setReviewsStatus("ok");
        } else {
          setReviewsStatus("unavailable");
        }
      })
      .catch(() => {
        if (!cancelled) setReviewsStatus("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // GTM se carga UNA sola vez, desde index.html (head + noscript). No volver a
  // inyectarlo acá: cargar el contenedor dos veces duplica page views y eventos
  // en GA4 y Meta Pixel. GA4 y Pixel se configuran DENTRO de GTM.

  // Links viejos a secciones que ahora tienen página propia (pueden estar en
  // la bio de Instagram, anuncios o mensajes guardados): se redirigen.
  useEffect(() => {
    const destinos: Record<string, string> = {
      "#directorio": "/especialidades/",
      "#subir-orden": "/turnos/#orden",
      "#contacto": "/contacto/",
      "#equipo": "/especialidades/",
    };
    if (destinos[location.hash]) location.replace(destinos[location.hash]);
    else if (location.hash === "#reserva-online") openBookingModal("link_viejo_reserva");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cerrar el menú móvil con Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  // Close booking modal on Escape key
  useEffect(() => {
    if (!isBookingModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsBookingModalOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isBookingModalOpen]);


  return (
    <div className="min-h-screen font-sans bg-[#F8F6F4] text-[#1e1b1d] antialiased selection:bg-[#F2C4D0] selection:text-[#5C1A3D]">
      
      {/* TOP ANNOUNCEMENT BAR */}
      <div id="top-bar" className="bg-[#5C1A3D] text-white py-2 px-4 text-center text-xs md:text-sm font-semibold tracking-wide border-b border-[#C2006B]/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-1 md:gap-4">
          <span>📅 Turnos esta semana — rapidez real, sin esperas.</span>
          <span className="hidden md:inline-block text-[#F2C4D0]">|</span>
          <button
            type="button"
            onClick={() => openBookingModal("top_bar")}
            className="underline hover:text-[#F2C4D0] transition-colors cursor-pointer"
          >
            Reservá tu turno →
          </button>
        </div>
      </div>

      {/* HEADER / NAVIGATION */}
      <header
        id="main-header"
        className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 border-b border-[#E8D5C4]/60 shadow-[0_4px_24px_-8px_rgba(92,26,61,0.12)]"
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-[#5C1A3D] via-[#C2006B] to-[#F2C4D0]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex justify-between items-center gap-3">
          <a href="/" aria-label="BA Consultorios Médicos, inicio" className="flex items-center flex-shrink-0">
            <img
              src="/ba-isotipo-192.webp"
              alt=""
              width={192}
              height={131}
              className="h-10 md:h-14 w-auto object-contain"
            />
          </a>

          <nav aria-label="Principal" className="hidden lg:flex items-center gap-1 text-[13px] font-medium">
            {NAV.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-full text-gray-600 hover:text-[#5C1A3D] hover:bg-[#F2C4D0]/30 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => openBookingModal("header")}
              className="bg-gradient-to-br from-[#C2006B] to-[#a10058] hover:from-[#a10058] hover:to-[#8a0049] text-white px-4 md:px-6 py-2.5 rounded-full text-[11px] md:text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-[#C2006B]/25 cursor-pointer whitespace-nowrap"
            >
              Reservá tu turno
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              className="lg:hidden w-11 h-11 rounded-full border border-[#E8D5C4] bg-white text-[#5C1A3D] flex items-center justify-center cursor-pointer"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="menu-movil" aria-label="Menú" className="lg:hidden border-t border-[#E8D5C4]/60 bg-white">
            <ul className="max-w-7xl mx-auto px-4 pt-2 pb-3">
              {NAV.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="flex items-center justify-between px-3 py-3.5 rounded-xl text-[#5C1A3D] font-semibold hover:bg-[#F2C4D0]/30"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 text-[#C2006B]" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="max-w-7xl mx-auto px-4 pb-4 flex items-center gap-2">
              <a
                href={BRAND_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsApp("menu")}
                className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-sm font-bold"
              >
                Escribinos por WhatsApp
              </a>
              <a
                href={BRAND_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de BA Consultorios Médicos"
                onClick={() => trackSocial("instagram_menu")}
                className="w-11 h-11 rounded-full border border-[#E8D5C4] text-[#5C1A3D] flex items-center justify-center"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={BRAND_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de BA Consultorios Médicos"
                onClick={() => trackSocial("facebook_menu")}
                className="w-11 h-11 rounded-full border border-[#E8D5C4] text-[#5C1A3D] flex items-center justify-center font-black text-sm"
              >
                f
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="hero-section" className="relative bg-[#5C1A3D] text-white py-16 md:py-24 overflow-hidden">
        {/* Abstract background graphics (Brand Compliance: Realist aesthetics, no messy tape or polaroids) */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C2006B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C2006B] blur-[150px] opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#E8D5C4] blur-[150px] opacity-10 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left: Headlines & Brand Voice */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <div className="inline-flex items-center gap-2 bg-[#C2006B]/20 text-[#F2C4D0] border border-[#C2006B]/40 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 w-fit">
              <span className="w-2 h-2 rounded-full bg-[#C2006B] animate-pulse"></span>
              Atención Particular Accesible · Sin Obra Social
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[900] tracking-tight text-white leading-[1.1] mb-6">
              Más de 30 especialidades.<br />
              <span className="text-[#F2C4D0]">Turnos esta semana.</span><br />
              <em className="acento">Rapidez real.</em>
            </h1>
            
            <p className="text-lg md:text-xl text-[#F8F6F4]/90 font-light leading-relaxed max-w-2xl mb-8">
              En <strong className="font-semibold text-white">BA Consultorios Médicos</strong> resolvemos tu salud de forma directa y profesional. Sin las esperas eternas del sistema tradicional. ¿Lo necesitás antes? Escribinos y evaluamos un sobreturno.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => openBookingModal("hero")}
                className="bg-[#C2006B] hover:bg-[#a10058] text-white px-8 py-4 rounded-full text-sm md:text-base font-bold tracking-wider uppercase text-center transition-all duration-300 shadow-xl shadow-[#C2006B]/30 flex items-center justify-center gap-3 group cursor-pointer"
              >
                Reservá tu turno
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href={BRAND_INFO.whatsappUrl}
                onClick={() => trackWhatsApp("hero")}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white/20 hover:border-white/60 text-white hover:bg-white/5 px-8 py-4 rounded-full text-sm md:text-base font-bold tracking-wider uppercase text-center transition-colors flex items-center justify-center gap-2"
              >
                Escribinos por WhatsApp
              </a>
            </div>

            {/* Quality badge (Brand compliance: No larp indicators, just friendly check points) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-12 border-t border-white/10 pt-8 text-xs md:text-sm text-[#F8F6F4]/80">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#C2006B] flex-shrink-0" />
                <span>Resultados rápidos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#C2006B] flex-shrink-0" />
                <span>Atención en San Justo</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Check className="w-5 h-5 text-[#C2006B] flex-shrink-0" />
                <span>Soporte directo por WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Hero Right: próximos turnos reales (AgendaPro vía /api/disponibilidad) */}
          <div className="lg:col-span-5">
            <div className="bg-white text-[#1e1b1d] rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#E8D5C4]/30">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Próximos turnos</span>
                </div>
                <span className="text-[11px] text-gray-500">Agenda real, se actualiza sola</span>
              </div>

              <p className="font-bold text-lg text-[#5C1A3D] mb-3">¿Qué turno buscás?</p>

              {availabilityStatus === "loading" && (
                <div className="space-y-3" aria-hidden="true">
                  <div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-9 w-28 rounded-full bg-[#F8F6F4] animate-pulse" />)}</div>
                  <div className="h-36 rounded-xl bg-[#F8F6F4] animate-pulse" />
                </div>
              )}

              {availabilityStatus === "ok" && availability && availability.length > 0 && (() => {
                const it = availability[Math.min(turnoSel, availability.length - 1)];
                const hay = it.status === "today" || it.status === "tomorrow" || it.status === "soon";
                const fecha = it.date ? ` ${it.date.slice(8, 10)}/${it.date.slice(5, 7)}` : "";
                const dia = it.status === "today" ? "Hoy" : it.status === "tomorrow" ? "Mañana" : `El ${it.dayLabel ?? ""}${fecha}`;
                return (
                  <>
                    <div role="tablist" aria-label="Especialidades con agenda online" className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                      {availability.map((a, i) => (
                        <button
                          key={a.name}
                          type="button"
                          role="tab"
                          aria-selected={i === turnoSel}
                          onClick={() => setTurnoSel(i)}
                          className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                            i === turnoSel
                              ? "bg-[#C2006B] border-[#C2006B] text-white"
                              : "bg-white border-[#E8D5C4] text-[#5C1A3D] hover:border-[#C2006B]"
                          }`}
                        >
                          {a.name}
                        </button>
                      ))}
                    </div>

                    <div role="tabpanel" aria-live="polite" className="mt-3 rounded-xl bg-[#F8F6F4] border border-[#E8D5C4]/60 p-4">
                      {hay ? (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Próximo día con turnos</p>
                          <p className="text-2xl font-extrabold text-[#5C1A3D] mt-0.5">{dia}</p>
                          {it.firstTimes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {it.firstTimes.map((t) => (
                                <a
                                  key={t}
                                  href={reservaServicio(it.service_id)}
                                  onClick={() => trackAgendaProDirect("turnos_home_horario", it.name)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 rounded-lg bg-white border border-[#E8D5C4] text-sm font-bold text-[#C2006B] hover:border-[#C2006B] transition-colors"
                                >
                                  {hora(t)}
                                </a>
                              ))}
                            </div>
                          )}
                          {it.count > it.firstTimes.length && (
                            <p className="text-xs text-gray-600 mt-2">
                              Y {it.count - it.firstTimes.length} horario{it.count - it.firstTimes.length === 1 ? "" : "s"} más ese día.
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-700">
                          No vemos turnos online en los próximos 7 días para {it.name}.{" "}
                          <a
                            href={BRAND_INFO.whatsappUrl}
                            onClick={() => trackWhatsApp("turnos_home_sin_fecha", it.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#C2006B] underline underline-offset-2"
                          >
                            Escribinos
                          </a>{" "}
                          y te decimos la próxima fecha.
                        </p>
                      )}
                    </div>

                    <a
                      href={reservaServicio(it.service_id)}
                      onClick={() => trackAgendaProDirect("turnos_home_boton", it.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full bg-[#5C1A3D] hover:bg-[#44122d] text-white py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-colors"
                    >
                      Reservar {it.name}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </>
                );
              })()}

              {(availabilityStatus === "not_configured" || availabilityStatus === "error" || (availabilityStatus === "ok" && !availability?.length)) && (
                <>
                  <div className="bg-[#F8F6F4] p-4 rounded-xl border border-gray-100 text-center">
                    <p className="text-sm font-semibold text-gray-700">Turnos esta semana en la mayoría de las especialidades.</p>
                    <p className="text-xs text-gray-600 mt-1">Mirá días y horarios en la agenda online.</p>
                  </div>
                  <button
                    onClick={() => openBookingModal("simulador")}
                    className="mt-4 block w-full bg-[#5C1A3D] hover:bg-[#44122d] text-white text-center py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Ver la agenda
                  </button>
                </>
              )}

              <p className="text-center text-xs text-gray-600 mt-3">
                ¿Buscás otra especialidad?{" "}
                <button
                  type="button"
                  onClick={() => openBookingModal("simulador_todas")}
                  className="font-bold text-[#C2006B] underline underline-offset-2 cursor-pointer"
                >
                  Ver toda la agenda
                </button>{" "}
                o{" "}
                <a
                  href={BRAND_INFO.whatsappUrl}
                  onClick={() => trackWhatsApp("simulador_link")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#C2006B] underline underline-offset-2"
                >
                  escribinos
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ¿QUÉ NECESITÁS? — accesos por tarea a las páginas propias */}
      <section id="que-necesitas" className="py-14 md:py-20 bg-[#F8F6F4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#5C1A3D]">¿Qué necesitás?</h2>
          <p className="text-gray-600 mt-2 mb-8">Elegí y te llevamos directo.</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: Calendar, titulo: "Sacar un turno", texto: "Elegí día y horario online.", accion: () => openBookingModal("tarea_turno") },
              { icon: FileText, titulo: "Tengo una orden", texto: "Subila y te escribimos con el turno.", href: "/turnos/#orden" },
              { icon: Stethoscope, titulo: "Especialidades", texto: "Más de 30, con el valor de cada consulta.", href: "/especialidades/" },
              { icon: Tag, titulo: "Precios", texto: "Consultas, ecografías y estudios.", href: "/precios/" },
              { icon: ClipboardList, titulo: "Cómo prepararme", texto: "Ayunos y preparación de estudios.", href: "/estudios/#preparacion" },
              { icon: MapPin, titulo: "Cómo llegar", texto: "A metros del shopping de San Justo.", href: "/contacto/" },
            ].map(({ icon: Icon, titulo, texto, href, accion }) => {
              const contenido = (
                <>
                  <span className="w-11 h-11 rounded-xl bg-[#F2C4D0]/50 flex items-center justify-center mb-3 group-hover:bg-[#C2006B] transition-colors">
                    <Icon className="w-5 h-5 text-[#5C1A3D] group-hover:text-white transition-colors" strokeWidth={2.25} />
                  </span>
                  <span className="block font-extrabold text-[#5C1A3D] text-base sm:text-lg leading-tight">{titulo}</span>
                  <span className="block text-xs sm:text-sm text-gray-600 mt-1">{texto}</span>
                </>
              );
              const clase = "group text-left bg-white rounded-2xl border border-[#E8D5C4]/70 p-4 sm:p-6 hover:border-[#C2006B]/40 hover:shadow-md transition-all cursor-pointer";
              return href ? (
                <a key={titulo} href={href} className={clase}>{contenido}</a>
              ) : (
                <button key={titulo} type="button" onClick={accion} className={clase}>{contenido}</button>
              );
            })}
          </div>
        </div>
      </section>

      {/* POR QUÉ BA */}
      <section aria-label="Por qué BA" className="bg-white border-y border-[#E8D5C4]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { titulo: "Atención particular", texto: "Sin obra social ni prepaga." },
            { titulo: "Beneficios al pagar", texto: "Efectivo hasta 10% y LinkMed $2.000 menos. Se suman." },
            { titulo: "Más de 30 especialidades", texto: "Consultas, ecografías y estudios en un mismo lugar." },
            { titulo: "En San Justo", texto: "Almafuerte 3558, a metros del shopping." },
          ].map((b) => (
            <div key={b.titulo} className="flex gap-3">
              <Check className="w-5 h-5 text-[#C2006B] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm text-[#5C1A3D]">{b.titulo}</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{b.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INSTALLATIONS GALLERY — auto-scrolling carousel of real photos */}
      {INSTALLATION_PHOTOS.length > 0 && (
        <section className="py-20 bg-[#F8F6F4] border-t border-[#E8D5C4]/30 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold tracking-widest uppercase text-[#C2006B]">NUESTRAS INSTALACIONES</span>
              <h2 className="text-3xl font-extrabold text-[#5C1A3D] mt-2">Conocé BA por dentro</h2>
            </div>
          </div>
          <div className="relative">
            <style>{`
              @keyframes ba-marquee {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
              .ba-marquee-track {
                animation: ba-marquee 35s linear infinite;
              }
              .ba-marquee-track:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div className="flex ba-marquee-track w-max gap-4">
              {[...INSTALLATION_PHOTOS, ...INSTALLATION_PHOTOS].map((photo, idx) => (
                <div key={idx} className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border border-[#E8D5C4]/40 flex-shrink-0">
                  <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS & TESTIMONIALS */}
      <section id="testimonios" className="py-20 bg-[#F8F6F4] border-t border-b border-[#E8D5C4]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-[#C2006B]">TESTIMONIOS REALES</span>
            <h2 className="text-3xl font-extrabold text-[#5C1A3D] mt-2">La voz de nuestros pacientes</h2>
            <p className="text-sm text-gray-600 font-light mt-2">
              Pacientes reales de San Justo y alrededores que resuelven su salud diariamente en nuestros consultorios.
            </p>
          </div>

          {reviewsStatus === "loading" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-56 rounded-2xl bg-white border-2 border-[#F2C4D0]/30 animate-pulse" />
              ))}
            </div>
          )}

          {reviewsStatus === "ok" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {reviews.slice(0, 3).map((r, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white p-8 rounded-2xl shadow-sm border-2 border-[#F2C4D0]/60 relative flex flex-col justify-between"
                  >
                    <span className="absolute -top-4 -left-2 text-4xl select-none opacity-15">“</span>
                    
                    <div>
                      <div className="flex items-center gap-1.5 mb-4">
                        {[1,2,3,4,5].map(star => (
                          <span key={star} className={star <= r.rating ? "text-[#C2006B]" : "text-gray-200"}>★</span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 italic font-light leading-relaxed mb-6">
                        "{r.text}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      {r.photoUrl ? (
                        <img src={r.photoUrl} alt={r.author} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#5C1A3D] text-[#F2C4D0] font-extrabold flex items-center justify-center text-sm">
                          {r.author.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                      )}
                      <div className="text-left">
                        <h4 className="font-bold text-xs text-[#5C1A3D]">{r.author}</h4>
                        <p className="text-[10px] text-gray-500 font-medium">
                          {r.relativeTime} · Reseña de Google
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <a
                  href={reviewsMeta.mapsUri ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSocial("google_reviews")}
                  className="text-xs text-gray-500 hover:text-[#C2006B] font-medium transition-colors"
                >
                  {reviewsMeta.rating && reviewsMeta.count
                    ? `★ ${reviewsMeta.rating} · ${reviewsMeta.count} reseñas en Google — ver todas`
                    : "Ver todas las reseñas en Google"}
                </a>
              </div>
            </>
          )}

          {reviewsStatus === "unavailable" && (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500 font-light mb-3">Todavía no pudimos cargar las reseñas automáticamente.</p>
              <a
                href="https://www.google.com/search?q=BA+Consultorios+Medicos+San+Justo+reseñas"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackSocial("google_reviews_fallback")}
                className="text-sm font-bold text-[#C2006B] hover:underline"
              >
                Ver reseñas reales en Google →
              </a>
            </div>
          )}

        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-[#C2006B]">PREGUNTAS FRECUENTES</span>
            <h2 className="text-3xl font-extrabold text-[#5C1A3D] mt-2">Dudas habituales resueltas</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "¿Atienden por obra social o prepaga?",
                a: "No, la atención en BA Consultorios Médicos es exclusivamente particular. Esto nos permite mantener aranceles altamente accesibles, eliminar los extensos plazos de espera de los sistemas de obras sociales y ofrecer turnos en pocos días, sin meses de espera."
              },
              {
                q: "¿Cómo solicito un turno y en cuánto tiempo me responden?",
                a: "Podés reservar online desde el botón «Reservá tu turno»: ves días y horarios disponibles y te llega el recordatorio. Si lo necesitás antes o preferís hablar con una persona, escribinos por WhatsApp dentro de nuestros horarios de atención y evaluamos un sobreturno."
              },
              {
                q: "¿Cuáles son los métodos de pago aceptados?",
                a: "Podés abonar tus consultas, estudios o prácticas en efectivo, transferencia bancaria, o tarjeta de débito/crédito mediante MercadoPago antes de ingresar al consultorio."
              },
              {
                q: "¿Tengo que llevar orden médica para hacerme un estudio?",
                a: "Para la mayoría de las ecografías o electrocardiogramas comunes no es obligatorio contar con orden médica si venís de forma particular. No obstante, te recomendamos traerla si el estudio fue derivado por otro profesional para realizar exactamente la práctica solicitada."
              },
              {
                q: "¿En cuánto tiempo entregan los informes de los estudios?",
                a: "El plazo depende de cada estudio. Consultalo al sacar el turno o escribinos por WhatsApp. El informe se entrega en formato digital por WhatsApp, o impreso si lo pedís al momento de hacerte el estudio."
              }
            ].map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="border border-gray-100 rounded-xl overflow-hidden transition-colors duration-200">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex justify-between items-center bg-[#F8F6F4] hover:bg-[#E8D5C4]/20 p-5 text-left font-bold text-[#5C1A3D] text-sm md:text-base cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-[#C2006B] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-5 text-sm text-gray-600 font-light leading-relaxed border-t border-gray-100 bg-white">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* JOIN BA — professionals & health providers */}
      <section id="sumate" className="py-10 bg-[#F8F6F4] border-t border-[#E8D5C4]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          <div>
            <p className="font-extrabold text-lg text-[#5C1A3D]">¿Sos profesional de la salud o tenés un comercio del rubro?</p>
            <p className="text-sm text-gray-600 mt-1">Sumate al staff de BA o adherite a la red de beneficios para pacientes.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <a
              href={`https://wa.me/5491164344822?text=${encodeURIComponent("Hola BA! Soy profesional de la salud y me interesa sumarme al staff / atender en sus consultorios. (Vengo de la web)")}`}
              onClick={() => trackWhatsApp("sumate_profesional")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#5C1A3D] hover:bg-[#44122d] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <UserRound className="w-4 h-4" /> Quiero sumarme
            </a>
            <a
              href={`https://wa.me/5491164344822?text=${encodeURIComponent("Hola BA! Tengo un comercio/servicio de salud y me interesa adherirme a su red de beneficios para pacientes. (Vengo de la web)")}`}
              onClick={() => trackWhatsApp("sumate_proveedor")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white border border-[#E8D5C4] hover:border-[#C2006B] text-[#5C1A3D] px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Adherir mi comercio
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#5C1A3D] text-[#F8F6F4]/90 py-12 border-t border-[#C2006B]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-white/10">
            {/* Left side: branding */}
            <div className="flex flex-col items-center md:items-start">
              <img 
                src="/ba-isotipo-192.webp" 
                alt="BA Consultorios Médicos" 
                width={192}
                height={131}
                loading="lazy"
                className="h-12 w-auto mb-3"
                referrerPolicy="no-referrer"
              />
              <span className="font-black text-lg tracking-tight uppercase text-white">
                BA Consultorios Médicos
              </span>
              <p className="text-xs text-[#F2C4D0] font-medium mt-1">
                Atención médica de alta calidad, rapidez real y aranceles particulares accesibles.
              </p>
            </div>

            {/* Right side: quick actions */}
            <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold">
              {NAV.map((link) => (
                <a key={link.href} href={link.href} className="hover:text-white transition-colors">{link.label}</a>
              ))}
              <a 
                href={BRAND_INFO.instagramUrl}
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => trackSocial("instagram_footer")}
                className="text-[#F2C4D0] hover:text-white transition-colors"
              >
                Instagram
              </a>
              <a 
                href={BRAND_INFO.facebookUrl}
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => trackSocial("facebook_footer")}
                className="text-[#F2C4D0] hover:text-white transition-colors"
              >
                Facebook
              </a>
              <a 
                href={BRAND_INFO.whatsappUrl}
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => trackWhatsApp("footer")}
                className="text-[#F2C4D0] hover:text-white transition-colors"
              >
                Escribinos por WhatsApp
              </a>
            </div>
          </div>

          {/* Bottom attribution and info */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-[11px] text-[#F8F6F4]/60 font-light">
            <div>
              &copy; {new Date().getFullYear()} BA Consultorios Médicos. Todos los derechos reservados. San Justo, Buenos Aires, Argentina.
            </div>
            <div className="flex gap-4">
              <span>Dirección: Almafuerte 3558, San Justo</span>
              <span>·</span>
              <span>WhatsApp: +54 9 11 6434-4822</span>
              <span>·</span>
              <span>Tel: 3970-1945</span>
            </div>
          </div>

        </div>
      </footer>

      {/* AGENDAPRO SELF-SERVICE BOOKING MODAL */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#2C2C2C]/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
            onClick={() => setIsBookingModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-3xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 bg-[#5C1A3D] text-white flex-shrink-0">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Reservá tu turno</h3>
                  <p className="text-[11px] text-[#F2C4D0] font-light mt-0.5">BA Consultorios Médicos · San Justo</p>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  aria-label="Cerrar"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                >
                  <span className="text-white text-lg leading-none">✕</span>
                </button>
              </div>
              <iframe
                src={BRAND_INFO.agendaProIframeSrc}
                title="Reserva de turnos online - BA Consultorios Médicos"
                className="w-full flex-1"
                style={{ border: "0" }}
                scrolling="yes"
              />
              <div className="px-5 py-3 bg-[#F8F6F4] border-t border-[#E8D5C4]/40 flex-shrink-0 text-center">
                <a
                  href={BRAND_INFO.whatsappUrl}
                  onClick={() => trackWhatsApp("modal_fallback")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#C2006B] font-semibold hover:underline"
                >
                  ¿Preferís coordinarlo por WhatsApp? Escribinos acá
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEWSLETTER SUBSCRIBE — modal en desktop, banner inferior en móvil */}
      <AnimatePresence>
        {showSubscribe && !isBookingModalOpen && (
          <>
            {/* Overlay solo desktop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismissSubscribe}
              className="hidden sm:block fixed inset-0 z-[55] bg-[#2C2C2C]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="fixed z-[56] bg-white shadow-2xl
                         bottom-0 left-0 right-0 rounded-t-2xl
                         sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                         sm:rounded-2xl sm:max-w-md sm:w-full"
            >
              <div className="relative p-6 sm:p-8">
                <button
                  onClick={dismissSubscribe}
                  aria-label="Cerrar"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                >
                  ✕
                </button>

                {subStatus === "sent" ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-extrabold text-lg text-[#5C1A3D]">¡Listo!</h3>
                    <p className="text-sm text-gray-500 font-light mt-1">Te vamos a escribir con información útil sobre controles y detección a tiempo.</p>
                  </div>
                ) : (
                  <>
                    <span className="text-[11px] font-bold tracking-widest uppercase text-[#C2006B]">GRATIS</span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#5C1A3D] mt-1 mb-2 leading-tight">
                      Recordatorios de controles por edad
                    </h3>
                    <p className="text-sm text-gray-500 font-light mb-5 leading-relaxed">
                      Dejanos tu mail y te enviamos guías simples sobre chequeos por edad, señales a las que prestar atención y novedades de BA. Sin costo.
                    </p>

                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <input aria-label="Tu nombre"
                        type="text"
                        required
                        placeholder="Tu nombre"
                        value={subForm.name}
                        onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C2006B] transition-colors"
                      />
                      <input aria-label="Tu email"
                        type="email"
                        required
                        placeholder="Tu email"
                        value={subForm.email}
                        onChange={(e) => setSubForm({ ...subForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C2006B] transition-colors"
                      />
                      <label className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={subForm.consent}
                          onChange={(e) => setSubForm({ ...subForm, consent: e.target.checked })}
                          className="mt-0.5 w-4 h-4 accent-[#C2006B] flex-shrink-0"
                        />
                        <span className="text-[11px] text-gray-500 font-light leading-relaxed">
                          Acepto recibir comunicaciones de BA Consultorios Médicos y el tratamiento de mis datos conforme a la Ley N.º 25.326. Puedo darme de baja cuando quiera.
                        </span>
                      </label>

                      {subStatus === "error" && (
                        <p className="text-xs text-red-500 font-medium">No pudimos registrarte. Probá de nuevo en unos minutos.</p>
                      )}

                      <button
                        type="submit"
                        disabled={subStatus === "sending"}
                        className="w-full bg-[#C2006B] hover:bg-[#a10058] disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {subStatus === "sending" ? "Enviando..." : "Quiero recibirlas"}
                      </button>
                      <button
                        type="button"
                        onClick={dismissSubscribe}
                        className="w-full text-[11px] text-gray-500 hover:text-gray-600 font-medium py-1 transition-colors cursor-pointer"
                      >
                        Ahora no
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FLOATING WHATSAPP BUTTON WITH BADGE */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
        <span className="bg-white text-[#5C1A3D] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg border border-green-200 opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap animate-pulse flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Reservá tu turno
        </span>
        <a 
          href={BRAND_INFO.whatsappUrl}
          onClick={() => trackWhatsApp("boton_flotante")}
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 duration-200 focus:outline-none"
          title="Contactar por WhatsApp"
        >
          {/* Custom vector SVG representation of WhatsApp icon */}
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.379 1.966 13.903 1.058 11.217 1.056 5.78 1.056 1.357 5.426 1.353 10.856c-.001 1.637.45 3.238 1.31 4.634l-.454 1.663 1.704-.447zM17.51 14.5c-.279-.14-1.647-.812-1.9-.905-.253-.092-.438-.138-.62.14-.182.279-.707.905-.866 1.087-.158.182-.317.203-.595.063-.278-.14-1.173-.432-2.235-1.38-.826-.738-1.384-1.65-1.547-1.93-.162-.279-.017-.43.12-.569.125-.125.279-.327.42-.49.139-.162.185-.279.279-.465.093-.186.046-.349-.023-.49-.07-.14-.62-1.5-.85-2.05-.223-.537-.447-.463-.62-.472-.158-.007-.34-.009-.522-.009-.182 0-.477.067-.727.34-.25.274-.954.933-.954 2.275 0 1.341.976 2.636 1.112 2.822.136.186 1.921 2.934 4.654 4.113.65.28 1.157.447 1.55.572.653.208 1.248.178 1.717.108.523-.078 1.648-.673 1.882-1.323.233-.65.233-1.208.163-1.323-.07-.116-.254-.186-.533-.326z"/>
          </svg>
        </a>
      </div>

    </div>
  );
}
