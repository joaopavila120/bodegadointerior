// Shared atlas renderer: preserve alpha and proportions, cache only the final small frames.
'use strict';
const EXPANSION_ART = {}, expansionFrames = new Map();
// Arte que só aparece em lugar ou evento específico (caverna, cavalos, Saci, peixes) carrega quando for usada pela
// primeira vez: o jogo abre mais rápido e ocupa menos memória.
const EXPANSION_LAZY = new Set(['cave-beasts-a-v1', 'cave-beasts-b-v1', 'cave-props-v1', 'cave-terrain-v1', 'cave-mouth-v2', 'sadi-combat-v1', 'wild-horses-v1', 'horse-tether-v1', 'uruguai-fish-v1']);
const expansionImageLoads = {};
function expansionImage(key) {
  const im = EXPANSION_ART[key]; if (!im) return null;
  if (!im.getAttribute('src')) { expansionImageLoads[key] = new Promise(resolve => { im.onload = im.onerror = resolve; }); im.src = 'assets/images/expansion/' + key + '.png'; }
  return im;
}
for (const key of Object.keys(EXPANSION_CROPS)) EXPANSION_ART[key] = new Image();
const expansionArtLoaded = Promise.all(Object.keys(EXPANSION_CROPS).filter(key => !EXPANSION_LAZY.has(key)).map(key => (expansionImage(key), expansionImageLoads[key])));
// Testes e prévias: carrega tudo de uma vez.
function expansionArtLoadAll() { return Promise.all(Object.keys(EXPANSION_CROPS).map(key => (expansionImage(key), expansionImageLoads[key]))); }
function expansionFrame(key, index, height, referenceHeight = null) {
  const im = expansionImage(key), crop = EXPANSION_CROPS[key]?.frames[index];
  if (!im?.naturalWidth || !crop) return null;
  const scale = height / (referenceHeight || crop[3]), w = Math.max(1, Math.round(crop[2] * scale)), h = Math.max(1, Math.round(crop[3] * scale));
  const cacheKey = key + ':' + index + ':' + w + ':' + h;
  if (!expansionFrames.has(cacheKey)) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality='medium';
    g.drawImage(im, ...crop.slice(0, 4), 0, 0, w, h);
    if (expansionFrames.size >= 400) expansionFrames.delete(expansionFrames.keys().next().value);
    expansionFrames.set(cacheKey, c);
  }
  return { image: expansionFrames.get(cacheKey), w, h, ax: crop[4] * scale };
}
function expansionSprite(key, index, x, y, height, flip = false, referenceHeight = null) {
  const f = expansionFrame(key, index, height, referenceHeight); if (!f) return false;
  ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.imageSmoothingEnabled = true;
  ctx.drawImage(f.image, -f.ax, -f.h, f.w, f.h); ctx.restore(); return true;
}
let expansionPortraitSerial = 0;
function expansionPortrait(key, index, size = 88) {
  const meta = EXPANSION_CROPS[key], c = meta.frames[index];
  const clip = 'expansion-portrait-' + (++expansionPortraitSerial);
  return `<svg class="portrait portrait-phone" width="${size}" height="${size}" viewBox="${c[0]} ${c[1]} ${c[2]} ${c[3]}" aria-hidden="true"><defs><clipPath id="${clip}" clipPathUnits="userSpaceOnUse"><rect x="${c[0]}" y="${c[1]}" width="${c[2]}" height="${c[3]}" /></clipPath></defs><image clip-path="url(#${clip})" href="${assetURL('assets/images/expansion/' + key + '.png')}" width="${meta.width}" height="${meta.height}" /></svg>`;
}
function expansionRowHeight(key, start, count) { return Math.max(...EXPANSION_CROPS[key].frames.slice(start, start + count).map(c => c[3])); }
{
  const image=itemImageForSize,icon=itemIconHTML;
  itemImageForSize=function(key,pixels){if(['ametista','agata'].includes(key)){const f=expansionFrame('cave-props-v1',key==='ametista'?4:5,Math.min(160,Math.max(24,pixels||48)));if(f)return f.image;}return image(key,pixels);};
  itemIconHTML=function(key,item=null){return ['ametista','agata'].includes(key)?`<span class="pixel-item">${expansionPortrait('cave-props-v1',key==='ametista'?4:5,48)}</span>`:icon(key,item);};
}
const SECONDARY_POSES = new Map();
const secondaryTracks=[];
let secondaryTrackGame=null,secondaryTrackMap=null;
function secondaryGait(id,x,y,walking,dx,dy) {
  const map=worldOut?.map||'bodega';
  if(secondaryTrackGame!==G||secondaryTrackMap!==map){secondaryTracks.length=0;secondaryTrackGame=G;secondaryTrackMap=map;}
  let found=null,near=65;
  for(const t of secondaryTracks){const d=Math.hypot(x-t.x,y-t.y);if(t.id===id&&frameClock-t.time<.5&&t.time!==frameClock&&d<near){found=t;near=d;}}
  if(!found){found={id,x,y,time:frameClock,phase:0,dx,dy};if(secondaryTracks.length>=96)secondaryTracks.shift();secondaryTracks.push(found);}
  else {if(walking&&near>.05){found.phase=(found.phase+near/14)%4;found.dx=x-found.x;found.dy=y-found.y;}else if(!walking){found.phase=1;found.dx=dx;found.dy=dy;}Object.assign(found,{x,y,time:frameClock});}
  return {phase:found.phase,dx:found.dx,dy:found.dy};
}
function secondaryStep(steps,phase,walking){return walking?(steps===3?[0,1,2,1][Math.floor(phase)%4]:Math.floor(phase)%steps):1;}
function secondaryPose(sprite, x, y, walking, dx, dy) {
  const pose = SECONDARY_POSES.get(sprite); if (!pose || !EXPANSION_ART[pose.key]?.naturalWidth) return false;
  const gait=secondaryGait(pose.id,x,y,walking,dx,dy);({dx,dy}=gait);
  const direction = walking ? walkDirection(dx, dy) : 0, step = secondaryStep(pose.steps,gait.phase,walking);
  ellipse(x, y + 1, 18, 7, '#271c1755');
  // Rest uses the original front portrait, also shared with seated visitors.
  // Never freeze a profile stride or rescale the head when movement stops.
  if (!walking && pose.steps === 2) {
    const crop = characterCrop(sprite), height = 124, width = height * crop.w / crop.h;
    const frame = characterFrame(sprite, height);
    ctx.drawImage(frame, x - width / 2, y - height, width, height);
    return true;
  }
  return expansionSprite(pose.key, pose.start + direction * pose.steps + step, x, y, 124, direction === 1 && dx < 0, pose.height);
}
function mountedPose(key, x, y, dx, dy, moving) {
  const direction = moving ? walkDirection(dx, dy) : 0, phase = moving ? Math.floor(frameClock * 7) % 4 : 1;
  ellipse(x, y, direction === 1 ? 60 : 29, 12, '#271c1755');
  return expansionSprite(key, direction * 4 + phase, x, y, 195, direction === 1 && dx < 0, expansionRowHeight(key, 0, 12));
}
function drawExpansionPerson(sprite, x, y, walking, chef, dx, seated, mood, dy) {
  if (seated) return false;
  if (chef && typeof playerMounted === 'function' && playerMounted()) return mountedPose('sadi-mounted-v1', x, y, dx, dy, walking);
  if (chef && inCave() && (sprite === 0 || walkCharacterId(sprite) === 'sadi')) {
    const run = caveFloorRun(), direction = walkDirection(dx, dy);
    if (run.hurt > 0 || run.swing) {
      const step = run.hurt > 0 ? 3 : Math.min(2, Math.floor((1 - run.swing.t / .2) * 3));
      return expansionSprite('sadi-combat-v1', direction * 4 + step, x, y, 150, direction === 1 && dx < 0, expansionRowHeight('sadi-combat-v1', 0, 12));
    }
  }
  return !chef && secondaryPose(sprite, x, y, walking, dx, dy);
}
const CAVE_BEAST_ART = {
  javali: ['cave-beasts-a-v1', 0, 82], sanguanel: ['cave-beasts-a-v1', 4, 86],
  boitata: ['cave-beasts-a-v1', 8, 102], lobisomem: ['cave-beasts-a-v1', 12, 145],
  mula: ['cave-beasts-b-v1', 0, 144], teiniagua: ['cave-beasts-b-v1', 4, 67],
  onca: ['cave-beasts-b-v1', 8, 88], anhanga: ['cave-beasts-b-v1', 12, 146]
};
const oldCaveBeast = drawCaveBeast;
drawCaveBeast = function(b) {
  const [key, start, height] = CAVE_BEAST_ART[b.kind] || [];
  if (!expansionImage(key)?.naturalWidth) return oldCaveBeast(b);
  const attack = b.attack > 0 || ['charge', 'lunge'].includes(b.state);
  const step = attack ? 3 : b.state === 'rest' ? 1 : Math.floor(b.frame) % 3;
  ctx.save(); if (b.hurt > 0) ctx.filter = 'brightness(1.8)';
  ellipse(b.x, b.y, 28, 9, '#0007');
  expansionSprite(key, start + step, b.x, b.y, height, b.dx < 0, expansionRowHeight(key, start, 4)); ctx.restore();
  if (b.hp < b.max) { txt(CAVE_BEASTS[b.kind].name, b.x, b.y - height - 14, 12, '#ffe2a6'); bar(b.x - 25, b.y - height - 8, 50, b.hp / b.max, '#df674c'); }
};
const oldCaveRock = drawCaveRock;
drawCaveRock = function(r) {
  const index = r.loot === 'ametista' ? 2 : r.loot === 'agata' ? 3 : r.hp < 3 ? 1 : 0;
  if (!expansionSprite('cave-props-v1', index, r.x, r.y + 7, 64)) return oldCaveRock(r);
  if (r.hp < 3) bar(r.x - 18, r.y + 13, 36, r.hp / 3, '#c6aa73');
};
const oldCaveChest = drawCaveChest, oldCaveLadder = drawCaveLadder, oldCaveDrop = drawCaveDrop;
drawCaveChest = c => expansionSprite('cave-props-v1', c.open ? 7 : 6, c.x, c.y + 5, c.open ? 77 : 63) || oldCaveChest(c);
drawCaveLadder = l => expansionSprite('cave-props-v1', 8, l.x, l.y + 12, 72) || oldCaveLadder(l);
drawCaveDrop = function(d) {
  if (['ametista', 'agata'].includes(d.k) && expansionSprite('cave-props-v1', d.k === 'ametista' ? 4 : 5, d.x, d.y + Math.sin(frameClock * 4 + d.x) * 3, 26)) return;
  oldCaveDrop(d);
};
// Cache the entire static floor once per generated level. Monsters/loot stay separate.
let caveGroundCache = null, caveGroundRun = null;
const oldCaveFloor = drawCaveFloor, oldCaveWall = drawCaveWall;
const oldCaveMouth=drawCaveMouth;
drawCaveMouth=function(layers,seen){
  const {x,y}=CAVE.door;if(!caveOpen()||!seen(x,y,520))return;
  if(!expansionImage('cave-mouth-v2')?.naturalWidth)return oldCaveMouth(layers,seen);
  layers.push({y:y-10,draw:()=>expansionSprite('cave-mouth-v2',0,x,y+32,335)});
};
drawCaveFloor = function(view) {
  if (!expansionImage('cave-terrain-v1')?.naturalWidth) return oldCaveFloor(view);
  const run = caveFloorRun(), C = CAVE.cell;
  if (caveGroundRun !== run) {
    caveGroundRun = run; caveGroundCache = document.createElement('canvas');
    caveGroundCache.width = CAVE.cols * C; caveGroundCache.height = CAVE.rows * C;
    const g = caveGroundCache.getContext('2d'); g.imageSmoothingEnabled = false;
    const tile=320;
    for (let y = 0; y < caveGroundCache.height; y+=tile) for (let x = 0; x < caveGroundCache.width; x+=tile) {
      const c = EXPANSION_CROPS['cave-terrain-v1'].frames[0];
      g.drawImage(EXPANSION_ART['cave-terrain-v1'], ...c.slice(0,4), x, y, tile, tile);
    }
    if(run.floor>10){g.globalCompositeOperation='multiply';g.fillStyle='#ec7764';g.fillRect(0,0,caveGroundCache.width,caveGroundCache.height);g.globalCompositeOperation='source-over';}
  }
  rect(view.x - 50, view.y - 50, view.w + 100, view.h + 100, '#100e0c'); ctx.drawImage(caveGroundCache, 0, 0);
};
// Four small cached tiles: two variants, with and without the deep-floor tint.
// Filter only the cropped tile, never the large atlas on every wall/every frame.
const caveWallTiles = new Map();
let caveWallTileSource = null;
function caveWallTile(variant, deep) {
  const source=expansionImage('cave-terrain-v1');if(!source?.naturalWidth)return null;
  if(caveWallTileSource!==source){caveWallTiles.clear();caveWallTileSource=source;}
  const key=variant+':'+deep+':'+CAVE.cell;
  if(!caveWallTiles.has(key)){
    const c=EXPANSION_CROPS['cave-terrain-v1'].frames[2+variant],tile=document.createElement('canvas');
    tile.width=CAVE.cell;tile.height=CAVE.cell+26;
    const g=tile.getContext('2d');
    g.drawImage(source,...c.slice(0,4),0,0,tile.width,tile.height);
    if(deep){const tinted=document.createElement('canvas');tinted.width=tile.width;tinted.height=tile.height;
      // Tom avermelhado sem filtro (filtro de canvas deixava cada parede cara de desenhar): multiplica e recorta pelo alfa.
      const t=tinted.getContext('2d');t.drawImage(tile,0,0);t.globalCompositeOperation='multiply';t.fillStyle='#e0806a';t.fillRect(0,0,tinted.width,tinted.height);t.globalCompositeOperation='destination-in';t.drawImage(tile,0,0);caveWallTiles.set(key,tinted);
    }else caveWallTiles.set(key,tile);
  }
  return caveWallTiles.get(key);
}
drawCaveWall = function(x, y, run) {
  const tile=caveWallTile((x+y)%2,run.floor>10);
  if(!tile)return oldCaveWall(x,y,run);
  const C=CAVE.cell;
  ctx.drawImage(tile,x*C,y*C-26);
  if (run.grid[y+1]?.[x] === 0) rect(x*C, (y+1)*C-8, C, 8, '#100d0a88');
};

