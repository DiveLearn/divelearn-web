// Progreso del Bootcamp DiveLearn, guardado solo en este navegador (sin cookies ni servidor).
// Lo cargan las páginas de los módulos (lo inserta scripts/importar-bootcamp.py) y el mapa /bootcamp/.
// XP por página: actividad 25, quiz 50 (los mismos valores que src/data/bootcamp.ts).
(function () {
  var CLAVE = "divelearn-bootcamp";
  var hoy = new Date().toLocaleDateString("sv"); // AAAA-MM-DD en hora local

  function leer() {
    var p;
    try {
      p = JSON.parse(localStorage.getItem(CLAVE) || "{}");
    } catch (e) {
      p = {};
    }
    if (p.v !== 2) p = { v: 2, visitas: {} };
    p.visitas = p.visitas || {};
    p.dias = p.dias || [];
    p.seg = p.seg || {};
    return p;
  }
  function guardar(p) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(p));
    } catch (e) {
      /* modo privado: el juego funciona, solo no recuerda */
    }
  }
  window.DiveLearnProgreso = { leer: leer, guardar: guardar, hoy: hoy };

  // Racha: el día cuenta en cuanto abres algo del bootcamp.
  var p = leer();
  if (p.dias.indexOf(hoy) === -1) {
    p.dias.push(hoy);
    p.dias = p.dias.slice(-60);
    guardar(p);
  }

  // Minutos de estudio de hoy: cuenta solo mientras la pestaña está a la vista.
  setInterval(function () {
    if (document.visibilityState !== "visible") return;
    var q = leer();
    q.seg[hoy] = (q.seg[hoy] || 0) + 15;
    var dias = Object.keys(q.seg).sort().slice(-14);
    var seg = {};
    dias.forEach(function (d) {
      seg[d] = q.seg[d];
    });
    q.seg = seg;
    guardar(q);
  }, 15000);

  var s = document.currentScript;
  if (!s || !s.dataset.modulo) return; // el mapa usa solo leer/guardar

  var m = s.dataset.modulo;
  var pagina = s.dataset.pagina;
  var total = Number(s.dataset.total);
  var vistas = p.visitas[m] || [];
  var nueva = pagina !== "index" && vistas.indexOf(pagina) === -1;
  if (nueva) {
    vistas.push(pagina);
    p.visitas[m] = vistas;
    p.ultimaNueva = hoy; // misión del día: abrir al menos una actividad nueva
    guardar(p);
  }
  var hechas = Math.min(vistas.length, total);
  var completo = hechas >= total;

  var css =
    ".dl-chip{position:fixed;right:16px;bottom:16px;z-index:999;display:flex;align-items:center;gap:10px;" +
    "padding:8px 14px 8px 8px;border:3px solid #1f1d5c;border-radius:14px;background:#fff;color:#1f1d5c;" +
    "font:700 14px/1.2 'Questrial','Century Gothic',system-ui,sans-serif;text-decoration:none;box-shadow:4px 4px 0 #1f1d5c;" +
    "transition:transform .15s}" +
    ".dl-chip:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 #1f1d5c}" +
    ".dl-anillo{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;" +
    "background:conic-gradient(#5453eb calc(var(--p)*1%),#e9e4fb 0)}" +
    ".dl-anillo::after{content:'';width:22px;height:22px;border-radius:50%;background:#fff}" +
    ".dl-chip.ok .dl-anillo{background:#e0f24a}" +
    ".dl-xp{position:fixed;right:28px;bottom:76px;z-index:999;padding:6px 12px;border:3px solid #1f1d5c;border-radius:10px;" +
    "background:#e0f24a;color:#1f1d5c;font:700 16px/1 'Questrial','Century Gothic',system-ui,sans-serif;box-shadow:3px 3px 0 #1f1d5c;" +
    "animation:dl-sube 2.4s cubic-bezier(.2,.8,.2,1) forwards}" +
    "@keyframes dl-sube{0%{opacity:0;transform:translateY(20px) scale(.8)}15%{opacity:1;transform:none}80%{opacity:1}100%{opacity:0;transform:translateY(-30px)}}" +
    "@media (prefers-reduced-motion:reduce){.dl-xp{animation:none}}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var chip = document.createElement("a");
  chip.href = "/bootcamp/";
  chip.className = "dl-chip" + (completo ? " ok" : "");
  chip.title = "Ver mi mapa del bootcamp";
  chip.innerHTML =
    '<span class="dl-anillo" style="--p:' + Math.round((hechas / total) * 100) + '"></span>' +
    "<span>Módulo " + m + "<br>" + hechas + "/" + total + (completo ? " ✓" : "") + "</span>";
  document.body.appendChild(chip);

  if (nueva) {
    var xp = pagina.indexOf("quiz") === 0 ? 50 : 25;
    var aviso = document.createElement("div");
    aviso.className = "dl-xp";
    aviso.setAttribute("role", "status");
    aviso.textContent = completo ? "+" + xp + " XP · ¡Módulo completo!" : "+" + xp + " XP";
    document.body.appendChild(aviso);
    setTimeout(function () {
      aviso.remove();
    }, 2600);
  }
})();
