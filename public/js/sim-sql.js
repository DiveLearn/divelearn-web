// Simulador de SQL de DiveLearn: SQLite real en el navegador (sql.js), una tienda de buceo de ejemplo
// y misiones de la guía de laboratorio que se revisan después de cada consulta.
// El progreso y la base se guardan en localStorage "divelearn-sims" (clave "sql").
(async () => {
  const CLAVE = "divelearn-sims";
  const $ = (s) => document.querySelector(s);

  const SEMILLA = `
CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, pais TEXT, ciudad TEXT);
CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT NOT NULL, categoria TEXT, precio REAL);
CREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER REFERENCES clientes(id),
  producto_id INTEGER REFERENCES productos(id), cantidad INTEGER, fecha TEXT, estado TEXT);
INSERT INTO clientes (nombre, pais, ciudad) VALUES
  ('Lucía Gómez','España','Valencia'), ('Andrés Rojas','Colombia','Medellín'), ('Camila Torres','México','Cancún'),
  ('Diego Fernández','España','Málaga'), ('Valentina Ruiz','Colombia','Cartagena'), ('Mateo Silva','Chile','Valparaíso'),
  ('Sofía Herrera','México','Cozumel'), ('Martín López','Argentina','Mar del Plata');
INSERT INTO productos (nombre, categoria, precio) VALUES
  ('Aletas','equipo',39.9), ('Máscara','equipo',29.5), ('Traje de neopreno','equipo',149.0), ('Tanque 12 L','equipo',210.0),
  ('Ordenador de buceo','electrónica',320.0), ('Linterna subacuática','electrónica',59.0), ('Curso Open Water','curso',380.0),
  ('Bitácora de inmersiones','accesorio',12.0);
INSERT INTO pedidos (cliente_id, producto_id, cantidad, fecha, estado) VALUES
  (1,1,1,'2026-10-01','entregado'), (1,2,1,'2026-10-01','entregado'), (2,7,1,'2026-10-03','entregado'),
  (3,3,1,'2026-10-05','enviado'), (4,5,1,'2026-10-06','cancelado'), (5,1,2,'2026-10-08','entregado'),
  (2,6,1,'2026-10-10','enviado'), (6,4,1,'2026-10-12','entregado'), (7,8,3,'2026-10-15','cancelado'),
  (8,7,1,'2026-10-18','enviado'), (3,2,2,'2026-10-20','entregado'), (1,6,1,'2026-10-25','enviado');`;

  const SQL = await initSqlJs({ locateFile: (f) => `/vendor/sql/${f}` });
  let db;
  let guardado = {};

  // ── Guardar / cargar ──
  const aB64 = (u8) => {
    let s = "";
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const deB64 = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
  const nueva = () => {
    const d = new SQL.Database();
    d.run(SEMILLA);
    return d;
  };
  const cargar = () => {
    try {
      const s = JSON.parse(localStorage.getItem(CLAVE) || "{}").sql;
      if (s && s.db) {
        db = new SQL.Database(deB64(s.db));
        guardado = s;
        return;
      }
    } catch {}
    db = nueva();
    guardado = {};
  };
  const guardar = () => {
    try {
      const todo = JSON.parse(localStorage.getItem(CLAVE) || "{}");
      todo.sql = { ...guia.estado(), db: aB64(db.export()) };
      localStorage.setItem(CLAVE, JSON.stringify(todo));
    } catch {}
  };

  // ── Ayudas para revisar misiones ──
  const valor = (q) => {
    const r = db.exec(q);
    return r.length ? r[0].values[0][0] : null;
  };
  const filas = (r) => (r ? r.values.map((v) => JSON.stringify(v.map((x) => (typeof x === "number" ? Math.round(x * 100) / 100 : x)))) : []);
  // Compara el resultado del usuario con el de la consulta esperada (sin importar el orden, salvo que se pida).
  const igual = (res, esperado, orden = false) => {
    const r = db.exec(esperado)[0];
    if (!res || !r || res.columns.length !== r.columns.length) return false;
    const a = filas(res);
    const b = filas(r);
    if (!orden) [a, b].forEach((x) => x.sort());
    return a.length === b.length && a.every((x, i) => x === b[i]);
  };
  const BASE = { clientes: 8 };

  const MISIONES = [
    {
      t: "Abre la vitrina",
      h: "Te contrataron en la tienda online de un centro de buceo. Los datos viven en tablas, como hojas de cálculo con reglas.",
      o: "Muestra toda la tabla de clientes con",
      r: "<code>SELECT * FROM clientes;</code>",
      guiada: true,
      p: "SELECT trae datos, * significa todas las columnas y FROM dice de qué tabla.",
      y: "SELECT * sirve para mirar, pero en producción se evita: trae columnas que no necesitas y en tablas grandes cuesta tiempo y dinero (en Athena o Redshift pagas por lo que lees).",
      ok: (res) => igual(res, "SELECT * FROM clientes"),
    },
    {
      t: "Solo lo que necesitas",
      h: "Marketing quiere una lista con nombre y país, nada más.",
      o: "Trae solo el <b>nombre</b> y el <b>país</b> de cada cliente.",
      r: "<code>SELECT nombre, pais FROM clientes;</code>",
      guiada: true,
      p: "Separa las columnas con coma. Los nombres van sin tilde: pais.",
      y: "Pedir solo las columnas necesarias es la primera optimización que existe. En bases columnares como Redshift la diferencia es enorme.",
      ok: (res) => igual(res, "SELECT nombre, pais FROM clientes"),
    },
    {
      t: "Filtra por país",
      h: "Abrimos sede en España y queremos escribirle a esos clientes.",
      o: "Muestra solo los clientes de <b>España</b>.",
      r: "<code>SELECT * FROM clientes WHERE pais = 'España';</code>",
      p: "El texto va entre comillas simples y con la tilde de España.",
      y: "WHERE es el filtro de todo. Mientras más filtras en la base, menos datos viajan por la red hasta tu aplicación.",
      ok: (res) => igual(res, "SELECT * FROM clientes WHERE pais = 'España'"),
    },
    {
      t: "Los más caros",
      h: "La jefa quiere ver los 3 productos más caros para una campaña.",
      o: "Muestra el nombre y el precio de los <b>3 productos más caros</b>, del más caro al menos caro.",
      r: "<code>SELECT nombre, precio FROM productos ORDER BY precio DESC LIMIT 3;</code>",
      p: "DESC ordena de mayor a menor. LIMIT corta el resultado.",
      y: "ORDER BY + LIMIT es el famoso top N: rankings, últimos pedidos, últimos logs.",
      ok: (res) => igual(res, "SELECT nombre, precio FROM productos ORDER BY precio DESC LIMIT 3", true),
    },
    {
      t: "¿Cuántos pedidos?",
      h: "Pregunta rápida en la reunión: ¿cuántos pedidos tenemos?",
      o: "Responde con un solo número: cuántos pedidos hay.",
      r: "<code>SELECT COUNT(*) FROM pedidos;</code>",
      p: "COUNT(*) cuenta todas las filas de la tabla.",
      y: "Las funciones de agregación (COUNT, SUM, AVG, MAX, MIN) resumen miles de filas en un número.",
      ok: (res) => igual(res, "SELECT COUNT(*) FROM pedidos"),
    },
    {
      t: "Clientes por país",
      h: "¿En qué país tenemos más clientes?",
      o: "Muestra cada país con su cantidad de clientes.",
      r: "<code>SELECT pais, COUNT(*) FROM clientes GROUP BY pais;</code>",
      p: "GROUP BY junta las filas que tienen el mismo país y COUNT las cuenta por grupo.",
      y: "GROUP BY es la base de cualquier reporte o dashboard: ventas por mes, errores por servicio, costo por cuenta de AWS.",
      ok: (res) => igual(res, "SELECT pais, COUNT(*) FROM clientes GROUP BY pais"),
    },
    {
      t: "Une las tablas",
      h: "La tabla pedidos solo guarda el número del cliente (cliente_id). Para saber quién compró, hay que unirla con clientes.",
      o: "Muestra el <b>nombre del cliente</b> y la <b>fecha</b> de cada pedido. Necesitas las dos tablas a la vez.",
      r: "<code>SELECT c.nombre, p.fecha FROM pedidos p JOIN clientes c ON c.id = p.cliente_id;</code>",
      p: "p y c son apodos de las tablas. ON dice qué columna conecta una con otra.",
      y: "Esto es lo que hace relacional a una base relacional: los datos no se repiten, se conectan. Es justo lo que DynamoDB no hace y por eso allá se diseña distinto.",
      ok: (res, sql) => /join/i.test(sql) && !!res && res.values.length === valor("SELECT COUNT(*) FROM pedidos"),
    },
    {
      t: "¿Cuánto vendimos?",
      h: "Fin de mes: total vendido sumando cantidad por precio de cada pedido.",
      o: "Calcula el total vendido: cantidad por precio de cada pedido, todo sumado.",
      r: "<code>SELECT SUM(pe.cantidad * pr.precio) FROM pedidos pe JOIN productos pr ON pr.id = pe.producto_id;</code>",
      p: "Puedes multiplicar columnas dentro de SUM.",
      y: "Una sola consulta reemplaza horas de Excel. Así salen los reportes de facturación, también los de Cost Explorer por dentro.",
      ok: (res) => igual(res, "SELECT SUM(pe.cantidad * pr.precio) FROM pedidos pe JOIN productos pr ON pr.id = pe.producto_id"),
    },
    {
      t: "Agrega una clienta",
      h: "Alguien nueva se inscribió en la web: ¡tú!",
      o: "Agrégate como clienta nueva, con tu nombre, país y ciudad.",
      r: "<code>INSERT INTO clientes (nombre, pais, ciudad) VALUES ('Tu nombre', 'Tu país', 'Tu ciudad');</code>",
      p: "No pongas el id: la base lo asigna sola porque es PRIMARY KEY.",
      y: "INSERT es lo que hace tu app cada vez que alguien se registra. La PRIMARY KEY garantiza que no haya dos clientes con el mismo id.",
      ok: () => valor("SELECT COUNT(*) FROM clientes") > BASE.clientes,
    },
    {
      t: "Cambia un precio",
      h: "Las aletas bajan de precio por temporada: ahora cuestan 34.9.",
      o: "Cambia el precio de las <b>Aletas</b> a 34.9, sin tocar los demás productos.",
      r: "<code>UPDATE productos SET precio = 34.9 WHERE nombre = 'Aletas';</code>",
      p: "Sin WHERE cambiarías el precio de TODOS los productos.",
      y: "UPDATE sin WHERE es uno de los errores más caros de la historia de la informática. Por eso existen los backups automáticos y el point-in-time recovery de RDS.",
      ok: () => valor("SELECT precio FROM productos WHERE nombre = 'Aletas'") === 34.9 && valor("SELECT COUNT(DISTINCT precio) FROM productos") > 1,
    },
    {
      t: "Limpia los cancelados",
      h: "Los pedidos cancelados ensucian los reportes. Hay que borrarlos, solo esos.",
      o: "Borra los pedidos <b>cancelados</b>, y solo esos.",
      r: "<code>DELETE FROM pedidos WHERE estado = 'cancelado';</code>",
      p: "Primero puedes mirar qué vas a borrar: SELECT * FROM pedidos WHERE estado = 'cancelado';",
      y: "El truco profesional: escribe el SELECT con el mismo WHERE, revisa, y recién ahí cambia SELECT por DELETE.",
      ok: () => valor("SELECT COUNT(*) FROM pedidos WHERE estado = 'cancelado'") === 0 && valor("SELECT COUNT(*) FROM pedidos") > 0,
    },
    {
      t: "Turbo con un índice",
      h: "La tienda creció y buscar los pedidos de un cliente se puso lento.",
      o: "Crea un índice sobre <code>pedidos(cliente_id)</code> y comprueba con <code>EXPLAIN QUERY PLAN</code> que la búsqueda por cliente lo usa.",
      r: "<code>CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);</code> y después <code>EXPLAIN QUERY PLAN SELECT * FROM pedidos WHERE cliente_id = 2;</code>",
      p: "El plan debe decir USING INDEX. Sin índice dice SCAN: recorre toda la tabla.",
      y: "Un índice es como el índice de un libro: no lees todo para encontrar un tema. En RDS, el Performance Insights te muestra las consultas que piden a gritos un índice.",
      ok: (res, sql) =>
        /explain/i.test(sql) && !!res && res.values.some((v) => /USING (COVERING )?INDEX/i.test(String(v[v.length - 1]))),
    },
    {
      t: "La mejor clienta",
      jefe: true,
      h: "Fin de temporada: la tienda premia a quien más gastó. Cuenta solo pedidos que no estén cancelados. Esta vez nadie te dicta la consulta.",
      o: "Muestra en una sola fila el <b>nombre</b> de la persona que más gastó y <b>cuánto gastó</b>.",
      p: "Junta lo que ya sabes: JOIN de las tres tablas, WHERE para los cancelados, SUM agrupado por cliente con GROUP BY, ORDER BY ... DESC y LIMIT 1.",
      r: "<code>SELECT c.nombre, SUM(pe.cantidad * pr.precio) AS total FROM pedidos pe JOIN clientes c ON c.id = pe.cliente_id JOIN productos pr ON pr.id = pe.producto_id WHERE pe.estado <> 'cancelado' GROUP BY c.id ORDER BY total DESC LIMIT 1;</code>",
      y: "Acabas de escribir un reporte de negocio completo con una sola consulta. Así se arman los dashboards de QuickSight o los análisis en Athena: unir, filtrar, agrupar y ordenar.",
      ok: (res) => {
        const e = db.exec(
          "SELECT c.nombre, SUM(pe.cantidad * pr.precio) AS t FROM pedidos pe JOIN clientes c ON c.id = pe.cliente_id JOIN productos pr ON pr.id = pe.producto_id WHERE pe.estado <> 'cancelado' GROUP BY c.id ORDER BY t DESC LIMIT 1",
        )[0];
        if (!res || !e || res.values.length !== 1 || res.columns.length !== 2) return false;
        const [nombre, total] = res.values[0];
        return nombre === e.values[0][0] && Math.abs(Number(total) - e.values[0][1]) < 0.01;
      },
    },
  ];

  const guia = SimGuia(MISIONES, {
    compas: [
      { en: 4, sprite: "pez-payaso", nombre: "Pez payaso", dato: "Vive en su anémona y no se cambia de casa: como cada fila en su tabla." },
      { en: 8, sprite: "tortuga", nombre: "Tortuga", dato: "Vuelve a la playa donde nació años después: como un JOIN que encuentra a su pareja por el id." },
      { en: 13, sprite: "jefe-ballena-almacen", nombre: "Ballena almacén", dato: "Guarda toneladas sin despeinarse, y ya hablas su idioma." },
    ],
  });

  // Los errores de SQLite vienen en inglés: los más comunes, explicados.
  const traducir = (m) => {
    const reglas = [
      [/no such table: (\S+)/, (x) => `No existe la tabla "${x[1]}". Revisa el nombre en el panel de Tablas (sin tildes ni mayúsculas).`],
      [/no such column: (\S+)/, (x) => `No existe la columna "${x[1]}". Mira las columnas de cada tabla abajo; recuerda que es pais, sin tilde.`],
      [/near "([^"]+)": syntax error/, (x) => `Hay algo raro cerca de "${x[1]}". Revisa comas, comillas y el orden: SELECT … FROM … WHERE … GROUP BY … ORDER BY … LIMIT.`],
      [/incomplete input/, () => "La consulta quedó a medias: falta cerrar una comilla o un paréntesis, o terminar la frase."],
      [/ambiguous column name: (\S+)/, (x) => `"${x[1]}" está en dos tablas. Di de cuál con su apodo, por ejemplo c.${x[1]}.`],
      [/NOT NULL constraint failed: (\S+)/, (x) => `"${x[1]}" no puede quedar vacío: esa columna es obligatoria.`],
      [/UNIQUE constraint failed: (\S+)/, (x) => `Ya existe una fila con ese valor en "${x[1]}", y no se puede repetir.`],
      [/misuse of aggregate/, () => "Las funciones como SUM o COUNT no van en el WHERE. Para filtrar grupos se usa HAVING."],
      [/already exists/, () => "Eso ya existe. Si es un índice, ya lo creaste: sigue con el EXPLAIN QUERY PLAN."],
    ];
    for (const [re, f] of reglas) {
      const x = m.match(re);
      if (x) return f(x);
    }
    return m;
  };

  // ── Interfaz ──
  const editor = $("#sql-editor");
  const msg = $("#sql-msg");
  const tabla = $("#sql-res");

  const pintarEsquema = () => {
    const r = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const cont = $("#sql-esquema");
    cont.innerHTML = "";
    for (const [t] of r.length ? r[0].values : []) {
      const cols = db.exec(`PRAGMA table_info("${t}")`)[0].values;
      const n = valor(`SELECT COUNT(*) FROM "${t}"`);
      const div = document.createElement("div");
      div.className = "tabla-esq";
      const b = document.createElement("b");
      b.textContent = `${t} (${n})`;
      div.appendChild(b);
      const ul = document.createElement("ul");
      for (const c of cols) {
        const li = document.createElement("li");
        li.textContent = `${c[1]} ${c[2] || ""}${c[5] ? " · PK" : ""}`;
        ul.appendChild(li);
      }
      div.appendChild(ul);
      div.addEventListener("click", () => {
        editor.value = `SELECT * FROM ${t};`;
        editor.focus();
      });
      cont.appendChild(div);
    }
  };

  const pintarTabla = (res) => {
    tabla.innerHTML = "";
    if (!res) return;
    const th = document.createElement("tr");
    res.columns.forEach((c) => {
      const e = document.createElement("th");
      e.textContent = c;
      th.appendChild(e);
    });
    const thead = document.createElement("thead");
    thead.appendChild(th);
    const tb = document.createElement("tbody");
    res.values.slice(0, 200).forEach((v) => {
      const tr = document.createElement("tr");
      v.forEach((x) => {
        const td = document.createElement("td");
        td.textContent = x === null ? "NULL" : x;
        if (typeof x === "number") td.className = "n";
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    tabla.append(thead, tb);
  };

  const aviso = guia.aviso;

  const ejecutar = () => {
    const sql = editor.value.trim();
    if (!sql) return;
    const antes = { clientes: valor("SELECT COUNT(*) FROM clientes"), pedidos: valor("SELECT COUNT(*) FROM pedidos") };
    const t0 = performance.now();
    let res;
    try {
      const r = db.exec(sql);
      res = r[r.length - 1];
      const ms = (performance.now() - t0).toFixed(1);
      const cambios = db.getRowsModified();
      msg.className = "msg ok";
      msg.textContent = res ? `${res.values.length} fila(s) · ${ms} ms` : `Listo · ${cambios} fila(s) afectada(s) · ${ms} ms`;
      pintarTabla(res);
    } catch (e) {
      msg.className = "msg err";
      msg.textContent = "Error: " + traducir(e.message);
      return;
    }
    // Los dos sustos clásicos: DELETE o UPDATE sin WHERE.
    if (/^\s*delete\s+from\s+pedidos\s*;?\s*$/i.test(sql) && antes.pedidos > 0)
      aviso("¡Borraste TODOS los pedidos!", "Eso pasa con DELETE sin WHERE. Aquí no pasa nada: toca Reiniciar base y vuelve a intentarlo. En la vida real, recuperarías desde un backup.", "pulpo-ups");
    else if (/^\s*update\s+\w+\s+set\b(?![\s\S]*\bwhere\b)/i.test(sql))
      aviso("UPDATE sin WHERE", "Cambiaste todas las filas de la tabla. Toca Reiniciar base para dejarla como estaba.", "pulpo-ups");
    guia.revisar(res, sql);
    pintarEsquema();
    guia.pintar();
    guardar();
  };

  $("#sql-run").addEventListener("click", ejecutar);
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      ejecutar();
    }
  });
  document.querySelectorAll("[data-ejemplo]").forEach((b) =>
    b.addEventListener("click", () => {
      editor.value = b.dataset.ejemplo;
      editor.focus();
    }),
  );
  $("#sql-reset-db").addEventListener("click", () => {
    db = nueva();
    // Las misiones que cambian datos se pueden repetir; las de solo lectura siguen hechas.
    guia.limitar(8);
    msg.className = "msg ok";
    msg.textContent = "Base reiniciada con los datos originales.";
    pintarTabla(null);
    pintarEsquema();
    guia.pintar();
    guardar();
  });
  $("#sim-reiniciar").addEventListener("click", () => {
    db = nueva();
    guia.reiniciar();
    pintarTabla(null);
    msg.textContent = "";
    pintarEsquema();
    guia.pintar();
    guardar();
  });

  cargar();
  guia.cargar(guardado);
  pintarEsquema();
  guia.pintar();
  $("#sql-cargando").hidden = true;
})();
