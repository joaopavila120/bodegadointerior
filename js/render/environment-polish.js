// Shared visual materials, with separate bounded caches for outdoor scenery and cave floors.
// Decoration never changes collision, loot, saves or the first-floor refuge.
'use strict';
const ENV_ART={},ENV_PATTERNS=new Map(),ENV_SPRITES=new Map();
const ENV_MAIN_MAPS=new Set(['vila','serra','sc']);
const ENV_DECOR_MAPS=new Set(['vila','serra','sc','horta','curral','campo','mata','trecho']);
const ENV_CROPS={
  'environment-props-v3':[[40,112,314,238],[402,97,304,248],[741,106,361,239],[1133,82,277,268],[62,517,246,132],[390,494,308,172],[750,487,315,175],[1111,458,308,208],[37,789,302,215],[398,786,294,232],[774,736,247,280],[1104,795,309,209]],
  'cave-details-v2':[[22,95,573,330],[610,92,555,338],[1175,16,349,449],[35,521,541,441],[598,519,522,442],[1155,479,327,514]],
  'rural-details-v2':[[13,160,488,300],[527,116,480,348],[1034,157,486,292],[32,593,453,343],[522,594,489,332],[1042,620,475,305]],
  'pier-v1':[[42,140,1464,395],[273,654,982,250]]
};
const environmentArtReady=Promise.all(['materials-v2','cave-details-v2','rural-details-v2','pier-v1','environment-props-v3'].map(id=>new Promise(resolve=>{
  const im=ENV_ART[id]=new Image();im.onload=()=>resolve(true);im.onerror=()=>resolve(false);
  im.src='assets/images/environment/'+id+'.png';
}))).then(ok=>{
  // Clear loading fallbacks once, including terrain that was built before the art arrived.
  frontierTerrainTiles.clear();regionalTerrainTiles.clear();worldGroundTileCache.clear();
  return ok.every(Boolean);
});
function environmentTexture(i,x,y,w,h){
  const im=ENV_ART['materials-v2'];if(!im?.naturalWidth)return false;
  if(!ENV_PATTERNS.has(i)){
    const tile=document.createElement('canvas'),size=i===5?256:384;tile.width=tile.height=size;
    const g=tile.getContext('2d'),sw=im.naturalWidth/3,sh=im.naturalHeight/2;
    // Preserve the natural grain; mirrored stones/grass produce conspicuous rosettes.
    if(i===5){
      // Packed earth: finer, quieter grain instead of prominent gravel clusters.
      g.fillStyle='#a68961';g.fillRect(0,0,size,size);g.globalAlpha=.46;
      g.drawImage(im,0,0,sw,sh,0,0,size,size);g.globalAlpha=1;
    }else g.drawImage(im,i%3*sw,Math.floor(i/3)*sh,sw,sh,0,0,size,size);
    if(i===2){g.fillStyle='#64784777';g.fillRect(0,0,384,384);}
    ENV_PATTERNS.set(i,ctx.createPattern(tile,'repeat'));
  }
  ctx.fillStyle=ENV_PATTERNS.get(i);ctx.fillRect(x,y,w,h);return true;
}
function environmentSprite(sheet,index,x,y,w,h){
  const im=ENV_ART[sheet],r=ENV_CROPS[sheet]?.[index];if(!im?.naturalWidth||!r)return false;
  const scale=Math.min(w/r[2],h/r[3]),sw=Math.ceil(r[2]*scale),sh=Math.ceil(r[3]*scale);
  const key=sheet+':'+index+':'+sw+':'+sh;
  let tile=ENV_SPRITES.get(key);
  if(!tile){
    tile=document.createElement('canvas');tile.width=sw;tile.height=sh;
    const g=tile.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='medium';g.drawImage(im,...r,0,0,sw,sh);
    ENV_SPRITES.set(key,tile);
    if(ENV_SPRITES.size>96)ENV_SPRITES.delete(ENV_SPRITES.keys().next().value);
  }
  ctx.drawImage(tile,x-sw/2,y-sh);return true;
}
function environmentPropPool(map,kind){
  if(kind==='shore')return [3,0,4];
  if(kind==='stone')return map==='serra'?[5,4,5]:[4,5];
  if(kind==='home')return map==='serra'?[9,10,8,11]:map==='sc'?[11,10,8]:[8,10,11];
  if(kind==='garden')return [1,10,2,11];
  if(kind==='woodland')return map==='serra'?[2,6,7,0,5]:[0,1,2,6,7];
  return map==='sc'?[1,2,0]:[0,1,2];
}
function environmentPropIndex(map,kind,x,y){
  const pool=environmentPropPool(map,kind),n=frontierNoise(Math.round(x)+319,Math.round(y)+97);
  return pool[Math.min(pool.length-1,Math.floor(n*pool.length))];
}
function drawEnvironmentDetail(p){
  if(ENV_ART['environment-props-v3']?.naturalWidth)
    return environmentSprite('environment-props-v3',p.art,p.x,p.y,p.w,p.h);
  return environmentSprite('rural-details-v2',p.i,p.x,p.y,p.w,p.h);
}
function drawEnvironmentPier(){
  if(!ENV_ART['pier-v1']?.naturalWidth)return false;
  const bob=Math.sin(frameClock*1.4)*1.5;
  ctx.save();
  ellipse(393,964,166,13,'#102b2736');
  ellipse(330,1022+bob,74,12,'#102b2740');
  // The top deck is at y=890..945; its supports extend below the walkable surface.
  environmentSprite('pier-v1',0,405,975,360,110);
  ctx.strokeStyle='#85734a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(339,966);ctx.quadraticCurveTo(349,984,366,995+bob);ctx.stroke();
  environmentSprite('pier-v1',1,330,1030+bob,155,42);
  ctx.restore();return true;
}

