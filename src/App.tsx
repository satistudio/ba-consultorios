import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  Check, 
  Instagram, 
  Share2, 
  Sparkles, 
  HelpCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info,
  Heart,
  Flower2,
  Waves,
  Footprints,
  Baby,
  UserRound
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BRAND_INFO, SPECIALTIES, SERVICES_DATA, TEAM, INSTALLATION_PHOTOS, DERIVED_STUDIES, MedicalService } from "./data";

const normalizeText = (text: string): string => {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
    .toLowerCase()
    .trim();
};

const SYNONYMS: { [key: string]: string[] } = {
  "ped": ["pediatria", "pediatra", "pediatrico", "pediatrica", "infantil"],
  "pedi": ["pediatria", "pediatra", "pediatrico", "pediatrica", "infantil"],
  "pediatra": ["pediatria", "pediatrico", "pediatrica", "infantil"],
  "pediatria": ["pediatra", "pediatrico", "pediatrica", "infantil"],
  "infantil": ["pediatria", "pediatrico", "pediatrica", "pediatra"],
  "niño": ["pediatria", "pediatrico", "pediatrica", "pediatra", "infantil"],
  "niños": ["pediatria", "pediatrico", "pediatrica", "pediatra", "infantil"],
  
  "gineco": ["ginecologia", "ginecologica", "ginecologo", "ginecologa", "obstetricia", "pap", "colposcopia"],
  "ginecologia": ["gineco", "ginecologica", "ginecologo", "ginecologa", "obstetricia", "pap", "colposcopia"],
  "obs": ["obstetricia", "obstetra", "ginecologia", "embarazo"],
  "obstetricia": ["obs", "obstetra", "embarazo"],
  "embarazo": ["obstetricia", "obstetra", "ginecologia"],
  
  "cardio": ["cardiologia", "cardiologo", "electro", "electrocardiograma", "ergometria", "holter", "mapa"],
  "cardiologia": ["cardio", "cardiologo", "electro", "electrocardiograma", "ergometria", "holter", "mapa"],
  "electro": ["electrocardiograma", "ecg"],
  "ecg": ["electrocardiograma", "electro"],
  
  "eco": ["ecografia", "ecodoppler", "doppler", "ultrasonido"],
  "ecografia": ["eco", "ecodoppler", "doppler"],
  "doppler": ["eco", "ecodoppler", "ecografia"],
  
  "traumato": ["traumatologia", "traumatologo", "yeso", "infiltracion", "bloqueo"],
  "traumatologia": ["traumato", "traumatologo", "yeso", "infiltracion", "bloqueo"],
  
  "dermato": ["dermatologia", "dermatologo", "piel", "cutaneo", "verruga"],
  "dermatologia": ["dermato", "dermatologo", "piel", "cutaneo", "verruga"],
  
  "kine": ["kinesiologia", "kinesiologo", "sesion", "rehabilitacion"],
  "kinesiologia": ["kine", "kinesiologo", "sesion", "rehabilitacion"],
  
  "podo": ["podologia", "podologo", "pie", "pies", "uñas", "uñero"],
  "podologia": ["podo", "podologo", "pie", "pies", "uñas", "uñero"],
  "pie": ["podologia", "podologo"],
  "uñas": ["podologia", "podologo", "quiropodia"],
  
  "nutri": ["nutricion", "nutricionista", "dieta", "peso", "antropometria"],
  "nutricion": ["nutri", "nutricionista", "dieta", "peso", "antropometria"],

  "audiometria": ["audiologia", "oido", "lavado", "auditivo", "timpanometria", "impedanciometria", "logoaudiometria"],
  "audio": ["audiometria", "audiologia", "oido", "auditivo"]
};

const matchesSearchQuery = (serviceName: string, serviceSpecialty: string, query: string): boolean => {
  if (!query.trim()) return true;
  
  const normalizedName = normalizeText(serviceName);
  const normalizedSpecialty = normalizeText(serviceSpecialty);
  const queryTerms = normalizeText(query).split(/\s+/).filter(Boolean);
  
  return queryTerms.every(term => {
    // 1. Direct match
    if (normalizedName.includes(term) || normalizedSpecialty.includes(term)) {
      return true;
    }
    
    // 2. Synonym check for query term
    const synonyms = SYNONYMS[term] || [];
    for (const syn of synonyms) {
      if (normalizedName.includes(syn) || normalizedSpecialty.includes(syn)) {
        return true;
      }
    }
    
    // 3. Reverse synonym check: if any word in the target has a synonym matching the term
    const targetWords = [...normalizedName.split(/\s+/), ...normalizedSpecialty.split(/\s+/)].filter(Boolean);
    for (const word of targetWords) {
      const wordSynonyms = SYNONYMS[word] || [];
      if (wordSynonyms.some(syn => syn.includes(term) || term.includes(syn))) {
        return true;
      }
    }
    
    return false;
  });
};

