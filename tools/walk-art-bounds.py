"""Read alpha to register animation frames. Does not modify the source images."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]

def runs(values):
    result = []
    start = None
    for i, value in enumerate([*values, False]):
        if value and start is None:
            start = i
        if not value and start is not None:
            if i-start > 15:
                result.append((start, i))
            start = None
    return result

out = {}
for path in sorted((root/'assets/images/walk').glob('*.png')):
    alpha = Image.open(path).getchannel('A').point(lambda a: 255 if a > 100 else 0)
    rows = runs([bool(alpha.crop((0,y,alpha.width,y+1)).getbbox()) for y in range(alpha.height)])
    if len(rows) != 3:
        raise ValueError((path.name, rows))
    frames = []
    for top, bottom in rows:
        row = alpha.crop((0,top,alpha.width,bottom))
        cols = runs([bool(row.crop((x,0,x+1,row.height)).getbbox()) for x in range(row.width)])
        if len(cols) != 4:
            raise ValueError((path.name, top, cols))
        for left,right in cols:
            a,b,c,d = row.crop((left,0,right,row.height)).getbbox()
            x,y,w,h = left+a,top+b,c-a,d-b
            # Register to the torso, not the swinging hand/boot bounds.
            torso = alpha.crop((x,y+int(h*.30),x+w,y+int(h*.51))).getbbox()
            axis = x + (torso[0]+torso[2])/2
            frames.append([x,y,w,h,axis-x])
    out[path.stem] = frames
(root/'js/render/walk-art-crops.js').write_text('// x,y,w,h,torso axis. Offline alpha inspection; file:// safe.\nconst WALK_ART_CROPS = '+json.dumps(out,separators=(',',':'))+';\n',encoding='utf-8')
print('Registered',len(out),'characters /',sum(map(len,out.values())),'frames')