// Art is shared as three atlases; each collectible still has its own portrait.
const COLLECTIBLE_ART = {};
for (const [key, rows, ids] of [
  ['cards-bodega-v1',4,'valter badin guri marcio marcelo indavirus lauro peixinhonabrasa manolima dianho mitodosul loligebien jayme baitaca negrinho lobisomem'],
  ['cards-history-v1',4,'bento_goncalves garibaldi anita canabarro netto lanceiros sepe roque_gonzalez cruz_e_sousa blumenau victor_meirelles antonieta joao_maria hercilio_luz teixeirinha gildo'],
  ['cards-voices-v1',3,'elis lupicinio pedro_raymundo noel_guarany paixao_cortes barbosa_lessa simoes_lopes erico quintana sanguanel boitata mula']
]) ids.split(' ').forEach((id,i)=>COLLECTIBLE_ART[id]={key,rows,col:i%4,row:Math.floor(i/4)});
// Generated portraits have slightly uneven rows. Inset each actual panel so
// adjacent faces and divider lines never bleed into a collectible card.
const CARD_PANEL_BOUNDS = {
  'cards-bodega-v1': { w:1024,h:1536,x:[0,256,512,768,1024],y:[0,384,746,1110,1536] },
  'cards-history-v1': { w:1024,h:1536,x:[0,256,512,768,1024],y:[0,373,753,1119,1536] },
  'cards-voices-v1': { w:1182,h:1330,x:[0,289,591,893,1182],y:[0,443,887,1330] }
};
function collectibleArt(id) {
  const card=cardDef(id);
  if(card?.set==='bodega'){
    const file=PORTRAIT_FILES[card.person],person=PEOPLE.findIndex(p=>p.id===card.person);
    return file?`<img class="tcard-photo" src="assets/images/portraits/${file}.jpg" alt="${escapeHTML(card.name)}" draggable="false">`:person>=0?portraitHTML(person,240):'';
  }
  const encounter={teiniagua:['cave-beasts-b-v1',4],onca:['cave-beasts-b-v1',8],saci:['saci-walk-v2',0],dunstano:['dunstan-walk-v2',0]}[id];
  if(encounter)return `<div class="tcard-encounter">${expansionPortrait(encounter[0],encounter[1],220)}</div>`;
  const a=COLLECTIBLE_ART[id];if(!a)return '';
  const b=CARD_PANEL_BOUNDS[a.key],x=b.x[a.col]+2,y=b.y[a.row]+2,w=b.x[a.col+1]-x-2,h=b.y[a.row+1]-y-2;
  return `<div class="tcard-img" role="img" aria-label="Ilustração de ${escapeHTML(cardDef(id).name)}" style="background-image:url('assets/images/expansion/${a.key}.png');background-size:${b.w/w*100}% ${b.h/h*100}%;background-position:${x/(b.w-w)*100}% ${y/(b.h-h)*100}%;background-repeat:no-repeat;width:100%;height:100%"></div>`;
}

// Antes de precisar: chegando na Serra, a arte da caverna já começa a carregar; na Fronteira, a dos peixes e cavalos.
{
  let clock = 0;
  const tick = outsideTick;
  outsideTick = function (dt) {
    tick(dt); if ((clock -= dt) > 0) return; clock = 1; const m = worldOut?.map;
    if (m === 'serra' || m === 'caverna') ['cave-mouth-v2', 'cave-props-v1', 'cave-terrain-v1', 'cave-beasts-a-v1', 'cave-beasts-b-v1', 'sadi-combat-v1'].forEach(expansionImage);
    if (m === 'vila') ['uruguai-fish-v1', 'wild-horses-v1'].forEach(expansionImage);
    if (G?.mount?.owned) expansionImage('horse-tether-v1');
  };
}
