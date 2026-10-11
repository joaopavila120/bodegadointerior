// Ground is composed in world coordinates and baked into bounded tiles.
// Roads, entrances and the pier retain their existing gameplay coordinates.
'use strict';
const frontierTerrainTiles = new Map(), frontierMaterials = new Map();
const FRONTIER_TILE_LIMIT = 24;
function frontierTexture(index, x, y, w, h) {
  const image = WORLD_ART['frontier-terrain'];
  if (!image?.naturalWidth) return false;
  if (!frontierMaterials.has(index)) {
    const tile = document.createElement('canvas'); tile.width = tile.height = 384;
    const c = tile.getContext('2d'), sw = image.naturalWidth / 2, sh = image.naturalHeight / 2;
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
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
const frontierSouthBank = x => 2425 + Math.sin(x / 211) * 18 + Math.sin(x / 71) * 7;
function frontierLandPath(inset = 0) {
  const p = new Path2D(), bottom = 2300;
  p.moveTo(frontierWestBank(0) + inset, 0);
  for (let y = 0; y <= bottom; y += 16) p.lineTo(frontierWestBank(y) + inset, y);
  p.quadraticCurveTo(460 + inset, 2410 - inset, 650, frontierSouthBank(650) - inset);
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
  return [...VILA_ROADS, ...worldFootpaths(), ...worldApproachRects(WORLD_MAPS.vila),
    [505,885,95,65], [1690,VILA.rail-20,VILA.W-1690,48]];
}
function paintFrontierTerrain(view) {
  const {x,y,w,h} = view;
  frontierTexture(2,x,y,w,h);
  // A narrow opposite bank hints at the far shore without boxing the river in.
  ctx.save(); ctx.beginPath(); ctx.moveTo(0,0);
  for(let py=0;py<=VILA.H+20;py+=20)ctx.lineTo(48+Math.sin(py/150)*16,py);
  ctx.lineTo(0,VILA.H+20);ctx.closePath();ctx.clip();frontierTexture(0,x,y,w,h);ctx.restore();
  for (const [inset,material] of [[0,3],[26,3],[48,0]]) {
    ctx.save();ctx.clip(frontierLandPath(inset));frontierTexture(material,x,y,w,h);
    if(inset===26){ctx.fillStyle='#52613e40';ctx.fillRect(x,y,w,h);}
    ctx.restore();
  }
  ctx.save();ctx.clip(frontierLandPath(48));
  // Large, quiet changes in grass tone instead of repeating bright lawn stamps.
  for(let gy=Math.floor(y/190)*190-380;gy<y+h+380;gy+=190)for(let gx=Math.floor(x/230)*230-460;gx<x+w+460;gx+=230){
    const n=frontierNoise(gx,gy),cx=gx+n*150,cy=gy+frontierNoise(gy,gx)*120;
    const gradient=ctx.createRadialGradient(cx,cy,15,cx,cy,150+n*100);
    gradient.addColorStop(0,n>.62?'#b5a36940':'#263e2b48');gradient.addColorStop(1,'#455b3200');
    ctx.fillStyle=gradient;ctx.fillRect(cx-260,cy-260,520,520);
  }
  const roads=frontierRoads().filter(r=>r[0]+r[2]+15>x&&r[0]-15<x+w&&r[1]+r[3]+15>y&&r[1]-15<y+h);
  // All edge passes precede road centers, so intersections have no outlines.
  for(const [expansion,alpha] of [[15,.12],[9,.25],[4,.5],[0,1]])for(const r of roads){
    ctx.save();ctx.clip(frontierRoadPath(r,expansion));ctx.globalAlpha=alpha;
    frontierTexture(1,x,y,w,h);ctx.restore();
  }
  // Scuffed clearings connect thresholds to the paths, with feathered edges.
  for(const r of worldDressingBuildings('vila')){
    const cx=r.x+r.w/2,cy=r.y+r.h+12;
    if(cx+r.w<x||cx-r.w>x+w||cy+70<y||cy-70>y+h)continue;
    ctx.save();ctx.translate(cx,cy);ctx.scale(r.w*.57,55);
    const g=ctx.createRadialGradient(0,0,.3,0,0,1);g.addColorStop(0,'#9b895960');g.addColorStop(1,'#9b895900');
    ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  ctx.restore();
  // Pebbles and low grasses cluster along the bank, with a gap at the landing.
  for(let py=95;py<2300;py+=76){
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
useWorldArt('drawVilaRiver', () => {
  if(!WORLD_ART['frontier-terrain']?.naturalWidth)return false;
  // Gentle current, rather than bright ocean foam. Static detail is cached above.
  ctx.save();ctx.fillStyle='#afc3b328';
  for(let i=0;i<36;i++){
    const py=(i*71+frameClock*7)%VILA.H,px=100+(i*97)%280;
    ctx.fillRect(px,py,13+i%13,1.5);
    const sx=650+(i*137+frameClock*5)%(VILA.W-700),sy=2490+i%5*26;
    ctx.fillRect(sx,sy,17+i%9,1.5);
  }
  ctx.restore();
  // Timber landing stays exactly over the walkable pier.
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
