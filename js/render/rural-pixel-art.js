// Shared raster sprites for the farm, folklore, collection and inventory.
// All positions are visual only: collisions, recipes and saved state stay in mechanics.
'use strict';
const RURAL_ITEMS = Object.fromEntries(['trigo','leite','pepino_cru','ovo_codorna','vidro','peixe','butia','pitanga','guabiroba','racao','uva','garrafao'].map((key,i)=>[key,['harvest-items-v2',i]]));
const RURAL_ITEM_ALIASES = {alface:'salada',conserva_pepino:'pepino',conserva_codorna:'codorna'};
const KEEPSAKE_ART = {rodeio:0,penalti:1,uva:2,cuia:3,foto1968:4,retrato:5,ticao:6,fita:7,escama:8,freio:9};
const ruralItemFrames = new Map();
function ruralItemSpec(key){
  if(key==='mate')return ['mates-v2',mateLevel()];
  if(/^mate:[0-4]$/.test(key))return ['mates-v2',Number(key.split(':')[1])];
  if(key==='placa_fiado')return ['keepsakes-v2',11];
  return RURAL_ITEMS[key]||null;
}
function ruralItemImage(key){
  const spec=ruralItemSpec(key);if(!spec)return null;
  const [sheet,i]=spec,im=WORLD_ART[sheet],r=WORLD_ART_CROPS[sheet]?.[i];
  if(!im?.naturalWidth||!r)return null;
  const cacheKey=sheet+':'+i;
  if(!ruralItemFrames.has(cacheKey)){
    const tile=document.createElement('canvas'),s=Math.min(1,160/Math.max(r[2],r[3]));
    tile.width=Math.round(r[2]*s);tile.height=Math.round(r[3]*s);
    const c=tile.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='medium';
    c.drawImage(im,...r,0,0,tile.width,tile.height);ruralItemFrames.set(cacheKey,tile);
  }
  return ruralItemFrames.get(cacheKey);
}
function ruralIconHTML(key){
  const spec=ruralItemSpec(key);if(!spec)return '';
  const [sheet,i]=spec,r=WORLD_ART_CROPS[sheet][i],im=WORLD_ART[sheet];
  // The SVG is only a viewport onto the raster atlas. It preserves proportions
  // in rectangular inventory cards as well as square upgrade icons, file:// too.
  return `<span class="pixel-item" aria-hidden="true"><svg viewBox="0 0 ${r[2]} ${r[3]}" width="100%" height="100%" style="display:block;overflow:hidden" focusable="false"><svg viewBox="${r.join(' ')}" width="${r[2]}" height="${r[3]}" overflow="hidden"><image href="assets/images/world/${sheet}.png" width="${im.naturalWidth||1536}" height="${im.naturalHeight||1024}"/></svg></svg></span>`;
}
{
  const image=itemImageForSize,icon=itemIconHTML;
  itemImageForSize=function(key,pixels){return ruralItemImage(key)||image(RURAL_ITEM_ALIASES[key]||key,pixels);};
  itemIconHTML=function(key,item=null){return ruralIconHTML(key)||icon(RURAL_ITEM_ALIASES[key]||key,item);};
  bagIcon=function(key){return itemIconHTML(key)||`<span class="bag-emoji">${BAG_RAW[key]?.icon||''}</span>`;};
}

