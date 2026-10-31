"""Copia el bootcamp rebrandeado (contenido/rebranding/taller) al sitio, en fondo claro.

Uso: python3 scripts/importar-bootcamp.py <ruta taller> <public/bootcamp>
Módulo N → /bootcamp/modulo-N/ (hub) y /bootcamp/modulo-N/<actividad>.html
Cada página carga /js/bootcamp-progreso.js (XP por actividad) y la lista de páginas por módulo
queda en src/data/bootcamp-paginas.json para el mapa del juego.
"""
import json, re, sys, pathlib, shutil

# Colores de TEXTO pensados para fondo oscuro → versiones que se leen sobre fondo claro.
# Lima y lavanda pasan por variables que vuelven a su color dentro de las terminales (ver bootcamp-juego.css).
TEXTO_CLARO = {
    "var(--lime)": "var(--lime-texto)",
    "#e0f24a": "var(--lime-texto)",
    "#E0F24A": "var(--lime-texto)",
    "var(--purple-light)": "var(--lav-texto)",
    "#8888bb": "#55538a",
    "#4ade80": "#2f8a3c", "#68d391": "#2f8a3c", "#48bb78": "#2f8a3c", "#22C55E": "#2f8a3c", "#22c55e": "#2f8a3c",
    "#fc8181": "#c0392b", "#f87171": "#c0392b", "#ff6b6b": "#c0392b",
    "#4fd1c7": "#0f7f86", "#06B6D4": "#0f7f86",
    "#f6ad55": "#b5651d", "#d4d4d4": "#55538a", "#e2e8f0": "#55538a",
}


def texto_legible(h: str) -> str:
    def cambiar(m):
        val = m.group(2).strip()
        nuevo = TEXTO_CLARO.get(val)
        return m.group(1) + nuevo if nuevo else m.group(0)
    # solo "color:", no background-color ni border-color
    return re.sub(r"((?<![-\w])color\s*:\s*)([^;}\"!]+?)(?=\s*[;}\"!])", cambiar, h)



R, D = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
T = R / "taller_completo"
if D.exists():
    shutil.rmtree(D)
D.mkdir(parents=True)

# Sistema de diseño en versión clara: mismos tokens, fondo blanco (nada de negro).
css = (R / "dl-brand.css").read_text()
css = re.sub(r"@import url\('https://fonts.googleapis.com[^)]*\);\n", "", css)
css = css.replace("url('symora.otf')", "url('/fonts/symora.otf')")
for a, b in {
    "--bg:            #0d0d1f": "--bg:            #ffffff",
    "--surface:       #161630": "--surface:       #f6f7ff",
    "--surface2:      #1f1f48": "--surface2:      #eef2ff",
    "--surface3:      #2a2a5e": "--surface3:      #dfe3fb",
    "--text:          #eeeeff": "--text:          #1f1d5c",
    "--text-muted:    #8888bb": "--text-muted:    #55538a",
    "rgba(0,0,0,0.45)": "rgba(84,83,235,0.12)",
    "rgba(0,0,0,0.4)": "rgba(84,83,235,0.12)",
    "background: rgba(13,13,31,0.9)": "background: rgba(255,255,255,0.92)",
    "color: #0d0d1f !important": "color: #1f1d5c !important",
    "'Nunito', ": "'Questrial', 'Century Gothic', ",
}.items():
    css = css.replace(a, b)
css = css.replace("@font-face {", "@font-face {\n  font-family: 'Questrial';\n  src: url('/fonts/questrial-latin-400-normal.woff2') format('woff2');\n  font-display: swap;\n}\n\n@font-face {", 1)
# Transiciones suaves entre páginas (View Transitions entre documentos).
css += "\n@view-transition {\n  navigation: auto;\n}\n"
css = texto_legible(css)
(D / "dl-brand.css").write_text(css)


# Emojis fuera: el sitio usa sprites e íconos propios. Se respetan ✓ ✔ ✗ ✘ y las flechas.
EMOJI = re.compile(
    "[\U0001F000-\U0001FAFF\u2600-\u26FF\u2700-\u2712\u2715\u2716\u2719-\u27BF\u2B00-\u2BFF"
    "\u231A\u231B\u23E9-\u23FA\u2139\u24C2\u3030\u303D\u3297\u3299\uFE0F\u200D\u20E3]+"
)


