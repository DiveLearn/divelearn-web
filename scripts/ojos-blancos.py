"""Brillo de los ojos en blanco: puntos claros y chicos rodeados de pupila oscura → blanco.

Uso: python ojos.py <sprite.png> ...   (modifica los archivos)
Gemini a veces pinta el brillo del ojo amarillo; el tanque, las aletas y el reflejo del visor son
manchas más grandes o no están rodeadas de azul oscuro, así que no se tocan.
"""
import sys, colorsys
from collections import deque
from PIL import Image


def claro(p):
    h, l, s = colorsys.rgb_to_hls(*(v / 255 for v in p[:3]))
    return p[3] and l > 0.6 and (s < 0.25 or 30 <= h * 360 <= 70)


def oscuro(p):
    h, l, s = colorsys.rgb_to_hls(*(v / 255 for v in p[:3]))
    return p[3] and l < 0.3


for f in sys.argv[1:]:
    im = Image.open(f).convert("RGBA")
    px, W, H = im.load(), im.width, im.height
    visto, cambios = set(), 0
    for y in range(H):
        for x in range(W):
            if (x, y) in visto or not claro(px[x, y]):
                continue
            q, mancha = deque([(x, y)]), []
            visto.add((x, y))
            while q:
                cx, cy = q.popleft()
                mancha.append((cx, cy))
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in visto and claro(px[nx, ny]):
                        visto.add((nx, ny))
                        q.append((nx, ny))
            if len(mancha) > 4:
                continue
            vecinos = [px[nx, ny] for cx, cy in mancha for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1))
                       if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in mancha]
            if vecinos and sum(oscuro(v) for v in vecinos) / len(vecinos) >= 0.5:
                for cx, cy in mancha:
                    px[cx, cy] = (255, 255, 255, 255)
                    cambios += 1
    im.save(f)
    print(f, "pixeles corregidos:", cambios)