function ruralStockLabel(f,label){
  const width=Math.min(f.w-4,Math.max(34,label.length*6+10)),x=f.x+f.w/2,y=f.y+f.h-7;
  rect(x-width/2,y-8,width,16,'#30271fdf',3);txt(label,x,y,11,'#fff0c5');
}
function ruralStation(f,index,rise=24){
  return worldSprite('rural-workstations-v2',index,f.x,f.y-rise,f.w,f.h+rise);
}
// These renderers return a handled flag, unlike the void world drawing hooks.
function useRuralStationArt(name,paint){
  const original=window[name];window[name]=function(f){return paint(f)||original(f);};
}
useRuralStationArt('drawFarmStation',f=>{
  const index={forno:0,tacho:1,conservas:2}[f.id];
  if(index===undefined||!ruralStation(f,index,f.id==='conservas'?34:46))return false;
  const key={forno:'trigo',tacho:'leite',conservas:'vidro'}[f.id];
  ruralStockLabel(f,Math.floor(bagQty(key))+({forno:' trigo',tacho:' L',conservas:' vidros'}[f.id]));
  return true;
});
useRuralStationArt('drawExpansionStation',f=>{
  const {x,y,w,h}=f,[type,arg]=f.id.split(':');
  if(type==='parking'){
    if(!ruralStation(f,3,16))return false;
    const item=G.kitchen.parking[Number(arg)];if(item)food(item.pid||item.key,x+w/2,y+h*.2,48,item);
  }else if(type==='pour'){
    if(!ruralStation(f,4,42))return false;
    ruralStockLabel(f,String(G.stock.cachaca));
    if(G.task?.type==='pour')bar(x,y-46,w,G.task.time/1.65);
  }else if(type==='tap'){
    if(!ruralStation({...f,x:x-17,w:w+34},5,40))return false;
    ruralStockLabel(f,String(G.stock.cerveja));
  }else if(type==='service'){
    if(!ruralStation(f,6,55))return false;
  }else if(f.id==='bag'){
    if(!ruralStation(f,7,28))return false;
    ruralStockLabel(f,(G.stock.erva/1000).toFixed(1)+' kg');
    if(G.task?.type==='weigh')bar(x,y-32,w,G.task.grams/G.task.maxWeight);
  }else if(f.id==='coffee'){
    if(!ruralStation(f,8,48))return false;
    ruralStockLabel(f,String(G.stock.cafe));
    if(G.task?.type==='coffee')bar(x,y-52,w,G.task.time/1.4);
  }else if(f.id==='mate'){
    if(!WORLD_ART['mates-v2'].naturalWidth||!ruralStation(f,3,10))return false;
    worldSprite('mates-v2',5,x+w*.48,y-29,w*.4,53);
    const drinking=G.task?.type==='mate';
    if(!drinking)drawRuralMate(x+w*.29,y+24,25);
    if(!drinking){const a=(frameClock*.5)%1;ellipse(x+15,y-18-a*16,1+a*2,3+a*3,`rgba(255,245,213,${.25*(1-a)})`);}
  }else return false;
  return true;
});
// Keep the gourd body the same size as its mound grows, instead of shrinking
// the Legendary mate to fit the same bounding square as the ordinary mate.
function drawRuralMate(x,bottom,bodyWidth=25,level=mateLevel()){
  const widths=[248,330,338,344],r=WORLD_ART_CROPS['mates-v2'][level],s=bodyWidth/widths[level];
  return worldSprite('mates-v2',level,x-r[2]*s/2,bottom-r[3]*s,r[2]*s,r[3]*s);
}

useWorldArt('drawLembranca',(id,x,y)=>{
  const index=KEEPSAKE_ART[id];if(index===undefined)return false;
  return worldSprite('keepsakes-v2',index,x-25,y-54,50,54);
});
useWorldArt('drawLembrancas',()=>{
  if(!WORLD_ART['keepsakes-v2'].naturalWidth)return false;
  const items=lembrancas();if(!items.length||worldOut)return true;
  const {x,y,w,gap}=LEMBRANCAS;
  for(let l=0;l<Math.ceil(items.length/3);l++)worldSprite('keepsakes-v2',10,x,y+l*gap-2,w,30);
  items.forEach((id,k)=>{const cx=x+20+k%3*36,base=y+Math.floor(k/3)*gap+7;ctx.save();ctx.translate(cx,base);ctx.scale(.62,.62);drawLembranca(id,0,0);ctx.restore();});
  return true;
});
function drawFiadoSign(x,y,w,h){
  if(worldSprite('keepsakes-v2',11,x,y,w,h))return;
  if(placaFiadoArt.naturalWidth)ctx.drawImage(placaFiadoArt,x,y,w,h);
}

