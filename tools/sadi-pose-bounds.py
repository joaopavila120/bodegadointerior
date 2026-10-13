"""Inspect alpha and register poses/tray anchors; never modifies raster pixels."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
sources = {'walk': 'walk/sadi.png', 'tray': 'sadi-tray-walk-v1.png', 'idle': 'sadi-idle-v1.png'}
tray_centers = {
    'tray': [(336,177),(626,177),(912,177),(1196,177),(397,490),(691,490),(975,490),(1260,490),(335,798),(624,798),(911,798),(1198,798)],
    'idle': [None,None,None,(368,758),(862,738),(1177,728)]
}

def runs(values):
    spans, start = [], None
    for n, active in enumerate([*values, False]):
        if active and start is None: start = n
        if not active and start is not None:
            if n-start > 20: spans.append((start,n))
            start = None
    return spans

out = {}
for key,file in sources.items():
    alpha = Image.open(root/'assets/images'/file).getchannel('A').point(lambda a: 255 if a>100 else 0)
    rows = runs([alpha.crop((0,y,alpha.width,y+1)).getbbox() is not None for y in range(alpha.height)])
    assert len(rows)==(2 if key=='idle' else 3), (key,rows)
    frames=[]
    for top,bottom in rows:
        row=alpha.crop((0,top,alpha.width,bottom))
        columns=runs([row.crop((x,0,x+1,row.height)).getbbox() is not None for x in range(row.width)])
        assert len(columns)==(3 if key=='idle' else 4), (key,columns)
        for left,right in columns:
            a,b,c,d=row.crop((left,0,right,row.height)).getbbox()
            x,y,w,h=left+a,top+b,c-a,d-b
            head=alpha.crop((x,y+int(h*.03),x+w,y+int(h*.18))).getbbox()
            axis=(head[0]+head[2])/2
            anchor=tray_centers.get(key,[])
            center=anchor[len(frames)] if anchor else None
            frames.append([x,y,w,h,axis,*([] if center is None else [center[0]-x,center[1]-y])])
    out[key]=frames
(root/'js/render/sadi-pose-crops.js').write_text('// x,y,w,h,head axis[,tray x,tray y]. Offline metadata; file:// safe.\nconst SADI_POSE_CROPS = '+json.dumps(out,separators=(',',':'))+';\n',encoding='utf-8')
print('Registered Sadi poses:', {k:len(v) for k,v in out.items()})
