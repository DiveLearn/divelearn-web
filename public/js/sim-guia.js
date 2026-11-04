// Guía de laboratorio que comparten los simuladores: misión actual, pistas en dos pasos
// (primero la idea, después la respuesta), XP con premio por resolver sin pistas,
// compañeros del océano que se desbloquean y un reto final que junta todo.
// Cada misión: { t, h, o, p, r, y, ok, guiada?, jefe? }
//   o = objetivo (sin la respuesta), p = pista, r = respuesta exacta,
//   guiada = la respuesta va visible (primeras misiones), jefe = reto final.
window.SimGuia = (misiones, { xp = 20, bonus = 10, compas = [] } = {}) => {
  const $ = (s) => document.querySelector(s);
  let hechas = 0;
  let xpTotal = 0;
  let pistas = 0; // pistas vistas en la misión actual: 0, 1 (idea) o 2 (respuesta)

  const pintarCompas = () => {
    const caja = $("#sim-compas");
    if (!caja || !compas.length) return;
    caja.innerHTML = "";
    for (const c of compas) {
      const img = document.createElement("img");
      img.className = "px compa" + (hechas >= c.en ? "" : " bloqueado");
      img.src = `/img/sprites/${c.sprite}.png`;
      img.alt = hechas >= c.en ? c.nombre : "Compañero por descubrir";
      img.title = hechas >= c.en ? `${c.nombre}: ${c.dato}` : `Se une en la misión ${c.en}`;
      caja.appendChild(img);
    }
  };

  const pintarPista = () => {
    const m = misiones[hechas];
    const btn = $("#m-ver-pista");
    const caja = $("#m-pista");
    if (!m || m.guiada) {
      btn.hidden = true;
      caja.hidden = true;
      return;
    }
    btn.hidden = pistas >= 2;
    btn.textContent = pistas === 0 ? "Ver pista" : "Ver respuesta";
    caja.hidden = pistas === 0;
    caja.innerHTML = pistas === 0 ? "" : m.p + (pistas === 2 ? `<br><b>Respuesta:</b> ${m.r}` : "");
  };

  const pintar = () => {
    const total = misiones.length;
    $("#sim-barra").style.width = `${(hechas / total) * 100}%`;
    $("#sim-cuenta").textContent = `${hechas}/${total}`;
    $("#sim-xp").textContent = xpTotal;
    const lista = $("#sim-lista");
    lista.innerHTML = "";
    misiones.forEach((m, i) => {
      const li = document.createElement("li");
      li.className = (i < hechas ? "hecha" : i === hechas ? "actual" : "") + (m.jefe ? " jefe" : "");
      li.textContent = m.t;
      lista.appendChild(li);
    });
    pintarCompas();
    const fin = hechas >= total;
    $("#sim-mision").hidden = fin;
    $("#sim-fin").hidden = !fin;
    const finXp = $("#sim-fin-xp");
    if (finXp) finXp.textContent = `${xpTotal} XP`;
    if (fin) return;
    const m = misiones[hechas];
    $("#sim-mision").classList.toggle("jefe", !!m.jefe);
    $("#m-num").textContent = m.jefe ? "Reto final" : `Misión ${hechas + 1}`;
    $("#m-titulo").textContent = m.t;
    $("#m-historia").textContent = m.h;
    $("#m-objetivo").innerHTML = m.guiada ? `${m.o} <span class="resp">${m.r}</span>` : m.o;
    pintarPista();
  };

  // Aviso emergente (el pulpo): logro, susto o compañero nuevo.
  const aviso = (titulo, texto, sprite = "pulpo-ok") => {
    const t = $("#sim-logro");
    const img = t.querySelector("img");
    if (img) img.src = `/img/sprites/${sprite}.png`;
    $("#logro-titulo").textContent = titulo;
    $("#logro-porque").textContent = texto;
    t.hidden = false;
    t.classList.remove("entra");
    void t.offsetWidth;
    t.classList.add("entra");
  };

  // Revisa la misión actual con los datos que entrega el simulador; devuelve true si se ganó.
  const revisar = (...datos) => {
    const m = misiones[hechas];
    if (!m || !m.ok(...datos)) return false;
    const premio = pistas === 0 && !m.guiada ? bonus : 0;
    xpTotal += xp + premio + (m.jefe ? xp : 0);
    hechas++;
    pistas = 0;
    const compa = compas.find((c) => c.en === hechas);
    const titulo = `+${xp + premio + (m.jefe ? xp : 0)} XP · ${m.t}${premio ? " · ¡sin pistas!" : ""}`;
    if (compa) aviso(titulo, `${m.y} Nuevo compañero: ${compa.nombre}. ${compa.dato}`, compa.sprite);
    else aviso(titulo, m.y, m.jefe ? "buzo-celebra" : "pulpo-ok");
    return true;
  };

  $("#m-ver-pista").addEventListener("click", () => {
    pistas = Math.min(2, pistas + 1);
    pintarPista();
  });
  $("#logro-cerrar").addEventListener("click", () => ($("#sim-logro").hidden = true));

  return {
    pintar,
    revisar,
    aviso,
    get hechas() {
      return hechas;
    },
    terminado: () => hechas >= misiones.length,
    estado: () => ({ hechas, xp: xpTotal, pistas }),
    // Acepta el formato viejo (solo hechas) y calcula el XP que correspondía.
    cargar: (s = {}) => {
      hechas = Math.min(s.hechas || 0, misiones.length);
      xpTotal = s.xp ?? hechas * xp;
      pistas = s.pistas || 0;
    },
    // Vuelve atrás hasta la misión n (cuando se reinician los datos que pedían las siguientes).
    limitar: (n) => {
      if (hechas > n) [hechas, pistas] = [n, 0];
    },
    reiniciar: () => {
      [hechas, xpTotal, pistas] = [0, 0, 0];
      $("#sim-logro").hidden = true;
    },
  };
};
