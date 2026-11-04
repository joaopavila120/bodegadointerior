"""Read sprite alpha and register body/hand anchors. Does not modify source PNGs."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects

ROOT = Path(__file__).resolve().parents[1]
# Source-pixel positions of the right hand. The loop/rope stays independent of the body.
HANDS = [(256,86),(559,55),(855,142),(1198,150),
         (280,423),(606,398),(1001,462),(1226,477),
         (369,748),(677,722),(1014,760),(1274,793)]
out = {}
for key in ['sabre', 'laco']:
    file = 'assets/images/actions/sadi-'+key+'-v2.png'
    im = Image.open(ROOT / file)
    assert im.mode == 'RGBA', (key, 'needs alpha')
    alpha = np.array(im)[:,:,3]
    assert (alpha == 0).mean() > .2, (key, 'needs transparent background')
    ids,_ = label(alpha > 32)
    sizes = np.bincount(ids.ravel())
    boxes = []
    for n,region in enumerate(find_objects(ids),1):
        if sizes[n] < 2000: continue
        y,x = region; boxes.append([x.start,y.start,x.stop,y.stop])
    assert len(boxes) == 12, (key, len(boxes), 'review separate poses')
    boxes.sort(key=lambda b:(b[1]+b[3])/2)
    boxes = [b for row in range(3) for b in sorted(boxes[row*4:(row+1)*4])]
    reference = boxes[0][3]-boxes[0][1]
    frames = []
    for i,(l,t,r,b) in enumerate(boxes):
        strip = alpha[max(t,b-int(reference*.35)):b-int(reference*.18),l:r] > 120
        weights = strip.sum(axis=0)
        pivot = l+int(np.searchsorted(weights.cumsum(),weights.sum()/2))
        x,y = max(0,l-1),max(0,t-1)
        frame = [x,y,min(im.width,r+1)-x,min(im.height,b+1)-y,pivot-x,b-y]
        if key == 'laco':
            hx,hy = HANDS[i]
            assert x <= hx <= r and y <= hy <= b, (key,i,'hand out of bounds')
            frame += [hx-x,hy-y]
        frames.append(frame)
    out[key] = {'file':file,'size':list(im.size),'reference':reference,'frames':frames}
(ROOT/'js/render/sadi-tool-crops.js').write_text(
    "// Body and hand anchors from scripts/build-sadi-tool-crops.py.\n'use strict';\nconst SADI_TOOL_POSES = "
    +json.dumps(out,separators=(',',':'))+';\n',encoding='utf-8')
print('Sabre and lasso: 24 body poses with fixed scale and ground anchors')