def sin_emojis(h: str) -> str:
    return EMOJI.sub("", h)


def limpiar(h: str) -> str:
    h = re.sub(r'\s*<link rel="preconnect" href="https://fonts.(googleapis|gstatic).com"[^>]*>', "", h)
    h = re.sub(r'\s*<link href="https://fonts.googleapis.com[^>]*>', "", h)
    h = re.sub(r"@import url\(['\"]?https://fonts.googleapis.com[^)]*\);?", "", h)
    h = re.sub(r'href="(\.\./)*dl-brand.css"', 'href="/bootcamp/dl-brand.css"', h)
    h = re.sub(r'(href|src)="(\.\./|\./)*favicon.png"', r'\1="/favicon.png"', h)
    h = re.sub(r'(\.\./)*logo-wordmark-purple.png', "/img/logo-divelearn-morado.png", h)
    h = re.sub(r'(\.\./)*logo-icon-purple.png', "/favicon.png", h)
    # Enlaces a otros módulos y nombres que no coinciden con los archivos reales.
    h = re.sub(r"(\.\./)+modulo_(\d+)/hub_modulo\d+\.html", r"/bootcamp/modulo-\2/", h)
    h = h.replace("modulo1_redes.html", "./")
    for a, b in {"actividad2_comparador_vm_contenedor": "actividad2_comparador", "actividad3_planificador_recursos": "actividad3_planificador", "actividad4_visualizador_beneficios": "actividad4_visualizador"}.items():
        h = h.replace(a + ".html", b + ".html")
    # Volver al módulo: el rebranding dejó muchos enlaces apuntando al hub del módulo 9.
    h = re.sub(r"(\.\./)?hub_modulo\d+\.html", "./", h)
    h = re.sub(r"(\.\./)*(hub_principal|hub)\.html", "/bootcamp/", h)
    # El logo siempre lleva al inicio del sitio.
    h = re.sub(r'<a href="[^"]*">(\s*<img[^>]*class="dl-nav-logo")', r'<a href="/">\1', h)
    h = h.replace('href="./submodulos/', 'href="./').replace("'./submodulos/", "'./")
    # Terminal en azul noche (no negro) y pastilla "Crítica" ilegible.
    h = h.replace("#1e1e1e", "#1f1d5c").replace("#00ff00", "#e0f24a")
    h = re.sub(r"background: #06B6D4;(\s*)color: #06B6D4;", r"background: #fde2e7;\1color: #b4234a;", h)
    h = sin_emojis(h)
    h = texto_legible(h)
    if 'name="viewport"' not in h:
        h = re.sub(r'(<meta charset="[^"]*">)', r'\1\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">', h, count=1, flags=re.I)
    return h


# Color propio de cada módulo (los mismos que src/data/bootcamp.ts).
COLOR = {0: "#ffd36e", 1: "#ff9f43", 2: "#ff7a8a", 3: "#f49ac2", 4: "#b39dfa", 5: "#7cc6fe", 6: "#5fd3c6", 7: "#04a8bb", 8: "#6fd08c"}


# Datos de cada módulo (etapa, título, sprite) leídos de src/data/bootcamp.ts, para la cabecera de juego.
RAIZ = D.parent.parent
_ts = (RAIZ / "src/data/bootcamp.ts").read_text()
_tam = json.loads((RAIZ / "src/data/sprites-png.json").read_text())
MODULO = {}
for ei, bloque in enumerate(_ts.split("    id: ")[1:]):
    nombre_etapa = re.search(r'nombre: "([^"]+)"', bloque).group(1)
    for n, spr, tit in re.findall(r'\{ n: (\d+), color: "[^"]+", sprite: "([^"]+)", titulo: "([^"]+)"', bloque):
        MODULO[int(n)] = {"etapa": f"Etapa {ei + 1} · {nombre_etapa}", "sprite": spr, "titulo": tit}


