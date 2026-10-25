// Ground is composed in world coordinates and baked into bounded tiles.
// Roads, entrances and the pier retain their existing gameplay coordinates.
'use strict';
const frontierTerrainTiles = new Map(), frontierMaterials = new Map();
const FRONTIER_TILE_LIMIT = 40;   // o mapa todo tem 54 blocos: guardar mais evita repintar ao voltar
function frontierTexture(index, x, y, w, h) {
  const image = WORLD_ART['frontier-terrain'];
  if (!image?.naturalWidth) return false;
  if (!frontierMaterials.has(index)) {
    const tile = document.createElement('canvas'); tile.width = tile.height = 384;
    const c = tile.getContext('2d'), sw = image.naturalWidth / 2, sh = image.naturalHeight / 2;
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality='medium';
    c.fillStyle = ['#75824d','#9b886d','#305b5b','#aa956c'][index];c.fillRect(0,0,384,384);
    c.globalAlpha = [.24,.65,.66,.68][index];
    c.drawImage(image, index % 2 * sw, Math.floor(index / 2) * sh, sw, sh, 0, 0, 384, 384);
    frontierMaterials.set(index, ctx.createPattern(tile, 'repeat'));
  }
  ctx.fillStyle = frontierMaterials.get(index); ctx.fillRect(x, y, w, h); return true;
}
const frontierNoise = (x, y) => {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  n = Math.imul(n ^ n >>> 13, 1274126177); return ((n ^ n >>> 16) >>> 0) / 4294967296;
};
const frontierWestBank = y => 478 + Math.sin(y / 173) * 16 + Math.sin(y / 61) * 7;
const frontierSouthBank = x => VILA.border + 45 + Math.sin(x / 211) * 18 + Math.sin(x / 71) * 7;
function frontierLandPath(inset = 0) {
  const p = new Path2D(), bottom = VILA.border - 80;
  p.moveTo(frontierWestBank(0) + inset, 0);
  for (let y = 0; y <= bottom; y += 16) p.lineTo(frontierWestBank(y) + inset, y);
  p.quadraticCurveTo(460 + inset, VILA.border + 30 - inset, 650, frontierSouthBank(650) - inset);
  for (let x = 650; x <= VILA.W + 32; x += 16) p.lineTo(x, frontierSouthBank(x) - inset);
  p.lineTo(VILA.W + 32, 0); p.closePath(); return p;
}
const frontierLandOutline = frontierLandPath();
const frontierShoreHitContext = document.createElement('canvas').getContext('2d');
function frontierOnLand(x,y) {
  return frontierShoreHitContext.isPointInPath(frontierLandOutline,x,y);
}
function frontierRoadPath(r, expansion = 0) {
  const [x,y,w,h] = r, horizontal = w >= h, length = horizontal ? w : h;
  const breadth = horizontal ? h : w, p = new Path2D();
  const point = (t, side) => {
    const wav = Math.sin((t + x + y) / 65) * 4 + Math.sin((t + y) / 17) * 2;
    const edge = side < 0 ? -expansion - wav : breadth + expansion + wav;
    return horizontal ? [x + t, y + edge] : [x + edge, y + t];
  };
  p.moveTo(...point(0,-1));
  for (let t = 0; t < length; t += 12) p.lineTo(...point(t,-1));
  p.lineTo(...point(length,-1)); p.lineTo(...point(length,1));
  for (let t = length; t > 0; t -= 12) p.lineTo(...point(t,1));
  p.lineTo(...point(0,1)); p.closePath(); return p;
}
function frontierRoads() {
  return [...VILA_ROADS, ...worldApproachRects(WORLD_MAPS.vila),
    [505,885,95,65], [1690,VILA.rail-20,VILA.W-1690,48]];
}
// O rio Uruguai: água de rio (verde-barrento, mais escura no fundo e mais clara na beira), a outra margem com mato e
// a beira molhada com uma linha de espuma. A água que se mexe (correnteza, brilhos, espuma) fica em drawVilaRiver.
const FRONTIER_FAR = x => 66 + Math.sin(x / 150) * 18 + Math.sin(x / 47) * 6;   // a margem uruguaia, lá do outro lado
function frontierFarBankPath(grow = 0) {
  const p = new Path2D(); p.moveTo(-10, -10);
  for (let y = -10; y <= VILA.H + 20; y += 16) p.lineTo(FRONTIER_FAR(y) + grow, y);
  p.lineTo(-10, VILA.H + 20); p.closePath(); return p;
}
function frontierFarSouthPath(grow = 0) {
  const p = new Path2D(), y0 = VILA.H - 52; p.moveTo(-10, VILA.H + 20);
  for (let x = -10; x <= VILA.W + 20; x += 16) p.lineTo(x, y0 - Math.sin(x / 170) * 14 - Math.sin(x / 53) * 5 - grow);
  p.lineTo(VILA.W + 20, VILA.H + 20); p.closePath(); return p;
}
function paintFrontierTerrain(view) {
  const {x,y,w,h} = view;
  // Água: a textura do rio puxada pro verde-barrento do Uruguai, mais funda longe das margens.
  frontierTexture(2,x,y,w,h);
  ctx.fillStyle='rgba(74,70,34,.30)';ctx.fillRect(x,y,w,h);
  ctx.fillStyle='rgba(10,30,30,.18)';ctx.fillRect(x,y,w,h);
  // Mais clara perto das margens, em degraus bem miúdos (sem faixas marcadas).
  for(let step=0;step<16;step++){
    const k=8+step*step*.75,a=.035;
    ctx.fillStyle=`rgba(150,152,98,${a})`;
    ctx.save();ctx.clip(frontierLandPath(-k));ctx.fillRect(x,y,w,h);ctx.restore();
    ctx.save();ctx.clip(frontierFarBankPath(k));ctx.fillRect(x,y,w,h);ctx.restore();
    ctx.save();ctx.clip(frontierFarSouthPath(k));ctx.fillRect(x,y,w,h);ctx.restore();
  }
  // A outra margem (Uruguai) e a de baixo: barranco de terra e campo mais escuro.
  for(const far of [frontierFarBankPath,frontierFarSouthPath]){
    ctx.save();ctx.clip(far(0));frontierTexture(3,x,y,w,h);ctx.fillStyle='#4a3c2440';ctx.fillRect(x,y,w,h);ctx.restore();
    ctx.save();ctx.clip(far(-12));frontierTexture(0,x,y,w,h);ctx.fillStyle='#22381e70';ctx.fillRect(x,y,w,h);ctx.restore();
  }
  for (const [inset,material] of [[0,3],[26,3],[48,0]]) {
    ctx.save();ctx.clip(frontierLandPath(inset));frontierTexture(material,x,y,w,h);
    if(inset===26){ctx.fillStyle='#52613e40';ctx.fillRect(x,y,w,h);}
    ctx.restore();
  }
  // Beira molhada (areia escura) e a linha de espuma na água.
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='rgba(52,48,30,.38)';ctx.lineWidth=12;ctx.stroke(frontierShorePath(5));
  ctx.strokeStyle='rgba(226,232,214,.42)';ctx.lineWidth=3;ctx.stroke(frontierShorePath(-6));
  ctx.strokeStyle='rgba(226,232,214,.16)';ctx.lineWidth=2;ctx.stroke(frontierShorePath(-16));
  ctx.restore();
  ctx.save();ctx.clip(frontierLandPath(48));
  // Large, quiet changes in grass tone instead of repeating bright lawn stamps.
  for(let gy=Math.floor(y/190)*190-380;gy<y+h+380;gy+=190)for(let gx=Math.floor(x/230)*230-460;gx<x+w+460;gx+=230){
    const n=frontierNoise(gx,gy),cx=gx+n*150,cy=gy+frontierNoise(gy,gx)*120;
    const gradient=ctx.createRadialGradient(cx,cy,15,cx,cy,150+n*100);
    gradient.addColorStop(0,n>.62?'#b5a36940':'#263e2b48');gradient.addColorStop(1,'#455b3200');
    ctx.fillStyle=gradient;ctx.fillRect(cx-260,cy-260,520,520);
  }
  // Flores miúdas no campo (o caminho pinta por cima).
  paintWorldFlowers(view,(fx,fy)=>frontierOnLand(fx-70,fy)&&frontierOnLand(fx,fy+70));
  // Cascalho sob os trilhos do trem.
  for(const [expansion,alpha] of [[9,.25],[4,.5],[0,1]]){const r=[1690,VILA.rail-20,VILA.W-1690,48];if(r[1]+r[3]+15<y||r[1]-15>y+h)break;ctx.save();ctx.clip(frontierRoadPath(r,expansion));ctx.globalAlpha=alpha;frontierTexture(1,x,y,w,h);ctx.restore();}
  // Estradas e as trilhas até as portas: fitas de terra com as pontas e os cantos arredondados.
  paintWorldPaths(WORLD_MAPS.vila,view);
  // Scuffed clearings connect thresholds to the paths, with feathered edges.
  for(const r of worldDressingBuildings('vila')){
    const cx=r.x+r.w/2,cy=r.y+r.h+12;
    if(cx+r.w<x||cx-r.w>x+w||cy+70<y||cy-70>y+h)continue;
    ctx.save();ctx.translate(cx,cy);ctx.scale(r.w*.45,46);
    const g=ctx.createRadialGradient(0,0,.3,0,0,1);g.addColorStop(0,'#9b895948');g.addColorStop(1,'#9b895900');
    ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  ctx.restore();
  // Pebbles and low grasses cluster along the bank, with a gap at the landing.
  for(let py=95;py<VILA.border-80;py+=76){
    if(py>835&&py<1000)continue;
    const n=frontierNoise(71,py),sy=py+(n-.5)*55,px=frontierWestBank(sy)+15+n*28;
    if(n<.18)continue;
    worldSprite('frontier-flora',n>.55?3:2,px-35,sy-40,48+n*47,40+n*25);
  }
  for(let px=650;px<VILA.W;px+=93){
    const n=frontierNoise(px,17),sx=px+(n-.5)*65,py=frontierSouthBank(sx)-10-n*20;
    if(n<.22)continue;
    worldSprite('frontier-flora',n>.6?2:3,sx-30,py-45,40+n*46,35+n*28);
  }
}
function drawFrontierTerrain(view) {
  if(!['frontier-terrain','frontier-flora'].every(k=>WORLD_ART[k]?.complete&&WORLD_ART[k].naturalWidth))return false;
  const size=512,pad=3;
  for(let row=Math.max(0,Math.floor(view.y/size));row<Math.min(Math.ceil(VILA.H/size),Math.ceil((view.y+view.h)/size));row++){
    for(let col=Math.max(0,Math.floor(view.x/size));col<Math.min(Math.ceil(VILA.W/size),Math.ceil((view.x+view.w)/size));col++){
      const key=col+':'+row,x=col*size,y=row*size,w=Math.min(size,VILA.W-x),h=Math.min(size,VILA.H-y);
      let tile=frontierTerrainTiles.get(key);
      if(!tile){
        tile=document.createElement('canvas');tile.width=w+pad*2;tile.height=h+pad*2;
        const main=ctx;ctx=tile.getContext('2d');ctx.translate(pad-x,pad-y);
        try{paintFrontierTerrain({x:x-pad,y:y-pad,w:w+pad*2,h:h+pad*2});}finally{ctx=main;}
      }
      frontierTerrainTiles.delete(key);frontierTerrainTiles.set(key,tile);
      while(frontierTerrainTiles.size>FRONTIER_TILE_LIMIT){const oldest=frontierTerrainTiles.keys().next().value;const old=frontierTerrainTiles.get(oldest);frontierTerrainTiles.delete(oldest);old.width=old.height=0;}
      ctx.drawImage(tile,pad,pad,w,h,x,y,w,h);
    }
  }
  return true;
}
// A água viva do rio, só no pedaço que aparece na tela: correnteza no sentido do rio (descendo a oeste, indo pro
// oeste embaixo), brilhos de sol e a espuma batendo na beira.
let frontierShoreFoam = null;
function frontierRipple(x, y, len, a) { ctx.strokeStyle = `rgba(218,232,214,${a})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - len, y); ctx.quadraticCurveTo(x, y + 3.2, x + len, y); ctx.stroke(); }
function frontierRiverView() { const p = worldOut, z = typeof camera !== 'undefined' && camera.zoom ? camera.zoom : 1, hw = 900 / z, hh = 620 / z; return { x0: p.x - hw, x1: p.x + hw, y0: p.y - hh, y1: p.y + hh }; }
useWorldArt('drawVilaRiver', () => {
  if(!WORLD_ART['frontier-terrain']?.naturalWidth)return false;
  const v = frontierRiverView(), t = frameClock;
  ctx.save();
  // Correnteza: riscos compridos e macios, cada um com seu ritmo.
  if (v.x0 < 520) for (let i = 0; i < 70; i++) {
    const n = frontierNoise(i, 31), py = ((i * 137.7 + t * (16 + n * 14)) % (VILA.border + 60)), far = FRONTIER_FAR(py) + 24, bank = frontierWestBank(py) - 26;
    if (py < v.y0 - 40 || py > v.y1 + 40) continue;
    const px = far + frontierNoise(i, 7) * (bank - far), len = 10 + n * 14, a = .12 + .16 * (.5 + .5 * Math.sin(t * .7 + i));
    frontierRipple(px, py, len, a);
  }
  if (v.y1 > VILA.border) for (let i = 0; i < 70; i++) {
    const n = frontierNoise(i, 57), px = VILA.W + 40 - ((i * 211.3 + t * (14 + n * 12)) % (VILA.W - 560)), top = frontierSouthBank(px) + 24, bot = VILA.H - 70;
    if (px < v.x0 - 40 || px > v.x1 + 40) continue;
    const py = top + frontierNoise(i, 13) * (bot - top), len = 10 + n * 14, a = .12 + .16 * (.5 + .5 * Math.sin(t * .6 + i));
    frontierRipple(px, py, len, a);
  }
  // Brilhos de sol piscando na água.
  for (let i = 0; i < 46; i++) {
    const west = i % 2 === 0, k = Math.max(0, Math.sin(t * 2.1 + i * 1.7)); if (k < .55) continue;
    let px, py; if (west) { py = (frontierNoise(i, 91) * VILA.border) | 0; const far = FRONTIER_FAR(py) + 20; px = far + frontierNoise(i, 93) * (frontierWestBank(py) - far - 30); } else { px = 600 + frontierNoise(i, 95) * (VILA.W - 640); const top = frontierSouthBank(px) + 22; py = top + frontierNoise(i, 97) * (VILA.H - 80 - top); }
    if (px < v.x0 || px > v.x1 || py < v.y0 || py > v.y1) continue;
    const a = (k - .55) / .45 * .7; ctx.fillStyle = `rgba(255,252,230,${a})`; ctx.fillRect(px - 3, py, 7, 1.4); ctx.fillRect(px, py - 2, 1.4, 5);
  }
  // A espuma vai e vem na beira.
  frontierShoreFoam ??= frontierShorePoints(-4).map((q, i, a) => { const b = a[Math.min(a.length - 1, i + 1)], c = a[Math.max(0, i - 1)], dx = b[0] - c[0], dy = b[1] - c[1], L = Math.hypot(dx, dy) || 1; return { x: q[0], y: q[1], nx: -dy / L, ny: dx / L, tx: dx / L, ty: dy / L }; });   // normal pra água
  ctx.lineCap = 'round'; ctx.lineWidth = 2.2;
  for (let i = 0; i < frontierShoreFoam.length; i += 2) {
    const f = frontierShoreFoam[i]; if (f.x < v.x0 - 20 || f.x > v.x1 + 20 || f.y < v.y0 - 20 || f.y > v.y1 + 20) continue;
    const w = Math.sin(t * 1.1 + i * .23), out = 4 + (w + 1) * 5, a = .16 + .22 * Math.max(0, w);
    ctx.strokeStyle = `rgba(236,240,226,${a})`; ctx.beginPath(); ctx.moveTo(f.x + f.nx * out - f.tx * 8, f.y + f.ny * out - f.ty * 8); ctx.lineTo(f.x + f.nx * out + f.tx * 8, f.y + f.ny * out + f.ty * 8); ctx.stroke();
  }
  ctx.restore();
  // Timber landing stays exactly over the walkable pier.
  if(typeof drawEnvironmentPier==='function'&&drawEnvironmentPier())return true;
  rect(250,942,290,12,'#243b3090');
  rect(250,892,290,50,'#795b3c',1,'#493c2b');
  for(let px=252;px<540;px+=18){rect(px,894,15,46,px%3?'#93704c':'#896442');rect(px+3,900,1,30,'#b89a6955');rect(px+4,897,2,2,'#443b2c');}
  for(const px of [254,340,420,530]){rect(px,934,8,28,'#483c2a');rect(px-1,934,10,5,'#ad9266');}
  const bob=Math.sin(frameClock*1.4)*1.7;
  ellipse(314,988+bob,58,13,'#182f2940');
  ellipse(300,980+bob,57,13,'#62462e');ellipse(300,978+bob,46,8,'#302e23');
  rect(275,970+bob,5,17,'#9a7952');rect(313,970+bob,5,17,'#9a7952');
  return true;
});
