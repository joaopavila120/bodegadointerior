// Raster art backend shared by the outdoor maps and their interiors.
// Geometry, collision rectangles and interaction points stay in the map definitions.
'use strict';
const WORLD_ART = {};
const bodegaGalpaoArt=new Image();bodegaGalpaoArt.src='assets/images/world/architecture-bodega-galpao-v1.png';WORLD_ART['architecture-bodega-galpao-v1']=bodegaGalpaoArt;
const RURAL_ART_SHEETS = ['rural-workstations-v2','folklore-v2','keepsakes-v2','mates-v2','butia-v2','harvest-items-v2','interior-details-v2','interior-materials-v2','interior-flags-v2','interior-fittings-v2'];
for(const key of RURAL_ART_SHEETS){const im=new Image();im.src='assets/images/world/'+key+'.png';WORLD_ART[key]=im;}
for (const key of ['architecture-shop-melhorias', 'architecture-shop-sementes', 'architecture-shop-carnes', 'architecture-shop-armazem-geral', 'architecture-shop-pecuaria', 'buildings', 'nature', 'furniture', 'terrain', 'grass', 'rural', 'garden', 'architecture0', 'architecture1', 'architecture2', 'architecture3', 'architecture-casona', 'architecture-salao', 'architecture-igreja', 'architecture-ctg', 'architecture-oktoberfest', 'frontier-terrain', 'frontier-flora', 'architecture-fronteira', 'architecture-bolichos', 'store-shelves', 'landscape', 'meadow', 'pew', 'overhead']) {
  const image = new Image();
  image.src = 'assets/images/world/' + key + (key.startsWith('architecture-shop-')?'.png':'.webp');   // WebP q92: ~25% do PNG, sem diferença visível
  WORLD_ART[key] = image;
}
const worldTextureCache = new Map();
const worldSpriteCache = new Map(), WORLD_SPRITE_CACHE_PIXELS = 18e6;
let worldSpriteCachePixels = 0;
let worldMeadowStamp = null;
function worldSprite(sheet, index, x, y, w, h) {
  if(sheet==='buildings'){
    if(index===5||index===8){sheet=index===5?'architecture-casona':'architecture-salao';index=0;}
    else{sheet='architecture'+Math.floor(index/4);index%=4;}
  }
  if(sheet==='furniture'&&[2,5,35].includes(index)){index=({2:0,5:3,35:1})[index];sheet='overhead';}
  if(sheet==='garden'&&index===8){sheet='overhead';index=2;}
  const im = WORLD_ART[sheet], crop = WORLD_ART_CROPS[sheet]?.[index];
  if (!im?.naturalWidth || !crop) return false;
  if (RURAL_ART_SHEETS.includes(sheet) || sheet.startsWith('architecture') || (sheet==='store-shelves'||sheet==='frontier-flora') || sheet==='overhead' || (sheet === 'furniture' && index !== 5) ||
      (sheet === 'garden' && index !== 3 && index !== 8) ||
      (sheet === 'nature' && [0,1,2,3,8,9,15].includes(index))) {
    const center=x+w/2,bottom=y+h,scale=Math.min(w/crop[2],h/crop[3]);
    w=crop[2]*scale;h=crop[3]*scale;x=center-w/2;y=bottom-h;
  }
  ctx.save();
  ctx.imageSmoothingEnabled = (sheet.startsWith('architecture') || (sheet==='store-shelves'||sheet==='frontier-flora') || sheet==='landscape') && w < crop[2];
  ctx.imageSmoothingQuality='medium';
  // Todo sprite sai de uma cópia já no tamanho da tela: redimensionar a folha grande a cada quadro pesava muito.
  const smoothCache=RURAL_ART_SHEETS.includes(sheet)||(sheet==='nature'&&index<3)||sheet==='landscape'||(sheet==='store-shelves'||sheet==='frontier-flora')||sheet.startsWith('architecture');
  {
    const step=smoothCache?8:1,cw=Math.max(step,Math.round(w/step)*step),ch=Math.max(step,Math.round(h/step)*step),key=sheet+':'+index+':'+cw+':'+ch;
    if(!worldSpriteCache.has(key)){
      const tile=document.createElement('canvas');tile.width=cw;tile.height=ch;
      const c=tile.getContext('2d');c.imageSmoothingEnabled=smoothCache;c.imageSmoothingQuality='medium';worldSpriteCachePixels+=cw*ch;
      if(sheet==='landscape'&&index===0){
        // Tint the source only once, then resize it without another color filter.
        if(!worldMeadowStamp){
          worldMeadowStamp=document.createElement('canvas');worldMeadowStamp.width=crop[2];worldMeadowStamp.height=crop[3];
          const stamp=worldMeadowStamp.getContext('2d');stamp.filter='saturate(.8) brightness(.9)';
          stamp.drawImage(im,...crop,0,0,crop[2],crop[3]);
        }
        c.drawImage(worldMeadowStamp,0,0,cw,ch);
      }else c.drawImage(im,...crop,0,0,cw,ch);
      worldSpriteCache.set(key,tile);
      // Teto de memória: descarta as cópias mais antigas (voltam a ser feitas se aparecerem de novo).
      while(worldSpriteCachePixels>WORLD_SPRITE_CACHE_PIXELS&&worldSpriteCache.size>1){const [k0,t0]=worldSpriteCache.entries().next().value;worldSpriteCachePixels-=t0.width*t0.height;worldSpriteCache.delete(k0);t0.width=t0.height=0;}
    }else{const t=worldSpriteCache.get(key);worldSpriteCache.delete(key);worldSpriteCache.set(key,t);}
    ctx.drawImage(worldSpriteCache.get(key),Math.round(x),Math.round(y),Math.round(w),Math.round(h));
  }
  ctx.restore();
  return true;
}
function worldTreeSprite(index,x,y,w,h){
  ctx.save();
  ellipse(x+12,y+2,w*.3,17,'#17291930');
  const p=worldOut;
  // Fade the canopy only where it would hide the player. No extra collision.
  if(p&&Math.abs(p.x-x)<w*.43&&p.y<y+6&&p.y>y-h*.8)ctx.globalAlpha=.42;
  ctx.translate(Math.sin(frameClock*.85+x*.017+y*.009)*1.2,0);
  const drawn=worldSprite('nature',index,x-w/2,y-h,w,h);
  ctx.restore();return drawn;
}
function worldTexture(index, x, y, w, h, size = 192) {
  if(index===0)size=Math.max(96,Math.round(size*.65));
  if (!WORLD_ART.terrain.naturalWidth) return false;
  const key = index + ':' + size;
  if (!worldTextureCache.has(key)) {
    const tile = document.createElement('canvas'); tile.width = tile.height = size;
    const c = tile.getContext('2d'), im = index === 0 ? WORLD_ART.grass : WORLD_ART.terrain, s = im.naturalWidth / (index === 0 ? 1 : 3);
    if (!im.naturalWidth) return false;
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality='medium';
    c.drawImage(im, index % 3 * s, Math.floor(index / 3) * s, s, s, 0, 0, size, size);
    if(index===0){
      if(!WORLD_ART.meadow.naturalWidth)return false;
      // Quiet turf beneath detailed planting: flowers no longer compete with people.
      c.globalAlpha=.34;c.drawImage(WORLD_ART.meadow,0,0,size,size);c.globalAlpha=1;
    }
    worldTextureCache.set(key, ctx.createPattern(tile, 'repeat'));
  }
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = worldTextureCache.get(key); ctx.fillRect(x, y, w, h); ctx.restore();
  return true;
}
function worldBuilding(index, r, title, rise = 30) {
  if (!worldSprite('buildings', index, r.x, r.y - rise, r.w, r.h + rise)) return false;
  if (title) signBoard(r.x + r.w / 2, r.y + r.h + 5, Math.min(r.w, 280), title, 12);
  return true;
}
function worldWall(x, y, w, h) {
  const im = WORLD_ART.terrain, s = im.naturalWidth / 3;
  if (!s) return;
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.imageSmoothingEnabled = false;
  for (let dx = 0; dx < w; dx += 160) ctx.drawImage(im,s*2,s*2,s,s,x+dx,y,160,h);
  ctx.restore();
}
// Original renderers remain as loading fallbacks; gameplay never depends on art readiness.
function useWorldArt(name, paint) {
  const fallback = window[name];
  window[name] = function (...args) { if (!paint(...args)) return fallback(...args); };
}
useWorldArt('worldHouse', (r, name) => {
  const home = VILA.houses.indexOf(r);
  if (home < 0) return worldBuilding(2, r, name);
  return worldSprite('architecture-fronteira', [0,1,2,3,1][home], r.x, r.y - 30, r.w, r.h + 30);
});
useWorldArt('drawStoneHouse', (r, name) => worldBuilding(r === SERRA.vinicola ? 14 : r === SERRA.galeteria ? 15 : 3, r, name));
useWorldArt('drawEnxaimel', (r, name) => worldBuilding(4, r, name));
useWorldArt('drawCasona', (r, name) => worldBuilding(5, r, name));
useWorldArt('drawIgreja', r => worldSprite('architecture-igreja',0,r.x,r.y-170,r.w,r.h+170));
useWorldArt('drawLuterana', r => worldBuilding(7, r, null, 180));
useWorldArt('drawSalao', r => worldBuilding(8, r, 'SALÃO DA COMUNIDADE'));
function worldBodegaBounds(){
  const r=VILA.bodega,crop=WORLD_ART_CROPS['architecture-bodega-galpao-v1'][0],scale=Math.min(r.w/crop[2],r.h/crop[3]);
  const w=crop[2]*scale,h=crop[3]*scale;
  return {x:r.x+(r.w-w)/2,y:r.y+r.h-h,w,h,scale,crop};
}
function worldBodegaLights(){
  const b=worldBodegaBounds();
  return [[584,632],[948,632],[355,638],[1154,638]].map(([x,y])=>[b.x+(x-b.crop[0])*b.scale,b.y+(y-b.crop[1])*b.scale]);
}
useWorldArt('drawWorldBodega', () => {
  const b=worldBodegaBounds();
  if(!worldSprite('architecture-bodega-galpao-v1',0,b.x,b.y,b.w,b.h))return worldBuilding(0,VILA.bodega,G.bodegaName||'Bodega do Sadi',40);
  return true;
});
useWorldArt('drawWorldCancha', () => worldBuilding(1, VILA.cancha, 'CANCHA DE BOCHA', 20));
useWorldArt('drawWorldShop', (r, name) => {
  const shop = [VILA.agro, VILA.gado, VILA.atacado, VILA.acougue].indexOf(r);
  return shop < 0 ? worldBuilding(10, r, name) :
    worldSprite('architecture-shop-'+['sementes','pecuaria','armazem-geral','carnes'][shop],0,r.x,r.y,r.w,r.h);
});
useWorldArt('drawFerragem',()=>{const r=VILA.ferragem;return worldSprite('architecture-shop-melhorias',0,r.x,r.y,r.w,r.h);});
useWorldArt('drawMissoes', () => worldBuilding(12, VILA.missoes, 'RUÍNAS DAS MISSÕES', 40));
useWorldArt('drawWorldTree', (x,y,kind)=>worldTreeSprite(kind==='a'?1:kind==='ipe'?2:0,x,y,310,440));
useWorldArt('drawCoreto', r => worldSprite('nature', 4, r.x, r.y - 40, r.w, r.h + 40));
useWorldArt('drawCapitel', r => worldSprite('nature', 7, r.x, r.y - 20, r.w, r.h + 20));
useWorldArt('wineBarrels', (x, y) => worldSprite('nature', 9, x - 24, y - 65, 140, 95));
useWorldArt('drawPavilion', (r, title) => {
  if (!worldSprite('nature', 13, r.x, r.y - 20, r.w, r.h + 20)) return false;
  signBoard(r.x + r.w / 2, r.y + r.h + 5, r.w, title, 12); return true;
});
useWorldArt('drawMonument', (r, plaque) => {
  if (!worldSprite('nature', 12, r.x, r.y - 20, r.w, r.h + 20)) return false;
  signBoard(r.x + r.w / 2, r.y + r.h + 5, 225, plaque, 11); return true;
});
useWorldArt('grassField', (M, view) => {
  if (M.id==='vila' && drawFrontierTerrain(view)) return true;
  if (drawRegionalTerrain(M,view)) return true;
  if (!worldTexture(0, view.x, view.y, view.w, view.h, 512)) return false;
  worldDressingGround(M, view); worldApproaches(M); return true;
});
useWorldArt('road', (x, y, w, h, color) => {
  if (worldOut?.map==='vila' && WORLD_ART['frontier-terrain'].naturalWidth) return true;
  if (regionalEnvironmentReady(worldOut?.map)) return true;
  if (!worldTexture(color === '#a8a49a' ? 2 : 1, x, y, w, h, 160)) return false;
  ctx.save(); ctx.strokeStyle = '#66553166'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h); ctx.restore(); return true;
});
useWorldArt('floorPattern', (r, kind) => worldTexture(({ tile: 4, marble: 4, stone: 5, dirt: 1, concrete: 5, carpet: 7 })[kind] ?? 3, r.x, r.y, r.w, r.h, kind === 'wood' ? 160 : kind === 'stone' ? 112 : 144));
useWorldArt('drawVineyard', r => {
  if (!WORLD_ART.nature.naturalWidth) return false;
  worldTexture(1, r.x, r.y, r.w, r.h);
  const cols = Math.max(1, Math.round(r.w / 145)), rows = Math.max(1, Math.round(r.h / 80));
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++)
    worldSprite('nature', 6, r.x + col * r.w / cols, r.y + row * r.h / rows - 12, r.w / cols, r.h / rows + 12);
  return true;
});
useWorldArt('drawPraca', r => {
  if (!WORLD_ART.nature.naturalWidth) return false;
  if(!regionalEnvironmentReady(worldOut?.map))worldTexture(0, r.x, r.y, r.w, r.h);
  for(const path of [[r.x+r.w/2-24,r.y,48,r.h],[r.x,r.y+r.h/2-24,r.w,48]]){
    if(regionalEnvironmentReady(worldOut?.map)){
      for(const [expand,alpha] of [[6,.25],[0,1]]){
        ctx.save();ctx.clip(frontierRoadPath(path,expand));ctx.globalAlpha=alpha;
        frontierTexture(1,path[0]-8,path[1]-8,path[2]+16,path[3]+16);
        ctx.globalAlpha=alpha*.4;worldTexture(2,path[0]-8,path[1]-8,path[2]+16,path[3]+16,70);ctx.restore();
      }
    }else worldTexture(2,...path,128);
  }
  for (const dx of [.23, .77]) for (const dy of [.2, .8]) worldSprite('nature', 5, r.x + r.w * dx - 48, r.y + r.h * dy - 22, 96, 48);
  // Fence gaps line up with both stone paths; these low borders are decorative.
  for (const y of [r.y, r.y + r.h - 12]) for (const dx of [0, .58]) worldSprite('nature', 10, r.x + r.w * dx, y - 24, r.w * .42, 36);
  flagRS(r.x + 42, r.y + r.h / 2 - 30);
  signBoard(r.x + r.w / 2, r.y - 46, 220, 'PRAÇA DA COMUNIDADE', 13); return true;
});
// Furniture sprites have the same ground footprint as their original solid object.
const WORLD_FURNITURE = {
  bed: [0, 0], bedbau: [0, 0], wardrobe: [1, 70], table: [2, 18], sofa: [3, 34], tv: [4, 76], rug: [5, 0],
  stove: [6, 100], counter: [7, 50], fridge: [8, 100], toilet: [9, 24], bathtub: [10, 14], sinkbath: [11, 120],
  shelf: [12, 120], desk: [13, 34], printer: [15, 48], trophy: [16, 90], barrel: [17, 22], chope: [18, 40],
  salame: [19, 110], gaita: [20, 70], viola: [21, 110], arreio: [22, 40], wood: [23, 16], cooler: [24, 30],
  plant: [25, 50], shoes: [26, 0], bochas: [27, 10], pillar: [30, 200], grill: [31, 190], stairs: [32, 0],
  altar: [34, 70], longtable: [35, 40]
};
// Visual dimensions use the 130-unit adult sprite as a reference. Collision h is
// floor depth, not the height of a chair, wardrobe or refrigerator.
const WORLD_FURNITURE_SCALE = {
  table: [1.2, 115, 205, 145], longtable: [1, 180, 650, 160],
  wardrobe: [1, 75, 140, 180], fridge: [1, 65, 105, 170],
  sofa: [1, 150, 290, 135], tv: [.85, 110, 180, 130],
  bed: [1, 150, 210, 175], bedbau: [1, 150, 210, 175],
  salame: [.65, 85, 125, 105], barrel: [1, 52, 72, 82], chope: [1, 52, 75, 95],
  shelf: [1, 80, 180, 175], desk: [1, 100, 190, 125],
  stove: [1, 90, 130, 170], counter: [1, 100, 240, 110],
  plant: [1, 32, 65, 75], wood: [1.2, 45, 85, 55], shoes: [1, 28, 42, 38],
  gaita: [1, 45, 65, 58], viola: [1, 35, 55, 105], arreio: [1, 55, 80, 85],
  cooler: [.9, 55, 85, 70], toilet: [1, 45, 70, 80], bathtub: [1, 120, 180, 90],
  sinkbath: [1, 55, 95, 140], printer: [1, 35, 55, 45], bochas: [1, 45, 70, 35]
};
function worldFurnitureBounds(kind, i, index, rise) {
  if(kind==='rug')return {x:i.x+i.w*.15,y:i.y+i.h*.1,w:i.w*.7,h:i.h*.8};
  const crop=[2,35].includes(index)?WORLD_ART_CROPS.overhead[index===2?0:1]:WORLD_ART_CROPS.furniture[index], p=WORLD_FURNITURE_SCALE[kind];
  const width=p?clamp(i.w*p[0],p[1],p[2]):i.w;
  const height=p?p[3]:i.h+rise;
  const scale=Math.min(width/crop[2],height/crop[3]);
  const w=crop[2]*scale,h=crop[3]*scale;
  return {x:i.x+i.w/2-w/2,y:i.y+i.h-h,w,h};
}
// North-facing pews show their seat from above, with the backrest to the south.
// Match the full collision width and preserve the source aspect ratio.
const worldPewFallback = FURN.pew;
const worldStoreShelfFallback = FURN.storeShelf;
FURN.storeShelf = i => {
  const index = {agro:0, gado:1, atacado:2, acougue:3}[i.goods];
  // Keep the feet on the collision footprint and aisles clear of merchandise.
  const height=i.y<350?180:205;
  if (index === undefined || !worldSprite('store-shelves', index, i.x, i.y + i.h - height, i.w, height)) {
    worldStoreShelfFallback(i);
  }
};
FURN.pew = i => {
  const crop = WORLD_ART_CROPS.pew[0], h = i.w * crop[3] / crop[2];
  if (!worldSprite('pew', 0, i.x, i.y + i.h - h, i.w, h)) worldPewFallback(i);
};
for (const [kind, [index, rise]] of Object.entries(WORLD_FURNITURE)) {
  const fallback = FURN[kind];
  FURN[kind] = i => {
    const b=worldFurnitureBounds(kind,i,index,rise);
    if (!worldSprite('furniture', index, b.x, b.y, b.w, b.h)) return fallback(i);
    if (kind === 'table' && i.cards) for (let n = 0; n < 3; n++) rect(b.x+b.w*.3+n*15,b.y+b.h*.4,10,14,'#fff2d5',1,'#71472e');
    if (kind === 'table' && i.mate) { ctx.save();ctx.translate(b.x+b.w*.6,b.y+b.h*.4);ctx.scale(.7,.7);drawCuia(0,0);ctx.restore(); }
  };
}

