"""Copia el bootcamp rebrandeado (contenido/rebranding/taller) al sitio, en fondo claro.

Uso: python3 scripts/importar-bootcamp.py <ruta taller> <public/bootcamp>
Módulo N → /bootcamp/modulo-N/ (hub) y /bootcamp/modulo-N/<actividad>.html
Cada página carga /js/bootcamp-progreso.js (XP por actividad) y la lista de páginas por módulo
queda en src/data/bootcamp-paginas.json para el mapa del juego.
"""
import json, re, sys, pathlib, shutil

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
(D / "dl-brand.css").write_text(css)


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
    if 'name="viewport"' not in h:
        h = re.sub(r'(<meta charset="[^"]*">)', r'\1\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">', h, count=1, flags=re.I)
    return h


# Color de la etapa de cada módulo (los mismos que src/data/bootcamp.ts).
COLOR = {0: "#ffd36e", 1: "#ffd36e", 2: "#ff7a8a", 3: "#ff7a8a", 4: "#ff7a8a", 5: "#7cc6fe", 6: "#7cc6fe", 7: "#04a8bb", 8: "#04a8bb"}


def con_progreso(h: str, m: int, pagina: str, total: int) -> str:
    """Piel de videojuego (al final del head, gana a los estilos propios) + chip de progreso."""
    h = re.sub(r"<html([^>]*)>", lambda x: f'<html{x.group(1)} style="--c:{COLOR[m]}">', h, count=1)
    h = h.replace("</head>", '<link rel="stylesheet" href="/css/bootcamp-juego.css">\n</head>', 1)
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
<h1>Esta actividad está en reparación 🔧</h1>
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