def cabecera(m: int, pagina: str) -> str:
    """Panel tipo ventana igual al del mapa del bootcamp (bootcamp-juego.css)."""
    d = MODULO[m]
    w, h = _tam.get(d["sprite"], [40, 40])
    volver = '<a class="dl-jh-btn" href="./">Módulo ' + str(m) + "</a>" if pagina != "index" else ""
    # Mismo banner que el resto del sitio (src/layouts/Base.astro) + panel de juego.
    return f"""<header class="dl-sitio">
  <a class="dl-sitio-logo" href="/" aria-label="DiveLearn, inicio"><picture><source media="(max-width: 480px)" srcset="/img/logo-icono-lima.png"><img src="/img/logo-divelearn.png" alt="DiveLearn" width="140" height="31"></picture></a>
  <nav aria-label="Principal"><a href="/bootcamp/" aria-current="page">Bootcamp</a><a href="/blog/">Blog</a><a href="/recursos/">Recursos</a><a href="/cursos/">Cursos</a></nav>
</header>
<header class="dl-jh">
  <div class="dl-jh-panel">
    <div class="dl-jh-barra"><span>{d["etapa"]}</span><span class="dl-jh-puntos"><i></i><i></i><i></i></span></div>
    <div class="dl-jh-cuerpo">
      <span class="dl-jh-ico"><img src="/img/sprites/{d["sprite"]}.png" alt="" width="{w * 2}" height="{h * 2}"></span>
      <div class="dl-jh-txt"><span class="dl-jh-mod">Módulo {m}</span><span class="dl-jh-tit">{d["titulo"]}</span></div>
      <nav class="dl-jh-nav"><a class="dl-jh-btn" href="/bootcamp/">← Mapa</a>{volver}</nav>
    </div>
  </div>
</header>
"""


# Objeto pixel para cada título de sección, según de qué habla (la primera palabra clave que aparezca gana).
OBJETO_TEMA = [
    (("cifr", "encript", "certific", "segur", "candado", "ssl", "tls"), "obj-candado"),
    (("llave", "clave", "ssh", "contraseñ"), "obj-llave"),
    (("firewall", "cortafuego", "ataque", "riesgo", "amenaz", "error", "desastre"), "obj-advertencia"),
    (("dns", "nombre", "busca", "investig", "explor", "jerarq"), "obj-lupa"),
    (("router", "ruta", "red", "redes", "topolog", "subred", "máscara", "mascara"), "obj-router"),
    (("cable", "conex", "conect", "carretera"), "obj-cable"),
    (("wifi", "inalámbr", "señal"), "obj-wifi"),
    (("latencia", "velocidad", "tiempo", "ttl", "rto", "rpo"), "obj-cronometro"),
    (("paquete", "datos viajan", "mensaje", "protocolo"), "obj-paquete"),
    (("backup", "respaldo", "copia", "recuper"), "obj-disquete"),
    (("almacen", "disco", "volumen", "bloque", "archivo"), "obj-disco"),
    (("base de datos", "bases de datos", "sql", "tabla", "metadato"), "obj-cd"),
    (("servidor", "máquina", "maquina", "vm", "virtual", "contenedor"), "obj-servidores"),
    (("nube", "cloud", "aws", "internet"), "obj-nube"),
    (("terminal", "linux", "comando", "script", "laboratorio", "simulador", "práctic", "practic"), "obj-laptop"),
    (("satél", "satel", "global", "mundo"), "obj-satelite"),
    (("objetivo", "meta", "complet", "resultado"), "obj-bandera"),
    (("checklist", "pasos", "plan", "planific", "evalua"), "obj-checklist"),
    (("idea", "concepto", "qué es", "que es", "por qué", "por que"), "obj-bombillo"),
]
OBJETO_MODULO = {0: "obj-satelite", 1: "obj-cable", 2: "obj-router", 3: "obj-lupa", 4: "obj-candado", 5: "obj-laptop", 6: "obj-servidores", 7: "obj-disco", 8: "obj-disquete"}


def con_objetos(h: str, m: int) -> str:
    """Pone un objeto pixel antes del texto de cada título de sección."""
    def poner(x):
        texto = re.sub(r"<[^>]+>", "", x.group(3)).lower()
        obj = next((o for claves, o in OBJETO_TEMA if any(k in texto for k in claves)), OBJETO_MODULO[m])
        return f'{x.group(1)}<img class="dl-obj" src="/img/sprites/{obj}.png" alt="" width="32" height="32">{x.group(3)}{x.group(4)}'
    return re.sub(r'(<(h[1-4]|div|span)[^>]*class="[^"]*\b(?:section-title|teoria-title|card-title)\b[^"]*"[^>]*>)(.*?)(</\2>)', poner, h, flags=re.S)


