"""Inspect source alpha and write crop/anchor metadata. No source pixels are edited."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects

ROOT = Path(__file__).resolve().parents[1]
out = {}
for key in ['itens-ilha', 'sadi-carabina', 'sadi-arpao']:
    icon = key == 'itens-ilha'
    path = ROOT / 'assets/images' / ('island' if icon else 'actions') / (key+'-v1.png')
    im = Image.open(path)
    assert im.mode == 'RGBA'
    a = np.array(im)[:,:,3]
    assert (a == 0).mean() > .2, (key,'missing alpha')
    ids,_ = label(a > 32)
    sizes = np.bincount(ids.ravel())
    boxes = []
    for n,b in enumerate(find_objects(ids),1):
        if sizes[n] < 1500: continue
        y,x=b
        boxes.append([x.start,y.start,x.stop,y.stop])
    if icon:
        blade = [b for b in boxes if b[0] < 350 and 330 < b[1] < 650]
        assert len(blade) == 2, 'review broken sabre pieces'
        boxes = [b for b in boxes if b not in blade]
        boxes.append([min(b[0] for b in blade),min(b[1] for b in blade),max(b[2] for b in blade),max(b[3] for b in blade)])
    cols = 5 if icon else 4
    assert len(boxes) == cols*3,(key,len(boxes))
    boxes.sort(key=lambda b:(b[1]+b[3])/2)
    boxes = [b for row in range(3) for b in sorted(boxes[row*cols:(row+1)*cols])]
    frames = []
    for l,t,r,b in boxes:
        x,y=max(0,l-1),max(0,t-1)
        frame=[x,y,min(im.width,r+1)-x,min(im.height,b+1)-y]
        if not icon:
            # Hip center excludes arms and the projecting rifle/harpoon.
            strip=a[t+int((b-t)*.65):t+int((b-t)*.83),l:r]>120
            weights=strip.sum(axis=0)
            pivot=l+int(np.searchsorted(weights.cumsum(),weights.sum()/2))
            frame += [pivot-x,b-y]
        frames.append(frame)
    out[key]={'size':list(im.size),'frames':frames}
    if not icon: out[key]['reference']=frames[0][3]
(ROOT/'js/render/island-item-crops.js').write_text(
    "// Source-alpha metadata from scripts/build-island-item-crops.py.\n'use strict';\nconst ISLAND_ITEM_ATLAS = "
    +json.dumps(out.pop('itens-ilha'),separators=(',',':'))+';\nconst ISLAND_WEAPON_POSES = '
    +json.dumps(out,separators=(',',':'))+';\n',encoding='utf-8')
print('15 item/prop icons and 24 Sadi poses registered')
