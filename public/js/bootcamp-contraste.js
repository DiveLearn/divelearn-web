// Guardián de contraste de las actividades del bootcamp.
// Las actividades vienen de un diseño oscuro y se pasaron a fondo claro: algunos textos quedaron
// con colores que no se leen (lima sobre blanco, gris sobre terminal). Este script revisa cada
// texto, también el que aparece después (respuestas, resultados), y si no llega a 4.5:1
// lo oscurece o aclara manteniendo su tono. Sobre un degradado usa el promedio de sus colores;
// sobre una imagen no toca nada.
(function () {
  var MARCA = "data-dl-contraste";

  function rgba(s) {
    var m = s && s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
  }
  function mezcla(t, b) {
    return { r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 };
  }
  function lum(c) {
    function f(v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function razon(a, b) {
    var x = lum(a), y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  // Fondo real detrás del elemento; null si hay degradado o imagen (no se puede saber).
  function fondo(el) {
    var capas = [];
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      var cs = getComputedStyle(e);
      var img = cs.backgroundImage;
      if (img !== "none") {
        // Degradado: se usa el promedio de sus colores. Imagen: no se puede saber.
        if (img.indexOf("url(") !== -1 || img.indexOf("gradient") === -1) return null;
        var stops = img.match(/rgba?\([^)]+\)/g) || [];
        if (stops.length) {
          var suma = { r: 0, g: 0, b: 0, a: 0 };
          stops.forEach(function (t) {
            var x = rgba(t);
            suma.r += x.r; suma.g += x.g; suma.b += x.b; suma.a += x.a;
          });
          var n = stops.length;
          var prom = { r: suma.r / n, g: suma.g / n, b: suma.b / n, a: suma.a / n };
          if (prom.a > 0.6) {
            capas.push({ r: prom.r, g: prom.g, b: prom.b, a: 1 });
            break;
          }
        }
      }
      var c = rgba(cs.backgroundColor);
      if (c && c.a > 0) {
        capas.push(c);
        if (c.a >= 1) break;
      }
    }
    var b = { r: 255, g: 255, b: 255, a: 1 };
    for (var i = capas.length - 1; i >= 0; i--) b = mezcla(capas[i], b);
    return b;
  }
  // Mueve la luminosidad (en HSL) hasta llegar al contraste pedido.
  function ajustar(fg, bg, meta) {
    var r = fg.r / 255, g = fg.g / 255, b = fg.b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, h = 0, s = 0, d = max - min;
    if (d) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    var oscurecer = lum(bg) > 0.4;
    for (var paso = 0; paso < 40; paso++) {
      l = Math.max(0, Math.min(1, l + (oscurecer ? -0.025 : 0.025)));
      var c = hsl(h, s, l);
      if (razon(c, bg) >= meta) return c;
    }
    return oscurecer ? { r: 31, g: 29, b: 92 } : { r: 246, g: 247, b: 255 };
  }
  function hsl(h, s, l) {
    function k(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    if (!s) return { r: l * 255, g: l * 255, b: l * 255 };
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return { r: k(p, q, h + 1 / 3) * 255, g: k(p, q, h) * 255, b: k(p, q, h - 1 / 3) * 255 };
  }
  function css(c) {
    return "rgb(" + Math.round(c.r) + "," + Math.round(c.g) + "," + Math.round(c.b) + ")";
  }

  function revisar(raiz) {
    var els = raiz.querySelectorAll ? raiz.querySelectorAll("*") : [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.hasAttribute(MARCA)) {
        el.style.removeProperty("color");
        el.removeAttribute(MARCA);
      }
      var texto = false;
      for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.textContent.trim()) texto = true;
      if (!texto && !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) continue;
      if (!el.offsetParent && getComputedStyle(el).position !== "fixed") continue;
      var cs = getComputedStyle(el);
      var fg = rgba(cs.color);
      var bg = fondo(el);
      if (!fg || !bg) continue;
      var real = mezcla(fg, bg);
      var px = parseFloat(cs.fontSize);
      var meta = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700) ? 3 : 4.5;
      if (razon(real, bg) >= meta) continue;
      el.style.setProperty("color", css(ajustar(real, bg, meta)), "important");
      el.setAttribute(MARCA, "");
    }
  }

  var pendiente = null;
  function programar() {
    if (pendiente) return;
    pendiente = setTimeout(function () {
      pendiente = null;
      obs.disconnect();
      revisar(document.body);
      obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });
    }, 120);
  }
  var obs = new MutationObserver(programar);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", programar);
  else programar();
  window.addEventListener("load", programar);
})();
