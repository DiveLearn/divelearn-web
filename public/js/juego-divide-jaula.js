// Divide la jaula: subneteo jugando. La jaula es una red /24 dibujada como un cuadro de 16 × 16
// casillas (una por dirección). Tocar un corral libre lo parte en dos mitades (un bit más de máscara);
// después se mete cada grupo de animales en el corral más chico donde quepa (VLSM).
// Las casillas siguen el orden Z (Morton), así cada subred es un rectángulo con direcciones seguidas.
(() => {
  const $ = (s) => document.querySelector(s);
  const azar = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const elegir = (xs) => xs[azar(0, xs.length - 1)];

  // Grupos: nombre, sprite y cuántos animales (hosts) necesitan. "luego" = cuántos serán en 3 años.
  const G = (nombre, sprite, hoy, luego) => ({ nombre, sprite, hoy, luego });
  const VLSM = [
    [G("Tortugas", "tortuga", 100), G("Pulpos", "pulpo-profe", 50), G("Medusas", "medusa", 20)],
    [G("Peces payaso", "pez-payaso", 60), G("Erizos", "erizo", 28), G("Caracoles", "caracolin", 12), G("Estrellas", "estrella-mar", 10)],
    // El barrio de TechNova del bootcamp original, con animales: llena la jaula entera.
    [
      G("Pulpos (IT)", "pulpo-profe", 50),
      G("Medusas (IoT)", "medusa", 40),
      G("Peces payaso (desarrollo)", "pez-payaso", 30),
      G("Tortugas (administración)", "tortuga", 25),
      G("Caballitos (ventas)", "caballito-clienton", 20),
      G("Cangrejos (invitados)", "cangrejo-linkpriv", 15),
    ],
  ];
  const CRECE = [
    [G("Medusas", "medusa", 20, 40), G("Caracoles", "caracolin", 10, 25), G("Tortugas", "tortuga", 50, 100)],
    [G("Peces payaso", "pez-payaso", 30, 60), G("Erizos", "erizo", 12, 28), G("Estrellas", "estrella-mar", 6, 14), G("Sede nueva (libre)", "linternin", 0, 60)],
  ];
  const VPC = [
    [
      G("Pública zona A", "caballito-clienton", 20),
      G("Pública zona B", "caballito-clienton", 20),
      G("Privada zona A", "pulpo-profe", 50),
      G("Privada zona B", "pulpo-profe", 50),
      G("Datos zona A", "tortuga", 10),
      G("Datos zona B", "tortuga", 10),
    ],
    [
      G("Privada zona A", "pulpo-profe", 55),
      G("Privada zona B", "pulpo-profe", 55),
      G("Pública zona A", "caballito-clienton", 27),
      G("Pública zona B", "caballito-clienton", 27),
      G("Datos zona A", "tortuga", 11),
      G("Datos zona B", "tortuga", 11),
    ],
  ];

  const NIVELES = [
    {
      t: "Partir en iguales",
      modo: "iguales",
      intro: "Toca un corral para <b>partirlo en dos</b>: cada corte es <b>un bit más</b> de máscara (/24 → /25 → /26…). Parte la jaula en la <b>menor cantidad</b> de corrales iguales que alcance para lo que te piden. Si te pasas, usa <b>Deshacer</b>.",
      logro: "Con b bits prestados salen 2^b subredes: 2 bits = 4 corrales /26, 3 bits = 8 corrales /27.",
    },
    {
      t: "¿Dónde empieza?",
      modo: "direccion",
      intro: "Ya está partida. Di en qué número <b>empieza</b> (dirección de red) o <b>termina</b> (broadcast) el corral marcado. Truco: el <b>salto</b> entre corrales es 256 ÷ cantidad de corrales.",
      logro: "Las subredes van de salto en salto: en /26 el salto es 64 (.0, .64, .128, .192) y cada una termina justo antes de la siguiente.",
    },
    {
      t: "Corrales a la medida",
      modo: "vlsm",
      rondas: VLSM.length,
      intro: "Cada grupo necesita su corral (recuerda los <b>dos nudos</b>: caben total − 2). Toca un grupo y luego el corral donde va. Si el corral es muy grande, se parte en dos hasta quedar <b>justo</b>. Truco: acomoda primero a los <b>más grandes</b>.",
      logro: "Esto es VLSM: subredes de distinto tamaño en la misma red, de la más grande a la más chica, sin desperdiciar.",
    },
    {
      t: "La colonia crece",
      modo: "vlsm",
      crece: true,
      rondas: CRECE.length,
      intro: "Los grupos van a <b>crecer</b> en 3 años. Dale a cada uno el corral para lo que <b>será</b>, no para lo que es hoy. Y guarda un corral libre para la sede nueva.",
      logro: "Planear crecimiento es dimensionar para el futuro y dejar bloques libres: rehacer el direccionamiento después cuesta mucho.",
    },
    {
      t: "Tu primera VPC",
      modo: "vlsm",
      aws: true,
      rondas: VPC.length,
      intro: "Reto final: una VPC de AWS <b>10.0.0.0/24</b> con subredes públicas, privadas y de datos en dos zonas. En AWS cada subred <b>reserva 5</b> direcciones (no 2) y la más chica es <b>/28</b>.",
    },
  ];

  const j = JuegoDL({
    id: "divide-la-jaula",
    modulo: "2",
    pagina: ["actividad1_calculadora_subredes", "actividad2_diseno_barrio", "actividad4_planificacion_crecimiento"],
    titulo: "Divide la jaula",
    ultimoEsJefe: true,
    niveles: NIVELES,
    aprendido: [
      "Partir una red es prestar bits a la máscara: cada bit duplica la cantidad de subredes y parte su tamaño a la mitad.",
      "Para N subredes iguales necesitas el menor b con 2^b ≥ N (5 subredes → 3 bits → 8 de /27).",
      "Las subredes van de salto en salto (256 ÷ cantidad); el broadcast es la dirección justo antes de la siguiente.",
      "VLSM: cada grupo en la subred más chica que le alcance, ubicando primero las más grandes.",
      "Se dimensiona para el crecimiento y se dejan bloques libres para lo que viene.",
      "En una VPC de AWS cada subred reserva 5 direcciones y la mínima es /28 (11 usables).",
    ],
  });

  const jaula = $("#jaula");
  const dock = $("#grupos");
  let corrales = []; // [{off, n, g}] g = índice del grupo asignado
  let historial = [];
  let grupos = [];
  let elegido = -1;
  let meta = 0; // nivel 1: corrales pedidos · nivel 2: corral marcado
  let pregunta = ""; // nivel 2: "empieza" | "termina"
  let fallos = 0;
  let esperando = false;

  const cfg = () => NIVELES[j.nivel];
  const reservadas = () => (cfg().aws ? 5 : 2);
  const minimo = () => 28; // corrales de 16 direcciones como mínimo (4 × 4 casillas)
  const tam = (n) => 2 ** (32 - n);
  const usables = (n) => tam(n) - reservadas();
  const base = () => (cfg().aws ? "10.0.0." : "192.168.1.");
  const necesita = (g) => (cfg().crece ? g.luego : g.hoy);
  const justo = (h) => {
    for (let n = minimo(); n >= 24; n--) if (usables(n) >= h) return n;
    return 0;
  };

  // Orden Z: los bits pares de la dirección son la columna y los impares la fila.
  const xy = (off) => {
    let x = 0, y = 0;
    for (let b = 0; b < 4; b++) {
      x |= ((off >> (2 * b)) & 1) << b;
      y |= ((off >> (2 * b + 1)) & 1) << b;
    }
    return [x, y];
  };

  const pintar = () => {
    jaula.innerHTML = "";
    corrales.forEach((c, i) => {
      const h = 32 - c.n;
      const w = 2 ** Math.ceil(h / 2);
      const alto = 2 ** Math.floor(h / 2);
      const [x, y] = xy(c.off);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "corral";
      b.style.gridColumn = `${x + 1} / span ${w}`;
      b.style.gridRow = `${y + 1} / span ${alto}`;
      const fin = c.off + tam(c.n) - 1;
      let txt = `<span class="ip">.${c.off}/${c.n}</span>`;
      if (c.n <= 27 || w >= 4) txt += `<span class="cap">${usables(c.n)} lugares</span>`;
      if (c.g != null) {
        const g = grupos[c.g];
        b.classList.add("lleno");
        txt = `<img class="px" src="/img/sprites/${g.sprite}.png" alt="" />` + txt.replace(/<span class="cap">.*<\/span>/, `<span class="cap">${g.nombre}</span>`);
      }
      if (cfg().modo === "direccion") {
        b.disabled = true;
        b.innerHTML = `<span class="num">${i + 1}</span>`;
        if (i === meta) b.classList.add("marcado");
      } else b.innerHTML = txt;
      b.setAttribute(
        "aria-label",
        `Corral ${base()}${c.off}/${c.n}, de .${c.off} a .${fin}, ${usables(c.n)} lugares${c.g != null ? `, ocupado por ${grupos[c.g].nombre}` : ", libre"}`,
      );
      b.addEventListener("click", () => tocar(i));
      jaula.appendChild(b);
    });
    $("#red-base").textContent = `${base()}0/24`;
    $("#red-etq").textContent = cfg().aws ? "VPC" : "Jaula";
    $("#deshacer").disabled = !historial.length;
    pintarGrupos();
  };

  const pintarGrupos = () => {
    dock.hidden = cfg().modo !== "vlsm";
    dock.innerHTML = "";
    grupos.forEach((g, i) => {
      if (corrales.some((c) => c.g === i)) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = `grupo${i === elegido ? " elegido" : ""}`;
      b.setAttribute("aria-pressed", String(i === elegido));
      const cuanto = cfg().crece ? (g.hoy ? `${g.hoy} → <b>${g.luego}</b>` : `<b>${g.luego}</b>`) : `<b>${g.hoy}</b>`;
      b.innerHTML = `<img class="px" src="/img/sprites/${g.sprite}.png" alt="" /><span>${g.nombre}</span><span class="cuanto">${cuanto}</span>`;
      b.addEventListener("click", () => {
        elegido = elegido === i ? -1 : i;
        pintarGrupos();
        if (elegido >= 0) j.hablar(`${g.nombre}: necesitan <b>${necesita(g)}</b> lugares. Ahora toca su corral (o pártelo primero).`);
      });
      dock.appendChild(b);
    });
  };

  const guardar = () => historial.push(corrales.map((c) => ({ ...c })));

  const partir = (i) => {
    const c = corrales[i];
    if (c.n >= minimo()) {
      j.sacudir(jaula.children[i]);
      return j.hablar(
        cfg().aws ? "AWS no deja subredes más chicas que <b>/28</b>." : "Este juego llega hasta <b>/28</b> (16 direcciones): más chico no se parte.",
        "pulpo-ups",
      );
    }
    guardar();
    const n = c.n + 1;
    corrales.splice(i, 1, { off: c.off, n }, { off: c.off + tam(n), n });
    pintar();
    if (cfg().modo === "iguales") avisarIguales();
  };

  const tocar = (i) => {
    if (esperando) return;
    const c = corrales[i];
    if (cfg().modo === "vlsm" && elegido >= 0) return asignar(i);
    if (c.g != null) return j.hablar(`Ese corral ya es de ${grupos[c.g].nombre}. Si quieres moverlos, usa <b>Deshacer</b>.`);
    partir(i);
  };

  const asignar = (i) => {
    const c = corrales[i];
    const g = grupos[elegido];
    const h = necesita(g);
    const ideal = justo(h);
    if (c.g != null) return j.hablar(`Ese corral ya es de ${grupos[c.g].nombre}.`, "pulpo-ups");
    if (usables(c.n) < h) {
      fallos++;
      j.sacudir(jaula.children[i]);
      const hoyCabe = cfg().crece && g.hoy > 0 && usables(c.n) >= g.hoy;
      return j.hablar(
        hoyCabe
          ? `Hoy caben, pero en 3 años serán <b>${h}</b> y este /${c.n} da ${usables(c.n)}.`
          : `No caben: son <b>${h}</b> y un /${c.n} da ${tam(c.n)} − ${reservadas()} = ${usables(c.n)}.${fallos >= 2 ? ` Pista: necesitan un /${ideal}.` : ""}`,
        "pulpo-ups",
      );
    }
    if (c.n !== ideal) {
      // Sobra espacio: el corral se parte en dos y el grupo sigue elegido para el siguiente toque.
      partir(i);
      return j.hablar(`Caben, pero sobra: ${usables(c.n)} lugares para ${h}. Lo partí en dos mitades /${c.n + 1}; sigue tocando hasta que quede justo.`);
    }
    guardar();
    c.g = elegido;
    elegido = -1;
    pintar();
    j.brillar(jaula.children[i]);
    const quedan = grupos.filter((_, k) => !corrales.some((x) => x.g === k)).length;
    if (!quedan) return ganarRonda(`¡Todos tienen su corral justo! Cada grupo en la subred más chica que le alcanza.`);
    j.hablar(`${g.nombre} en <b>${base()}${c.off}/${c.n}</b>: ${usables(c.n)} lugares para ${h}. Siguiente grupo.`, "pulpo-ok");
  };

  const ganarRonda = (texto) => {
    esperando = true;
    const premio = fallos === 0 ? 2 : 1;
    j.brillar(jaula);
    j.ganarPerlas(premio, $("#listo"));
    j.hablar(`${texto}${premio === 2 ? " Sin errores: +2 perlas." : ""}`, "pulpo-ok");
    const fin = j.rondaGanada();
    setTimeout(() => (fin ? j.nivelGanado() : nuevaRonda()), j.quieto ? 900 : 1700);
  };

  const error = (texto, pista) => {
    fallos++;
    j.sacudir(jaula);
    j.hablar(fallos >= 2 && pista ? `${texto} Pista: ${pista}` : texto, "pulpo-ups");
  };

  const avisarIguales = () => {
    const iguales = corrales.every((c) => c.n === corrales[0].n);
    $("#estado").textContent = `${corrales.length} corral${corrales.length === 1 ? "" : "es"}${iguales ? ` iguales de /${corrales[0].n}` : " (todavía no son iguales)"}`;
  };

  const listo = () => {
    if (esperando || $("#j-tablero").hidden) return;
    const m = cfg().modo;
    if (m === "iguales") {
      const bits = Math.ceil(Math.log2(meta));
      const n = 24 + bits;
      const iguales = corrales.every((c) => c.n === corrales[0].n);
      if (!iguales) return error("Los corrales tienen que ser <b>iguales</b>: parte también los grandes.", `todos de /${n}.`);
      if (corrales.length < meta) return error(`Tienes ${corrales.length} y necesitas <b>${meta}</b>. Parte cada corral otra vez.`, `todos de /${n}.`);
      if (corrales.length > 2 ** bits) return error(`Alcanza con menos: con ${2 ** bits} corrales ya tienes ${meta}. Deshaz un corte.`, `${bits} bit${bits > 1 ? "s" : ""} → /${n}.`);
      return ganarRonda(`¡Eso! ${meta} corrales → ${bits} bit${bits > 1 ? "s" : ""} prestado${bits > 1 ? "s" : ""} → <b>${2 ** bits} de /${n}</b> con ${tam(n)} direcciones cada uno.`);
    }
    if (m === "direccion") {
      const v = $("#respuesta").value.trim();
      if (v === "") return j.hablar("Escribe el último número de la dirección.");
      const c = corrales[meta];
      const ok = pregunta === "empieza" ? c.off : c.off + tam(c.n) - 1;
      if (Number(v) === ok)
        return ganarRonda(
          pregunta === "empieza"
            ? `¡Sí! El corral ${meta + 1} empieza en <b>${base()}${ok}</b>: ${meta} × ${tam(c.n)}.`
            : `¡Sí! Termina en <b>${base()}${ok}</b>${ok === 255 ? ", la última de la jaula" : `, justo antes de .${ok + 1}`}. Ese es su broadcast.`,
        );
      const salto = tam(c.n);
      return error(
        pregunta === "termina" && Number(v) === c.off + salto ? "Esa ya es la primera del corral siguiente. Una menos." : "Esa no es.",
        `el salto es 256 ÷ ${corrales.length} = ${salto}; el corral ${meta + 1} empieza en ${meta} × ${salto} = ${c.off}${pregunta === "termina" ? ` y termina en ${c.off} + ${salto} − 1` : ""}.`,
      );
    }
    j.hablar("Toca un grupo y luego su corral. Cuando todos estén adentro, la ronda se gana sola.");
  };

  const nuevaRonda = () => {
    fallos = 0;
    esperando = false;
    elegido = -1;
    historial = [];
    corrales = [{ off: 0, n: 24 }];
    const c = cfg();
    $("#respuesta-caja").hidden = c.modo !== "direccion";
    $("#listo").hidden = c.modo === "vlsm";
    $("#deshacer").hidden = c.modo === "direccion";
    $("#estado").textContent = "";
    if (c.modo === "iguales") {
      meta = j.ronda === 0 ? 2 : elegir([3, 4, 5, 6, 7, 8, 10, 12, 16].filter((x) => x !== meta));
      grupos = [];
      $("#pedido-txt").innerHTML = `Necesito <b>${meta}</b> corrales iguales`;
      j.hablar(j.ronda === 0 ? "Toca la jaula para partirla en dos y luego <b>Listo</b>." : "Parte hasta tener los corrales justos y toca <b>Listo</b>.");
      avisarIguales();
    } else if (c.modo === "direccion") {
      const n = azar(25, 28);
      const k = 2 ** (n - 24);
      corrales = Array.from({ length: k }, (_, i) => ({ off: i * tam(n), n }));
      meta = azar(1, k - 1);
      pregunta = j.ronda < 2 ? "empieza" : elegir(["empieza", "termina"]);
      grupos = [];
      $("#pedido-txt").innerHTML = `Jaula en ${k} corrales /${n}: ¿dónde <b>${pregunta}</b> el corral ${meta + 1}?`;
      $("#respuesta").value = "";
      $("#respuesta").focus();
      j.hablar(`Escribe el último número: ${base()}<b>?</b>`);
    } else {
      const lista = c.aws ? VPC : c.crece ? CRECE : VLSM;
      grupos = lista[j.ronda];
      $("#pedido-txt").innerHTML = c.aws ? "Arma las subredes de la <b>VPC</b>" : `Acomoda a <b>${grupos.length}</b> grupos`;
      j.hablar(c.crece ? "Mira el número en <b>negrita</b>: es lo que serán en 3 años." : "Toca un grupo y luego un corral: si sobra espacio, el corral se parte en dos.");
    }
    pintar();
  };

  $("#deshacer").addEventListener("click", () => {
    if (!historial.length || esperando) return;
    corrales = historial.pop();
    pintar();
    if (cfg().modo === "iguales") avisarIguales();
  });
  $("#listo").addEventListener("click", listo);
  document.addEventListener("keydown", (e) => {
    if ($("#j-tablero").hidden || e.key !== "Enter" || document.activeElement?.tagName === "BUTTON") return;
    e.preventDefault();
    listo();
  });

  j.alEmpezarNivel = () => nuevaRonda();
})();
