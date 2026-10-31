"""Convierte una hoja de sprites de Gemini (fondo verde) en sprites pixel art limpios.

Uso: python recortar.py <hoja.jpeg> <carpeta_salida> [--grilla 6x4] nombre1 nombre2 ...  (orden: filas, izquierda→derecha)
Con --grilla CxF corta en una cuadrícula fija (para hojas donde los sprites casi se tocan).
1. Quita el fondo verde. 2. Separa cada sprite. 3. Detecta el tamaño real del "pixel" del dibujo.
4. Muestrea una vez por pixel y ajusta a pocos colores. 5. Guarda PNG transparente a 1x.
"""
import sys, pathlib
import numpy as np
from PIL import Image

hoja, salida, nombres = sys.argv[1], pathlib.Path(sys.argv[2]), sys.argv[3:]
grilla = None
if nombres and nombres[0] == "--grilla":
    grilla = tuple(int(x) for x in nombres[1].split("x"))
    nombres = nombres[2:]
salida.mkdir(parents=True, exist_ok=True)
im = np.asarray(Image.open(hoja).convert("RGB")).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
# Solo el verde chillón del fondo (#00ff00); los verdes del dibujo (algas, hojas, lima) se quedan.
fondo = (g > 200) & (r < 110) & (b < 110)
tinta = ~fondo


def bandas(perfil, minimo, hueco):
    """Tramos donde perfil > minimo, uniendo huecos más cortos que `hueco`."""
    on = perfil > minimo
    tramos, ini, ult = [], None, None
    for i, v in enumerate(on):
        if v:
            if ini is None:
                ini = i
            elif i - ult > hueco:
                tramos.append((ini, ult))
                ini = i
            ult = i
    if ini is not None:
        tramos.append((ini, ult))
    return tramos


def tam_pixel(rec):
    """Periodo de los bordes horizontales y verticales = tamaño de un pixel del dibujo."""
    best = []
    for eje in (0, 1):
        d = np.abs(np.diff(rec, axis=eje)).sum(axis=2) > 60
        prof = d.sum(axis=1 - eje).astype(float)
        prof -= prof.mean()
        f = np.abs(np.fft.rfft(prof, n=4096))
        freqs = np.fft.rfftfreq(4096)
        ok = (freqs > 1 / 30) & (freqs < 1 / 6)
        best.append(1 / freqs[ok][np.argmax(f[ok])])
    return float(np.mean(best))


sprites = []
if grilla:
    cols_n, filas_n = grilla
    H, W = tinta.shape
    for fj in range(filas_n):
        for ci in range(cols_n):
            ya, yb = fj * H // filas_n, (fj + 1) * H // filas_n
            xa, xb = ci * W // cols_n, (ci + 1) * W // cols_n
            ys, xs = np.nonzero(tinta[ya:yb, xa:xb])
            if len(ys):
                sprites.append((ya + ys.min(), ya + ys.max(), xa + xs.min(), xa + xs.max()))
filas = [] if grilla else bandas(tinta.sum(axis=1), 3, 40)
for (y0, y1) in filas:
    cols = bandas(tinta[y0 : y1 + 1].sum(axis=0), 1, 60)
    for (x0, x1) in cols:
        if (x1 - x0) > 60:
            sprites.append((y0, y1, x0, x1))
# El tamaño del pixel es el mismo en toda la hoja: se mide una vez sobre la imagen completa
# (medirlo por sprite falla en los sprites chicos).
T = tam_pixel(im)
print(f"{len(sprites)} sprites encontrados · pixel≈{T:.1f}px")

for (y0, y1, x0, x1), nombre in zip(sprites, nombres):
    rec = im[y0 : y1 + 1, x0 : x1 + 1]
    msk = tinta[y0 : y1 + 1, x0 : x1 + 1]
    t = T
    h, w = msk.shape
    nh, nw = round(h / t), round(w / t)
    out = np.zeros((nh, nw, 4), dtype=np.uint8)
    for j in range(nh):
        for i in range(nw):
            ya, yb = int(j * t), max(int(j * t) + 1, int((j + 1) * t))
            xa, xb = int(i * t), max(int(i * t) + 1, int((i + 1) * t))
            cm = msk[ya:yb, xa:xb]
            if cm.mean() < 0.5:
                continue
            # centro de la celda (evita los bordes difuminados del JPEG)
            yc0, yc1 = ya + (yb - ya) // 4, yb - (yb - ya) // 4
            xc0, xc1 = xa + (xb - xa) // 4, xb - (xb - xa) // 4
            px = rec[yc0 : max(yc1, yc0 + 1), xc0 : max(xc1, xc0 + 1)].reshape(-1, 3)
            med = np.median(px, axis=0)
            if med[1] > 200 and med[0] < 130 and med[2] < 130:
                continue  # halo verde del fondo pegado al borde
            out[j, i, :3] = med
            out[j, i, 3] = 255
    img = Image.fromarray(out, "RGBA")
    # Pocos colores, como pixel art de verdad (y quita el ruido del JPEG)
    rgb = img.convert("RGB").quantize(colors=20, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    final = Image.merge("RGBA", (*rgb.split(), img.split()[3]))
    final = final.crop(final.getbbox())
    nw, nh = final.size
    final.save(salida / f"{nombre}.png")
    final.resize((nw * 8, nh * 8), Image.NEAREST).save(salida / f"_vista-{nombre}.png")
    print(f"{nombre}: {nw}x{nh}")

# Tamaños de todos los sprites del sitio para el componente Sprite (src/data/sprites-png.json).
raiz = pathlib.Path(__file__).resolve().parent.parent
pngs = raiz / "public/img/sprites"
if salida.resolve() == pngs.resolve():
    import json
    tam = {f.stem: list(Image.open(f).size) for f in sorted(pngs.glob("*.png"))}
    (raiz / "src/data/sprites-png.json").write_text(json.dumps(tam, indent=0) + "\n")
