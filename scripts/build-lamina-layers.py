"""Separa a lâmina das folhas de golpe do Sadi numa camada de luz (RGB = brilho de 0 a 255, alfa = só a lâmina).
O jogo pinta essa camada com a paleta de cada arma (js/render/laminas.js); a folha original não muda."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, label

ROOT = Path(__file__).resolve().parents[1]
# Facão: a lâmina é um cinza quente, parecido com a calça, então vale só dentro da caixa de cada pose (x0, y0, x1, y1).
FACAO_BOXES = [(100, 14, 202, 86), (596, 170, 738, 218), (968, 200, 1086, 276), (1106, 240, 1200, 334),
               (120, 372, 212, 432), (640, 484, 774, 536), (980, 556, 1096, 634), (1160, 590, 1240, 694),
               (166, 708, 262, 780), (640, 788, 762, 844), (990, 880, 1100, 962), (1336, 936, 1416, 1020)]
SABRE_BOXES = [(194, 9, 364, 327), (500, 8, 694, 321), (854, 9, 1021, 323), (1175, 11, 1336, 320),
               (198, 345, 363, 658), (516, 333, 675, 660), (811, 349, 1099, 663), (1146, 349, 1379, 657),
               (189, 679, 362, 1000), (500, 667, 698, 1000), (808, 680, 1100, 1001), (1154, 680, 1406, 1001)]


def channels(a):
    r, g, b, alpha = (a[..., k] for k in range(4))
    high, low = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    return (high - low) / np.maximum(high, 1), r * .3 + g * .59 + b * .11, alpha


def sabre_mask(a, x0, y0, x1, y1):
    # A lâmina e a guarda são as manchas de aço (sem cor) perto da maior delas.
    sat, lum, alpha = channels(a[y0:y1, x0:x1])
    ids, _ = label((alpha > 40) & (sat < .16) & (lum > 45))
    sizes = np.bincount(ids.ravel()); sizes[0] = 0
    near = binary_dilation(ids == sizes.argmax(), iterations=34)
    keep = np.unique(ids[near & (ids > 0)])
    keep = keep[sizes[keep] >= 16]
    return np.isin(ids, keep) & (ids > 0)


def facao_mask(a, x0, y0, x1, y1):
    # Tudo que é cinza quente na caixa da lâmina (o cabo, a mão e o contorno preto ficam de fora).
    sat, lum, alpha = channels(a[y0:y1, x0:x1])
    ids, _ = label((alpha > 40) & (sat < .34) & (lum > 42))
    sizes = np.bincount(ids.ravel()); sizes[0] = 0
    return np.isin(ids, np.flatnonzero(sizes >= 24))


def build(source, boxes, mask_of, out):
    a = np.array(Image.open(ROOT / source).convert('RGBA')).astype(float)
    mask = np.zeros(a.shape[:2], bool)
    for x0, y0, x1, y1 in boxes:
        mask[y0:y1, x0:x1] |= mask_of(a, x0, y0, x1, y1)
    # Um pixel a mais em volta pega a beira suavizada do desenho.
    sat, lum, alpha = channels(a)
    mask = binary_dilation(mask, iterations=1) & (alpha > 0) & (sat < .4) & (lum > 24)
    lo, hi = np.percentile(lum[mask], [3, 97])
    v = np.clip((lum - lo) / max(1, hi - lo), 0, 1) * 255
    layer = np.zeros(a.shape, 'uint8')
    layer[..., 0] = layer[..., 1] = layer[..., 2] = np.where(mask, v, 0)
    layer[..., 3] = np.where(mask, alpha, 0)
    Image.fromarray(layer).save(ROOT / out, optimize=True)
    print(out, 'pixels', int(mask.sum()), 'brilho', round(lo), round(hi))


build('assets/images/actions/sadi-sabre-v2.png', SABRE_BOXES, sabre_mask, 'assets/images/actions/sadi-sabre-lamina-v1.png')
build('assets/images/expansion/sadi-combat-v1.png', FACAO_BOXES, facao_mask, 'assets/images/actions/sadi-facao-lamina-v1.png')
