// The same materials and soft terrain transitions as Fronteira, composed once
// per visible tile. Map geometry and the farming state remain independent.
'use strict';
const REGIONAL_ENVIRONMENTS = new Set(['serra','sc','horta','curral']);
const regionalTerrainTiles = new Map(), regionalRoadCache = new Map();
const REGIONAL_TILE_LIMIT = 32;
function regionalEnvironmentReady(id) {
  return REGIONAL_ENVIRONMENTS.has(id) && ['frontier-terrain','frontier-flora','terrain','nature'].every(k=>WORLD_ART[k]?.complete&&WORLD_ART[k].naturalWidth);
}
function regionalRoads(M) {
  if(regionalRoadCache.has(M.id))return regionalRoadCache.get(M.id);
  let roads=[];
  if(M.id==='serra')roads=[[0,SERRA.roadY,SERRA.roadEnd,SERRA.roadH],[SERRA.roadX,0,SERRA.roadW,SERRA.roadSouth],...worldApproachRects(M)];
  if(M.id==='sc')roads=[[200,SC.streetY,SC.W-400,SC.streetH],[SC.roadX,SC.streetY,SC.roadW,SC.H-SC.streetY],...worldApproachRects(M)];
  if(M.id==='horta')roads=[[GARDEN.gate-36,610,72,390],[GARDEN.gate-36,720,320,52],[1040,310,80,462],[1050,310,180,40],[1050,720,245,40]];
  if(M.id==='curral')roads=[[RANCH.gate-40,710,80,290],[270,824,1010,55],[RANCH.cocho.x+60,RANCH.cocho.y+RANCH.cocho.h,80,155]];
  regionalRoadCache.set(M.id,roads);return roads;
}
function regionalClearing(x,y,rx,ry,alpha=.6) {
  ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);
  const g=ctx.createRadialGradient(0,0,.15,0,0,1);
  g.addColorStop(0,`rgba(139,119,81,${alpha})`);g.addColorStop(.6,`rgba(139,119,81,${alpha*.6})`);g.addColorStop(1,'#8b775100');
  ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
}
function paintRegionalMeadow(M,view) {
  const {x,y,w,h}=view;
  frontierTexture(0,x,y,w,h);
  if(M.id==='sc'){ctx.fillStyle='#244c3b14';ctx.fillRect(x,y,w,h);}
  for(let gy=Math.floor(y/190)*190-380;gy<y+h+380;gy+=190)for(let gx=Math.floor(x/230)*230-460;gx<x+w+460;gx+=230){
    const n=frontierNoise(gx+M.W,gy),cx=gx+n*150,cy=gy+frontierNoise(gy,gx)*120;
    const g=ctx.createRadialGradient(cx,cy,15,cx,cy,150+n*100);
    g.addColorStop(0,n>.65?'#b5a36936':M.id==='sc'?'#183d304a':'#263e2b48');g.addColorStop(1,'#455b3200');
    ctx.fillStyle=g;ctx.fillRect(cx-260,cy-260,520,520);
  }
}
function regionalStreamPath(expand=0) {
  // Water stays inside the existing non-walkable strip; the bridge is unchanged.
  const p=new Path2D(),y=SERRA.arroio;
  const wave=x=>Math.sin(x/117)*2+Math.sin(x/37);
  p.moveTo(-10,y-expand);
  for(let x=0;x<=SERRA.W+20;x+=12)p.lineTo(x,y+wave(x)-expand);
  for(let x=SERRA.W+20;x>=0;x-=12)p.lineTo(x,y+58+wave(x)+expand);
  p.lineTo(-10,y+58+expand);p.closePath();return p;
}
function paintRegionalTerrain(M,view) {
  const {x,y,w,h}=view;
  paintRegionalMeadow(M,view);
  const roads=regionalRoads(M).filter(r=>r[0]+r[2]+18>x&&r[0]-18<x+w&&r[1]+r[3]+18>y&&r[1]-18<y+h);
  for(const [expansion,alpha] of [[15,.12],[9,.25],[4,.5],[0,1]])for(const r of roads){
    ctx.save();ctx.clip(frontierRoadPath(r,expansion));ctx.globalAlpha=alpha;frontierTexture(1,x,y,w,h);ctx.restore();
  }
  // Small colonial paving, worn into the ground rather than giant outlined slabs.
  if(M.id==='sc')for(const r of roads){
    ctx.save();ctx.clip(frontierRoadPath(r,-3));ctx.globalAlpha=.32;worldTexture(2,x,y,w,h,70);ctx.restore();
  }
  for(const r of worldDressingBuildings(M.id)){
    const cx=r.x+r.w/2,cy=r.y+r.h+15;
    if(cx+r.w>x&&cx-r.w<x+w&&cy+80>y&&cy-80<y+h)regionalClearing(cx,cy,r.w*.57,65,.42);
  }
  if(M.id==='serra'){
    // A narrow gravel bed grounds the rails in the landscape.
    ctx.save();ctx.clip(frontierRoadPath([0,SERRA.rail-12,SERRA.tunnel.x+60,38],5));ctx.globalAlpha=.65;frontierTexture(1,x,y,w,h);ctx.restore();
    if(y+h>SERRA.arroio-30&&y<SERRA.arroio+90){
      for(const [expand,material,alpha] of [[24,3,.2],[14,3,.5],[7,3,1],[0,2,1]]){
        ctx.save();ctx.clip(regionalStreamPath(expand));ctx.globalAlpha=alpha;frontierTexture(material,x,y,w,h);ctx.restore();
      }
      for(let px=Math.floor(x/82)*82;px<x+w+82;px+=82){
        if(Math.abs(px-(SERRA.roadX+SERRA.roadW/2))<110)continue;
        const n=frontierNoise(px,82),sy=SERRA.arroio+(n>.5?76:-8);
        worldSprite('frontier-flora',n>.55?2:3,px-22,sy-24,42+n*20,26+n*13);
      }
    }
  }
  // Fine stones and tufts are part of the cached surface, not per-frame objects.
  for(let py=Math.floor(y/64)*64;py<y+h+30;py+=64)for(let px=Math.floor(x/73)*73;px<x+w+35;px+=73){
    const n=frontierNoise(px+19,py+M.H),sx=px+n*42,sy=py+frontierNoise(py,px)*35;
    if(n<.68||!M.canWalk(sx,sy)||roads.some(([rx,ry,rw,rh])=>sx>rx-12&&sx<rx+rw+12&&sy>ry-12&&sy<ry+rh+12))continue;
    if(M.id==='horta'&&sx>GARDEN.gx-20&&sx<GARDEN.gx+GARDEN.cols*GARDEN.ts+20&&sy>GARDEN.gy-20&&sy<GARDEN.gy+GARDEN.rows*GARDEN.ts+20)continue;
    worldSprite('frontier-flora',n>.9?3:1,sx-10,sy-10,12+n*10,10+n*7);
  }
  if(M.id==='horta')regionalClearing(660,435,390,215,.28);
  if(M.id==='curral')for(const r of [RANCH.coop,RANCH.quail,RANCH.cocho])regionalClearing(r.x+r.w/2,r.y+r.h+16,r.w*.7,70,.56);
}
function drawRegionalTerrain(M,view) {
  if(!regionalEnvironmentReady(M.id))return false;
  const size=512,pad=3;
  for(let row=Math.max(0,Math.floor(view.y/size));row<Math.min(Math.ceil(M.H/size),Math.ceil((view.y+view.h)/size));row++)for(let col=Math.max(0,Math.floor(view.x/size));col<Math.min(Math.ceil(M.W/size),Math.ceil((view.x+view.w)/size));col++){
    const key=M.id+':'+col+':'+row,x=col*size,y=row*size,w=Math.min(size,M.W-x),h=Math.min(size,M.H-y);
    let tile=regionalTerrainTiles.get(key);
    if(!tile){
      tile=document.createElement('canvas');tile.width=w+pad*2;tile.height=h+pad*2;
      const main=ctx;ctx=tile.getContext('2d');ctx.translate(pad-x,pad-y);
      try{paintRegionalTerrain(M,{x:x-pad,y:y-pad,w:w+pad*2,h:h+pad*2});}finally{ctx=main;}
    }
    regionalTerrainTiles.delete(key);regionalTerrainTiles.set(key,tile);
    while(regionalTerrainTiles.size>REGIONAL_TILE_LIMIT){const key=regionalTerrainTiles.keys().next().value,old=regionalTerrainTiles.get(key);regionalTerrainTiles.delete(key);old.width=old.height=0;}
    ctx.drawImage(tile,pad,pad,w,h,x,y,w,h);
  }
  return true;
}
useWorldArt('drawArroio',(M,y,bridgeX)=>{
  if(M.id!=='serra'||!regionalEnvironmentReady(M.id))return false;
  ctx.save();ctx.clip(regionalStreamPath());ctx.fillStyle='#afc3b32c';
  for(let i=0;i<24;i++){const x=(i*151+frameClock*9)%M.W;ctx.fillRect(x,y+12+i%4*10,14+i%11,1.5);}
  ctx.restore();
  rect(bridgeX-70,y-8,140,76,'#795b3c',2,'#483c2a');
  for(let py=y-6;py<y+66;py+=11){rect(bridgeX-68,py,136,9,'#99774f');rect(bridgeX-59,py+2,2,2,'#493b29');rect(bridgeX+56,py+2,2,2,'#493b29');}
  for(const px of [bridgeX-74,bridgeX+68]){rect(px,y-14,6,88,'#51412c');rect(px,y-16,6,4,'#b2986c');}
  return true;
});
function regionalFarmLayers(M,seen,layers) {
  if(M.id!=='horta')return;   // o campo e curral usa o fundo do campo do costelão
  // Plant the perimeter only: all beds, fruit trees, animals and gates stay clear.
  for(let i=0;i<18;i++)for(const side of [0,1]){
    const x=side?M.W-64:64,y=205+i*43,n=frontierNoise(i,side+85),index=i%4===0?0:i%5===0?4:1;
    if(seen(x,y,100))layers.push({y,draw:()=>worldSprite('frontier-flora',index,x-36,y-52,72+n*22,52+n*17)});
  }
  for(let x=180;x<M.W-160;x+=110){
    if(Math.abs(x-800)<120)continue;
    const y=M.H-45;
    if(seen(x,y,100))layers.push({y,draw:()=>worldSprite('frontier-flora',x%3?1:0,x-38,y-48,76,48)});
  }
}
let regionalCampoGround = null;
function drawRegionalCampoGround() {
  if(!regionalEnvironmentReady('curral'))return;
  if(!regionalCampoGround){
    const tile=document.createElement('canvas');tile.width=W;tile.height=H;
    const main=ctx;ctx=tile.getContext('2d');
    try{
      paintRegionalMeadow({id:'campo',W,H},{x:0,y:0,w:W,h:H});
      for(const [r,alpha] of [[22,.12],[14,.25],[6,.5],[0,1]]){
        const p=new Path2D();
        for(let i=0;i<=64;i++){
          const a=i/64*Math.PI*2,wave=Math.sin(a*7)*5+Math.cos(a*11)*3;
          const x=530+Math.cos(a)*(330+r+wave),y=575+Math.sin(a)*(128+r*.5+wave*.6);
          if(i===0)p.moveTo(x,y);else p.lineTo(x,y);
        }
        p.closePath();
        ctx.save();ctx.clip(p);ctx.globalAlpha=alpha;frontierTexture(1,150,430,780,330);ctx.restore();
      }
      // Worn ground where people cook and queue; keep the field open to play.
      for(const [x,y,rx,ry] of [[510,670,360,100],[1120,610,310,85],[1160,805,340,65],[ENTRY.x,880,95,110]])regionalClearing(x,y,rx,ry,.7);
      for(let i=0;i<28;i++){
        const n=frontierNoise(i,371),x=20+n*(W-40),y=510+frontierNoise(i,19)*340;
        if(x>120&&x<1430)continue;
        worldSprite('frontier-flora',i%4===0?4:1,x-26,y-28,52,36);
      }
      ctx.globalCompositeOperation='destination-in';
      const fade=ctx.createLinearGradient(0,435,0,560);fade.addColorStop(0,'#0000');fade.addColorStop(1,'#000');
      ctx.fillStyle=fade;ctx.fillRect(0,0,W,H);
    }finally{ctx=main;}
    regionalCampoGround=tile;
  }
  ctx.drawImage(regionalCampoGround,0,0);
}
