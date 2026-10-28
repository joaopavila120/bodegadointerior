// Arte da batalha de Laguna. A arena mantém os mesmos ataques, aliados e pontos de interação.
'use strict';
const NAVAL_ART={},NAVAL_DECK={x:150,y:300,scale:.94},NAVAL_WATER_CACHE={tile:null,pattern:null};
const NAVAL_FILES={deck:'navio-deck-v2',props:'navio-props-v1',seival:'seival-v1',water:'laguna-water-v1'};
const navalArtReady=Promise.all(Object.entries(NAVAL_FILES).map(([id,file])=>new Promise(resolve=>{
  const im=NAVAL_ART[id]=new Image();MATA_ART['naval:'+id]=im;
  im.onload=()=>resolve(true);im.onerror=()=>resolve(false);
  im.src='assets/images/mata/laguna/'+file+'.png';
}))).then(results=>{if(navioDeck){navioDeck.width=navioDeck.height=0;navioDeck=null;}return results.every(Boolean);});
const NAVAL_PROP_RECTS=[
  [21,7,397,540],[442,8,306,539],[840,204,214,320],[1154,259,355,278],
  [59,652,279,328],[499,589,193,405],[839,544,318,464],[1236,634,262,328]
];
// Reviewed floor edge in the new source image. Rails, lanterns and hull are outside it.
const NAVAL_FLOOR_SOURCE=[[135,230],[230,135],[1550,145],[1740,185],[1915,310],[1942,358],[1780,510],[1550,584],[220,587],[110,540]];
const NAVAL_CANNONS=[[540,487],[835,482],[1290,480],[1530,483]];
let navalFloorPath=null,navalFloorCtx=null;
function navalFloorPoint(x,y){return {x:NAVAL_DECK.x+x*NAVAL_DECK.scale,y:NAVAL_DECK.y+y*NAVAL_DECK.scale};}
function navalHasDeck(){return !!(NAVAL_ART.deck?.naturalWidth&&NAVAL_ART.props?.naturalWidth);}
function navalProp(index,x,y,width,alpha=1){
  const r=NAVAL_PROP_RECTS[index],h=width*r[3]/r[2];
  ctx.save();ctx.globalAlpha*=alpha;
  const ok=mataArtRect('naval:props',r,x-width/2,y-h,width,h);
  ctx.restore();return ok;
}
function navalWater(view){
  const im=NAVAL_ART.water;if(!im?.naturalWidth)return false;
  if(!NAVAL_WATER_CACHE.tile){
    // Mirrored edges prevent square seams; the pattern is shared, never recreated every frame.
    const c=document.createElement('canvas');c.width=c.height=768;const g=c.getContext('2d');
    for(const [sx,sy] of [[1,1],[-1,1],[1,-1],[-1,-1]]){g.save();g.translate(sx<0?768:0,sy<0?768:0);g.scale(sx,sy);g.drawImage(im,0,0,384,384);g.restore();}
    NAVAL_WATER_CACHE.tile=c;NAVAL_WATER_CACHE.pattern=ctx.createPattern(c,'repeat');
  }
  ctx.save();ctx.fillStyle='#183c43';ctx.fillRect(view.x,view.y,view.w,view.h);
  ctx.globalAlpha=.55;ctx.fillStyle=NAVAL_WATER_CACHE.pattern;ctx.fillRect(view.x,view.y,view.w,view.h);ctx.restore();return true;
}
function navalSeaMotion(view){
  // Short, gentle glints; the water texture itself stays anchored to the map.
  ctx.save();ctx.fillStyle='#b2d2ca';
  for(let k=0;k<35;k++){
    const x=(k*431)%NAVIO.W,y=(k*277)%NAVIO.H;
    if(x<view.x-40||x>view.x+view.w+40||y<view.y||y>view.y+view.h)continue;
    ctx.globalAlpha=(.5+.5*Math.sin(frameClock*.75+k*2.3))*.16;
    ctx.fillRect(x+Math.sin(frameClock*.4+k)*5,y,8+k%4*5,1.5);
  }
  ctx.restore();
}
function navalDeckCanvas(){
  if(navioDeck)return navioDeck;
  const c=document.createElement('canvas');c.width=Math.ceil(NAVAL_ART.deck.naturalWidth*NAVAL_DECK.scale);c.height=Math.ceil(NAVAL_ART.deck.naturalHeight*NAVAL_DECK.scale);
  const main=ctx;ctx=c.getContext('2d');
  try{
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(NAVAL_ART.deck,0,0,c.width,c.height);
    ctx.translate(-NAVAL_DECK.x,-NAVAL_DECK.y);
    // The hatch shares exactly the gameplay's centre and footprint.
    const h=NAVIO.hatch,r=NAVAL_PROP_RECTS[3];
    mataArtRect('naval:props',r,h.x-h.w*.6,h.y-h.h*.62,h.w*1.2,h.h*1.24);
    // Thin damp patches add depth without hiding the attack telegraphs.
    for(const [x,y,w] of [[1030,750,85],[1700,700,72],[540,660,55]])ellipse(x,y,w,8,'rgba(35,60,60,.07)');
  }finally{ctx=main;}
  return navioDeck=c;
}
function navalMast(mx,my,alpha=1){
  const index=NAVIO.masts.findIndex(p=>p[0]===mx),frame=index===1?1:0,h=index===1?408:index===2?355:380;
  const r=NAVAL_PROP_RECTS[frame],w=h*r[2]/r[3];
  ellipse(mx,my+2,27,10,'rgba(20,13,8,.3)');
  ctx.save();ctx.translate(mx,my);ctx.rotate(Math.sin(frameClock*.9+mx)*.003);
  navalProp(frame,0,4,w,alpha);ctx.restore();
}
function navalDrawLadder(){navalProp(5,NAVIO.ladder.x,1027,86);}
function navalSeivalCrew(){
  const bob=Math.sin(frameClock*1.4)*2.4,x=NAVIO.ladder.x+40,y=1080+bob;
  drawSeival(x,y,500);
  drawGaribaldi(x-120,1013+bob,1,1);
  drawCampFolk('bento',x,1023+bob,1,-1,false,0,navioFx.bento>17.2);
  if(mataFolk('anita'))drawCampFolk('anita',x+110,1008+bob,1,1,false,0,!!navioFx.ball||navioFx.anita<1.2);
}
function navalBallPoint(ball){
  // Rendering starts at the new Seival cannon; the existing travel time and damage are unchanged.
  const x0=NAVIO.ladder.x+245,y0=1003,k=ball.k,t=ball.target;
  return {x:x0+(t.x-x0)*k,y:y0+(t.y-40-y0)*k-Math.sin(k*Math.PI)*220};
}
function navalFire(f){
  const k=Math.min(1,f.t/1.5);ellipse(f.x,f.y,f.r,f.r*.55,`rgba(60,20,8,${.35*k})`);
  for(let j=0;j<5;j++){const x=f.x+Math.sin(frameClock*8+j*1.7)*f.r*.5,y=f.y-8-j*9;ellipse(x,y,14-j*2,20-j*3,`rgba(255,${120+j*20},40,${.8*k})`);}
}
function navalLighting(view,won){
  mataNightVeil(view,.16);
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const [x,y] of [[260,420],[235,820],[2020,600]])glow(x,y-30,145,.14+.015*Math.sin(frameClock*4+x),'255,197,105');
  if(!won)glow(420,600,290,.07,'120,255,190');
  for(const f of navioFx.fires)glow(f.x,f.y-20,120,.25,'255,140,50');
  ctx.restore();
}
function navalMap(view,seen,layers){
  const st=lagunaState();lagunaWater(view);navalSeaMotion(view);
  ellipse(1100,927,850,36,'rgba(4,10,14,.3)');
  ctx.drawImage(navioDeckCanvas(),NAVAL_DECK.x,NAVAL_DECK.y);
  for(const [x,y] of NAVIO.barrels)if(seen(x,y,130))layers.push({y,draw:()=>navalProp(2,x,y+8,52)});
  for(const [x,y] of NAVAL_CANNONS)if(seen(x,y,160))layers.push({y,draw:()=>navalProp(4,x,y,78)});
  layers.push({y:620,draw:()=>navalProp(7,345,620,76)},{y:470,draw:()=>drawNavioFlag(278,470)});
  layers.push({y:1028,draw:navalDrawLadder},{y:1080,draw:navalSeivalCrew});
  const L=navioFx.lanceiro;
  if(L&&!st.won&&mataCombatOn())layers.push({y:L.y,draw:()=>drawCampFolk('lanceiro',L.x,L.y,1,L.dx,!!L.walkArt,L.dyArt||0,L.state==='charge'||L.strikeUntil>frameClock)});
  const warning=navioFx.lanes.length||['windup','cutwind'].includes(navioBoss()?.state);
  for(const [mx,my] of NAVIO.masts){
    const behind=Math.abs(worldOut.x-mx)<155&&worldOut.y<my+45&&worldOut.y>my-420;
    layers.push({y:my,draw:()=>drawNavioMast(mx,my,warning ? .18 : behind ? .27 : .95)});
  }
  for(const f of navioFx.fires)layers.push({y:f.y,draw:()=>navalFire(f)});
  if(mataCombatOn()&&!scene)drawMataNightLayers(layers,seen);
  if(navioFx.ball)layers.push({y:9e6,draw:()=>{const p=navalBallPoint(navioFx.ball);ellipse(p.x,p.y,9,9,'#161d20');ellipse(p.x-2,p.y-2,3,3,'#697b82');}});
  layers.push({y:8e9,draw:()=>navalLighting(view,st.won)});
}
{
  const inside=navioInside,solid=navioSolid,deck=navioDeckCanvas,mast=drawNavioMast,flag=drawNavioFlag,map=drawNavioMap,far=drawNavioFar,boat=drawSeival,water=lagunaWater;
  navioInside=function(x,y){
    if(!navalHasDeck())return inside(x,y);
    if(!navalFloorPath){navalFloorPath=new Path2D();NAVAL_FLOOR_SOURCE.forEach(([x,y],i)=>{const p=navalFloorPoint(x,y);if(i)navalFloorPath.lineTo(p.x,p.y);else navalFloorPath.moveTo(p.x,p.y);});navalFloorPath.closePath();navalFloorCtx=document.createElement('canvas').getContext('2d');}
    return navalFloorCtx.isPointInPath(navalFloorPath,x,y);
  };
  navioSolid=function(x,y){return solid(x,y)||(navalHasDeck()&&NAVAL_ART.props?.naturalWidth&&(NAVAL_CANNONS.some(([cx,cy])=>Math.abs(x-cx)<35&&y>cy-40&&y<cy+7)||Math.hypot((x-345)/1.4,y-612)<30));};
  navioDeckCanvas=function(){return navalHasDeck()?navalDeckCanvas():deck();};
  drawNavioMast=function(x,y,alpha=1){if(NAVAL_ART.props?.naturalWidth)navalMast(x,y,alpha);else mast(x,y,alpha);};
  drawNavioFlag=function(x,y){if(NAVAL_ART.props?.naturalWidth){const w=112;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(frameClock*1.1)*.005);const r=NAVAL_PROP_RECTS[6];mataArtRect('naval:props',r,-w*.06,-w*r[3]/r[2],w,w*r[3]/r[2]);ctx.restore();}else flag(x,y);};
  drawNavioMap=function(view,seen,layers){if(navalHasDeck()&&NAVAL_ART.props?.naturalWidth)navalMap(view,seen,layers);else map(view,seen,layers);};
  drawNavioFar=function(x,y){
    if(!navalHasDeck())return far(x,y);
    const s=.42,bob=Math.sin(frameClock*.9)*3;ctx.save();ctx.translate(x-1100*s,y-650*s+bob);ctx.scale(s,s);ctx.globalAlpha=.9;
    ctx.drawImage(navioDeckCanvas(),NAVAL_DECK.x,NAVAL_DECK.y);for(const [mx,my] of NAVIO.masts)drawNavioMast(mx,my,.9);drawNavioFlag(278,470);ctx.restore();
  };
  drawSeival=function(x,y,w=380,alpha=1){
    if(!NAVAL_ART.seival?.naturalWidth)return boat(x,y,w,alpha);
    const r=[49,90,2075,562],h=w*r[3]/r[2];ctx.save();ctx.globalAlpha*=alpha;mataArtRect('naval:seival',r,x-w/2,y-h,w,h);ctx.restore();
  };
  lagunaWater=function(view){if(!navalWater(view))water(view);};
  const release=mataReleaseCaches;
  mataReleaseCaches=function(){release();if(NAVAL_WATER_CACHE.tile)NAVAL_WATER_CACHE.tile.width=NAVAL_WATER_CACHE.tile.height=0;NAVAL_WATER_CACHE.tile=null;NAVAL_WATER_CACHE.pattern=null;};
}