useWorldArt('signBoard', (x, y, w, title, size = 15) => {
  // Place names are shown by the existing proximity interaction hint.
  return true;
});

function worldApproachRects(M) {
  if(worldMainRoads(M.id).length)return worldDoorPaths(M);
  const paths=tourismPaths(M.id),path=(...r)=>{if(r[2]>0&&r[3]>0)paths.push(r);};
  if (M.id === 'vila') {
    for (const r of [VILA.bodega, VILA.cancha, VILA.ferragem]) path(r.x + r.w / 2 - 28, r.y + r.h, 56, VILA.roadY - r.y - r.h);
    for (const r of [VILA.agro, VILA.gado, VILA.atacado, ...VILA.houses.slice(0, 1)]) path(r.x + r.w / 2 - 24, r.y + r.h, 48, 1440 - r.y - r.h);
    paths.push(...worldFootpaths());
  } else if (M.id === 'serra') {
    for (const r of [SERRA.badin, SERRA.casona]) path(r.x + r.w / 2 - 24, r.y + r.h, 48, SERRA.roadY - r.y - r.h);
    path(530, 1650, 1280, 48); path(SERRA.roadX + SERRA.roadW, SERRA.praca.y + SERRA.praca.h / 2 - 24, SERRA.praca.x - SERRA.roadX - SERRA.roadW, 48);
    path(SERRA.estacao.x + SERRA.estacao.w / 2 - 24, 1090, 48, 244);
    for(const r of [SERRA.vinicola,SERRA.galeteria])path(r.x+r.w/2-24,r.y+r.h,48,SERRA.arroio-r.y-r.h);
    path(1780,2360,260,40);path(2016,2360,48,40);
  } else if (M.id === 'sc') {
    for (const r of [...SC.houses, SC.cafe]) {
      const x = r.x + r.w / 2 - 24, end = r.y + r.h;
      if (end < SC.streetY) path(x, end, 48, SC.streetY - end);
      else { path(x, end, 48, 45); path(r.x - 40, end + 5, r.w / 2 + 40, 40); path(r.x - 40, SC.streetY + SC.streetH, 40, end - SC.streetY - SC.streetH + 45); }
    }
  }
  return paths;
}
function worldApproaches(M) {
  for(const r of worldApproachRects(M))worldTexture(M.id==='vila'&&r[3]<=30?1:2,...r,128);
}