// Main towns: ground detail follows gardens and tree groups rather than a scatter grid.
const environmentGardenCache=new Map();
function environmentGardens(M){
  if(environmentGardenCache.has(M.id))return environmentGardenCache.get(M.id);
  const d=worldDressing(M),items=[],landmarks=worldLandmarkClearings(M.id);
  const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const allowed=(x,y,w,h)=>{
    const r={x:x-w/2,y:y-h,w,h};
    if(!M.canWalk(x,y)||d.buildings.some(b=>overlap(r,b)))return false;
    if(d.roads.some(([x,y,w,h])=>overlap(r,{x:x-14,y:y-14,w:w+28,h:h+28})))return false;
    if(landmarks.some(b=>overlap(r,b)))return false;
    const reserved=M.id==='serra'?[SERRA.praca,SERRA.campinho,...SERRA.vines]:M.id==='sc'?[SC.ostern,SC.canchaLauro]:[VILA.horta,VILA.fogo];
    return !reserved.some(b=>overlap(r,b));
  };
  const put=(i,x,y,w,h)=>{
    if(items.length>=18||items.some(p=>Math.hypot(p.x-x,p.y-y)<210))return;
    if(i===4&&items.filter(p=>p.i===4).length>=2)return;
    if(allowed(x,y,w,h)){
      const kind=i===4?'home':i===2?'garden':'woodland',pool=environmentPropPool(M.id,kind);
      let art=environmentPropIndex(M.id,kind,x,y);
      // Prefer a different silhouette from nearby details; never mirror one bundle along a facade.
      for(let k=0;k<pool.length;k++){
        const candidate=pool[(pool.indexOf(art)+k)%pool.length];
        if(!items.some(p=>p.art===candidate&&Math.hypot(p.x-x,p.y-y)<500)){art=candidate;break;}
      }
      items.push({i,art,x,y,w,h});
    }
  };
  for(const r of d.buildings){
    const n=frontierNoise(r.x+71,r.y);if(n<.35)continue;
    // One occasional detail, not mirrored bundles on every facade.
    const side=n>.65?1:-1,x=r.x+r.w/2+side*(r.w/2+58);
    const i=n>.83?4:n>.58?1:M.id==='vila'?0:2;
    put(i,x,r.y+r.h+12,86,54);
  }
  for(const p of d.props.filter(p=>p.sheet==='nature'&&p.index<3)){
    const n=frontierNoise(p.x,p.y);
    if(n>.88)put(1,p.x-30,p.y+12,76,42);
  }
  environmentGardenCache.set(M.id,items);return items;
}
function paintEnvironmentGardens(M,v){
  if(!ENV_ART['rural-details-v2'].naturalWidth)return;
  // Only low vegetation is baked here. Taller household objects use depth sorting below.
  for(const p of environmentGardens(M))if(p.i!==4&&p.x+p.w/2>v.x&&p.x-p.w/2<v.x+v.w&&p.y>v.y&&p.y-p.h<v.y+v.h)
    drawEnvironmentDetail(p);
  // Subtle foundation shadows attach buildings to the terrain without a rectangular dirt mat.
  ctx.save();ctx.fillStyle='#25302124';
  for(const r of worldDressingBuildings(M.id)){
    if(r.x+r.w<v.x||r.x>v.x+v.w||r.y+r.h<v.y||r.y>v.y+v.h)continue;
    ctx.beginPath();ctx.ellipse(r.x+r.w*.52,r.y+r.h+7,r.w*.46,18,0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
{
  const texture=frontierTexture,frontier=paintFrontierTerrain,regional=paintRegionalTerrain,ground=worldDressingGround,layers=worldDressingLayers,sprite=worldSprite;
  worldSprite=function(sheet,i,x,y,w,h){
    if(ENV_MAIN_MAPS.has(worldOut?.map)&&sheet==='frontier-flora'){
      // Most meadow cells remain empty; retain a few bank stones and sparse tufts.
      const n=frontierNoise(Math.round(x)+137,Math.round(y)+59);
      if(n<(w<40?.88:[2,3].includes(i)?.55:.8))return true;
    }
    if(ENV_DECOR_MAPS.has(worldOut?.map)&&sheet==='frontier-flora'&&ENV_ART['environment-props-v3']?.naturalWidth){
      const map=worldOut.map,shore=map==='vila'&&x<VILA.river+160||map==='serra'&&Math.abs(y-SERRA.arroio)<125;
      const kind=[2,3].includes(i)?'stone':shore?'shore':'foliage';
      const coast=map==='trecho'&&trechoBiome(trechoN())==='restinga';
      const art=coast?(kind==='stone'?4:0):environmentPropIndex(map,kind,x,y);
      return environmentSprite('environment-props-v3',art,x+w/2,y+h,w,h);
    }
    if(ENV_MAIN_MAPS.has(worldOut?.map)&&sheet==='frontier-flora'&&[0,1,4,5].includes(i)){
      const index=i===4?(worldOut.map==='vila'?0:2):i===0?1:0;
      if(environmentSprite('rural-details-v2',index,x+w/2,y+h,w,h))return true;
    }
    return sprite(sheet,i,x,y,w,h);
  };
  frontierTexture=function(i,x,y,w,h){
    if(ENV_MAIN_MAPS.has(worldOut?.map)&&[0,1].includes(i)&&environmentTexture(i===0?2:5,x,y,w,h))return true;
    return texture(i,x,y,w,h);
  };
  paintFrontierTerrain=function(v){frontier(v);paintEnvironmentGardens(WORLD_MAPS.vila,v);};
  paintRegionalTerrain=function(M,v){regional(M,v);if(ENV_MAIN_MAPS.has(M.id))paintEnvironmentGardens(M,v);};
  worldDressingGround=function(M,v){if(!ENV_MAIN_MAPS.has(M.id))return ground(M,v);};
  worldDressingLayers=function(M,seen,list,v){
    if(!ENV_MAIN_MAPS.has(M.id))return layers(M,seen,list,v);
    drawWorldDressingSurface(M,v);
    for(const p of worldDressing(M).props){
      // Replace the tiny detached barrels, wood icons and lamps with grouped foundation details.
      if(p.sheet==='ground'||p.sheet==='furniture'&&[17,23].includes(p.index)||p.sheet==='landscape'&&p.index===4)continue;
      if(seen(p.x,p.y,p.h+40))list.push({y:p.y,draw:()=>p.sheet==='nature'&&p.index<3?worldTreeSprite(p.index,p.x,p.y,p.w,p.h):worldSprite(p.sheet,p.index,p.x-p.w/2,p.y-p.h,p.w,p.h)});
    }
    for(const p of environmentGardens(M))if(p.i===4&&seen(p.x,p.y,p.h+30))list.push({y:p.y,draw:()=>drawEnvironmentDetail(p)});
  };
}

// Combat caves retain their generated footprints. Only the visual skin changes.
let environmentCaveRun=null,environmentCaveGround=null;
const environmentWallFaces=new Map();
function environmentCaveReady(){return ENV_ART['materials-v2']?.naturalWidth&&ENV_ART['cave-details-v2']?.naturalWidth;}
function environmentCaveBake(run){
  const C=CAVE.cell,tile=document.createElement('canvas');tile.width=CAVE.cols*C;tile.height=CAVE.rows*C;
  const saved=ctx;ctx=tile.getContext('2d');
  try{
    environmentTexture(run.floor>10?1:0,0,0,tile.width,tile.height);
    // Pools of dim shade and warm lantern light are static, not full-screen live filters.
    ctx.fillStyle=run.floor>10?'#22121555':'#241a1233';ctx.fillRect(0,0,tile.width,tile.height);
    const masses=new Path2D();
    for(let y=0;y<CAVE.rows;y++)for(let x=0;x<CAVE.cols;x++)if(run.grid[y][x]){
      const px=x*C,py=y*C;
      const edges=[[[px,py],[px+C,py],0,1,run.grid[y-1]?.[x]===0],[[px+C,py],[px+C,py+C],-1,0,run.grid[y]?.[x+1]===0],[[px+C,py+C],[px,py+C],0,-1,run.grid[y+1]?.[x]===0],[[px,py+C],[px,py],1,0,run.grid[y]?.[x-1]===0]];
      masses.moveTo(px,py);
      for(const [a,b,dx,dy,exposed] of edges){
        for(let k=1;k<=5;k++){const t=k/5,j=exposed&&k<5?3+frontierNoise(x*71+k,y*39+k)*6:0;masses.lineTo(a[0]+(b[0]-a[0])*t+dx*j,a[1]+(b[1]-a[1])*t+dy*j);}
      }
      masses.closePath();
      if(run.grid[y+1]?.[x]===0){
        const shade=ctx.createLinearGradient(0,(y+1)*C-3,0,(y+1)*C+26);
        shade.addColorStop(0,'#140f0bc0');shade.addColorStop(1,'#140f0b00');ctx.fillStyle=shade;ctx.fillRect(x*C-4,(y+1)*C-3,C+8,29);
      }
    }
    ctx.save();ctx.clip(masses);environmentTexture(run.floor>10?4:3,0,0,tile.width,tile.height);
    ctx.fillStyle='#08090970';ctx.fillRect(0,0,tile.width,tile.height);ctx.restore();
    for(const p of environmentCaveDetails(run))if(p.i===5){
      const g=ctx.createRadialGradient(p.x+15,p.y,5,p.x+15,p.y,145);
      g.addColorStop(0,'#eea13d40');g.addColorStop(1,'#eea13d00');ctx.fillStyle=g;ctx.fillRect(p.x-140,p.y-145,290,290);
    }
  }finally{ctx=saved;}
  if(environmentCaveGround)environmentCaveGround.width=environmentCaveGround.height=0;
  environmentCaveGround=tile;environmentCaveRun=run;
}
function environmentCaveDetails(run){
  if(run.environmentDetails)return run.environmentDetails;
  const list=[],C=CAVE.cell;
  for(let y=1;y<CAVE.rows-1;y++)for(let x=1;x<CAVE.cols-1;x++){
    if(!run.grid[y][x]||run.grid[y+1]?.[x]!==0||run.grid[y][x-1]!==1||run.grid[y][x+1]!==1)continue;
    const n=frontierNoise(x+run.floor*31,y*17);
    if(n>.72)list.push({i:5,x:(x+.5)*C,y:(y+1)*C-5,w:60,h:106});
    else if(n<.14)list.push({i:2,x:(x+.5)*C,y:(y+1)*C-10,w:54,h:82});
  }
  return run.environmentDetails=list;
}
function environmentWallFace(deep,variant){
  const key=deep+':'+variant;
  if(!environmentWallFaces.has(key)){
    const tile=document.createElement('canvas');tile.width=CAVE.cell;tile.height=CAVE.cell+26;
    const g=tile.getContext('2d'),r=ENV_CROPS['cave-details-v2'][deep?1:0];
    // Adjacent thirds form a continuous face, instead of repeating a whole boulder every cell.
    g.drawImage(ENV_ART['cave-details-v2'],r[0]+r[2]*variant/3,r[1],r[2]/3,r[3],0,0,tile.width,tile.height);
    environmentWallFaces.set(key,tile);
  }
  return environmentWallFaces.get(key);
}
{
  const floor=drawCaveFloor,wall=drawCaveWall,rock=drawCaveRock,draw=WORLD_MAPS.caverna.draw;
  drawCaveFloor=function(v){
    const run=caveFloorRun();if(run.floor===1||!environmentCaveReady())return floor(v);
    if(environmentCaveRun!==run)environmentCaveBake(run);
    ctx.fillStyle='#100e0b';ctx.fillRect(v.x-30,v.y-30,v.w+60,v.h+60);ctx.drawImage(environmentCaveGround,0,0);
  };
  drawCaveWall=function(x,y,run){
    if(run.floor===1||!environmentCaveReady())return wall(x,y,run);
    const C=CAVE.cell;
    if(run.grid[y+1]?.[x]===0)ctx.drawImage(environmentWallFace(run.floor>10,x%3),x*C,y*C-26);
    // The side edges remain inside the collision footprint, keeping narrow passages readable.
    ctx.fillStyle='#0b090944';
    if(run.grid[y]?.[x-1]===0)ctx.fillRect(x*C,y*C,5,C);
    if(run.grid[y]?.[x+1]===0)ctx.fillRect((x+1)*C-5,y*C,5,C);
  };
  drawCaveRock=function(r){
    if(worldOut?.map!=='caverna'||caveState().floor===1||!environmentCaveReady())return rock(r);
    if(r.loot&&!['ametista','agata','pinhao'].includes(r.loot))return rock(r);
    const i=r.loot==='ametista'?3:r.loot==='agata'?4:2;
    environmentSprite('cave-details-v2',i,r.x,r.y+9,i===2?60:76,i===2?65:68);
    if(r.hp<(caveState().floor>10?4:3)){
      ctx.save();ctx.strokeStyle='#20160fc0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(r.x-8,r.y-39);ctx.lineTo(r.x+3,r.y-26);ctx.lineTo(r.x-5,r.y-12);ctx.stroke();ctx.restore();
    }
  };
  WORLD_MAPS.caverna.draw=function(v,seen,layers){
    draw.call(this,v,seen,layers);const run=caveFloorRun();if(run.floor===1||!environmentCaveReady())return;
    for(const p of environmentCaveDetails(run))if(seen(p.x,p.y,130))layers.push({y:p.y-20,draw:()=>environmentSprite('cave-details-v2',p.i,p.x,p.y,p.w,p.h)});
  };
}
