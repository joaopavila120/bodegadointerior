'use strict';
// ctx.filter é refeito pelo navegador a cada quadro e trava a tela (segundos por quadro com a horta cheia).
// A variante tingida de cada sprite é desenhada uma vez, guardada e depois só copiada.
const gardenTintCache = new Map();
function gardenTinted(filter, sheet, index, x, y, w, h) {
  if (!filter) return worldSprite(sheet, index, x, y, w, h);
  const W = Math.max(1, Math.round(w)), H = Math.max(1, Math.round(h)), key = filter + '|' + sheet + '|' + index + '|' + W + '|' + H;
  let tile = gardenTintCache.get(key);
  if (!tile) {
    const raw = document.createElement('canvas'); raw.width = W; raw.height = H;
    const main = ctx; ctx = raw.getContext('2d'); let ok;
    try { ok = worldSprite(sheet, index, 0, 0, W, H); } finally { ctx = main; }
    if (!ok) return false;
    tile = document.createElement('canvas'); tile.width = W; tile.height = H;
    const c = tile.getContext('2d'); c.filter = filter; c.drawImage(raw, 0, 0);
    gardenTintCache.set(key, tile);
  }
  ctx.drawImage(tile, Math.round(x), Math.round(y)); return true;
}
function gardenCropSignals(cell,x,y,ts) {
  if(cellThirsty(cell))drawDrop(x+ts-14,y+12+Math.sin(frameClock*4)*2,7);
  if(cellReady(cell))for(let n=0;n<3;n++){const a=frameClock*2+n*2.1;ellipse(x+ts/2+Math.cos(a)*27,y+18+Math.sin(a)*9,2,2,'#fff6b0');}
}
useWorldArt('drawTileCrop',(cell,x,y)=>{
  if(!WORLD_ART.garden.naturalWidth)return false;
  const k=Math.min(1,cell.growth/CROPS[cell.crop].days),ts=GARDEN.ts;
  if(cell.crop==='uva'&&cell.growth>0){drawParreira(cell,x,y,ts,k);gardenCropSignals(cell,x,y,ts);return true;}
  const index=cell.growth===0?7:({alface:4,pepino:5,trigo:6})[cell.crop];
  if(index===undefined)return false;
  const size=cell.growth===0?24:28+k*20;
  const tint=cell.crop==='trigo'&&k<1?'hue-rotate(28deg) saturate(.75)':'';
  for(let n=0;n<4;n++){const px=x+24+(n%2)*40,py=y+36+Math.floor(n/2)*34;gardenTinted(tint,'garden',index,px-size/2,py-size*.8,size,size*.9);}
  gardenCropSignals(cell,x,y,ts);return true;
});
// Parreira: dois palanques com arame, as folhas crescendo e, madura, os cachos roxos.
function drawParreira(cell,x,y,ts,k){
  for(const px of [x+12,x+ts-16])rect(px,y+10,5,ts-18,'#6a4424',2);rect(x+12,y+16,ts-24,3,'#9a9a90');rect(x+12,y+34,ts-24,2,'#9a9a90');
  const leaves=Math.round(3+k*7);for(let n=0;n<leaves;n++){const lx=x+16+(n*13)%(ts-30),ly=y+12+(n*7)%26;ellipse(lx,ly,7+k*3,5+k*2,n%2?'#4f8a3a':'#3f7a32');}
  if(k>=1)for(let n=0;n<4;n++){const gx=x+20+n*(ts-38)/3,gy=y+30;for(let r=0;r<3;r++)for(let c=0;c<=r;c++)ellipse(gx-r*2.5+c*5,gy+(2-r)*5,3,3,'#5a2a6a');}
}
useWorldArt('drawTreeCrop',(cell,x,base)=>{
  const k=Math.min(1,cell.growth/CROPS[cell.crop].days),ready=cellReady(cell),h=45+k*160,w=35+k*105;
  const index=cell.crop==='araucaria'?1:cell.crop==='bergamota'&&ready?3:0;
  if(!worldSprite('nature',index,x-w/2,base-h,w,h))return false;
  if(ready)for(let n=0;n<3;n++)ellipse(x+Math.sin(frameClock*2+n*2)*w*.35,base-h*.65+Math.cos(frameClock*2+n)*12,2,2,'#fff6b0');
  if(cellThirsty(cell))drawDrop(x+w/2,base-35,8);return true;
});
function gardenBed(cell,x,y,size){
  const tint=cell.crop&&cell.water===G.day?'brightness(.65)':cell.dead&&!cell.crop?'saturate(.35) brightness(1.2)':'';
  gardenTinted(tint,'garden',8,x+3,y+3,size-6,size-6);
}
function gardenPit(x,y){
  regionalClearing(x,y,52,29,.8);
  ctx.save();ctx.beginPath();ctx.ellipse(x,y,40,19,0,0,Math.PI*2);ctx.clip();
  if(!frontierTexture(1,x-44,y-22,88,44))worldTexture(1,x-44,y-22,88,44,160);
  ctx.fillStyle='#49362230';ctx.fillRect(x-44,y-22,88,44);ctx.restore();
}
function gardenLocked(x,y,size){
  const n=frontierNoise(x,y);
  for(let k=0;k<2;k++)worldSprite('frontier-flora',1,x+8+k*35+n*9,y+28+(k%2)*20,26,20);
}
function gardenSurroundings(layers){
  const A=GARDEN;
  if(!regionalEnvironmentReady('horta')){
  worldGroundPatch({x:A.gx-18,y:A.gy-16,w:A.cols*A.ts+36,h:A.rows*A.ts+32,kind:1,seed:.3});
  worldTexture(1,A.gate-36,615,72,300,160);
  worldTexture(1,1040,310,80,515,160);
  worldTexture(1,1050,310,130,40,160);
  worldTexture(1,1050,720,245,40,160);
  }
  worldFence(100,195,A.W-200);worldFence(100,A.H-70,A.gate-160);worldFence(A.gate+60,A.H-70,A.W-A.gate-160);
  for(let k=0;k<10;k++)for(const side of [0,1]){
    const x=side?1460:165,y=235+k*66;
    layers.push({y,draw:()=>worldSprite('nature',k%3===0?5:8,x-32,y-38,64,40)});
  }
  for(const [x,y,i,w,h] of [[1330,350,9,70,60],[1380,710,10,65,55],[1140,720,11,70,66]])layers.push({y,draw:()=>worldSprite('garden',i,x-w/2,y-h,w,h)});
}
function worldRanchGround(layers){
  const C=RANCH;
  if(!regionalEnvironmentReady('curral')){
  for(const r of [C.coop,C.quail,C.cocho])worldGroundPatch({x:r.x-35,y:r.y+r.h-45,w:r.w+70,h:125,kind:1,seed:.6});
  worldGroundPatch({x:C.gate-65,y:760,w:130,h:170,kind:1,seed:.3});
  worldGroundPatch({x:220,y:820,w:1100,h:80,kind:1,seed:.2});
  }
  for(const [x,y] of [[165,680],[1410,670],[180,875],[1420,875]])layers.push({y,draw:()=>worldSprite('frontier-flora',0,x-40,y-50,80,50)});
}
useWorldArt('drawHortaLayers',(layers,seen)=>{
  const r=VILA.horta;if(!seen(r.x+r.w/2,r.y+r.h/2,r.w))return true;
  const h=hortaState();
  worldTexture(1,r.x-12,r.y-10,r.w+24,r.h+30,160);
  layers.push({y:r.y+r.h,draw:()=>{
    worldFence(r.x,r.y+5,r.w);
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
      const cell=h.tiles[row*GARDEN.cols+col*2],x=r.x+10+col*38,y=r.y+24+row*48;
      worldSprite('garden',8,x,y,38,36);
      if(cell?.crop){const idx=cell.growth===0?7:({alface:4,pepino:5,trigo:6})[cell.crop];worldSprite('garden',idx,x+8,y+4,23,26);}
    }
    h.trees.forEach((c,i)=>{if(c.crop)worldSprite('nature',c.crop==='araucaria'?1:c.crop==='bergamota'&&cellReady(c)?3:0,r.x+r.w-72,r.y+24+i*52,55,62);});
    worldSprite('garden',2,r.x+15,r.y+r.h-86,44,65);
    worldFence(r.x,r.y+r.h,r.w*.3);worldFence(r.x+r.w*.7,r.y+r.h,r.w*.3);
    signBoard(r.x+r.w/2,r.y+r.h+10,120,'HORTA',12);
    if(hortaCells(h).some(cellThirsty))drawDrop(r.x+r.w-16,r.y-18,10);
    if(hortaCells(h).some(cellReady))txt('✓',r.x+r.w-40,r.y-18,20,'#e6ff9b');
  }});return true;
});
useWorldArt('drawWorldFogo',()=>{
  const r=VILA.fogo,c=campoState(),lit=isCampo()&&fireLit(),cx=r.x+r.w/2;
  if(!worldSprite('garden',3,r.x+24,r.y+92,r.w-48,140))return false;
  if(lit){ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(fogoArt,Math.floor(frameClock*7)%4*150,c.fuel>40?0:70,150,70,r.x+30,r.y+90,r.w-60,145);ctx.restore();}
  for(let n=0;n<4;n++){
    const e=isCampo()?c.espetos[n]:null,front=e?1-e.fire:0,idx=!e?0:e.burned?5+front:espetoReady(e)?3+front:1+front;
    ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(espetoArt,idx*ESPETO_W,0,ESPETO_W,ESPETO_H,r.x+40+n*82,r.y+82,53,125);ctx.restore();
  }
  worldSprite('garden',11,r.x+12,r.y+r.h-68,90,75);
  worldSprite('furniture',17,r.x+r.w-65,r.y+r.h-60,55,58);
  signBoard(cx,r.y+r.h+8,160,'COSTELÃO',13);return true;
});
// Preserve the illustrated horizon; blend the foreground into the regional terrain.
const drawCampoBeforeGardenArt=drawCampoBackground;
drawCampoBackground=function(){
  drawCampoBeforeGardenArt();
  if(G.lasso)return;
  drawRegionalCampoGround();
  for(const [x,y] of [[35,550],[1515,545],[1500,700],[40,690],[1440,870]])worldSprite('frontier-flora',1,x-32,y-35,64,42);
  worldSprite('garden',10,35,390,90,70);
  worldSprite('furniture',23,1350,420,100,65);
  rect(ENTRY.x-70,H-25,139,23,'#624c2e',3,'#ae9253');txt('COSTELÃO',ENTRY.x,H-14,11,'#f0d088');
};
// A arte do mapa (25 folhas grandes) carrega em segundo plano: o jogo abre sem esperar por ela.
// Quem sai da bodega antes vê o desenho simples; quando tudo chega, os caches montados com folhas
// ainda incompletas são descartados e refeitos com a arte inteira.
const worldArtLoaded = Promise.all(Object.values(WORLD_ART).map(im => im.complete ? null : new Promise(done => {
  im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true });
}))).then(() => {
  for (const cache of [worldTextureCache, worldSpriteCache, worldGroundTileCache, frontierTerrainTiles, frontierMaterials, regionalTerrainTiles, gardenTintCache]) cache.clear();
  worldMeadowStamp = null; regionalCampoGround = null;
});