// Extra vegetation stays beside buildings and in the existing forest border.
function worldLandscape(M, seen, layers, view) {
  worldDressingLayers(M, seen, layers, view);
  regionalFarmLayers(M,seen,layers);
  const places = M.id === 'serra' ? [[400,1260,0],[800,1300,1],[1300,1210,0],[1660,1195,1],[420,1810,0],[1260,1800,2],[1960,1150,1],[840,800,0],[2150,720,1]]
    : M.id === 'sc' ? [[170,820,0],[595,830,1],[1080,800,0],[2040,825,2],[2780,810,1],[160,1340,0],[1060,1420,1],[2420,1430,0]]
    : M.id === 'vila' ? [[1250,580,0],[1985,560,1],[2580,575,0],[965,1340,2],[2880,1360,1]] : [];
  for (const [x,y,index] of places) if (seen(x,y,470)&&worldDressing(M).clear?.(x,y,280,390)) layers.push({ y, draw: () => worldTreeSprite(index,x,y,300,430) });
  if (M.id === 'serra' || M.id === 'sc') for (let x = 40; x < M.W; x += 180) {
    if (M.id === 'serra' && Math.abs(x - (SERRA.roadX+SERRA.roadW/2)) < 200) continue;
    const y = M.id === 'serra' ? 90 : 190;
    if (seen(x,y,300)) layers.push({y,draw:()=>worldTreeSprite(1,x,y,315,450)});
  }
}

