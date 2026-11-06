// La red de pesca: máscaras y prefijos CIDR jugando. El corcho marca el /n: cada paso a la izquierda
// duplica la red, cada paso a la derecha la parte a la mitad. Hay que lanzar la red más chica donde
// quepa todo el banco de peces (las direcciones reservadas no sirven para peces).
(() => {
  const $ = (s) => document.querySelector(s);
  const azar = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const CELDAS = 256; // la red se dibuja con 256 cuadros como máximo

  const NIVELES = [
    {
      t: "Cada corcho duplica",
      min: 22,
      max: 30,
      reservadas: 0,
      intro: "El corcho marca el <b>/n</b> de tu red. Cada paso del corcho a la <b>izquierda duplica</b> la red; a la derecha la parte a la mitad. Busca la red del tamaño <b>exacto</b> del banco. Usa el corcho (o las flechas) y luego <b>Lanzar</b>.",
      logro: "Una red /n tiene 2 elevado a (32 − n) direcciones: un bit menos de máscara, el doble de espacio.",
    },
    {
      t: "Los dos nudos",
      min: 20,
      max: 30,
      reservadas: 2,
      intro: "Toda red tiene <b>dos nudos</b> que no atrapan peces: el primero es la <b>dirección de red</b> y el último el <b>broadcast</b>. Ahora caben <b>total − 2</b> peces. Lanza la red <b>más chica</b> donde quepa todo el banco.",
      logro: "Hosts usables = 2^(32 − n) − 2. Ese −2 es la dirección de red y la de broadcast.",
    },
    {
      t: "Sin contador",
      min: 20,
      max: 30,
      reservadas: 2,
      sinContador: true,
      intro: "Se mojó el contador: calcula tú. Truco de pescador: <b>/24 = 256 direcciones</b>. Desde ahí, cada corcho a la izquierda duplica y a la derecha divide entre dos.",
      logro: "Con el ancla /24 = 256 sacas cualquier tamaño de red de cabeza.",
    },
    {
      t: "Lo que dice la máscara",
      min: 20,
      max: 30,
      reservadas: 2,
      reves: true,
      intro: "Ahora el capitán te da la <b>máscara</b> (por ejemplo 255.255.255.224) y tú dices <b>cuántos peces caben</b>. Pista: los bits en 1 de la máscara son el /n.",
      logro: "Máscara y prefijo son lo mismo escrito distinto: 255.255.255.224 = /27 = 30 hosts.",
    },
    {
      t: "Pesca en la nube",
      min: 16,
      max: 28,
      reservadas: 5,
      rondas: 4,
      intro: "Reto final en una subred de AWS. AWS se queda con <b>5 direcciones</b> de cada subred (las 4 primeras y la última), y la subred más chica que deja crear es <b>/28</b>. Lanza la red justa para cada flota de servidores-pez.",
    },
  ];

  const j = JuegoDL({
    id: "la-red-de-pesca",
    modulo: "2",
    pagina: "actividad5_mascaras_red",
    titulo: "La red de pesca",
    ultimoEsJefe: true,
    niveles: NIVELES,
    aprendido: [
      "El /n es cuántos bits fijos tiene la máscara; quedan 32 − n bits para hosts.",
      "Una red /n tiene 2^(32 − n) direcciones. Un corcho a la izquierda, el doble.",
      "En una red normal sirven 2^(32 − n) − 2: se restan la de red y la de broadcast.",
      "La máscara 255.255.255.x es el mismo /n escrito en decimal (/24, /25 = .128, /26 = .192, /27 = .224, /28 = .240).",
      "En AWS cada subred reserva 5 direcciones y la más chica es /28 (11 usables). Pregunta típica del examen.",
    ],
  });

  const rango = $("#corcho");
  const celdas = $("#red-celdas");
  // Se crean una sola vez y se reutilizan en cada lanzamiento.
  for (let i = 0; i < CELDAS; i++) celdas.appendChild(document.createElement("span"));
  const cuadros = [...celdas.children];

  let banco = 0;
  let fallos = 0;
  let fijo = 0; // en modo al revés, el /n que da el capitán
  let esperando = false; // entre una ronda ganada y la siguiente no se puede volver a lanzar
  const peces = (k) => `${k.toLocaleString("es-ES")} ${k === 1 ? "pez" : "peces"}`;

  const cfgNivel = () => NIVELES[j.nivel];
  const total = (n) => 2 ** (32 - n);
  const usables = (n) => total(n) - cfgNivel().reservadas;
  const mascara = (n) => {
    const m = n === 0 ? 0 : (0xffffffff << (32 - n)) >>> 0;
    return [24, 16, 8, 0].map((s) => (m >>> s) & 255).join(".");
  };
  const mejor = (peces) => {
    const c = cfgNivel();
    for (let n = c.max; n >= c.min; n--) if (usables(n) >= peces) return n;
    return c.min;
  };
  const prefijo = () => (cfgNivel().reves ? fijo : Number(rango.value));

  const pintar = () => {
    const c = cfgNivel();
    const n = prefijo();
    const tot = total(n);
    const escala = Math.max(1, tot / CELDAS);
    const visibles = Math.min(tot, CELDAS);
    // Nudos reservados: los del inicio (1 normal, 4 en AWS) y el último (broadcast).
    const inicio = c.reservadas ? Math.ceil((c.reservadas - 1) / escala) : 0;
    const finRes = c.reservadas ? 1 : 0;
    const llenos = c.reves ? 0 : Math.min(visibles - inicio - finRes, Math.ceil(Math.min(banco, usables(n)) / escala));
    celdas.style.setProperty("--cols", String(Math.min(16, Math.max(2, Math.ceil(Math.sqrt(visibles))))));
    cuadros.forEach((q, i) => {
      q.hidden = i >= visibles;
      if (q.hidden) return;
      const nudo = i < inicio || (finRes && i === visibles - 1);
      q.className = nudo ? "nudo" : i < inicio + llenos ? "pez" : "";
    });
    $("#n").textContent = `/${n}`;
    $("#mascara").textContent = mascara(n);
    const oculto = c.sinContador || c.reves;
    $("#contador").hidden = oculto;
    $("#total").textContent = tot.toLocaleString("es-ES");
    $("#usables").textContent = Math.max(0, usables(n)).toLocaleString("es-ES");
    $("#escala").textContent = escala > 1 ? `Cada cuadro = ${escala} direcciones` : "Cada cuadro = 1 dirección";
    const fuera = c.reves ? 0 : banco - usables(n);
    $("#escapan").hidden = c.sinContador || c.reves || fuera <= 0;
    $("#escapan").textContent = `Se escapan ${peces(Math.max(0, fuera))}`;
    rango.setAttribute("aria-valuetext", `/${n}, ${tot} direcciones`);
  };

  const nuevoBanco = () => {
    fallos = 0;
    esperando = false;
    const c = cfgNivel();
    rango.min = String(c.min);
    rango.max = String(c.max);
    $("#mover").hidden = !!c.reves;
    $("#respuesta-caja").hidden = !c.reves;
    if (c.reves) {
      fijo = azar(22, 30);
      $("#pedido-txt").innerHTML = `Máscara <b>${mascara(fijo)}</b>: ¿cuántos peces caben?`;
      $("#respuesta").value = "";
      $("#respuesta").focus();
      j.hablar("Cuenta los bits en 1 de la máscara (ese es el /n) y calcula 2^(32 − n) − 2.");
    } else {
      if (j.nivel === 0) banco = 2 ** azar(2, 10);
      else if (j.nivel === 4) banco = [3, 9, 20, 40, 100, 250, 500, 1000, 2000][azar(0, 8)];
      else banco = azar(3, 1000);
      // Que no salga justo en el mismo /n de la ronda anterior: el corcho siempre arranca en /24.
      rango.value = "24";
      $("#pedido-txt").innerHTML = `Banco de <b>${banco.toLocaleString("es-ES")}</b> peces`;
      j.hablar(
        j.nivel === 4
          ? `Flota de <b>${banco}</b> servidores. Recuerda: AWS se queda con 5 y no baja de /28.`
          : "Mueve el corcho y toca <b>Lanzar</b> cuando la red sea la justa.",
      );
    }
    pintar();
  };

  const acierto = (texto) => {
    esperando = true;
    const premio = fallos === 0 ? 2 : 1;
    j.brillar($("#red"));
    j.ganarPerlas(premio, $("#lanzar"));
    j.hablar(`${texto}${premio === 2 ? " A la primera: +2 perlas." : ""}`, "pulpo-ok");
    const fin = j.rondaGanada();
    setTimeout(() => (fin ? j.nivelGanado() : nuevoBanco()), j.quieto ? 900 : 1600);
  };

  const error = (texto, pista) => {
    fallos++;
    j.sacudir($("#red"));
    j.hablar(fallos >= 2 ? `${texto} Pista: ${pista}` : texto, "pulpo-ups");
  };

  const lanzar = () => {
    if ($("#j-tablero").hidden || esperando) return;
    const c = cfgNivel();
    if (c.reves) {
      if ($("#respuesta").value === "") return j.hablar("Escribe cuántos peces caben.");
      const v = Number($("#respuesta").value);
      const ok = usables(fijo);
      if (v === ok)
        return acierto(`¡Eso! ${mascara(fijo)} es <b>/${fijo}</b>: ${total(fijo)} direcciones − 2 = <b>${ok}</b> peces.`);
      if (v === total(fijo)) return error("Casi: ese es el total. Faltan los dos nudos.", `${total(fijo)} − 2.`);
      return error("Esa no es.", `${mascara(fijo)} = /${fijo}, o sea 2^${32 - fijo} − 2.`);
    }
    const n = prefijo();
    const ideal = mejor(banco);
    if (n === ideal) {
      const sobran = usables(n) - banco;
      return acierto(
        `¡Red justa! <b>/${n}</b> (${mascara(n)}) da ${usables(n).toLocaleString("es-ES")} lugares para ${peces(banco)}${sobran ? `; sobran ${sobran}, y una red más chica no alcanza` : ""}.`,
      );
    }
    if (usables(n) < banco)
      return error(
        `Se escaparon ${peces(banco - usables(n))}: la red es muy chica. Corcho a la izquierda.`,
        `la justa es /${ideal}.`,
      );
    error(
      `Atrapaste todo, pero la red es enorme y la barca se hunde: sobran ${(usables(n) - banco).toLocaleString("es-ES")} lugares. Corcho a la derecha.`,
      `la justa es /${ideal}.`,
    );
  };

  const mover = (d) => {
    const v = Math.min(Number(rango.max), Math.max(Number(rango.min), Number(rango.value) + d));
    rango.value = String(v);
    pintar();
  };

  rango.addEventListener("input", pintar);
  $("#mas-grande").addEventListener("click", () => mover(-1));
  $("#mas-chica").addEventListener("click", () => mover(1));
  $("#lanzar").addEventListener("click", lanzar);
  document.addEventListener("keydown", (e) => {
    if ($("#j-tablero").hidden) return;
    if (e.key === "Enter") {
      e.preventDefault();
      lanzar();
    } else if (!cfgNivel().reves && document.activeElement !== rango) {
      if (e.key === "ArrowLeft") mover(-1);
      else if (e.key === "ArrowRight") mover(1);
    }
  });

  j.alEmpezarNivel = () => nuevoBanco();
})();
