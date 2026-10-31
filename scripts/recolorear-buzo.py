"""Pasa la piel y el pelo de una buzo nueva a los colores de la buzo original (la de Mar).

Uso: python recolorear.py <entrada.png> <salida.png>
Piel: tonos naranja/café → durazno claro, manteniendo luz y sombra.
Pelo: negro morado (tono 252-275°) → castaño oscuro. El contorno azul noche (tono ~240°) no se toca.
"""
import sys, colorsys
from PIL import Image

PIEL = [(0.80, (252, 191, 146)), (0.62, (238, 187, 152)), (0.0, (214, 150, 120))]  # (umbral de luz, color)
PELO = [(0.24, (110, 70, 52)), (0.18, (72, 44, 34)), (0.0, (58, 34, 29))]


def elegir(tabla, l):
    for umbral, c in tabla:
        if l >= umbral:
            return c
    return tabla[-1][1]


im = Image.open(sys.argv[1]).convert("RGBA")
px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if not a:
            continue
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        h *= 360
        if (h < 38 or h > 335) and 0.3 < l < 0.75 and s > 0.18:  # piel morena (también la cara pálida)
            # la luz relativa dentro de la piel original (0.46-0.6) se lleva al rango claro
            px[x, y] = (*elegir(PIEL, 0.62 + (l - 0.46) * 1.4), a)
        elif 38 <= h <= 52 and 0.15 < s < 0.32 and 0.35 < l < 0.55:  # piel en sombra/apagada (cara sin aire)
            px[x, y] = (*PIEL[2][1], a)
        elif 254 <= h <= 275 and l < 0.235 and 0.45 < s < 0.68:  # pelo negro morado
            px[x, y] = (*elegir(PELO, l), a)
im.save(sys.argv[2])