def con_progreso(h: str, m: int, pagina: str, total: int) -> str:
    """Piel de videojuego (al final del head, gana a los estilos propios) + chip de progreso."""
    h = re.sub(r"<html([^>]*)>", lambda x: f'<html{x.group(1)} style="--c:{COLOR[m]}">', h, count=1)
    h = h.replace("</head>", '<link rel="stylesheet" href="/css/bootcamp-juego.css">\n</head>', 1)
    h = re.sub(r"(<body[^>]*>)", lambda x: x.group(1) + "\n" + cabecera(m, pagina), h, count=1)
    h = con_objetos(h, m)
    tag = f'<script src="/js/bootcamp-progreso.js" data-modulo="{m}" data-pagina="{pagina}" data-total="{total}" defer></script>'
    return h.replace("</body>", f"{tag}\n</body>", 1)


EN_REPARACION = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Actividad en reparación · DiveLearn</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/bootcamp/dl-brand.css">
</head>
<body>
<nav class="dl-nav"><a href="/"><img src="/img/logo-divelearn-morado.png" alt="Divelearn" class="dl-nav-logo"></a><div class="dl-nav-divider"></div><a href="./" class="dl-nav-back">← Módulo</a></nav>
<main class="container" style="text-align:center;padding-top:80px">
<h1>Esta actividad está en reparación</h1>
<p style="max-width:46ch;margin:16px auto 32px">La estamos mejorando para que funcione como se merece. Mientras tanto, sigue con las demás actividades del módulo.</p>
<a href="./" class="btn btn-primary">Volver al módulo</a>
</main>
</body>
</html>
"""

paginas = {}
reparar = []
for m in range(9):
    src = T / f"modulo_{m}"
    out = D / f"modulo-{m}"
    out.mkdir()
    todas = sorted((src / "submodulos").glob("*.html"), key=lambda f: (f.stem.startswith("quiz"), f.stem))
    # Algunas actividades vienen cortadas a la mitad (sin </html>): no cuentan para el juego.
    subs = [f for f in todas if "</html>" in f.read_text()]
    for f in todas:
        if f not in subs:
            reparar.append(f"modulo-{m}/{f.name}")
            (out / f.name).write_text(EN_REPARACION)
    paginas[m] = [f.stem for f in subs]
    hub = limpiar((src / f"hub_modulo{m}.html").read_text())
    # En la portada del módulo, "volver" lleva al mapa del Bootcamp.
    hub = re.sub(r'<a href="\./" class="dl-nav-back">← [^<]*</a>', '<a href="/bootcamp/" class="dl-nav-back">← Bootcamp</a>', hub)
    (out / "index.html").write_text(con_progreso(hub, m, "index", len(subs)))
    for f in subs:
        (out / f.name).write_text(con_progreso(limpiar(f.read_text()), m, f.stem, len(subs)))

(D.parent.parent / "src/data/bootcamp-paginas.json").write_text(json.dumps(paginas, indent=2) + "\n")

# Enlaces internos que no resuelven
malos = set()
for f in D.rglob("*.html"):
    for ref in re.findall(r'(?:href|src)=["\']([^"\'#]+)["\']', f.read_text()):
        if ref.startswith(("http", "mailto", "javascript", "data:")):
            continue
        p = (pathlib.Path("/") / ref) if ref.startswith("/") else None
        tgt = (D.parent / ref.lstrip("/")) if ref.startswith("/") else (f.parent / ref)
        if ref.endswith("/"):
            tgt = tgt / "index.html"
        if not tgt.exists():
            malos.add(f"{f.relative_to(D)} -> {ref}")
print(len(list(D.rglob('*.html'))), "páginas")
print("En reparación (archivo cortado en el origen):", ", ".join(reparar) or "ninguna")
print("\n".join(sorted(malos)) or "sin enlaces rotos")
