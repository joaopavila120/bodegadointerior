// Persistent landscaping: positions are deterministic and never consume gameplay RNG.
'use strict';
const worldDressingCache = new Map();
function worldDressingBuildings(id) {
  if (id === 'vila') return [VILA.bodega,VILA.cancha,VILA.agro,VILA.gado,VILA.atacado,VILA.acougue,VILA.ferragem,VILA.pouso,VILA.ctg,...VILA.houses];
  if (id === 'serra') return [SERRA.badin,SERRA.casona,SERRA.mito,SERRA.dianho,SERRA.estacao,SERRA.igreja,SERRA.salao,SERRA.vinicola,SERRA.galeteria];
  if (id === 'sc') return [...SC.houses,SC.cafe,SC.bolao,SC.festa,SC.oktoberfest];
  return [];
}
function worldDressingRoads(id) {
  if(['serra','sc'].includes(id))return regionalRoads(WORLD_MAPS[id]);
  if(id==='vila') return [...VILA_ROADS,[1690,VILA.rail-35,VILA.W-1690,80],...worldFootpaths()];
  return [];
}
function worldFootpaths() { return worldDoorPaths(WORLD_MAPS.vila); }

// Keep landmarks visible, including their front approach and the pier's boat.
function worldLandmarkClearings(id) {
  const around=r=>({x:r.x-24,y:r.y-40,w:r.w+48,h:r.h+110});
  if(id==='vila')return [around(VILA.fogo),around(VILA.missoes),{x:226,y:850,w:VILA.river-226+65,h:175}];
  if(id==='serra')return [
    ...[SERRA.italianos,SERRA.alemaes].map(around),
    // These tiny roadside chapels need breathing room beyond their footprint:
    // a neighboring crown otherwise hides the cross and the side of the roof.
    ...SERRA.capiteis.map(r=>({x:r.x-100,y:r.y-85,w:r.w+200,h:r.h+185}))
  ];
  if(id==='sc')return [around(SC.marco)];
  return [];
}

