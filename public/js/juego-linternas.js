// Linternas del abismo: binario jugando. Cada linterna es un bit (128 … 1) y la luz es la suma.
// Niveles: un bit, combinar, sin contador, al revés (binario → decimal) y reto final con una IP.
(() => {
  const $ = (s) => document.querySelector(s);
  const azar = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const POT = [128, 64, 32, 16, 8, 4, 2, 1];
  const IPS = ["192.168.1.10", "10.0.12.200", "172.16.5.33", "192.168.100.254"];

  const j = JuegoDL({
    id: "linternas-del-abismo",
    modulo: "2",
    pagina: "actividad3_conversor_binario",
    titulo: "Linternas del abismo",
    ultimoEsJefe: true,
    niveles: [
      {
        t: "Una sola linterna",
        intro: "Cada linterna brilla <b>el doble</b> que la de su derecha: 1, 2, 4, 8… hasta 128. La rapa te pedirá una luz que se logra con <b>una sola</b> linterna. Toca la linterna (o usa las teclas 1 a 8) y luego Iluminar.",
        logro: "Ya sabes cuánto vale cada posición: eso es el valor posicional del binario.",
      },
      {
        t: "Combina la luz",
        intro: "Ahora pide números que necesitan <b>dos o tres</b> linternas a la vez. El contador de luz te ayuda a sumar.",
        logro: "Juntar linternas es sumar potencias de 2. Así se escribe cualquier número en binario.",
      },
      {
        t: "Sin contador",
        intro: "Se apagó el contador: calcula tú. Truco de buzo: <b>empieza por la linterna más grande que quepa</b>, réstala, y sigue con lo que queda.",
        logro: "Ese truco (la más grande que quepa) es el método que se usa a mano en los exámenes de redes.",
      },
      {
        t: "Al revés",
        intro: "Ahora la rapa enciende sus linternas y tú dices <b>cuánta luz es</b>. Suma solo las encendidas y escribe el número.",
        logro: "Ya lees binario: suma los valores donde hay un 1.",
      },
      {
        t: "La dirección del arrecife",
        rondas: 4,
        intro: "Reto final. Una dirección IP son <b>4 números de 0 a 255</b>, y cada uno ocupa 8 bits: justo tus 8 linternas. Escribe en binario cada parte de la IP, una por una.",
      },
    ],
    aprendido: [
      "Cada bit vale el doble que el de su derecha: 128, 64, 32, 16, 8, 4, 2, 1.",
      "Para pasar a binario: la más grande que quepa, réstala y sigue.",
      "Para leer binario: suma los valores donde hay un 1.",
      "8 bits forman un <b>octeto</b>, que va de 0 a 255.",
      "Una IPv4 son 4 octetos: 32 bits en total. Lo vas a usar en máscaras y subredes.",
    ],
  });

  const botones = [...document.querySelectorAll(".linterna")];
  let objetivo = 0;
  let fallos = 0;
  let ip = null;
  let esperando = false; // entre una ronda ganada y la siguiente no se puede volver a iluminar
  const modoReves = () => j.nivel === 3;

  const encendidas = () => botones.filter((b) => b.getAttribute("aria-pressed") === "true");
  const suma = () => encendidas().reduce((a, b) => a + Number(b.dataset.valor), 0);
  const bits = (n) => POT.map((p) => (n & p ? 1 : 0));
  const desglose = (n) => POT.filter((p) => n & p).join(" + ") || "0";

  const poner = (b, on) => {
    b.setAttribute("aria-pressed", String(on));
    b.querySelector(".bit").textContent = on ? "1" : "0";
    b.setAttribute("aria-label", `Linterna de ${b.dataset.valor}, ${on ? "encendida" : "apagada"}`);
  };
  const pintarLuz = () => ($("#luz").textContent = suma());

  const nuevoObjetivo = () => {
    fallos = 0;
    esperando = false;
    botones.forEach((b) => {
      poner(b, false);
      b.classList.remove("sugerida");
      b.disabled = false;
    });
    $("#ip").hidden = true;
    $("#respuesta-caja").hidden = !modoReves();
    $("#luz-caja").hidden = j.nivel >= 2;
    const n = j.nivel;
    if (n === 0) objetivo = POT[azar(0, 7)];
    else if (n === 1) {
      const k = azar(2, 3);
      const elegidas = [...POT.slice(1)].sort(() => Math.random() - 0.5).slice(0, k);
      objetivo = elegidas.reduce((a, b) => a + b, 0);
    } else if (n === 2 || n === 3) objetivo = azar(1, 255);
    else {
      if (j.ronda === 0) ip = IPS[azar(0, IPS.length - 1)].split(".").map(Number);
      objetivo = ip[j.ronda];
      $("#ip").hidden = false;
      $("#ip").innerHTML = ip.map((o, i) => (i === j.ronda ? `<mark>${o}</mark>` : o)).join(".");
    }
    if (modoReves()) {
      bits(objetivo).forEach((v, i) => poner(botones[i], !!v));
      botones.forEach((b) => (b.disabled = true));
      $("#pedido-txt").innerHTML = "¿Cuánta luz tengo? <b>?</b>";
      $("#respuesta").value = "";
      $("#respuesta").focus();
      j.hablar("Mira qué linternas tiene encendidas la rapa y suma sus valores.");
    } else {
      $("#pedido-txt").innerHTML = `Necesito <b>${objetivo}</b> lúmenes`;
      j.hablar(
        j.nivel === 4
          ? `Parte ${j.ronda + 1} de la IP: <b>${objetivo}</b>. Enciende sus 8 bits.`
          : "Enciende las linternas y toca <b>Iluminar</b> cuando creas que la luz es exacta.",
      );
    }
    pintarLuz();
  };

  const acierto = () => {
    esperando = true;
    const premio = fallos === 0 ? 2 : 1;
    j.brillar($("#pedido"));
    j.ganarPerlas(premio, $("#iluminar"));
    const binario = bits(objetivo).join("");
    j.hablar(
      `¡Exacto! <b>${objetivo}</b> en binario es <b>${binario}</b> (${desglose(objetivo)}).${premio === 2 ? " A la primera: +2 perlas." : ""}`,
      "pulpo-ok",
    );
    const fin = j.rondaGanada();
    setTimeout(() => (fin ? j.nivelGanado() : nuevoObjetivo()), j.quieto ? 900 : 1400);
  };

  const error = (texto) => {
    fallos++;
    j.sacudir($("#pedido"));
    let ayuda = texto;
    if (fallos >= 2 && !modoReves()) {
      // Después de 2 intentos se marcan las linternas correctas, sin encenderlas.
      bits(objetivo).forEach((v, i) => botones[i].classList.toggle("sugerida", !!v));
      ayuda += ` Pista: ${objetivo} = ${desglose(objetivo)}. Te marqué las linternas.`;
    } else if (fallos >= 2) ayuda += ` Pista: ${desglose(objetivo)}.`;
    j.hablar(ayuda, "pulpo-ups");
  };

  const iluminar = () => {
    if ($("#j-tablero").hidden || esperando) return;
    if (modoReves()) {
      const v = Number($("#respuesta").value);
      if ($("#respuesta").value === "") return j.hablar("Escribe un número de 0 a 255.");
      if (v === objetivo) return acierto();
      return error(`Esa no es. Suma solo las que están encendidas (las que tienen un 1).`);
    }
    const s = suma();
    if (s === objetivo) return acierto();
    const d = s - objetivo;
    error(d > 0 ? `Te pasaste por ${d}: apaga alguna.` : `Te faltan ${-d} lúmenes.`);
  };

  botones.forEach((b) =>
    b.addEventListener("click", () => {
      poner(b, b.getAttribute("aria-pressed") !== "true");
      pintarLuz();
    }),
  );
  $("#iluminar").addEventListener("click", iluminar);
  document.addEventListener("keydown", (e) => {
    if ($("#j-tablero").hidden) return;
    if (e.key === "Enter") {
      e.preventDefault();
      iluminar();
    } else if (/^[1-8]$/.test(e.key) && !modoReves()) {
      botones[Number(e.key) - 1].click();
    }
  });

  j.alEmpezarNivel = () => nuevoObjetivo();
})();
