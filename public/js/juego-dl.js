// Motor común de los videojueguitos del bootcamp DiveLearn.
// Da lo que todos los juegos repiten: HUD (nivel, ronda, perlas), el pulpo profe que explica,
// pantallas de inicio / nivel superado / final con lo aprendido, efectos suaves que respetan
// prefers-reduced-motion, y progreso real: la actividad del bootcamp solo cuenta al ganar.
//
// Uso:
//   const j = JuegoDL({ id, modulo, pagina, titulo, niveles: [{ t, intro }], aprendido: [...], siguiente })
//   j.alEmpezarNivel = (i) => { ...prepara el nivel i... };
//   j.hablar(texto, "pulpo-ok") · j.ganarPerlas(n, el) · j.sacudir(el) · j.brillar(el)
//   j.rondaGanada() · j.nivelGanado() · j.ronda / j.nivel
window.JuegoDL = (cfg) => {
  const $ = (s, r = document) => r.querySelector(s);
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const raiz = $("#juego");
  // Rondas por nivel: las del nivel o las del juego (5 por defecto).
  const rondas = () => cfg.niveles[j.nivel].rondas || cfg.rondas || 5;

  // ── Progreso: dentro de divelearn-bootcamp (el mismo que usa el mapa del bootcamp) ──
  const leer = () => {
    try {
      const p = JSON.parse(localStorage.getItem("divelearn-bootcamp") || "{}");
      return p.v === 2 ? p : { v: 2, visitas: {} };
    } catch {
      return { v: 2, visitas: {} };
    }
  };
  const escribir = (p) => {
    try {
      localStorage.setItem("divelearn-bootcamp", JSON.stringify(p));
    } catch {}
  };
  const mio = () => (leer().juegos || {})[cfg.id] || { nivel: 0, perlas: 0, ganado: false };
  const guardarMio = (cambios) => {
    const p = leer();
    p.juegos = p.juegos || {};
    p.juegos[cfg.id] = { ...mio(), ...cambios };
    // Al ganar, la actividad cuenta en el mapa del bootcamp (antes contaba solo con abrirla).
    if (cambios.ganado && cfg.modulo != null) {
      p.visitas = p.visitas || {};
      const v = p.visitas[cfg.modulo] || [];
      if (!v.includes(cfg.pagina)) v.push(cfg.pagina);
      p.visitas[cfg.modulo] = v;
    }
    escribir(p);
  };

  const estado = mio();
  const j = {
    nivel: Math.min(estado.nivel, cfg.niveles.length - 1),
    ronda: 0,
    perlas: estado.perlas,
    quieto,
    alEmpezarNivel: () => {},
  };

  // ── HUD ──
  const pintarHud = () => {
    $("#j-nivel").textContent = `Nivel ${j.nivel + 1}/${cfg.niveles.length}`;
    $("#j-ronda").textContent = `${Math.min(j.ronda + 1, rondas())}/${rondas()}`;
    $("#j-ronda-barra").style.width = `${(j.ronda / rondas()) * 100}%`;
  };
  let perlasVistas = j.perlas;
  const pintarPerlas = () => {
    const el = $("#j-perlas");
    if (quieto) return (el.textContent = j.perlas);
    // El número sube de a uno, como un contador de juego.
    const paso = () => {
      if (perlasVistas >= j.perlas) return;
      perlasVistas++;
      el.textContent = perlasVistas;
      setTimeout(paso, 60);
    };
    paso();
  };

  // ── Efectos ──
  const clase = (el, c, ms) => {
    if (!el || quieto) return;
    el.classList.remove(c);
    void el.offsetWidth;
    el.classList.add(c);
    setTimeout(() => el.classList.remove(c), ms);
  };
  j.sacudir = (el) => clase(el, "j-sacude", 400);
  j.brillar = (el) => clase(el, "j-brilla", 600);

  j.hablar = (texto, sprite = "pulpo-profe") => {
    $("#j-profe-img").src = `/img/sprites/${sprite}.png`;
    $("#j-profe-txt").innerHTML = texto;
    clase($("#j-profe"), "j-entra", 300);
  };

  j.ganarPerlas = (n, desde) => {
    j.perlas += n;
    guardarMio({ perlas: j.perlas });
    pintarPerlas();
    if (desde && !quieto) {
      const p = document.createElement("span");
      p.className = "j-perla-vuela";
      p.textContent = `+${n}`;
      const r = desde.getBoundingClientRect();
      p.style.left = `${r.left + r.width / 2}px`;
      p.style.top = `${r.top}px`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  };

  // ── Pantallas ──
  const pantalla = (id) => raiz.querySelectorAll(".j-pantalla").forEach((p) => (p.hidden = p.id !== id));

  const empezarNivel = (i) => {
    j.nivel = i;
    j.ronda = 0;
    const n = cfg.niveles[i];
    $("#j-intro-num").textContent = i === cfg.niveles.length - 1 && cfg.ultimoEsJefe ? "Reto final" : `Nivel ${i + 1}`;
    $("#j-intro-titulo").textContent = n.t;
    $("#j-intro-txt").innerHTML = n.intro;
    pantalla("j-intro");
    $("#j-intro-ir").focus();
  };

  j.rondaGanada = () => {
    j.ronda++;
    pintarHud();
    return j.ronda >= rondas();
  };

  j.nivelGanado = () => {
    const ultimo = j.nivel >= cfg.niveles.length - 1;
    guardarMio({ nivel: ultimo ? j.nivel : j.nivel + 1, ganado: mio().ganado || ultimo });
    if (ultimo) {
      $("#j-fin-perlas").textContent = j.perlas;
      $("#j-fin-lista").innerHTML = cfg.aprendido.map((a) => `<li>${a}</li>`).join("");
      pantalla("j-fin");
      $("#j-fin-otra").focus();
      return;
    }
    $("#j-sube-txt").textContent = cfg.niveles[j.nivel].logro || "¡Nivel superado!";
    pantalla("j-sube");
    $("#j-sube-ir").focus();
  };

  $("#j-empezar").addEventListener("click", () => empezarNivel(j.nivel));
  $("#j-intro-ir").addEventListener("click", () => {
    pantalla("j-tablero");
    pintarHud();
    j.alEmpezarNivel(j.nivel);
  });
  $("#j-sube-ir").addEventListener("click", () => empezarNivel(j.nivel + 1));
  $("#j-fin-otra").addEventListener("click", () => empezarNivel(0));

  // Mapa de niveles: se puede volver a cualquiera ya abierto (autonomía).
  const pintarNiveles = () => {
    const ul = $("#j-niveles");
    ul.innerHTML = "";
    const abierto = mio().ganado ? cfg.niveles.length - 1 : mio().nivel;
    cfg.niveles.forEach((n, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = `${i + 1}. ${n.t}`;
      b.disabled = i > abierto;
      b.addEventListener("click", () => empezarNivel(i));
      li.appendChild(b);
      ul.appendChild(li);
    });
  };

  $("#j-titulo").textContent = cfg.titulo;
  $("#j-perlas").textContent = j.perlas;
  pintarNiveles();
  pantalla("j-inicio");
  if (estado.nivel > 0 || estado.ganado) $("#j-empezar").textContent = "Seguir jugando";
  return j;
};
