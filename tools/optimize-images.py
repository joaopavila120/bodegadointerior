"""Gera as versões leves das imagens grandes do jogo em assets/images/opt (WebP) e o mapa js/config/asset-scale.js.

Os originais não mudam. No jogo, quem pede o original recebe a versão leve (js/core/assets.js); recortes e tamanhos
seguem nos números do original. O fator de cada folha veio de medir o maior tamanho em que ela é desenhada: folhas que
nunca aparecem a mais da metade do tamanho saem com 0.5; as que chegam perto de 3/4, com 0.75; as demais só viram WebP.

Uso: python tools/optimize-images.py   (rode de novo quando trocar ou acrescentar arte; arquivo novo entra na lista)
"""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, 'assets', 'images')
OPT = os.path.join(IMAGES, 'opt')
QUALITY = 90

ASSETS = {
    # cenário do mundo aberto e interiores
    'world/architecture-ctg.webp': .75, 'world/architecture-igreja.webp': .75, 'world/architecture-oktoberfest.webp': .75,
    'world/architecture-casona.webp': .75, 'world/architecture-salao.webp': .75, 'world/architecture2.webp': .75,
    'world/architecture-bodega-galpao-v1.png': .75, 'world/frontier-terrain.webp': .75,
    'world/architecture-shop-atacado.png': .5, 'world/architecture-shop-sementes.png': .5, 'world/architecture-shop-pecuaria.png': .5,
    'world/architecture-shop-melhorias.png': .5, 'world/architecture-shop-carnes.png': .5,
    'world/frontier-flora.webp': .5, 'world/overhead.webp': .5, 'world/landscape.webp': .5, 'world/store-shelves.webp': .5,
    'world/terrain.webp': .5, 'world/pew.webp': .5,
    'world/rural-workstations-v2.png': .5, 'world/interior-fittings-v2.png': .5, 'world/interior-flags-v2.png': .5, 'world/butia-v2.png': .5,
    'world/harvest-items-v2.png': .75, 'world/interior-materials-v2.png': .75,
    'world/folklore-v2.png': 1, 'world/keepsakes-v2.png': 1, 'world/mates-v2.png': 1, 'world/interior-details-v2.png': 1,
    # bodega e campo
    'furniture.webp': .5, 'campo/campo.webp': .75,
    # artes da expansão
    'expansion/cave-beasts-a-v1.png': .5, 'expansion/cave-beasts-b-v1.png': .5, 'expansion/cave-mouth-v2.png': .5,
    'expansion/saci-walk-v2.png': .5, 'expansion/dunstan-walk-v2.png': .5, 'expansion/oktober-hans-v1.png': .5,
    'expansion/oktober-helga-v1.png': .5, 'expansion/secondary-common-v4.png': .5, 'expansion/uruguai-fish-v1.png': .5,
    'expansion/cave-props-v1.png': .75, 'expansion/cave-terrain-v1.png': .75, 'expansion/sadi-mounted-v1.png': .75,
    'expansion/secondary-inter-v4.png': .75, 'expansion/secondary-gremio-v4.png': .75, 'expansion/secondary-gremio2-v4.png': .75,
    'expansion/estela-mounted-v1.png': .75, 'expansion/ramiro-mounted-v1.png': .75, 'expansion/charrua-mounted-v1.png': .75,
    'expansion/olmiro-mounted-v1.png': .75, 'expansion/padre-romio-v1.png': .75, 'expansion/sadi-combat-v1.png': .75,
    'expansion/wild-horses-v1.png': .75, 'expansion/horse-tether-v1.png': .75,
}
# folhas de caminhada dos especiais: os quadros são desenhados a ~1/5 do tamanho
for name in sorted(os.listdir(os.path.join(IMAGES, 'walk'))):
    if name.lower().endswith('.png'): ASSETS['walk/' + name] = .5

table = {}
for rel, factor in ASSETS.items():
    src = os.path.join(IMAGES, *rel.split('/'))
    if not os.path.exists(src):
        print('sem arquivo, pulei:', rel); continue
    out_rel = 'opt/' + os.path.splitext(rel)[0] + '.webp'
    out = os.path.join(IMAGES, *out_rel.split('/'))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im = Image.open(src); im.load()
    w, h = im.size
    if factor < 1:
        im = im.convert('RGBA') if im.mode not in ('RGBA', 'RGB') else im
        im = im.resize((max(1, round(w * factor)), max(1, round(h * factor))), Image.LANCZOS)
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(src) or Image.open(out).size != im.size:
        im.save(out, 'WEBP', quality=QUALITY, method=4)
    table[rel] = [out_rel, w, h]
    print(f'{rel}: {w}x{h} {os.path.getsize(src)/1048576:.2f}MB -> {im.size[0]}x{im.size[1]} {os.path.getsize(out)/1048576:.2f}MB')

with open(os.path.join(ROOT, 'js', 'config', 'asset-scale.js'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('// Gerado por tools/optimize-images.py: original -> [versão leve, largura e altura do original].\n')
    f.write("'use strict';\nconst ASSET_OPT = " + json.dumps(table, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(table), 'imagens')