function folkSprite(index,x,y,w,h,dir=1,bob=0,angle=0){
  if(!WORLD_ART['folklore-v2'].naturalWidth)return false;
  ctx.save();ctx.translate(x,y);ctx.scale(dir<0?-1:1,1);
  ellipse(0,2,w*.28,Math.min(10,w*.07),'#15161040');
  ctx.translate(0,-bob);ctx.rotate(angle);
  worldSprite('folklore-v2',index,-w/2,-h,w,h);ctx.restore();return true;
}
useWorldArt('drawMula',(x,y,dx=1,t=frameClock)=>{
  if(!folkSprite(0,x,y,190,185,dx,Math.abs(Math.sin(t*8))*2))return false;
  ctx.save();ctx.globalCompositeOperation='lighter';glow(x+(dx<0?-1:1)*54,y-128,65,.15+Math.sin(t*12)*.03,'255,144,40');ctx.restore();return true;
});
useWorldArt('drawBoitata',(x,y,t=frameClock)=>{
  if(!folkSprite(2,x-72,y,240,155,1,Math.sin(t*3)*3))return false;
  ctx.save();ctx.globalCompositeOperation='lighter';glow(x-30,y-62,140,.13+Math.sin(t*7)*.025,'255,145,42');ctx.restore();return true;
});
useWorldArt('drawLobisomem',(x,y,dx=1,s=1)=>folkSprite(4,x,y,132*s,175*s,dx,Math.sin(frameClock*3)*.7));
useWorldArt('drawSanguanel',(x,y,dx=1)=>folkSprite(5,x,y,85,95,dx,Math.abs(Math.sin(frameClock*5))*1.5));
useWorldArt('drawNegrinho',(x,y,dx=1,walking=true,light=1)=>{
  if(!folkSprite(1,x,y,64,106,dx,walking?Math.abs(Math.sin(frameClock*7))*.9:0))return false;
  const fl=1+Math.sin(frameClock*11)*.1;
  ctx.save();ctx.globalCompositeOperation='lighter';glow(x+23*(dx<0?-1:1),y-70,120*light,.24*light*fl,'255,190,100');ctx.restore();return true;
});
useWorldArt('drawJavali',(x,y,dir=1,frame=0,scale=1.4,down=false)=>{
  if(down){
    if(!WORLD_ART['folklore-v2'].naturalWidth)return false;
    ctx.save();ctx.translate(x,y);ctx.scale(dir<0?-1:1,1);ctx.rotate(Math.PI*.48);
    worldSprite('folklore-v2',3,-48*scale,-30*scale,85*scale,52*scale);ctx.restore();return true;
  }
  return folkSprite(3,x,y,90*scale,62*scale,dir,frame%2?1.2:0,Math.sin(frame*.8)*.008);
});

{
  const forage=drawForageArt;
  drawForageArt=function(f){
    if(f.id!=='butiazeiro'||!WORLD_ART['butia-v2'].naturalWidth)return forage(f);
    const x=f.x,y=f.y+30,w=355,h=360,p=worldOut;
    ctx.save();ellipse(x+12,y+2,84,15,'#17291930');
    if(p&&Math.abs(p.x-x)<w*.43&&p.y<y+6&&p.y>y-h*.8)ctx.globalAlpha=.42;
    ctx.translate(Math.sin(frameClock*.85+x*.017)*1.2,0);
    worldSprite('butia-v2',0,x-w/2,y-h,w,h);
    if(forageReady(f))for(const [dx,dy] of [[-18,-156],[12,-165],[27,-144]])food('butia',x+dx,y+dy,28);
    ctx.restore();return true;
  };
}
