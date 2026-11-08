#!/usr/bin/env python3
"""Agrega "Mira la clase" a cada módulo del bootcamp. Se puede correr las veces que sea.

El video solo se carga al darle play, desde youtube-nocookie, así la página sigue liviana y sin cookies.
Correrlo después de scripts/importar-bootcamp.py.
"""
import html, pathlib, re

MODULOS = {
    0: [("01", "InJII5JZstg", "Cómo funciona Internet")],
    1: [("02", "Au0On52BhDI", "Redes, latencia y TCP/UDP")],
    2: [("03", "x4RYkFE2gio", "Direcciones IP y NAT"), ("04", "kcSG3j0qeJk", "Subredes, máscaras y CIDR")],
    3: [("05", "oYAJfgk-SpU", "Cómo funciona el DNS")],
    4: [("06", "N_O5JAzic60", "Amenazas y triada CIA"), ("07", "5ak29H5DLZk", "Cifrado, HTTPS y VPN")],
    6: [("08", "MkkFtKHQMKQ", "Virtualización y contenedores")],
    7: [("09", "THRSkFERvLU", "Bases de datos SQL y NoSQL"), ("10", "HaM52kJnDdY", "Archivos, bloques y objetos")],
    8: [("11", "Be6THbHiLTc", "Backups, RTO y RPO")],
    9: [("12", "TGfJ0WZRrd4", "JSON, YAML y APIs")],
}
INI, FIN = "<!-- mira-la-clase -->", "<!-- /mira-la-clase -->"
ESTILO = """<style>
.mlc{margin:0 0 26px;padding:24px;border-radius:20px;background:#1f1d5c;border-top:8px solid var(--c,#b2cafd);color:#fff;box-shadow:0 14px 30px rgba(31,29,92,.22)}
.mlc h2{margin:0 0 6px;padding:0;border:0;display:block;color:#e0f24a;font-family:var(--pixel,ui-monospace,monospace);font-size:1.15rem;letter-spacing:.06em;text-transform:uppercase}
.mlc>p{margin:0 0 18px;color:#fff}
.mlc-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:18px}
.mlc-v{margin:0}.mlc-b{position:relative;display:block;width:100%;aspect-ratio:16/9;padding:0;border:0;border-radius:12px;overflow:hidden;background:#17154a;cursor:pointer}
.mlc-b img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}.mlc-b:hover img{transform:scale(1.04)}
.mlc-b span{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px;border-radius:50%;background:#e0f24a;box-shadow:0 0 0 6px rgba(224,242,74,.25),0 8px 24px rgba(23,21,74,.6);transition:transform .2s}
.mlc-b:hover span{transform:scale(1.1)}
.mlc-b span:after{content:"";position:absolute;left:30px;top:22px;border-style:solid;border-width:16px 0 16px 26px;border-color:transparent transparent transparent #1f1d5c}
.mlc-b:focus-visible{outline:4px solid #e0f24a;outline-offset:3px}
.mlc-f{display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:12px}
.mlc figcaption{margin-top:10px;font-weight:700;color:#fff}
@media (prefers-reduced-motion:reduce){.mlc-b img,.mlc-b span{transition:none}.mlc-b:hover img,.mlc-b:hover span{transform:none}}
</style>"""
GUION = """<script>
document.querySelectorAll('.mlc-b').forEach(function(b){b.addEventListener('click',function(){
var f=document.createElement('iframe');f.className='mlc-f';f.title=b.dataset.t;f.loading='lazy';
f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.v+'?autoplay=1&rel=0';
f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';f.allowFullscreen=true;f.referrerPolicy='strict-origin-when-cross-origin';
b.replaceWith(f);f.focus();});});
</script>"""


def bloque(videos):
    n = len(videos)
    tarjetas = "".join(
        f'<figure class="mlc-v"><button class="mlc-b" type="button" data-v="{v}" data-t="{html.escape(t)}" aria-label="Reproducir: {html.escape(t)}">'
        f'<img src="/img/clases/{a}.webp" alt="" width="720" height="405" loading="lazy"><span></span></button>'
        f"<figcaption>{html.escape(t)}</figcaption></figure>"
        for a, v, t in videos
    )
    sub = "La clase grabada de este módulo, con subtítulos." if n == 1 else f"Las {n} clases grabadas de este módulo, con subtítulos."
    return f'{INI}{ESTILO}<section class="mlc" aria-label="Mira la clase"><h2>Mira la clase</h2><p>{sub}</p><div class="mlc-g">{tarjetas}</div></section>{GUION}{FIN}\n            '


for m, videos in MODULOS.items():
    p = pathlib.Path(f"public/bootcamp/modulo-{m}/index.html")
    h = p.read_text(encoding="utf-8")
    h = re.sub(re.escape(INI) + r".*?" + re.escape(FIN) + r"\s*", "", h, flags=re.S)
    marca = next(x for x in ('<div class="tabs">', '<div class="tabs-bar">') if x in h)
    assert h.count(marca) == 1, p
    p.write_text(h.replace(marca, bloque(videos) + marca), encoding="utf-8")
    print(p, len(videos))
