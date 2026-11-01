/* BEA, asistente virtual de la web de BA.
 * Botón con avatar abajo a la izquierda (abajo a la derecha está WhatsApp).
 * La charla vive solo en esta página: no se guarda en el navegador ni en el
 * servidor, y se borra al cerrar o cambiar de página (regla aprobada).
 * Medición: solo dataLayer (nunca gtag/fbq). bea_open al abrir; whatsapp_click
 * y agendapro_direct_click con origin "bea" al derivar. Nunca el texto. */
(function () {
  "use strict";
  var p = location.pathname;
  var pagina = p === "/" ? "home" : (p.match(/^\/(especialidades|estudios|precios)(\/|$)/) || [])[1];
  if (!pagina || document.getElementById("bea-boton")) return;

  var WA = "5491164344822";
  var AGENDA = "https://baconsultorios.agendapro.com/ar";
  var MAX = 15;
  var SUGERENCIAS = ["¿Cuánto sale una consulta?", "¿Atienden por obra social?", "¿Cómo me preparo para una ecografía?", "¿Dónde quedan?"];

  var historial = []; // [{role, content}] solo en memoria
  var abierto = false, enviando = false, abrioUnaVez = false, cerrada = false;

  function push(data) { window.dataLayer = window.dataLayer || []; window.dataLayer.push(data); }
  function el(tag, attrs, hijos) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === "text") n.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    (hijos || []).forEach(function (h) { if (h) n.appendChild(h); });
    return n;
  }

  var css = "" +
    "#bea-boton{position:fixed;left:16px;bottom:16px;z-index:45;display:flex;align-items:center;gap:8px;padding:4px 14px 4px 4px;border:0;border-radius:999px;background:#fff;color:#5C1A3D;font:700 13px/1.2 Montserrat,system-ui,sans-serif;box-shadow:0 8px 24px rgba(92,26,61,.22);cursor:pointer}" +
    "#bea-boton img{width:48px;height:48px;border-radius:50%;display:block}" +
    "#bea-boton:hover{box-shadow:0 10px 28px rgba(92,26,61,.32)}" +
    "#bea-boton:focus-visible,#bea-panel :focus-visible{outline:3px solid #C2006B;outline-offset:2px}" +
    "@media (max-width:379px){#bea-boton .bea-etq{display:none}#bea-boton{padding:4px}}" +
    "#bea-panel{position:fixed;z-index:46;left:8px;right:8px;bottom:8px;max-height:calc(100dvh - 24px);height:600px;display:flex;flex-direction:column;background:#F8F6F4;border-radius:20px;box-shadow:0 20px 50px rgba(44,44,44,.3);overflow:hidden;font:400 14px/1.45 Montserrat,system-ui,sans-serif;color:#2C2C2C}" +
    "@media (min-width:640px){#bea-panel{left:16px;right:auto;bottom:16px;width:380px;max-height:calc(100dvh - 32px)}}" +
    "#bea-panel[hidden]{display:none}" +
    ".bea-cab{display:flex;align-items:center;gap:10px;padding:12px 12px 12px 14px;background:#5C1A3D;color:#fff}" +
    ".bea-cab img{width:38px;height:38px;border-radius:50%;background:#F2C4D0}" +
    ".bea-cab b{display:block;font-size:15px}.bea-cab small{display:block;font-size:11px;opacity:.85}" +
    ".bea-x{margin-left:auto;width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:20px;line-height:1;cursor:pointer}" +
    ".bea-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}" +
    ".bea-m{max-width:88%;padding:9px 12px;border-radius:16px;white-space:pre-wrap;overflow-wrap:anywhere}" +
    ".bea-m.bea{align-self:flex-start;background:#fff;border:1px solid #E8D5C4;border-bottom-left-radius:4px}" +
    ".bea-m.yo{align-self:flex-end;background:#C2006B;color:#fff;border-bottom-right-radius:4px}" +
    ".bea-m.alerta{border:2px solid #B42318;background:#FEF3F2;color:#7A271A;font-weight:600}" +
    ".bea-acc{align-self:flex-start;display:flex;flex-direction:column;gap:6px;width:88%}" +
    ".bea-acc a,.bea-sug button{display:block;text-align:center;padding:9px 12px;border-radius:999px;font-weight:700;font-size:13px;text-decoration:none}" +
    ".bea-pri{background:#C2006B;color:#fff}.bea-pri:hover{background:#5C1A3D}" +
    ".bea-sec{background:#fff;color:#5C1A3D;border:1px solid #E8D5C4}" +
    ".bea-wa{background:#1F8F4E;color:#fff}" +
    ".bea-urg{background:#B42318;color:#fff}" +
    ".bea-acc label{font-size:11px;color:#5C1A3D;font-weight:700}" +
    ".bea-acc textarea{width:100%;box-sizing:border-box;min-height:64px;padding:8px 10px;border:1px solid #E8D5C4;border-radius:12px;font:inherit;font-size:13px;resize:vertical;background:#fff}" +
    ".bea-sug{display:flex;flex-wrap:wrap;gap:6px}" +
    ".bea-sug button{border:1px solid #E8D5C4;background:#fff;color:#5C1A3D;cursor:pointer;font-family:inherit;font-weight:600;padding:7px 11px}" +
    ".bea-esc{align-self:flex-start;color:#5C1A3D;font-size:12px;opacity:.75}" +
    ".bea-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #E8D5C4;background:#fff}" +
    ".bea-form textarea{flex:1;min-height:40px;max-height:110px;padding:9px 12px;border:1px solid #E8D5C4;border-radius:14px;font:inherit;resize:none}" +
    ".bea-form button{width:44px;height:44px;flex:none;border:0;border-radius:50%;background:#C2006B;color:#fff;font-size:18px;cursor:pointer}" +
    ".bea-form button:disabled,.bea-form textarea:disabled{opacity:.5;cursor:not-allowed}" +
    ".bea-aviso{margin:0;padding:6px 12px 10px;background:#fff;font-size:11px;color:#6B6B6B;text-align:center}" +
    "@media (prefers-reduced-motion:no-preference){#bea-panel:not([hidden]){animation:bea-in .2s ease-out}.bea-m{animation:bea-in .2s ease-out}}" +
    "@keyframes bea-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}";
  document.head.appendChild(el("style", { text: css }));

  var boton = el("button", { id: "bea-boton", type: "button", "aria-expanded": "false", "aria-controls": "bea-panel", onclick: function () { abierto ? cerrar() : abrir(); } }, [
    el("img", { src: "/bea-avatar.svg", alt: "", width: "48", height: "48" }),
    el("span", { class: "bea-etq", text: "¿Dudas? Preguntale a BEA" }),
  ]);
  var log = el("div", { class: "bea-log", role: "log", "aria-live": "polite", "aria-label": "Conversación con BEA" });
  var entrada = el("textarea", { rows: "1", maxlength: "800", placeholder: "Escribí tu consulta", "aria-label": "Tu consulta para BEA" });
  var enviar = el("button", { type: "submit", "aria-label": "Enviar", text: "➤" });
  var form = el("form", { class: "bea-form", onsubmit: function (e) { e.preventDefault(); mandar(entrada.value); } }, [entrada, enviar]);
  var panel = el("div", { id: "bea-panel", role: "dialog", "aria-modal": "false", "aria-labelledby": "bea-titulo", hidden: "" }, [
    el("div", { class: "bea-cab" }, [
      el("img", { src: "/bea-avatar.svg", alt: "" }),
      el("div", {}, [el("b", { id: "bea-titulo", text: "BEA" }), el("small", { text: "Asistente virtual de BA" })]),
      el("button", { type: "button", class: "bea-x", "aria-label": "Cerrar", text: "×", onclick: cerrar }),
    ]),
    log,
    form,
    el("p", { class: "bea-aviso", text: "BEA es un asistente virtual. No da diagnósticos. Ante una urgencia, llamá al 107." }),
  ]);

  entrada.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); mandar(entrada.value); }
  });
  entrada.addEventListener("input", function () { entrada.style.height = "auto"; entrada.style.height = Math.min(entrada.scrollHeight, 110) + "px"; });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrar(); });

  function bajar() { log.scrollTop = log.scrollHeight; } // solo dentro del chat, nunca la página
  function burbuja(texto, quien, alerta) {
    log.appendChild(el("div", { class: "bea-m " + quien + (alerta ? " alerta" : ""), text: texto }));
    bajar();
  }

  function abrir() {
    abierto = true;
    panel.hidden = false;
    boton.hidden = true;
    boton.setAttribute("aria-expanded", "true");
    if (!abrioUnaVez) {
      abrioUnaVez = true;
      push({ event: "bea_open", origin: pagina });
      burbuja("Hola, soy BEA, el asistente virtual de BA. Te ayudo a encontrar la especialidad o el estudio, ver precios y sacar turno. ¿Qué necesitás?", "bea");
      var sug = el("div", { class: "bea-sug" });
      SUGERENCIAS.forEach(function (s) { sug.appendChild(el("button", { type: "button", text: s, onclick: function () { sug.remove(); mandar(s); } })); });
      log.appendChild(sug);
    }
    entrada.focus();
  }
  function cerrar() {
    abierto = false;
    panel.hidden = true;
    boton.hidden = false;
    boton.setAttribute("aria-expanded", "false");
    boton.focus();
  }

  function link(texto, href, clase, alClick) {
    var a = el("a", { href: href, class: clase, text: texto });
    if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
    if (alClick) a.addEventListener("click", alClick);
    return a;
  }
  function acciones(r) {
    var caja = el("div", { class: "bea-acc" });
    if (r.accion === "turnos") {
      caja.appendChild(link("Reservar turno online", AGENDA, "bea-pri", function () { push({ event: "agendapro_direct_click", origin: "bea", service_name: "" }); }));
      caja.appendChild(link("Tengo una orden médica", "/turnos/#orden", "bea-sec"));
    } else if (r.accion === "whatsapp") {
      var id = "bea-wa-" + log.children.length;
      var texto = el("textarea", { id: id, maxlength: "500" });
      texto.value = r.mensaje_whatsapp || "Hola BA! Tengo una consulta. (Vengo del asistente de la web)";
      caja.appendChild(el("label", { for: id, text: "Mensaje para WhatsApp (podés editarlo)" }));
      caja.appendChild(texto);
      var wa = link("Seguir por WhatsApp", "https://wa.me/" + WA, "bea-wa", function () {
        wa.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(texto.value.trim());
        push({ event: "whatsapp_click", origin: "bea", service_name: "", service_type: "" });
      });
      caja.appendChild(wa);
    } else if (r.accion === "urgencia" || r.accion === "riesgo_vida") {
      if (r.accion === "riesgo_vida") caja.appendChild(link("Llamar a la Línea 135", "tel:135", "bea-urg"));
      caja.appendChild(link("Llamar al 107", "tel:107", "bea-urg"));
      caja.appendChild(link("Llamar al 911", "tel:911", "bea-sec"));
    } else return;
    log.appendChild(caja);
    bajar();
  }

  function bloquear(motivo) {
    cerrada = true;
    entrada.disabled = true;
    enviar.disabled = true;
    entrada.placeholder = motivo;
  }

  function mandar(texto) {
    texto = (texto || "").trim().slice(0, 800);
    if (!texto || enviando || cerrada) return;
    var sug = log.querySelector(".bea-sug");
    if (sug) sug.remove();
    burbuja(texto, "yo");
    historial.push({ role: "user", content: texto });
    entrada.value = "";
    entrada.style.height = "auto";
    enviando = true;
    enviar.disabled = true;
    var esc = el("div", { class: "bea-esc", text: "BEA está escribiendo…" });
    log.appendChild(esc);
    bajar();

    fetch("/api/bea", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: historial }) })
      .then(function (res) { return res.json(); })
      .catch(function () { return { ok: false, reason: "red" }; })
      .then(function (r) {
        esc.remove();
        enviando = false;
        enviar.disabled = false;
        if (!r || !r.ok) {
          historial.pop(); // la pregunta sin respuesta no queda en la charla
          var msj = r && r.reason === "not_configured"
            ? "Todavía estoy en preparación. Mientras tanto, escribinos por WhatsApp y te responde una persona de BA."
            : "Uy, no pude responder. Probá de nuevo en un rato o escribinos por WhatsApp.";
          burbuja(msj, "bea");
          acciones({ accion: "whatsapp" }); // mensaje genérico: nunca se copia lo que escribió la persona
          return;
        }
        historial.push({ role: "assistant", content: r.respuesta });
        var alerta = r.accion === "urgencia" || r.accion === "riesgo_vida";
        burbuja(r.respuesta, "bea", alerta);
        acciones(r);
        var hechas = historial.filter(function (m) { return m.role === "user"; }).length;
        if (hechas >= MAX) bloquear("Para seguir, escribinos por WhatsApp");
        if (!alerta) entrada.focus();
      });
  }

  function montar() { document.body.appendChild(boton); document.body.appendChild(panel); }
  if (document.body) montar(); else document.addEventListener("DOMContentLoaded", montar);
})();