function worldDressing(M) {
  if(worldDressingCache.has(M.id)) return worldDressingCache.get(M.id);
  const buildings=worldDressingBuildings(M.id), roads=[...worldDressingRoads(M.id),...worldApproachRects(M)], props=[], patches=[],ground=[];
  const result={buildings,roads,props,patches,ground};
  if(!buildings.length) return result;
  let seed=19381+M.W; for(const c of M.id) seed=(seed*31+c.charCodeAt(0))>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const obstacles=typeof M.obstacles==='function'?M.obstacles():M.obstacles||[];
  const overlaps=(a,b,pad=0)=>a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;
  const reserved=M.id==='serra'?[SERRA.praca,SERRA.campinho,{x:0,y:SERRA.arroio-30,w:M.W,h:120}]:M.id==='sc'?[SC.ostern,SC.canchaLauro]:[];
  // Keep small resting places and their interaction approach visible in the foliage.
  for(const d of WORLD_DISCOVERIES.filter(d=>d.map===M.id)){
    const p=discoveryPoint(d);reserved.push({x:p.x-70,y:p.y-(d.setting==='tree'?290:105),w:140,h:d.setting==='tree'?330:145});
  }
  const clear=(x,y,w,h,low=false)=>{
    const a={x:x-w/2,y:y-h,w,h:h+12};
    if(!M.canWalk(x,y)||!M.canWalk(x-w/2,y)||!M.canWalk(x+w/2,y))return false;
    if(roads.some(([x,y,w,h])=>overlaps(a,{x,y,w,h},10)))return false;
    if(obstacles.some(r=>overlaps(a,r,8)))return false;
    if(buildings.some(r=>overlaps(a,{x:r.x+r.w/2-60,y:r.y+r.h,w:120,h:150})))return false;
    if(reserved.some(r=>overlaps(a,r,25)))return false;
    return !props.some(p=>Math.hypot(p.x-x,p.y-y)<Math.min(w,p.w)*.65);
  };
  result.clear=clear;
  const treeClear=(x,y,w,h,grove=false)=>{
    const crown={x:x-w*.43,y:y-h*.85,w:w*.86,h:h*.85};
    if(!M.canWalk(x,y)||!M.canWalk(x-25,y)||!M.canWalk(x+25,y))return false;
    if(roads.some(([rx,ry,rw,rh])=>overlaps({x:x-35,y:y-25,w:70,h:55},{x:rx,y:ry,w:rw,h:rh},12)))return false;
    if(buildings.some(r=>{
      const full=r.id==='player-home'||r===SERRA.igreja||r===SERRA.salao;
      return overlaps(crown,{x:full?r.x:r.x+r.w/2-95,y:r.y+r.h-150,w:full?r.w:190,h:280});
    }))return false;
    const crops=M.id==='serra'?SERRA.vines:M.id==='vila'?[VILA.horta]:[];
    if(crops.some(r=>overlaps(crown,r,20)))return false;
    if(reserved.some(r=>overlaps(crown,r,20)))return false;
    return !props.some(p=>Math.hypot(p.x-x,(p.y-y)*1.5)<(p.sheet==='nature'?w*(grove?.52:.72):grove?30:60));
  };
  const put=(sheet,index,x,y,w,h)=>{
    if(['vila','serra','sc'].includes(M.id)&&sheet==='landscape'&&[1,2,3].includes(index)){
      sheet='frontier-flora';index=({1:0,2:4,3:1})[index];
    }
    if(sheet==='nature'&&index<3){w*=1.55;h*=1.55;}
    if((sheet==='nature'&&index<3?treeClear(x,y,w,h):clear(x,y,w,h,sheet==='landscape'&&index!==4)))props.push({sheet,index,x,y,w,h});
  };
  // Establish groves first, then nest low planting around them.
  const groves=M.id==='vila'?[[720,1070,1,240],[1320,1045,0,220],[2270,1060,1,190],[2270,1320,2],[735,1990,1],[1290,1930,0],[2370,2140,1],[3270,1750,0],[1400,1780,1,250],[2880,2210,0,230],[750,2190,0,260],[1230,2290,1,250]]
    :M.id==='serra'?[[1540,880,1],[2040,820,0],[140,1750,1],[950,1910,2],[2080,1730,0],[2390,1900,1],[1160,2350,1]]
    :[[410,830,1],[1820,820,2],[1190,830,0],[1180,1560,1],[2530,1730,0]];
  if(M.id==='vila')groves.push([1130,300,1],[2110,690,0],[3030,650,1],[4090,1020,0],[3500,1430,1],[3490,2150,0],[740,2540,1],[790,2350,0],[1290,2030,1],[1500,1950,0],[3750,1420,0],[1110,1000,1]);
  for(const [x,y,index,h=280] of groves)put('nature',index,x,y,h*.7,h);
  // Designed garden borders follow each foundation; a clear central approach remains.
  for(const r of buildings){
    patches.push({x:r.x-35,y:r.y+r.h-30,w:r.w+70,h:118,kind:1,seed:random()});
    for(const side of [-1,1]){
      const x=side<0?r.x-65:r.x+r.w+65;
      for(let k=0;k<3;k++) put('landscape',k===1?2:1,x+(random()-.5)*12,r.y+70+k*(r.h-40)/3,92,64);
      put('furniture',side<0?23:17,x,r.y+r.h-12,65,48);
    }
    for(const dx of [.1,.85])put('landscape',2,r.x+r.w*dx,r.y+r.h+115,110,55);
    put('landscape',4,r.x+r.w+75,r.y+r.h+95,48,145);
    for(const side of [-1,1])put('landscape',3,r.x+r.w/2+side*(r.w/2+50),r.y+r.h+125,105,62);
    ground.push({index:5,x:r.x+r.w/2-34,y:r.y+r.h,w:68,h:90});
  }
  // Loose clusters give the unused ground different shapes, not a uniform scatter grid.
  for(let gy=180;gy<M.H-140;gy+=215)for(let gx=140;gx<M.W-100;gx+=235){
    const x=gx+random()*145,y=gy+random()*145;
    if(!clear(x,y,120,100))continue;
    ground.push({index:0,x:x-100,y:y-45,w:190+random()*40,h:100});
    if(random()<.6)put('nature',random()<.5?0:1,x-35,y-50,195+random()*25,255+random()*35);
    const count=2+Math.floor(random()*3);
    for(let k=0;k<count;k++){
      const px=x+(random()-.5)*160,py=y+(random()-.5)*100;
      const flower=random()<.2;
      put('landscape',flower?2:1,px,py,flower?78:75+random()*35,flower?45:45+random()*22);
    }
  }
  // Meadow ribbons break the broad lawn into natural patches, with no new solids.
  for(let y=150;y<M.H-100;y+=130)for(let x=100;x<M.W-100;x+=160){
    const px=x+random()*65,py=y+random()*45;
    if(clear(px,py,38,18)&&random()<.65)ground.push({index:0,x:px-55,y:py-25,w:110+random()*55,h:55+random()*25});
  }
  // Grassy road verges overlap the hard edge slightly, leaving the road center open.
  for(const [rx,ry,rw,rh] of roads){
    const horizontal=rw>rh,length=horizontal?rw:rh;
    for(let k=0;k<length;k+=75)for(const side of [-1,1]){
      const x=horizontal?rx+k:rx+(side<0?-35:rw-12),y=horizontal?ry+(side<0?-24:rh-8):ry+k;
      ground.push({index:0,edge:true,x,y,w:horizontal?96:52,h:horizontal?40:90});
    }
  }
  // Small flat stones and grass accents can be walked over, so routes remain open.
  for(let k=0;k<M.W*M.H/21000;k++){
    const x=80+random()*(M.W-160),y=140+random()*(M.H-280);
    if(clear(x,y,28,18))props.push({sheet:'ground',index:random()<.5?0:1,x,y,w:18+random()*18,h:10+random()*10});
  }
  if(M.id==='vila'){
    // Riparian vegetation follows the banks; dry grass collects in open meadows.
    // Keep the landing, roads, doors and historic marker accessible.
    for(let y=190;y<VILA.border-110;y+=105){
      if(y>805&&y<1010)continue;
      const x=580+random()*52;
      put('frontier-flora',y%2?5:1,x,y,95+random()*40,65+random()*25);
    }
    for(let x=650;x<M.W-100;x+=115)put('frontier-flora',random()<.45?5:1,x,VILA.border-70+random()*28,95+random()*50,65+random()*20);
    for(const [cx,cy] of [[780,1630],[1260,2150],[2350,2030],[3060,2200],[1160,980],[2900,1490]]){
      for(let i=0;i<10;i++){
        const a=random()*Math.PI*2,r=40+random()*125;
        put('frontier-flora',i%4===0?0:1,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.48,65+random()*55,40+random()*25);
      }
    }
    // The new ground renderer handles verge blending and doorstep clearings.
    ground.length=0;
    for(let i=props.length-1;i>=0;i--)if(props[i].sheet==='ground')props.splice(i,1);
  }
  if(['serra','sc'].includes(M.id)){
    ground.length=0;
    for(let i=props.length-1;i>=0;i--)if(props[i].sheet==='ground')props.splice(i,1);
    if(M.id==='serra')for(let x=180;x<M.W-80;x+=145){
      if(Math.abs(x-(SERRA.roadX+SERRA.roadW/2))<160||random()<.35)continue;
      for(const side of [-1,1]){
        const px=x+(random()-.5)*80,py=SERRA.arroio+side*(85+random()*50);
        put('frontier-flora',random()<.5?0:1,px,py,65+random()*35,45+random()*25);
      }
    }
  }
  // Additional groves use their own seed, so existing landscaping remains stable.
  // Reserve full crowns here: the extra trees never cover a facade, crop or path.
  let groveSeed=38117+M.W;
  const groveRandom=()=>{groveSeed=(Math.imul(groveSeed,1664525)+1013904223)>>>0;return groveSeed/4294967296;};
  const extraLimit={vila:40,serra:42,sc:30}[M.id]||0;
  let extraTrees=0;
  for(let attempt=0;attempt<1700&&extraTrees<extraLimit;attempt++){
    const x=130+groveRandom()*(M.W-260),y=360+groveRandom()*(M.H-470);
    const h=296+Math.floor(groveRandom()*5)*20,w=Math.round(h*.7),crown={x:x-w/2,y:y-h,w,h};
    if(buildings.some(r=>overlaps(crown,r,25)))continue;
    if(roads.some(([x,y,w,h])=>overlaps(crown,{x,y,w,h},20)))continue;
    if(!treeClear(x,y,w,h,true))continue;
    const index=groveRandom()<(M.id==='serra'?.7:.45)?1:0;
    props.push({sheet:'nature',index,x,y,w,h,grove:true});extraTrees++;
  }
  // Remove only trees covering these sites after generation. Keeping the random
  // sequence intact preserves every other tree, flower and garden in the map.
  const landmarks=worldLandmarkClearings(M.id);
  const coversLandmark=(x,y,w,h)=>landmarks.some(r=>overlaps({x:x-w/2,y:y-h,w,h},r,12));
  for(let i=props.length-1;i>=0;i--){
    const p=props[i];
    if(p.sheet==='nature'&&p.index<3&&coversLandmark(p.x,p.y,p.w,p.h))props.splice(i,1);
  }
  result.clear=(x,y,w,h,low=false)=>!coversLandmark(x,y,w,h)&&clear(x,y,w,h,low);
  worldDressingCache.set(M.id,result);return result;
}
function worldGroundPatch(p) {
  // Stepped boundaries blend the existing terrain textures into the grass.
  ctx.save(); ctx.beginPath();
  for(let row=0;row<8;row++){
    const t=row/7, inset=(Math.abs(t-.5)*.5+.035*Math.sin(row*2+p.seed*18))*p.w;
    ctx.rect(Math.round((p.x+inset)/4)*4,Math.round((p.y+row*p.h/8)/4)*4,Math.round((p.w-inset*2)/4)*4,Math.ceil(p.h/8/4)*4);
  }
  ctx.clip();ctx.globalAlpha=p.kind===1?.65:.23;
  worldTexture(p.kind,p.x,p.y,p.w,p.h,p.kind===1?160:230);
  if(p.kind===0){ctx.fillStyle='#294e20';ctx.fillRect(p.x,p.y,p.w,p.h);}
  ctx.restore();
}
function worldDressingGround(M,view){
  if(M.indoor)return;
  if(M.id==='vila'){const r=VILA.fogo;worldGroundPatch({x:r.x-15,y:r.y+190,w:r.w+30,h:125,kind:1,seed:.5});}
  const d=worldDressing(M);
  for(const p of d.patches)if(p.x+p.w>view.x&&p.x<view.x+view.w&&p.y+p.h>view.y&&p.y<view.y+view.h)worldGroundPatch(p);
  // Footpaths from the southern Fronteira houses connect to the main north/south road.
}
// Flat landscaping is baked once in world coordinates. Keep tall props in the
// depth-sorted pass, so players can still walk behind trees and buildings.
const WORLD_GROUND_TILE_SIZE=512, WORLD_GROUND_TILE_LIMIT=48;
const worldGroundTileCache=new Map();
function paintWorldDressingSurface(M,view,isolated=false){
  const dressing=worldDressing(M);
  const intersects=(x,y,w,h)=>x+w>view.x&&x<view.x+view.w&&y+h>view.y&&y<view.y+view.h;
  ctx.save();
  for(const [x,y,w,h] of dressing.roads)if(!isolated&&intersects(x,y,w,h)){
    ctx.beginPath();ctx.rect(view.x,view.y,view.w,view.h);
    ctx.rect(x+7,y+7,Math.max(0,w-14),Math.max(0,h-14));ctx.clip('evenodd');
  }
  for(const p of dressing.ground)if(intersects(p.x,p.y,p.w,p.h)){
    ctx.save();if(p.index===0)ctx.globalAlpha=p.edge ? .55 : .3;
    worldSprite('landscape',p.index,p.x,p.y,p.w,p.h);ctx.restore();
  }
  if(isolated){
    // Cutting the roads out of this transparent tile avoids stacking dozens of
    // antialiased clip masks, which is costly in software-rendered browsers.
    ctx.globalCompositeOperation='destination-out';
    ctx.fillStyle='#000';
    // Em degraus miúdos: a beira da estrada é ondulada e um corte reto deixava uma linha dentro da terra.
    for(const [inset,alpha] of [[2,.2],[5,.3],[8,.4],[11,.6],[14,1]]){ctx.globalAlpha=alpha;for(const [x,y,w,h] of dressing.roads)if(intersects(x,y,w,h))ctx.fillRect(x+inset,y+inset,Math.max(0,w-inset*2),Math.max(0,h-inset*2));}
    ctx.globalAlpha=1;
  }
  ctx.restore();
  for(const p of dressing.props)if(p.sheet==='ground'&&intersects(p.x-p.w/2,p.y-p.h,p.w,p.h)){
      if(p.index===0){ctx.save();ctx.beginPath();ctx.moveTo(p.x-p.w/2,p.y);ctx.lineTo(p.x-p.w*.3,p.y-p.h);ctx.lineTo(p.x+p.w*.25,p.y-p.h*.85);ctx.lineTo(p.x+p.w/2,p.y-3);ctx.closePath();ctx.clip();worldTexture(5,p.x-p.w/2,p.y-p.h,p.w,p.h,120);ctx.restore();}
      else worldSprite('nature',8,p.x-p.w/2,p.y-p.h,p.w,p.h);
  }
}
function drawWorldDressingSurface(M,view){
  const dressing=worldDressing(M);
  if(!dressing.ground.length&&!dressing.props.some(p=>p.sheet==='ground'))return;
  // A loading fallback must never become a permanently blank cached tile.
  if(!['landscape','nature','terrain'].every(k=>WORLD_ART[k].complete&&WORLD_ART[k].naturalWidth)){
    paintWorldDressingSurface(M,view);return;
  }
  const size=WORLD_GROUND_TILE_SIZE,pad=2;
  const x0=Math.max(0,Math.floor(view.x/size)),y0=Math.max(0,Math.floor(view.y/size));
  const x1=Math.min(Math.ceil(M.W/size),Math.ceil((view.x+view.w)/size));
  const y1=Math.min(Math.ceil(M.H/size),Math.ceil((view.y+view.h)/size));
  ctx.save();ctx.imageSmoothingEnabled=true;
  try {
    for(let row=y0;row<y1;row++)for(let col=x0;col<x1;col++){
      const key=M.id+':'+col+':'+row,x=col*size,y=row*size;
      const w=Math.min(size,M.W-x),h=Math.min(size,M.H-y);
      let tile=worldGroundTileCache.get(key);
      if(!tile){
        tile=document.createElement('canvas');tile.width=w+pad*2;tile.height=h+pad*2;
        const main=ctx;ctx=tile.getContext('2d');ctx.translate(pad-x,pad-y);
        try{paintWorldDressingSurface(M,{x:x-pad,y:y-pad,w:w+pad*2,h:h+pad*2},true);}finally{ctx=main;}
      }
      // Bounded LRU: at most ~49 MiB, including a full map at minimum zoom.
      worldGroundTileCache.delete(key);worldGroundTileCache.set(key,tile);
      while(worldGroundTileCache.size>WORLD_GROUND_TILE_LIMIT){
        const oldest=worldGroundTileCache.keys().next().value,discard=worldGroundTileCache.get(oldest);
        worldGroundTileCache.delete(oldest);discard.width=discard.height=0;
      }
      drawTileSnapped(tile,pad,pad,w,h,x,y);
    }
  } finally {ctx.restore();}
}
function worldDressingLayers(M,seen,layers,view){
  if(M.indoor)return;
  drawWorldDressingSurface(M,view);
  for(const p of worldDressing(M).props)if(p.sheet!=='ground'&&seen(p.x,p.y,p.h+40)){
    layers.push({y:p.y,draw:()=>p.sheet==='nature'&&p.index<3?worldTreeSprite(p.index,p.x,p.y,p.w,p.h):worldSprite(p.sheet,p.index,p.x-p.w/2,p.y-p.h,p.w,p.h)});
  }
}
