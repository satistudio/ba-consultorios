import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  Check, 
  Instagram, 
  Share2, 
  Settings, 
  Sparkles, 
  HelpCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BRAND_INFO, SPECIALTIES, SERVICES_DATA, TESTIMONIALS, MedicalService } from "./data";

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
  
  // SEO and Analytics states
  const [gtmId, setGtmId] = useState(() => localStorage.getItem("ba_gtm_id") || "");
  const [gaId, setGaId] = useState(() => localStorage.getItem("ba_ga_id") || "");
  const [pixelId, setPixelId] = useState(() => localStorage.getItem("ba_pixel_id") || "");
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  // Active FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

  // Save Analytics config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ba_gtm_id", gtmId.trim());
    localStorage.setItem("ba_ga_id", gaId.trim());
    localStorage.setItem("ba_pixel_id", pixelId.trim());
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);

    // Trigger local tracking simulation
    console.log("Analytics IDs updated and saved locally.", { gtmId, gaId, pixelId });
  };

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
      <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E8D5C4]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          {/* Logo container */}
          <a href="#" className="flex items-center gap-3 group">
            <img 
              src="/input_file_8.png" 
              alt="BA Consultorios Médicos Logo" 
              className="h-14 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </a>

          {/* Nav Menu */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#propuesta" className="text-gray-600 hover:text-[#5C1A3D] transition-colors">Propuesta</a>
            <a href="#directorio" className="text-gray-600 hover:text-[#5C1A3D] transition-colors">Especialidades y Estudios</a>
            <a href="#testimonios" className="text-gray-600 hover:text-[#5C1A3D] transition-colors">Opiniones</a>
            <a href="#contacto" className="text-gray-600 hover:text-[#5C1A3D] transition-colors">Contacto</a>
          </nav>

          {/* Header CTA */}
          <div className="flex items-center gap-4">
            <a 
              href={BRAND_INFO.whatsappUrl}
              onClick={() => trackConversion("Header Button", "CTA")}
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#C2006B] hover:bg-[#a10058] text-white px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold tracking-wider uppercase transition-all duration-300 transform hover:scale-[1.03] shadow-md shadow-[#C2006B]/20"
            >
              Pedí tu Turno
            </a>
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
              <a 
                href={BRAND_INFO.whatsappUrl}
                onClick={() => trackConversion("Hero CTA Primary", "CTA")}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#C2006B] hover:bg-[#a10058] text-white px-8 py-4 rounded-full text-sm md:text-base font-bold tracking-wider uppercase text-center transition-all duration-300 shadow-xl shadow-[#C2006B]/30 flex items-center justify-center gap-3 group"
              >
                Pedí tu turno hoy mismo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
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
                <span className="text-xs font-medium text-[#5C1A3D] bg-[#F2C4D0] px-2 py-1 rounded">Hoy & Mañana</span>
              </div>

              <h3 className="font-bold text-lg text-[#5C1A3D] mb-4">Especialidades con turnos inmediatos:</h3>
              
              <div className="space-y-3 mb-6">
                {[
                  { name: "Cardiología & ECG", slots: "3 turnos hoy", icon: "❤️" },
                  { name: "Ecografías (Gral & 5D)", slots: "2 turnos hoy / 4 mañana", icon: "🧬" },
                  { name: "Ginecología & PAP", slots: "Turnos para mañana", icon: "🌸" },
                  { name: "Podología", slots: "Turnos para mañana", icon: "🦶" },
                  { name: "Pediatría", slots: "Turnos hoy por la tarde", icon: "👶" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#F8F6F4] p-3 rounded-lg border border-gray-100 hover:border-[#F2C4D0] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#C2006B] bg-[#C2006B]/5 px-2.5 py-1 rounded-full border border-[#C2006B]/10">
                      {item.slots}
                    </span>
                  </div>
                ))}
              </div>

              <a 
                href={BRAND_INFO.whatsappUrl}
                onClick={() => trackConversion("Simulator CTA", "CTA")}
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-[#5C1A3D] hover:bg-[#44122d] text-white text-center py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-colors"
              >
                💬 Reservar Turno al Instante
              </a>
              
              <p className="text-center text-[11px] text-gray-400 mt-3">
                Coordinación directa sin demoras ni trámites complejos.
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
                      `Hola BA Consultorios Médicos. Quisiera solicitar un turno para la práctica o consulta: "${service.name}" (Especialidad: ${service.specialty}).`
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

          {/* Externally managed studies notice */}
          <div className="bg-[#5C1A3D] text-white rounded-2xl p-8 mt-12 max-w-4xl mx-auto shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#C2006B]/15 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="text-4xl">🔬</div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-lg mb-1 text-[#F2C4D0]">Estudios Externos de Alta Complejidad</h3>
                <p className="text-sm font-light leading-relaxed text-[#F8F6F4]/90">
                  En BA Consultorios gestionamos las derivaciones para estudios complejos como <strong>Resonancia magnética, Tomografía computada y Densitometría ósea</strong>. Te brindamos las órdenes médicas, indicaciones detalladas y el seguimiento clínico correspondiente para coordinar con centros asociados.
                </p>
              </div>
              <a
                href="https://wa.me/5491164344822?text=Hola!%20Quiero%20consultar%20por%20un%20estudio%20derivado%20(resonancia,%20tomografía,%20densitometría)."
                onClick={() => trackConversion("Estudios Externos", "Estudio derivado")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-[#F2C4D0] text-[#5C1A3D] px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors shadow-lg"
              >
                Consultar derivación
              </a>
            </div>
          </div>

        </div>
      </section>

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div 
                key={t.id} 
                className="bg-white p-8 rounded-2xl shadow-sm border-2 border-[#F2C4D0]/60 relative flex flex-col justify-between"
              >
                {/* Decorative hand circle rule (Capa gráfica: Thick borders and clean elements) */}
                <span className="absolute -top-4 -left-2 text-4xl select-none opacity-15">“</span>
                
                <div>
                  <div className="flex items-center gap-1.5 mb-4">
                    {[1,2,3,4,5].map(star => (
                      <span key={star} className="text-[#C2006B]">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 italic font-light leading-relaxed mb-6">
                    "{t.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-[#5C1A3D] text-[#F2C4D0] font-extrabold flex items-center justify-center text-sm">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-xs text-[#5C1A3D]">{t.name}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {t.age} años · {t.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                      <p className="text-sm text-gray-600 font-light mt-0.5">{BRAND_INFO.address}</p>
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
                      <p className="text-sm text-gray-600 font-bold mt-0.5">Tel: {BRAND_INFO.phone}</p>
                      <p className="text-sm text-green-600 font-bold mt-0.5">WhatsApp: {BRAND_INFO.whatsapp}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instagram link */}
              <div className="mt-8 pt-8 border-t border-[#E8D5C4]/60">
                <h4 className="font-bold text-sm text-[#5C1A3D] mb-3">Seguinos en redes</h4>
                <a 
                  href={BRAND_INFO.instagramUrl}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#F2C4D0]/40 text-[#5C1A3D] border border-gray-200 hover:border-[#5C1A3D]/40 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Instagram className="w-4 h-4 text-[#C2006B]" />
                  <span>{BRAND_INFO.instagramHandle}</span>
                </a>
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

                {/* Map graphics wrapper */}
                <div className="flex-1 bg-gray-100 rounded-xl relative overflow-hidden border border-gray-200">
                  {/* Fake map styled elements to look ultra professional */}
                  <div className="absolute inset-0 bg-[#e5e3df] flex flex-col justify-center items-center p-8 text-center">
                    <div className="relative z-10">
                      {/* Big Map pin illustration */}
                      <div className="w-14 h-14 bg-[#5C1A3D] rounded-full flex items-center justify-center text-white text-xl shadow-lg border-2 border-white mx-auto animate-bounce mb-3">
                        🏥
                      </div>
                      <h4 className="font-extrabold text-[#5C1A3D] text-base">BA Consultorios Médicos</h4>
                      <p className="text-xs text-gray-600 font-medium max-w-xs mt-1">
                        Almafuerte 3558, San Justo.<br />
                        Entre Mármol y Villegas. Excelente accesibilidad desde toda La Matanza.
                      </p>
                      
                      <a 
                        href="https://maps.google.com/?q=Almafuerte+3558,+San+Justo,+La+Matanza" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-[#C2006B] hover:bg-[#a10058] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider mt-4 transition-colors"
                      >
                        📍 Cómo llegar con GPS
                      </a>
                    </div>
                    {/* Simulated grid lines for map */}
                    <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-white opacity-40"></div>
                    <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-white opacity-40"></div>
                    <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white opacity-40"></div>
                    <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-white opacity-40"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SEO & TRACKING CONVERSION PLATFORM (OWNER CONTROL CENTER) */}
      <section className="py-12 bg-white border-t border-[#E8D5C4]/30 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#F8F6F4] rounded-2xl border border-[#E8D5C4] overflow-hidden">
            <button 
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className="w-full px-6 py-4 bg-[#5C1A3D] hover:bg-[#4a1331] text-white flex justify-between items-center font-bold text-sm tracking-wider uppercase cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#F2C4D0] animate-spin-slow" />
                <span>Panel de SEO, Tag Manager y Píxeles (Fácil Integración para GitHub)</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-[#F2C4D0] transition-transform duration-300 ${showConfigPanel ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showConfigPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 text-left border-t border-[#E8D5C4]">
                    <p className="text-xs text-gray-600 leading-relaxed font-light mb-6">
                      Como la web se subirá a <strong>GitHub Pages</strong> como un sitio estático, no necesitas editar el código fuente de React para instalar tus herramientas de marketing. Pegá tus identificadores de seguimiento oficiales abajo, guardá los cambios y la web inyectará automáticamente los scripts correspondientes en tiempo de ejecución.
                    </p>

                    <form onSubmit={handleSaveConfig} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                            Google Analytics 4 ID
                          </label>
                          <input
                            type="text"
                            placeholder="G-XXXXXX"
                            value={gaId}
                            onChange={(e) => setGaId(e.target.value)}
                            className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#C2006B] font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                            Google Tag Manager ID
                          </label>
                          <input
                            type="text"
                            placeholder="GTM-XXXXXX"
                            value={gtmId}
                            onChange={(e) => setGtmId(e.target.value)}
                            className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#C2006B] font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                            Meta Pixel ID (Facebook)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. 1234567890123"
                            value={pixelId}
                            onChange={(e) => setPixelId(e.target.value)}
                            className="w-full bg-white px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#C2006B] font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200/60">
                        <div className="text-[11px] text-gray-400">
                          {gaId || gtmId || pixelId ? (
                            <span className="text-green-600 font-bold">● Scripts activos cargados en navegador</span>
                          ) : (
                            "Pega tus identificadores para activar el seguimiento de conversiones"
                          )}
                        </div>
                        <button
                          type="submit"
                          className="bg-[#C2006B] hover:bg-[#a10058] text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          {configSaved ? "¡Guardado con éxito!" : "Guardar Configuración"}
                        </button>
                      </div>
                    </form>

                    {/* Step by step info for hosting on GitHub Pages */}
                    <div className="bg-[#E8D5C4]/20 border border-[#E8D5C4]/40 rounded-xl p-4 mt-6">
                      <h4 className="font-bold text-xs text-[#5C1A3D] mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C2006B]" />
                        Instrucciones rápidas para deploy en GitHub Pages:
                      </h4>
                      <ol className="text-xs text-gray-600 font-light list-decimal list-inside space-y-1.5 leading-relaxed">
                        <li>Construí la aplicación localmente corriendo <code className="font-mono bg-white px-1 py-0.5 rounded text-gray-700">npm run build</code>.</li>
                        <li>Subí todo el contenido generado dentro de la carpeta <code className="font-mono bg-white px-1 py-0.5 rounded text-gray-700">/dist</code> a tu repositorio de GitHub.</li>
                        <li>En GitHub, ve a <strong>Settings &gt; Pages</strong> y configura la rama de publicación (ej. `main` o `/root`).</li>
                        <li>Si usas un dominio propio, añade un archivo <code className="font-mono bg-white px-1 py-0.5 rounded text-gray-700">CNAME</code> con tu dominio (ej. <code className="font-mono">baconsultorios.com</code>).</li>
                        <li>Los eventos de conversión (clic en WhatsApp) se enviarán automáticamente a GA, GTM y Meta Pixel configurados arriba.</li>
                      </ol>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                src="/input_file_12.png" 
                alt="BA Isotipo" 
                className="h-10 w-auto mb-3"
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
              <a href="#testimonios" className="hover:text-white transition-colors">Opiniones</a>
              <a href="#contacto" className="hover:text-white transition-colors">Ubicación</a>
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
