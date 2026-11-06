// Island equipment uses one icon atlas and two on-demand Sadi action atlases.
'use strict';
const ISLAND_ITEM_IDS=['prata','sal','arruda','garapuvu','corrente_ferro','sabre_peca','bomba','reza','facao_prata','arpao','carabina','cartuchos','sabre','bau_pirata','sal_pedra'];
const ISLAND_ITEM_FILE='assets/images/island/itens-ilha-v1.png';
const islandItemFrames=new Map(),islandWeaponLoads={};
let islandItemsImage=null,islandItemsReady=null;
function islandItemImage(){
  if(!islandItemsImage){
    islandItemsImage=new Image();
    islandItemsReady=new Promise(resolve=>{islandItemsImage.onload=()=>resolve(true);islandItemsImage.onerror=()=>resolve(false);islandItemsImage.src=ISLAND_ITEM_FILE;});
  }
  return islandItemsImage;
}
function islandItemIndex(id){return ISLAND_ITEM_IDS.indexOf(id==='facao'?'facao_prata':id);}
function islandItemIcon(id,size=64){
  const index=islandItemIndex(id),r=ISLAND_ITEM_ATLAS.frames[index];if(!r)return '';
  islandItemImage();
  const k=Math.min(size/r[2],size/r[3]),clip=index===10?'clip-path:polygon(0 0,100% 0,100% 34%,58% 100%,0 100%);':'';
  return `<span class="mata-item-art island-item-art" data-island-item="${id}" style="display:inline-flex;width:${size}px;height:${size}px;align-items:center;justify-content:center;vertical-align:middle;flex-shrink:0"><svg width="${r[2]*k}" height="${r[3]*k}" viewBox="${r.join(' ')}" aria-hidden="true" style="overflow:hidden;${clip}"><image href="${ISLAND_ITEM_FILE}" width="${ISLAND_ITEM_ATLAS.size[0]}" height="${ISLAND_ITEM_ATLAS.size[1]}" /></svg></span>`;
}
function islandItemFrame(id,size=64){
  const index=islandItemIndex(id),r=ISLAND_ITEM_ATLAS.frames[index],im=islandItemImage();if(!r||!im.naturalWidth)return null;
  size=Math.max(16,Math.min(160,Math.ceil(size/8)*8));
  const key=index+':'+size;if(islandItemFrames.has(key))return islandItemFrames.get(key);
  const k=Math.min(size/r[2],size/r[3]),c=document.createElement('canvas');c.width=Math.ceil(r[2]*k);c.height=Math.ceil(r[3]*k);
  const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  // The diagonal rifle's rectangle grazes the neighbouring cartridge box.
  if(index===10){g.beginPath();g.moveTo(0,0);g.lineTo(c.width,0);g.lineTo(c.width,c.height*.34);g.lineTo(c.width*.58,c.height);g.lineTo(0,c.height);g.closePath();g.clip();}
  g.drawImage(im,...r,0,0,c.width,c.height);
  islandItemFrames.set(key,c);if(islandItemFrames.size>96)islandItemFrames.delete(islandItemFrames.keys().next().value);
  return c;
}
function islandItemDraw(id,x,y,w,h=w){
  const f=islandItemFrame(id,Math.max(w,h));if(!f)return false;
  const k=Math.min(w/f.width,h/f.height);ctx.drawImage(f,x-f.width*k/2,y-f.height*k,f.width*k,f.height*k);return true;
}
function islandHarpoonFrame(){
  if(islandItemFrames.has('arpao-flight'))return islandItemFrames.get('arpao-flight');
  const im=islandItemImage();if(!im.naturalWidth)return null;
  const r=ISLAND_ITEM_ATLAS.frames[9],c=document.createElement('canvas');c.width=64;c.height=70;
  const g=c.getContext('2d');
  // In flight only the shaft and point leave the hand. The rope coil stays with Sadi.
  g.beginPath();g.moveTo(0,70*.82);g.lineTo(64*.84,0);g.lineTo(64,0);g.lineTo(64,70*.16);g.lineTo(64*.2,70);g.lineTo(0,70);g.closePath();g.clip();
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,...r,0,0,64,70);
  islandItemFrames.set('arpao-flight',c);return c;
}
function islandWeaponImage(weapon){
  const name='sadi-'+weapon,meta=ISLAND_WEAPON_POSES[name];if(!meta)return null;
  const id='island:'+name;
  if(!ACTION_ART[id]){
    const im=ACTION_ART[id]=new Image();ACTION_ART_CROPS[id]=meta;
    islandWeaponLoads[weapon]=new Promise(resolve=>{im.onload=()=>resolve(true);im.onerror=()=>resolve(false);im.src='assets/images/actions/'+name+'-v1.png';});
  }
  return ACTION_ART[id];
}
function loadIslandItemArt(){
  islandItemImage();islandWeaponImage('carabina');islandWeaponImage('arpao');
  return Promise.all([islandItemsReady,...Object.values(islandWeaponLoads)]).then(r=>r.every(Boolean));
}
function islandWeaponMuzzle(p,angle,stage,weapon){
  if(!islandWeaponImage(weapon)?.naturalWidth)return null;
  const direction=walkDirection(Math.cos(angle),Math.sin(angle)),sign=direction===1&&Math.cos(angle)<0?-1:1;
  // Coordinates in body-height units (124), measured from the new poses' boots.
  const points=weapon==='carabina'?
    [[[0,-86],[9,-103],[51,-38],[59,-26]],[[96,-100],[60,-124],[72,-42],[59,-30]],[[28,-124],[36,-126],[26,-53],[55,-30]]]:
    [[[-17,-86],[-29,-86],[-22,-63],[0,-65]],[[22,-90],[56,-90],[44,-66],[26,-65]],[[20,-96],[43,-95],[39,-60],[19,-76]]];
  const[x,y]=points[direction][stage],scale=(worldOut&&!worldMap().indoor?124:130)/124*sadiScale();
  return{x:p.x+x*sign*scale,y:p.y+y*scale};
}
{
  const bag=bagIcon,gear=mataGearHTML,icon=rangedIcon,emoji=griggsEmoji,weapon=forgeWeaponIcon,item=itemImageForSize;
  bagIcon=k=>islandItemIndex(k)>=0?islandItemIcon(k,48):bag(k);
  mataGearHTML=(id,size=64)=>['bomba','reza'].includes(id)?islandItemIcon(id,size):gear(id,size);
  rangedIcon=id=>['arpao','carabina','cartuchos'].includes(id)?islandItemIcon(id):icon(id);
  griggsEmoji=e=>({'🔪':'facao_prata','🙏':'reza','⚔️':'sabre','💣':'bomba'}[e]?islandItemIcon({'🔪':'facao_prata','🙏':'reza','⚔️':'sabre','💣':'bomba'}[e]):emoji(e));
  forgeWeaponIcon=id=>{if(!armaSabre(id))return weapon(id);const f=ILHA_SABRES[id].filtro;return f?`<span style="display:inline-flex;filter:${f}">${islandItemIcon('sabre')}</span>`:islandItemIcon('sabre');};
  itemImageForSize=(id,size)=>islandItemIndex(id)>=0?islandItemFrame(id,size)||item(id,size):item(id,size);
  const achado=drawAchado;
  drawAchado=function(a){
    const id=a.k==='prata'?'bau_pirata':a.k==='sal'?'sal_pedra':a.k,w=a.k==='garapuvu'?100:a.k==='prata'?62:52;
    if(!islandItemsImage?.naturalWidth){islandItemImage();return achado(a);}
    ctx.save();ctx.globalCompositeOperation='lighter';glow(a.x,a.y-18,26,.22+.08*Math.sin(frameClock*4+a.x),'255,250,210');ctx.restore();
    ellipse(a.x,a.y+2,w*.35,7,'rgba(0,0,0,.18)');
    if(!islandItemDraw(id,a.x,a.y,w,a.k==='garapuvu'?60:w))achado(a);
  };
  const button=updateRangedButton;
  updateRangedButton=function(){const id=rangedWeapon();if(id==='arpao'||id==='carabina')islandWeaponImage(id);return button();};
  const harpoon=arpaoDrawShot;
  arpaoDrawShot=function(s,x,y){
    if(!islandItemsImage?.naturalWidth)return harpoon(s,x,y);
    const angle=Math.atan2(s.vy,s.vx),pose=sadiRangedPose();
    const hand=pose?.weapon==='arpao'?islandWeaponMuzzle(worldOut,pose.angle,pose.stage,'arpao'):{x:worldOut.x+Math.cos(angle)*20,y:worldOut.y-60};
    const tail={x:x-Math.cos(angle)*70,y:y-Math.sin(angle)*70},f=islandHarpoonFrame();
    ctx.save();ctx.strokeStyle='#c9ab77';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(hand.x,hand.y);ctx.quadraticCurveTo((hand.x+tail.x)/2,(hand.y+tail.y)/2+18,tail.x,tail.y);ctx.stroke();
    ctx.translate(x,y);ctx.rotate(angle+Math.PI/4);ctx.drawImage(f,-f.width*.98,-f.height*.01);ctx.restore();
  };
}