useWorldArt('windowPane', (x,y,w=70,h=56) => worldSprite('rural',13,x-5,y-5,w+10,h+10));
useWorldArt('drawPouso', () => {
  const r = VILA.pouso;
  if (!worldSprite('rural',12,r.x,r.y-20,r.w,r.h+20)) return false;
  signBoard(r.x+r.w/2,r.y+r.h+5,190,'POUSO DE TROPEIROS',12); return true;
});
useWorldArt('drawBolao', r => {
  if (!worldSprite('rural',4,r.x,r.y-55,r.w,r.h+55)) return false;
  signBoard(r.x+r.w/2,r.y+r.h+5,200,'CANCHA DE BOLÃO',12); return true;
});
useWorldArt('drawRail', (x0,x1,y) => {
  if (!WORLD_ART.nature.naturalWidth) return false;
  ctx.save(); ctx.beginPath(); ctx.rect(x0,y-8,x1-x0,32); ctx.clip();
  for (let x=x0;x<x1;x+=100) worldSprite('nature',11,x,y-8,100,32);
  ctx.restore(); return true;
});
useWorldArt('drawTrain', (x,y) => {
  if (!WORLD_ART.rural.naturalWidth) return false;
  // A 296px locomotive towers over the 124px player; wheels stay on the rails.
  ctx.save();
  // Como as árvores: com o Sadi atrás do trem (mais acima na tela e dentro da área do desenho), ele fica transparente.
  const p=worldOut;if(p&&p.x>x-2070&&p.x<x+60&&p.y<y+10&&p.y>y-290)ctx.globalAlpha=.42;
  ctx.translate(x,y+12); ctx.scale(2.6,2.6); ctx.translate(-x,-y-12);
  for (let k=0;k<2;k++) worldSprite('rural',1,x-390-k*202,y-99,204,110);
  worldSprite('rural',0,x-190,y-102,210,114);
  for(let k=0;k<5;k++){const a=(frameClock*1.2+k*.2)%1;ellipse(x-30+a*70,y-105-a*90,8+a*22,6+a*15,`rgba(235,235,230,${.5*(1-a)})`);}
  ctx.restore(); return true;
});
useWorldArt('drawPortal', (cx,y,title) => {
  if (!worldSprite('nature',14,cx-170,y-225,340,225)) return false;
  signBoard(cx,y-176,280,title,12); return true;
});
useWorldArt('drawQuadro', () => {
  const q = VILA.quadro;
  if (!worldSprite('rural',9,q.x-6,q.y-76,q.w+12,106)) return false;
  drawCalendarSheet(q,q.y-52);signBoard(q.x+q.w/2,q.y-99,130,'CALENDÁRIO',11); return true;
});
function worldFence(x,y,w) {
  if (!WORLD_ART.rural.naturalWidth) return false;
  const n=Math.max(1,Math.ceil(w/100));
  for(let k=0;k<n;k++) worldSprite('rural',8,x+k*w/n,y-26,w/n+2,38);
  return true;
}

function drawForageArt(f){
 if(!WORLD_ART.nature.naturalWidth)return false;
 const y=f.y+30,h=340,w=310;
 worldTreeSprite(0,f.x,y,w,h);
 if(forageReady(f))for(let k=0;k<12;k++){
  const x=f.x-90+(k*47)%180,fy=y-h+70+(k*37)%130;
  rect(x,fy,5,6,'#302d1c',1);rect(x,fy-1,4,5,f.color,1);rect(x,fy-1,2,2,'#e6d9a4',1);
 }
 return true;
}
