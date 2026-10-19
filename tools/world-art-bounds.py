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
with Image.open(root / 'assets/images/world/architecture-bodega-galpao-v1.png') as image:
    regions['architecture-bodega-galpao-v1'] = [(0,0,*image.size)]
regions['interior-details-v2'] = [(0,0,430,325),(430,0,790,325),(790,0,1160,325),(1160,0,1536,325),(0,326,430,625),(430,325,790,657),(790,326,1160,644),(1160,326,1536,644),(0,625,430,1024),(430,658,790,1024),(790,645,1160,1024),(1160,645,1536,1024)]
regions['interior-flags-v2'] = [(0,0,384,316),(384,0,768,316),(768,0,1152,316),(1152,0,1536,316),(0,317,384,666),(384,317,704,666),(704,317,1084,666),(1084,317,1536,666),(0,667,370,1024),(370,667,753,1024),(753,667,1320,1024),(1320,667,1536,1024)]
regions['interior-fittings-v2'] = [(0,0,595,490),(595,0,1120,510),(1120,0,1536,520),(0,491,510,1024),(510,521,1120,1024),(1120,521,1536,1024)]
regions['interior-materials-v2'] = [(x,y,x+512,y+512) for y in (0,512) for x in (0,512,1024)]
regions['rural-workstations-v2'] = [(x0,y0,x1,y1) for y0,y1 in [(0,350),(350,679),(679,1024)] for x0,x1 in [(0,560),(560,974),(974,1536)]]
regions['folklore-v2'] = [(0,0,610,514),(620,0,925,514),(938,0,1536,510),(0,514,600,1024),(603,514,1045,1024),(1110,530,1536,1024)]
regions['keepsakes-v2'] = [(x0,y0,x1,y1) for y0,y1 in [(0,351),(351,690),(690,1024)] for x0,x1 in [(0,384),(384,768),(768,1152),(1152,1536)]]
regions['mates-v2'] = [(0,0,540,464),(540,0,1024,464),(1024,0,1536,464),(0,464,550,1024),(550,464,1024,1024),(1024,464,1536,1024)]
regions['harvest-items-v2'] = [(x0,y0,x1,y1) for y0,y1 in [(0,350),(350,652),(652,1024)] for x0,x1 in [(0,384),(384,768),(768,1170),(1170,1536)]]
with Image.open(root / 'assets/images/world/butia-v2.png') as image:
    regions['butia-v2'] = [(0, 0, *image.size)]
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
for key in ['architecture-shop-melhorias', 'architecture-shop-sementes', 'architecture-shop-carnes', 'architecture-shop-armazem-geral', 'architecture-shop-pecuaria', 'architecture-casona', 'architecture-salao', 'architecture-igreja', 'architecture-ctg', 'architecture-oktoberfest']:
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
    alpha = im.getchannel('A') if 'A' in im.getbands() else Image.new('L',im.size,255)
    out[key] = []
    for x0,y0,x1,y1 in cells:
        bbox = alpha.crop((x0,y0,x1,y1)).point(lambda p: 255 if p > 100 else 0).getbbox()
        if bbox is None:
            raise ValueError(f'Empty sprite: {key}')
        l,t,r,b = bbox
        out[key].append([x0+l,y0+t,r-l,b-t])
(root / 'js/render/world-art-crops.js').write_text('// Atlas source rectangles (x, y, width, height). No runtime pixel reads: file:// compatible.\nconst WORLD_ART_CROPS = ' + json.dumps(out, separators=(',',':')) + ';\n', encoding='utf-8')
