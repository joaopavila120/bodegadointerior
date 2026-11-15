# Corta a sobra transparente das casas e dos enfeites das bases (assets/images/bases/**/*.png).
# O jogo apoia a imagem pelo pé (a última linha com pixel): sobra transparente embaixo faz a casa flutuar
# e sobra dos lados encolhe a casa no lote. Rode depois de gerar a arte:
#   python scripts/trim-bases.py                  (todas)
#   python scripts/trim-bases.py caminho.png ...  (só essas)
import pathlib
import sys

from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parent.parent / 'assets' / 'images' / 'bases'
MARGEM = 4  # nos lados e em cima; embaixo fica zero

arquivos = [pathlib.Path(a) for a in sys.argv[1:]] or sorted(RAIZ.rglob('*.png'))
for f in arquivos:
    im = Image.open(f)
    if im.mode != 'RGBA':
        print(f'SEM TRANSPARÊNCIA (refazer com fundo transparente): {f}')
        continue
    box = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
    if not box:
        print(f'vazia: {f}')
        continue
    l, t, r, b = box
    corte = (max(0, l - MARGEM), max(0, t - MARGEM), min(im.width, r + MARGEM), b)
    if corte == (0, 0, im.width, im.height):
        print(f'ok: {f.name} {im.size}')
        continue
    im.crop(corte).save(f)
    print(f'cortada: {f.name} {im.size} -> {(corte[2] - corte[0], corte[3] - corte[1])}')
