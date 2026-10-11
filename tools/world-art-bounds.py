"""Inspect atlas alpha and write source rectangles; never changes raster files."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
regions = {}
regions['buildings'] = [(x0,y0,x1,y1) for y0,y1 in [(0,296),(296,632),(632,911),(911,1254)] for x0,x1 in [(0,313),(313,644),(644,953),(953,1254)]]
regions['nature'] = [(x0,y0,x1,y1) for y0,y1 in [(0,345),(345,670),(670,934),(934,1254)] for x0,x1 in [(0,313),(313,620),(620,945),(945,1254)]]
regions['furniture'] = [
 (0,0,216,212),(235,0,397,220),(413,30,630,216),(630,36,850,211),(853,30,1038,218),(1040,0,1254,216),
 (20,212,199,444),(203,253,446,444),(457,217,610,444),(657,248,812,446),(822,278,1062,447),(1072,217,1242,448),
 (19,444,198,658),(205,450,430,658),(430,456,636,658),(650,470,828,643),(847,447,1048,650),(1056,457,1248,649),
 (11,658,196,859),(212,667,419,835),(432,658,626,841),(655,630,804,859),(822,650,1043,858),(1050,659,1254,850),
 (5,859,194,1016),(199,827,411,1019),(414,850,592,1023),(596,869,841,1018),(840,857,1040,1028),(1045,857,1254,1025),
 (10,1018,200,1254),(202,1016,403,1254),(405,1021,595,1254),(595,1057,814,1254),(811,1028,1004,1254),(1005,1030,1254,1254)
]
out = {}
for key in ['architecture-fronteira', 'architecture-bolichos', 'store-shelves']:
    with Image.open(root / 'assets/images/world' / (key + '.png')) as image:
        w, h = image.size
        regions[key] = [(x, y, x + w // 2, y + h // 2)
                        for y in (0, h // 2) for x in (0, w // 2)]
regions['overhead'] = [(0,0,768,480),(768,0,1536,480),(0,480,768,1024),(768,480,1536,1024)]
with Image.open(root / 'assets/images/world/frontier-flora.png') as image:
    w, h = image.size
    regions['frontier-flora'] = [(x, y, x + w // 3, y + h // 2)
                                 for y in (0, h // 2) for x in (0, w // 3, w * 2 // 3)]
    # The top-left bush extends slightly into the first gutter.
    regions['frontier-flora'][0] = (0, 0, 550, h // 2)
    regions['frontier-flora'][1] = (552, 0, 1022, h // 2)
for key in ['architecture-casona', 'architecture-salao', 'architecture-igreja', 'architecture-ctg', 'architecture-oktoberfest']:
    with Image.open(root / 'assets/images/world' / (key + '.png')) as image:
        regions[key] = [(0, 0, *image.size)]
with Image.open(root / 'assets/images/world/pew.png') as pew:
    regions['pew'] = [(0, 0, *pew.size)]
regions['landscape']=[(0,0,545,505),(545,0,1084,472),(1084,0,1536,505),(0,540,615,1024),(615,472,1000,1024),(1000,510,1536,1024)]
regions['architecture0']=[(0,0,638,627),(638,0,1254,627),(0,627,638,1254),(638,627,1254,1254)]
regions['architecture1']=[(0,0,637,564),(637,0,1254,564),(0,564,637,1254),(637,564,1254,1254)]
regions['architecture2']=[(0,0,682,590),(682,0,1254,590),(0,590,672,1254),(672,590,1254,1254)]
regions['architecture3']=[(0,0,642,623),(642,0,1254,623),(0,623,636,1254),(636,623,1254,1254)]
regions['garden'] = [(x0+5,y0+5,x1-5,y1-5) for y0,y1 in [(0,412),(412,728),(728,1086)] for x0,x1 in [(0,362),(362,724),(724,1086),(1086,1448)]]
regions['rural'] = [(x0,y0,x1,y1) for y0,y1 in [(0,309),(309,641),(641,938),(938,1254)] for x0,x1 in [(0,326),(326,670),(670,937),(937,1254)]]
regions['rural'][0] = (0,0,365,309)
regions['rural'][1] = (365,0,675,309)
regions['rural'][12] = (0,938,377,1254)
regions['rural'][13] = (377,938,670,1254)
for key, cells in regions.items():
    im = Image.open(root / 'assets/images/world' / (key + '.png'))
    alpha = im.getchannel('A')
    out[key] = []
    for x0,y0,x1,y1 in cells:
        bbox = alpha.crop((x0,y0,x1,y1)).point(lambda p: 255 if p > 100 else 0).getbbox()
        if bbox is None:
            raise ValueError(f'Empty sprite: {key}')
        l,t,r,b = bbox
        out[key].append([x0+l,y0+t,r-l,b-t])
(root / 'js/render/world-art-crops.js').write_text('// Atlas source rectangles (x, y, width, height). No runtime pixel reads: file:// compatible.\nconst WORLD_ART_CROPS = ' + json.dumps(out, separators=(',',':')) + ';\n', encoding='utf-8')
