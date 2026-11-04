"""Register alpha bounds and ground anchors; never modifies the generated PNGs."""
from pathlib import Path
import argparse
import json
import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--future-characters', action='store_true', help='Register the reserved historical characters, without changing game atlases.')
args = parser.parse_args()
HUMANS = {'bruxa', 'bruxa-mor', 'pirata', 'afogado', 'nereu', 'griggs'}
NPCS = {'nereu', 'griggs'}
folder = ROOT / 'assets/images/creatures'
destination = ROOT / 'js/render/creature-action-crops.js'
constant = 'CREATURE_CROPS'
if args.future_characters:
    HUMANS = NPCS = {'david-canabarro', 'dom-pedro-ii', 'monge-joao-maria'}
    folder = ROOT / 'assets/images/future-characters'
    destination = folder / 'sprites.js'
    constant = 'FUTURE_CHARACTER_SPRITES'
out = {}
for path in sorted(folder.glob('*-v1.png')):
    key = path.stem[:-3]
    im = Image.open(path)
    assert im.mode == 'RGBA', (key, 'needs alpha')
    alpha = np.array(im)[:, :, 3]
    assert (alpha == 0).mean() > .2, (key, 'background is not transparent')
    ids, _ = label(alpha > 100)
    sizes = np.bincount(ids.ravel())
    boxes = []
    for n, region in enumerate(find_objects(ids), 1):
        if sizes[n] < 2200:
            continue
        y, x = region
        boxes.append([x.start, y.start, x.stop, y.stop])
    count = 12 if key in NPCS else 8
    assert len(boxes) == count, (key, len(boxes), 'inspect atlas separation')
    boxes.sort(key=lambda b: (b[1] + b[3]) / 2)
    boxes = [b for row in range(count // 4) for b in sorted(boxes[row * 4:row * 4 + 4])]
    # Generated poses aren't an exact grid. Associate each alpha component with
    # its closest body, rather than including a neighbour that crosses a cell.
    soft_ids, _ = label(alpha > 32)
    soft_sizes = np.bincount(soft_ids.ravel())
    bounds = [list(b) for b in boxes]
    owners = np.full(len(soft_sizes), -1, dtype=int)
    for n, region in enumerate(find_objects(soft_ids), 1):
        if soft_sizes[n] < 5:
            continue
        sy, sx = region
        overlaps = [int(np.count_nonzero(soft_ids[t:b, l:r] == n)) for l, t, r, b in boxes]
        if max(overlaps):
            owner = int(np.argmax(overlaps))
        else:
            cx, cy = (sx.start + sx.stop) / 2, (sy.start + sy.stop) / 2
            distances = [max(l-cx, 0, cx-r)**2 + max(t-cy, 0, cy-b)**2 for l,t,r,b in boxes]
            if min(distances) > 45**2:
                continue
            owner = int(np.argmin(distances))
        b = bounds[owner]
        owners[n] = owner
        b[:] = [min(b[0],sx.start), min(b[1],sy.start), max(b[2],sx.stop), max(b[3],sy.stop)]
    frames = []
    clips = {}
    for i, (left, top, right, bottom) in enumerate(boxes):
        # Main opaque body's pivot remains stable even when a weapon extends.
        if key in HUMANS:
            strip = alpha[top + int((bottom-top)*.62):top + int((bottom-top)*.85), left:right] > 120
            weights = strip.sum(axis=0)
            pivot = left + int(np.searchsorted(weights.cumsum(), weights.sum()/2))
        else:
            pivot = round(left + (right-left) * (.82 if key.startswith('bernuncia') else .5))
        x, y, r, b = bounds[i]
        x, y = max(0, x-1), max(0, y-1)
        r, b = min(im.width, r+1), min(im.height, b+1)
        own = int(np.argmax(np.bincount(ids[top:bottom,left:right].ravel())[1:]) + 1)
        clipped = np.bincount(ids[y:b,x:r].ravel(), minlength=len(sizes))
        neighbours = [n for n in range(1,len(sizes)) if n != own and sizes[n] >= 2200 and clipped[n] > 10]
        if neighbours:
            # Rectangular bounds overlap for a few extended limbs. Supply a
            # runtime clipping polygon; the source atlas stays untouched.
            mask = owners[soft_ids[y:b,x:r]] == i
            edge_l, edge_r = [], []
            for yy in range(mask.shape[0]):
                occupied = np.flatnonzero(mask[yy])
                if not len(occupied):
                    continue
                ll, rr = max(0, int(occupied[0])-1), min(r-x, int(occupied[-1])+2)
                row_ids = ids[y+yy,x+ll:x+rr]
                assert not any(np.count_nonzero(row_ids == n) > 2 for n in neighbours), (key,i,'poses interleave')
                edge_l.extend([[ll,yy],[ll,yy+1]])
                edge_r.extend([[rr,yy],[rr,yy+1]])
            polygon = edge_l + edge_r[::-1]
            simplified = []
            for point in polygon:
                while len(simplified) >= 2:
                    a, c = simplified[-2:]
                    if (c[0]-a[0])*(point[1]-c[1]) != (c[1]-a[1])*(point[0]-c[0]):
                        break
                    simplified.pop()
                if not simplified or point != simplified[-1]:
                    simplified.append(point)
            clips[i] = simplified
        frames.append([int(x),int(y),int(r-x),int(b-y),int(pivot-x),int(bottom-y)])
    reference = frames[0][3] if key in HUMANS else frames[0][2]
    out[key] = {'size': list(im.size), 'reference': reference, 'frames': frames}
    if clips:
        out[key]['clips'] = clips
    if args.future_characters:
        out[key].update({
            'name': {'david-canabarro': 'David Canabarro', 'dom-pedro-ii': 'Dom Pedro II', 'monge-joao-maria': 'Monge João Maria'}[key],
            'image': path.name, 'displayHeight': {'david-canabarro': 132, 'dom-pedro-ii': 136, 'monge-joao-maria': 126}[key],
            'fps': 7, 'animations': {'idle': [0], 'down': [1,3,2,0], 'right': [5,7,6,4],
                'left': [5,7,6,4], 'up': [9,8,10,8], 'gesture': [11]},
            'flipAnimations': ['left']
        })

destination.write_text(
    "// Generated from PNG alpha by scripts/build-creature-crops.py.\n'use strict';\nconst " + constant + " = "
    + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print(f'{len(out)} atlases, {sum(len(s["frames"]) for s in out.values())} poses')