export default function App() {
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");
  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [showAllByDefault, setShowAllByDefault] = useState(false);
  
  // Analytics: IDs cargados en tiempo de build desde variables de entorno de Cloudflare
  // (Pages > Settings > Environment variables). No son secretos, pero no van hardcodeados
  // en el repo para poder cambiarlos sin tocar código.
  const gtmId = import.meta.env.VITE_GTM_ID || "";
  const gaId = import.meta.env.VITE_GA_ID || "";
  const pixelId = import.meta.env.VITE_META_PIXEL_ID || "";

  // Active FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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
        trackConversion("Suscripción newsletter", "Lead");
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

  // Derived studies quick search (broad matching: every word must appear, ignoring accents/case)
  const [derivedQuery, setDerivedQuery] = useState("");
  const derivedResults = useMemo(() => {
    const q = normalizeText(derivedQuery.trim());
    if (q.length < 3) return [];
    const words = q.split(/\s+/);
    return DERIVED_STUDIES.filter((s) => {
      const haystack = normalizeText(`${s.category} ${s.name}`);
      return words.every((w) => haystack.includes(w));
    }).slice(0, 12);
  }, [derivedQuery]);

  // Orden médica: form state
  const [orderForm, setOrderForm] = useState({ name: "", email: "", phone: "", consent: false });
  const [orderFile, setOrderFile] = useState<File | null>(null);
  const [orderStatus, setOrderStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [orderErrorMsg, setOrderErrorMsg] = useState<string>("");

  const ORDER_MAX_BYTES = 10 * 1024 * 1024;
  const ORDER_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

  const handleOrderFileChange = (file: File | null) => {
    setOrderErrorMsg("");
    if (!file) {
      setOrderFile(null);
      return;
    }
    if (!ORDER_ALLOWED_TYPES.includes(file.type)) {
      setOrderErrorMsg("Formato no admitido. Subí una foto (JPG, PNG) o un PDF.");
      setOrderFile(null);
      return;
    }
    if (file.size > ORDER_MAX_BYTES) {
      setOrderErrorMsg("El archivo pesa demasiado (máximo 10MB).");
      setOrderFile(null);
      return;
    }
    setOrderFile(file);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderFile || !orderForm.name.trim() || !orderForm.email.trim() || !orderForm.phone.trim() || !orderForm.consent) {
      setOrderErrorMsg("Completá todos los campos, adjuntá la orden y aceptá el consentimiento.");
      return;
    }
    setOrderStatus("sending");
    setOrderErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("name", orderForm.name.trim());
      fd.append("email", orderForm.email.trim());
      fd.append("phone", orderForm.phone.trim());
      fd.append("consent", "true");
      fd.append("file", orderFile);

      const res = await fetch("/api/enviar-orden", { method: "POST", body: fd });
      const json = await res.json();

      if (json.ok) {
        setOrderStatus("sent");
        trackConversion("Orden médica enviada", "Lead");
        setOrderForm({ name: "", email: "", phone: "", consent: false });
        setOrderFile(null);
      } else {
        setOrderStatus("error");
        setOrderErrorMsg(
          json.detail
            ? `No pudimos enviar la orden (${json.detail}). Probá de nuevo o escribinos por WhatsApp.`
            : "No pudimos enviar la orden. Probá de nuevo o escribinos por WhatsApp."
        );
      }
    } catch {
      setOrderStatus("error");
      setOrderErrorMsg("No pudimos enviar la orden. Probá de nuevo o escribinos por WhatsApp.");
    }
  };

  // Real availability data (fetched from our own serverless proxy — never calls AgendaPro directly from the browser)
  type AvailabilityItem = { name: string; icon: string; service_id?: number; status: "today" | "tomorrow" | "soon" | "none" | "error"; count: number; firstTimes: string[]; dayLabel: string | null };
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

  // Load analytics scripts if configured
  useEffect(() => {
    // Inject GTM if present
    if (gtmId) {
      const gtmScript = document.createElement("script");
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      document.head.appendChild(gtmScript);
    }

    // Inject GA4 if present
    if (gaId) {
      const gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(gaScript);

      const gaConfigScript = document.createElement("script");
      gaConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(gaConfigScript);
    }

    // Inject Meta Pixel if present
    if (pixelId) {
      const pixelScript = document.createElement("script");
      pixelScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(pixelScript);
    }
  }, [gtmId, gaId, pixelId]);

  // Tracking Click Event helper (triggers standard events)
  const trackConversion = (serviceName: string, type: string) => {
    const win = window as any;
    // 1. GTM tracking
    if (win.dataLayer) {
      win.dataLayer.push({
        event: "whatsapp_click",
        service_name: serviceName,
        service_type: type
      });
    }

    // 2. Google Analytics tracking
    if (typeof win.gtag === "function") {
      win.gtag("event", "generate_lead", {
        event_category: "Engagement",
        event_label: serviceName,
        value: 1.0
      });
    }

    // 3. Meta Pixel tracking
    if (typeof win.fbq === "function") {
      win.fbq("track", "Lead", {
        content_name: serviceName,
        content_category: type
      });
    }

    console.log(`Conversion tracked for: ${serviceName} (${type})`);
  };

  // Opens the AgendaPro self-service booking modal, tracked as its own event
  // (kept separate from "whatsapp_click" so both channels can be measured independently)
  const openBookingModal = (origin: string) => {
    const win = window as any;
    if (win.dataLayer) {
      win.dataLayer.push({ event: "agendapro_booking_open", origin });
    }
    if (typeof win.gtag === "function") {
      win.gtag("event", "generate_lead", {
        event_category: "Engagement",
        event_label: `AgendaPro - ${origin}`,
        value: 1.0
      });
    }
    if (typeof win.fbq === "function") {
      win.fbq("track", "Lead", { content_name: `AgendaPro - ${origin}`, content_category: "Autogestión" });
    }
    setIsBookingModalOpen(true);
  };

  // Close booking modal on Escape key
  useEffect(() => {
    if (!isBookingModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsBookingModalOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isBookingModalOpen]);

  // Filter & Search Logic
  const filteredServices = useMemo(() => {
    return SERVICES_DATA.filter((service) => {
      // Search query match with smart loose concordances (accents-insensitive and synonyms/abbreviations support)
      const matchesSearch = matchesSearchQuery(service.name, service.specialty, searchQuery);

      // Specialty match
      const matchesSpecialty = 
        selectedSpecialty === "Todas" || 
        service.specialty === selectedSpecialty;

      // Type tag match
      const matchesType = 
        selectedType === "Todos" || 
        service.type === selectedType;

      return matchesSearch && matchesSpecialty && matchesType;
    });
  }, [searchQuery, selectedSpecialty, selectedType]);

  // Curated list of 6 main specialties/studies for preview in requested order
  const previewServices = useMemo(() => {
    const targets = [
      { spec: "Ginecología", nameContains: "consulta" },
      { spec: "Cardiología", id: "c-2" },
      { spec: "Pediatría", nameContains: "consulta" },
      { spec: "Ecografía", id: "e-1" },
      { spec: "Dermatología", nameContains: "consulta" },
      { spec: "Traumatología", nameContains: "consulta" }
    ];

    const results: MedicalService[] = [];
    for (const target of targets) {
      let found: MedicalService | undefined;
      if (target.id) {
        found = SERVICES_DATA.find(s => s.id === target.id);
      } else {
        found = SERVICES_DATA.find(s => 
          s.specialty.toLowerCase() === target.spec.toLowerCase() && 
          s.name.toLowerCase().includes(target.nameContains || "")
        );
      }
      
      if (found) {
        results.push(found);
      } else {
        // Fallback: search by specialty or name contains
        const fallback = SERVICES_DATA.find(s => 
          s.specialty.toLowerCase() === target.spec.toLowerCase() ||
          s.name.toLowerCase().includes(target.spec.toLowerCase())
        );
        if (fallback) results.push(fallback);
      }
    }
    return results;
  }, []);

  const displayedServices = useMemo(() => {
    const isSearchingOrFiltering = searchQuery !== "" || selectedSpecialty !== "Todas" || selectedType !== "Todos";
    if (isSearchingOrFiltering) {
      return filteredServices;
    }
    if (showAllByDefault) {
      return SERVICES_DATA;
    }
    return previewServices;
  }, [filteredServices, previewServices, showAllByDefault, searchQuery, selectedSpecialty, selectedType]);

  // Group specialties available in service list for selector
  const availableSpecialties = useMemo(() => {
    const list = Array.from(new Set(SERVICES_DATA.map(s => s.specialty)));
    return ["Todas", ...list.sort()];
  }, []);

  return (
    <div className="min-h-screen font-sans bg-[#F8F6F4] text-[#1e1b1d] antialiased selection:bg-[#F2C4D0] selection:text-[#5C1A3D]">
      
      {/* TOP ANNOUNCEMENT BAR */}
      <div id="top-bar" className="bg-[#5C1A3D] text-white py-2 px-4 text-center text-xs md:text-sm font-semibold tracking-wide border-b border-[#C2006B]/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-1 md:gap-4">
          <span>📅 Turnos para hoy o mañana — rapidez real, sin esperas.</span>
          <span className="hidden md:inline-block text-[#F2C4D0]">|</span>
          <a 
            href={BRAND_INFO.whatsappUrl}
            onClick={() => trackConversion("Top Bar Announcement", "CTA")}
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:text-[#F2C4D0] transition-colors"
          >
            Pedí tu turno hoy mismo por WhatsApp →
          </a>
        </div>
      </div>

      {/* HEADER / NAVIGATION */}
      <header
        id="main-header"
        className="sticky top-0 z-40 backdrop-blur-xl bg-gradient-to-b from-white via-white to-[#F8F6F4]/90 border-b border-[#E8D5C4]/60 shadow-[0_4px_24px_-8px_rgba(92,26,61,0.12)]"
      >
        {/* Hairline de marca */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#5C1A3D] via-[#C2006B] to-[#F2C4D0]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center gap-4">
          {/* Logo */}
          <a href="#" className="flex items-center group flex-shrink-0">
            <img 
              src="/ba-isotipo.png" 
              alt="BA Consultorios Médicos" 
              className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </a>

          {/* Nav Menu */}
          <nav className="hidden lg:flex items-center gap-1 text-[13px] font-medium">
            {[
              { href: "#propuesta", label: "Propuesta" },
              { href: "#directorio", label: "Especialidades" },
              { href: "#equipo", label: "Equipo" },
              { href: "#reserva-online", label: "Reservar online" },
              { href: "#subir-orden", label: "Subir orden" },
              { href: "#sumate", label: "Sumate a BA" },
              { href: "#testimonios", label: "Opiniones" },
              { href: "#contacto", label: "Contacto" }
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-full text-gray-600 hover:text-[#5C1A3D] hover:bg-[#F2C4D0]/30 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social + CTA */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Redes */}
            <div className="hidden sm:flex items-center gap-1.5">
              <a
                href={BRAND_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de BA Consultorios Médicos"
                onClick={() => trackConversion("Header Instagram", "Social")}
                className="w-9 h-9 rounded-full border border-[#E8D5C4] bg-white hover:bg-[#C2006B] hover:border-[#C2006B] text-[#5C1A3D] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={BRAND_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de BA Consultorios Médicos"
                onClick={() => trackConversion("Header Facebook", "Social")}
                className="w-9 h-9 rounded-full border border-[#E8D5C4] bg-white hover:bg-[#C2006B] hover:border-[#C2006B] text-[#5C1A3D] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm font-black text-sm leading-none"
              >
                f
              </a>
              <a
                href={BRAND_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp de BA Consultorios Médicos"
                onClick={() => trackConversion("Header WhatsApp", "CTA")}
                className="w-9 h-9 rounded-full border border-[#E8D5C4] bg-white hover:bg-green-500 hover:border-green-500 text-[#5C1A3D] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={() => openBookingModal("Header")}
              className="relative bg-gradient-to-br from-[#C2006B] to-[#a10058] hover:from-[#a10058] hover:to-[#8a0049] text-white px-4 md:px-6 py-2.5 rounded-full text-[11px] md:text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-[#C2006B]/25 hover:shadow-xl hover:shadow-[#C2006B]/35 cursor-pointer whitespace-nowrap"
            >
              Reservá tu turno
            </button>
          </div>
        </div>
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
              MÁS DE 30 ESPECIALIDADES.<br />
              <span className="text-[#F2C4D0]">TURNOS HOY O MAÑANA.</span><br />
              RAPIDEZ REAL.
            </h1>
            
            <p className="text-lg md:text-xl text-[#F8F6F4]/90 font-light leading-relaxed max-w-2xl mb-8">
              En <strong className="font-semibold text-white">BA Consultorios Médicos</strong> resolvemos tu salud de forma directa y profesional. Sin las esperas eternas del sistema tradicional. Escribinos ahora y programamos tu consulta o estudio de inmediato.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => openBookingModal("Hero Primary")}
                className="bg-[#C2006B] hover:bg-[#a10058] text-white px-8 py-4 rounded-full text-sm md:text-base font-bold tracking-wider uppercase text-center transition-all duration-300 shadow-xl shadow-[#C2006B]/30 flex items-center justify-center gap-3 group cursor-pointer"
              >
                Pedí tu turno hoy mismo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#directorio" 
                className="border-2 border-white/20 hover:border-white/60 text-white hover:bg-white/5 px-8 py-4 rounded-full text-sm md:text-base font-bold tracking-wider uppercase text-center transition-colors flex items-center justify-center gap-2"
              >
                Ver estudios y especialidades
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

          {/* Hero Right: Live Interactive Scheduling Simulator */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white text-[#1e1b1d] rounded-2xl p-6 shadow-2xl border border-[#E8D5C4]/30 relative"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Disponibilidad de Turnos</span>
                </div>
                <span className="text-xs font-medium text-[#5C1A3D] bg-[#F2C4D0] px-2 py-1 rounded">Esta semana</span>
              </div>

              <h3 className="font-bold text-lg text-[#5C1A3D] mb-4">Especialidades con turnos inmediatos:</h3>
              
              <div className="space-y-2.5 mb-6">
                {availabilityStatus === "loading" && (
                  <>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-[#F8F6F4] border border-gray-100 animate-pulse" />
                    ))}
                  </>
                )}

                {availabilityStatus === "ok" && availability?.map((item, idx) => {
                  const nameLower = item.name.toLowerCase();
                  const Icon = nameLower.includes("cardio")
                    ? Heart
                    : nameLower.includes("pap") || nameLower.includes("colpo")
                    ? Flower2
                    : nameLower.includes("ecograf")
                    ? Waves
                    : nameLower.includes("podo")
                    ? Footprints
                    : nameLower.includes("pediatr")
                    ? Baby
                    : Sparkles;

                  const statusConfig: Record<AvailabilityItem["status"], { label: string; dot: string; text: string; bg: string }> = {
                    today: item.count <= 2
                      ? { label: `¡Último${item.count === 1 ? "" : "s"} ${item.count} turno${item.count === 1 ? "" : "s"} hoy!`, dot: "bg-[#C2006B]", text: "text-[#C2006B]", bg: "bg-[#C2006B]/10" }
                      : { label: `${item.count} turnos hoy`, dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
                    tomorrow: { label: "Turnos mañana", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
                    soon: { label: item.dayLabel ? `Turnos el ${item.dayLabel}` : "Turnos esta semana", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
                    none: { label: "Consultar próxima fecha", dot: "bg-gray-300", text: "text-gray-500", bg: "bg-gray-50" },
                    error: { label: "Consultar disponibilidad", dot: "bg-gray-300", text: "text-gray-500", bg: "bg-gray-50" }
                  };
                  const cfg = statusConfig[item.status];

                  return (
                    <a
                      key={idx}
                      href={item.service_id
                        ? `https://baconsultorios.site.agendapro.com/ar/sucursal/9099?services_id=${item.service_id}`
                        : BRAND_INFO.agendaProUrl}
                      onClick={() => trackConversion(`Card especialidad - ${item.name}`, "Reserva directa")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 bg-white p-2.5 pr-3 rounded-xl border border-gray-100 hover:border-[#C2006B]/25 hover:shadow-[0_2px_12px_-4px_rgba(194,0,107,0.15)] transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-[#F2C4D0]/40 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F2C4D0]/70 transition-colors">
                          <Icon className="w-4 h-4 text-[#5C1A3D]" strokeWidth={2.25} />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-800 truncate">{item.name}</span>
                          {item.firstTimes?.length > 0 && (item.status === "today" || item.status === "tomorrow" || item.status === "soon") ? (
                            <span className="block text-[10px] text-gray-400 font-medium truncate">
                              🕐 {item.firstTimes.join(" · ")}{item.count > item.firstTimes.length ? " y más" : ""}
                            </span>
                          ) : (
                            <span className="block text-[10px] text-[#C2006B]/70 font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                              Reservar este servicio →
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 text-[11px] font-bold ${cfg.text} ${cfg.bg} pl-2 pr-2.5 py-1.5 rounded-full flex-shrink-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </a>
                  );
                })}

                {(availabilityStatus === "not_configured" || availabilityStatus === "error") && (
                  <div className="bg-[#F8F6F4] p-4 rounded-lg border border-gray-100 text-center">
                    <p className="text-sm font-semibold text-gray-700">Turnos para hoy y mañana en la mayoría de las especialidades.</p>
                    <p className="text-xs text-gray-400 font-light mt-1">Consultá la agenda actualizada al reservar.</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => openBookingModal("Simulator")}
                className="block w-full bg-[#5C1A3D] hover:bg-[#44122d] text-white text-center py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                📅 Reservar Turno al Instante
              </button>

              <p className="text-center text-[11px] text-gray-400 mt-3">
                Elegí día y horario vos mismo. ¿Preferís coordinar por WhatsApp?{" "}
                <a
                  href={BRAND_INFO.whatsappUrl}
                  onClick={() => trackConversion("Simulator WhatsApp Link", "CTA")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C2006B] font-semibold hover:underline"
                >
                  Escribinos
                </a>
                .
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROPUESTA DE VALOR / ESENCIA */}
      <section id="propuesta" className="py-20 bg-[#F8F6F4] border-b border-[#E8D5C4]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Brand Propósito Callout in DM Serif Italic */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <span className="text-sm font-bold uppercase tracking-widest text-[#C2006B] mb-2 block">NUESTRO PROPÓSITO</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-[#5C1A3D] leading-snug">
              "Acercar una atención médica de calidad, rápida y accesible a San Justo y alrededores."
            </h2>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                title: "Turnos hoy o mañana",
                desc: "Rapidez real, no prometida. Programamos tus consultas y estudios en un máximo de 24-48 horas hábiles.",
                color: "border-l-4 border-[#C2006B] bg-white",
                badge: "Rapidez"
              },
              {
                title: "+30 Especialidades",
                desc: "Todo tu cuidado médico en un mismo lugar. Desde clínica y cardiología hasta podología, cosmiatría y pediatría.",
                color: "border-l-4 border-[#5C1A3D] bg-white",
                badge: "Integral"
              },
              {
                title: "Atención Particular",
                desc: "Aranceles particulares accesibles. Excelente opción de salud privada de calidad sin necesidad de contar con obra social.",
                color: "border-l-4 border-[#E8D5C4] bg-white",
                badge: "Accesible"
              },
              {
                title: "Respuesta Inmediata",
                desc: "Chateá directamente con nuestro equipo por WhatsApp. Respondemos al instante para coordinar tu visita.",
                color: "border-l-4 border-[#F2C4D0] bg-white",
                badge: "Directo"
              }
            ].map((pillar, idx) => (
              <div 
                key={idx} 
                className={`p-6 rounded-xl shadow-sm border border-gray-100 ${pillar.color} hover:shadow-md transition-shadow flex flex-col justify-between`}
              >
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {pillar.badge}
                  </span>
                  <h3 className="font-extrabold text-lg text-[#5C1A3D] mt-4 mb-3">{pillar.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed font-light">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Brand golden rule banner */}
          <div className="bg-[#E8D5C4]/30 border border-[#E8D5C4] rounded-2xl p-6 mt-16 max-w-4xl mx-auto flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div className="flex gap-4 items-start text-left">
              <span className="text-3xl">🤝</span>
              <div>
                <h4 className="font-bold text-[#5C1A3D]">El trato que te merecés</h4>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-light mt-1">
                  En BA Consultorios Médicos, demostramos la calidez y el respeto humano en cada turno, en cada respuesta por WhatsApp y en cada consulta profesional. Sin vueltas.
                </p>
              </div>
            </div>
            <a 
              href={BRAND_INFO.whatsappUrl}
              onClick={() => trackConversion("Golden Rule Banner", "CTA")}
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#5C1A3D] hover:bg-[#44122d] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors"
            >
              Comprobar el servicio
            </a>
          </div>

        </div>
      </section>

      {/* SEARCHABLE DIRECTORY: ESPECIALIDADES Y ESTUDIOS (Core Directory) */}
      <section id="directorio" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-[#C2006B] bg-[#C2006B]/5 px-3 py-1 rounded-full border border-[#C2006B]/10">
              Listado Comercial de Servicios
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#5C1A3D] mt-4 mb-3">
              Especialidades, Estudios y Prácticas
            </h2>
            <p className="text-sm md:text-base text-gray-600 font-light">
              Buscá tu estudio o especialidad, verificá la etiqueta comercial de realización y consultá el turno directamente por WhatsApp con un solo clic.
            </p>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-[#F8F6F4] rounded-2xl p-6 mb-8 border border-[#E8D5C4]/40 shadow-sm max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Search input */}
              <div className="md:col-span-5 relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Buscar por Estudio o Especialidad
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Ej. Electrocardiograma, Ecografía, PAP, Podología..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white pl-11 pr-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-[#C2006B] focus:ring-1 focus:ring-[#C2006B] transition-all font-medium placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Specialty dropdown */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Filtrar por Área Médica
                </label>
                <div className="relative">
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-[#C2006B] focus:ring-1 focus:ring-[#C2006B] transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="Todas">Todas las áreas ({SPECIALTIES.length})</option>
                    {availableSpecialties.filter(s => s !== "Todas").map((spec, idx) => (
                      <option key={idx} value={spec}>{spec}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {/* Tag/Type filter */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Etiqueta Comercial
                </label>
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-white px-4 py-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-[#C2006B] focus:ring-1 focus:ring-[#C2006B] transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="Todos">Todas las etiquetas</option>
                    <option value="Consulta">Consulta médica</option>
                    <option value="Estudio realizado en BA">Estudio realizado en BA</option>
                    <option value="Práctica o procedimiento">Práctica o procedimiento</option>
                    <option value="Estudio derivado">Estudio derivado (externo)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Quick buttons filter */}
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-gray-200/60">
              <span className="text-xs font-bold uppercase text-gray-400 mr-2">Filtros rápidos:</span>
              {[
                { label: "Ver Todos", val: "Todos" },
                { label: "Consultas", val: "Consulta" },
                { label: "Estudios en BA", val: "Estudio realizado en BA" },
                { label: "Prácticas o Procedimientos", val: "Práctica o procedimiento" },
                { label: "Estudios Derivados", val: "Estudio derivado" }
              ].map((btn, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedType(btn.val)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    selectedType === btn.val
                      ? "bg-[#5C1A3D] text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE FILTER DISPLAY INFO */}
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 text-xs text-gray-500 font-medium px-2">
            <div>
              {searchQuery || selectedSpecialty !== "Todas" || selectedType !== "Todos" ? (
                <>
                  Encontrados <span className="text-[#5C1A3D] font-bold">{displayedServices.length}</span> servicios 
                  {selectedSpecialty !== "Todas" && ` en ${selectedSpecialty}`}
                  {selectedType !== "Todos" && ` con etiqueta "${selectedType}"`}
                </>
              ) : showAllByDefault ? (
                <>
                  Mostrando la cartilla completa de <span className="text-[#5C1A3D] font-bold">{displayedServices.length}</span> servicios
                </>
              ) : (
                <div className="flex items-center gap-2 flex-wrap text-left">
                  <span className="bg-[#5C1A3D]/10 text-[#5C1A3D] font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase">Previsualización</span>
                  <span>Mostrando las 6 especialidades y estudios principales. Buscá o filtrá para ver la lista completa.</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {!(searchQuery || selectedSpecialty !== "Todas" || selectedType !== "Todos") && (
                <button
                  onClick={() => setShowAllByDefault(!showAllByDefault)}
                  className="text-[#C2006B] hover:text-[#a10058] font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-[#C2006B]/20 bg-[#C2006B]/5 hover:bg-[#C2006B]/10 px-3 py-1.5 rounded-lg active:scale-95"
                >
                  {showAllByDefault ? "Ver solo previsualización" : "Ver cartilla completa (+100)"}
                </button>
              )}

              {(searchQuery || selectedSpecialty !== "Todas" || selectedType !== "Todos") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSpecialty("Todas");
                    setSelectedType("Todos");
                    setShowAllByDefault(false);
                  }}
                  className="text-[#C2006B] hover:underline cursor-pointer font-bold"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* DIRECTORY LISTING */}
          <div className="max-w-6xl mx-auto">
            {displayedServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {displayedServices.map((service) => {
                    // Tag color styling helper
                    let tagStyle = "";
                    let tagLabel = service.type;
                    
                    if (service.type === "Consulta") {
                      tagStyle = "bg-[#E8D5C4]/40 text-[#5C1A3D] border border-[#E8D5C4]";
                    } else if (service.type === "Estudio realizado en BA") {
                      tagStyle = "bg-[#C2006B]/10 text-[#C2006B] border border-[#C2006B]/20";
                    } else if (service.type === "Práctica o procedimiento") {
                      tagStyle = "bg-[#F2C4D0]/40 text-[#5C1A3D] border border-[#F2C4D0]";
                    } else if (service.type === "Estudio derivado") {
                      tagStyle = "bg-gray-100 text-gray-500 border border-gray-300/60";
                    }

                    // Build dynamic WhatsApp text
                    const waText = encodeURIComponent(
                      `Hola BA Consultorios Médicos. Quisiera solicitar un turno para la práctica o consulta: "${service.name}" (Especialidad: ${service.specialty}). (Vengo de la web)`
                    );
                    const serviceWaUrl = `https://wa.me/5491164344822?text=${waText}`;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={service.id}
                        className="bg-white rounded-xl p-5 border border-[#E8D5C4]/30 hover:border-[#C2006B]/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Card tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded">
                              {service.specialty}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${tagStyle}`}>
                              {tagLabel}
                            </span>
                          </div>

                          {/* Card name */}
                          <h3 className="font-bold text-base text-[#5C1A3D] mb-2 leading-snug">
                            {service.name}
                          </h3>

                          {service.details && (
                            <p className="text-xs text-gray-500 leading-relaxed font-light mb-4 flex gap-1.5 bg-[#F8F6F4] p-2.5 rounded-lg border border-gray-100">
                              <Info className="w-3.5 h-3.5 text-[#5C1A3D] flex-shrink-0 mt-0.5" />
                              <span>{service.details}</span>
                            </p>
                          )}
                        </div>

                        {/* Card CTA */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-gray-400">Atención particular</span>
                          <a
                            href={serviceWaUrl}
                            onClick={() => trackConversion(service.name, service.type)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#5C1A3D] hover:bg-[#C2006B] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 group cursor-pointer"
                          >
                            Pedir Turno
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-16 bg-[#F8F6F4] rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium text-lg">No encontramos estudios o consultas con ese nombre.</p>
                <p className="text-gray-400 text-sm font-light mt-1">Intentá escribir otras palabras clave o elegí otra área médica.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSpecialty("Todas");
                    setSelectedType("Todos");
                  }}
                  className="mt-4 bg-[#5C1A3D] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg cursor-pointer"
                >
                  Restablecer búsqueda
                </button>
              </div>
            )}
          </div>

          {/* Externally managed studies notice + quick search */}
          <div className="bg-[#5C1A3D] text-white rounded-2xl p-8 mt-12 max-w-4xl mx-auto shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#C2006B]/15 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="text-4xl">🔬</div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg mb-1 text-[#F2C4D0]">Estudios Externos de Alta Complejidad</h3>
                <p className="text-sm font-light leading-relaxed text-[#F8F6F4]/90">
                  En BA Consultorios gestionamos las derivaciones para estudios complejos como <strong>Resonancia magnética, Tomografía computada y Densitometría ósea</strong> en centros de diagnóstico de confianza, con aranceles preferenciales para nuestros pacientes.
                </p>
              </div>
              <a
                href="https://wa.me/5491164344822?text=Hola!%20Quiero%20consultar%20por%20un%20estudio%20derivado%20(resonancia,%20tomografía,%20densitometría).%20(Vengo%20de%20la%20web)"
                onClick={() => trackConversion("Estudios Externos", "Estudio derivado")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-[#F2C4D0] text-[#5C1A3D] px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors shadow-lg"
              >
                Consultar derivación
              </a>
            </div>

            {/* Quick derived-studies search */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#F2C4D0] mb-2">
                ¿Tenés una orden para un estudio? Fijate si lo gestionamos:
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C1A3D]/50" />
                <input
                  type="text"
                  value={derivedQuery}
                  onChange={(e) => setDerivedQuery(e.target.value)}
                  placeholder="Ej: resonancia rodilla, tomografía tórax, densitometría..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-[#2C2C2C] bg-white focus:outline-none focus:ring-2 focus:ring-[#C2006B]"
                />
              </div>

              {derivedQuery.trim().length >= 3 && (
                <div className="mt-3">
                  {derivedResults.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {derivedResults.map((s, idx) => (
                          <a
                            key={idx}
                            href={`https://wa.me/5491164344822?text=${encodeURIComponent(`Hola BA! Quiero consultar por la derivación del estudio: "${s.name}" (${s.category}). (Vengo de la web)`)}`}
                            onClick={() => trackConversion(`Derivación - ${s.name}`, "Estudio derivado")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3.5 py-2.5 transition-colors group"
                          >
                            <div className="min-w-0">
                              <span className="block text-sm font-semibold truncate">{s.name}</span>
                              <span className="block text-[10px] text-[#F2C4D0] uppercase tracking-wider">{s.category}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 flex-shrink-0 text-[#F2C4D0] group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#F8F6F4]/60 font-light mt-2">Tocá el estudio para consultar disponibilidad y arancel por WhatsApp.</p>
                    </>
                  ) : (
                    <div className="bg-white/10 rounded-lg px-4 py-3 text-sm font-light">
                      No lo encontramos con ese nombre — igual consultanos por{" "}
                      <a
                        href={`https://wa.me/5491164344822?text=${encodeURIComponent(`Hola BA! Tengo una orden para "${derivedQuery.trim()}" y quiero saber si gestionan la derivación. (Vengo de la web)`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[#F2C4D0] underline"
                      >
                        WhatsApp
                      </a>{" "}
                      que lo verificamos al instante.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* OUR TEAM */}
      <section id="equipo" className="py-20 bg-white scroll-mt-20 border-t border-[#E8D5C4]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-[#C2006B]">NUESTRO EQUIPO</span>
            <h2 className="text-3xl font-extrabold text-[#5C1A3D] mt-2 mb-3">Las personas detrás de BA</h2>
            <p className="text-sm text-gray-500 font-light max-w-xl mx-auto">
              Vamos sumando a los profesionales de nuestro equipo, uno por uno.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div 
                key={member.id} 
                className="bg-[#F8F6F4] rounded-2xl overflow-hidden border border-[#E8D5C4]/40 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-[4/5] overflow-hidden bg-[#F2C4D0]/30">
                  <img 
                    src={member.photoUrl} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-sm text-[#5C1A3D]">{member.name}</h3>
                  <span className="inline-block text-[10px] font-bold text-[#C2006B] bg-[#C2006B]/5 border border-[#C2006B]/10 rounded-full px-2 py-0.5 mt-1.5 mb-3">
                    {member.specialty}
                  </span>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">{member.bioLine}</p>
                </div>
              </div>
            ))}

            {Array.from({ length: Math.max(0, 4 - TEAM.length) }).map((_, i) => (
              <div 
                key={`soon-${i}`} 
                className="rounded-2xl border-2 border-dashed border-[#E8D5C4] flex flex-col items-center justify-center text-center p-6 min-h-[280px]"
              >
                <div className="w-12 h-12 rounded-full bg-[#F2C4D0]/30 flex items-center justify-center mb-3">
                  <UserRound className="w-5 h-5 text-[#C2006B]/60" strokeWidth={1.75} />
                </div>
                <p className="text-xs text-gray-400 font-medium">Sumando más profesionales del equipo</p>
              </div>
            ))}
          </div>
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
                        <p className="text-[10px] text-gray-400 font-medium">
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
                  className="text-xs text-gray-400 hover:text-[#C2006B] font-medium transition-colors"
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
                a: "No, la atención en BA Consultorios Médicos es exclusivamente particular. Esto nos permite mantener aranceles altamente accesibles, eliminar los extensos plazos de espera de los sistemas de obras sociales y garantizar turnos casi de inmediato (para hoy o mañana)."
              },
              {
                q: "¿Cómo solicito un turno y en cuánto tiempo me responden?",
                a: "La solicitud de turnos se realiza íntegramente por WhatsApp haciendo clic en cualquier botón de la web. Nuestro equipo de recepción responde casi de inmediato dentro de nuestros horarios de atención para coordinar tu día y hora de visita en el acto."
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
                a: "Estudios como el Electrocardiograma o ecografías estándar se entregan con informe oficial en formato digital por WhatsApp en un plazo de 24 a 48 horas hábiles, o impresos si así lo solicitás al momento de la realización."
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

      {/* ONLINE SELF-SERVICE BOOKING (AgendaPro embed) */}
      <section id="reserva-online" className="py-20 bg-white scroll-mt-20 border-t border-[#E8D5C4]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold tracking-widest uppercase text-[#C2006B]">RESERVÁ ONLINE</span>
            <h2 className="text-3xl font-extrabold text-[#5C1A3D] mt-2 mb-3">Elegí tu turno vos mismo</h2>
            <p className="text-sm text-gray-500 font-light max-w-xl mx-auto">
              Buscá especialidad, día y horario disponible y confirmá al instante. Si tu consulta es sobre un estudio puntual o tenés dudas antes de reservar, seguimos disponibles por WhatsApp.
            </p>
          </div>

          <div className="bg-[#F8F6F4] rounded-2xl p-3 md:p-4 border border-[#E8D5C4]/40 shadow-sm">
            <iframe
              src={BRAND_INFO.agendaProIframeSrc}
              title="Reserva de turnos online - BA Consultorios Médicos"
              className="w-full h-[650px] md:h-[780px] rounded-xl bg-white"
              style={{ border: "0" }}
              scrolling="yes"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 text-sm">
            <span className="text-gray-400 font-light">¿No ves lo que buscás acá?</span>
            <a
              href={BRAND_INFO.whatsappUrl}
              onClick={() => trackConversion("Reserva Online - WhatsApp fallback", "CTA")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C2006B] font-bold hover:underline"
            >
              Coordinalo por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* UPLOAD MEDICAL ORDER */}
      <section id="subir-orden" className="py-20 bg-[#F8F6F4] scroll-mt-20 border-t border-[#E8D5C4]/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold tracking-widest uppercase text-[#C2006B]">¿NO ENTENDÉS TU ORDEN MÉDICA?</span>
            <h2 className="text-3xl font-extrabold text-[#5C1A3D] mt-2 mb-3">Subila y nosotros te ayudamos</h2>
            <p className="text-sm text-gray-500 font-light max-w-lg mx-auto">
              Si tenés una orden y no sabés qué estudio o especialidad buscar, mandanosla junto con tus datos. El equipo de BA se contacta con vos para orientarte.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8D5C4]/40 shadow-sm">
            {orderStatus === "sent" ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-lg text-[#5C1A3D] mb-1">¡Listo, la recibimos!</h3>
                <p className="text-sm text-gray-500 font-light">El equipo de BA se va a contactar con vos a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Nombre y apellido</label>
                    <input
                      type="text"
                      required
                      value={orderForm.name}
                      onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C2006B] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Celular</label>
                    <input
                      type="tel"
                      required
                      value={orderForm.phone}
                      onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C2006B] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={orderForm.email}
                    onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C2006B] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Foto o PDF de la orden</label>
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#E8D5C4] hover:border-[#C2006B]/40 rounded-lg py-6 cursor-pointer transition-colors text-center">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                      className="hidden"
                      onChange={(e) => handleOrderFileChange(e.target.files?.[0] ?? null)}
                    />
                    {orderFile ? (
                      <span className="text-sm font-semibold text-[#5C1A3D]">📎 {orderFile.name}</span>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Tocá para elegir una foto o PDF (máx. 10MB)</span>
                    )}
                  </label>
                </div>

                <label className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    checked={orderForm.consent}
                    onChange={(e) => setOrderForm({ ...orderForm, consent: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-[#C2006B] flex-shrink-0"
                  />
                  <span className="text-[11px] text-gray-500 font-light leading-relaxed">
                    Acepto que BA Consultorios Médicos utilice los datos y el documento que envío exclusivamente para contactarme respecto a este estudio, conforme a la Ley de Protección de Datos Personales N.º 25.326.
                  </span>
                </label>

                {orderErrorMsg && <p className="text-xs text-red-500 font-medium">{orderErrorMsg}</p>}

                <button
                  type="submit"
                  disabled={orderStatus === "sending"}
                  className="w-full bg-[#C2006B] hover:bg-[#a10058] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-colors cursor-pointer"
                >
                  {orderStatus === "sending" ? "Enviando..." : "Enviar orden médica"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CONTACT, TIMETABLE & MAP */}
      <section id="contacto" className="py-20 bg-[#F8F6F4] scroll-mt-20 border-t border-[#E8D5C4]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact info */}
            <div className="lg:col-span-5 text-left flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#C2006B]">UBICACIÓN Y ATENCIÓN</span>
                <h2 className="text-3xl font-extrabold text-[#5C1A3D] mt-2 mb-6">¿Dónde encontrarnos?</h2>
                
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#5C1A3D]/10 text-[#5C1A3D] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#5C1A3D]">Dirección</h4>
                      <a
                        href="https://maps.google.com/?q=BA+Consultorios+Médicos,+Almafuerte+3558,+San+Justo,+La+Matanza"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackConversion("Contacto - Dirección Maps", "CTA")}
                        className="block text-sm text-gray-600 font-light mt-0.5 hover:text-[#C2006B] hover:underline transition-colors"
                      >
                        {BRAND_INFO.address}
                      </a>
                      <p className="text-xs text-[#C2006B] font-semibold mt-1">San Justo, Provincia de Buenos Aires (La Matanza)</p>
                    </div>
                  </div>

                  {/* Timetable */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#5C1A3D]/10 text-[#5C1A3D] flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#5C1A3D]">Horarios de Atención</h4>
                      <p className="text-sm text-gray-600 font-light mt-0.5">{BRAND_INFO.schedule}</p>
                      <p className="text-xs text-gray-400 font-light mt-1">Coordinación de turnos online las 24 hs por WhatsApp.</p>
                    </div>
                  </div>

                  {/* Phone & Contacts */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#5C1A3D]/10 text-[#5C1A3D] flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#5C1A3D]">Teléfono Directo</h4>
                      <a
                        href="tel:+541139701945"
                        className="block text-sm text-gray-600 font-bold mt-0.5 hover:text-[#C2006B] transition-colors"
                      >
                        Tel: {BRAND_INFO.phone}
                      </a>
                      <a
                        href={BRAND_INFO.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackConversion("Contacto - WhatsApp", "CTA")}
                        className="block text-sm text-green-600 font-bold mt-0.5 hover:underline"
                      >
                        WhatsApp: {BRAND_INFO.whatsapp}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="mt-8 pt-8 border-t border-[#E8D5C4]/60">
                <h4 className="font-bold text-sm text-[#5C1A3D] mb-3">Seguinos en redes</h4>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href={BRAND_INFO.instagramUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-white hover:bg-[#F2C4D0]/40 text-[#5C1A3D] border border-gray-200 hover:border-[#5C1A3D]/40 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-[#C2006B]" />
                    <span>{BRAND_INFO.instagramHandle}</span>
                  </a>
                  <a 
                    href={BRAND_INFO.facebookUrl}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 bg-white hover:bg-[#F2C4D0]/40 text-[#5C1A3D] border border-gray-200 hover:border-[#5C1A3D]/40 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#C2006B] text-white flex items-center justify-center text-[10px] font-black leading-none">f</span>
                    <span>BA Consultorios Médicos</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Simulated Interactive Google Maps Frame */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl p-4 border border-[#E8D5C4]/40 shadow-sm relative overflow-hidden h-96 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <span>📍 MAPA DE ACCESO (Almafuerte 3558, San Justo)</span>
                  <a 
                    href="https://maps.google.com/?q=Almafuerte+3558,+San+Justo,+La+Matanza"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C2006B] hover:underline flex items-center gap-1"
                  >
                    Abrir en Google Maps <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex-1 rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3280.9430887002068!2d-58.5548508!3d-34.6813858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcc7e7a188c227%3A0x2b693e1d88229b3!2sBA%20Consultorios%20M%C3%A9dicos%20-%20Cl%C3%ADnica%20de%20Especialidades%20en%20San%20Justo!5e0!3m2!1ses-419!2sar!4v1784852093873!5m2!1ses-419!2sar"
                    title="Ubicación de BA Consultorios Médicos en San Justo"
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* JOIN BA — professionals & health providers */}
      <section id="sumate" className="py-20 bg-white scroll-mt-20 border-t border-[#E8D5C4]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-[#C2006B]">SUMATE A BA</span>
            <h2 className="text-3xl font-extrabold text-[#5C1A3D] mt-2 mb-3">¿Trabajamos juntos?</h2>
            <p className="text-sm text-gray-500 font-light max-w-xl mx-auto">
              BA crece con profesionales y aliados que comparten nuestra forma de atender: rapidez real y calidad para la comunidad de Zona Oeste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Professionals card */}
            <div className="bg-[#F8F6F4] rounded-2xl p-8 border border-[#E8D5C4]/40 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-[#5C1A3D] flex items-center justify-center mb-5">
                <UserRound className="w-6 h-6 text-[#F2C4D0]" strokeWidth={2} />
              </div>
              <h3 className="font-extrabold text-lg text-[#5C1A3D] mb-2">Soy profesional de la salud</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed flex-1">
                ¿Buscás un lugar de atención en Zona Oeste preparado para recibir a tus pacientes como corresponde? Sumate al staff de BA: consultorios equipados, gestión de turnos resuelta y una comunidad de +20.000 pacientes.
              </p>
              <a
                href={`https://wa.me/5491164344822?text=${encodeURIComponent("Hola BA! Soy profesional de la salud y me interesa sumarme al staff / atender en sus consultorios. (Vengo de la web)")}`}
                onClick={() => trackConversion("Sumate - Profesional", "Lead B2B")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 bg-[#5C1A3D] hover:bg-[#44122d] text-white text-center py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Quiero sumarme
              </a>
            </div>

            {/* Providers card */}
            <div className="bg-[#F8F6F4] rounded-2xl p-8 border border-[#E8D5C4]/40 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-[#C2006B] flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h3 className="font-extrabold text-lg text-[#5C1A3D] mb-2">Tengo un comercio o servicio de salud</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed flex-1">
                Laboratorios, farmacias, ópticas, ortopedias y otros servicios de salud: adherite a la red de beneficios de BA y ofrecé descuentos a nuestros pacientes, ganando visibilidad en la comunidad.
              </p>
              <a
                href={`https://wa.me/5491164344822?text=${encodeURIComponent("Hola BA! Tengo un comercio/servicio de salud y me interesa adherirme a su red de beneficios para pacientes. (Vengo de la web)")}`}
                onClick={() => trackConversion("Sumate - Proveedor", "Lead B2B")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 bg-[#C2006B] hover:bg-[#a10058] text-white text-center py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Quiero adherirme
              </a>
            </div>
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
                src="/ba-isotipo-vino.png" 
                alt="BA Consultorios Médicos" 
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
              <a href="#propuesta" className="hover:text-white transition-colors">Propuesta</a>
              <a href="#directorio" className="hover:text-white transition-colors">Especialidades</a>
              <a href="#reserva-online" className="hover:text-white transition-colors">Reservar online</a>
              <a href="#testimonios" className="hover:text-white transition-colors">Opiniones</a>
              <a href="#contacto" className="hover:text-white transition-colors">Ubicación</a>
              <a 
                href={BRAND_INFO.instagramUrl}
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#F2C4D0] hover:text-white transition-colors"
              >
                Instagram
              </a>
              <a 
                href={BRAND_INFO.facebookUrl}
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#F2C4D0] hover:text-white transition-colors"
              >
                Facebook
              </a>
              <a 
                href={BRAND_INFO.whatsappUrl}
                target="_blank" 
                rel="noopener noreferrer" 
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
                  onClick={() => trackConversion("Modal WhatsApp fallback", "CTA")}
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
                  className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors cursor-pointer"
                >
                  ✕
                </button>

                {subStatus === "sent" ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-extrabold text-lg text-[#5C1A3D]">¡Listo!</h3>
                    <p className="text-sm text-gray-500 font-light mt-1">Te vamos a escribir con información útil sobre controles y prevención.</p>
                  </div>
                ) : (
                  <>
                    <span className="text-[11px] font-bold tracking-widest uppercase text-[#C2006B]">GRATIS</span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#5C1A3D] mt-1 mb-2 leading-tight">
                      Recordatorios de control y prevención
                    </h3>
                    <p className="text-sm text-gray-500 font-light mb-5 leading-relaxed">
                      Dejanos tu mail y te enviamos guías simples sobre chequeos por edad, señales a las que prestar atención y novedades de BA. Sin costo.
                    </p>

                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <input
                        type="text"
                        required
                        placeholder="Tu nombre"
                        value={subForm.name}
                        onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#C2006B] transition-colors"
                      />
                      <input
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
                        className="w-full text-[11px] text-gray-400 hover:text-gray-600 font-medium py-1 transition-colors cursor-pointer"
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
          Pedí tu turno hoy
        </span>
        <a 
          href={BRAND_INFO.whatsappUrl}
          onClick={() => trackConversion("Floating WhatsApp Button", "CTA")}
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
