// Dedicated art for the player's home, Italian-colony agriculture and the forge.
'use strict';
const CAMPEIRA_ART = {};
for(const [key,meta] of Object.entries(CAMPEIRA_CROPS)){
  const im=new Image();im.src='assets/images/campeira/'+key+'.png';CAMPEIRA_ART[key]=im;
  WORLD_ART[key]=im;WORLD_ART_CROPS[key]=meta.frames;RURAL_ART_SHEETS.push(key);
}
function campeiraSprite(key,index,x,y,w,h){
  // Atlas gutters meet at the bed feet and the thermos; clip each silhouette separately.
  const mask=key==='home-furniture-v1'&&({
    0:[[180,0],[580,0],[580,330],[525,330],[525,306],[225,306],[225,330],[180,330]],
    3:[[170,330],[300,330],[300,310],[450,310],[450,330],[585,330],[585,546],[170,546]]
  })[index];
  if(!mask)return worldSprite(key,index,x,y,w,h);
  const c=CAMPEIRA_CROPS[key].frames[index],s=Math.min(w/c[2],h/c[3]),left=x+(w-c[2]*s)/2,top=y+h-c[3]*s;
  ctx.save();ctx.beginPath();mask.forEach(([px,py],i)=>ctx[i?'lineTo':'moveTo'](left+(px-c[0])*s,top+(py-c[1])*s));ctx.closePath();ctx.clip();
  const ok=worldSprite(key,index,x,y,w,h);ctx.restore();return ok;
}
const campeiraIcons=new Map();
function campeiraIcon(key,index){
  const cacheKey=key+':'+index;if(campeiraIcons.has(cacheKey))return campeiraIcons.get(cacheKey);
  const meta=CAMPEIRA_CROPS[key],c=meta.frames[index];
  // Nested SVG clips the atlas to the object even when a wide icon is letterboxed.
  const html=`<span class="campeira-icon"><svg viewBox="0 0 ${c[2]} ${c[3]}" role="presentation" aria-hidden="true"><svg width="${c[2]}" height="${c[3]}" viewBox="${c.join(' ')}" overflow="hidden" preserveAspectRatio="none"><image href="assets/images/campeira/${key}.png" width="${meta.width}" height="${meta.height}" /></svg></svg></span>`;
  campeiraIcons.set(cacheKey,html);return html;
}
const FORGE_EQUIPMENT_ART={dash:0,afiado:1,aco:2,cabo:3,comprida:4,poncho:5,lampiao:6,botas:7,chapeu:8,guaiaca:9,bornal:10,pala:11};
const FORGE_ITEM_ART={chimarrao:0,charque:1,canha:2,esporas:3,boleadeira:4,aguabenta:5,patua:6,ticao:7};
const FORGE_ORE_ART={ametista:8,agata:9,cobre:10,ferro:11,opala:12,ouro:13};
function forgeWeaponIcon(id){return campeiraIcon('forge-weapons-v1',Math.max(0,CAVE_WEAPONS.findIndex(w=>w.id===id)));}
function forgeUpgradeIcon(id){return campeiraIcon('forge-equipment-v1',FORGE_EQUIPMENT_ART[id]);}
caveItemIcon=i=>campeiraIcon('forge-supplies-v1',FORGE_ITEM_ART[i.id]);
{
  const icon=bagIcon;bagIcon=k=>FORGE_ORE_ART[k]!==undefined?campeiraIcon('forge-supplies-v1',FORGE_ORE_ART[k]):icon(k);
}

// Front-facing church; crop rows share a quiet palette with the existing terrain.
drawIgreja=r=>campeiraSprite('church-colonia-v1',0,r.x,r.y-90,r.w,r.h+90);
drawVineyard=function(r){
  const rows=Math.max(2,Math.round(r.h/115)),cols=Math.max(1,Math.round(r.w/340));
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const w=r.w/cols;campeiraSprite('agriculture-colonia-v1',0,r.x+col*w,r.y+row*r.h/rows-28,w,r.h/rows+28);
  }
  return true;
};
// Only the outdoor overview changes. Actual garden tiles, harvests and tools stay live.
drawHortaLayers=function(layers,seen){
  const r=VILA.horta;if(!seen(r.x+r.w/2,r.y+r.h/2,r.w))return;
  const h=hortaState(),rowH=(r.h-86)/4,bedW=(r.w-95)/2;
  layers.push({y:r.y+12,draw:()=>worldFence(r.x+5,r.y+12,r.w-10)});
  for(let row=0;row<4;row++)for(let col=0;col<2;col++){
    const cells=h.tiles.slice(row*GARDEN.cols+col*4,row*GARDEN.cols+col*4+4),c=cells.find(c=>c.crop);
    const idx=!c?2:c.growth===0?5:({trigo:1,alface:3,pepino:4}[c.crop]??5),x=r.x+12+col*(bedW+12),y=r.y+25+row*rowH;
    layers.push({y:y+rowH,draw:()=>campeiraSprite('agriculture-colonia-v1',idx,x,y,bedW,rowH+8)});
  }
  h.trees.forEach((c,i)=>{if(c.crop){const x=r.x+r.w-50,y=r.y+65+i*68;layers.push({y,draw:()=>worldSprite('nature',c.crop==='araucaria'?1:c.crop==='bergamota'&&cellReady(c)?3:0,x-27,y-74,54,74)});}});
  layers.push({y:r.y+r.h,draw:()=>{
    worldSprite('garden',9,r.x+12,r.y+r.h-47,44,40);
    worldFence(r.x,r.y+r.h,r.w*.3);worldFence(r.x+r.w*.7,r.y+r.h,r.w*.3);
    if(hortaCells(h).some(cellThirsty))drawDrop(r.x+r.w-12,r.y-14,9);
    if(hortaCells(h).some(cellReady))txt('✓',r.x+r.w-36,r.y-14,18,'#e6ff9b');
  }});
};

const homeMaterialTiles=new Map();
function homeMaterial(index,x,y,w,h){
  if(!homeMaterialTiles.has(index)){
    const c=CAMPEIRA_CROPS['home-earth-materials-v1'].frames[index],tile=document.createElement('canvas');tile.width=tile.height=320;
    tile.getContext('2d').drawImage(CAMPEIRA_ART['home-earth-materials-v1'],...c,0,0,320,320);homeMaterialTiles.set(index,tile);
  }
  ctx.save();ctx.fillStyle=ctx.createPattern(homeMaterialTiles.get(index),'repeat');ctx.fillRect(x,y,w,h);ctx.restore();
}
