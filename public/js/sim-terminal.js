// Simulador de terminal Linux de DiveLearn: sistema de archivos de mentira en memoria,
// comandos básicos con tuberías (|) y redirecciones (> >>), y misiones de la guía de laboratorio
// que se revisan después de cada comando. El progreso se guarda en localStorage "divelearn-sims".
(() => {
  const CLAVE = "divelearn-sims";
  const HOME = "/home/buzo";
  const XP_MISION = 20;

  // ── Sistema de archivos inicial ──
  const dir = (hijos = {}) => ({ t: "d", m: "rwxr-xr-x", h: hijos });
  const arch = (c, m = "rw-r--r--") => ({ t: "f", m, c });
  const LOG = [
    "2026-11-02 08:00:01 INFO  servidor arrancando",
    "2026-11-02 08:00:03 INFO  conectado a la base de datos",
    "2026-11-02 08:14:22 WARN  memoria al 81 %",
    "2026-11-02 08:15:09 ERROR timeout al llamar a pagos-api",
    "2026-11-02 08:15:40 INFO  reintento OK",
    "2026-11-02 09:02:11 ERROR disco /data al 95 %",
    "2026-11-02 09:30:00 INFO  backup nocturno terminado",
    "2026-11-02 10:05:52 ERROR certificado TLS vence en 3 días",
    "2026-11-02 10:06:00 INFO  health check OK",
  ].join("\n");
  const inicial = () =>
    dir({
      home: dir({
        buzo: dir({
          "bienvenida.txt": arch(
            "Hola, buzo. Este servidor es tuyo para practicar.\nNada de lo que hagas aquí rompe algo de verdad.\nSigue las misiones de la guía de la izquierda.",
          ),
          ".secreto": arch("La contraseña del cofre es: burbuja42\n(los archivos que empiezan con punto están ocultos)"),
          logs: dir({ "app.log": arch(LOG), "acceso.log": arch("10.0.1.5 GET /\n10.0.1.9 GET /login\n10.0.1.5 POST /pagar") }),
          scripts: dir({ "deploy.sh": arch('#!/bin/bash\necho "desplegando la app..."') }),
          tmp: dir({ "cache1.tmp": arch("basura"), "cache2.tmp": arch("más basura") }),
        }),
      }),
      etc: dir({ hostname: arch("divelearn"), "os-release": arch('NAME="DiveLearn Linux"\nVERSION="26.11"') }),
      var: dir({ log: dir({ syslog: arch("kernel: arranque normal") }) }),
      tmp: dir(),
    });

  // ── Estado ──
  let raiz, cwd, hechas, historial;
  const cargar = () => {
    try {
      const s = JSON.parse(localStorage.getItem(CLAVE) || "{}").terminal;
      if (s && s.fs) return ([raiz, cwd, hechas, historial] = [s.fs, s.cwd, s.hechas, s.hist || []]);
    } catch {}
    [raiz, cwd, hechas, historial] = [inicial(), HOME, 0, []];
  };
  const guardar = () => {
    try {
      const todo = JSON.parse(localStorage.getItem(CLAVE) || "{}");
      todo.terminal = { fs: raiz, cwd, hechas, hist: historial.slice(-50) };
      localStorage.setItem(CLAVE, JSON.stringify(todo));
    } catch {}
  };

  // ── Rutas ──
  const normalizar = (ruta) => {
    if (ruta === "~" || ruta.startsWith("~/")) ruta = HOME + ruta.slice(1);
    const partes = (ruta.startsWith("/") ? [] : cwd.split("/")).concat(ruta.split("/"));
    const pila = [];
    for (const p of partes) {
      if (!p || p === ".") continue;
      if (p === "..") pila.pop();
      else pila.push(p);
    }
    return "/" + pila.join("/");
  };
  const nodo = (abs) => abs.split("/").filter(Boolean).reduce((n, p) => (n && n.t === "d" ? n.h[p] : undefined), raiz);
  const padre = (abs) => {
    const i = abs.lastIndexOf("/");
    return [nodo(abs.slice(0, i) || "/"), abs.slice(i + 1)];
  };
  const corta = (abs) => (abs === HOME ? "~" : abs.startsWith(HOME + "/") ? "~" + abs.slice(HOME.length) : abs);

  // ── Comandos ──
  class Fallo extends Error {}
  const err = (m) => {
    throw new Fallo(m);
  };
  const opciones = (args) => {
    const f = new Set();
    const resto = [];
    for (const a of args) {
      if (/^-[a-zA-Z]+$/.test(a)) [...a.slice(1)].forEach((c) => f.add(c));
      else resto.push(a);
    }
    return [f, resto];
  };
  const leer = (ruta, cmd) => {
    const n = nodo(normalizar(ruta));
    if (!n) err(`${cmd}: ${ruta}: No existe el archivo o el directorio`);
    if (n.t === "d") err(`${cmd}: ${ruta}: Es un directorio`);
    return n.c;
  };
  const lineas = (txt) => (txt === "" ? [] : txt.replace(/\n$/, "").split("\n"));
  const copiar = (n) => JSON.parse(JSON.stringify(n));

  const AYUDA = {
    pwd: "pwd: muestra en qué carpeta estás (print working directory).",
    ls: "ls [-a] [-l] [ruta]: lista archivos. -a muestra los ocultos, -l el detalle con permisos.",
    cd: "cd ruta: entra a una carpeta. cd .. sube un nivel, cd ~ vuelve a tu casa.",
    cat: "cat archivo: muestra el contenido de un archivo.",
    echo: 'echo texto: repite el texto. Con > lo guarda en un archivo: echo "hola" > nota.txt',
    mkdir: "mkdir [-p] carpeta: crea una carpeta. -p crea también las de en medio.",
    touch: "touch archivo: crea un archivo vacío.",
    cp: "cp origen destino: copia un archivo (-r para carpetas).",
    mv: "mv origen destino: mueve o renombra.",
    rm: "rm [-r] ruta: borra. -r borra carpetas con todo lo de adentro. En Linux no hay papelera.",
    grep: "grep [-i] [-c] patrón [archivo]: busca líneas que contienen el patrón.",
    wc: "wc [-l]: cuenta líneas, palabras y caracteres. -l solo líneas.",
    head: "head [-n N] archivo: las primeras líneas.",
    tail: "tail [-n N] archivo: las últimas líneas.",
    chmod: "chmod +x archivo | chmod 755 archivo: cambia permisos.",
    find: "find [ruta] -name patrón: busca archivos por nombre (* sirve de comodín).",
    tree: "tree [ruta]: dibuja el árbol de carpetas.",
    whoami: "whoami: tu usuario.",
    date: "date: fecha y hora.",
    history: "history: los comandos que escribiste.",
    clear: "clear: limpia la pantalla.",
    man: "man comando: ayuda de un comando.",
  };

  const permisos = (n) => (n.t === "d" ? "d" : "-") + n.m;
  const C = {
    help: () => "Comandos: " + Object.keys(AYUDA).join(", ") + "\nEscribe man <comando> para ver cómo se usa cada uno.",
    man: (a) => AYUDA[a[0]] || err(`man: no hay ayuda para ${a[0] || "nada"}. Prueba con help.`),
    pwd: () => cwd,
    whoami: () => "buzo",
    date: () => new Date().toString(),
    history: () => historial.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join("\n"),
    echo: (a) => a.join(" "),
    ls: (a) => {
      const [f, r] = opciones(a);
      const ruta = r[0] || ".";
      const n = nodo(normalizar(ruta));
      if (!n) err(`ls: no se puede acceder a '${ruta}': No existe el archivo o el directorio`);
      if (n.t === "f") return ruta;
      let nombres = Object.keys(n.h).sort();
      if (!f.has("a")) nombres = nombres.filter((x) => !x.startsWith("."));
      else nombres = [".", "..", ...nombres];
      const marca = (x) => (n.h[x] && n.h[x].t === "d" ? x + "/" : n.h[x] && n.h[x].m.includes("x") ? x + "*" : x);
      if (f.has("l"))
        return nombres
          .map((x) => {
            const h = n.h[x] || n;
            const tam = h.t === "d" ? 4096 : h.c.length;
            return `${permisos(h)} 1 buzo buzo ${String(tam).padStart(5)} nov  2 10:00 ${marca(x)}`;
          })
          .join("\n");
      return nombres.map(marca).join("  ");
    },
    cd: (a) => {
      const abs = normalizar(a[0] || "~");
      const n = nodo(abs);
      if (!n) err(`cd: ${a[0]}: No existe el archivo o el directorio`);
      if (n.t !== "d") err(`cd: ${a[0]}: No es un directorio`);
      cwd = abs;
      return "";
    },
    cat: (a, entrada) => (a.length ? a.map((x) => leer(x, "cat")).join("\n") : entrada),
    mkdir: (a) => {
      const [f, r] = opciones(a);
      if (!r.length) err("mkdir: falta un operando");
      for (const x of r) {
        const abs = normalizar(x);
        if (f.has("p")) {
          let n = raiz;
          for (const p of abs.split("/").filter(Boolean)) {
            n.h[p] = n.h[p] || dir();
            n = n.h[p];
            if (n.t !== "d") err(`mkdir: ${x}: No es un directorio`);
          }
          continue;
        }
        const [pd, nom] = padre(abs);
        if (!pd) err(`mkdir: no se puede crear el directorio '${x}': No existe el archivo o el directorio`);
        if (pd.h[nom]) err(`mkdir: no se puede crear el directorio '${x}': El archivo ya existe`);
        pd.h[nom] = dir();
      }
      return "";
    },
    touch: (a) => {
      for (const x of a) {
        const [pd, nom] = padre(normalizar(x));
        if (!pd) err(`touch: no se puede tocar '${x}': No existe el archivo o el directorio`);
        pd.h[nom] = pd.h[nom] || arch("");
      }
      return "";
    },
    rm: (a) => {
      const [f, r] = opciones(a);
      if (!r.length) err("rm: falta un operando");
      for (const x of r) {
        const abs = normalizar(x);
        const [pd, nom] = padre(abs);
        const n = pd && pd.h[nom];
        if (!n) err(`rm: no se puede borrar '${x}': No existe el archivo o el directorio`);
        if (abs === HOME || abs === "/" || cwd.startsWith(abs + "/") || cwd === abs) err(`rm: mejor no borres '${x}': es donde estás parado`);
        if (n.t === "d" && !f.has("r")) err(`rm: no se puede borrar '${x}': Es un directorio (usa rm -r)`);
        delete pd.h[nom];
      }
      return "";
    },
    cp: (a) => mover(a, "cp", false),
    mv: (a) => mover(a, "mv", true),
    grep: (a, entrada) => {
      const [f, r] = opciones(a);
      const [pat, ...archs] = r;
      if (!pat) err("grep: falta el patrón. Uso: grep palabra archivo");
      const re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), f.has("i") ? "i" : "");
      const txt = archs.length ? archs.map((x) => leer(x, "grep")).join("\n") : entrada;
      const res = lineas(txt).filter((l) => re.test(l) !== f.has("v"));
      return f.has("c") ? String(res.length) : res.join("\n");
    },
    wc: (a, entrada) => {
      const [f, r] = opciones(a);
      const txt = r.length ? leer(r[0], "wc") : entrada;
      const l = lineas(txt).length;
      if (f.has("l")) return String(l);
      return `${l} ${txt.split(/\s+/).filter(Boolean).length} ${txt.length}`;
    },
    head: (a, entrada) => cortar(a, entrada, "head"),
    tail: (a, entrada) => cortar(a, entrada, "tail"),
    chmod: (a) => {
      const [modo, x] = a;
      if (!x) err("chmod: uso: chmod +x archivo  o  chmod 755 archivo");
      const n = nodo(normalizar(x));
      if (!n) err(`chmod: no se puede acceder a '${x}': No existe el archivo o el directorio`);
      if (/^[0-7]{3}$/.test(modo)) n.m = [...modo].map((d) => ["r", "w", "x"].map((c, i) => (d & (4 >> i) ? c : "-")).join("")).join("");
      else if (/^[ugoa]*[+-][rwx]+$/.test(modo)) {
        const [, quien, signo, que] = modo.match(/^([ugoa]*)([+-])([rwx]+)$/);
        const grupos = !quien || quien.includes("a") ? [0, 1, 2] : [...quien].map((q) => "ugo".indexOf(q));
        const m = [...n.m];
        for (const g of grupos) for (const c of que) m[g * 3 + "rwx".indexOf(c)] = signo === "+" ? c : "-";
        n.m = m.join("");
      } else err(`chmod: modo no válido: '${modo}'`);
      return "";
    },
    find: (a) => {
      let ruta = ".";
      let pat = "*";
      for (let i = 0; i < a.length; i++) {
        if (a[i] === "-name") pat = a[++i] || "*";
        else ruta = a[i];
      }
      const re = new RegExp("^" + pat.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$");
      const base = nodo(normalizar(ruta));
      if (!base) err(`find: '${ruta}': No existe el archivo o el directorio`);
      const out = [];
      const andar = (n, p, nom) => {
        if (re.test(nom)) out.push(p);
        if (n.t === "d") for (const k of Object.keys(n.h).sort()) andar(n.h[k], `${p}/${k}`, k);
      };
      andar(base, ruta.replace(/\/$/, ""), ruta.split("/").pop());
      return out.join("\n");
    },
    tree: (a) => {
      const ruta = a[0] || ".";
      const base = nodo(normalizar(ruta));
      if (!base || base.t !== "d") err(`tree: ${ruta}: no es un directorio`);
      const out = [ruta];
      const andar = (n, pre) => {
        const ks = Object.keys(n.h).filter((k) => !k.startsWith(".")).sort();
        ks.forEach((k, i) => {
          const ult = i === ks.length - 1;
          out.push(pre + (ult ? "└── " : "├── ") + k);
          if (n.h[k].t === "d") andar(n.h[k], pre + (ult ? "    " : "│   "));
        });
      };
      andar(base, "");
      return out.join("\n");
    },
    sudo: () => err("sudo: buen intento. Aquí no hace falta ser root para aprender."),
  };

  function mover(a, cmd, borrar) {
    const [f, r] = opciones(a);
    if (r.length < 2) err(`${cmd}: falta el destino. Uso: ${cmd} origen destino`);
    const [ori, des] = r;
    const absO = normalizar(ori);
    const [pO, nO] = padre(absO);
    const n = pO && pO.h[nO];
    if (!n) err(`${cmd}: no se puede efectuar 'stat' sobre '${ori}': No existe el archivo o el directorio`);
    if (n.t === "d" && cmd === "cp" && !f.has("r")) err(`cp: se omite el directorio '${ori}' (usa cp -r)`);
    let absD = normalizar(des);
    const nd = nodo(absD);
    if (nd && nd.t === "d") absD += "/" + nO;
    const [pD, nD] = padre(absD);
    if (!pD || pD.t !== "d") err(`${cmd}: no se puede crear '${des}': No existe el archivo o el directorio`);
    pD.h[nD] = borrar ? n : copiar(n);
    if (borrar) delete pO.h[nO];
    return "";
  }
  function cortar(a, entrada, cmd) {
    let n = 10;
    const r = [];
    for (let i = 0; i < a.length; i++) {
      if (a[i] === "-n") n = parseInt(a[++i], 10) || 10;
      else if (/^-\d+$/.test(a[i])) n = parseInt(a[i].slice(1), 10);
      else r.push(a[i]);
    }
    const ls = lineas(r.length ? leer(r[0], cmd) : entrada);
    return (cmd === "head" ? ls.slice(0, n) : ls.slice(-n)).join("\n");
  }

  // ── Intérprete: comillas, tuberías y redirecciones ──
  const tokens = (s) => {
    const out = [];
    let cur = "";
    let q = null;
    let hay = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (q) {
        if (c === q) q = null;
        else cur += c;
      } else if (c === '"' || c === "'") {
        q = c;
        hay = true;
      } else if (c === "|" || c === ">") {
        if (hay || cur) out.push(cur);
        [cur, hay] = ["", false];
        if (c === ">" && s[i + 1] === ">") out.push({ op: ">>" }), i++;
        else out.push({ op: c });
      } else if (/\s/.test(c)) {
        if (hay || cur) out.push(cur);
        [cur, hay] = ["", false];
      } else cur += c;
    }
    if (q) err("bash: falta cerrar una comilla");
    if (hay || cur) out.push(cur);
    return out;
  };

  // Ejecuta una línea; devuelve { salida, error, pasos } para pintar y para revisar misiones.
  const ejecutar = (linea) => {
    const pasos = [];
    try {
      const tk = tokens(linea);
      const segmentos = [[]];
      for (const t of tk) {
        if (t.op === "|") segmentos.push([]);
        else segmentos[segmentos.length - 1].push(t);
      }
      let entrada = "";
      for (let i = 0; i < segmentos.length; i++) {
        const seg = segmentos[i];
        let redir = null;
        const k = seg.findIndex((t) => t.op);
        if (k >= 0) {
          redir = { op: seg[k].op, a: seg[k + 1] };
          if (typeof redir.a !== "string") err("bash: falta el archivo después de " + redir.op);
          seg.splice(k);
        }
        const [cmd, ...args] = seg;
        if (!cmd) err("bash: error de sintaxis cerca de '|'");
        if (cmd === "clear") return { limpiar: true, pasos: [{ cmd }] };
        if (!C[cmd]) err(`bash: ${cmd}: no se encontró la orden. Escribe help para ver los comandos.`);
        let salida = C[cmd](args, entrada);
        pasos.push({ cmd, args, salida });
        if (redir) {
          const [pd, nom] = padre(normalizar(redir.a));
          if (!pd || pd.t !== "d") err(`bash: ${redir.a}: No existe el archivo o el directorio`);
          if (pd.h[nom] && pd.h[nom].t === "d") err(`bash: ${redir.a}: Es un directorio`);
          const previo = redir.op === ">>" && pd.h[nom] ? pd.h[nom].c + "\n" : "";
          pd.h[nom] = { ...(pd.h[nom] || arch("")), c: previo + salida };
          salida = "";
        }
        entrada = salida;
      }
      return { salida: entrada, pasos };
    } catch (e) {
      if (e instanceof Fallo) return { error: e.message, pasos };
      throw e;
    }
  };

  // ── Misiones de la guía ──
  const usa = (p, cmd, f = () => true) => p.some((x) => x.cmd === cmd && f(x));
  const existe = (r, t) => {
    const n = nodo(r);
    return !!n && (!t || n.t === t);
  };
  const MISIONES = [
    {
      t: "¿Dónde estoy?",
      h: "Te acaban de dar acceso a un servidor. Lo primero, como al saltar al agua: ubicarte.",
      o: "Muestra la carpeta en la que estás con <code>pwd</code>.",
      p: "Escribe pwd y presiona Enter.",
      y: "En la nube casi siempre entras por SSH o por Session Manager a una máquina que no ves. pwd te dice dónde estás parada antes de tocar nada.",
      ok: (p) => usa(p, "pwd"),
    },
    {
      t: "Mira alrededor",
      h: "Ya sabes dónde estás. Ahora, ¿qué hay aquí?",
      o: "Lista los archivos con <code>ls</code>.",
      p: "ls a secas. Las carpetas salen con / al final.",
      y: "ls es el comando que más vas a escribir en tu vida. Las carpetas terminan en / y los ejecutables en *.",
      ok: (p) => usa(p, "ls"),
    },
    {
      t: "Lo que no se ve",
      h: "Dicen que hay un archivo escondido en tu casa con una contraseña.",
      o: "Muestra también los archivos ocultos con <code>ls -a</code> y lee el secreto con <code>cat</code>.",
      p: "ls -a y luego cat .secreto (con el punto).",
      y: "En Linux, un archivo que empieza con punto está oculto. Así se guardan configuraciones como .bashrc o .aws/credentials: no se ven, pero ahí están.",
      ok: (p) => usa(p, "cat", (x) => x.args.some((a) => normalizar(a) === HOME + "/.secreto")),
    },
    {
      t: "Baja a los logs",
      h: "La app del servidor se queja. Los registros (logs) están en la carpeta logs.",
      o: "Entra a la carpeta con <code>cd logs</code>.",
      p: "cd logs. Si te pierdes, cd ~ te devuelve a casa.",
      y: "cd cambia de carpeta. cd .. sube un nivel y cd ~ vuelve a tu casa desde donde estés.",
      ok: () => cwd === HOME + "/logs",
    },
    {
      t: "Lee el registro",
      h: "Dentro hay un app.log. Toca leerlo.",
      o: "Muestra el contenido con <code>cat app.log</code>.",
      p: "cat app.log",
      y: "Leer logs es la mitad del trabajo de soporte. En AWS los vas a ver en CloudWatch Logs, pero la idea es la misma: líneas con fecha, nivel y mensaje.",
      ok: (p) => usa(p, "cat", (x) => x.args.some((a) => normalizar(a) === HOME + "/logs/app.log")),
    },
    {
      t: "Busca los errores",
      h: "Leer todo a ojo no escala. Filtra solo lo que importa.",
      o: "Muestra solo las líneas con ERROR: <code>grep ERROR app.log</code>.",
      p: "grep distingue mayúsculas: escribe ERROR en mayúsculas (o usa grep -i).",
      y: "grep encuentra la aguja en el pajar. En un log de millones de líneas es lo primero que se usa.",
      ok: (p) => usa(p, "grep", (x) => /error/i.test(x.args.join(" ")) && x.salida.length > 0),
    },
    {
      t: "Cuenta los errores",
      h: "Tu jefa pregunta: ¿cuántos errores hubo hoy?",
      o: "Une dos comandos con una tubería: <code>grep ERROR app.log | wc -l</code>.",
      p: "La barra | pasa la salida del primer comando como entrada del segundo.",
      y: "La tubería | es la idea más poderosa de Linux: comandos pequeños que se encadenan. Así se arman alertas y reportes sin programar.",
      ok: (p) => usa(p, "grep") && usa(p, "wc"),
    },
    {
      t: "Prepara el respaldo",
      h: "Antes de tocar nada, se hace un backup. Siempre.",
      o: "Crea la carpeta <code>~/backup</code> con <code>mkdir</code>.",
      p: "mkdir ~/backup (funciona desde cualquier carpeta gracias a ~).",
      y: "Regla de oro de producción: respaldo primero, cambio después. Lo mismo con un snapshot de EBS antes de actualizar una instancia.",
      ok: () => existe(HOME + "/backup", "d"),
    },
    {
      t: "Copia el log",
      h: "Guarda una copia del log en el respaldo.",
      o: "Copia <code>app.log</code> a <code>~/backup</code> con <code>cp</code>.",
      p: "cp ~/logs/app.log ~/backup/",
      y: "cp copia y mv mueve. Si el destino es una carpeta, el archivo entra con su mismo nombre.",
      ok: () => existe(HOME + "/backup/app.log", "f"),
    },
    {
      t: "Deja una nota",
      h: "Quien venga después debe saber qué pasó.",
      o: 'Escribe una nota en un archivo: <code>echo "revisar disco y certificado" > ~/backup/nota.txt</code>.',
      p: "El > manda la salida de echo a un archivo. Si el archivo existía, lo reemplaza; >> agrega al final.",
      y: "Con > y >> guardas la salida de cualquier comando. Así nacen los reportes automáticos y los scripts de user data.",
      ok: () => {
        const n = nodo(HOME + "/backup/nota.txt");
        return !!n && n.t === "f" && n.c.trim().length > 0;
      },
    },
    {
      t: "Permiso para desplegar",
      h: "El script scripts/deploy.sh no arranca: no tiene permiso de ejecución.",
      o: "Revisa los permisos con <code>ls -l</code> y dáselo con <code>chmod +x</code>.",
      p: "chmod +x ~/scripts/deploy.sh y luego ls -l ~/scripts para ver la x.",
      y: "rwx = leer, escribir, ejecutar, para dueño, grupo y otros. Un script de user data o de CodeDeploy sin +x falla en silencio: pasa muchísimo.",
      ok: () => {
        const n = nodo(HOME + "/scripts/deploy.sh");
        return !!n && n.m[2] === "x";
      },
    },
    {
      t: "Limpieza final",
      h: "La carpeta tmp está llena de basura que ocupa disco.",
      o: "Borra la carpeta <code>~/tmp</code> completa con <code>rm -r</code>.",
      p: "rm -r ~/tmp. Ojo: en Linux no hay papelera.",
      y: "rm no pregunta y no tiene papelera. Por eso hiciste el backup primero. En la nube, lo equivalente es borrar un bucket o un volumen: siempre con evidencia antes.",
      ok: () => !existe(HOME + "/tmp"),
    },
  ];

  // ── Interfaz ──
  const $ = (s) => document.querySelector(s);
  const pantalla = $("#term-salida");
  const input = $("#term-input");
  const prompt = $("#term-prompt");
  let idxHist = 0;

  const linea = (txt, cls = "") => {
    const el = document.createElement("div");
    el.className = "tl " + cls;
    el.textContent = txt;
    pantalla.appendChild(el);
  };
  const ps1 = () => `buzo@divelearn:${corta(cwd)}$`;
  const pintarPrompt = () => (prompt.textContent = ps1());
  const bajar = () => (pantalla.parentElement.scrollTop = pantalla.parentElement.scrollHeight);

  const pintarGuia = () => {
    const total = MISIONES.length;
    $("#sim-barra").style.width = `${(hechas / total) * 100}%`;
    $("#sim-cuenta").textContent = `${hechas}/${total}`;
    $("#sim-xp").textContent = hechas * XP_MISION;
    const lista = $("#sim-lista");
    lista.innerHTML = "";
    MISIONES.forEach((m, i) => {
      const li = document.createElement("li");
      li.className = i < hechas ? "hecha" : i === hechas ? "actual" : "";
      li.textContent = m.t;
      lista.appendChild(li);
    });
    const card = $("#sim-mision");
    if (hechas >= total) {
      card.hidden = true;
      $("#sim-fin").hidden = false;
      return;
    }
    card.hidden = false;
    $("#sim-fin").hidden = true;
    const m = MISIONES[hechas];
    $("#m-num").textContent = `Misión ${hechas + 1}`;
    $("#m-titulo").textContent = m.t;
    $("#m-historia").textContent = m.h;
    $("#m-objetivo").innerHTML = m.o;
    $("#m-pista").textContent = m.p;
    $("#m-pista").hidden = true;
  };

  const celebrar = (m) => {
    const t = $("#sim-logro");
    $("#logro-titulo").textContent = `+${XP_MISION} XP · ${m.t}`;
    $("#logro-porque").textContent = m.y;
    t.hidden = false;
    t.classList.remove("entra");
    void t.offsetWidth;
    t.classList.add("entra");
  };

  const enviar = (txt) => {
    linea(`${ps1()} ${txt}`, "cmd");
    if (!txt.trim()) return bajar();
    historial.push(txt);
    idxHist = historial.length;
    const r = ejecutar(txt);
    if (r.limpiar) pantalla.innerHTML = "";
    else if (r.error) linea(r.error, "err");
    else if (r.salida) lineas(r.salida).forEach((l) => linea(l));
    if (hechas < MISIONES.length && MISIONES[hechas].ok(r.pasos)) {
      celebrar(MISIONES[hechas]);
      hechas++;
      if (hechas === MISIONES.length) linea("*** Laboratorio completado. Ya te mueves por Linux como pez en el agua. ***", "ok");
    }
    pintarPrompt();
    pintarGuia();
    guardar();
    bajar();
  };

  const completar = () => {
    const v = input.value;
    const m = v.match(/(\S*)$/);
    const frag = m[1];
    const esCmd = !v.slice(0, v.length - frag.length).trim();
    let opciones = [];
    if (esCmd) opciones = Object.keys(C).filter((c) => c.startsWith(frag));
    else {
      const i = frag.lastIndexOf("/");
      const base = i >= 0 ? frag.slice(0, i + 1) : "";
      const n = nodo(normalizar(base || "."));
      if (n && n.t === "d")
        opciones = Object.keys(n.h)
          .filter((k) => k.startsWith(frag.slice(base.length)))
          .map((k) => base + k + (n.h[k].t === "d" ? "/" : ""));
    }
    if (opciones.length === 1) input.value = v.slice(0, v.length - frag.length) + opciones[0] + (opciones[0].endsWith("/") ? "" : " ");
    else if (opciones.length > 1) {
      linea(`${ps1()} ${v}`, "cmd");
      linea(opciones.join("  "));
      bajar();
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      enviar(input.value);
      input.value = "";
    } else if (e.key === "ArrowUp") {
      if (idxHist > 0) input.value = historial[--idxHist];
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      idxHist = Math.min(historial.length, idxHist + 1);
      input.value = historial[idxHist] || "";
      e.preventDefault();
    } else if (e.key === "Tab") {
      e.preventDefault();
      completar();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      pantalla.innerHTML = "";
    }
  });
  $(".term").addEventListener("click", () => input.focus());
  $("#m-ver-pista").addEventListener("click", () => ($("#m-pista").hidden = false));
  $("#logro-cerrar").addEventListener("click", () => ($("#sim-logro").hidden = true));
  $("#sim-reiniciar").addEventListener("click", () => {
    [raiz, cwd, hechas, historial] = [inicial(), HOME, 0, []];
    pantalla.innerHTML = "";
    $("#sim-logro").hidden = true;
    arrancar();
    guardar();
  });

  const arrancar = () => {
    linea("DiveLearn Linux 26.11 · servidor de práctica", "ok");
    linea("Escribe help para ver los comandos. Tab completa nombres y las flechas recorren el historial.");
    pintarPrompt();
    pintarGuia();
  };
  cargar();
  idxHist = historial.length;
  arrancar();
})();
