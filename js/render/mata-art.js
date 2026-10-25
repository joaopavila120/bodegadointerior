// Art owned by the forest: never changes the scale or renderer inside the bodega.
'use strict';
const MATA_ART = {}, MATA_MATERIALS = new Map();
const mataArtReady = Promise.all(['garibaldi-ghost','garibaldi-refuge-exterior','garibaldi-refuge-interior','mata-nature','mata-gear','mata-terrain','mata-cliffs','mata-fauna','mata-fauna-walk'].map(id => new Promise(resolve => {
  const im = MATA_ART[id] = new Image(); im.onload = () => resolve(true); im.onerror = () => resolve(false);
  im.src = 'assets/images/mata/' + id + '-v1.png';
}))).then(results => { mataTiles.clear(); trechoTiles.clear(); return results.every(Boolean); });
// The generated sheets have irregular gutters: use reviewed rectangles, not a guessed grid.
const MATA_NATURE_RECTS = [
  [3,0,337,368],[333,91,308,261],[645,93,294,270],[942,138,306,221],
  [8,373,319,252],[339,355,299,288],[625,371,302,278],[934,363,315,274],
  [43,627,279,289],[321,652,290,270],[591,647,357,274],[947,647,306,264],
  [17,922,318,320],[352,927,302,315],[666,939,288,303],[981,917,264,324]
];
const MATA_GEAR_RECTS = [
  [8,22,322,289],[335,24,295,290],[632,20,305,295],[947,44,302,268],
  [22,310,276,313],[335,325,284,301],[621,361,363,242],[1028,312,206,320],
  [16,624,321,297],[346,653,270,225],[620,632,325,281],[946,630,302,297],
  [14,933,320,277],[328,857,296,375],[616,910,335,334],[951,929,296,310]
];
const MATA_GEAR_IDS = ['facao_mato','bota','picua','pinguela','fumaceiro','perneira','chapeu','lampiao','escada','apito','marcela','carqueja','fumo','ticao','erva_verde','mel'];
const MATA_SPRITE_CACHE=new Map(), MATA_SPRITE_PIXEL_LIMIT=6*1024*1024, MATA_SPRITE_LIMIT=256;
let mataSpritePixels=0;
function mataArtRect(id, r, x, y, w, h) {
  const im = MATA_ART[id]; if (!im?.naturalWidth) return false;
  const cw=Math.max(1,Math.ceil(w)),ch=Math.max(1,Math.ceil(h)),key=id+':'+r.join(',')+':'+cw+':'+ch;
  let tile=MATA_SPRITE_CACHE.get(key);
  if(!tile){
    tile=document.createElement('canvas');tile.width=cw;tile.height=ch;
    const g=tile.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='medium';
    g.drawImage(im,...r,0,0,cw,ch);
    MATA_SPRITE_CACHE.set(key,tile);mataSpritePixels+=cw*ch;
    while(MATA_SPRITE_CACHE.size>MATA_SPRITE_LIMIT||mataSpritePixels>MATA_SPRITE_PIXEL_LIMIT){
      const oldest=MATA_SPRITE_CACHE.keys().next().value,t=MATA_SPRITE_CACHE.get(oldest);
      MATA_SPRITE_CACHE.delete(oldest);mataSpritePixels-=t.width*t.height;
    }
  }else{MATA_SPRITE_CACHE.delete(key);MATA_SPRITE_CACHE.set(key,tile);}
  ctx.drawImage(tile,x,y,w,h);return true;
}
function mataNature(index, x, y, w, h) {
  const r = MATA_NATURE_RECTS[index], scale = Math.min(w/r[2],h/r[3]);
  return mataArtRect('mata-nature',r,x-r[2]*scale/2,y-r[3]*scale,r[2]*scale,r[3]*scale);
}
function mataGearHTML(id, size=64) {
  const r = MATA_GEAR_RECTS[MATA_GEAR_IDS.indexOf(id)]; if (!r) return '';
  const scale=Math.min(size/r[2],size/r[3]);
  // An exact-aspect viewport clips neighbouring icons out of the letterbox gutters.
  const clip=id==='apito'?'<defs><clipPath id="mata-whistle-'+size+'"><path d="M344 814L514 650L620 650L620 739L416 885L344 885Z"/></clipPath></defs>':'';
  return `<span class="mata-item-art" style="display:inline-flex;width:${size}px;height:${size}px;align-items:center;justify-content:center"><svg width="${r[2]*scale}" height="${r[3]*scale}" viewBox="${r.join(' ')}" aria-hidden="true" style="overflow:hidden">${clip}<image href="assets/images/mata/mata-gear-v1.png" width="1254" height="1254" ${id==='apito'?'clip-path="url(#mata-whistle-'+size+')"':''}/></svg></span>`;
}
{
  const icon=bagIcon;
  bagIcon=function(id){return id==='erva_verde'||id==='mel'?mataGearHTML(id):icon(id);};
}
function mataTexture(index,x,y,w,h) {
  const im=MATA_ART['mata-terrain']; if(!im?.naturalWidth)return false;
  if(!MATA_MATERIALS.has(index)){
    const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
    g.fillStyle=['#465039','#8e704b','#55534c','#697447','#d7c49a','#245158'][index];g.fillRect(0,0,512,512);
    // Mirrored quadrants meet at identical texels, eliminating visible square seams.
    g.globalAlpha=[.42,.57,.32,.42,.38,.43][index];
    for(const [sx,sy] of [[1,1],[-1,1],[1,-1],[-1,-1]]){g.save();g.translate(sx<0?512:0,sy<0?512:0);g.scale(sx,sy);g.drawImage(im,index%3*512,Math.floor(index/3)*512,512,512,0,0,256,256);g.restore();}
    MATA_MATERIALS.set(index,ctx.createPattern(c,'repeat'));
  }
  ctx.fillStyle=MATA_MATERIALS.get(index);ctx.fillRect(x,y,w,h);return true;
}
let mataPainting=false;
{
  const texture=frontierTexture,paint=paintMataTerrain;
  frontierTexture=function(i,x,y,w,h){if(mataPainting&&mataTexture([0,1,5,2][i],x,y,w,h))return true;return texture(i,x,y,w,h);};
  paintMataTerrain=function(view){mataPainting=true;try{return paint(view);}finally{mataPainting=false;}};
  const tree=worldTreeSprite,sprite=worldSprite,log=drawMataLog;
  worldTreeSprite=function(i,x,y,w,h){
    if(!['mata','trecho'].includes(worldOut?.map)||!MATA_ART['mata-nature'].naturalWidth)return tree(i,x,y,w,h);
    ctx.save();if(Math.abs(worldOut.x-x)<w*.43&&worldOut.y<y+6&&worldOut.y>y-h*.8)ctx.globalAlpha=.38;
    const ok=mataNature(0,x+Math.sin(frameClock*.8+x)*1.1,y,w,h);ctx.restore();return ok;
  };
  worldSprite=function(id,i,x,y,w,h){
    if(id==='frontier-flora'&&['mata','trecho'].includes(worldOut?.map)&&MATA_ART['mata-nature'].naturalWidth){
      const coast=inTrecho()&&trechoBiome(trechoN())==='restinga';
      return mataNature(coast?(i===3?14:13):i===3?2:i===2?9:1,x+w/2,y+h,w,h);
    }
    return sprite(id,i,x,y,w,h);
  };
  drawMataLog=function(l){if(!MATA_ART['mata-nature'].naturalWidth)return log(l);ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.a);mataNature(3,0,12,l.w,l.w*.5);ctx.restore();};
}
{
  const old=drawGaribaldi;
  drawGaribaldi=function(x,y,alpha=1,dx=0,walking=false){
    if(!MATA_ART['garibaldi-ghost'].naturalWidth)return old(x,y,alpha,dx);
    const col=walking?1+Math.floor(frameClock*7)%3:0,row=walking&&dx?1:0;
    ctx.save();ctx.globalAlpha=.88*alpha;ctx.translate(x,y+Math.sin(frameClock*1.5)*2);
    if(dx<0&&walking)ctx.scale(-1,1);
    mataArtRect('garibaldi-ghost',[col*384+35,row*512+8,330,484],-49,-145,99,145);ctx.restore();
  };
  garibaldiPortrait=function(size=104){return `<svg class="portrait" width="${size}" height="${size}" viewBox="135 18 160 176" aria-label="Giuseppe Garibaldi"><image href="assets/images/mata/garibaldi-ghost-v1.png" width="1536" height="1024"/></svg>`;};
  const rancho=drawRancho,barbaqua=drawBarbaqua;
  Object.assign(RANCHO,{x:420,y:1130,w:440,h:260});
  drawRancho=function(){if(!MATA_ART['garibaldi-refuge-exterior'].naturalWidth)return rancho();mataArtRect('garibaldi-refuge-exterior',[24,50,1480,910],640-272,1395-335,544,335);};
  drawBarbaqua=function(){if(!MATA_ART['mata-nature'].naturalWidth)return barbaqua();mataNature(11,RANCHO_BARBAQUA.x,RANCHO_BARBAQUA.y+8,205,176);};
  const gate=drawTrechoGate,resource=drawTrechoResource,camp=drawTrechoCamp;
  drawTrechoGate=function(T,g){
    if(!MATA_ART['mata-nature'].naturalWidth)return gate(T,g);
    const ok=trechoGateCleared(T,g);
    if(g.kind==='cipo'){if(!ok)mataNature(7,g.x,g.y+12,200,180);else mataNature(3,g.x-90,g.y+14,65,40);}
    else if(g.kind==='marimbondo'){if(!ok){mataNature(8,g.x,g.y+10,128,160);for(let k=0;k<6;k++)ellipse(g.x+Math.sin(frameClock*6+k)*40,g.y-60+Math.cos(frameClock*5+k)*24,2,1,'#e2b54e');}}
    else if(g.kind==='barranco'){mataNature(12,g.x,g.y+12,210,150);if(ok)mataNature(15,g.x,g.y+16,75,120);}
    else if(g.kind==='banhado'){for(let k=0;k<5;k++)mataNature(9,g.x-140+k*70,g.y+(k%2?84:-60),70,70);}
  };
  drawTrechoResource=function(T,r){
    if(!MATA_ART['mata-nature'].naturalWidth)return resource(T,r);
    if(trechoDay(T.n).got.includes(r.id)&&r.kind!=='colmeia')return;
    const index={pinha:4,erva:5,colmeia:6}[r.kind],size={pinha:45,erva:95,colmeia:115}[r.kind];
    mataNature(index,r.x,r.y+8,size,size);
    if(r.kind==='colmeia'&&!trechoDay(T.n).got.includes(r.id))for(let k=0;k<4;k++)ellipse(r.x+Math.sin(frameClock*4+k)*26,r.y-48+Math.cos(frameClock*3+k)*13,1.8,1,'#e4c66a');
  };
  drawTrechoCamp=function(T){
    if(!MATA_ART['mata-nature'].naturalWidth)return camp(T);if(!T.camp)return;
    const c=T.camp;mataNature(10,c.x+125,c.y-8,230,180);
    if(!worldSprite('rural',6,c.x-120,c.y-65,130,110))sceneFire(c.x-55,c.y+40);
    drawMataLog({x:c.x-60,y:c.y+105,w:120,a:.04});
  };
}
