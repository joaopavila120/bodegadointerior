// Warm materials and complete furniture art for the open-world interiors.
'use strict';
const interiorMaterialCache=new Map();
function interiorMaterial(index,x,y,w,h,size=240){
  const im=WORLD_ART['interior-materials-v2'];if(!im?.naturalWidth)return false;
  const key=index+':'+size;
  if(!interiorMaterialCache.has(key)){
    const tile=document.createElement('canvas');tile.width=tile.height=size;
    const c=tile.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='medium';
    c.drawImage(im,index%3*512,Math.floor(index/3)*512,512,512,0,0,size,size);
    interiorMaterialCache.set(key,ctx.createPattern(tile,'repeat'));
  }
  ctx.save();ctx.fillStyle=interiorMaterialCache.get(key);ctx.fillRect(x,y,w,h);ctx.restore();return true;
}
useWorldArt('floorPattern',(r,kind)=>{
  const map=worldOut?.map;
  const index=map==='acougue'?1:map==='atacado'?3:{wood:0,tile:1,stone:2,marble:2,concrete:3}[kind];
  return index!==undefined&&interiorMaterial(index,r.x,r.y,r.w,r.h,kind==='wood'?260:kind==='tile'?288:320);
});
const oldInteriorWall=worldWall;
worldWall=function(x,y,w,h){
  if(!interiorMaterial(worldOut?.map==='casa:badin'?2:4,x,y,w,h,240))return oldInteriorWall(x,y,w,h);
  const panel=Math.min(38,h*.4);interiorMaterial(5,x,y+h-panel,w,panel,180);
  rect(x,y+h-panel-3,w,4,'#855d3e');rect(x,y+h-5,w,5,'#503b28');
};
function drawInteriorAtmosphere(b,def){
  ctx.save();
  const shade=ctx.createLinearGradient(0,b.y,0,b.y+65);shade.addColorStop(0,'#35241636');shade.addColorStop(1,'#35241600');
  ctx.fillStyle=shade;ctx.fillRect(b.x,b.y,b.w,65);
  rect(b.x,b.y,5,b.h,'#35241622');rect(b.x+b.w-5,b.y,5,b.h,'#35241622');
  // Light falls onto the floor, away from interaction markers and counters.
  for(const x of def.windows||[]){
    ctx.fillStyle='#fff2bc0c';ctx.beginPath();ctx.moveTo(x,b.y);ctx.lineTo(x+70,b.y);ctx.lineTo(x+114,b.y+145);ctx.lineTo(x-26,b.y+145);ctx.fill();
  }
  ctx.restore();
}
function interiorProp(i,sheet,index,width,height,wall=false){
  return worldSprite(sheet,index,i.x+i.w/2-width/2,wall?i.y:i.y+i.h-height,width,height);
}
const INTERIOR_PROP_ART={
  sacks:['interior-details-v2',0,190,100],hay:['interior-details-v2',1,110,90],
  crates:['interior-details-v2',2,120,110],tools:['interior-details-v2',3,150,130],
  saint:['interior-details-v2',6,74,140],bar:['interior-details-v2',5,120,360],
  stained:['interior-details-v2',8,null,null,true],rose:['interior-details-v2',9,null,null,true],
  cross:['interior-details-v2',10,null,null,true],poster:['interior-details-v2',11,null,null,true],
  rods:['interior-flags-v2',10,null,null,true],
  computer:['furniture',14,200,155],miniatura:['furniture',28,140,95],som:['furniture',29,115,130]
};
for(const[kind,config]of Object.entries(INTERIOR_PROP_ART)){
  const fallback=FURN[kind];FURN[kind]=i=>{
    let[sheet,index,w,h,wall]=config;
    if(kind==='tools'&&worldOut?.map==='ferragem')index=4;
    if(kind==='saint'&&i.color==='#8a3a3a')index=7;
    if(kind==='bar')h=i.h+35;
    if(!interiorProp(i,sheet,index,w||i.w,h||i.h,wall))fallback?.(i);
  };
}
const interiorFlagFallback=FURN.flag;
FURN.flag=i=>{
  const index=i.rs?0:i.sun?1:i.ulster?6:i.vertical?(i.colors?.[0]==='#2a8a3a'?2:5):i.colors?.[0]==='#1a1a1a'?3:4;
  if(!worldSprite('interior-flags-v2',index,i.x,i.y,i.w,i.h))interiorFlagFallback(i);
};
const interiorCashFallback=FURN.caixa;
FURN.caixa=i=>{
  if(!WORLD_ART['rural-workstations-v2'].naturalWidth)return interiorCashFallback(i);
  worldSprite('rural-workstations-v2',6,i.x,i.y+i.h-140,i.w,140);
};
for(const kind of ['stage','altarStep']){
  const old=FURN[kind];FURN[kind]=i=>{
    if(!interiorMaterial(kind==='stage'?0:2,i.x,i.y,i.w,i.h,260))return old(i);
    rect(i.x,i.y+i.h-12,i.w,12,kind==='stage'?'#63452e':'#9b9688');rect(i.x,i.y,i.w,3,'#ead6b177');
  };
}
// Every shop retains its own goods. Beer crates are no longer drawn as hay.
for(const i of WORLD_MAPS.atacado.items)if(i.kind==='hay')i.kind='crates';
for(const i of WORLD_MAPS.ferragem.items)if(i.kind==='storeShelf')i.goods='ferragem';
const interiorShelfFallback=FURN.storeShelf;
FURN.storeShelf=i=>{
  if(i.goods==='ferragem'&&interiorProp(i,'interior-fittings-v2',0,i.w,180))return;
  interiorShelfFallback(i);
};
const interiorSinkFallback=FURN.counter;
FURN.counter=i=>{
  if(i.sink&&interiorProp(i,'interior-fittings-v2',1,i.w,125))return;
  interiorSinkFallback(i);
};
for(const[kind,index,height]of [['bed',2,205],['bedbau',2,205],['wardrobe',3,175]]){
  const old=FURN[kind];FURN[kind]=i=>{if(!interiorProp(i,'interior-fittings-v2',index,i.w,height))old(i);};
}
const interiorWindowFallback=windowPane;
windowPane=function(x,y,w,h){
  if(worldOut&&worldMap().indoor&&worldSprite('interior-fittings-v2',4,x-8,y-8,w+16,h+16))return;
  interiorWindowFallback(x,y,w,h);
};
FURN.picture=i=>worldSprite('interior-flags-v2',i.art??8,i.x,i.y,i.w,i.h);
// Personal wall details fill unused wall space without blocking the room.
for(const M of HOUSE_INTERIORS){
  const b=M.bounds,x=b.x+Math.round(b.w*.67),y=b.y-106;
  if(!(M.items||[]).some(i=>i.wall&&i.x<x+82&&i.x+i.w>x)){
    M.items.push({kind:'picture',wall:true,solid:false,x,y,w:82,h:58,
      art:M.id==='casa:badin'?9:['casa:manolima','casa:jayme','casa:baitaca','casa:guri'].includes(M.id)?7:8});
  }
}
